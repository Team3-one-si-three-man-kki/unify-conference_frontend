# 📁 프로젝트 폴더 구조 가이드

이 문서는 React + Vite 기반 플랫폼 프로젝트의 폴더 구조와 각 폴더의 역할을 자세히 설명합니다. 
팀원들이 일관된 방식으로 개발할 수 있도록 구체적인 사용법과 예시를 포함하고 있습니다.

## 📖 목차
1. [전체 구조 개요](#📁-전체-구조-개요)
2. [권장 세부 폴더 구조](#🏗️-권장-세부-폴더-구조-구현-시-참고)
3. [각 폴더별 상세 설명](#📋-각-폴더별-상세-설명)
4. [사용된 주요 라이브러리](#🚀-사용된-주요-라이브러리)
5. [개발 가이드라인](#📝-개발-가이드라인)
6. [명명 규칙](#🏷️-명명-규칙)
7. [팀 개발 워크플로](#👥-팀-개발-워크플로)

## 📁 전체 구조 개요

```
src/
├── components/          # 재사용 가능한 컴포넌트들
│   ├── ui/             # 기본 UI 컴포넌트
│   ├── layout/         # 레이아웃 관련 컴포넌트
│   └── features/       # 기능별 비즈니스 로직 컴포넌트
├── pages/              # 페이지 컴포넌트 (라우팅용)
├── hooks/              # 커스텀 React 훅
├── services/           # API 통신 및 외부 서비스
├── store/              # 전역 상태 관리 (Redux)
├── router/             # 라우팅 설정
├── styles/             # 글로벌 스타일
├── utils/              # 유틸리티 함수
└── assets/             # 정적 파일 (이미지, 아이콘 등)
```

### 🏗️ 권장 세부 폴더 구조 (구현 시 참고)

플랫폼 사이트 개발 시 권장하는 상세한 폴더 구조입니다:

```
src/
├── components/           # 컴포넌트
│   ├── ui/              # 기본 UI 컴포넌트
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Table/
│   ├── layout/          # 레이아웃 컴포넌트
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── Layout/
│   └── features/        # 기능별 컴포넌트
│       ├── auth/        # 인증 관련
│       ├── dashboard/   # 대시보드
│       ├── profile/     # 프로필
│       └── admin/       # 관리자
├── pages/               # 페이지 컴포넌트
│   ├── Home/
│   ├── Login/
│   ├── Dashboard/
│   ├── Profile/
│   └── NotFound/
├── hooks/               # 커스텀 훅
│   ├── useAuth.js
│   ├── useApi.js
│   └── useLocalStorage.js
├── services/            # API 및 외부 서비스
│   ├── api/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── index.js
│   └── utils.js
├── store/               # 상태 관리
│   ├── slices/          # Redux Toolkit 슬라이스
│   ├── context/         # React Context
│   └── index.js
├── styles/              # 스타일
│   ├── globals.css
│   ├── variables.css
│   └── components/
├── utils/               # 유틸리티
│   ├── constants.js     # 상수
│   ├── helpers.js       # 헬퍼 함수
│   └── validations.js   # 유효성 검사
├── assets/              # 정적 파일
│   ├── images/
│   ├── icons/
│   └── fonts/
├── router/              # 라우팅 설정
│   ├── routes.js
│   └── ProtectedRoute.jsx
├── App.jsx
└── main.jsx
```

**핵심 폴더별 역할:**
- **components/features/**: 도메인별 비즈니스 로직 컴포넌트
- **pages/**: 라우팅되는 페이지 컴포넌트 (보통 간단한 레이아웃만)
- **services/**: 백엔드 API 통신 로직
- **store/**: 전역 상태 관리
- **router/**: 라우팅 및 권한 제어

## 📋 각 폴더별 상세 설명

### 🧩 `components/`
재사용 가능한 React 컴포넌트들을 관리하는 핵심 폴더입니다.

#### `components/ui/` - 기본 UI 컴포넌트
**📋 목적**: 프로젝트 전체에서 재사용되는 기본적인 UI 요소들

**📂 구조 예시**:
```
components/ui/
├── Button/
│   ├── Button.jsx
│   ├── Button.module.css
│   └── index.js
├── Input/
│   ├── Input.jsx
│   ├── Input.module.css
│   └── index.js
└── Modal/
    ├── Modal.jsx
    ├── Modal.module.css
    └── index.js
```

**✅ 포함되어야 할 컴포넌트들**:
- `Button` - 버튼 (primary, secondary, danger 등)
- `Input` - 입력 필드 (text, password, email 등)
- `Modal` - 모달 창
- `Table` - 테이블
- `Card` - 카드
- `Badge` - 뱃지
- `Spinner` - 로딩 스피너
- `Tooltip` - 툴팁

**🚫 포함되면 안 되는 것들**:
- 비즈니스 로직이 포함된 컴포넌트
- 특정 페이지에서만 사용되는 컴포넌트
- API 호출이나 상태 관리가 포함된 컴포넌트

**💡 개발 가이드**:
1. **순수 함수형 컴포넌트**로 작성
2. **props로만 데이터 전달** 받기
3. **재사용성**을 고려한 설계
4. **일관된 API** 제공 (예: variant, size, disabled 등)

**📝 상세 구현 예시**:
```javascript
// components/ui/Button/Button.jsx
import styles from './Button.module.css';

export const Button = ({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "medium",
  disabled = false,
  type = "button",
  className = "",
  ...props 
}) => {
  const buttonClass = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// components/ui/Button/index.js
export { Button } from './Button';
```

**🎨 스타일링 가이드**:
```css
/* components/ui/Button/Button.module.css */
.button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.primary {
  background-color: #007bff;
  color: white;
}

.primary:hover {
  background-color: #0056b3;
}

.secondary {
  background-color: #6c757d;
  color: white;
}

.small {
  padding: 4px 8px;
  font-size: 12px;
}

.medium {
  padding: 8px 16px;
  font-size: 14px;
}

.large {
  padding: 12px 24px;
  font-size: 16px;
}

.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

#### `components/layout/` - 레이아웃 컴포넌트
**📋 목적**: 페이지의 전체적인 구조와 레이아웃을 담당하는 컴포넌트들

**📂 구조 예시**:
```
components/layout/
├── Layout/
│   ├── Layout.jsx
│   ├── Layout.module.css
│   └── index.js
├── Header/
│   ├── Header.jsx
│   ├── Header.module.css
│   └── index.js
├── Sidebar/
│   ├── Sidebar.jsx
│   ├── Sidebar.module.css
│   └── index.js
└── Footer/
    ├── Footer.jsx
    ├── Footer.module.css
    └── index.js
```

**✅ 포함되어야 할 컴포넌트들**:
- `Layout` - 메인 레이아웃 래퍼
- `Header` - 상단 헤더 (네비게이션, 로고 등)
- `Sidebar` - 사이드바 (메뉴, 네비게이션 등)
- `Footer` - 하단 푸터
- `Breadcrumb` - 현재 위치 표시
- `Navigation` - 네비게이션 메뉴

**💡 개발 가이드**:
1. **children prop**을 활용한 슬롯 패턴 사용
2. **반응형 디자인** 고려
3. **접근성(a11y)** 기준 준수
4. **SEO** 최적화 (semantic HTML)

**📝 상세 구현 예시**:
```javascript
// components/layout/Layout/Layout.jsx
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Sidebar } from '../Sidebar';
import styles from './Layout.module.css';

export const Layout = ({ 
  children, 
  showSidebar = true, 
  headerProps = {},
  sidebarProps = {} 
}) => {
  return (
    <div className={styles.layout}>
      <Header {...headerProps} />
      
      <div className={styles.container}>
        {showSidebar && (
          <aside className={styles.sidebar}>
            <Sidebar {...sidebarProps} />
          </aside>
        )}
        
        <main className={styles.main}>
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

// components/layout/Header/Header.jsx
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../ui/Button';
import styles from './Header.module.css';

export const Header = ({ title = "플랫폼 이름" }) => {
  const { user, logout } = useAuth();
  
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.logo}>{title}</h1>
        
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li><a href="/dashboard">대시보드</a></li>
            <li><a href="/profile">프로필</a></li>
          </ul>
        </nav>
        
        <div className={styles.userActions}>
          {user ? (
            <>
              <span>안녕하세요, {user.name}님</span>
              <Button variant="secondary" onClick={logout}>
                로그아웃
              </Button>
            </>
          ) : (
            <Button variant="primary">
              로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
```

**🎨 레이아웃 스타일링 예시**:
```css
/* components/layout/Layout/Layout.module.css */
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 250px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
}

.main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    order: 2;
  }
}
```

#### `components/features/` - 기능별 비즈니스 컴포넌트
**📋 목적**: 특정 도메인이나 기능과 관련된 비즈니스 로직을 포함한 컴포넌트들

**📂 구조 예시**:
```
components/features/
├── auth/                    # 인증 관련
│   ├── LoginForm/
│   │   ├── LoginForm.jsx
│   │   ├── LoginForm.module.css
│   │   └── index.js
│   ├── SignupForm/
│   ├── PasswordReset/
│   └── index.js            # auth 기능 컴포넌트들 통합 export
├── dashboard/              # 대시보드 관련
│   ├── StatsCard/
│   ├── ActivityChart/
│   ├── RecentActivity/
│   └── index.js
├── profile/                # 프로필 관련
│   ├── ProfileEditor/
│   ├── AvatarUpload/
│   ├── SecuritySettings/
│   └── index.js
└── admin/                  # 관리자 관련
    ├── UserManagement/
    ├── SystemSettings/
    └── index.js
```

**✅ 포함되어야 할 것들**:
- 특정 도메인의 비즈니스 로직
- API 호출 로직
- 상태 관리 (Redux, 로컬 state)
- 폼 처리 및 유효성 검사
- 에러 처리

**🚫 포함되면 안 되는 것들**:
- 순수 UI 컴포넌트 (ui/ 폴더로)
- 여러 도메인에서 공통으로 사용되는 로직
- 레이아웃 관련 컴포넌트

**💡 개발 가이드**:
1. **도메인별로 폴더 분리**
2. **관련된 컴포넌트들을 그룹화**
3. **각 기능 폴더에 index.js로 통합 export**
4. **커스텀 훅과 함께 사용**

**📝 상세 구현 예시**:
```javascript
// components/features/auth/LoginForm/LoginForm.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { useAuth } from '../../../../hooks/useAuth';
import { login } from '../../../../services/api/auth';
import { setUser } from '../../../../store/slices/authSlice';
import styles from './LoginForm.module.css';

export const LoginForm = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const dispatch = useDispatch();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요';
    }
    
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await login(formData.email, formData.password);
      dispatch(setUser(response.user));
      onSuccess?.(response);
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || '로그인에 실패했습니다' 
      });
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 실시간 에러 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <form className={styles.loginForm} onSubmit={handleSubmit}>
      <h2 className={styles.title}>로그인</h2>
      
      {errors.general && (
        <div className={styles.errorMessage}>
          {errors.general}
        </div>
      )}
      
      <div className={styles.formGroup}>
        <Input
          type="email"
          name="email"
          placeholder="이메일 주소"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
      </div>
      
      <div className={styles.formGroup}>
        <Input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />
      </div>
      
      <Button
        type="submit"
        variant="primary"
        size="large"
        disabled={loading}
        className={styles.submitButton}
      >
        {loading ? '로그인 중...' : '로그인'}
      </Button>
      
      <div className={styles.links}>
        <a href="/forgot-password">비밀번호를 잊으셨나요?</a>
        <a href="/signup">계정이 없으신가요? 회원가입</a>
      </div>
    </form>
  );
};

// components/features/auth/index.js
export { LoginForm } from './LoginForm';
export { SignupForm } from './SignupForm';
export { PasswordReset } from './PasswordReset';
```

**🎨 기능별 컴포넌트 스타일링**:
```css
/* components/features/auth/LoginForm/LoginForm.module.css */
.loginForm {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.formGroup {
  margin-bottom: 1rem;
}

.errorMessage {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.submitButton {
  width: 100%;
  margin-bottom: 1rem;
}

.links {
  text-align: center;
}

.links a {
  display: block;
  margin: 0.5rem 0;
  color: #007bff;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
```

**🔄 기능별 컴포넌트 사용 패턴**:
```javascript
// pages/Login/Login.jsx에서 사용
import { LoginForm } from '../../components/features/auth';
import { Layout } from '../../components/layout/Layout';

export const LoginPage = () => {
  const handleLoginSuccess = (response) => {
    // 로그인 성공 후 리다이렉트
    window.location.href = '/dashboard';
  };

  const handleLoginError = (error) => {
    console.error('Login failed:', error);
  };

  return (
    <Layout showSidebar={false}>
      <LoginForm 
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />
    </Layout>
  );
};
```

### 📄 `pages/` - 페이지 컴포넌트
**📋 목적**: React Router에서 라우팅되는 최상위 페이지 컴포넌트들

**📂 구조 예시**:
```
pages/
├── Home/
│   ├── Home.jsx
│   ├── Home.module.css
│   └── index.js
├── Login/
│   ├── Login.jsx
│   ├── Login.module.css
│   └── index.js
├── Dashboard/
│   ├── Dashboard.jsx
│   ├── Dashboard.module.css
│   └── index.js
├── Profile/
│   ├── Profile.jsx
│   ├── Profile.module.css
│   └── index.js
├── NotFound/
│   ├── NotFound.jsx
│   ├── NotFound.module.css
│   └── index.js
└── index.js                # 모든 페이지 컴포넌트 통합 export
```

**✅ 페이지 컴포넌트의 역할**:
- 라우팅 엔드포인트 제공
- 레이아웃 컴포넌트와 기능 컴포넌트 조합
- 페이지별 SEO 메타데이터 관리
- 페이지 수준의 로딩/에러 상태 처리
- 권한 검사 (필요한 경우)

**🚫 페이지에서 하지 말아야 할 것들**:
- 복잡한 비즈니스 로직 (features/ 컴포넌트로)
- 직접적인 API 호출 (hooks나 features에서)
- 재사용 가능한 UI 로직

**💡 개발 가이드**:
1. **간단하고 명확하게 유지**
2. **컴포넌트 조합에 집중**
3. **페이지별 고유한 로직만 포함**
4. **SEO와 접근성 고려**

**📝 상세 구현 예시**:
```javascript
// pages/Dashboard/Dashboard.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout } from '../../components/layout/Layout';
import { 
  StatsCard, 
  ActivityChart, 
  RecentActivity 
} from '../../components/features/dashboard';
import { useAuth } from '../../hooks/useAuth';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: dashboardData, loading, error } = useSelector(
    state => state.dashboard
  );
  const dispatch = useDispatch();

  // 페이지 진입 시 데이터 로드
  useEffect(() => {
    if (user && !dashboardData) {
      dispatch(fetchDashboardData());
    }
  }, [user, dashboardData, dispatch]);

  // 인증 체크
  if (authLoading) {
    return (
      <Layout>
        <div className={styles.loading}>로딩 중...</div>
      </Layout>
    );
  }

  if (!user) {
    // 라우터 가드에서 처리되겠지만 안전장치
    window.location.href = '/login';
    return null;
  }

  return (
    <Layout>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1>대시보드</h1>
          <p>안녕하세요, {user.name}님!</p>
        </div>

        {error && (
          <div className={styles.error}>
            데이터를 불러오는 중 오류가 발생했습니다: {error}
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>
            대시보드 데이터 로딩 중...
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.statsSection}>
              <StatsCard 
                title="총 사용자" 
                value={dashboardData?.userCount} 
                trend="+12%"
              />
              <StatsCard 
                title="월간 활성 사용자" 
                value={dashboardData?.activeUsers} 
                trend="+5%"
              />
              <StatsCard 
                title="수익" 
                value={dashboardData?.revenue} 
                trend="+18%"
              />
            </div>

            <div className={styles.chartsSection}>
              <ActivityChart data={dashboardData?.chartData} />
            </div>

            <div className={styles.activitySection}>
              <RecentActivity activities={dashboardData?.recentActivities} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// pages/Profile/Profile.jsx
import { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { 
  ProfileEditor, 
  AvatarUpload, 
  SecuritySettings 
} from '../../components/features/profile';
import { useAuth } from '../../hooks/useAuth';
import styles from './Profile.module.css';

export const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: '프로필 정보' },
    { id: 'security', label: '보안 설정' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className={styles.profileTab}>
            <AvatarUpload currentAvatar={user?.avatar} />
            <ProfileEditor user={user} />
          </div>
        );
      case 'security':
        return (
          <div className={styles.securityTab}>
            <SecuritySettings />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className={styles.profile}>
        <div className={styles.header}>
          <h1>프로필 설정</h1>
        </div>

        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${
                activeTab === tab.id ? styles.active : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {renderTabContent()}
        </div>
      </div>
    </Layout>
  );
};

// pages/NotFound/NotFound.jsx
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import styles from './NotFound.module.css';

export const NotFound = () => {
  return (
    <Layout showSidebar={false}>
      <div className={styles.notFound}>
        <div className={styles.content}>
          <h1 className={styles.title}>404</h1>
          <h2 className={styles.subtitle}>페이지를 찾을 수 없습니다</h2>
          <p className={styles.description}>
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
          <div className={styles.actions}>
            <Button
              variant="primary"
              onClick={() => window.location.href = '/'}
            >
              홈으로 돌아가기
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.history.back()}
            >
              이전 페이지
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// pages/index.js - 통합 export
export { Home } from './Home';
export { Login } from './Login';
export { Dashboard } from './Dashboard';
export { Profile } from './Profile';
export { NotFound } from './NotFound';
```

**🎨 페이지 스타일링 예시**:
```css
/* pages/Dashboard/Dashboard.module.css */
.dashboard {
  padding: 1rem;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.header p {
  margin: 0;
  color: #666;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.statsSection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.chartsSection {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.activitySection {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

**🔗 라우터와의 연동**:
```javascript
// router/routes.js에서 페이지 컴포넌트 사용
import { createBrowserRouter } from 'react-router-dom';
import { 
  Home, 
  Login, 
  Dashboard, 
  Profile, 
  NotFound 
} from '../pages';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <NotFound />
  }
]);
```

### 🎣 `hooks/` - 커스텀 React 훅
**📋 목적**: 컴포넌트 간 공유되는 상태 로직과 사이드 이펙트를 캡슐화한 재사용 가능한 훅들

**📂 구조 예시**:
```
hooks/
├── useAuth.js              # 인증 관련 훅
├── useApi.js               # API 호출 훅
├── useLocalStorage.js      # 로컬 스토리지 훅
├── useDebounce.js          # 디바운스 훅
├── useModal.js             # 모달 상태 훅
├── usePagination.js        # 페이지네이션 훅
├── useForm.js              # 폼 상태 관리 훅
└── index.js                # 모든 훅 통합 export
```

**✅ 커스텀 훅에 포함되어야 할 것들**:
- 상태 로직 (useState, useReducer)
- 사이드 이펙트 (useEffect, API 호출)
- 컴포넌트 간 공유되는 로직
- 복잡한 상태 변환 로직

**🚫 포함되면 안 되는 것들**:
- UI 렌더링 로직
- 특정 컴포넌트에서만 사용되는 로직
- 순수 함수 (utils로 이동)

**💡 개발 가이드**:
1. **use로 시작하는 명명 규칙** 준수
2. **단일 책임 원칙** 적용
3. **의존성 배열 최적화**
4. **적절한 메모이제이션** 사용

**📝 상세 구현 예시**:
```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setUser, 
  clearUser, 
  setLoading 
} from '../store/slices/authSlice';
import { login as loginApi, logout as logoutApi } from '../services/api/auth';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector(state => state.auth);

  // 페이지 로드 시 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // 토큰으로 사용자 정보 확인
      verifyToken(token);
    } else {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const verifyToken = async (token) => {
    try {
      // 토큰 유효성 검사 API 호출
      const response = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        dispatch(setUser(userData));
      } else {
        localStorage.removeItem('token');
        dispatch(clearUser());
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      dispatch(clearUser());
    } finally {
      dispatch(setLoading(false));
    }
  };

  const login = async (email, password) => {
    dispatch(setLoading(true));
    try {
      const response = await loginApi(email, password);
      localStorage.setItem('token', response.token);
      dispatch(setUser(response.user));
      return { success: true, user: response.user };
    } catch (error) {
      dispatch(setLoading(false));
      return { 
        success: false, 
        error: error.response?.data?.message || '로그인에 실패했습니다' 
      };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch(clearUser());
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };
};

// hooks/useApi.js
import { useState, useEffect, useCallback } from 'react';

export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback((...args) => {
    return fetchData(...args);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

// hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // 초기값 설정
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 값 설정 함수
  const setValue = (value) => {
    try {
      // 함수형 업데이트 지원
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 값 제거 함수
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

// hooks/useDebounce.js
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// hooks/useModal.js
import { useState, useCallback } from 'react';

export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};

// hooks/usePagination.js
import { useState, useMemo } from 'react';

export const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = data.slice(startIndex, endIndex);

    return {
      currentItems,
      totalPages,
      totalItems,
      currentPage,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    };
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, paginationData.totalPages)));
  };

  const nextPage = () => {
    if (paginationData.hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (paginationData.hasPrev) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return {
    ...paginationData,
    goToPage,
    nextPage,
    prevPage
  };
};

// hooks/index.js - 통합 export
export { useAuth } from './useAuth';
export { useApi } from './useApi';
export { useLocalStorage } from './useLocalStorage';
export { useDebounce } from './useDebounce';
export { useModal } from './useModal';
export { usePagination } from './usePagination';
```

**🔄 커스텀 훅 사용 예시**:
```javascript
// 컴포넌트에서 커스텀 훅 사용
import { useAuth, useModal, useDebounce } from '../../hooks';

export const UserSearch = () => {
  const { user } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // 디바운스된 검색어로 API 호출
      searchUsers(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <div>
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="사용자 검색..."
      />
      
      <button onClick={openModal}>
        사용자 추가
      </button>
      
      {isOpen && (
        <Modal onClose={closeModal}>
          {/* 모달 내용 */}
        </Modal>
      )}
    </div>
  );
};
```

### 🌐 `services/` - API 통신 및 외부 서비스
**📋 목적**: 백엔드 API와의 통신, 외부 서비스 연동, HTTP 클라이언트 설정을 담당

**📂 구조 예시**:
```
services/
├── api/                    # API 호출 함수들
│   ├── auth.js            # 인증 관련 API
│   ├── users.js           # 사용자 관련 API
│   ├── dashboard.js       # 대시보드 관련 API
│   ├── files.js           # 파일 업로드/다운로드 API
│   └── index.js           # 모든 API 함수 통합 export
├── utils.js               # axios 인스턴스, 인터셉터 설정
├── config.js              # API 설정 상수
└── errorHandler.js        # 에러 처리 유틸리티
```

**✅ services 폴더에 포함되어야 할 것들**:
- HTTP 요청 함수들
- API 엔드포인트 정의
- 요청/응답 인터셉터
- 에러 처리 로직
- 토큰 관리

**🚫 포함되면 안 되는 것들**:
- UI 로직
- 컴포넌트 상태 관리
- 비즈니스 로직 (hooks나 components에서)

**💡 개발 가이드**:
1. **API별로 파일 분리**
2. **일관된 에러 처리**
3. **요청/응답 타입 정의**
4. **재시도 로직 구현**

**📝 상세 구현 예시**:
```javascript
// services/config.js
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// services/errorHandler.js
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    // 서버에서 응답을 받았지만 에러 상태
    const { status, data } = error.response;
    throw new ApiError(
      data.message || '서버 에러가 발생했습니다',
      status,
      data.code
    );
  } else if (error.request) {
    // 요청은 보냈지만 응답을 받지 못함
    throw new ApiError('네트워크 연결을 확인해주세요', 0, 'NETWORK_ERROR');
  } else {
    // 요청 설정 중 에러 발생
    throw new ApiError('요청 처리 중 에러가 발생했습니다', 0, 'REQUEST_ERROR');
  }
};

// services/utils.js
import axios from 'axios';
import { API_CONFIG } from './config';
import { handleApiError } from './errorHandler';

// axios 인스턴스 생성
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 요청 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    // 응답 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 토큰 만료 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // 토큰 제거 및 로그인 페이지로 리다이렉트
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 재시도 로직 (네트워크 에러의 경우)
    if (!error.response && originalRequest._retryCount < API_CONFIG.RETRY_ATTEMPTS) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      await new Promise(resolve => 
        setTimeout(resolve, API_CONFIG.RETRY_DELAY)
      );
      
      return api(originalRequest);
    }

    // 에러 처리
    handleApiError(error);
    return Promise.reject(error);
  }
);

