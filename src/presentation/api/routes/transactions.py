from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from src.infrastructure.database import transactions_db, transaction_counter, categories_db
from src.infrastructure.auth import decode_token

router = APIRouter()

class TransactionCreate(BaseModel):
    amount: float
    type: str
    category_id: int
    description: Optional[str] = None
    date: str

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return int(payload["sub"])

@router.post("")
def create_transaction(req: TransactionCreate, authorization: str = Header(None)):
    global transaction_counter
    user_id = get_current_user(authorization)
    
    transaction_id = transaction_counter
    transaction_counter += 1
    
    transactions_db[transaction_id] = {
        "id": transaction_id,
        "user_id": user_id,
        "amount": req.amount,
        "type": req.type,
        "category_id": req.category_id,
        "description": req.description,
        "date": req.date
    }
    
    return transactions_db[transaction_id]

@router.get("")
def get_transactions(authorization: str = Header(None), type: Optional[str] = None, 
                     month: Optional[int] = None, year: Optional[int] = None):
    user_id = get_current_user(authorization)
    
    user_transactions = [t for t in transactions_db.values() if t["user_id"] == user_id]
    
    # Filter by type
    if type and type != "all":
        user_transactions = [t for t in user_transactions if t["type"] == type]
    
    # Filter by month/year
    if month and year:
        user_transactions = [
            t for t in user_transactions 
            if datetime.fromisoformat(t["date"]).month == month 
            and datetime.fromisoformat(t["date"]).year == year
        ]
    
    # Add category info
    result = []
    for t in user_transactions:
        category = categories_db.get(t["category_id"], {})
        result.append({
            **t,
            "category_name": category.get("name", "Unknown"),
            "category_icon": category.get("icon", "❓")
        })
    
    return result

@router.put("/{transaction_id}")
def update_transaction(transaction_id: int, req: TransactionCreate, authorization: str = Header(None)):
    user_id = get_current_user(authorization)
    
    if transaction_id not in transactions_db:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    transaction = transactions_db[transaction_id]
    
    if transaction["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    transactions_db[transaction_id].update({
        "amount": req.amount,
        "type": req.type,
        "category_id": req.category_id,
        "description": req.description,
        "date": req.date
    })
    
    return transactions_db[transaction_id]

@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: int, authorization: str = Header(None)):
    user_id = get_current_user(authorization)
    
    if transaction_id not in transactions_db:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    transaction = transactions_db[transaction_id]
    
    if transaction["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    del transactions_db[transaction_id]
    
    return {"message": "Deleted successfully"}
