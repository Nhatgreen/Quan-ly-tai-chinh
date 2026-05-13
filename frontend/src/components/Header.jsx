import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>💰 Finance Manager</h1>
      </div>
      <div className="header-right">
        <span className="user-name">Xin chào, {user.full_name || 'User'}</span>
        <button onClick={handleLogout} className="btn-logout">
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

export default Header;
