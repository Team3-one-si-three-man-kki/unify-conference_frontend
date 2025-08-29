import React, { useState } from 'react';
import axios from 'axios';

const NormalSignUpForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        userName: '',
        tenantName: '',
        email: '',
        password: '',
        passwordConfirm: '',
        subDomain: '',
        agreeTerms: false,
    });
    const [emailChecked, setEmailChecked] = useState(false);
    const [emailAvailability, setEmailAvailability] = useState(null); // 'available', 'unavailable', null
    const [passwordMatch, setPasswordMatch] = useState(true);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // 🔽 이메일 입력값이 변경되면, 기존 중복 확인 상태를 초기화합니다.
        if (name === 'email') {
            setEmailChecked(false);
            setEmailAvailability(null);
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // 비밀번호 확인 실시간 검사
        if (name === 'password' || name === 'passwordConfirm') {
            if (name === 'password') {
                setPasswordMatch(value === formData.passwordConfirm);
            } else { // name === 'passwordConfirm'
                setPasswordMatch(formData.password === value);
            }
        }
    };

    // 이메일 중복 확인 핸들러 (실제 API 호출 로직으로 변경)
    const handleEmailCheck = async () => {
        if (!formData.email) {
            alert('이메일을 입력해주세요.');
            return;
        }
        try {
            // 🔽 실제 백엔드 API 호출
            const response = await axios.post('http://localhost:9093/api/guest/check-email', { email: formData.email });
            
            // 성공 응답 (200 OK)
            alert(response.data.message);
            setEmailAvailability('available');
            setEmailChecked(true);

        } catch (error) {
            // 실패 응답 (409 Conflict 등)
            if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message);
                setEmailAvailability('unavailable');
            } else {
                alert('이메일 확인 중 오류가 발생했습니다.');
            }
            setEmailChecked(true); // 검사는 시도했으므로 true로 설정
            console.error('Email check error:', error);
        }
    };

    // 폼 제출 핸들러
    const handleSubmit = (e) => {
        e.preventDefault();

        // 🔽 이메일 중복 확인 여부를 가장 먼저 검사합니다.
        if (!emailChecked) {
            alert('이메일 중복 확인을 먼저 진행해주세요.');
            return;
        }

        if (emailAvailability !== 'available') {
            alert('사용 가능한 이메일을 입력하고 중복 확인을 해주세요.');
            return;
        }
        
        if (formData.password !== formData.passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (!formData.agreeTerms) {
            alert('개인정보 수집 및 이용에 동의해주세요.');
            return;
        }
        
        // 모든 유효성 검사를 통과하면 부모 컴포넌트로 데이터 전달
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* ... (이름, 이메일, 회사명, 비밀번호 등 다른 폼 그룹은 동일) ... */}
            
            <div className="form-group">
                <label htmlFor="normal_name_input">이름 <span className="required">*</span></label>
                <input id="normal_name_input" type="text" name="userName" value={formData.userName} onChange={handleChange} placeholder="이름을 입력해주세요" required />
            </div>

            <div className="form-group">
                <label htmlFor="normal_email_input">이메일 <span className="required">*</span></label>
                <div className="input-group">
                    <input 
                        id="normal_email_input" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="이메일을 입력해주세요" 
                        required 
                    />
                    <button type="button" className="btn-check" onClick={handleEmailCheck}>중복검사</button>
                </div>
                {/* 🔽 중복 검사 결과에 따른 메시지 표시 */}
                {emailAvailability === 'available' && <p className="success-message">사용 가능한 이메일입니다.</p>}
                {emailAvailability === 'unavailable' && <p className="error-message">이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.</p>}
                <div className="help-text">이메일은 본인 인증에만 사용됩니다.</div>
            </div>

            <div className="form-group">
                <label htmlFor="normal_company_input">회사명 <span className="required">*</span></label>
                <input id="normal_company_input" type="text" name="tenantName" value={formData.tenantName} onChange={handleChange} placeholder="회사명을 입력해주세요" required />
            </div>

            <div className="form-group">
                <label htmlFor="normal_password_input">비밀번호 <span className="required">*</span></label>
                <input id="normal_password_input" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="8자 이상의 비밀번호" minLength="8" required />
                <div className="help-text">영문, 숫자, 특수문자 포함 8자 이상</div>
            </div>

            <div className="form-group">
                <label htmlFor="normal_password_chk_input">비밀번호 확인 <span className="required">*</span></label>
                <input id="normal_password_chk_input" name="passwordConfirm" type="password" value={formData.passwordConfirm} onChange={handleChange} placeholder="비밀번호를 다시 입력해주세요" minLength="8" required />
                {!passwordMatch && formData.passwordConfirm && (
                    <p className="error-message">비밀번호가 일치하지 않습니다.</p>
                )}
            </div>
            
            <div className="form-group">
                <label htmlFor="normal_tenant_input">서브도메인 <span className="required">*</span></label>
                <div className="subdomain-group">
                    <span>www.</span>
                    <input id="normal_tenant_input" type="text" name="subDomain" value={formData.subDomain} onChange={handleChange} placeholder="서비스 URL에 사용될 영문ID" required />
                    <span>.unify-conference.store</span>
                </div>
            </div>
            
            <div className="terms-section">
                {/* ... (약관 내용은 동일) ... */}
                <div className="terms-title">개인정보 수집 및 이용 동의</div>
                <ol className="terms-list">
                    <li>수집하는 개인정보 항목 : 이름, 연락처, 이메일 등</li>
                    <li>개인정보의 수집 및 이용목적 : 회원관리, 서비스 제공, 고객상담</li>
                    <li>개인정보의 보유 및 이용기간 : 회원 탈퇴 시까지</li>
                    <li>동의를 거부할 권리가 있으며, 동의 거부 시 서비스 가입이 제한될 수 있습니다.</li>
                </ol>
                <div className="terms-checkbox">
                    <input type="checkbox" id="chk_agree_html" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} required />
                    <label htmlFor="chk_agree_html">
                        <span className="required">*</span> 개인정보 수집 및 이용약관에 동의합니다.
                    </label>
                </div>
            </div>
            <button type="submit" className="submit-button">회원가입</button>
        </form>
    );
};

export default NormalSignUpForm;