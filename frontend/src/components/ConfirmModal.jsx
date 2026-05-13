import React from 'react';
import '../styles/ConfirmModal.css';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h3>{title || 'Xác nhận'}</h3>
        </div>
        
        <div className="confirm-modal-body">
          <div className="confirm-icon">⚠️</div>
          <p>{message || 'Bạn có chắc chắn muốn thực hiện hành động này?'}</p>
        </div>
        
        <div className="confirm-modal-footer">
          <button 
            onClick={onClose} 
            className="btn-cancel"
          >
            Hủy
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            className="btn-confirm"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