// 파일 업로드용 인스턴스
export const fileApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000, // 파일 업로드는 더 긴 타임아웃
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// services/api/auth.js
import { api } from '../utils';

export const authApi = {
  // 로그인
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // 회원가입
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // 로그아웃
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // 토큰 검증
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  // 비밀번호 재설정 요청
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/password-reset-request', { email });
    return response.data;
  },

  // 비밀번호 재설정
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/password-reset', {
      token,
      newPassword,
    });
    return response.data;
  },
};

// services/api/users.js
import { api, fileApi } from '../utils';

export const usersApi = {
  // 사용자 목록 조회
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // 사용자 상세 조회
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // 사용자 정보 업데이트
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // 사용자 삭제
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // 프로필 이미지 업로드
  uploadAvatar: async (userId, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await fileApi.post(`/users/${userId}/avatar`, formData);
    return response.data;
  },

  // 사용자 검색
  searchUsers: async (query) => {
    const response = await api.get('/users/search', {
      params: { q: query },
    });
    return response.data;
  },
};

// services/api/dashboard.js
import { api } from '../utils';

export const dashboardApi = {
  // 대시보드 통계 데이터
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // 차트 데이터
  getChartData: async (timeRange = '7d') => {
    const response = await api.get('/dashboard/chart', {
      params: { range: timeRange },
    });
    return response.data;
  },

  // 최근 활동
  getRecentActivities: async (limit = 10) => {
    const response = await api.get('/dashboard/activities', {
      params: { limit },
    });
    return response.data;
  },
};

