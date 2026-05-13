# In-memory database (simple dict storage for demo)
# In production, use real MySQL database

users_db = {}
transactions_db = {}
categories_db = {
    1: {"id": 1, "name": "Lương", "type": "income", "icon": "💰"},
    2: {"id": 2, "name": "Thưởng", "type": "income", "icon": "🎁"},
    3: {"id": 3, "name": "Ăn uống", "type": "expense", "icon": "🍔"},
    4: {"id": 4, "name": "Di chuyển", "type": "expense", "icon": "🚗"},
    5: {"id": 5, "name": "Giải trí", "type": "expense", "icon": "🎮"},
    6: {"id": 6, "name": "Mua sắm", "type": "expense", "icon": "🛒"},
}

# Counters for auto-increment IDs
user_counter = 1
transaction_counter = 1
