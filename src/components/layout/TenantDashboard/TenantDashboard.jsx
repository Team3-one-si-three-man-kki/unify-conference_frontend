import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import './TenantDashboard.css';


const TenantDashboardWithRouter = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [tenantName, setTenantName] = useState('');
  const [userRole, setUserRole] = useState('USER');
  const [allowedTabs, setAllowedTabs] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // 역할별 탭 권한 정의
  const rolePermissions = {
    'ADMIN': {
      tabs: ['users', 'modules', 'login', 'meeting', 'attendance', 'moduleManagement'],
      description: '모든 기능에 접근 가능'
    },
    'MANAGER': {
      tabs: ['users', 'modules', 'login', 'meeting', 'attendance', 'moduleManagement'],
      description: '모든 기능에 접근 가능'
    },
    'USER': {
      tabs: ['meeting', 'attendance'],
      description: '미팅 관련 기능만 접근 가능'
    }
  };

  // 탭 정보 
  const tabInfo = {
    users: { 
      label: '사용자 관리', 
      icon: '👤',
      path: '/users',
    },
    modules: { 
      label: '모듈 구매', 
      icon: '📦',
      path: '/modules',
    },
    login: { 
      label: '로그인 페이지 관리', 
      icon: '🔐',
      path: '/login-custom',
    },
    meeting: { 
      label: '미팅 생성', 
      icon: '📹',
      path: '/meeting',
    },
    attendance: { 
      label: '출석 관리', 
      icon: '✅',
      path: '/attendance',
    },
    moduleManagement: { 
      label: '모듈 관리', 
      icon: '⭐',
      path: '/module-management',
    }
  };

    useEffect(() => {
    //initializeUser();
    //checkAuthentication();

    setUserRole('ADMIN'); // 모든 권한 부여
    setAllowedTabs(['users', 'modules', 'login', 'meeting', 'attendance', 'moduleManagement']);
    setTenantName('개발 테스트');
  
    
    // 현재 경로에 따라 activeTab 설정
    const currentPath = location.pathname;
    
    
    if (currentPath === '/') {
        setActiveTab('users');
    } else {
        const currentTab = Object.keys(tabInfo).find(key => 
        currentPath.startsWith(tabInfo[key].path)
        );
        if (currentTab) {
        setActiveTab(currentTab);
        }
    }
    }, [location]);

  // JWT 토큰 파싱
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // URL 파라미터 가져오기
  const getQueryParam = (name) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  };

  // 사용자 초기화
  const initializeUser = () => {
    const accessToken = sessionStorage.getItem('accessToken');
    const tenantId = getQueryParam('tenant');

    if (!accessToken) {
      // 로그인 페이지로 리다이렉트
      navigate('/login' + (tenantId ? `?tenant=${tenantId}` : ''));
      return;
    }

    // 토큰에서 사용자 정보 추출
    const tokenString = accessToken.startsWith('Bearer ') ? accessToken.substring(7) : accessToken;
    const tokenPayload = parseJwt(tokenString);

    if (tokenPayload) {
      // 역할 설정
      const role = tokenPayload.role ? tokenPayload.role.toUpperCase() : 'USER';
      setUserRole(role);
      
      // 권한에 따른 탭 설정
      const permissions = rolePermissions[role] || rolePermissions['USER'];
      setAllowedTabs(permissions.tabs);

      // 테넌트 정보 설정
      const effectiveTenantId = tenantId || tokenPayload.tenantId;
      if (effectiveTenantId) {
        setTenantName(effectiveTenantId);
        fetchTenantInfo(effectiveTenantId);
      }
    }
  };

  // 인증 체크
  const checkAuthentication = () => {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return false;
    }
    return true;
  };

  // 테넌트 정보 가져오기
  const fetchTenantInfo = async (tenantId) => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}`, {
        headers: {
          'Authorization': sessionStorage.getItem('accessToken'),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.name) {
          setTenantName(data.name);
          sessionStorage.setItem('currentTenantName', data.name);
        }
      }
    } catch (error) {
      console.error('테넌트 정보 조회 실패:', error);
    }
  };

  // 탭 클릭 처리 (라우터 네비게이션)
 const handleTabClick = (tabName) => {
  if (allowedTabs.includes(tabName)) {
    setActiveTab(tabName);
    const tabPath = tabInfo[tabName].path;

    if (tabPath !== '/') {
      navigate(tabPath);
    } else {
      navigate('/users'); // 기본 페이지로 이동
    }
  } else {
    alert('해당 기능에 접근 권한이 없습니다.');
  }
};

  // 로그아웃
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      // 로그아웃 API 호출
      await fetch('/InsWebApp/TNU0000Logout.pwkjson', {
        method: 'POST',
        headers: {
          'Authorization': sessionStorage.getItem('accessToken'),
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      // 세션 클리어
      sessionStorage.clear();
      localStorage.removeItem('refreshToken');
      
      // 로그인 페이지로 리다이렉트
      const tenantId = getQueryParam('tenant');
      navigate('/login' + (tenantId ? `?tenant=${tenantId}` : ''));
    }
  };

  return (
    <div className="tenant-dashboard">
      {/* 헤더 */}
      <header className="dashboard-header">
        <h1>
          {tenantName || 'Dashboard'}
          <span className={`role-badge ${userRole.toLowerCase()}`}>
            {userRole}
          </span>
        </h1>
        <button className="logout-button" onClick={handleLogout}>
          ↪ 로그아웃
        </button>
      </header>

      {/* 탭 네비게이션 */}
      <nav className="tab-navigation">
        {Object.keys(tabInfo).map(tabKey => (
          <button
            key={tabKey}
            className={`tab-button ${activeTab === tabKey ? 'active' : ''} ${!allowedTabs.includes(tabKey) ? 'disabled' : ''}`}
            onClick={() => handleTabClick(tabKey)}
            disabled={!allowedTabs.includes(tabKey)}
          >
            <span className="tab-icon">{tabInfo[tabKey].icon}</span>
            <span className="tab-label">{tabInfo[tabKey].label}</span>
          </button>
        ))}
      </nav>

      
      <div className="tab-content">
        <Outlet />
      </div>

      {/* 로그아웃 확인 모달 */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>로그아웃 확인</h3>
            <p>{tenantName}에서 로그아웃 하시겠습니까?</p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmLogout}>
                확인
              </button>
              <button className="cancel-btn" onClick={() => setShowLogoutConfirm(false)}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDashboardWithRouter;