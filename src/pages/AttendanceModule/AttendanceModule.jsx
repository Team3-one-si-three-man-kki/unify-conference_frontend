import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Search, RotateCcw, Download, ArrowLeft, RefreshCw, Users, Clock, UserCheck, UserX } from 'lucide-react';

const AttendanceModule = () => {
  // 상태 관리
  const [sessionList, setSessionList] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('sessionList');
  
  // 검색 조건 상태
  const [searchParams, setSearchParams] = useState({
    scName: '',
    scEmail: '',
    scJoinTime: '',
    scSessionId: '',
    scTenantId: new URLSearchParams(window.location.search).get('tenant') || '',
    pageSize: 9999,
    pageIndex: 1,
    sortOrder: 'DESC'
  });

  // 통계 데이터 상태
  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0,
    leftCount: 0,
    avgMinutes: 0
  });

  // API 기본 설정
  const API_BASE_URL = '/api/attendance';
  
  // 전체 출석 데이터 저장
  const [allAttendanceData, setAllAttendanceData] = useState([]);

  // 커스텀 알림 함수
  const showAlert = useCallback((message) => {
    alert(message);
  }, []);

  // API 호출 함수
  const apiCall = async (endpoint, data = null, method = 'POST') => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      };
      
      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API 호출 오류:', error);
      throw error;
    }
  };

  // 세션 목록 로드
  const loadSessionList = useCallback(async () => {
    if (!searchParams.scTenantId) {
      showAlert("테넌트 정보를 찾을 수 없습니다. URL에 tenant 파라미터를 확인해주세요.");
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        attendanceVo: {
          ...searchParams,
          scSessionId: "",
          scName: "",
          scEmail: "",
          scJoinTime: ""
        }
      };

      const response = await apiCall('/list', requestData);
      
      let allData = [];
      if (response && response.elData && response.elData.attendanceVoList) {
        allData = response.elData.attendanceVoList;
      }

      if (!allData || allData.length === 0) {
        setSessionList([]);
        setAllAttendanceData([]);
        return;
      }

      setAllAttendanceData(allData);

      // 세션별 요약 데이터 생성
      const sessionSummary = allData.reduce((acc, item) => {
        const sessionId = item.sessionId || 'N/A_Session';
        const sessionName = item.sessionName || sessionId;
        
        if (!acc[sessionId]) {
          acc[sessionId] = {
            sessionName: sessionName,
            sessionDept: item.sessionDept || '미지정',
            sessionStartTime: item.sessionStartTime || '',
            participants: [],
            totalMinutes: 0
          };
        } else {
          if (item.sessionDept && !acc[sessionId].sessionDept) {
            acc[sessionId].sessionDept = item.sessionDept;
          }
          if (item.sessionStartTime && !acc[sessionId].sessionStartTime) {
            acc[sessionId].sessionStartTime = item.sessionStartTime;
          }
        }
        
        acc[sessionId].participants.push(item);
        if (item.participationMinutes && !isNaN(item.participationMinutes)) {
          acc[sessionId].totalMinutes += parseInt(item.participationMinutes, 10);
        }
        return acc;
      }, {});

      const summaryListData = Object.keys(sessionSummary).map(id => {
        const summary = sessionSummary[id];
        const participantCount = summary.participants.length;
        const validTimeEntries = summary.participants.filter(p => p.participationMinutes && !isNaN(p.participationMinutes)).length;
        const avgMinutes = validTimeEntries > 0 ? Math.round(summary.totalMinutes / validTimeEntries) : 0;
        
        return {
          sessionId: id,
          sessionName: summary.sessionName,
          sessionDept: summary.sessionDept || '미지정',
          sessionStartTime: summary.sessionStartTime || '미지정',
          participantCount: participantCount,
          avgMinutes: avgMinutes
        };
      });

      setSessionList(summaryListData);
      setCurrentView('sessionList');
    } catch (error) {
      showAlert(`서버에서 데이터를 가져오는데 실패했습니다: ${error.message}`);
      setSessionList([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams.scTenantId, showAlert]);

  // 세션 선택 처리
  const handleSessionClick = (session) => {
    const selectedSessionId = session.sessionId;
    const selectedSessionName = session.sessionName;

    setSearchParams(prev => ({ ...prev, scSessionId: selectedSessionId }));
    setSelectedSession({ id: selectedSessionId, name: selectedSessionName });

    // 선택된 세션의 출석 데이터 필터링
    const sessionDetails = allAttendanceData.filter(
      item => (item.sessionId || 'N/A_Session') === selectedSessionId
    );

    setAttendanceDetails(sessionDetails);
    updateStats(sessionDetails);

    // 검색 조건 초기화
    setSearchParams(prev => ({
      ...prev,
      scName: '',
      scEmail: '',
      scJoinTime: ''
    }));

    setCurrentView('detail');
  };

  // 통계 업데이트
  const updateStats = (data) => {
    const total = data.length;
    let active = 0;
    let totalMinutes = 0;
    let validCount = 0;

    data.forEach(item => {
      if (item.status === "참여중") {
        active++;
      }
      if (item.participationMinutes && !isNaN(item.participationMinutes)) {
        totalMinutes += parseInt(item.participationMinutes, 10);
        validCount++;
      }
    });

    const left = total - active;
    const avgMinutes = validCount > 0 ? Math.round(totalMinutes / validCount) : 0;

    setStats({
      totalCount: total,
      activeCount: active,
      leftCount: left,
      avgMinutes: avgMinutes
    });
  };

  // 상세 검색
  const handleDetailSearch = async () => {
    if (!selectedSession) {
      showAlert("세션이 선택되지 않았습니다.");
      return;
    }

    if (!searchParams.scTenantId) {
      showAlert("테넌트 정보를 찾을 수 없습니다.");
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        attendanceVo: {
          ...searchParams,
          scSessionId: selectedSession.id
        }
      };

      const response = await apiCall('/list', requestData);
      
      let filteredData = [];
      if (response && response.elData && response.elData.attendanceVoList) {
        filteredData = response.elData.attendanceVoList;
      }

      setAttendanceDetails(filteredData);
      updateStats(filteredData);
    } catch (error) {
      showAlert(`검색 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 검색 조건 초기화
  const handleResetSearch = () => {
    setSearchParams(prev => ({
      ...prev,
      scName: '',
      scEmail: '',
      scJoinTime: ''
    }));

    if (selectedSession) {
      const sessionDetails = allAttendanceData.filter(
        item => (item.sessionId || 'N/A_Session') === selectedSession.id
      );
      setAttendanceDetails(sessionDetails);
      updateStats(sessionDetails);
    }

    showAlert("검색 조건이 초기화되었습니다.");
  };

  // 정렬 처리
  const handleSort = (order) => {
    const sortedData = [...attendanceDetails].sort((a, b) => {
      const timeA = new Date(a.joinTime).getTime();
      const timeB = new Date(b.joinTime).getTime();
      return order === 'ASC' ? timeA - timeB : timeB - timeA;
    });
    setAttendanceDetails(sortedData);
  };

  // CSV 다운로드
  const handleCSVDownload = async () => {
    if (attendanceDetails.length === 0) {
      showAlert("다운로드할 데이터가 없습니다.");
      return;
    }

    try {
      // 브라우저에서 CSV 생성
      let csvContent = '\ufeff'; // UTF-8 BOM
      csvContent += '번호,세션ID,참여자명,이메일,접속IP,입장시간,퇴장시간,참여시간(분),상태\n';
      
      attendanceDetails.forEach((row, index) => {
        csvContent += (index + 1) + ',';
        csvContent += '"' + (row.sessionId || '') + '",';
        csvContent += '"' + (row.name || '') + '",';
        csvContent += '"' + (row.email || '') + '",';
        csvContent += '"' + (row.ipAddress || '') + '",';
        csvContent += '"' + (row.joinTime || '') + '",';
        csvContent += '"' + (row.leaveTime || '진행중') + '",';
        csvContent += '"' + (row.participationMinutes || '-') + '",';
        csvContent += '"' + (row.status || '') + '"\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);

      const sessionId = selectedSession?.id?.replace(/[^a-zA-Z0-9]/g, '_') || "선택세션";
      const now = new Date();
      const dateStr = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
      const tenantId = searchParams.scTenantId || "unknown";
      link.setAttribute('download', `출석현황_${tenantId}_${sessionId}_${dateStr}.csv`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showAlert("CSV 파일이 다운로드되었습니다.");
    } catch (error) {
      showAlert(`CSV 다운로드 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 세션 목록으로 돌아가기
  const goBackToSessionList = () => {
    setCurrentView('sessionList');
    setSelectedSession(null);
    setAttendanceDetails([]);
    setStats({ totalCount: 0, activeCount: 0, leftCount: 0, avgMinutes: 0 });
  };

  // 컴포넌트 마운트 시 세션 목록 로드
  useEffect(() => {
    loadSessionList();
  }, [loadSessionList]);

  return (
    <div className="attendance-dashboard">
      {/* 페이지 타이틀 영역 */}
      <div className="page-header">
        <h1 className="page-title">출석 관리 대시보드</h1>
        <div className="breadcrumb">
          <span>Home</span>
          <span>출석 관리</span>
          <span>출석현황</span>
        </div>
      </div>

      {currentView === 'sessionList' ? (
        /* 세션 목록 뷰 */
        <div className="session-list-view">
          {/* 안내 메시지 */}
          <div className="search-box">
            <div className="search-info">
              세션 목록
            </div>
            <p style={{ marginBottom: '15px', color: '#6c757d' }}>
              아래 목록에서 세션을 선택하여 상세 출석현황을 확인하세요.
            </p>
            <div className="search-actions">
              <button
                onClick={loadSessionList}
                disabled={loading}
                className="btn btn-primary"
              >
                <RefreshCw size={16} style={{ marginRight: '5px' }} />
                새로고침
              </button>
            </div>
          </div>

          {/* 세션 목록 테이블 */}
          <div className="content-box">
            {loading ? (
              <div className="loading">
                데이터를 불러오는 중...
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>세션명</th>
                      <th>주관부서</th>
                      <th>시작시간</th>
                      <th className="text-center">참여자 수</th>
                      <th className="text-center">평균 참여시간(분)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionList.map((session, index) => (
                      <tr
                        key={index}
                        onClick={() => handleSessionClick(session)}
                        className="clickable"
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={16} style={{ color: '#3674B5' }} />
                            <span className="session-name">{session.sessionName}</span>
                          </div>
                        </td>
                        <td>{session.sessionDept}</td>
                        <td>{session.sessionStartTime}</td>
                        <td className="text-center">
                          <span style={{ 
                            background: '#e8f5e8', 
                            color: '#2d7d32', 
                            padding: '4px 8px', 
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}>
                            {session.participantCount}명
                          </span>
                        </td>
                        <td className="text-center">
                          <span style={{ 
                            background: '#f3e5f5', 
                            color: '#7b1fa2', 
                            padding: '4px 8px', 
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}>
                            {session.avgMinutes}분
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sessionList.length === 0 && !loading && (
                  <div className="no-data">
                    등록된 세션이 없습니다.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 세션 상세 뷰 */
        <div className="detail-view">
          {/* 뒤로가기 및 세션 정보 */}
          <div className="detail-header">
            <button
              onClick={goBackToSessionList}
              className="btn btn-back"
            >
              <ArrowLeft size={16} style={{ marginRight: '5px' }} />
              세션 목록으로
            </button>
            <div className="selected-session">
              <Calendar size={20} style={{ color: '#3674B5' }} />
              <span className="session-name">{selectedSession?.name}</span>
            </div>
          </div>

          {/* 검색 조건 */}
          <div className="search-box">
            <div className="search-info">검색 조건</div>
            <div className="search-fields">
              <div className="field">
                <label>참여자명</label>
                <input
                  type="text"
                  value={searchParams.scName}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, scName: e.target.value }))}
                  placeholder="참여자명으로 검색"
                />
              </div>
              <div className="field">
                <label>이메일</label>
                <input
                  type="email"
                  value={searchParams.scEmail}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, scEmail: e.target.value }))}
                  placeholder="이메일로 검색"
                />
              </div>
              <div className="field">
                <label>입장일시</label>
                <input
                  type="date"
                  value={searchParams.scJoinTime}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, scJoinTime: e.target.value }))}
                />
              </div>
            </div>
            <div className="search-actions">
              <button
                onClick={handleDetailSearch}
                disabled={loading}
                className="btn btn-primary"
              >
                <Search size={16} style={{ marginRight: '5px' }} />
                검색
              </button>
              <button
                onClick={handleResetSearch}
                className="btn btn-secondary"
              >
                <RotateCcw size={16} style={{ marginRight: '5px' }} />
                초기화
              </button>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="stats-container">
            <div className="stat-card total">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span className="stat-number">{stats.totalCount}</span>
                  <div className="stat-label">총 참여자</div>
                </div>
                <Users size={24} style={{ color: '#3674B5', opacity: 0.7 }} />
              </div>
            </div>
            <div className="stat-card active">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span className="stat-number">{stats.activeCount}</span>
                  <div className="stat-label">현재 참여중</div>
                </div>
                <UserCheck size={24} style={{ color: '#28a745', opacity: 0.7 }} />
              </div>
            </div>
            <div className="stat-card left">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span className="stat-number">{stats.leftCount}</span>
                  <div className="stat-label">퇴장완료</div>
                </div>
                <UserX size={24} style={{ color: '#dc3545', opacity: 0.7 }} />
              </div>
            </div>
            <div className="stat-card avg">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span className="stat-number">{stats.avgMinutes}</span>
                  <div className="stat-label">평균 참여시간(분)</div>
                </div>
                <Clock size={24} style={{ color: '#6f42c1', opacity: 0.7 }} />
              </div>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="action-buttons">
            <button
              onClick={() => handleSort('DESC')}
              className="btn btn-secondary"
            >
              최신순
            </button>
            <button
              onClick={() => handleSort('ASC')}
              className="btn btn-secondary"
            >
              오래된순
            </button>
            <button
              onClick={handleCSVDownload}
              className="btn btn-primary"
            >
              <Download size={16} style={{ marginRight: '5px' }} />
              CSV 다운로드
            </button>
          </div>

          {/* 출석 목록 테이블 */}
          <div className="content-box">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="text-center">번호</th>
                    <th className="text-center">세션ID</th>
                    <th>참여자명</th>
                    <th>이메일</th>
                    <th className="text-center">접속IP</th>
                    <th className="text-center">입장시간</th>
                    <th className="text-center">퇴장시간</th>
                    <th className="text-center">참여시간(분)</th>
                    <th className="text-center">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceDetails.map((item, index) => (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td className="text-center" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {item.sessionId}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            background: '#e3f2fd', 
                            padding: '4px', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Users size={12} style={{ color: '#1976d2' }} />
                          </div>
                          <span className="participant-name">{item.name}</span>
                        </div>
                      </td>
                      <td>{item.email}</td>
                      <td className="text-center" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {item.ipAddress}
                      </td>
                      <td className="text-center">{item.joinTime}</td>
                      <td className="text-center">{item.leaveTime || '진행중'}</td>
                      <td className="text-center">
                        <span className="participation-time">{item.participationMinutes}</span>
                      </td>
                      <td className="text-center">
                        <span className={`status ${item.status === '참여중' ? 'active' : 'left'}`}>
                          {item.status === '참여중' && (
                            <span style={{ 
                              display: 'inline-block', 
                              width: '6px', 
                              height: '6px', 
                              background: '#28a745', 
                              borderRadius: '50%', 
                              marginRight: '5px',
                              animation: 'pulse 2s infinite'
                            }}></span>
                          )}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendanceDetails.length === 0 && (
                <div className="no-data">
                  출석 데이터가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default AttendanceModule;