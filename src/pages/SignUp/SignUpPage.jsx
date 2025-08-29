import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NormalSignUpForm from './NormalSignUpForm.jsx';
import KakaoSignUpForm from './KakaoSignUpForm.jsx';
import './SignUpStyles.css';

const SignUpPage = () => {
    const [signupType, setSignupType] = useState('normal'); // 'normal' or 'kakao'

    // 카카오 인증 후 리디렉션 처리
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        // 카카오 인증 후 리디렉션된 경우, signupType을 'kakao'로 설정
        if (mode === 'kakao') {
            setSignupType('kakao');
        }
    }, []);

    // 회원가입 타입 변경 핸들러
    const handleTypeChange = (e) => {
        setSignupType(e.target.value);
    };

    // 일반 회원가입 폼 제출 핸들러 (NormalSignUpForm에서 호출)
    const handleNormalSubmit = async (formData) => {
        try {
            const finalFormData = { ...formData, signupType: 'normal' };
            const response = await axios.post('http://localhost:9093/api/guest/signup', finalFormData);
            
            if (response.status === 200) {
                alert('일반 회원가입이 성공적으로 완료되었습니다!');
                // 성공 후 로그인 페이지로 이동 등의 로직 추가
                // window.location.href = '/login';
            }
        } catch (error) {
            // 백엔드에서 보낸 에러 메시지가 있다면 표시, 없다면 기본 메시지 표시
            const errorMessage = error.response?.data?.message || '일반 회원가입 중 오류가 발생했습니다.';
            alert(errorMessage);
            console.error('Normal Signup error:', error);
        }
    };

    // 카카오 회원가입 폼 제출 핸들러 (KakaoSignUpForm에서 호출)
    const handleKakaoSubmit = async (formData) => {
        try {
            const finalFormData = { ...formData, signupType: 'kakao' };
            // 🔽 API 주소를 전체 경로로 수정
            const response = await axios.post('http://localhost:9093/api/guest/signup', finalFormData);

            if (response.status === 200) {
                alert('카카오 회원가입이 성공적으로 완료되었습니다!');
                // window.location.href = '/login';
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || '카카오 회원가입 중 오류가 발생했습니다.';
            alert(errorMessage);
            console.error('Kakao Signup error:', error);
        }
    };

    return (
        <div className="container">
            <h1>회원가입</h1>
            <p className="subtitle">UniCon과 함께 새로운 협업의 시작</p>
            <div className="form-container">
                <div className="form-group type-selector">
                    <label className="type-label">계정유형 <span className="required">*</span></label>
                    <div className="radio-group">
                        <label className={`radio-option ${signupType === 'normal' ? 'active' : ''}`}>
                            <input type="radio" value="normal" checked={signupType === 'normal'} onChange={handleTypeChange} hidden />
                            일반 회원
                        </label>
                        <label className={`radio-option ${signupType === 'kakao' ? 'active' : ''}`}>
                            <input type="radio" value="kakao" checked={signupType === 'kakao'} onChange={handleTypeChange} hidden />
                            카카오 회원
                        </label>
                    </div>
                </div>

                {signupType === 'normal' ? (
                    <NormalSignUpForm onSubmit={handleNormalSubmit} />
                ) : (
                    <KakaoSignUpForm onSubmit={handleKakaoSubmit} />
                )}
            </div>
        </div>
    );
};

export default SignUpPage;