// services/api/index.js - 통합 export
export { authApi } from './auth';
export { usersApi } from './users';
export { dashboardApi } from './dashboard';

// 편의를 위한 개별 함수 export
export const {
  login,
  register,
  logout,
  verifyToken,
  requestPasswordReset,
  resetPassword,
} = authApi;

export const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadAvatar,
  searchUsers,
} = usersApi;

export const {
  getStats,
  getChartData,
  getRecentActivities,
} = dashboardApi;
```

**🔄 API 서비스 사용 예시**:
```javascript
// components/features/auth/LoginForm.jsx에서 사용
import { login } from '../../../services/api';

export const LoginForm = () => {
  const handleSubmit = async (formData) => {
    try {
      const response = await login(formData.email, formData.password);
      localStorage.setItem('token', response.token);
      // 로그인 성공 처리
    } catch (error) {
      console.error('Login failed:', error.message);
      // 에러 처리
    }
  };
};

// hooks/useUsers.js에서 사용
import { getUsers, searchUsers } from '../services/api';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async (params) => {
    setLoading(true);
    try {
      const data = await getUsers(params);
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, loadUsers };
};
```

### 🗄️ `store/` - 전역 상태 관리
**📋 목적**: Redux Toolkit을 사용한 전역 상태 관리, 복잡한 상태 로직 중앙화

**📂 구조 예시**:
```
store/
├── slices/                 # Redux Toolkit 슬라이스들
│   ├── authSlice.js       # 인증 상태
│   ├── userSlice.js       # 사용자 데이터
│   ├── dashboardSlice.js  # 대시보드 상태
│   ├── uiSlice.js         # UI 상태 (모달, 로딩 등)
│   └── index.js           # 모든 슬라이스 통합 export
├── middleware/            # 커스텀 미들웨어
│   ├── apiMiddleware.js   # API 관련 미들웨어
│   └── loggerMiddleware.js # 로깅 미들웨어
├── selectors/             # 리셀렉터들
│   ├── authSelectors.js
│   └── userSelectors.js
├── context/               # React Context (필요시)
│   └── ThemeContext.js
└── index.js               # store 설정
```

**✅ store 폴더에 포함되어야 할 것들**:
- 전역으로 관리되어야 하는 상태
- 여러 컴포넌트에서 공유하는 데이터
- 복잡한 상태 변경 로직
- 비동기 액션 (createAsyncThunk)

**🚫 포함되면 안 되는 것들**:
- 로컬 컴포넌트 상태
- 단순한 UI 상태
- 일회성 데이터

**💡 개발 가이드**:
1. **Redux Toolkit 패턴 사용**
2. **Immer를 활용한 불변성 관리**
3. **createAsyncThunk로 비동기 처리**
4. **정규화된 상태 구조**

**📝 상세 구현 예시**:
```javascript
// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';

