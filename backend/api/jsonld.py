from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.jsonld import JsonLDFeedCreate, JsonLDFeedOut
from uuid import UUID
from datetime import datetime, timezone
from typing import List

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

@router.get("/", response_model=List[JsonLDFeedOut])
def list_jsonld_feeds(
    business_id: UUID,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    feeds = (
        db.query(models.JsonLDFeed)
        .filter_by(business_id=business_id)
        .order_by(models.JsonLDFeed.generated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return feeds

@router.get("/ping", include_in_schema=False)
def ping():
    return {"status": "jsonld router active"}

@router.get("/{feed_id}", response_model=JsonLDFeedOut)
def get_jsonld_feed(feed_id: UUID, db: Session = Depends(get_db)):
    feed = db.query(models.JsonLDFeed).filter_by(feed_id=feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")
    return feed
