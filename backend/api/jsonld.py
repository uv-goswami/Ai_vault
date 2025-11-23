from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.jsonld import JsonLDFeedOut
from uuid import UUID
from typing import List
from datetime import datetime
import json

router = APIRouter(prefix="/jsonld", tags=["JSON-LD"])

@router.post("/generate", response_model=JsonLDFeedOut)
def generate_jsonld(business_id: UUID = Query(...), db: Session = Depends(get_db)):
    # ✅ Ensure business exists
    business = db.query(models.BusinessProfile).filter_by(business_id=business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    services = db.query(models.Service).filter_by(business_id=business_id).all()
    coupons = db.query(models.Coupon).filter_by(business_id=business_id, is_active=True).all()
    media = db.query(models.MediaAsset).filter_by(business_id=business_id).all()
    info = db.query(models.OperationalInfo).filter_by(business_id=business_id).first()

    schema_type_map = {"restaurant": "Restaurant", "salon": "HairSalon", "clinic": "MedicalClinic"}
    schema_type = schema_type_map.get(business.business_type or "", "LocalBusiness")

    jsonld = {
        "@context": "https://schema.org",
        "@type": schema_type,
        "name": business.name,
        "description": business.description,
        "address": {"@type": "PostalAddress", "streetAddress": business.address},
        "geo": {"@type": "GeoCoordinates", "latitude": business.latitude, "longitude": business.longitude},
        "openingHours": f"Mo-Sa {info.opening_hours}-{info.closing_hours}" if info else None,
        "image": next((m.url for m in media if m.media_type == "image"), None),
        "url": f"https://aivault.com/business/{business_id}",
        "makesOffer": [
            {"@type": "Offer", "itemOffered": {"@type": "Service", "name": s.name}, "price": float(s.price)}
            for s in services
        ],
        "hasCoupon": [
            {"@type": "Offer", "discountCode": c.code, "validThrough": c.valid_until.isoformat()}
            for c in coupons
        ],
    }

    feed = models.JsonLDFeed(
        business_id=business_id,
        schema_type=schema_type,
        jsonld_data=json.dumps(jsonld),
        is_valid=True,
        validation_errors=None,
        generated_at=datetime.utcnow(),
    )
    db.add(feed)
    db.commit()
    db.refresh(feed)
    return feed

@router.get("/", response_model=List[JsonLDFeedOut])
def list_jsonld(business_id: UUID = Query(...), db: Session = Depends(get_db)):
    return (
        db.query(models.JsonLDFeed)
        .filter_by(business_id=business_id)
        .order_by(models.JsonLDFeed.generated_at.desc())
        .all()
    )

@router.get("/{feed_id}", response_model=JsonLDFeedOut)
def get_jsonld(feed_id: UUID, db: Session = Depends(get_db)):
    feed = db.query(models.JsonLDFeed).filter_by(feed_id=feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="JSON-LD feed not found")
    return feed
