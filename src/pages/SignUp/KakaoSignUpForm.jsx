import React, { useState, useEffect } from 'react';

const KakaoSignUpForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        userName: '',
        tenantName: '',
        email: '',
        subDomain: '',
    });
    const [isKakaoAuthenticated, setIsKakaoAuthenticated] = useState(false);

    // 카카오 인증 후 리디렉션 처리
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

    // 입력 필드 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // 카카오 인증 페이지로 이동하는 함수
    const handleKakaoAuth = () => {
        // 실제 백엔드 API는 카카오 로그인 URL을 반환해야 합니다.
        window.location.href = 'http://localhost:9093/api/guest/kakao-login'; 
    };

    // 폼 제출 핸들러
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
                {/* 🔽 readOnly 속성을 항상 true로 변경 */}
                <input id="kakao_name_input" name="userName" type="text" value={formData.userName} readOnly placeholder="카카오 인증 후 자동 입력됩니다" required />
            </div>

            <div className="form-group">
                <label htmlFor="kakao_email_input">이메일 <span className="required">*</span></label>
                {/* 🔽 readOnly 속성을 항상 true로 변경 */}
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