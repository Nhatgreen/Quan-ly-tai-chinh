from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.infrastructure.database import users_db, user_counter
from src.infrastructure.auth import hash_password, verify_password, create_access_token

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(req: RegisterRequest):
    global user_counter
    
    # Check if email exists
    for user in users_db.values():
        if user["email"] == req.email:
            raise HTTPException(status_code=400, detail="Email đã tồn tại")
    
    # Create user
    user_id = user_counter
    user_counter += 1
    
    users_db[user_id] = {
        "id": user_id,
        "email": req.email,
        "password_hash": hash_password(req.password),
        "full_name": req.full_name
    }
    
    return {"message": "Đăng ký thành công", "user_id": user_id}

@router.post("/login")
def login(req: LoginRequest):
    # Find user by email
    user = None
    for u in users_db.values():
        if u["email"] == req.email:
            user = u
            break
    
    if not user:
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")
    
    # Verify password
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")
    
    # Create token
    access_token = create_access_token({"sub": str(user["id"])})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"]
        }
    }
