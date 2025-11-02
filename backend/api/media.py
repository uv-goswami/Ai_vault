from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.media import MediaCreate, MediaOut
from uuid import UUID
from typing import List

router = APIRouter(prefix="/media", tags=["Media"])

@router.post("/", response_model=MediaOut)
def upload_media(data: MediaCreate, db: Session = Depends(get_db)):
    new_media = models.MediaAsset(**data.model_dump())
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

@router.get("/", response_model=List[MediaOut])
def list_media(
    business_id: UUID = Query(...),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    media_assets = (
        db.query(models.MediaAsset)
        .filter_by(business_id=business_id)
        .order_by(models.MediaAsset.uploaded_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return media_assets
