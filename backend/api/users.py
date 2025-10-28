from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User
from schemas.users import UserCreate, UserOut
import uuid
from datetime import datetime

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
        password_hash=user.password_hash,
        created_at=datetime.utcnow(),
        last_login=None,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