// 비동기 thunk 액션들
export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(email, password);
      localStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyTokenAsync = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyToken();
      return response;
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue(error.message);
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      localStorage.removeItem('token');
      return null;
    } catch (error) {
      // 로그아웃은 실패해도 진행
      localStorage.removeItem('token');
      return null;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    // 동기 액션들
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 로그인
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // 토큰 검증
    builder
      .addCase(verifyTokenAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyTokenAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(verifyTokenAsync.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    // 로그아웃
    builder
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { setUser, clearUser, setLoading, clearError } = authSlice.actions;
export default authSlice.reducer;

// store/slices/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersApi } from '../../services/api';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await usersApi.getUsers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserAsync = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await usersApi.updateUser(userId, userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    currentUser: null,
    totalCount: 0,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearUsers: (state) => {
      state.list = [];
      state.totalCount = 0;
      state.pagination = {
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    },
  },
  extraReducers: (builder) => {
    // 사용자 목록 조회
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.users;
        state.totalCount = action.payload.totalCount;
        state.pagination = {
          ...state.pagination,
          totalPages: Math.ceil(action.payload.totalCount / state.pagination.limit),
        };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // 사용자 업데이트
    builder
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        const index = state.list.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      });
  },
});

export const { 
  setCurrentUser, 
  clearCurrentUser, 
  setPagination, 
  clearUsers 
} = userSlice.actions;
export default userSlice.reducer;

// store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    theme: 'light',
    notifications: [],
    modals: {
      userEdit: false,
      confirmDelete: false,
    },
    loading: {
      global: false,
      users: false,
      dashboard: false,
    },
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  openModal,
  closeModal,
  setLoading,
} = uiSlice.actions;
export default uiSlice.reducer;

// store/selectors/authSelectors.js
import { createSelector } from '@reduxjs/toolkit';

export const selectAuth = (state) => state.auth;

export const selectUser = createSelector(
  [selectAuth],
  (auth) => auth.user
);

export const selectIsAuthenticated = createSelector(
  [selectAuth],
  (auth) => auth.isAuthenticated
);

export const selectAuthLoading = createSelector(
  [selectAuth],
  (auth) => auth.loading
);

export const selectAuthError = createSelector(
  [selectAuth],
  (auth) => auth.error
);

// store/index.js - 스토어 설정
import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';

// persist 설정
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'], // 지속할 리듀서들
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    users: userReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.DEV, // 개발 환경에서만 Redux DevTools 활성화
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**🔄 Redux Store 사용 예시**:
```javascript
// main.jsx에서 Provider 설정
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        {/* 앱 컴포넌트들 */}
      </PersistGate>
    </Provider>
  );
}

// 컴포넌트에서 사용
import { useSelector, useDispatch } from 'react-redux';
import { loginAsync, clearError } from '../store/slices/authSlice';

export const LoginForm = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const handleLogin = async (email, password) => {
    const result = await dispatch(loginAsync({ email, password }));
    if (loginAsync.fulfilled.match(result)) {
      // 로그인 성공
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <div className="error">{error}</div>}
      {loading && <div>로그인 중...</div>}
      {/* 폼 내용 */}
    </form>
  );
};
```

