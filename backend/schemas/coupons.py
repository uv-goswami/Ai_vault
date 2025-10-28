from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class CouponCreate(BaseModel):
    business_id: UUID
    code: str
    description: str | None = None
    discount_value: str
    valid_from: datetime
    valid_until: datetime
    terms_conditions: str | None = None
    is_active: bool = True

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
        orm_mode = True
