import { useState, useEffect } from 'react';
import './SessionInfoStep.css';

export const SessionInfoStep = ({ onNext, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || 'OOO의 미팅룸',
    department: initialData?.department || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || ''
  });

  // 날짜와 시간을 분리해서 관리
  const [selectedDate, setSelectedDate] = useState(initialData?.startTime ? initialData.startTime.split('T')[0] : '');
  const [selectedHour, setSelectedHour] = useState(initialData?.startTime ? new Date(initialData.startTime).getHours() : '');
  const [selectedMinute, setSelectedMinute] = useState(initialData?.startTime ? new Date(initialData.startTime).getMinutes() : '');

  const [errors, setErrors] = useState({});
  
  // 순차적 애니메이션을 위한 상태
  const [currentAnimationStep, setCurrentAnimationStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [sessionNameTouched, setSessionNameTouched] = useState(false);
  const [startTimeInteracted, setStartTimeInteracted] = useState(false);
  const [showDurationAnimation, setShowDurationAnimation] = useState(false);

  // 애니메이션 시퀀스 관리
  useEffect(() => {
    // 컴포넌트 마운트 시 설명과 시작시간 동시 애니메이션 시작
    setCurrentAnimationStep(1.5); // 설명과 시작시간 동시 애니메이션
  }, []);

  // 세션명 변경 감지 (설명 애니메이션 끄기용)
  useEffect(() => {
    if ((formData.name !== 'OOO의 미팅룸' || sessionNameTouched) && !completedSteps.includes(1)) {
      setCompletedSteps(prev => [...prev, 1]);
    }
  }, [formData.name, sessionNameTouched, completedSteps]);

  useEffect(() => {
    // 2단계: 시작 시간 입력 체크
    if (formData.startTime && !completedSteps.includes(2)) {
      setCompletedSteps(prev => [...prev, 2]);
      // 시작시간 입력 완료 시 duration 버튼 애니메이션 시작
      setTimeout(() => {
        setShowDurationAnimation(true);
      }, 500);
      setTimeout(() => setCurrentAnimationStep(3), 500);
    }
  }, [formData.startTime, completedSteps]);

  // 시작시간 상호작용 감지 (클릭이나 포커스 시)
  const handleStartTimeInteraction = () => {
    if (!startTimeInteracted) {
      setStartTimeInteracted(true);
      // 설명 애니메이션만 완료 처리 (시작시간 애니메이션은 계속)
      setCompletedSteps(prev => {
        if (!prev.includes(1)) {
          return [...prev, 1];
        }
        return prev;
      });
      setCurrentAnimationStep(2); // 시작시간만 애니메이션
    }
  };

  useEffect(() => {
    // 3단계: 종료 시간 설정 체크
    if (formData.startTime && formData.endTime && !completedSteps.includes(3)) {
      setCompletedSteps(prev => [...prev, 3]);
      setTimeout(() => setCurrentAnimationStep(4), 500);
    }
  }, [formData.startTime, formData.endTime, completedSteps]);

  // 애니메이션 클래스 결정 함수
  const getAnimationClass = (stepNumber) => {
    if (completedSteps.includes(stepNumber)) {
      return 'completed-step';
    } else if (currentAnimationStep === stepNumber) {
      return stepNumber === 1 ? 'animate-hint' : 'animate-step';
    } else if (currentAnimationStep === 1.5 && (stepNumber === 1 || stepNumber === 2)) {
      // 설명과 시작시간 동시 애니메이션
      return stepNumber === 1 ? 'animate-hint' : 'animate-step';
    }
    return '';
  };

  // 다음 버튼 애니메이션 클래스 결정
  const getNextButtonClass = () => {
    if (formData.startTime && formData.endTime && currentAnimationStep === 4) {
      return 'ready-to-animate';
    }
    return '';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 클리어
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.startTime) {
      newErrors.startTime = '시작 시간을 선택해주세요.';
    }

    if (!formData.endTime) {
      newErrors.endTime = '종료 시간을 선택해주세요.';
    } else if (formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = '종료 시간은 시작 시간보다 늦어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // 세션 이름이 비어있으면 자동 생성
      const sessionName = formData.name.trim() || 'OOO의 회의룸';
        
      onNext({
        name: sessionName,
        department: '',
        startTime: formData.startTime,
        endTime: formData.endTime
      });
    }
  };

  const formatDateTimeLocal = (date) => {
    if (!date) return '';
    // 로컬 시간대를 고려한 포맷팅
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return formatDateTimeLocal(now);
  };

  const roundToNearestHalfHour = (date) => {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 30) * 30;
    const roundedDate = new Date(date);
    roundedDate.setMinutes(roundedMinutes, 0, 0);
    return roundedDate;
  };

  const generateHourOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      options.push({ 
        value: hour, 
        label: `${hour.toString().padStart(2, '0')}시` 
      });
    }
    return options;
  };

  const generateMinuteOptions = () => {
    const options = [];
    for (let minute = 0; minute < 60; minute += 30) {
      options.push({ 
        value: minute, 
        label: `${minute.toString().padStart(2, '0')}분` 
      });
    }
    return options;
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleDateChange = (date) => {
    console.log('Date changed:', date);
    setSelectedDate(date);
    
    if (!date) {
      setSelectedHour('');
      setSelectedMinute('');
      handleInputChange('startTime', '');
      handleInputChange('endTime', '');
      return;
    }
    
    // 날짜가 변경되었을 때 시간이 이미 선택되어 있으면 업데이트
    if (selectedHour !== '' && selectedMinute !== '') {
      updateDateTime(date, selectedHour, selectedMinute);
    }
  };

  const handleHourChange = (hour) => {
    console.log('Hour changed:', hour);
    setSelectedHour(hour);
    
    if (!selectedDate) {
      return;
    }
    
    if (hour === '' || selectedMinute === '') {
      handleInputChange('startTime', '');
      handleInputChange('endTime', '');
      return;
    }
    
    updateDateTime(selectedDate, hour, selectedMinute);
  };

  const handleMinuteChange = (minute) => {
    console.log('Minute changed:', minute);
    setSelectedMinute(minute);
    
    if (!selectedDate) {
      return;
    }
    
    if (selectedHour === '' || minute === '') {
      handleInputChange('startTime', '');
      handleInputChange('endTime', '');
      return;
    }
    
    updateDateTime(selectedDate, selectedHour, minute);
  };

  const updateDateTime = (date, hour, minute) => {
    if (!date || hour === '' || minute === '') return;
    
    const dateTime = new Date(date);
    dateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
    
    console.log('Generated dateTime:', dateTime);
    
    const formattedDateTime = formatDateTimeLocal(dateTime);
    console.log('Formatted dateTime:', formattedDateTime);
    
    handleInputChange('startTime', formattedDateTime);
    
    // 종료 시간이 없으면 시작 시간만 설정
    if (!formData.endTime) {
      handleInputChange('endTime', '');
    }
  };

  const getDateFromDateTime = (dateTimeString) => {
    return dateTimeString ? dateTimeString.split('T')[0] : '';
  };

  const getTimeFromDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getDefaultEndTime = () => {
    if (!formData.startTime) return '';
    const start = new Date(formData.startTime);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2시간 후
    return formatDateTimeLocal(end);
  };

  const getDurationInMinutes = () => {
    if (!formData.startTime || !formData.endTime) {
      console.log('Duration calculation: missing start or end time', { 
        startTime: formData.startTime, 
        endTime: formData.endTime 
      });
      return 0;
    }
    
    // 로컬 시간으로 올바르게 파싱
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    const result = Math.max(0, Math.round(duration));
    
    console.log('Duration calculation:', { 
      startTime: formData.startTime,
      endTime: formData.endTime,
      start: start.toString(), 
      end: end.toString(), 
      duration: duration, 
      result: result 
    });
    return result;
  };

  const formatDuration = (minutes) => {
    const totalMinutes = Math.round(minutes); // 소수점 반올림
    console.log('formatDuration called with:', { minutes, totalMinutes });
    
    if (totalMinutes < 60) {
      return `${totalMinutes}분`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}시간`;
    }
    return `${hours}시간 ${remainingMinutes}분`;
  };

  const addDuration = (minutesToAdd) => {
    if (!selectedDate || selectedHour === '' || selectedMinute === '') return;
    
    // duration 버튼 클릭 시 애니메이션 끄기
    setShowDurationAnimation(false);
    
    const start = new Date(selectedDate);
    start.setHours(parseInt(selectedHour), parseInt(selectedMinute), 0, 0);
    
    let end;
    if (formData.endTime) {
      // 이미 종료 시간이 설정되어 있으면 그 시간에 추가
      end = new Date(formData.endTime);
      end = new Date(end.getTime() + minutesToAdd * 60 * 1000);
      console.log('Adding duration to existing end time:', {
        existingEnd: formData.endTime,
        minutesToAdd: minutesToAdd,
        newEnd: end.toISOString()
      });
    } else {
      // 종료 시간이 없으면 시작 시간에서 추가
      end = new Date(start.getTime() + minutesToAdd * 60 * 1000);
      console.log('Setting initial duration from start time:', {
        start: start.toISOString(),
        minutesToAdd: minutesToAdd,
        end: end.toISOString()
      });
    }
    
    const formattedEnd = formatDateTimeLocal(end);
    console.log('Setting endTime to:', formattedEnd);
    handleInputChange('endTime', formattedEnd);
    
    // 종료시간이 설정되면 3단계 완료 처리
    if (!completedSteps.includes(3)) {
      setTimeout(() => {
        setCompletedSteps(prev => [...prev, 3]);
        setCurrentAnimationStep(4); // 다음 버튼 애니메이션
      }, 100);
    }
  };

  const resetDuration = () => {
    handleInputChange('endTime', '');
    // 초기화 시 3단계 완료 상태 제거
    setCompletedSteps(prev => prev.filter(step => step !== 3));
    setCurrentAnimationStep(3); // 종료시간 입력 단계로 돌아가기
  };

  return (
    <div className="session-info-step">
      <div className="step-container">
        <div className="step-header">
          <h2 className="step-title">세션 기본 정보</h2>
          <p className="step-subtitle">새로운 세션을 만들기 위한 기본 정보를 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="session-form">
          <div className={`form-group ${getAnimationClass(1)}`}>
            <label className="form-label">
              세션 이름
            </label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''} ${completedSteps.includes(1) ? 'completed-input' : ''}`}
              placeholder="세션 이름을 입력해주세요"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={() => setSessionNameTouched(true)}
              maxLength={100}
            />
            <p className="form-hint">
              세션 이름을 입력하지 않을 시, 'OOO의 회의룸'으로 자동 생성됩니다
            </p>
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>


          <div className={`form-group ${getAnimationClass(2)}`}>
            <label className="form-label required">
              시작 시간
            </label>
            <div className="integrated-datetime-selector">
              <div className="datetime-input-group">
                <div className="date-input-section">
                  <input
                    type="date"
                    className={`datetime-input date-part ${errors.startTime ? 'error' : ''}`}
                    value={selectedDate}
                    min={getTodayDate()}
                    onChange={(e) => handleDateChange(e.target.value)}
                    onFocus={handleStartTimeInteraction}
                    onClick={handleStartTimeInteraction}
                    placeholder="날짜"
                  />
                </div>
                <div className="time-input-section">
                  <select
                    className={`datetime-input hour-part ${errors.startTime ? 'error' : ''}`}
                    value={selectedHour}
                    onChange={(e) => handleHourChange(e.target.value)}
                    onFocus={handleStartTimeInteraction}
                    onClick={handleStartTimeInteraction}
                    disabled={!selectedDate}
                  >
                    <option value="">시</option>
                    {generateHourOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="datetime-separator">:</span>
                  <select
                    className={`datetime-input minute-part ${errors.startTime ? 'error' : ''}`}
                    value={selectedMinute}
                    onChange={(e) => handleMinuteChange(e.target.value)}
                    onFocus={handleStartTimeInteraction}
                    onClick={handleStartTimeInteraction}
                    disabled={!selectedDate || selectedHour === ''}
                  >
                    <option value="">분</option>
                    {generateMinuteOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {errors.startTime && <span className="error-message">{errors.startTime}</span>}
          </div>

          {formData.startTime && (
            <div className="duration-control">
              <p className={`duration-guide ${showDurationAnimation ? 'animate-duration-guide' : ''}`}>
                미팅을 진행할 시간을 선택하세요. + 시간은 누적됩니다.
              </p>
              <div className="duration-preset-buttons">
                <button
                  type="button"
                  className={`duration-preset-btn ${showDurationAnimation ? 'animate-duration' : ''}`}
                  onClick={() => addDuration(30)}
                >
                  +30분
                </button>
                <button
                  type="button"
                  className={`duration-preset-btn ${showDurationAnimation ? 'animate-duration' : ''}`}
                  onClick={() => addDuration(60)}
                >
                  +1시간
                </button>
                <button
                  type="button"
                  className={`duration-preset-btn ${showDurationAnimation ? 'animate-duration' : ''}`}
                  onClick={() => addDuration(120)}
                >
                  +2시간
                </button>
                <button
                  type="button"
                  className={`duration-preset-btn ${showDurationAnimation ? 'animate-duration' : ''}`}
                  onClick={() => addDuration(180)}
                >
                  +3시간
                </button>
                <button
                  type="button"
                  className="duration-reset-btn"
                  onClick={resetDuration}
                >
                  초기화
                </button>
              </div>
              {formData.startTime && formData.endTime && (
                <div className="current-duration">
                  현재: {formatDuration(getDurationInMinutes())}
                </div>
              )}
            </div>
          )}

          <div className={`form-group ${getAnimationClass(3)}`}>
            <label className="form-label required">
              종료 시간
            </label>
            <div className="readonly-time-display">
              {formData.endTime ? 
                (() => {
                  const date = new Date(formData.endTime);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  return (
                    <span>
                      <span className="date-part">{year}-{month}-{day}</span>
                      <span className="time-part">{hours}:{minutes}</span>
                    </span>
                  );
                })()
                : '시작 시간을 먼저 선택해주세요'
              }
            </div>
            {errors.endTime && <span className="error-message">{errors.endTime}</span>}
          </div>

          {formData.startTime && formData.endTime && (
            <div className="form-actions">
              <button type="submit" className={`next-button ${getNextButtonClass()}`}>
                다음 단계
                <span className="button-icon">▶</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};