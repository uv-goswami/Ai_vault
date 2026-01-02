from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
# ✅ Import CouponUpdate
from schemas.coupons import CouponCreate, CouponOut, CouponUpdate
from uuid import UUID
from typing import List

router = APIRouter(prefix="/coupons", tags=["Coupons"])

# Create a new coupon
@router.post("/", response_model=CouponOut)
def create_coupon(data: CouponCreate, db: Session = Depends(get_db)):
    business = db.query(models.BusinessProfile).filter_by(business_id=data.business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    new_coupon = models.Coupon(**data.model_dump())
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return new_coupon

# Get a coupon by its UUID
@router.get("/{coupon_id}", response_model=CouponOut)
def get_coupon(coupon_id: UUID, db: Session = Depends(get_db)):
    coupon = db.query(models.Coupon).filter_by(coupon_id=coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return coupon

# List coupons for a business
@router.get("/", response_model=List[CouponOut])
def list_coupons(
    business_id: UUID = Query(...),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    return (
        db.query(models.Coupon)
        .filter_by(business_id=business_id)
        .order_by(models.Coupon.valid_until.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

# ✅ UPDATED: Use CouponUpdate schema
@router.patch("/{coupon_id}", response_model=CouponOut)
def update_coupon(coupon_id: UUID, data: CouponUpdate, db: Session = Depends(get_db)):
    coupon = db.query(models.Coupon).filter_by(coupon_id=coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    # exclude_unset=True ensures we only update fields sent by the frontend
    update_data = data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(coupon, key, value)

    db.commit()
    db.refresh(coupon)
    return coupon

# Delete coupon
@router.delete("/{coupon_id}", response_model=dict)
def delete_coupon(coupon_id: UUID, db: Session = Depends(get_db)):
    coupon = db.query(models.Coupon).filter_by(coupon_id=coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    db.delete(coupon)
    db.commit()
    return {"detail": "Coupon deleted"}