import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="sidebar">
      <Link to="/" className={`sidebar-item ${isActive('/')}`}>
        <span className="icon">📊</span>
        <span>Dashboard</span>
      </Link>

      <Link to="/transactions" className={`sidebar-item ${isActive('/transactions')}`}>
        <span className="icon">💰</span>
        <span>Giao dịch</span>
      </Link>

      <Link to="/reports" className={`sidebar-item ${isActive('/reports')}`}>
        <span className="icon">📈</span>
        <span>Báo cáo</span>
      </Link>
    </nav>
  );
}

export default Sidebar;
