from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class BusinessCreate(BaseModel):
    owner_id: UUID
    name: str
    description: str | None = None
    business_type: str | None = None  # restaurant, salon, clinic
    phone: str | None = None
    website: str | None = None
    address: str | None = None
    latitude: float | None = None
    LONGITUDDE: float | None = None
    timezone: str | None = None
    quote_slogan: str | None = None
    identification_mark: str | None = None
    published: bool = True

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
    LONGITUDDE: float | None
    timezone: str | None
    quote_slogan: str | None
    identification_mark: str | None
    published: bool
    version: int
    created_at: datetime
    updated: datetime | None = None

    class Config:
        orm_mode = True