### 🛣️ `router/` - 라우팅 설정
**📋 목적**: React Router를 사용한 애플리케이션 라우팅, 권한 제어, 네비게이션 가드 관리

**📂 구조 예시**:
```
router/
├── routes.js              # 메인 라우터 설정
├── ProtectedRoute.jsx     # 인증 필요 라우트 가드
├── PublicRoute.jsx        # 공개 라우트 (로그인 시 리다이렉트)
├── AdminRoute.jsx         # 관리자 전용 라우트
├── routePaths.js          # 라우트 경로 상수
└── index.js               # 라우터 설정 통합 export
```

**✅ router 폴더에 포함되어야 할 것들**:
- 라우트 정의 및 설정
- 권한 기반 라우트 가드
- 라우트 상수 관리
- 네비게이션 보안 로직

**🚫 포함되면 안 되는 것들**:
- 페이지 컴포넌트 로직
- 비즈니스 로직
- API 호출

**💡 개발 가이드**:
1. **계층적 라우트 구조**
2. **권한별 라우트 분리**
3. **라우트 경로 상수화**
4. **SEO 최적화 고려**

**📝 상세 구현 예시**:
```javascript
// router/routePaths.js
export const ROUTE_PATHS = {
  // 공개 라우트
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // 인증 필요 라우트
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // 관리자 라우트
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
  
  // 에러 페이지
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/401',
  SERVER_ERROR: '/500',
};

// router/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectAuthLoading } from '../store/selectors/authSelectors';
import { ROUTE_PATHS } from './routePaths';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const user = useSelector(state => state.auth.user);

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>인증 확인 중...</p>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={ROUTE_PATHS.LOGIN} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // 특정 역할이 필요한 경우 권한 확인
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={ROUTE_PATHS.UNAUTHORIZED} replace />;
  }

  return children;
};

// router/PublicRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/selectors/authSelectors';
import { ROUTE_PATHS } from './routePaths';

export const PublicRoute = ({ children, redirectTo = ROUTE_PATHS.DASHBOARD }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

// router/AdminRoute.jsx
import { ProtectedRoute } from './ProtectedRoute';

export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
};

// router/routes.js
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { 
  Home, 
  Login, 
  Register,
  Dashboard, 
  Profile, 
  Settings,
  AdminPanel,
  AdminUsers,
  NotFound,
  Unauthorized,
  ServerError 
} from '../pages';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { AdminRoute } from './AdminRoute';
import { ROUTE_PATHS } from './routePaths';

export const router = createBrowserRouter([
  // 공개 라우트들
  {
    path: ROUTE_PATHS.HOME,
    element: <Home />,
  },
  {
    path: ROUTE_PATHS.LOGIN,
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: ROUTE_PATHS.REGISTER,
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },

  // 인증 필요 라우트들
  {
    path: ROUTE_PATHS.DASHBOARD,
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTE_PATHS.PROFILE,
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTE_PATHS.SETTINGS,
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },

  // 관리자 라우트들
  {
    path: ROUTE_PATHS.ADMIN,
    element: (
      <AdminRoute>
        <AdminPanel />
      </AdminRoute>
    ),
    children: [
      {
        path: 'users',
        element: <AdminUsers />,
      },
      {
        path: 'settings',
        element: <AdminSettings />,
      },
    ],
  },

  // 에러 페이지들
  {
    path: ROUTE_PATHS.NOT_FOUND,
    element: <NotFound />,
  },
  {
    path: ROUTE_PATHS.UNAUTHORIZED,
    element: <Unauthorized />,
  },
  {
    path: ROUTE_PATHS.SERVER_ERROR,
    element: <ServerError />,
  },

  // 404 처리 (가장 마지막에 배치)
  {
    path: '*',
    element: <Navigate to={ROUTE_PATHS.NOT_FOUND} replace />,
  },
]);

// router/index.js
export { router } from './routes';
export { ProtectedRoute } from './ProtectedRoute';
export { PublicRoute } from './PublicRoute';
export { AdminRoute } from './AdminRoute';
export { ROUTE_PATHS } from './routePaths';
```

