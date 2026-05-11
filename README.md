# Finance Manager Backend

Backend API cho ứng dụng quản lý tài chính cá nhân.

## 🚀 Công nghệ

- FastAPI
- Python 3.x
- JWT Authentication
- In-memory database (demo)

## 📦 Cài đặt

```bash
# Clone repository
git clone <repo-url>
cd finance-backend

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy server
python main.py
```

Server sẽ chạy tại: http://localhost:8000

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Transactions
- `GET /api/transactions` - Lấy danh sách giao dịch
- `POST /api/transactions` - Tạo giao dịch mới
- `PUT /api/transactions/{id}` - Cập nhật giao dịch
- `DELETE /api/transactions/{id}` - Xóa giao dịch

### Categories
- `GET /api/categories` - Lấy danh sách danh mục

### Reports
- `GET /api/reports/monthly` - Báo cáo theo tháng

## 🔧 Cấu trúc

```
src/
├── domain/
│   └── entities.py
├── infrastructure/
│   ├── database.py
│   └── auth.py
└── presentation/
    └── api/
        └── routes/
            ├── auth.py
            ├── transactions.py
            ├── categories.py
            └── reports.py
```

## 📝 Lưu ý

- Đây là phiên bản demo với in-memory database
- Trong production, thay bằng MySQL/PostgreSQL
- Đổi SECRET_KEY trong `src/infrastructure/auth.py`

## 👨‍💻 Author

Được tạo bởi MyServer AI Assistant
