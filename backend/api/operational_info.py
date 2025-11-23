from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.operational_info import OperationalInfoCreate, OperationalInfoOut
from uuid import UUID

router = APIRouter(tags=["Operational Info"])

# ✅ Create operational info (one per business)
@router.post("/", response_model=OperationalInfoOut)
def create_operational_info(data: OperationalInfoCreate, db: Session = Depends(get_db)):
    business = db.query(models.BusinessProfile).filter_by(business_id=data.business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    # prevent duplicate record for same business
    existing = db.query(models.OperationalInfo).filter_by(business_id=data.business_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Operational info already exists for this business")

    new_info = models.OperationalInfo(**data.model_dump())
    db.add(new_info)
    db.commit()
    db.refresh(new_info)
    return new_info

# ✅ Get by business_id
@router.get("/by-business/{business_id}", response_model=OperationalInfoOut)
def get_operational_info_by_business(business_id: UUID, db: Session = Depends(get_db)):
    info = db.query(models.OperationalInfo).filter_by(business_id=business_id).first()
    if not info:
        raise HTTPException(status_code=404, detail="Operational info not found")
    return info

# ✅ Update by business_id
@router.patch("/by-business/{business_id}", response_model=OperationalInfoOut)
def update_operational_info_by_business(business_id: UUID, data: OperationalInfoCreate, db: Session = Depends(get_db)):
    info = db.query(models.OperationalInfo).filter_by(business_id=business_id).first()
    if not info:
        raise HTTPException(status_code=404, detail="Operational info not found")

    for key, value in data.model_dump().items():
        setattr(info, key, value)

    db.commit()
    db.refresh(info)
    return info

# ✅ Delete by business_id (optional)
@router.delete("/by-business/{business_id}", response_model=dict)
def delete_operational_info_by_business(business_id: UUID, db: Session = Depends(get_db)):
    info = db.query(models.OperationalInfo).filter_by(business_id=business_id).first()
    if not info:
        raise HTTPException(status_code=404, detail="Operational info not found")

    db.delete(info)
    db.commit()
    return {"detail": "Operational info deleted"}
