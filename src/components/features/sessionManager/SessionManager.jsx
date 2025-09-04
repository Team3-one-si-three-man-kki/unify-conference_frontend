import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionDesigner } from '../../../pages/session/SessionDesigner';
import './SessionManager.css';

export const SessionManager = () => {
  const [selectedSession, setSelectedSession] = useState(null);
  const navigate = useNavigate();
  
  // 임시 세션 데이터
  const [sessions] = useState([
    {
      id: 1,
      name: '팀 회의 세션',
      department: '개발팀',
      startTime: '2025-01-15T10:00',
      endTime: '2025-01-15T11:00',
      maxParticipants: 8,
      status: 'completed',
      createdAt: '2025-01-14T15:30',
      layoutConfig: {
        modules: {
          main_video: [{
            id: 'video-call',
            name: '화상통화',
            description: '기본 화상통화 기능',
            icon: '📹',
            isFixed: true
          }],
          bottom_1: [{
            id: 'chat',
            name: '채팅',
            description: '실시간 채팅 기능',
            icon: '💬'
          }],
          bottom_2: [{
            id: 'screen-share',
            name: '화면공유',
            description: '화면 공유 기능',
            icon: '🖥️'
          }]
        }
      }
    },
    {
      id: 2,
      name: '고객사 프레젠테이션',
      department: '영업팀',
      startTime: '2025-01-16T14:00',
      endTime: '2025-01-16T15:30',
      maxParticipants: 12,
      status: 'scheduled',
      createdAt: '2025-01-15T09:15',
      layoutConfig: {
        modules: {
          main_video: [{
            id: 'video-call',
            name: '화상통화',
            description: '기본 화상통화 기능',
            icon: '📹',
            isFixed: true
          }],
          bottom_1: [{
            id: 'screen-share',
            name: '화면공유',
            description: '화면 공유 기능',
            icon: '🖥️'
          }],
          bottom_2: [{
            id: 'canvas',
            name: '캔버스',
            description: '화이트보드 기능',
            icon: '🎨'
          }],
          bottom_3: [{
            id: 'file-share',
            name: '파일공유',
            description: '파일 업로드/다운로드',
            icon: '📎'
          }]
        }
      }
    },
    {
      id: 3,
      name: '월간 전체 회의',
      department: '전체',
      startTime: '2025-01-20T09:00',
      endTime: '2025-01-20T10:30',
      maxParticipants: 25,
      status: 'scheduled',
      createdAt: '2025-01-10T16:45',
      layoutConfig: {
        modules: {
          main_video: [{
            id: 'video-call',
            name: '화상통화',
            description: '기본 화상통화 기능',
            icon: '📹',
            isFixed: true
          }],
          bottom_1: [{
            id: 'chat',
            name: '채팅',
            description: '실시간 채팅 기능',
            icon: '💬'
          }],
          bottom_2: [{
            id: 'attendance',
            name: '출석체크',
            description: '자동 출석 체크 기능',
            icon: '✅'
          }],
          bottom_3: [{
            id: 'drowsiness-ai',
            name: '졸음감지 AI',
            description: 'AI 기반 집중도 모니터링',
            icon: '😴'
          }]
        }
      }
    }
  ]);

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
  };

  const handleCreateWithLayout = () => {
    if (selectedSession) {
      // 선택된 세션의 레이아웃 구성을 세션 생성 페이지로 전달
      navigate('/meeting', {
        state: {
          templateLayout: selectedSession.layoutConfig,
          templateName: `${selectedSession.name} (복사본)`
        }
      });
    }
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { text: '완료', className: 'status-completed' };
      case 'scheduled':
        return { text: '예정', className: 'status-scheduled' };
      case 'active':
        return { text: '진행중', className: 'status-active' };
      default:
        return { text: '알 수 없음', className: 'status-unknown' };
    }
  };

  return (
    <div className="session-manager">
      <div className="session-manager-header">
        <h2 className="manager-title">세션 관리</h2>
        <p className="manager-subtitle">생성된 세션들을 관리하고 레이아웃을 확인할 수 있습니다</p>
      </div>

      <div className="session-manager-content">
        {/* 왼쪽: 세션 리스트 */}
        <div className="session-list-panel">
          <div className="panel-header">
            <h3 className="panel-title">세션 목록</h3>
            <span className="session-count">{sessions.length}개</span>
          </div>
          
          <div className="session-list">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`session-item ${selectedSession?.id === session.id ? 'selected' : ''}`}
                onClick={() => handleSessionSelect(session)}
              >
                <div className="session-item-header">
                  <h4 className="session-name">{session.name}</h4>
                  <span className={`status-badge ${getStatusBadge(session.status).className}`}>
                    {getStatusBadge(session.status).text}
                  </span>
                </div>
                
                <div className="session-info">
                  <div className="session-meta">
                    <span className="session-department">{session.department}</span>
                    <span className="session-participants">최대 {session.maxParticipants}명</span>
                  </div>
                  
                  <div className="session-time">
                    <span className="time-info">
                      {formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}
                    </span>
                  </div>
                  
                  <div className="session-created">
                    <span className="created-info">생성: {formatDateTime(session.createdAt)}</span>
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
              {/* {'레이아웃 미리보기'} */}
            </h3>
            <div className="panel-header-right">
              {selectedSession && (
                <span className="module-count">
                  {Object.values(selectedSession.layoutConfig?.modules || {})
                    .flat()
                    .filter(module => !module.isFixed).length}개 모듈 배치됨
                </span>
              )}
              {selectedSession && (
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
              <SessionDesigner 
                sessionInfo={selectedSession}
                initialLayoutConfig={selectedSession.layoutConfig}
                readOnly={true}
              />
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