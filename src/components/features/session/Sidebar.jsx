// src/components/features/session/Sidebar.jsx

import React from 'react';
import styles from './Sidebar.module.css'; // Sidebar 전용 CSS Module 임포트

const Sidebar = ({ children }) => {
  return (
    <div id="sidebarContainer" className={styles.sidebarContainer}>
      {children}
    </div>
  );
};

export default Sidebar;
