# 💰 Finance Manager - Quản lý Tài chính Cá nhân

Ứng dụng quản lý tài chính cá nhân fullstack với React + FastAPI + MySQL + Machine Learning.

## 🚀 Tính năng

- ✅ Đăng nhập / Đăng ký với JWT Authentication
- ✅ Dashboard tổng quan thu chi
- ✅ Quản lý giao dịch (CRUD)
- ✅ Lọc giao dịch theo loại, tháng, năm
- ✅ Báo cáo chi tiết theo tháng
- ✅ Database MySQL hoàn chỉnh với triggers & views
- 🔄 Dự đoán chi tiêu tháng sau (ML - coming soon)
- 🔄 Phân loại giao dịch tự động

## 🛠️ Công nghệ

**Frontend:**
- React 18
- React Router DOM
- CSS thuần

**Backend:**
- FastAPI (Python)
- JWT Authentication
- SQLAlchemy ORM

**Database:**
- MySQL 8.0+
- 8 tables với relationships
- Stored procedures & triggers
- Optimized indexes

## 📁 Cấu trúc Project

```
Quan-ly-tai-chinh/
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   ├── public/
│   └── package.json
│
├── backend/            # FastAPI Backend
│   ├── src/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── main.py
│   └── requirements.txt
│
└── database/           # MySQL Schema
    └── finance-database-setup.sql
```

## 🚀 Cài đặt & Chạy

### **1. Clone Repository**

```bash
git clone git@github.com:Nhatgreen/Quan-ly-tai-chinh.git
cd Quan-ly-tai-chinh
```

### **2. Setup Database**

```bash
# Tạo database
mysql -u root -p < database/finance-database-setup.sql

# Hoặc
mysql -u root -p
source database/finance-database-setup.sql
```

Database sẽ tạo:
- 8 tables (users, categories, transactions, monthly_reports, budgets, ml_predictions, user_settings)
- 13 default categories
- Sample data để test

### **3. Chạy Backend (Terminal 1)**

```bash
cd backend

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy server
python main.py
```

Backend sẽ chạy tại: **http://localhost:8000**

API Docs: **http://localhost:8000/docs**

### **4. Chạy Frontend (Terminal 2)**

```bash
cd frontend

# Cài đặt dependencies (lần đầu)
npm install

# Chạy development server
npm start
```

Frontend sẽ chạy tại: **http://localhost:3000**

## 🎯 Hướng dẫn sử dụng

1. Mở trình duyệt tại http://localhost:3000
2. Đăng ký tài khoản mới
3. Đăng nhập
4. Thêm giao dịch thu/chi
5. Xem Dashboard với tổng quan
6. Xem báo cáo theo tháng

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

## 🗄️ Database Schema

### Tables
- **users** - Thông tin người dùng
- **categories** - Danh mục thu chi (13 categories mặc định)
- **transactions** - Giao dịch thu chi
- **monthly_reports** - Báo cáo tháng (tự động cập nhật)
- **budgets** - Ngân sách theo category
- **ml_predictions** - Kết quả dự đoán ML
- **user_settings** - Cài đặt cá nhân

### Features
- ✅ Stored procedures tự động tính báo cáo
- ✅ 3 triggers tự động cập nhật monthly_reports
- ✅ 2 views cho thống kê nhanh
- ✅ Optimized indexes cho performance
- ✅ Sample data để test

## 🔧 Cấu hình

### Backend
- Đổi `SECRET_KEY` trong `backend/src/infrastructure/auth.py`
- Cấu hình MySQL connection trong `backend/src/infrastructure/database.py`

### Frontend
- Backend API URL mặc định: `http://localhost:8000`
- Có thể thay đổi trong các file `src/pages/*.jsx`

## 📄 License

MIT

---

**⭐ Nếu thấy hay, hãy star repo nhé!**
