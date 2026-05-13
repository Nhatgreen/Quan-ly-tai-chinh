from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from src.infrastructure.database import get_db, Transaction, Category
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
def create_transaction(req: TransactionCreate, authorization: str = Header(None), db: Session = Depends(get_db)):
    user_id = get_current_user(authorization)
    
    # Parse date
    transaction_date = datetime.fromisoformat(req.date).date()
    
    new_transaction = Transaction(
        user_id=user_id,
        amount=req.amount,
        type=req.type,
        category_id=req.category_id,
        description=req.description,
        transaction_date=transaction_date
    )
    
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    
    # Get category info
    category = db.query(Category).filter(Category.id == new_transaction.category_id).first()
    
    return {
        "id": new_transaction.id,
        "user_id": new_transaction.user_id,
        "amount": float(new_transaction.amount),
        "type": new_transaction.type,
        "category_id": new_transaction.category_id,
        "description": new_transaction.description,
        "date": str(new_transaction.transaction_date),
        "category_name": category.name if category else "Unknown",
        "category_icon": category.icon if category else "❓"
    }

@router.get("")
def get_transactions(
    authorization: str = Header(None), 
    type: Optional[str] = None, 
    month: Optional[int] = None, 
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    user_id = get_current_user(authorization)
    
    # Base query
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    
    # Filter by type
    if type and type != "all":
        query = query.filter(Transaction.type == type)
    
    # Filter by month/year
    if month and year:
        query = query.filter(
            extract('month', Transaction.transaction_date) == month,
            extract('year', Transaction.transaction_date) == year
        )
    
    # Order by date descending
    transactions = query.order_by(Transaction.transaction_date.desc()).all()
    
    # Add category info
    result = []
    for t in transactions:
        category = db.query(Category).filter(Category.id == t.category_id).first()
        result.append({
            "id": t.id,
            "user_id": t.user_id,
            "amount": float(t.amount),
            "type": t.type,
            "category_id": t.category_id,
            "description": t.description,
            "date": str(t.transaction_date),
            "category_name": category.name if category else "Unknown",
            "category_icon": category.icon if category else "❓"
        })
    
    return result

@router.put("/{transaction_id}")
def update_transaction(
    transaction_id: int, 
    req: TransactionCreate, 
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    user_id = get_current_user(authorization)
    
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # Update fields
    transaction.amount = req.amount
    transaction.type = req.type
    transaction.category_id = req.category_id
    transaction.description = req.description
    transaction.transaction_date = datetime.fromisoformat(req.date).date()
    
    db.commit()
    db.refresh(transaction)
    
    # Get category info
    category = db.query(Category).filter(Category.id == transaction.category_id).first()
    
    return {
        "id": transaction.id,
        "user_id": transaction.user_id,
        "amount": float(transaction.amount),
        "type": transaction.type,
        "category_id": transaction.category_id,
        "description": transaction.description,
        "date": str(transaction.transaction_date),
        "category_name": category.name if category else "Unknown",
        "category_icon": category.icon if category else "❓"
    }

@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int, 
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    user_id = get_current_user(authorization)
    
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    db.delete(transaction)
    db.commit()
    
    return {"message": "Deleted successfully"}
