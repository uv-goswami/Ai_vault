import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from db.models import User
from schemas.users import UserCreate, UserOut
from api.security import get_password_hash 

router = APIRouter()

@router.post("/", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="User already exists")

    new_user = User(
        user_id=uuid.uuid4(),
        email=user.email,
        name=user.name,
        auth_provider=user.auth_provider,
        password_hash=get_password_hash(user.password_hash), # Security fix
        created_at=datetime.utcnow(),
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Auto-create business
    auto_business = models.BusinessProfile(
        owner_id=new_user.user_id,
        name=f"{(new_user.name or 'New')} Business",
        description="Auto-created on signup",
        published=True
    )
    db.add(auto_business)
    db.commit()

    return new_user

@router.get("/by-email/{email}", response_model=UserOut)
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user