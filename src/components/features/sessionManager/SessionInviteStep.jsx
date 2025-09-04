import { useState, useEffect } from 'react';
import './SessionInviteStep.css';

export const SessionInviteStep = ({ onNext, onPrev, sessionData }) => {
  const [inviteInfo, setInviteInfo] = useState({
    maxParticipants: 5,
    linkExpiry: ''
  });

  // 순차적 애니메이션을 위한 상태
  const [currentAnimationStep, setCurrentAnimationStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [maxParticipantsTouched, setMaxParticipantsTouched] = useState(false);

  // 애니메이션 시퀀스 관리
  useEffect(() => {
    // 컴포넌트 마운트 시 설명과 다음 버튼 동시 애니메이션 시작
    setCurrentAnimationStep(1.5); // 동시 애니메이션
  }, []);

  useEffect(() => {
    // 만료일 계산 (종료 시간 기준)
    if (sessionData?.sessionInfo?.endTime) {
      const endTime = new Date(sessionData.sessionInfo.endTime);
      const expiry = new Date(endTime.getTime() + 24 * 60 * 60 * 1000); // 종료 후 24시간
      
      setInviteInfo(prev => ({
        ...prev,
        linkExpiry: expiry.toLocaleString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }));
    }
  }, [sessionData]);

  // 최대 참여자 수 변경 감지
  useEffect(() => {
    if ((inviteInfo.maxParticipants !== 5 || maxParticipantsTouched) && !completedSteps.includes(1)) {
      setCompletedSteps(prev => [...prev, 1]);
      setCurrentAnimationStep(0); // 애니메이션 완료
    }
  }, [inviteInfo.maxParticipants, maxParticipantsTouched, completedSteps]);

  // 애니메이션 클래스 결정 함수
  const getAnimationClass = (stepNumber) => {
    if (completedSteps.includes(stepNumber)) {
      return 'completed-step';
    } else if (currentAnimationStep === stepNumber || (currentAnimationStep === 1.5 && stepNumber === 1)) {
      return 'animate-hint';
    }
    return '';
  };

  // 다음 버튼 애니메이션 클래스 결정
  const getNextButtonClass = () => {
    if (currentAnimationStep === 1.5) {
      return 'ready-to-animate';
    }
    return '';
  };

  const handleParticipantChange = (value) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 2 && numValue <= 50) {
      setInviteInfo(prev => ({
        ...prev,
        maxParticipants: numValue
      }));
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // 빈 값이거나 숫자인 경우만 허용 (범위 제한 없음)
    if (value === '' || !isNaN(parseInt(value))) {
      setInviteInfo(prev => ({
        ...prev,
        maxParticipants: value === '' ? '' : parseInt(value)
      }));
      // 최대 참여자 수 상호작용 감지
      setMaxParticipantsTouched(true);
    }
  };

  const handleInputBlur = (e) => {
    const value = e.target.value;
    const numValue = parseInt(value);
    if (value === '' || isNaN(numValue) || numValue < 2) {
      setInviteInfo(prev => ({
        ...prev,
        maxParticipants: 2
      }));
    } else if (numValue > 50) {
      setInviteInfo(prev => ({
        ...prev,
        maxParticipants: 50
      }));
    }
  };

  const handleNext = () => {
    onNext(inviteInfo);
  };

  return (
    <div className="session-invite-step">
      <div className="step-container">
        <div className="step-header">
          <h2 className="step-title">초대 설정</h2>
          <p className="step-subtitle">세션에 참여할 수 있는 최대 인원을 설정해주세요</p>
        </div>

        <div className="invite-content">
          <div className="info-group">
            <h3 className="info-title">링크 만료일</h3>
            <div className="info-display">
              {inviteInfo.linkExpiry || '세션 종료 후 24시간'}
            </div>
            <p className="info-note">
              만료일 이후에는 링크를 통한 접속이 불가능합니다.
            </p>
          </div>

          <div className="info-group">
            <h3 className="info-title">참여 인원 설정</h3>
            <div className="participants-info">
              <div className="participant-input-container">
                <label className="participant-label">최대 참여 인원</label>
                <div className="participant-controls">
                  <button 
                    type="button"
                    className="participant-btn"
                    onClick={() => handleParticipantChange(inviteInfo.maxParticipants - 1)}
                    disabled={inviteInfo.maxParticipants <= 2}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="participant-input"
                    value={inviteInfo.maxParticipants}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    min="2"
                    max="50"
                  />
                  <button 
                    type="button"
                    className="participant-btn"
                    onClick={() => handleParticipantChange(inviteInfo.maxParticipants + 1)}
                    disabled={inviteInfo.maxParticipants >= 50}
                  >
                    +
                  </button>
                  <span className="participant-unit">명</span>
                </div>
              </div>
              <p className={`info-note ${getAnimationClass(1)}`}>
                세션에 참여할 수 있는 최대 인원을 설정해주세요. 설정한 인원만큼 동시에 세션에 참여할 수 있습니다.
              </p>
            </div>
          </div>

        </div>

        <div className="step-actions">
          <button 
            type="button" 
            className="prev-button"
            onClick={onPrev}
          >
            <span className="button-icon">◀</span>
            이전 단계
          </button>
          
          <button 
            type="button" 
            className={`next-button ${getNextButtonClass()}`}
            onClick={handleNext}
          >
            다음 단계
            <span className="button-icon">▶</span>
          </button>
        </div>
      </div>
    </div>
  );
};