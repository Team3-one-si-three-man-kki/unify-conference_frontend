import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../services/api/api'; // 수정된 import 경로
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [subDomain, setSubDomain] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const tenantFromUrl = searchParams.get('tenant');
        if (tenantFromUrl) {
            setSubDomain(tenantFromUrl);
        }
        const error = searchParams.get('error');
        if (error) {
            alert(decodeURIComponent(error));
        }
    }, [searchParams]);
    
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password || !subDomain) {
            alert('서브도메인, 이메일, 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            const response = await apiClient.post('/api/guest/login', {
                subDomain,
                email,
                password
            });

            if (response.status === 200) {
                const accessToken = response.headers['authorization'];
                if (accessToken) {
                    sessionStorage.setItem('accessToken', accessToken);
                    alert('로그인 성공!');
                    navigate('/'); 
                } else {
                    alert('로그인은 성공했으나 토큰을 받지 못했습니다.');
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.';
            alert(errorMessage);
            console.error('Login error:', error);
        }
    };

   const handleKakaoLogin = async () => {
        // 🔽 서브도메인이 없으면 진행하지 않도록 방어 코드 추가
        if (!subDomain) {
            alert('먼저 접속하려는 서비스의 주소(서브도메인)를 확인해주세요.');
            return;
        }
        try {
            // 🔽 백엔드에 'login' 타입과 현재 subDomain을 함께 전달
            const response = await apiClient.get(`/api/guest/kakao/auth-url?type=login&subDomain=${subDomain}`);
            const { url } = response.data;
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error('Failed to get Kakao auth URL', error);
            alert('카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h1 className="login-title">UniCon 로그인</h1>
                <p className="login-subtitle">{subDomain ? `${subDomain} 테넌트로 로그인합니다.` : '테넌트 정보를 확인해주세요.'}</p>
                
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">이메일</label>
                        <input 
                            type="email" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="이메일 주소를 입력하세요"
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input 
                            type="password" 
                            id="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn-login">로그인</button>
                    
                    <div className="divider">
                        <span>OR</span>
                    </div>
                    
                    <button type="button" className="btn-kakao" onClick={handleKakaoLogin}>
                        <img src="/images/kakao_login_button.png" alt="카카오 로그인" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;