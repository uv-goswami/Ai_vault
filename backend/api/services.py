# backend/api/services.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from schemas.services import ServiceCreate, ServiceOut
from uuid import UUID

router = APIRouter(prefix="/services", tags=["Services"])

@router.post("/", response_model=ServiceOut)
def create_service(data: ServiceCreate, db: Session = Depends(get_db)):
    new_service = models.Service(**data.dict())
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service

@router.get("/{service_id}", response_model=ServiceOut)
def get_service(service_id: UUID, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter_by(service_id=service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service
