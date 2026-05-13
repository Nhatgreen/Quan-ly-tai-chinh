from fastapi import APIRouter, Header, HTTPException, Depends
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.infrastructure.database import get_db, Transaction, Category
from src.infrastructure.auth import decode_token

router = APIRouter()

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return int(payload["sub"])

@router.get("/monthly")
def get_monthly_report(month: int, year: int, authorization: str = Header(None), db: Session = Depends(get_db)):
    user_id = get_current_user(authorization)
    
    # Get user transactions for the month
    user_transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        func.MONTH(Transaction.transaction_date) == month,
        func.YEAR(Transaction.transaction_date) == year
    ).all()
    
    total_income = sum(float(t.amount) for t in user_transactions if t.type == "income")
    total_expense = sum(float(t.amount) for t in user_transactions if t.type == "expense")
    balance = total_income - total_expense
    
    # Group by category
    by_category = {}
    for t in user_transactions:
        cat_id = t.category_id
        if cat_id not in by_category:
            category = db.query(Category).filter(Category.id == cat_id).first()
            by_category[cat_id] = {
                "category_id": cat_id,
                "category_name": category.name if category else "Unknown",
                "category_icon": category.icon if category else "❓",
                "total": 0
            }
        by_category[cat_id]["total"] += float(t.amount)
    
    # Calculate daily average
    days_in_month = 30  # Simplified
    daily_average = total_expense / days_in_month if days_in_month > 0 else 0
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "transaction_count": len(user_transactions),
        "daily_average": daily_average,
        "by_category": list(by_category.values())
    }
