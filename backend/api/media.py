from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.media import MediaOut
from uuid import UUID, uuid4
from typing import List
import os
from datetime import datetime

router = APIRouter(prefix="/media", tags=["Media"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed extensions by type
ALLOWED_EXTENSIONS = {
    "image": [".jpg", ".jpeg", ".png", ".gif"],
    "video": [".mp4", ".mov", ".avi", ".mkv"],
    "document": [".pdf", ".doc", ".docx", ".txt"]
}

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB in bytes

def validate_file(media_type: str, filename: str, file_size: int):
    ext = os.path.splitext(filename)[1].lower()
    if media_type not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid media type")
    if ext not in ALLOWED_EXTENSIONS[media_type]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension '{ext}' for {media_type}. Allowed: {ALLOWED_EXTENSIONS[media_type]}"
        )
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max allowed size is {MAX_FILE_SIZE // (1024*1024)} MB"
        )

@router.post("/upload", response_model=MediaOut)
def upload_media_file(
    business_id: UUID = Form(...),
    media_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    business = db.query(models.BusinessProfile).filter_by(business_id=business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    # ✅ Read file into memory to check size
    file_bytes = file.file.read()
    file_size = len(file_bytes)

    # Validate type and size
    validate_file(media_type, file.filename, file_size)

    # Generate unique filename
    filename = f"{uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Store public URL
    new_media = models.MediaAsset(
        business_id=business_id,
        media_type=media_type,
        url=f"/uploads/{filename}",
        alt_text=None,
        uploaded_at=datetime.utcnow()
    )
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
    return (
        db.query(models.MediaAsset)
        .filter_by(business_id=business_id)
        .order_by(models.MediaAsset.uploaded_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

@router.delete("/{media_id}", response_model=dict)
def delete_media(media_id: UUID, db: Session = Depends(get_db)):
    media = db.query(models.MediaAsset).filter_by(asset_id=media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    db.delete(media)
    db.commit()
    return {"detail": "Media deleted"}
