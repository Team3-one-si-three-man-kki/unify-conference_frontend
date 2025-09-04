import React from 'react';
import './SessionModal.css';

export const SessionModal = ({ isOpen, onClose, title, message, type = 'info', showConfirm = false, onConfirm }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '🎉';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="session-modal-backdrop" onClick={handleBackdropClick}>
      <div className="session-modal-content">
        <div className="session-modal-header">
          <span className="session-modal-icon">{getIcon()}</span>
          <h3 className="session-modal-title">{title}</h3>
        </div>
        <div className="session-modal-body">
          <p className="session-modal-message">{message}</p>
        </div>
        <div className="session-modal-actions">
          {showConfirm ? (
            <>
              <button className="session-modal-button cancel" onClick={onClose}>
                취소
              </button>
              <button className="session-modal-button confirm" onClick={onConfirm}>
                확인
              </button>
            </>
          ) : (
            <button className="session-modal-button confirm" onClick={onClose}>
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
};