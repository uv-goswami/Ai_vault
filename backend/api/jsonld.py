import json
from datetime import datetime
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from db import models
from db.database import get_db
from schemas.jsonld import JsonLDFeedOut

router = APIRouter(prefix="/jsonld", tags=["JSON-LD"])

@router.post("/generate", response_model=JsonLDFeedOut)
def generate_jsonld(business_id: UUID = Query(...), db: Session = Depends(get_db)):
    # 1. Fetch Main Business Profile
    business = db.query(models.BusinessProfile).filter_by(business_id=business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    # 2. Fetch Supporting Data
    services = db.query(models.Service).filter_by(business_id=business_id).all()
    coupons = db.query(models.Coupon).filter_by(business_id=business_id, is_active=True).all()
    media = db.query(models.MediaAsset).filter_by(business_id=business_id).all()
    info = db.query(models.OperationalInfo).filter_by(business_id=business_id).first()
    
    # 3. ✅ FETCH AI METADATA (The Hybrid Integration)
    ai_meta = db.query(models.AiMetadata).filter_by(business_id=business_id).first()

    # 4. Map Business Type to Schema.org Types
    schema_type_map = {
        "restaurant": "Restaurant",
        "salon": "HairSalon",
        "clinic": "MedicalClinic",
        "bakery": "Bakery",
        "gym": "ExerciseGym",
        "cafe": "Cafe"
    }
    # Default to 'LocalBusiness' if type is unknown
    schema_type = schema_type_map.get((business.business_type or "").lower(), "LocalBusiness")

    # 5. Construct the Hybrid Description
    # We combine the official description with the AI marketing hook
    final_description = business.description or ""
    if ai_meta and ai_meta.extracted_insights:
        final_description += f" - {ai_meta.extracted_insights}"

    # 6. Build the JSON-LD Dictionary
    jsonld = {
        "@context": "https://schema.org",
        "@type": schema_type,
        "name": business.name,
        "description": final_description,
        "keywords": ai_meta.keywords if ai_meta else "",  # Inject AI Keywords
        "url": f"https://aivault.com/business/{business_id}",
        "telephone": business.phone,
        "address": {
            "@type": "PostalAddress", 
            "streetAddress": business.address or "Not listed",
            "addressCountry": "IN" # Assuming India based on context
        },
        "geo": {
            "@type": "GeoCoordinates", 
            "latitude": business.latitude, 
            "longitude": business.longitude
        } if business.latitude and business.longitude else None,
        
        "priceRange": "$$" # Required for many local business types
    }

    # Add Image (First image found)
    image_url = next((m.url for m in media if m.media_type == "image"), None)
    if image_url:
        jsonld["image"] = image_url

    # Add Opening Hours
    if info:
        # Format: Mo-Su 09:00-18:00
        days = "Mo-Su" 
        if info.off_days:
            # This is a simplification. For perfect Schema, you'd map off_days dynamically.
            # For now, Mo-Su is a safe fallback if combined with specific hours.
            pass 
        jsonld["openingHours"] = f"{days} {info.opening_hours}-{info.closing_hours}"

    # Add Services (Offers)
    if services:
        jsonld["makesOffer"] = [
            {
                "@type": "Offer", 
                "itemOffered": {
                    "@type": "Service", 
                    "name": s.name,
                    "description": s.description
                }, 
                "price": str(s.price),
                "priceCurrency": "INR"
            }
            for s in services
        ]

    # Add Coupons
    if coupons:
        jsonld["hasCoupon"] = [
            {
                "@type": "Offer", 
                "discountCode": c.code, 
                "description": c.description,
                "validThrough": c.valid_until.isoformat() if c.valid_until else None
            }
            for c in coupons
        ]

    # Clean up None values to keep JSON tidy
    jsonld = {k: v for k, v in jsonld.items() if v is not None}

    # 7. Save to Database
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

@router.delete("/{feed_id}")
def delete_jsonld(feed_id: UUID, db: Session = Depends(get_db)):
    feed = db.query(models.JsonLDFeed).filter_by(feed_id=feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="JSON-LD feed not found")
    
    db.delete(feed)
    db.commit()
    return {"message": "Feed deleted successfully"}