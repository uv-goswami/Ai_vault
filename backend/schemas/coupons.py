from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class CouponCreate(BaseModel):
    business_id: UUID
    code: str
    description: str | None = None
    discount_value: str
    valid_from: datetime
    valid_until: datetime
    terms_conditions: str | None = None
    is_active: bool = True

# ✅ NEW: Add this class specifically for updates
# All fields are Optional, so you don't get 422 errors if data is missing
class CouponUpdate(BaseModel):
    business_id: Optional[UUID] = None
    code: Optional[str] = None
    description: Optional[str] = None
    discount_value: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    terms_conditions: Optional[str] = None
    is_active: Optional[bool] = None

class CouponOut(BaseModel):
    coupon_id: UUID
    business_id: UUID
    code: str
    description: str | None
    discount_value: str
    valid_from: datetime
    valid_until: datetime
    terms_conditions: str | None
    is_active: bool

    class Config:
        from_attributes = True  # Use 'orm_mode = True' if using Pydantic v1