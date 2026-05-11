from fastapi import APIRouter, Header
from src.infrastructure.database import categories_db
from src.infrastructure.auth import decode_token

router = APIRouter()

@router.get("")
def get_categories(authorization: str = Header(None)):
    # Simple auth check
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        decode_token(token)
    
    return list(categories_db.values())
