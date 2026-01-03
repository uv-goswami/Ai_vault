from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List, Optional

# ✅ NEW: Imports needed for the Aggregated View
from .operational_info import OperationalInfoOut
from .media import MediaOut
from .services import ServiceOut
from .coupons import CouponOut

class BusinessCreate(BaseModel):
    owner_id: UUID
    name: str
    description: str | None = None
    business_type: str | None = None  # restaurant, salon, clinic
    phone: str | None = None
    website: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    timezone: str | None = None
    quote_slogan: str | None = None
    identification_mark: str | None = None
    published: bool = True

    model_config = {"from_attributes": True}

class BusinessOut(BaseModel):
    business_id: UUID
    owner_id: UUID
    name: str
    description: str | None
    business_type: str | None
    phone: str | None
    website: str | None
    address: str | None
    latitude: float | None
    longitude: float | None
    timezone: str | None
    quote_slogan: str | None
    identification_mark: str | None
    published: bool
    version: int
    created_at: datetime
    updated: datetime | None = None

    model_config = {"from_attributes": True}

class BusinessUpdate(BaseModel):
    # All fields optional for partial update
    name: str | None = None
    description: str | None = None
    business_type: str | None = None
    phone: str | None = None
    website: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    timezone: str | None = None
    quote_slogan: str | None = None
    identification_mark: str | None = None
    published: bool | None = None

# ✅ NEW: Aggregated Schema for Directory View (System Design Optimization)
class BusinessDirectoryView(BaseModel):
    business_id: UUID
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    business_type: Optional[str] = None
    quote_slogan: Optional[str] = None
    identification_mark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Nested Data
    operational_info: Optional[OperationalInfoOut] = None
    media: List[MediaOut] = []
    services: List[ServiceOut] = []
    coupons: List[CouponOut] = []

    model_config = {"from_attributes": True}