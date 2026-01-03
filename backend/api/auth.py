from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User, BusinessProfile  # ✅ Import BusinessProfile
from schemas.auth import LoginRequest
from api.security import verify_password 

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    # 1. Verify User
    user = db.query(User).filter_by(email=data.email).first()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    # 2. ✅ OPTIMIZATION: Fetch Business ID internally (Zero network latency)
    business = db.query(BusinessProfile).filter_by(owner_id=user.user_id).first()
    business_id = str(business.business_id) if business else None

    # 3. Return everything in ONE response
    return {
        "user_id": str(user.user_id),
        "business_id": business_id,  # ✅ Sending this now!
        "status": "authenticated"
    }