from fastapi import APIRouter, Header, HTTPException
from datetime import datetime
from src.infrastructure.database import transactions_db, categories_db
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
def get_monthly_report(month: int, year: int, authorization: str = Header(None)):
    user_id = get_current_user(authorization)
    
    # Get user transactions for the month
    user_transactions = [
        t for t in transactions_db.values() 
        if t["user_id"] == user_id
        and datetime.fromisoformat(t["date"]).month == month
        and datetime.fromisoformat(t["date"]).year == year
    ]
    
    total_income = sum(t["amount"] for t in user_transactions if t["type"] == "income")
    total_expense = sum(t["amount"] for t in user_transactions if t["type"] == "expense")
    balance = total_income - total_expense
    
    # Group by category
    by_category = {}
    for t in user_transactions:
        cat_id = t["category_id"]
        if cat_id not in by_category:
            category = categories_db.get(cat_id, {})
            by_category[cat_id] = {
                "category_id": cat_id,
                "category_name": category.get("name", "Unknown"),
                "category_icon": category.get("icon", "❓"),
                "total": 0
            }
        by_category[cat_id]["total"] += t["amount"]
    
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
