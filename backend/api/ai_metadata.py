# backend/api/ai_metadata.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.ai_metadata import AiMetadataCreate, AiMetadataOut
from uuid import UUID

router = APIRouter(prefix="/metadata", tags=["AI Metadata"])

@router.post("/", response_model=AiMetadataOut)
def create_metadata(data: AiMetadataCreate, db: Session = Depends(get_db)):
    new_metadata = models.AiMetadata(**data.dict())
    db.add(new_metadata)
    db.commit()
    db.refresh(new_metadata)
    return new_metadata


@router.get("/{metadata_id}", response_model=AiMetadataOut)
def get_metadata(metadata_id: UUID, db: Session = Depends(get_db)):
    metadata = db.query(models.AIMetadata).filter_by(ai_metadata_id=metadata_id).first()
    if not metadata:
        raise HTTPException(status_code=404, detail="Metadata not found")
    return metadata
