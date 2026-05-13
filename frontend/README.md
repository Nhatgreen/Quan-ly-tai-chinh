# Finance Manager - Frontend

Ứng dụng quản lý tài chính cá nhân được xây dựng bằng React.

## 🚀 Tính năng

- ✅ Đăng nhập / Đăng ký
- ✅ Dashboard với tổng quan thu chi
- ✅ Quản lý giao dịch (CRUD)
- ✅ Lọc giao dịch theo loại, tháng, năm
- ✅ Dự đoán chi tiêu tháng sau (ML)
- ✅ Báo cáo (đang phát triển)

## 🛠️ Công nghệ

- React 18
- React Router DOM
- CSS thuần (không dùng Tailwind)
- Fetch API

## 📦 Cài đặt

```bash
# Clone repository
git clone <repo-url>
cd finance-frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm start
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## 🔧 Cấu hình

Backend API mặc định: `http://localhost:8000`

Để thay đổi, sửa URL trong các file:
- `src/pages/Login.jsx`
- `src/pages/Register.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/Transactions.jsx`

## 📁 Cấu trúc thư mục

```
src/
├── components/
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   └── SummaryCard.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Transactions.jsx
│   └── Reports.jsx
├── styles/
│   ├── App.css
│   ├── Auth.css
│   ├── Dashboard.css
│   ├── Transactions.css
│   └── Reports.css
├── App.jsx
└── index.js
```

## 🎨 Screenshots

(Thêm screenshots sau)

## 📝 License

MIT

## 👨‍💻 Author

Được tạo bởi MyServer AI Assistant
