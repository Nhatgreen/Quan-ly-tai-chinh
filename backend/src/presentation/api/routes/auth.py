from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from src.infrastructure.database import get_db, User
from src.infrastructure.auth import hash_password, verify_password, create_access_token

router = APIRouter()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    username: str = None  # Optional
    full_name: str = None  # Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email exists
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email đã tồn tại")
    
    # Generate username from email if not provided
    username = req.username if req.username else req.email.split('@')[0]
    
    # Check if username exists
    existing_username = db.query(User).filter(User.username == username).first()
    if existing_username:
        # Add random number to username
        import random
        username = f"{username}{random.randint(1000, 9999)}"
    
    # Create user
    new_user = User(
        email=req.email,
        username=username,
        password=hash_password(req.password),
        full_name=req.full_name if req.full_name else username
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "Đăng ký thành công",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "username": new_user.username,
            "full_name": new_user.full_name
        }
    }

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")
    
    # Verify password
    if not verify_password(req.password, user.password):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")
    
    # Create token
    access_token = create_access_token({"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name
        }
    }
