# Domain Entities - Pure Python classes

class User:
    def __init__(self, id=None, email=None, password_hash=None, full_name=None):
        self.id = id
        self.email = email
        self.password_hash = password_hash
        self.full_name = full_name

class Transaction:
    def __init__(self, id=None, user_id=None, amount=None, type=None, 
                 category_id=None, description=None, date=None):
        self.id = id
        self.user_id = user_id
        self.amount = amount
        self.type = type  # 'income' or 'expense'
        self.category_id = category_id
        self.description = description
        self.date = date
    
    def is_valid(self):
        if self.amount <= 0:
            raise ValueError("Số tiền phải lớn hơn 0")
        if self.type not in ['income', 'expense']:
            raise ValueError("Loại giao dịch không hợp lệ")
        return True

class Category:
    def __init__(self, id=None, name=None, type=None, icon=None):
        self.id = id
        self.name = name
        self.type = type  # 'income' or 'expense'
        self.icon = icon
