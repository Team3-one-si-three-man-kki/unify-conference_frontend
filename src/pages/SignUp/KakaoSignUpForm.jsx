import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api/api'; // 🔽 axios 대신 apiClient를 import

const KakaoSignUpForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        userName: '',
        tenantName: '',
        email: '',
        subDomain: '',
    });
    const [isKakaoAuthenticated, setIsKakaoAuthenticated] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        const email = params.get('email');
        const nickname = params.get('nickname');

        if (mode === 'kakao' && email && nickname) {
            setIsKakaoAuthenticated(true);
            setFormData(prev => ({
                ...prev,
                userName: decodeURIComponent(nickname),
                email: decodeURIComponent(email)
            }));
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleKakaoAuth = async () => {
        try {
            // 🔽 axios.get 대신 apiClient.get을 사용합니다.
            const response = await apiClient.get('http://localhost:9093/api/guest/kakao/auth-url?type=signup');
            const { url } = response.data;
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error('Failed to get Kakao auth URL', error);
            alert('카카오 인증을 시작하는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isKakaoAuthenticated) {
            alert('카카오 인증을 먼저 진행해주세요.');
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <div className="help-text">카카오 인증 후 이름과 이메일이 자동으로 입력됩니다. <br/>회사명과 서브도메인을 입력해주세요.</div>
            </div>
            {!isKakaoAuthenticated ? (
                <div className="form-group">
                    <button type="button" className="btn-kakao" onClick={handleKakaoAuth}>카카오 인증하기</button>
                </div>
            ) : (
                <div className="form-group kakao-user-info">
                    ✅ 인증 완료: 이름·이메일이 자동 입력되었습니다.
                </div>
            )}
            <div className="form-group">
                <label htmlFor="kakao_name_input">이름 <span className="required">*</span></label>
                <input id="kakao_name_input" name="userName" type="text" value={formData.userName} readOnly placeholder="카카오 인증 후 자동 입력됩니다" required />
            </div>
            <div className="form-group">
                <label htmlFor="kakao_email_input">이메일 <span className="required">*</span></label>
                <input id="kakao_email_input" name="email" type="email" value={formData.email} readOnly placeholder="카카오 인증 후 자동 입력됩니다" required />
            </div>
            <div className="form-group">
                <label htmlFor="kakao_company_input">회사명 <span className="required">*</span></label>
                <input id="kakao_company_input" name="tenantName" type="text" value={formData.tenantName} onChange={handleChange} placeholder="회사명을 입력해주세요" required />
            </div>
            <div className="form-group">
                <label htmlFor="kakao_tenant_input">서브도메인 <span className="required">*</span></label>
                 <div className="subdomain-group">
                    <span>www.</span>
                    <input id="kakao_tenant_input" name="subDomain" type="text" value={formData.subDomain} onChange={handleChange} placeholder="서비스 URL에 사용될 영문ID" required />
                    <span>.unify-conference.store</span>
                </div>
            </div>
            <button type="submit" className="submit-button">카카오 회원가입</button>
        </form>
    );
};

export default KakaoSignUpForm;