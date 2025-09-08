// src/pages/Admin/AdminLayout.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Building2, Package, Server } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef(null);

  const navItems = [
    { path: '/admin', icon: Home, label: '대시보드' },
    { path: '/admin-tenant', icon: Building2, label: '테넌트' },
    { path: '/admin-module', icon: Package, label: '모듈' },
    { path: '/admin-server', icon: Server, label: '서버현황' }
  ];

  const getCurrentPath = () => {
    if (location.pathname === '/admin' || location.pathname === '/admin-dashboard') return '/admin';
    return location.pathname;
  };

  // 헤더 실제 높이를 읽어서 CSS 변수로 내려줍니다 (윈도우 리사이즈에도 반영)
  useEffect(() => {
    const applyHeaderHeight = () => {
      const h = headerRef.current?.offsetHeight ?? 80;
      document.documentElement.style.setProperty('--admin-header-h', `${h + 12}px`); // 여유 12px
    };
    applyHeaderHeight();
    window.addEventListener('resize', applyHeaderHeight);
    return () => window.removeEventListener('resize', applyHeaderHeight);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <header
        ref={headerRef}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 24px',
          zIndex: 1000,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 32, height: 32,
              backgroundColor: '#3b82f6', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold', fontSize: 16
            }}>A</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Admin Dashboard
            </h1>
          </div>

          <nav style={{ display: 'flex', gap: 8 }}>
            {navItems.map((item) => {
              const isActive = getCurrentPath() === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', border: 'none', borderRadius: 6,
                    fontSize: 14, fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer', transition: 'all .2s ease',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#1d4ed8' : '#64748b'
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 모든 화면 공통 상단 여백 (동적) */}
      <main
        style={{
          paddingTop: 'var(--admin-header-h, 96px)',   // 동적 + 안전 기본값
          maxWidth: 1400,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {children}
      </main>

      {/* 스크롤/앵커 이동 시에도 헤더만큼 여유 확보 */}
      <style>{`
        html { scroll-padding-top: var(--admin-header-h, 96px); }
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
};

export default AdminLayout;
