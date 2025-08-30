import React, { useState } from 'react';
import apiClient from '../../services/api/api'; // 🔽 axios 대신 apiClient를 import

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
    const [emailAvailability, setEmailAvailability] = useState(null);
    const [passwordMatch, setPasswordMatch] = useState(true);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'email') {
            setEmailChecked(false);
            setEmailAvailability(null);
        }
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (name === 'password' || name === 'passwordConfirm') {
            setPasswordMatch(name === 'password' ? value === formData.passwordConfirm : formData.password === value);
        }
    };

    const handleEmailCheck = async () => {
        if (!formData.email) {
            alert('이메일을 입력해주세요.');
            return;
        }
        try {
            // 🔽 axios.post 대신 apiClient.post를 사용합니다.
            const response = await apiClient.post('/api/guest/check-email', { email: formData.email });
            
            alert(response.data.message);
            setEmailAvailability('available');
            setEmailChecked(true);

        } catch (error) {
            if (error.response?.data?.message) {
                alert(error.response.data.message);
                setEmailAvailability('unavailable');
            } else {
                alert('이메일 확인 중 오류가 발생했습니다.');
            }
            setEmailChecked(true);
            console.error('Email check error:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!emailChecked || emailAvailability !== 'available') {
            alert('이메일 중복 확인을 완료하고 사용 가능한 이메일을 사용해주세요.');
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
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="normal_name_input">이름 <span className="required">*</span></label>
                <input id="normal_name_input" type="text" name="userName" value={formData.userName} onChange={handleChange} placeholder="이름을 입력해주세요" required />
            </div>
            <div className="form-group">
                <label htmlFor="normal_email_input">이메일 <span className="required">*</span></label>
                <div className="input-group">
                    <input id="normal_email_input" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="이메일을 입력해주세요" required />
                    <button type="button" className="btn-check" onClick={handleEmailCheck}>중복검사</button>
                </div>
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
                {!passwordMatch && formData.passwordConfirm && (<p className="error-message">비밀번호가 일치하지 않습니다.</p>)}
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
                <div className="terms-title">개인정보 수집 및 이용 동의</div>
                <ol className="terms-list">
                    <li>수집하는 개인정보 항목 : 이름, 연락처, 이메일 등</li>
                    <li>개인정보의 수집 및 이용목적 : 회원관리, 서비스 제공, 고객상담</li>
                    <li>개인정보의 보유 및 이용기간 : 회원 탈퇴 시까지</li>
                    <li>동의를 거부할 권리가 있으며, 동의 거부 시 서비스 가입이 제한될 수 있습니다.</li>
                </ol>
                <div className="terms-checkbox">
                    <input type="checkbox" id="chk_agree_html" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} required />
                    <label htmlFor="chk_agree_html"><span className="required">*</span> 개인정보 수집 및 이용약관에 동의합니다.</label>
                </div>
            </div>
            <button type="submit" className="submit-button">회원가입</button>
        </form>
    );
};

export default NormalSignUpForm;