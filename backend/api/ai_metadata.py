from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.ai_metadata import AiMetadataCreate, AiMetadataOut
from uuid import UUID
from typing import List
from datetime import datetime

router = APIRouter(prefix="/ai-metadata", tags=["AI Metadata"])

@router.post("/", response_model=AiMetadataOut)
def create_metadata(data: AiMetadataCreate, db: Session = Depends(get_db)):
    # ✅ Ensure business exists
    business = db.query(models.BusinessProfile).filter_by(business_id=data.business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    new_metadata = models.AiMetadata(**data.model_dump())
    db.add(new_metadata)
    db.commit()
    db.refresh(new_metadata)
    return new_metadata

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

@router.get("/{metadata_id}", response_model=AiMetadataOut)
def get_metadata(metadata_id: UUID, db: Session = Depends(get_db)):
    metadata = db.query(models.AiMetadata).filter_by(ai_metadata_id=metadata_id).first()
    if not metadata:
        raise HTTPException(status_code=404, detail="Metadata not found")
    return metadata

# -------------------------
# NEW: Generator endpoint
# -------------------------
@router.post("/generate", response_model=AiMetadataOut)
def generate_metadata(business_id: UUID = Query(...), db: Session = Depends(get_db)):
    business = db.query(models.BusinessProfile).filter_by(business_id=business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    description = (business.description or "").lower()
    extracted_insights = "premium service" if "premium" in description else "standard service"
    detected_entities = business.business_type or "LocalBusiness"
    keywords = ", ".join((business.name or "").split() + (business.description or "").split())
    intent_labels = "discovery"

    new_metadata = models.AiMetadata(
        business_id=business_id,
        extracted_insights=extracted_insights,
        detected_entities=detected_entities,
        keywords=keywords,
        intent_labels=intent_labels,
        generated_at=datetime.utcnow(),
    )
    db.add(new_metadata)
    db.commit()
    db.refresh(new_metadata)
    return new_metadata
