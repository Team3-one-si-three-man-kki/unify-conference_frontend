import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SessionInfoStep } from '../../components/features/session/SessionInfoStep';
import { SessionDesigner } from './SessionDesigner';
import { SessionInviteStep } from '../../components/features/session/SessionInviteStep';
import { SessionCompleteStep } from '../../components/features/session/SessionCompleteStep';
import './SessionCreator.css';

export const SessionCreator = () => {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionData, setSessionData] = useState({
    sessionInfo: null,
    layoutConfig: null,
    inviteInfo: null
  });
  const [templateLayout, setTemplateLayout] = useState(null);

  // 세션 관리에서 전달받은 템플릿 데이터 처리
  useEffect(() => {
    if (location.state?.templateLayout) {
      setTemplateLayout(location.state.templateLayout);
      
      // 템플릿명이 있으면 세션 정보 기본값 설정
      if (location.state.templateName) {
        setSessionData(prev => ({
          ...prev,
          sessionInfo: {
            name: location.state.templateName,
            department: '',
            startTime: '',
            endTime: ''
          }
        }));
      }
    }
  }, [location.state]);

  const handleSessionInfoSubmit = (sessionInfo) => {
    setSessionData(prev => ({ ...prev, sessionInfo }));
    setCurrentStep(2);
  };

  const handleLayoutSubmit = (layoutConfig) => {
    setSessionData(prev => ({ ...prev, layoutConfig }));
    setCurrentStep(3);
  };

  const handleInviteSubmit = (inviteInfo) => {
    setSessionData(prev => ({ ...prev, inviteInfo }));
    setCurrentStep(4);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { number: 1, title: '세션 정보', description: '기본 정보 입력' },
    { number: 2, title: '레이아웃 설계', description: '모듈 배치' },
    { number: 3, title: '초대 설정', description: '참여자 관리' },
    { number: 4, title: '완료', description: '세션 생성' }
  ];

  return (
    <div className="session-creator">
      {/* Progress Bar */}
      <div className="session-creator-header">
        <div className="progress-bar">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`progress-step ${currentStep >= step.number ? 'active' : ''} ${currentStep === step.number ? 'current' : ''}`}
            >
              <div className="step-number">{step.number}</div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                <div className="step-description">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="session-creator-content">
        {currentStep === 1 && (
          <SessionInfoStep 
            onNext={handleSessionInfoSubmit}
            initialData={sessionData.sessionInfo}
          />
        )}
        
        {currentStep === 2 && (
          <div className="layout-step-wrapper">
            <SessionDesigner 
              onNext={handleLayoutSubmit}
              onPrev={handlePrevStep}
              sessionInfo={sessionData.sessionInfo}
              initialLayoutConfig={sessionData.layoutConfig || templateLayout}
            />
          </div>
        )}
        
        {currentStep === 3 && (
          <SessionInviteStep
            onNext={handleInviteSubmit}
            onPrev={handlePrevStep}
            sessionData={sessionData}
          />
        )}
        
        {currentStep === 4 && (
          <SessionCompleteStep
            onPrev={handlePrevStep}
            sessionData={sessionData}
          />
        )}
      </div>
    </div>
  );
};