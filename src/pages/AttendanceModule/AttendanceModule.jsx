import React, { useState, useEffect, useCallback } from 'react';
import './AttendanceModule.css';

const AttendanceModule = () => {
  // State 관리
  const [currentView, setCurrentView] = useState('sessionList');
  const [allAttendanceData, setAllAttendanceData] = useState([]);
  const [sessionSummaryList, setSessionSummaryList] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [selectedSession, setSelectedSession] = useState({ id: '', name: '' });
  
  // 검색 필터 상태
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    email: '',
    joinTime: '',
    sortOrder: 'DESC'
  });

  // 통계 데이터 상태
  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0,
    leftCount: 0,
    avgMinutes: 0
  });

  // 모달 상태
  const [modal, setModal] = useState({
    show: false,
    message: '',
    isConfirm: false,
    callback: null
  });

  const [loading, setLoading] = useState(false);

  const getTenantId = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tenant');
  }, []);

  // 팝업 표시 함수
  const showPopup = useCallback((message, isConfirm = false, callback = null) => {
    setModal({
      show: true,
      message,
      isConfirm,
      callback
    });
  }, []);

  // 팝업 닫기 함수
  const closeModal = useCallback((confirmed = false) => {
    if (modal.callback) {
      modal.callback(confirmed);
    }
    setModal({ show: false, message: '', isConfirm: false, callback: null });
  }, [modal.callback]);

  // API 호출을 위한 공통 함수
  const makeApiCall = useCallback(async (searchOptions) => {
    try {
      const response = await fetch('/InsWebApp/AttendanceList.pwkjson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(searchOptions),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      let resultData = [];
      if (data?.elData?.attendanceVoList) {
        resultData = data.elData.attendanceVoList;
      } else if (data?.attendanceListVo?.attendanceVoList) {
        resultData = data.attendanceListVo.attendanceVoList;
      }

      return resultData;
    } catch (error) {
      throw new Error(`API 호출 실패: ${error.message}`);
    }
  }, []);

  // 세션 목록 로드
  const loadSessionList = useCallback(async () => {
    const tenantId = getTenantId();
    
    if (!tenantId) {
      showPopup('테넌트 정보를 찾을 수 없습니다. URL에 tenant 파라미터를 확인해주세요.');
      return;
    }

    setLoading(true);

    try {
      const searchOptions = {
        attendanceVo: {
          scTenantId: tenantId,
          scSessionId: '',
          scName: '',
          scEmail: '',
          scJoinTime: '',
          pageSize: '9999',
          pageIndex: '1',
          sortOrder: 'DESC'
        }
      };

      const allData = await makeApiCall(searchOptions);

      if (!allData || allData.length === 0) {
        setSessionSummaryList([]);
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

      setSessionSummaryList(summaryListData);
      setCurrentView('sessionList');

    } catch (error) {
      showPopup(`서버에서 데이터를 가져오는데 실패했습니다: ${error.message}`);
      setSessionSummaryList([]);
    } finally {
      setLoading(false);
    }
  }, [getTenantId, showPopup, makeApiCall]);

  // 세션 선택 처리
  const handleSessionClick = useCallback((session) => {
    const selectedSessionId = session.sessionId;
    if (!selectedSessionId) return;

    const selectedSessionName = session.sessionName || selectedSessionId;
    
    setSelectedSession({ id: selectedSessionId, name: selectedSessionName });
    
    const sessionDetails = allAttendanceData.filter(item => 
      (item.sessionId || 'N/A_Session') === selectedSessionId
    );
    
    setAttendanceList(sessionDetails);
    updateStats(sessionDetails);
    
    // 검색 필터 초기화
    setSearchFilters({
      name: '',
      email: '',
      joinTime: '',
      sortOrder: 'DESC'
    });
    
    setCurrentView('detail');
  }, [allAttendanceData]);

  // 통계 업데이트
  const updateStats = useCallback((data) => {
    const total = data.length;
    let active = 0;
    let totalMinutes = 0;
    let validCount = 0;

    data.forEach(item => {
      if (item.status === '참여중') {
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
  }, []);

  // 검색 실행
  const handleSearch = useCallback(async () => {
    const tenantId = getTenantId();
    
    if (!selectedSession.id) {
      showPopup('세션이 선택되지 않았습니다.');
      return;
    }

    if (!tenantId) {
      showPopup('테넌트 정보를 찾을 수 없습니다.');
      return;
    }

    setLoading(true);

    try {
      const searchOptions = {
        attendanceVo: {
          scTenantId: tenantId,
          scSessionId: selectedSession.id,
          scName: searchFilters.name.trim() || '',
          scEmail: searchFilters.email.trim() || '',
          scJoinTime: searchFilters.joinTime || '',
          pageSize: '9999',
          pageIndex: '1',
          sortOrder: searchFilters.sortOrder
        }
      };

      const filteredData = await makeApiCall(searchOptions);
      setAttendanceList(filteredData);
      updateStats(filteredData);

    } catch (error) {
      showPopup(`검색 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [getTenantId, selectedSession.id, searchFilters, showPopup, updateStats, makeApiCall]);

  // 검색 초기화
  const handleReset = useCallback(() => {
    setSearchFilters({
      name: '',
      email: '',
      joinTime: '',
      sortOrder: 'DESC'
    });

    const sessionDetails = allAttendanceData.filter(item => 
      (item.sessionId || 'N/A_Session') === selectedSession.id
    );
    setAttendanceList(sessionDetails);
    updateStats(sessionDetails);
    
    showPopup('검색 조건이 초기화되었습니다.');
  }, [allAttendanceData, selectedSession.id, updateStats, showPopup]);

  // 정렬 변경
  const handleSortChange = useCallback((order) => {
    const sortedData = [...attendanceList].sort((a, b) => {
      const timeA = new Date(a.joinTime).getTime();
      const timeB = new Date(b.joinTime).getTime();
      return order === 'ASC' ? timeA - timeB : timeB - timeA;
    });
    
    setAttendanceList(sortedData);
    setSearchFilters(prev => ({ ...prev, sortOrder: order }));
  }, [attendanceList]);

  // CSV 다운로드
  const handleDownloadCSV = useCallback(() => {
    if (attendanceList.length === 0) {
      showPopup('다운로드할 데이터가 없습니다.');
      return;
    }

    try {
      let csvContent = '\ufeff'; 
      csvContent += '번호,세션ID,참여자명,이메일,접속IP,입장시간,퇴장시간,참여시간(분),상태\n';
      
      attendanceList.forEach((row, index) => {
        csvContent += `${index + 1},`;
        csvContent += `"${row.sessionId || ''}",`;
        csvContent += `"${row.name || ''}",`;
        csvContent += `"${row.email || ''}",`;
        csvContent += `"${row.ipAddress || ''}",`;
        csvContent += `"${row.joinTime || ''}",`;
        csvContent += `"${row.leaveTime || '진행중'}",`;
        csvContent += `"${row.participationMinutes || '-'}",`;
        csvContent += `"${row.status || ''}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);

      const tenantId = getTenantId() || 'unknown';
      const sessionId = selectedSession.id.replace(/[^a-zA-Z0-9]/g, '_') || '선택세션';
      const now = new Date();
      const dateStr = now.getFullYear() + 
        String(now.getMonth() + 1).padStart(2, '0') + 
        String(now.getDate()).padStart(2, '0');
      
      link.setAttribute('download', `출석현황_${tenantId}_${sessionId}_${dateStr}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showPopup('CSV 파일이 다운로드되었습니다.');
    } catch (error) {
      showPopup(`CSV 다운로드 중 오류가 발생했습니다: ${error.message}`);
    }
  }, [attendanceList, selectedSession.id, showPopup, getTenantId]);

  // 구독 확인 (웹스퀘어의 checkAttendanceSubscription 대체)
  const checkAttendanceSubscription = useCallback(() => {
    try {
      const tenantId = getTenantId();
      if (!tenantId) return false;

      const subscribedModulesKey = `subscribedModules_${tenantId}`;
      const subscribedModules = JSON.parse(localStorage.getItem(subscribedModulesKey) || '[]');
      return subscribedModules.includes('ATTENDANCE');
    } catch (e) {
      return false;
    }
  }, [getTenantId]);

  // 컴포넌트 마운트 시 세션 목록 로드
  useEffect(() => {
    loadSessionList();
  }, [loadSessionList]);

  // 구독 상태에 따른 다운로드 버튼 표시 여부
  const showDownloadButton = checkAttendanceSubscription();

  return (
    <div className="attendance-dashboard">
      {/* 헤더 */}
      <div className="page-header">
        <h1 className="page-title">출석 관리 시스템</h1>
        <nav className="breadcrumb">
          <span>Home</span>
          <span>출석 관리</span>
          <span>출석현황</span>
        </nav>
      </div>

      {/* 세션 목록 뷰 */}
      {currentView === 'sessionList' && (
        <div className="session-list-view">
          <div className="search-box">
            <div className="search-info">
              아래 목록에서 세션을 선택하여 상세 출석현황을 확인하세요.
            </div>
            <div className="search-actions">
              <button 
                className="btn btn-primary"
                onClick={loadSessionList}
                disabled={loading}
              >
                {loading ? '로딩 중...' : '세션 목록 새로고침'}
              </button>
            </div>
          </div>

          <div className="content-box">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>세션명</th>
                    <th>주관부서</th>
                    <th>시작시간</th>
                    <th>총 참여자 수</th>
                    <th>평균 참여시간(분)</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionSummaryList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-data">
                        {loading ? '로딩 중...' : '세션 데이터가 없습니다.'}
                      </td>
                    </tr>
                  ) : (
                    sessionSummaryList.map((session, index) => (
                      <tr 
                        key={index}
                        onClick={() => handleSessionClick(session)}
                        className="clickable"
                      >
                        <td className="session-name">{session.sessionName}</td>
                        <td>{session.sessionDept}</td>
                        <td>{session.sessionStartTime}</td>
                        <td className="text-center">{session.participantCount}</td>
                        <td className="text-center">{session.avgMinutes}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 상세 뷰 */}
      {currentView === 'detail' && (
        <div className="detail-view">
          {/* 상세 뷰 헤더 */}
          <div className="detail-header">
            <button 
              className="btn btn-back"
              onClick={() => setCurrentView('sessionList')}
            >
              ← 세션 목록으로
            </button>
            <div className="selected-session">
              <span>선택된 세션:</span>
              <span className="session-name">{selectedSession.name}</span>
            </div>
          </div>

          {/* 검색 영역 */}
          <div className="search-box">
            <div className="search-fields">
              <div className="field">
                <label>참여자명</label>
                <input
                  type="text"
                  value={searchFilters.name}
                  onChange={(e) => setSearchFilters(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="참여자명으로 검색"
                />
              </div>
              <div className="field">
                <label>이메일</label>
                <input
                  type="text"
                  value={searchFilters.email}
                  onChange={(e) => setSearchFilters(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  placeholder="이메일로 검색"
                />
              </div>
              <div className="field">
                <label>입장일시</label>
                <input
                  type="date"
                  value={searchFilters.joinTime}
                  onChange={(e) => setSearchFilters(prev => ({
                    ...prev,
                    joinTime: e.target.value
                  }))}
                />
              </div>
            </div>
            <div className="search-actions">
              <button 
                className="btn btn-primary"
                onClick={handleSearch}
                disabled={loading}
              >
                검색
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleReset}
              >
                초기화
              </button>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="stats-container">
            <div className="stat-card total">
              <div className="stat-number">{stats.totalCount}</div>
              <div className="stat-label">총 참여자</div>
            </div>
            <div className="stat-card active">
              <div className="stat-number">{stats.activeCount}</div>
              <div className="stat-label">현재 참여중</div>
            </div>
            <div className="stat-card left">
              <div className="stat-number">{stats.leftCount}</div>
              <div className="stat-label">퇴장완료</div>
            </div>
            <div className="stat-card avg">
              <div className="stat-number">{stats.avgMinutes}</div>
              <div className="stat-label">평균 참여시간(분)</div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="action-buttons">
            <button
              className="btn btn-secondary"
              onClick={() => handleSortChange('DESC')}
            >
              최신순
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleSortChange('ASC')}
            >
              오래된순
            </button>
            {showDownloadButton && (
              <button
                className="btn btn-primary"
                onClick={handleDownloadCSV}
              >
                CSV 다운로드
              </button>
            )}
          </div>

          {/* 출석 목록 테이블 */}
          <div className="content-box">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>세션ID</th>
                    <th>참여자명</th>
                    <th>이메일</th>
                    <th>접속IP</th>
                    <th>입장시간</th>
                    <th>퇴장시간</th>
                    <th>참여시간(분)</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="no-data">
                        {loading ? '로딩 중...' : '출석 데이터가 없습니다.'}
                      </td>
                    </tr>
                  ) : (
                    attendanceList.map((item, index) => (
                      <tr key={index}>
                        <td className="text-center">{index + 1}</td>
                        <td className="text-center">{item.sessionId}</td>
                        <td className="participant-name">{item.name}</td>
                        <td>{item.email}</td>
                        <td className="text-center">{item.ipAddress}</td>
                        <td className="text-center">{item.joinTime}</td>
                        <td className="text-center">{item.leaveTime || '진행중'}</td>
                        <td className="text-center participation-time">
                          {item.participationMinutes || '-'}
                        </td>
                        <td className="text-center">
                          <span className={`status ${item.status === '참여중' ? 'active' : 'left'}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 모달 */}
      {modal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-message">{modal.message}</div>
            <div className="modal-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => closeModal(true)}
              >
                확인
              </button>
              {modal.isConfirm && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => closeModal(false)}
                >
                  취소
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceModule;