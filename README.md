# 💰 Finance Manager - Quản lý Tài chính Cá nhân

Ứng dụng quản lý tài chính cá nhân fullstack với React + FastAPI + Machine Learning.

## 🚀 Tính năng

- ✅ Đăng nhập / Đăng ký với JWT Authentication
- ✅ Dashboard tổng quan thu chi
- ✅ Quản lý giao dịch (CRUD)
- ✅ Lọc giao dịch theo loại, tháng, năm
- ✅ Báo cáo chi tiết theo tháng
- ✅ Dự đoán chi tiêu tháng sau (ML - coming soon)
- ✅ Phân loại giao dịch tự động

## 🛠️ Công nghệ

**Frontend:**
- React 18
- React Router DOM
- CSS thuần (không Tailwind)

**Backend:**
- FastAPI (Python)
- JWT Authentication
- In-memory database (demo)
- SQLAlchemy (ready for MySQL)

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
└── backend/            # FastAPI Backend
    ├── src/
    │   ├── domain/
    │   ├── infrastructure/
    │   └── presentation/
    ├── main.py
    └── requirements.txt
```

## 🚀 Cài đặt & Chạy

### **1. Clone Repository**

```bash
git clone git@github.com:Nhatgreen/Quan-ly-tai-chinh.git
cd Quan-ly-tai-chinh
```

### **2. Chạy Backend (Terminal 1)**

```bash
cd backend

# Cài đặt dependencies
pip install -r requirements.txt --break-system-packages

# Chạy server
python main.py
```

Backend sẽ chạy tại: **http://localhost:8000**

API Docs: **http://localhost:8000/docs**

### **3. Chạy Frontend (Terminal 2)**

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

## 🔧 Cấu hình

### Backend
- Đổi `SECRET_KEY` trong `backend/src/infrastructure/auth.py`
- Cấu hình MySQL trong `backend/src/infrastructure/database.py` (nếu dùng)

### Frontend
- Backend API URL mặc định: `http://localhost:8000`
- Có thể thay đổi trong các file `src/pages/*.jsx`

## 📝 Roadmap

- [ ] Tích hợp MySQL database
- [ ] Machine Learning prediction
- [ ] Export PDF/Excel
- [ ] Multi-currency support
- [ ] Mobile responsive improvements
- [ ] Dark mode

## 🐛 Known Issues

- Backend đang dùng in-memory database (data mất khi restart)
- Chưa có validation đầy đủ
- Chưa có unit tests

## 📄 License

MIT

## 👨‍💻 Author

Được tạo bởi MyServer AI Assistant

---

**⭐ Nếu thấy hay, hãy star repo nhé!**
