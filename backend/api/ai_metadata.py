import os
import json
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.ai_metadata import AiMetadataCreate, AiMetadataOut
from uuid import UUID
from typing import List
from datetime import datetime

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter(prefix="/ai-metadata", tags=["AI Metadata"])

# --- Helper to clean lists ---
def ensure_string(value):
    """Converts lists/arrays to a clean comma-separated string."""
    if isinstance(value, list):
        return ", ".join(str(v) for v in value)
    return str(value) if value is not None else ""

# --- CREATE (Manual) ---
@router.post("/", response_model=AiMetadataOut)
def create_metadata(data: AiMetadataCreate, db: Session = Depends(get_db)):
    business = db.query(models.BusinessProfile).filter_by(business_id=data.business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    new_metadata = models.AiMetadata(**data.model_dump())
    db.add(new_metadata)
    db.commit()
    db.refresh(new_metadata)
    return new_metadata

# --- LIST ---
@router.get("/", response_model=List[AiMetadataOut])
def list_metadata(
    business_id: UUID = Query(...),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    return (
        db.query(models.AiMetadata)
        .filter_by(business_id=business_id)
        .order_by(models.AiMetadata.generated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

# --- GET ONE ---
@router.get("/{metadata_id}", response_model=AiMetadataOut)
def get_metadata(metadata_id: UUID, db: Session = Depends(get_db)):
    metadata = db.query(models.AiMetadata).filter_by(ai_metadata_id=metadata_id).first()
    if not metadata:
        raise HTTPException(status_code=404, detail="Metadata not found")
    return metadata

# --- DELETE ---
@router.delete("/{metadata_id}")
def delete_metadata(metadata_id: UUID, db: Session = Depends(get_db)):
    metadata = db.query(models.AiMetadata).filter_by(ai_metadata_id=metadata_id).first()
    if not metadata:
        raise HTTPException(status_code=404, detail="Metadata not found")
    
    db.delete(metadata)
    db.commit()
    return {"message": "Metadata deleted successfully"}

# --- GENERATE (The Smart Version) ---
@router.post("/generate", response_model=AiMetadataOut)
def generate_metadata(business_id: UUID = Query(...), db: Session = Depends(get_db)):
    # 1. Fetch Main Business Profile
    business = db.query(models.BusinessProfile).filter_by(business_id=business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    # 2. Fetch Related Data (Services, Hours) safely
    services_list = []
    try:
        services_q = db.query(models.Service).filter_by(business_id=business_id).all()
        services_list = [f"{s.name} (${s.price})" for s in services_q]
    except Exception:
        pass 

    op_info_str = "Not listed"
    try:
        op_info = db.query(models.OperationalInfo).filter_by(business_id=business_id).first()
        if op_info:
            op_info_str = f"Open: {op_info.opening_hours} - {op_info.closing_hours}, Off: {op_info.off_days}"
    except Exception:
        pass

    # 3. Construct a RICH Context Prompt
    context_text = f"""
    Business Name: {business.name}
    Type: {business.business_type}
    Description: {business.description or 'No description provided.'}
    Slogan: {business.quote_slogan or 'None'}
    
    Contact & Location:
    - Address: {business.address or 'Online'} ({business.latitude}, {business.longitude})
    - Phone: {business.phone or 'N/A'}
    - Website: {business.website or 'N/A'}
    
    Offerings:
    - Services: {", ".join(services_list) if services_list else "General services"}
    - Operational Info: {op_info_str}
    """

    prompt = f"""
    Act as a Senior SEO Specialist. 
    Analyze this local business and generate optimized metadata.

    {context_text}

    Return ONLY a valid JSON object with these 4 keys. 
    IMPORTANT: The values for 'keywords', 'intent_labels', and 'detected_entities' MUST be simple comma-separated STRINGS, not arrays.

    1. "keywords": A single string of 15 comma-separated specific keywords (combine location + service + slogan).
    2. "extracted_insights": A compelling 1-sentence marketing pitch.
    3. "intent_labels": A single string of 3 user intents (e.g., "Booking, Inquiry, Discovery").
    4. "detected_entities": A single string listing important entities (City, Services, Brands).
    """

    try:
        model = genai.GenerativeModel('gemini-2.5-flash') 
        
        response = model.generate_content(prompt)
        
        # Clean response
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        ai_data = json.loads(clean_text)

        # ✅ FIX: Force conversion of Lists to clean comma-separated Strings
        keywords_str = ensure_string(ai_data.get("keywords"))
        insights_str = ensure_string(ai_data.get("extracted_insights"))
        intents_str = ensure_string(ai_data.get("intent_labels"))
        entities_str = ensure_string(ai_data.get("detected_entities"))

        # Save to DB (Update if exists)
        existing_meta = db.query(models.AiMetadata).filter(models.AiMetadata.business_id == business_id).first()
        
        if existing_meta:
            existing_meta.keywords = keywords_str
            existing_meta.extracted_insights = insights_str
            existing_meta.intent_labels = intents_str
            existing_meta.detected_entities = entities_str
            existing_meta.generated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_meta)
            return existing_meta
        else:
            new_meta = models.AiMetadata(
                business_id=business_id,
                keywords=keywords_str,
                extracted_insights=insights_str,
                intent_labels=intents_str,
                detected_entities=entities_str,
                generated_at=datetime.utcnow(),
            )
            db.add(new_meta)
            db.commit()
            db.refresh(new_meta)
            return new_meta

    except Exception as e:
        print(f"AI Generation Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")