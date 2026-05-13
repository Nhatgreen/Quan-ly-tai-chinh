import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import SummaryCard from '../components/SummaryCard';
import '../styles/Dashboard.css';

function Dashboard() {
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
    fetchPrediction();
  }, []);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const response = await fetch(
        `http://localhost:8000/api/reports/monthly?month=${month}&year=${year}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setSummary(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching summary:', err);
      setLoading(false);
    }
  };

  const fetchPrediction = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/predict/spending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      console.error('Error fetching prediction:', err);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="app-layout">
      <Header />
      <div className="main-container">
        <Sidebar />
        <main className="content">
          <h2>Dashboard</h2>
          
          <div className="summary-grid">
            <SummaryCard
              title="Thu nhập"
              amount={summary.total_income}
              icon="💵"
              color="green"
            />
            <SummaryCard
              title="Chi tiêu"
              amount={summary.total_expense}
              icon="💸"
              color="red"
            />
            <SummaryCard
              title="Còn lại"
              amount={summary.balance}
              icon="💰"
              color="blue"
            />
          </div>

          {prediction && (
            <div className="prediction-card">
              <h3>🔮 Dự đoán tháng sau</h3>
              <p className="prediction-amount">
                Chi tiêu dự kiến: {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(prediction.predicted_expense)}
              </p>
              <p className="prediction-note">
                Dựa trên dữ liệu 6 tháng gần nhất
              </p>
            </div>
          )}

          <div className="quick-stats">
            <h3>Thống kê nhanh</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Giao dịch tháng này</span>
                <span className="stat-value">{summary.transaction_count || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Chi tiêu trung bình/ngày</span>
                <span className="stat-value">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(summary.daily_average || 0)}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
