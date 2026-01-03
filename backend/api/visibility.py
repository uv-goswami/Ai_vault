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
# STANDARD CRUD (Keep unchanged)
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
# ✅ STRICT VISIBILITY CHECKER
# -------------------------
@router.post("/run", response_model=VisibilityCheckResultOut)
def run_visibility(business_id: UUID = Query(...), db: Session = Depends(get_db)):
    # 1. Fetch Data
    business = db.query(models.BusinessProfile).filter_by(business_id=business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    services = db.query(models.Service).filter_by(business_id=business_id).all()
    media_count = db.query(models.MediaAsset).filter_by(business_id=business_id).count()
    op_info = db.query(models.OperationalInfo).filter_by(business_id=business_id).first()
    jsonld_exists = db.query(models.JsonLDFeed).filter_by(business_id=business_id).count() > 0

    # 2. Log request
    check = models.VisibilityCheckRequest(
        business_id=business_id,
        check_type="visibility", 
        input_data=f"Services: {len(services)}, Media: {media_count}, JSON-LD: {jsonld_exists}",
        requested_at=datetime.utcnow()
    )
    db.add(check)
    db.commit()

    # 3. Construct HARSH Prompt
    services_str = ", ".join([s.name for s in services]) if services else "None"
    
    prompt = f"""
    Act as a Strict SEO Auditor. You are grading this business for visibility to AI Bots and Humans.
    BE HARSH. Do not give participation points.
    
    DATA:
    - Name: {business.name}
    - Description: {business.description or "Missing"}
    - Slogan: {business.quote_slogan or "Missing"}
    - Service Count: {len(services)} ({services_str})
    - Images: {media_count}
    - Hours Listed: {'Yes' if op_info else 'No'}
    - JSON-LD Schema: {'Yes' if jsonld_exists else 'NO'}

    SCORING RULES:
    - Start at 0.
    - JSON-LD Missing? MAX SCORE = 40. (Automatic Fail for Bots).
    - No Images? Deduct 20 points.
    - Description too short (<50 chars)? Deduct 15 points.
    - No Services? Deduct 20 points.
    - Max score 100 is only for PERFECT profiles.

    Return valid raw JSON (no markdown) with:
    1. "score": Number (0-100).
    2. "bot_analysis": String (Focus on JSON-LD).
    3. "human_analysis": String (Focus on trust/visuals).
    4. "issues": List of strings (The specific failures).
    5. "recommendations": List of strings (Actionable fixes).
    """

    try:
        # ✅ Using 'gemini-1.5-flash' (Most reliable for free tier)
        # If this fails, the 'except' block will handle it strictly now.
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        response = model.generate_content(prompt)
        
        # Robust Parsing
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        
        # If response is empty or broken, raise error to hit the fallback
        if not clean_text:
            raise ValueError("Empty AI response")

        ai_data = json.loads(clean_text)

        score = float(ai_data.get("score", 40)) # Default to 40 if AI forgets score
        bot_txt = ai_data.get("bot_analysis", "Unknown")
        human_txt = ai_data.get("human_analysis", "Unknown")
        issues_str = ensure_string(ai_data.get("issues", []))
        recs_str = ensure_string(ai_data.get("recommendations", []))
        
        full_recommendations = f"[BOTS]: {bot_txt} || [HUMANS]: {human_txt} || ACTIONS: {recs_str}"

        result = models.VisibilityCheckResult(
            request_id=check.request_id,
            business_id=business_id,
            visibility_score=score,
            issues_found=issues_str,
            recommendations=full_recommendations, 
            output_snapshot=clean_text[:500],
            completed_at=datetime.utcnow()
        )

        db.add(result)
        db.commit()
        db.refresh(result)
        return result

    except Exception as e:
        print(f"❌ AI VISIBILITY CHECK FAILED: {str(e)}")
        
        # ✅ STRICT FALLBACK SCORING
        # If AI fails, we grade manually but strictly.
        
        strict_score = 0
        issues = ["AI Service Unreachable"]
        recs = ["Retry audit later"]

        # Manual strict logic
        if jsonld_exists: 
            strict_score += 30
        else:
            issues.append("CRITICAL: Missing JSON-LD")
            recs.append("Generate JSON-LD immediately")

        if len(services) >= 3:
            strict_score += 20
        elif len(services) == 0:
            issues.append("No services listed")
            recs.append("Add at least 3 services")
        
        if media_count >= 3:
            strict_score += 20
        else:
            issues.append("Not enough images")
        
        if business.description and len(business.description) > 50:
            strict_score += 10
        else:
            issues.append("Description too short or missing")

        # Cap fallback score at 50 if AI failed
        final_score = min(strict_score, 50)

        result = models.VisibilityCheckResult(
            request_id=check.request_id,
            business_id=business_id,
            visibility_score=final_score,
            issues_found="; ".join(issues),
            recommendations="; ".join(recs),
            completed_at=datetime.utcnow()
        )
        db.add(result)
        db.commit()
        return result