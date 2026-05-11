import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/Reports.css';

function Reports() {
  return (
    <div className="app-layout">
      <Header />
      <div className="main-container">
        <Sidebar />
        <main className="content">
          <h2>Báo cáo</h2>
          <div className="reports-placeholder">
            <p>📊 Trang báo cáo đang được phát triển...</p>
            <p>Sẽ có biểu đồ và thống kê chi tiết ở đây!</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Reports;
