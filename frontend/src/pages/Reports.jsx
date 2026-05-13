import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/Reports.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Reports() {
  const [period, setPeriod] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChartData();
  }, [period, selectedDate, selectedWeek, selectedMonth, selectedYear]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `http://localhost:8000/api/reports/chart?period=${period}`;

      if (period === 'day') {
        url += `&date=${selectedDate}`;
      } else if (period === 'week') {
        url += `&week=${selectedWeek}&month=${selectedMonth}&year=${selectedYear}`;
      } else if (period === 'month') {
        url += `&month=${selectedMonth}&year=${selectedYear}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setChartData(data);
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Biểu đồ Thu Chi',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += formatMoney(context.parsed.y);
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return (value / 1000000).toFixed(1) + 'M';
          }
        }
      }
    }
  };

  const getChartJSData = () => {
    if (!chartData) return null;

    return {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Thu nhập',
          data: chartData.income,
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1
        },
        {
          label: 'Chi tiêu',
          data: chartData.expense,
          backgroundColor: 'rgba(244, 67, 54, 0.7)',
          borderColor: 'rgba(244, 67, 54, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  return (
    <div className="app-layout">
      <Header />
      <div className="main-container">
        <Sidebar />
        <main className="content">
          <div className="page-header">
            <h2>📊 Báo cáo tài chính</h2>
          </div>

          {/* Filters */}
          <div className="report-filters">
            <div className="filter-group">
              <label>Xem theo:</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="day">Theo ngày</option>
                <option value="week">Theo tuần</option>
                <option value="month">Theo tháng</option>
              </select>
            </div>

            {period === 'day' && (
              <div className="filter-group">
                <label>Chọn ngày:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            )}

            {period === 'week' && (
              <>
                <div className="filter-group">
                  <label>Tuần:</label>
                  <select value={selectedWeek} onChange={(e) => setSelectedWeek(parseInt(e.target.value))}>
                    <option value="1">Tuần 1</option>
                    <option value="2">Tuần 2</option>
                    <option value="3">Tuần 3</option>
                    <option value="4">Tuần 4</option>
                    <option value="5">Tuần 5</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Tháng:</label>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Năm:</label>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </>
            )}

            {period === 'month' && (
              <>
                <div className="filter-group">
                  <label>Tháng:</label>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Năm:</label>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : chartData ? (
            <>
              {/* Summary Cards */}
              <div className="summary-cards">
                <div className="summary-card income">
                  <div className="card-icon">💰</div>
                  <div className="card-content">
                    <div className="card-label">Tổng thu</div>
                    <div className="card-value">{formatMoney(chartData.total_income)}</div>
                  </div>
                </div>

                <div className="summary-card expense">
                  <div className="card-icon">💸</div>
                  <div className="card-content">
                    <div className="card-label">Tổng chi</div>
                    <div className="card-value">{formatMoney(chartData.total_expense)}</div>
                  </div>
                </div>

                <div className={`summary-card ${chartData.balance >= 0 ? 'positive' : 'negative'}`}>
                  <div className="card-icon">📈</div>
                  <div className="card-content">
                    <div className="card-label">Chênh lệch</div>
                    <div className="card-value">
                      {chartData.balance >= 0 ? '+' : ''}
                      {formatMoney(chartData.balance)}
                    </div>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon">📝</div>
                  <div className="card-content">
                    <div className="card-label">Giao dịch</div>
                    <div className="card-value">{chartData.transaction_count}</div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="chart-container">
                <Bar data={getChartJSData()} options={chartOptions} />
              </div>

              {/* Category Breakdown (only for month view) */}
              {period === 'month' && chartData.by_category && chartData.by_category.length > 0 && (
                <div className="category-breakdown">
                  <h3>Chi tiết theo danh mục</h3>
                  <div className="category-list">
                    {chartData.by_category.map((cat, index) => (
                      <div key={index} className="category-item">
                        <div className="category-info">
                          <span className="category-icon">{cat.category_icon}</span>
                          <span className="category-name">{cat.category_name}</span>
                        </div>
                        <div className="category-amount">
                          <span className="amount">{formatMoney(cat.total)}</span>
                          <span className="percentage">({cat.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-data">Không có dữ liệu</div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Reports;
