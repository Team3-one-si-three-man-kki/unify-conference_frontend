import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionDesigner } from '../../../pages/session/SessionDesigner';
import apiClient from '../../../services/api/api';
import './SessionManager.css';

export const SessionManager = () => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionModules, setSessionModules] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tenantModules, setTenantModules] = useState([]);
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 세션 리스트 및 테넌트 모듈 로드
  useEffect(() => {
    loadSessions();
    loadTenantModules();
  }, []);

  // 테넌트 모듈 데이터 로드
  const loadTenantModules = async () => {
    try {
      const response = await apiClient.get('/api/user/tenant_module');
      setTenantModules(response.data);
    } catch (error) {
      console.error('테넌트 모듈 로드 실패:', error);
    }
  };

  const loadSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/user/session/list');
      setSessions(response.data);
    } catch (error) {
      console.error('세션 리스트 로드 실패:', error);
      setError('세션 리스트를 불러오는데 실패했습니다.');
      // 에러 시 기본 Mock 데이터 사용
      setSessions(mockSessions);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock 데이터 (API 실패 시 fallback)
  const mockSessions = [
    {
      sessionId: 1,
      name: '팀 회의 세션',
      startTime: '2025-01-15T10:00',
      endTime: '2025-01-15T11:00',
      maxParticipant: 8,
      createdBy: 1,
      tenantId: 1
    },
    {
      sessionId: 2,
      name: '고객사 프레젠테이션',
      startTime: '2025-01-16T14:00',
      endTime: '2025-01-16T15:30',
      maxParticipant: 12,
      createdBy: 1,
      tenantId: 1
    },
    {
      sessionId: 3,
      name: '월간 전체 회의',
      startTime: '2025-01-20T09:00',
      endTime: '2025-01-20T10:30',
      maxParticipant: 25,
      createdBy: 1,
      tenantId: 1
    }
  ];

  const handleSessionSelect = async (session) => {
    setSelectedSession(session);
    
    // 이미 불러온 모듈이 있다면 다시 불러오지 않음
    if (sessionModules[session.sessionId]) {
      return;
    }

    // 세션 모듈 불러오기
    try {
      const response = await apiClient.get(`/api/user/session-module/session/${session.sessionId}`);
      setSessionModules(prev => ({
        ...prev,
        [session.sessionId]: response.data
      }));
    } catch (error) {
      console.error('세션 모듈 로드 실패:', error);
      // 모듈 로드 실패 시에도 세션은 선택된 상태로 유지
    }
  };

  const handleCreateWithLayout = () => {
    if (selectedSession && sessionModules[selectedSession.sessionId]) {
      // 선택된 세션의 모듈 배치를 세션 생성 페이지로 전달
      const modules = sessionModules[selectedSession.sessionId];
      const layoutConfig = convertModulesToLayoutConfig(modules);
      
      navigate('/meeting', {
        state: {
          templateLayout: layoutConfig,
          templateName: `${selectedSession.name} (복사본)`
        }
      });
    }
  };

  // 현재 테넌트 모듈에서 최신 아이콘 정보를 가져오는 함수
  const getCurrentModuleIcon = (moduleCode) => {
    if (tenantModules.length === 0) {
      return getModuleIcon(moduleCode); // fallback
    }
    
    const currentModule = tenantModules.find(m => m.code === moduleCode);
    return currentModule?.icon || getModuleIcon(moduleCode);
  };

  // 백엔드 모듈 데이터를 프론트엔드 레이아웃 구성으로 변환
  const convertModulesToLayoutConfig = (modules) => {
    const layoutConfig = { 
      modules: {
        // 메인 영역에 화상회의 모듈 고정
        main_video: [{
          id: 'video-call',
          name: '화상통화',
          icon: '📹',
          isFixed: true
        }],
        // 모든 모듈을 바 형태 영역에 순서대로 배치
        bottom_modules: modules.map(module => ({
          id: module.moduleCode,
          name: module.moduleName || getModuleName(module.moduleCode),
          icon: getCurrentModuleIcon(module.moduleCode), // 현재 테넌트 모듈의 최신 아이콘 사용
          isFixed: false
        }))
      }
    };
    
    return layoutConfig;
  };

  // 모듈 코드에 따른 이름 매핑
  const getModuleName = (moduleCode) => {
    const nameMap = {
      'CHAT': '채팅',
      'CANVAS': '캔버스', 
      'QUIZ': '퀴즈',
      'FACEAI': '집중도체크AI',
      'SCREEN': '화면공유'
    };
    return nameMap[moduleCode] || '알 수 없는 모듈';
  };


  // 모듈 코드에 따른 아이콘 매핑
  const getModuleIcon = (moduleCode) => {
    const iconMap = {
      'CHAT': '💬',
      'CANVAS': '🎨', 
      'QUIZ': '📝',
      'FACEAI': '🤖',
      'SCREEN': '🖥️'
    };
    return iconMap[moduleCode] || '📦';
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    return new Date(dateTimeStr).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionStatus = (session) => {
    if (!session.startTime || !session.endTime) {
      return { text: '시간 미정', className: 'status-unknown' };
    }

    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);

    if (now < startTime) {
      return { text: '예정', className: 'status-scheduled' };
    } else if (now >= startTime && now <= endTime) {
      return { text: '진행중', className: 'status-active' };
    } else {
      return { text: '완료', className: 'status-completed' };
    }
  };

  return (
    <div className="session-manager">
      <div className="session-manager-header">
        <h2 className="manager-title">세션 관리</h2>
        <p className="manager-subtitle">생성된 세션들을 관리하고 레이아웃을 확인할 수 있습니다</p>
        {error && <div className="error-message">⚠️ {error}</div>}
      </div>

      <div className="session-manager-content">
        {/* 왼쪽: 세션 리스트 */}
        <div className="session-list-panel">
          <div className="panel-header">
            <h3 className="panel-title">세션 목록</h3>
            <div className="panel-header-right">
              <span className="session-count">{sessions.length}개</span>
              {isLoading && <span className="loading-indicator">로딩중...</span>}
            </div>
          </div>
          
          <div className="session-list">
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className={`session-item ${selectedSession?.sessionId === session.sessionId ? 'selected' : ''}`}
                onClick={() => handleSessionSelect(session)}
              >
                <div className="session-item-header">
                  <h4 className="session-name">{session.name}</h4>
                  <span className={`status-badge ${getSessionStatus(session).className}`}>
                    {getSessionStatus(session).text}
                  </span>
                </div>
                
                <div className="session-info">
                  <div className="session-meta">
                    <span className="session-participants">최대 {session.maxParticipant}명</span>
                    <span className="session-id">ID: {session.sessionId}</span>
                  </div>
                  
                  <div className="session-time">
                    <span className="time-info">
                      {formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 레이아웃 디자이너 */}
        <div className="layout-preview-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              {selectedSession ? `레이아웃 미리보기 - ${selectedSession.name}` : '레이아웃 미리보기'}
            </h3>
            <div className="panel-header-right">
              {selectedSession && sessionModules[selectedSession.sessionId] && (
                <span className="module-count">
                  {sessionModules[selectedSession.sessionId].length}개 모듈 배치됨
                </span>
              )}
              {selectedSession && sessionModules[selectedSession.sessionId] && (
                <button 
                  className="create-with-layout-btn"
                  onClick={handleCreateWithLayout}
                  title="이 레이아웃으로 새 세션 생성"
                >
                  <span className="btn-icon">🚀</span>
                  이 레이아웃으로 세션 생성
                </button>
              )}
            </div>
          </div>
          
          <div className="layout-preview">
            {selectedSession ? (
              sessionModules[selectedSession.sessionId] ? (
                <SessionDesigner 
                  sessionInfo={selectedSession}
                  initialLayoutConfig={convertModulesToLayoutConfig(sessionModules[selectedSession.sessionId])}
                  readOnly={true}
                />
              ) : (
                <div className="loading-modules">
                  <div className="loading-icon">⏳</div>
                  <h3>모듈 정보를 불러오는 중...</h3>
                  <p>잠시만 기다려주세요</p>
                </div>
              )
            ) : (
              <div className="no-session-selected">
                <div className="no-session-icon">🎯</div>
                <h3>세션을 선택해주세요</h3>
                <p>왼쪽 목록에서 세션을 선택하면<br />해당 세션의 레이아웃을 확인할 수 있습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};