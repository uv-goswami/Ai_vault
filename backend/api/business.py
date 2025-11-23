from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.business import BusinessCreate, BusinessOut, BusinessUpdate
from uuid import UUID
from typing import List
from datetime import datetime

router = APIRouter(prefix="/business", tags=["Business"])

# Create a new business
@router.post("/", response_model=BusinessOut)
def create_business(data: BusinessCreate, db: Session = Depends(get_db)):
    # Ensure owner exists
    owner = db.query(models.User).filter_by(user_id=data.owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")

    new_business = models.BusinessProfile(**data.model_dump())
    db.add(new_business)
    db.commit()
    db.refresh(new_business)
    return new_business

# List all businesses (paginated)
@router.get("/", response_model=List[BusinessOut])
def list_businesses(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    businesses = (
        db.query(models.BusinessProfile)
        .order_by(models.BusinessProfile.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return businesses

# Get a business by its UUID
@router.get("/{business_id}", response_model=BusinessOut)
def get_business(business_id: UUID, db: Session = Depends(get_db)):
    business = db.query(models.BusinessProfile).filter_by(business_id=business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business

# Get a business by owner_id (user_id)
@router.get("/by-owner/{owner_id}", response_model=BusinessOut)
def get_business_by_owner(owner_id: UUID, db: Session = Depends(get_db)):
    business = db.query(models.BusinessProfile).filter_by(owner_id=owner_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business

# Update a business (partial update)
@router.patch("/{business_id}", response_model=BusinessOut)
def update_business(business_id: UUID, payload: BusinessUpdate, db: Session = Depends(get_db)):
    business = db.query(models.BusinessProfile).filter_by(business_id=business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    # Update only provided fields
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(business, field, value)

    business.updated = datetime.utcnow()
    db.commit()
    db.refresh(business)
    return business
