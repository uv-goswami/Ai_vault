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

# --- CREATE ---
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

# --- DELETE (Fixes your 405 error) ---
@router.delete("/{metadata_id}")
def delete_metadata(metadata_id: UUID, db: Session = Depends(get_db)):
    metadata = db.query(models.AiMetadata).filter_by(ai_metadata_id=metadata_id).first()
    if not metadata:
        raise HTTPException(status_code=404, detail="Metadata not found")
    
    db.delete(metadata)
    db.commit()
    return {"message": "Metadata deleted successfully"}

# --- GENERATE (Fixes your 429/404 error) ---
@router.post("/generate", response_model=AiMetadataOut)
def generate_metadata(business_id: UUID = Query(...), db: Session = Depends(get_db)):
    business = db.query(models.BusinessProfile).filter_by(business_id=business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    prompt = f"""
    Act as an SEO Expert. Analyze this local business and generate metadata.
    
    Business Name: {business.name}
    Type: {business.business_type}
    Description: {business.description}
    Address: {business.address}

    Return a valid JSON object (NO markdown, just raw JSON) with these 4 keys:
    1. "keywords": A string of 10 comma-separated high-value SEO keywords.
    2. "extracted_insights": A 1-sentence marketing hook about what makes this business unique.
    3. "intent_labels": A string of 3 user intents (e.g., "Transactional, Navigational, Discovery").
    4. "detected_entities": A string listing key entities (Locations, Products, Services) found in the text.
    """

    try:
        # ✅ FIX: Use 'gemini-1.5-flash'
        # This is the standard free model. Do NOT use 'lite' or '2.0' as they hit limits instantly.
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        response = model.generate_content(prompt)
        
        # Clean response
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        ai_data = json.loads(clean_text)

        # Save to DB (Update if exists)
        existing_meta = db.query(models.AiMetadata).filter(models.AiMetadata.business_id == business_id).first()
        
        if existing_meta:
            existing_meta.keywords = ai_data.get("keywords")
            existing_meta.extracted_insights = ai_data.get("extracted_insights")
            existing_meta.intent_labels = ai_data.get("intent_labels")
            existing_meta.detected_entities = ai_data.get("detected_entities")
            existing_meta.generated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_meta)
            return existing_meta
        else:
            new_meta = models.AiMetadata(
                business_id=business_id,
                keywords=ai_data.get("keywords"),
                extracted_insights=ai_data.get("extracted_insights"),
                intent_labels=ai_data.get("intent_labels"),
                detected_entities=ai_data.get("detected_entities"),
                generated_at=datetime.utcnow(),
            )
            db.add(new_meta)
            db.commit()
            db.refresh(new_meta)
            return new_meta

    except Exception as e:
        print(f"AI Generation Error: {e}")
        # If we still hit a rate limit, show the specific message
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")