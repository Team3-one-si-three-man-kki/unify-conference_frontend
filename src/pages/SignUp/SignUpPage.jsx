import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api/api'; // 수정된 import 경로
import NormalSignUpForm from './NormalSignUpForm.jsx';
import KakaoSignUpForm from './KakaoSignUpForm.jsx';
import './SignUpStyles.css';

const SignUpPage = () => {
    const [signupType, setSignupType] = useState('normal');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        if (mode === 'kakao') {
            setSignupType('kakao');
        }
    }, []);

    const handleTypeChange = (e) => {
        setSignupType(e.target.value);
    };

    const handleNormalSubmit = async (formData) => {
        try {
            const finalFormData = { ...formData, signupType: 'normal' };
            const response = await apiClient.post('/api/guest/signup', finalFormData);
            if (response.status === 200) {
                alert('일반 회원가입이 성공적으로 완료되었습니다!');
                // window.location.href = '/login';
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || '일반 회원가입 중 오류가 발생했습니다.';
            alert(errorMessage);
            console.error('Normal Signup error:', error);
        }
    };

    const handleKakaoSubmit = async (formData) => {
        try {
            const finalFormData = { ...formData, signupType: 'kakao' };
            const response = await apiClient.post('/api/guest/signup', finalFormData);
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