import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    subDomain: 'admin'
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    message: '',
    isConfirm: false,
    callback: null
  });

  // 저장된 사용자 ID 로드
  useEffect(() => {
    try {
      const savedUserId = localStorage.getItem('savedUserId');
      if (savedUserId) {
        setFormData(prev => ({ ...prev, email: savedUserId }));
        setRememberMe(true);
      }
    } catch (error) {
      console.warn('로컬 스토리지 접근 실패:', error);
    }
  }, []);

  // 팝업 표시 함수
  const displayPopup = useCallback((message, isConfirm = false, callback = null) => {
    setPopupConfig({ message, isConfirm, callback });
    setShowPopup(true);
  }, []);

  // 팝업 닫기 함수
  const closePopup = useCallback((result = false) => {
    setShowPopup(false);
    if (popupConfig.callback) {
      setTimeout(() => {
        popupConfig.callback(result);
      }, 100);
    }
  }, [popupConfig.callback]);

  // JWT 파싱 함수
  const parseJwt = useCallback((token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }, []);

  // 입력값 검증
  const validateLogin = useCallback((email, password) => {
    if (!email || email.trim() === '') {
      displayPopup('아이디를 입력해주세요.', false, () => {
        document.getElementById('email-input')?.focus();
      });
      return false;
    }

    if (!password || password.trim() === '') {
      displayPopup('비밀번호를 입력해주세요.', false, () => {
        document.getElementById('password-input')?.focus();
      });
      return false;
    }

    if (email.length < 3) {
      displayPopup('아이디는 3글자 이상 입력해주세요.', false, () => {
        document.getElementById('email-input')?.focus();
      });
      return false;
    }

    return true;
  }, [displayPopup]);

  // 로그인 처리
  const handleLogin = useCallback(async () => {
    const { email, password } = formData;

    if (!validateLogin(email, password)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/InsWebApp/TNU0000Login.pwkjson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 'dma_login',
          key: 'elData',
          elData: {
            email,
            password,
            subDomain: 'admin'
          }
        })
      });

      const data = await response.json();
      const headers = {};
      
      // 응답 헤더에서 토큰 추출
      const accessToken = response.headers.get('authorization');
      const refreshToken = response.headers.get('refresh-token');

      if (data.elHeader && data.elHeader.resSuc === true) {
        // 토큰 저장
        if (accessToken) {
          sessionStorage.setItem('accessToken', accessToken);
        }
        if (refreshToken) {
          sessionStorage.setItem('refreshToken', refreshToken);
        }

        // 사용자 ID 저장 처리
        try {
          if (rememberMe) {
            localStorage.setItem('savedUserId', email);
          } else {
            localStorage.removeItem('savedUserId');
          }
          sessionStorage.setItem('loggedInUser', email);
        } catch (error) {
          console.warn('스토리지 저장 실패:', error);
        }

        // JWT에서 테넌트 ID 추출
        let tenantId = null;
        if (accessToken) {
          const tokenString = accessToken.startsWith('Bearer ') 
            ? accessToken.substring(7) 
            : accessToken;
          const tokenPayload = parseJwt(tokenString);
          
          if (tokenPayload && tokenPayload.tenantId) {
            tenantId = tokenPayload.tenantId;
          }
        }

        setIsLoading(false);

        if (tenantId) {
          const redirectUrl = `/InsWebApp/websquare/websquare.html?w2xPath=/InsWebApp/main/mobile/mobile_dev_dashboard.xml&tenant=${encodeURIComponent(tenantId)}`;
          
          displayPopup('로그인되었습니다!', false, () => {
            try {
              window.location.href = redirectUrl;
            } catch (error) {
              window.location.replace(redirectUrl);
            }
          });
        } else {
          displayPopup('로그인은 성공했으나, 토큰에서 테넌트 정보를 찾을 수 없습니다.', false);
        }

      } else {
        setIsLoading(false);
        displayPopup('아이디 또는 비밀번호가 올바르지 않습니다.', false, () => {
          setFormData(prev => ({ ...prev, password: '' }));
          document.getElementById('password-input')?.focus();
        });
      }

    } catch (error) {
      setIsLoading(false);
      console.error('로그인 오류:', error);
      displayPopup('로그인 요청 중 오류가 발생했습니다.', false);
    }
  }, [formData, rememberMe, validateLogin, displayPopup, parseJwt]);

  // 입력값 변경 처리
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // 키보드 이벤트 처리
  const handleKeyPress = useCallback((e, nextField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextField === 'login') {
        handleLogin();
      } else if (nextField) {
        document.getElementById(nextField)?.focus();
      }
    }
  }, [handleLogin]);

  // Popup 컴포넌트
  const Popup = () => {
    if (!showPopup) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 font-pretendard">
        <div className="bg-white p-6 rounded-2xl shadow-2xl min-w-[280px] max-w-[90%] text-center">
          <div className="mb-6 text-base leading-relaxed text-gray-800 whitespace-pre-wrap break-words">
            {popupConfig.message}
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => closePopup(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium text-sm min-w-[80px] hover:bg-blue-700 transition-colors"
            >
              확인
            </button>
            {popupConfig.isConfirm && (
              <button
                onClick={() => closePopup(false)}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium text-sm min-w-[80px] hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-radial from-white/20 via-transparent to-transparent animate-pulse"></div>
      </div>

      {/* 메인 로그인 카드 */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 relative z-10">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">
            Developer Dashboard
          </h1>
          <p className="text-sm text-gray-600 font-normal">
            서비스 접속을 위해 로그인하세요
          </p>
        </div>

        {/* 로그인 폼 */}
        <div className="space-y-5">
          {/* 아이디 입력 */}
          <div className="space-y-2">
            <label htmlFor="email-input" className="block text-sm font-semibold text-gray-700">
              아이디
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email-input"
                type="text"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'password-input')}
                placeholder="admin@example.com"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-base bg-gray-50 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* 비밀번호 입력 */}
          <div className="space-y-2">
            <label htmlFor="password-input" className="block text-sm font-semibold text-gray-700">
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'login')}
                placeholder="비밀번호를 입력하세요"
                className="w-full pl-12 pr-16 py-4 border-2 border-gray-200 rounded-xl text-base bg-gray-50 transition-all focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 로그인 기억하기 */}
          <div className="flex items-center">
            <input
              id="remember-checkbox"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="remember-checkbox" className="ml-3 text-sm text-gray-700 cursor-pointer">
              로그인 상태 유지
            </label>
          </div>

          {/* 로그인 버튼 */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl ${
              isLoading 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                로그인 중...
              </div>
            ) : (
              '로그인'
            )}
          </button>
        </div>
      </div>

      {/* 팝업 */}
      <Popup />
    </div>
  );
};

export default LoginPage;