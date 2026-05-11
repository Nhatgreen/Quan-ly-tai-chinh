import React from 'react';

function SummaryCard({ title, amount, icon, color }) {
  const formatMoney = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  return (
    <div className={`summary-card ${color}`}>
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3>{title}</h3>
        <p className="amount">{formatMoney(amount)}</p>
      </div>
    </div>
  );
}

export default SummaryCard;
