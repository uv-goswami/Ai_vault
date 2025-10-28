# backend/api/media.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.media import MediaCreate, MediaOut
from uuid import UUID

router = APIRouter(prefix="/media", tags=["Media"])

@router.post("/", response_model=MediaOut)
def upload_media(data: MediaCreate, db: Session = Depends(get_db)):
    new_media = models.MediaAsset(**data.dict())
    db.add(new_media)
    db.commit()
    db.refresh(new_media)
    return new_media

@router.get("/{media_id}", response_model=MediaOut)
def get_media(media_id: UUID, db: Session = Depends(get_db)):
    media = db.query(models.MediaAsset).filter_by(asset_id=media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    return media
