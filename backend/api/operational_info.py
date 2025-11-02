from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.operational_info import OperationalInfoCreate, OperationalInfoOut
from uuid import UUID
from typing import List

router = APIRouter(prefix="/operational-info", tags=["Operational Info"])

@router.post("/", response_model=OperationalInfoOut)
def create_operational_info(data: OperationalInfoCreate, db: Session = Depends(get_db)):
    new_info = models.OperationalInfo(**data.model_dump())
    db.add(new_info)
    db.commit()
    db.refresh(new_info)
    return new_info

@router.get("/", response_model=List[OperationalInfoOut])
def list_operational_info(
    business_id: UUID = Query(...),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    info_list = (
        db.query(models.OperationalInfo)
        .filter_by(business_id=business_id)
        .order_by(models.OperationalInfo.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return info_list

@router.get("/{info_id}", response_model=OperationalInfoOut)
def get_operational_info(info_id: UUID, db: Session = Depends(get_db)):
    info = db.query(models.OperationalInfo).filter_by(info_id=info_id).first()
    if not info:
        raise HTTPException(status_code=404, detail="Operational info not found")
    return info
