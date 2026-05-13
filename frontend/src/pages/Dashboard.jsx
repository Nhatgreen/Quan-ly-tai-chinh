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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
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

  const formatMoney = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  // Mock prediction based on current month average
  const getPrediction = () => {
    if (summary.daily_average && summary.daily_average > 0) {
      // Predict next month based on 30 days average
      return summary.daily_average * 30;
    }
    return 0;
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

          {/* ML Prediction Card - Coming Soon */}
          <div className="prediction-section">
            <div className="prediction-card">
              <div className="prediction-header">
                <h3>🔮 Dự đoán chi tiêu tháng sau</h3>
                <span className="badge-beta">AI Prediction</span>
              </div>
              
              <div className="prediction-content">
                <div className="prediction-amount">
                  <span className="amount-label">Dự kiến chi tiêu:</span>
                  <span className="amount-value">{formatMoney(getPrediction())}</span>
                </div>
                
                <div className="prediction-details">
                  <div className="detail-item">
                    <span className="detail-icon">📊</span>
                    <span className="detail-text">Dựa trên chi tiêu trung bình hiện tại</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🤖</span>
                    <span className="detail-text">Machine Learning đang được phát triển</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📈</span>
                    <span className="detail-text">Độ chính xác sẽ tăng theo thời gian</span>
                  </div>
                </div>

                <div className="prediction-note">
                  <span className="note-icon">💡</span>
                  <span>Tính năng ML sẽ phân tích xu hướng chi tiêu của bạn để đưa ra dự đoán chính xác hơn</span>
                </div>
              </div>
            </div>
          </div>

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
                  {formatMoney(summary.daily_average || 0)}
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