**🔄 라우터 사용 예시**:
```javascript
// main.jsx에서 라우터 설정
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  );
}

// 컴포넌트에서 네비게이션
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../router/routePaths';

export const LoginForm = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate(ROUTE_PATHS.DASHBOARD);
  };

  const handleSignupClick = () => {
    navigate(ROUTE_PATHS.REGISTER);
  };
};
```

### 🎨 `styles/` - 글로벌 스타일
**📋 목적**: 전체 애플리케이션에 적용되는 스타일, CSS 변수, 테마 관리

**📂 구조 예시**:
```
styles/
├── globals.css          # 글로벌 리셋 및 기본 스타일
├── variables.css        # CSS 변수 정의
├── themes/              # 테마별 스타일
│   ├── light.css
│   └── dark.css
├── components/          # 컴포넌트별 공통 스타일
│   ├── buttons.css
│   ├── forms.css
│   └── modals.css
└── utilities.css        # 유틸리티 클래스
```

### 🔧 `utils/` - 유틸리티 함수
**📋 목적**: 순수 함수들, 헬퍼 함수, 상수 정의

**📂 구조 예시**:
```
utils/
├── constants.js         # 애플리케이션 상수
├── helpers.js           # 헬퍼 함수들
├── validations.js       # 유효성 검사 함수
├── formatters.js        # 데이터 포매팅 함수
├── storage.js           # 로컬/세션 스토리지 유틸
└── index.js             # 통합 export
```

