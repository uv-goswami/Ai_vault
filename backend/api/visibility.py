import os
import json
import requests
from bs4 import BeautifulSoup
from pydantic import BaseModel, HttpUrl
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
# STANDARD CRUD (Internal Use)
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
# ✅ STRICT VISIBILITY CHECKER (INTERNAL)
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

    # 3. Construct Prompt
    s_names = [s.name for s in services if s.name]
    services_str = ", ".join(s_names) if s_names else "None"
    
    prompt = f"""
    Act as a Strict SEO Auditor. Grade this business for visibility to AI Agents and Humans.
    BE HARSH.
    
    DATA:
    - Name: {business.name}
    - Description: {business.description or "Missing"}
    - Slogan: {business.quote_slogan or "Missing"}
    - Service Count: {len(services)} ({services_str})
    - Images: {media_count}
    - Hours Listed: {'Yes' if op_info else 'No'}
    - JSON-LD Schema: {'Yes' if jsonld_exists else 'NO'}

    SCORING RULES:
    - Base Score = 0.
    - JSON-LD Missing? Max possible score is 40.
    - No Services? Deduct 20.
    - No Images? Deduct 20.
    - Description < 50 chars? Deduct 15.
    - Perfect Profile = 100.

    Return valid raw JSON (no markdown) with keys:
    1. "score": Number (0-100).
    2. "bot_analysis": String (Bot readability).
    3. "human_analysis": String (Human appeal).
    4. "issues": List[String] (Failures).
    5. "recommendations": List[String] (Fixes).
    """

    try:
        # ✅ Using Gemini 2.5 Flash as requested
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        response = model.generate_content(prompt)
        
        # Robust Parsing
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        
        if not clean_text:
            raise ValueError("Empty AI response received")

        ai_data = json.loads(clean_text)

        score = float(ai_data.get("score", 0))
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
        
        # ✅ Transparent Fallback
        error_msg = str(e)
        strict_score = 0
        issues = [f"AI Error: {error_msg}"]
        recs = ["Check API Quota", "Verify Data"]

        if not jsonld_exists:
            issues.append("CRITICAL: Missing JSON-LD")
            recs.append("Generate JSON-LD immediately")
        else:
            strict_score += 30

        if len(services) == 0:
            issues.append("No services listed")
        else:
            strict_score += 20
        
        if media_count < 3:
            issues.append("Not enough images (Need 3+)")
        else:
            strict_score += 20
        
        if not business.description or len(business.description) < 50:
            issues.append("Description too short or missing")
        else:
            strict_score += 10

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


# -------------------------
# ✅ NEW: EXTERNAL (PUBLIC) AUDIT
# -------------------------
class ExternalAuditRequest(BaseModel):
    url: HttpUrl

@router.post("/external")
def audit_external_site(data: ExternalAuditRequest):
    # 1. Scrape the website (Basic)
    try:
        headers = {'User-Agent': 'AiVault-Auditor/1.0'}
        response = requests.get(str(data.url), headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract Key Data
        title = soup.title.string if soup.title else "Missing Title"
        desc_tag = soup.find("meta", attrs={"name": "description"})
        description = desc_tag["content"] if desc_tag else "Missing Description"
        
        h1_count = len(soup.find_all('h1'))
        img_count = len(soup.find_all('img'))
        json_ld = soup.find('script', type='application/ld+json')
        
        raw_text = soup.get_text(separator=' ', strip=True)[:3000] 

    except Exception as e:
        return {
            "error": f"Could not scan website: {str(e)}",
            "score": 0,
            "bot_analysis": "Site Unreachable",
            "human_analysis": "Site Unreachable",
            "recommendations": ["Check if URL is correct", "Ensure site is public"]
        }

    # 2. Ask Gemini
    prompt = f"""
    Act as an SEO & AI Visibility Auditor. Analyze this raw website data:
    
    URL: {data.url}
    Title: {title}
    Description: {description}
    H1 Tags: {h1_count}
    Images: {img_count}
    JSON-LD Schema Found: {'Yes' if json_ld else 'NO'}
    Sample Content: {raw_text[:500]}...

    Grading Criteria:
    - JSON-LD missing? Max score 50.
    - No H1? Deduct 10.
    - Description missing? Deduct 20.

    Return JSON:
    {{
        "score": 0-100,
        "bot_analysis": "Can bots understand this?",
        "human_analysis": "Is it clear for humans?",
        "recommendations": ["Action 1", "Action 2"]
    }}
    """

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        response = model.generate_content(prompt)
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        result = json.loads(clean_text)
        return result
    except Exception as e:
        return {"error": "AI Analysis Failed", "details": str(e)}