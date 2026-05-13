import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/Transactions.css';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.type !== 'all') params.append('type', filters.type);
      params.append('month', filters.month);
      params.append('year', filters.year);

      const response = await fetch(
        `http://localhost:8000/api/transactions?${params}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editData
        ? `http://localhost:8000/api/transactions/${editData.id}`
        : 'http://localhost:8000/api/transactions';
      
      const method = editData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditData(null);
        setFormData({
          amount: '',
          type: 'expense',
          category_id: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
        fetchTransactions();
        alert(editData ? 'Cập nhật thành công!' : 'Thêm giao dịch thành công!');
      }
    } catch (err) {
      console.error('Error submitting transaction:', err);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleEdit = (transaction) => {
    setEditData(transaction);
    setFormData({
      amount: transaction.amount,
      type: transaction.type,
      category_id: transaction.category_id,
      description: transaction.description,
      date: transaction.date
    });
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/transactions/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchTransactions();
        alert('Xóa thành công!');
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="app-layout">
      <Header />
      <div className="main-container">
        <Sidebar />
        <main className="content">
          <div className="page-header">
            <h2>Quản lý giao dịch</h2>
            <button
              onClick={() => {
                setEditData(null);
                setFormData({
                  amount: '',
                  type: 'expense',
                  category_id: '',
                  description: '',
                  date: new Date().toISOString().split('T')[0]
                });
                setShowForm(true);
              }}
              className="btn-primary"
            >
              + Thêm giao dịch
            </button>
          </div>

          <div className="filters">
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="all">Tất cả</option>
              <option value="income">Thu nhập</option>
              <option value="expense">Chi tiêu</option>
            </select>

            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>

            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <div className="transaction-list">
            <table>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Danh mục</th>
                  <th>Mô tả</th>
                  <th>Loại</th>
                  <th>Số tiền</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      Chưa có giao dịch nào
                    </td>
                  </tr>
                ) : (
                  transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.date)}</td>
                      <td>
                        <span className="category-badge">
                          {transaction.category_icon} {transaction.category_name}
                        </span>
                      </td>
                      <td>{transaction.description || '-'}</td>
                      <td>
                        <span className={`type-badge ${transaction.type}`}>
                          {transaction.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                        </span>
                      </td>
                      <td className={transaction.type === 'income' ? 'income' : 'expense'}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatMoney(transaction.amount)}
                      </td>
                      <td>
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="btn-icon"
                          title="Sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteClick(transaction.id)}
                          className="btn-icon"
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {showForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>{editData ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}</h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Loại giao dịch</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="expense">Chi tiêu</option>
                      <option value="income">Thu nhập</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Số tiền</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleFormChange}
                      placeholder="50000"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Danh mục</label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories
                        .filter(cat => cat.type === formData.type)
                        .map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Mô tả</label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Ví dụ: Ăn trưa"
                    />
                  </div>

                  <div className="form-group">
                    <label>Ngày</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowForm(false);
                        setEditData(null);
                      }} 
                      className="btn-secondary"
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn-primary">
                      {editData ? 'Cập nhật' : 'Thêm'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteConfirm}
            title="Xóa giao dịch"
            message="Bạn có chắc chắn muốn xóa giao dịch này? Hành động này không thể hoàn tác."
          />
        </main>
      </div>
    </div>
  );
}

export default Transactions;
