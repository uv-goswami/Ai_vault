from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.jsonld import JsonLDFeedCreate, JsonLDFeedOut
from uuid import UUID
from datetime import datetime, timezone

print("✅ jsonld.py is executing")

router = APIRouter(prefix="/jsonld", tags=["JSON-LD"])

@router.post("/", response_model=JsonLDFeedOut)
def create_jsonld_feed(data: JsonLDFeedCreate, db: Session = Depends(get_db)):
    print("✅ /jsonld/ POST route is defined")
    new_feed = models.JsonLDFeed(
        business_id=data.business_id,
        schema_type=data.schema_type,
        jsonld_data=data.jsonld_data,
        is_valid=data.is_valid,
        validation_errors=data.validation_errors,
        generated_at=datetime.now(timezone.utc)
    )
    db.add(new_feed)
    db.commit()
    db.refresh(new_feed)
    return new_feed

@router.get("/{feed_id}", response_model=JsonLDFeedOut)
def get_jsonld_feed(feed_id: UUID, db: Session = Depends(get_db)):
    feed = db.query(models.JsonLDFeed).filter_by(feed_id=feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")
    return feed

@router.get("/ping")
def ping():
    return {"status": "jsonld router active"}
