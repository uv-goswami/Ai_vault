from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.business import BusinessCreate, BusinessOut
from uuid import UUID

router = APIRouter(prefix="/business", tags=["Business"])

@router.post("/", response_model=BusinessOut)
def create_business(data: BusinessCreate, db: Session = Depends(get_db)):
    new_business = models.BusinessProfile(**data.dict())
    db.add(new_business)
    db.commit()
    db.refresh(new_business)
    return new_business


@router.get("/{business_id}", response_model=BusinessOut)
def get_business(business_id: UUID , db: Session = Depends(get_db)):
    business = db.query(models.BusinessProfile).filter_by(business_id=business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business