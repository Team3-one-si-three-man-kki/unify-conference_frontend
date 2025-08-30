// src/components/ui/Modal/Modal.jsx

import React, { useEffect } from 'react';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  const modalOverlayRef = React.useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Add a small delay to allow the DOM to update before adding the 'visible' class
      const timer = setTimeout(() => {
        modalOverlayRef.current?.classList.add(styles.visible);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      modalOverlayRef.current?.classList.remove(styles.visible);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div ref={modalOverlayRef} className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.modalCloseButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalContent}>
          {children}
        </div>
        {footer && <div className={styles.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
