import { useState, useEffect } from 'react';
import './SessionCompleteStep.css';
import { SessionModal } from '../../ui/Modal/SessionModal';
import apiClient from '../../../services/api/api';

export const SessionCompleteStep = ({ onPrev, sessionData }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [actualInviteLink, setActualInviteLink] = useState('');
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // 순차적 애니메이션을 위한 상태
  const [currentAnimationStep, setCurrentAnimationStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);



  // 애니메이션 시퀀스 관리
  useEffect(() => {
    // 컴포넌트 마운트 시 생성 버튼 애니메이션 시작
    setCurrentAnimationStep(1);
  }, []);

  // 세션 생성 완료 후 복사 버튼 애니메이션
  useEffect(() => {
    if (isCreated && actualInviteLink) {
      setCompletedSteps(prev => [...prev, 1]);
      setCurrentAnimationStep(2);
    }
  }, [isCreated, actualInviteLink]);

  // 링크 복사 완료 후 시작 버튼 애니메이션
  useEffect(() => {
    if (isLinkCopied) {
      setCompletedSteps(prev => [...prev, 2]);
      setCurrentAnimationStep(3);
    }
  }, [isLinkCopied]);

  // 애니메이션 클래스 결정 함수
  const getAnimationClass = (stepNumber, elementType = 'default') => {
    if (completedSteps.includes(stepNumber)) {
      return elementType === 'section' ? 'completed-step' : 'step-completed';
    } else if (currentAnimationStep === stepNumber) {
      return 'animate-step';
    }
    return '';
  };

  // 디버깅을 위해 sessionData 로그 출력
  console.log('SessionCompleteStep received sessionData:', sessionData);

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    return new Date(dateTimeStr).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModuleCount = () => {
    console.log('getModuleCount - sessionData:', sessionData);
    console.log('getModuleCount - layoutConfig:', sessionData?.layoutConfig);
    
    if (!sessionData?.layoutConfig) return 0;
    
    // layoutConfig.modules가 실제 배치 정보인지 확인
    const modules = sessionData.layoutConfig.modules || sessionData.layoutConfig;
    console.log('getModuleCount - modules to count:', modules);
    
    let count = 0;
    Object.values(modules).forEach(moduleList => {
      if (Array.isArray(moduleList)) {
        // 고정 모듈(화상통화) 제외하고 카운트
        const userModules = moduleList.filter(module => !module.isFixed);
        count += userModules.length;
      }
    });
    
    return count;
  };

  const handleCreateSession = async () => {
    setIsCreating(true);
    
    try {
      // 백엔드 API 호출
      console.log('세션 생성 요청 데이터:', sessionData);
      
      // layoutConfig에서 색상 정보만 추출
      const colorsOnly = sessionData?.layoutConfig?.colors || {};
      
      const requestData = {
        name: sessionData?.sessionInfo?.name || 'Untitled Session',
        department: sessionData?.sessionInfo?.department,
        startTime: sessionData?.sessionInfo?.startTime,
        endTime: sessionData?.sessionInfo?.endTime,
        maxParticipants: sessionData?.inviteInfo?.maxParticipants || 4,
        layoutConfig: { colors: colorsOnly },
        inviteEmails: sessionData?.inviteInfo?.emails || []
      };
      
      console.log('API 요청 데이터:', requestData);
      console.log('=== API 요청 상세 ===');
      console.log('layoutConfig:', JSON.stringify(requestData.layoutConfig, null, 2));
      console.log('modules:', requestData.layoutConfig.modules);
      
      const response = await apiClient.post('/api/user/session', requestData);
      const result = response.data;
      
      console.log('API 응답:', result);
      
      if (result.success) {
        setSessionId(result.sessionId);
        setActualInviteLink(result.inviteLink);
        setIsCreated(true);
        
        // 성공 알림
        setModal({
          isOpen: true,
          title: '세션 생성 성공',
          message: '세션이 성공적으로 생성되었습니다!',
          type: 'success'
        });
      } else {
        throw new Error(result.message || '세션 생성에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('세션 생성 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '세션 생성 중 오류가 발생했습니다.';
      setModal({
        isOpen: true,
        title: '세션 생성 실패',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(actualInviteLink);
      setIsLinkCopied(true);
      setModal({
        isOpen: true,
        title: '링크 복사 완료',
        message: '초대 링크가 클립보드에 복사되었습니다!',
        type: 'success'
      });
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = actualInviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsLinkCopied(true);
      setModal({
        isOpen: true,
        title: '링크 복사 완료',
        message: '초대 링크가 클립보드에 복사되었습니다!',
        type: 'success'
      });
    }
  };

  const handleStartSession = () => {
    if (sessionId) {
      // 세션 시작 상태로 변경
      setIsSessionStarted(true);
      
      // 새창에서 세션 화면 열기
      window.open(`/session/${sessionId}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="session-complete-step" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)' }}>
      <div className="step-container" style={{ background: 'white', padding: '40px', borderRadius: '12px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="step-header">
          <h2 className="step-title">
            {isCreated ? '🎉 세션 생성 완료!' : '세션 생성 준비'}
          </h2>
          <p className="step-subtitle">
            {isCreated 
              ? '세션이 성공적으로 생성되었습니다. 이제 참여자들을 초대하고 세션을 시작할 수 있습니다.'
              : '모든 설정이 완료되었습니다. 아래 정보를 확인하고 세션을 생성해주세요.'
            }
          </p>
        </div>

        <div className="complete-content">
          {/* 세션 정보 요약 */}
          <div className="summary-section">
            <h3 className="section-title">📋 세션 정보 요약</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">세션명</span>
                <span className="summary-value">{sessionData?.sessionInfo?.name || '세션명 없음'}</span>
              </div>
              
              {sessionData?.sessionInfo?.department && (
                <div className="summary-item">
                  <span className="summary-label">부서</span>
                  <span className="summary-value">{sessionData.sessionInfo.department}</span>
                </div>
              )}
              
              <div className="summary-item">
                <span className="summary-label">시작 시간</span>
                <span className="summary-value">
                  {formatDateTime(sessionData?.sessionInfo?.startTime) || '시간 미설정'}
                </span>
              </div>
              
              <div className="summary-item">
                <span className="summary-label">종료 시간</span>
                <span className="summary-value">
                  {formatDateTime(sessionData?.sessionInfo?.endTime) || '시간 미설정'}
                </span>
              </div>
              
              <div className="summary-item">
                <span className="summary-label">배치된 모듈</span>
                <span className="summary-value">{getModuleCount()}개</span>
              </div>
              
              <div className="summary-item">
                <span className="summary-label">최대 참여자</span>
                <span className="summary-value">{sessionData?.inviteInfo?.maxParticipants || 4}명</span>
              </div>
            </div>
          </div>

          {/* 초대 링크 (생성 후에만 표시) */}
          {isCreated && actualInviteLink && (
            <div className={`invite-section ${getAnimationClass(2, 'section')}`}>
              <h3 className="section-title">
                🔗 초대 링크 
                <span className="section-subtitle">(미팅 종료시간에서 1시간 후 만료)</span>
              </h3>
              <div className="invite-link-container">
                <div className="invite-link-display">
                  {actualInviteLink}
                </div>
                <button 
                  className={`copy-link-button ${getAnimationClass(2)}`}
                  onClick={handleCopyInviteLink}
                >
                  📋 복사
                </button>
              </div>
              <p className="invite-note">
                이 링크를 참여자들에게 공유하면 세션에 참여할 수 있습니다.
              </p>
            </div>
          )}

          {/* 다음 단계 안내 */}
          <div className="next-steps-section">
            <h3 className="section-title">
              {isCreated ? '🚀 다음 단계' : '📝 생성 후 진행사항'}
            </h3>
            <div className="steps-list">
              <div className={`step-item ${isCreated ? 'completed' : ''}`}>
                <span className="step-icon">{isCreated ? '✅' : '1️⃣'}</span>
                <span className="step-text">세션 생성</span>
              </div>
              <div className={`step-item ${isLinkCopied ? 'completed' : ''}`}>
                <span className="step-icon">{isLinkCopied ? '✅' : '2️⃣'}</span>
                <span className="step-text">참여자들에게 초대 링크 공유</span>
              </div>
              <div className={`step-item ${isSessionStarted ? 'completed' : ''}`}>
                <span className="step-icon">{isSessionStarted ? '✅' : '3️⃣'}</span>
                <span className="step-text">세션 시작 및 진행</span>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="step-actions">
          {!isCreated ? (
            <>
              <button 
                type="button" 
                className="prev-button"
                onClick={onPrev}
                disabled={isCreating}
              >
                <span className="button-icon">◀</span>
                이전 단계
              </button>
              
              <button 
                type="button" 
                className={`create-button ${getAnimationClass(1)}`}
                onClick={handleCreateSession}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    생성 중...
                  </>
                ) : (
                  <>
                    🚀 세션 생성하기
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                className="home-button"
                onClick={handleGoHome}
              >
                🏠 홈으로
              </button>
              
              <button 
                type="button" 
                className={`start-button ${getAnimationClass(3)}`}
                onClick={handleStartSession}
              >
                🎯 세션 시작하기
              </button>
            </>
          )}
        </div>
      </div>
      
      <SessionModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};