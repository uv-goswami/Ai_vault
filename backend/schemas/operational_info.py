from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class OperationalInfoCreate(BaseModel):
    business_id: UUID
    opening_hours: str
    closing_hours: str
    off_days: str | None = None
    delivery_options: str | None = None
    reservation_options: str | None = None
    wifi_available: bool = False
    accessibility_features: str | None = None
    neaby_parking_spot: str | None = None

class OperationalInfoOut(BaseModel):
    info_id: UUID
    business_id: UUID
    opening_hours: str
    closing_hours: str
    off_days: str | None
    delivery_options: str | None
    reservation_options: str | None
    wifi_available: bool
    accessibility_features: str | None
    nearby_parking_spot: str | None
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        orm_mode = True
