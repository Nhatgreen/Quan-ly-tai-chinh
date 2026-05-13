from fastapi import APIRouter, Header, Depends
from sqlalchemy.orm import Session
from src.infrastructure.database import get_db, Category
from src.infrastructure.auth import decode_token

router = APIRouter()

@router.get("")
def get_categories(authorization: str = Header(None), db: Session = Depends(get_db)):
    # Simple auth check
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        decode_token(token)
    
    categories = db.query(Category).all()
    
    result = []
    for cat in categories:
        result.append({
            "id": cat.id,
            "name": cat.name,
            "type": cat.type,
            "icon": cat.icon,
            "color": cat.color
        })
    
    return result
