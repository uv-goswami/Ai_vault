# backend/api/coupons.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.coupons import CouponCreate, CouponOut
from uuid import UUID

router = APIRouter(prefix="/coupons", tags=["Coupons"])

@router.post("/", response_model=CouponOut)
def create_coupon(data: CouponCreate, db: Session = Depends(get_db)):
    new_coupon = models.Coupon(**data.dict())
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return new_coupon

@router.get("/{coupon_id}", response_model=CouponOut)
def get_coupon(coupon_id: UUID, db: Session = Depends(get_db)):
    coupon = db.query(models.Coupon).filter_by(coupon_id=coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return coupon
