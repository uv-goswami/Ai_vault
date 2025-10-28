from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

# -------------------------
# SERVICE SCHEMAS
# -------------------------
class ServiceCreate(BaseModel):
    business_id: UUID
    service_type: str
    name: str
    description: str | None = None
    price: float
    duration_minutes: int | None = None

class ServiceOut(BaseModel):
    service_id: UUID
    business_id: UUID
    service_type: str
    name: str
    description: str | None
    price: float
    duration_minutes: int | None
    created_at: datetime

    class Config:
        orm_mode = True


# -------------------------
# RESTAURANT SERVICE FIELDS
# -------------------------
class RestaurantServiceFieldsCreate(BaseModel):
    service_id: UUID
    cuisine_type: str
    dietary_tags: str | None = None
    portion_size: str | None = None
    is_vegan: bool = True

class RestaurantServiceFieldsOut(BaseModel):
    service_id: UUID
    cuisine_type: str
    dietary_tags: str | None
    portion_size: str | None
    is_vegan: bool

    class Config:
        orm_mode = True


# -------------------------
# SALON SERVICE FIELDS
# -------------------------
class SalonServiceFieldsCreate(BaseModel):
    service_id: UUID
    duration_minutes: int | None = None
    stylist_required: bool = False
    gender_specific: str = "male"

class SalonServiceFieldsOut(BaseModel):
    service_id: UUID
    duration_minutes: int | None
    stylist_required: bool
    gender_specific: str

    class Config:
        orm_mode = True
