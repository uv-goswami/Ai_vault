import os
import json
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.visibility import (
    VisibilityCheckRequestCreate,
    VisibilityCheckRequestOut,
    VisibilityCheckResultCreate,
    VisibilityCheckResultOut,
    VisibilitySuggestionCreate,
    VisibilitySuggestionOut
)
from uuid import UUID
from typing import List
from datetime import datetime

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter(prefix="/visibility", tags=["Visibility"])

# --- Helper to clean AI lists to strings ---
def ensure_string(value):
    if isinstance(value, list):
        return "; ".join(str(v) for v in value) 
    return str(value) if value is not None else ""

# -------------------------
# STANDARD CRUD
# -------------------------
@router.post("/check", response_model=VisibilityCheckRequestOut)
def create_check_request(data: VisibilityCheckRequestCreate, db: Session = Depends(get_db)):
    business = db.query(models.BusinessProfile).filter_by(business_id=data.business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    new_check = models.VisibilityCheckRequest(**data.model_dump())
    db.add(new_check)
    db.commit()
    db.refresh(new_check)
    return new_check

@router.get("/check", response_model=List[VisibilityCheckRequestOut])
def list_check_requests(
    business_id: UUID = Query(...),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    return (
        db.query(models.VisibilityCheckRequest)
        .filter_by(business_id=business_id)
        .order_by(models.VisibilityCheckRequest.requested_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

@router.get("/check/{check_id}", response_model=VisibilityCheckRequestOut)
def get_check_request(check_id: UUID, db: Session = Depends(get_db)):
    check = db.query(models.VisibilityCheckRequest).filter_by(request_id=check_id).first()
    if not check:
        raise HTTPException(status_code=404, detail="Check request not found")
    return check

@router.post("/result", response_model=VisibilityCheckResultOut)
def create_result(data: VisibilityCheckResultCreate, db: Session = Depends(get_db)):
    business = db.query(models.BusinessProfile).filter_by(business_id=data.business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    new_result = models.VisibilityCheckResult(**data.model_dump())
    db.add(new_result)
    db.commit()
    db.refresh(new_result)
    return new_result

@router.get("/result", response_model=List[VisibilityCheckResultOut])
def list_results(
    business_id: UUID = Query(...),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    return (
        db.query(models.VisibilityCheckResult)
        .filter_by(business_id=business_id)
        .order_by(models.VisibilityCheckResult.completed_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

@router.get("/result/{result_id}", response_model=VisibilityCheckResultOut)
def get_result(result_id: UUID, db: Session = Depends(get_db)):
    result = db.query(models.VisibilityCheckResult).filter_by(result_id=result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result

@router.post("/suggestion", response_model=VisibilitySuggestionOut)
def create_suggestion(data: VisibilitySuggestionCreate, db: Session = Depends(get_db)):
    business = db.query(models.BusinessProfile).filter_by(business_id=data.business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    new_suggestion = models.VisibilitySuggestion(**data.model_dump())
    db.add(new_suggestion)
    db.commit()
    db.refresh(new_suggestion)
    return new_suggestion

@router.get("/suggestion", response_model=List[VisibilitySuggestionOut])
def list_suggestions(
    business_id: UUID = Query(...),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    return (
        db.query(models.VisibilitySuggestion)
        .filter_by(business_id=business_id)
        .order_by(models.VisibilitySuggestion.suggested_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

@router.get("/suggestion/{suggestion_id}", response_model=VisibilitySuggestionOut)
def get_suggestion(suggestion_id: UUID, db: Session = Depends(get_db)):
    suggestion = db.query(models.VisibilitySuggestion).filter_by(suggestion_id=suggestion_id).first()
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    return suggestion

# -------------------------
# ✅ AI-POWERED RUN ENDPOINT
# -------------------------
@router.post("/run", response_model=VisibilityCheckResultOut)
def run_visibility(business_id: UUID = Query(...), db: Session = Depends(get_db)):
    # 1. Fetch ALL Data
    business = db.query(models.BusinessProfile).filter_by(business_id=business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    services = db.query(models.Service).filter_by(business_id=business_id).all()
    media_count = db.query(models.MediaAsset).filter_by(business_id=business_id).count()
    op_info = db.query(models.OperationalInfo).filter_by(business_id=business_id).first()
    
    # Check if JSON-LD exists (Crucial for Bot Visibility)
    jsonld_exists = db.query(models.JsonLDFeed).filter_by(business_id=business_id).count() > 0

    # 2. Log request
    check = models.VisibilityCheckRequest(
        business_id=business_id,
        check_type="visibility", # ✅ FIXED: Changed from "ai_audit" to "visibility"
        input_data=f"Services: {len(services)}, Media: {media_count}, JSON-LD: {jsonld_exists}",
        requested_at=datetime.utcnow()
    )
    db.add(check)
    db.commit()

    # 3. Construct AI Prompt
    services_str = ", ".join([s.name for s in services]) if services else "None"
    
    prompt = f"""
    Act as an AIO (Artificial Intelligence Optimization) and SEO Expert.
    Analyze this business profile to determine how visible it is to 1) AI Agents/Bots and 2) Humans.

    DATA:
    - Name: {business.name}
    - Description: {business.description or "Missing"}
    - Slogan: {business.quote_slogan or "Missing"}
    - Services Listed: {len(services)} ({services_str})
    - Media Assets: {media_count}
    - Operational Info (Hours/Wifi): {'Present' if op_info else 'Missing'}
    - JSON-LD Schema: {'Present (Good for Bots)' if jsonld_exists else 'MISSING (Critical Failure for Bots)'}

    Return a valid JSON object with:
    1. "score": A number 0-100 (Overall health).
    2. "bot_analysis": A short string summarizing if bots can read this (mention JSON-LD).
    3. "human_analysis": A short string summarizing human appeal (media, clarity).
    4. "issues": A list of specific strings describing what is missing.
    5. "recommendations": A list of specific strings on how to fix it.
    """

    try:
        # Using gemini-2.5-flash as per your preference (or switch to 1.5-flash if needed)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        # Clean response
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        ai_data = json.loads(clean_text)

        # Parse AI Data
        score = float(ai_data.get("score", 50))
        
        # Combine analyses for the text fields
        bot_txt = ai_data.get("bot_analysis", "")
        human_txt = ai_data.get("human_analysis", "")
        
        issues_list = ai_data.get("issues", [])
        recs_list = ai_data.get("recommendations", [])

        # Format for DB (String storage)
        issues_str = ensure_string(issues_list)
        
        # Prepend the Bot/Human analysis to recommendations so user sees it
        full_recommendations = f"[BOTS]: {bot_txt} || [HUMANS]: {human_txt} || ACTIONS: {ensure_string(recs_list)}"

        # 4. Save Result
        result = models.VisibilityCheckResult(
            request_id=check.request_id,
            business_id=business_id,
            visibility_score=score,
            issues_found=issues_str,
            recommendations=full_recommendations, 
            output_snapshot=clean_text[:500], # Store partial raw JSON for debug
            completed_at=datetime.utcnow()
        )

        db.add(result)
        db.commit()
        db.refresh(result)
        return result

    except Exception as e:
        print(f"AI Check Error: {e}")
        # Fallback to simple logic if AI fails
        fallback_score = 30.0
        if jsonld_exists: fallback_score += 30
        if len(services) > 0: fallback_score += 20
        
        result = models.VisibilityCheckResult(
            request_id=check.request_id,
            business_id=business_id,
            visibility_score=fallback_score,
            issues_found="AI Check Failed, switched to basic mode.",
            recommendations="Ensure JSON-LD and Services are present.",
            completed_at=datetime.utcnow()
        )
        db.add(result)
        db.commit()
        return result