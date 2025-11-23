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

router = APIRouter(prefix="/visibility", tags=["Visibility"])

# -------------------------
# CHECK REQUEST
# -------------------------
@router.post("/check", response_model=VisibilityCheckRequestOut)
def create_check_request(data: VisibilityCheckRequestCreate, db: Session = Depends(get_db)):
    # ✅ Ensure business exists
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

# -------------------------
# RESULT
# -------------------------
@router.post("/result", response_model=VisibilityCheckResultOut)
def create_result(data: VisibilityCheckResultCreate, db: Session = Depends(get_db)):
    # ✅ Ensure business exists
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

# -------------------------
# SUGGESTION
# -------------------------
@router.post("/suggestion", response_model=VisibilitySuggestionOut)
def create_suggestion(data: VisibilitySuggestionCreate, db: Session = Depends(get_db)):
    # ✅ Ensure business exists
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
# NEW: Run pipeline
# -------------------------
@router.post("/run", response_model=VisibilityCheckResultOut)
def run_visibility(business_id: UUID = Query(...), db: Session = Depends(get_db)):
    business = db.query(models.BusinessProfile).filter_by(business_id=business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    # Create check request
    check = models.VisibilityCheckRequest(
        business_id=business_id,
        check_type="visibility",
        input_data=None,
        requested_at=datetime.utcnow()
    )
    db.add(check)
    db.commit()
    db.refresh(check)

    # Simple scoring heuristic
    score = 50.0
    issues = []
    recommendations = []

    if not business.description:
        issues.append("Missing description")
        recommendations.append("Add a clear description")

    services_count = db.query(models.Service).filter_by(business_id=business_id).count()
    if services_count == 0:
        issues.append("No services listed")
        recommendations.append("Add services")

    media_count = db.query(models.MediaAsset).filter_by(business_id=business_id).count()
    if media_count == 0:
        issues.append("No media uploaded")
        recommendations.append("Upload images/videos")

    if business.website:
        score += 10
    if services_count >= 3:
        score += 20
    if media_count >= 3:
        score += 20
    score = min(score, 100.0)

    result = models.VisibilityCheckResult(
        request_id=check.request_id,
        business_id=business_id,
        visibility_score=score,
        issues_found=", ".join(issues) if issues else None,
        recommendations=", ".join(recommendations) if recommendations else None,
        output_snapshot=None,
        completed_at=datetime.utcnow()
    )

    db.add(result)
    db.commit()
    db.refresh(result)
    return result