### 📦 `assets/` - 정적 파일
**📋 목적**: 이미지, 아이콘, 폰트 등 정적 파일 관리

**📂 구조 예시**:
```
assets/
├── images/
│   ├── logos/
│   ├── backgrounds/
│   └── illustrations/
├── icons/
│   ├── svg/
│   └── png/
├── fonts/
│   ├── primary/
│   └── secondary/
└── videos/
```

## 🚀 사용된 주요 라이브러리

- **React 19.1.1**: UI 라이브러리
- **React Router DOM 7.8.1**: 클라이언트 사이드 라우팅
- **Redux Toolkit 2.8.2 + React Redux 9.2.0**: 상태 관리
- **Axios 1.11.0**: HTTP 클라이언트
- **Vite 7.1.2**: 빌드 도구 및 개발 서버

## 📝 개발 가이드라인

### 🏷️ 명명 규칙

#### 📁 **폴더명**
- **kebab-case** 사용: `user-management`, `auth-components`
- **복수형** 사용: `components`, `hooks`, `services`
- **명확하고 설명적인 이름**: `dashboard-components` (O) vs `dc` (X)

#### 📄 **파일명**
- **컴포넌트**: PascalCase + `.jsx` 확장자
  ```
  UserProfile.jsx
  LoginForm.jsx
  DashboardStats.jsx
  ```
- **훅**: camelCase + `use` 접두사
  ```
  useAuth.js
  useLocalStorage.js
  useDebounce.js
  ```
- **유틸리티**: camelCase
  ```
  helpers.js
  constants.js
  validations.js
  ```
- **API 서비스**: camelCase + `Api` 접미사
  ```
  authApi.js
  usersApi.js
  dashboardApi.js
  ```

#### 🏗️ **변수 및 함수명**
- **변수**: camelCase
  ```javascript
  const userName = 'john';
  const isLoggedIn = true;
  const userList = [];
  ```
- **함수**: camelCase + 동사로 시작
  ```javascript
  const fetchUserData = () => {};
  const handleSubmit = () => {};
  const validateForm = () => {};
  ```
- **상수**: SCREAMING_SNAKE_CASE
  ```javascript
  const API_BASE_URL = 'https://api.example.com';
  const MAX_RETRY_ATTEMPTS = 3;
  const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user'
  };
  ```

### 📦 **Import/Export 규칙**

#### ✅ **권장 패턴**
```javascript
// Named exports 우선 사용
export const Button = () => {};
export const Input = () => {};

// 통합 export를 위한 index.js 파일
// components/ui/index.js
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';

// 사용할 때
import { Button, Input, Modal } from '../ui';
```

#### ❌ **지양할 패턴**
```javascript
// Default export 남용
export default Button;

// 직접 경로 import
import Button from '../ui/Button/Button';
import Input from '../ui/Input/Input';
```

### 🧩 **컴포넌트 작성 규칙**

#### ✅ **권장 구조**
```javascript
// components/features/auth/LoginForm.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Input } from '../../ui';
import { useAuth } from '../../../hooks';
import { loginAsync } from '../../../store/slices/authSlice';
import styles from './LoginForm.module.css';

export const LoginForm = ({ onSuccess, onError }) => {
  // 1. 상태 정의
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // 2. 훅 사용
  const dispatch = useDispatch();
  const { loading } = useAuth();

  // 3. 이벤트 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 로직 구현
  };

  const handleChange = (e) => {
    // 로직 구현
  };

  // 4. 렌더링
  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* JSX 내용 */}
    </form>
  );
};
```

### 🔄 **상태 관리 규칙**

#### **언제 Redux를 사용할까?**
- ✅ **전역 상태**: 여러 컴포넌트에서 공유
- ✅ **복잡한 상태 로직**: 상태 변경이 복잡함
- ✅ **서버 상태**: API로부터 받은 데이터
- ✅ **사용자 인증 정보**: 전앱에서 접근 필요

#### **언제 useState를 사용할까?**
- ✅ **로컬 상태**: 단일 컴포넌트에서만 사용
- ✅ **폼 입력**: 임시 입력 데이터
- ✅ **UI 상태**: 모달 열림/닫힘, 토글 상태
- ✅ **간단한 상태**: 복잡한 로직이 불필요

### 🌐 **API 통신 규칙**

#### ✅ **권장 패턴**
```javascript
// services/api/users.js에서 API 함수 정의
export const getUsers = async (params) => {
  const response = await api.get('/users', { params });
  return response.data;
};

// hooks/useUsers.js에서 상태 관리
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      // 에러 처리
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, loadUsers };
};

// 컴포넌트에서 사용
export const UserList = () => {
  const { users, loading, loadUsers } = useUsers();
  
  useEffect(() => {
    loadUsers();
  }, []);
};
```

### 🎨 **스타일링 규칙**

#### **CSS Modules 사용**
```javascript
// UserCard.module.css
.card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.title {
  font-size: 1.2rem;
  font-weight: bold;
}

.active {
  border-color: #007bff;
}

// UserCard.jsx
import styles from './UserCard.module.css';

export const UserCard = ({ user, isActive }) => {
  return (
    <div className={`${styles.card} ${isActive ? styles.active : ''}`}>
      <h3 className={styles.title}>{user.name}</h3>
    </div>
  );
};
```
