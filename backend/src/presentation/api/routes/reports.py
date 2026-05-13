from fastapi import APIRouter, Header, HTTPException, Depends
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
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
        extract('month', Transaction.transaction_date) == month,
        extract('year', Transaction.transaction_date) == year
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
    
    # Calculate daily average - CORRECTED LOGIC
    # Days from day 1 of month to current day
    today = date.today()
    
    # If current month, use today; otherwise use last day of that month
    if today.year == year and today.month == month:
        end_date = today
    else:
        from calendar import monthrange
        last_day = monthrange(year, month)[1]
        end_date = date(year, month, last_day)
    
    # First day of the month
    first_day_of_month = date(year, month, 1)
    
    # Calculate number of days from day 1 to end_date
    days_in_period = (end_date - first_day_of_month).days + 1
    daily_average = total_expense / days_in_period if days_in_period > 0 else 0
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "transaction_count": len(user_transactions),
        "daily_average": daily_average,
        "by_category": list(by_category.values())
    }

@router.get("/chart")
def get_chart_data(
    period: str,  # 'day', 'week', 'month'
    date: str = None,  # For day: '2026-05-14'
    week: int = None,  # For week: 1-5
    month: int = None,
    year: int = None,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    user_id = get_current_user(authorization)
    
    if period == "day":
        # Single day
        target_date = datetime.fromisoformat(date).date()
        
        transactions = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_date == target_date
        ).all()
        
        income = sum(float(t.amount) for t in transactions if t.type == "income")
        expense = sum(float(t.amount) for t in transactions if t.type == "expense")
        
        return {
            "labels": [target_date.strftime("%d/%m")],
            "income": [income],
            "expense": [expense],
            "total_income": income,
            "total_expense": expense,
            "balance": income - expense,
            "transaction_count": len(transactions)
        }
    
    elif period == "week":
        # 7 days of the week
        # Calculate start of week (Monday)
        from datetime import date as dt_date
        import calendar
        
        # Get first day of month
        first_day = dt_date(year, month, 1)
        
        # Find the Monday of the target week
        # Week 1 starts from first Monday
        first_monday = first_day
        while first_monday.weekday() != 0:  # 0 = Monday
            first_monday += timedelta(days=1)
        
        # Calculate start date of target week
        start_date = first_monday + timedelta(weeks=week - 1)
        
        labels = []
        income_data = []
        expense_data = []
        
        for i in range(7):
            current_date = start_date + timedelta(days=i)
            
            transactions = db.query(Transaction).filter(
                Transaction.user_id == user_id,
                Transaction.transaction_date == current_date
            ).all()
            
            income = sum(float(t.amount) for t in transactions if t.type == "income")
            expense = sum(float(t.amount) for t in transactions if t.type == "expense")
            
            # Vietnamese day names
            day_names = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
            labels.append(f"{day_names[i]} {current_date.strftime('%d/%m')}")
            income_data.append(income)
            expense_data.append(expense)
        
        return {
            "labels": labels,
            "income": income_data,
            "expense": expense_data,
            "total_income": sum(income_data),
            "total_expense": sum(expense_data),
            "balance": sum(income_data) - sum(expense_data),
            "transaction_count": db.query(Transaction).filter(
                Transaction.user_id == user_id,
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date < start_date + timedelta(days=7)
            ).count()
        }
    
    elif period == "month":
        # All days in month
        from calendar import monthrange
        
        days_in_month = monthrange(year, month)[1]
        
        labels = []
        income_data = []
        expense_data = []
        
        for day in range(1, days_in_month + 1):
            current_date = datetime(year, month, day).date()
            
            transactions = db.query(Transaction).filter(
                Transaction.user_id == user_id,
                Transaction.transaction_date == current_date
            ).all()
            
            income = sum(float(t.amount) for t in transactions if t.type == "income")
            expense = sum(float(t.amount) for t in transactions if t.type == "expense")
            
            labels.append(f"{day}/{month}")
            income_data.append(income)
            expense_data.append(expense)
        
        # Get category breakdown
        all_transactions = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            extract('month', Transaction.transaction_date) == month,
            extract('year', Transaction.transaction_date) == year
        ).all()
        
        by_category = {}
        for t in all_transactions:
            if t.type == "expense":  # Only expenses for breakdown
                cat_id = t.category_id
                if cat_id not in by_category:
                    category = db.query(Category).filter(Category.id == cat_id).first()
                    by_category[cat_id] = {
                        "category_name": category.name if category else "Unknown",
                        "category_icon": category.icon if category else "❓",
                        "total": 0
                    }
                by_category[cat_id]["total"] += float(t.amount)
        
        # Calculate percentages
        total_expense = sum(expense_data)
        for cat in by_category.values():
            cat["percentage"] = round((cat["total"] / total_expense * 100), 1) if total_expense > 0 else 0
        
        return {
            "labels": labels,
            "income": income_data,
            "expense": expense_data,
            "total_income": sum(income_data),
            "total_expense": sum(expense_data),
            "balance": sum(income_data) - sum(expense_data),
            "transaction_count": len(all_transactions),
            "by_category": sorted(by_category.values(), key=lambda x: x["total"], reverse=True)
        }
    
    else:
        raise HTTPException(status_code=400, detail="Invalid period. Use 'day', 'week', or 'month'")
