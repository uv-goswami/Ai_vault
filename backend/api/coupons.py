from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.coupons import CouponCreate, CouponOut
from uuid import UUID
from typing import List

router = APIRouter(prefix="/coupons", tags=["Coupons"])

@router.post("/", response_model=CouponOut)
def create_coupon(data: CouponCreate, db: Session = Depends(get_db)):
    new_coupon = models.Coupon(**data.model_dump())
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

@router.get("/", response_model=List[CouponOut])
def list_coupons(
    business_id: UUID = Query(...),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    coupons = (
        db.query(models.Coupon)
        .filter_by(business_id=business_id)
        .order_by(models.Coupon.valid_until.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return coupons
