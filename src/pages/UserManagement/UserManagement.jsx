import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Download, Upload, Edit2, Users, Eye, EyeOff, Settings } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('alert');
  const [modalCallback, setModalCallback] = useState(null);
  const [currentTenantId, setCurrentTenantId] = useState(null);
  const [showPassword, setShowPassword] = useState({});

  const roleOptions = [
    { value: 'manager', label: '매니저' },
    { value: 'user', label: '사용자' }
  ];

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = () => {
    const token = getCleanAuthToken();
    console.log('현재 토큰 상태:', token ? '토큰 존재' : '토큰 없음');
    
    if (!token) {
      showPopup('인증 토큰이 없습니다. 다시 로그인해주세요.', false, () => {
        window.location.href = '/login';
      });
      return;
    }
    
    handleSearch();
  };

  const showPopup = (message, isConfirm = false, callback = null) => {
    setModalMessage(message);
    setModalType(isConfirm ? 'confirm' : 'alert');
    setModalCallback(() => callback);
    setShowModal(true);
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    if (modalCallback) {
      modalCallback(true);
    }
  };

  const handleModalCancel = () => {
    setShowModal(false);
    if (modalCallback) {
      modalCallback(false);
    }
  };

  const getCleanAuthToken = () => {
    let token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    
    if (!token) {
      return null;
    }
    
    while (token.startsWith('Bearer ')) {
      token = token.substring(7).trim();
    }
    
    console.log('정리된 토큰:', token ? token.substring(0, 20) + '...' : '없음');
    return token;
  };

  const getApiHeaders = () => {
    const token = getCleanAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('API 헤더:', headers);
    return headers;
  };

  const handleSearch = async () => {
    console.log('검색 시작 - searchKeyword:', searchKeyword);
    
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...(searchKeyword && { searchKeyword })
      });

      const url = `/api/user/list?${queryParams}`;
      console.log('요청 URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders(),
        credentials: 'include'
      });

      console.log('응답 상태:', response.status, response.statusText);

      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        console.error('JSON이 아닌 응답 받음. 백엔드 서버 연결 실패');
        const textResponse = await response.text();
        console.log('응답 내용 (첫 200자):', textResponse.substring(0, 200));
        
        showPopup('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('응답 데이터:', data);
        
        if (data.success) {
          if (data.tenantId) {
            setCurrentTenantId(data.tenantId);
          }
          
          const userArray = data.data || [];
          
          const processedUsers = userArray.map((user, index) => ({
            ...user,
            originalPassword: user.password,
            password: '******',
            passwordChanged: 'N',
            selected: false,
            displayIndex: index + 1
          }));
          
          setUsers(processedUsers);
          console.log('사용자 목록 로드 완료:', processedUsers.length, '명');
        } else {
          console.error('API 응답 오류:', data.message);
          showPopup(data.message || '사용자 목록을 불러오는데 실패했습니다.');
        }
      } else {
        console.error('HTTP 오류:', response.status);
        
        if (response.status === 401 || response.status === 403) {
          showPopup('인증이 필요하거나 권한이 없습니다. 다시 로그인해주세요.', false, () => {
            window.location.href = '/login';
          });
        } else {
          const errorText = await response.text();
          console.error('오류 응답:', errorText);
          showPopup('사용자 목록을 불러오는데 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('검색 오류:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showPopup('백엔드 서버(localhost:8080)에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else if (error.name === 'SyntaxError') {
        showPopup('서버 응답 형식이 올바르지 않습니다. 백엔드 서버 상태를 확인해주세요.');
      } else {
        showPopup('네트워크 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    if (!currentTenantId) {
      showPopup('테넌트 정보가 없어 사용자를 추가할 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }

    const newUser = {
      id: Date.now(),
      tenantId: currentTenantId,
      userId: null,
      name: '',
      email: '',
      password: '',
      originalPassword: '',
      passwordChanged: 'Y',
      role: 'user',
      selected: false,
      isNew: true,
      modified: true,
      rowStatus: 'C'
    };

    setUsers(prev => [...prev, newUser]);
  };

  const handleDeleteUser = (index) => {
    if (index < 0 || index >= users.length) {
      showPopup('삭제할 행을 먼저 선택해주세요.');
      return;
    }

    showPopup('선택한 사용자를 삭제하시겠습니까?', true, (result) => {
      if (result) {
        setUsers(prev => prev.filter((_, i) => i !== index));
      }
    });
  };

  const handleDeleteSelected = () => {
    const selectedIndices = users
      .map((user, index) => user.selected ? index : -1)
      .filter(index => index !== -1);

    if (selectedIndices.length === 0) {
      showPopup('삭제할 행을 선택해주세요.');
      return;
    }

    showPopup(`선택한 ${selectedIndices.length}개의 사용자를 삭제하시겠습니까?`, true, (result) => {
      if (result) {
        setUsers(prev => prev.filter(user => !user.selected));
        setSelectedUsers([]);
      }
    });
  };

  const handleUpdateUser = (index, field, value) => {
    setUsers(prev => prev.map((user, i) => {
      if (i === index) {
        const updatedUser = { 
          ...user, 
          [field]: value,
          modified: true
        };
        
        if (field === 'password' && value !== '******') {
          updatedUser.passwordChanged = 'Y';
        }
        
        return updatedUser;
      }
      return user;
    }));
  };

  const handleSelectUser = (index, checked) => {
    setUsers(prev => prev.map((user, i) => ({
      ...user,
      selected: i === index ? checked : user.selected
    })));
  };

  const handleSelectAll = (checked) => {
    setUsers(prev => prev.map(user => ({ ...user, selected: checked })));
  };

  const togglePasswordVisibility = (index) => {
    setShowPassword(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSave = () => {
    const modifiedUsers = users.filter(user => user.isNew || user.modified);
    
    if (modifiedUsers.length === 0) {
      showPopup('저장할 변경사항이 없습니다.');
      return;
    }

    for (let i = 0; i < modifiedUsers.length; i++) {
      const user = modifiedUsers[i];
      const rowNum = users.indexOf(user) + 1;

      if (!user.name?.trim()) {
        showPopup(`[${rowNum}행] 성명을 입력해주세요.`);
        return;
      }
      if (!user.email?.trim()) {
        showPopup(`[${rowNum}행] 이메일을 입력해주세요.`);
        return;
      }
      if (!user.role?.trim()) {
        showPopup(`[${rowNum}행] 역할을 선택해주세요.`);
        return;
      }
      if (user.isNew && (!user.password?.trim() || user.password === '******')) {
        showPopup(`[${rowNum}행] 비밀번호를 입력해주세요.`);
        return;
      }
    }

    showPopup('변경 내용을 저장하시겠습니까?', true, async (result) => {
      if (result) {
        await saveUsers(modifiedUsers);
      }
    });
  };

  const saveUsers = async (modifiedUsers) => {
    try {
      setIsLoading(true);
      
      const processedData = modifiedUsers.map(user => ({
        userId: user.userId,
        name: user.name,
        email: user.email,
        password: user.passwordChanged === 'Y' && user.password !== '******' ? user.password : 'KEEP_EXISTING_PASSWORD',
        role: user.role,
        isActive: user.isActive !== undefined ? user.isActive : true,
        rowStatus: user.isNew ? 'C' : 'U'
      }));

      console.log('저장할 데이터:', processedData);

      const response = await fetch('/api/user/save', {
        method: 'POST',
        headers: getApiHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          saveDataList: processedData
        })
      });

      console.log('저장 응답 상태:', response.status);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showPopup('저장이 완료되었습니다.', false, () => {
            handleSearch();
          });
        } else {
          showPopup(data.message || '저장 중 오류가 발생했습니다.');
        }
      } else {
        const errorData = await response.json();
        showPopup(errorData.message || '저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('저장 오류:', error);
      showPopup('저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCount = users.filter(user => user.selected).length;

  return (
    <div className="temp-content">
      {/* 페이지 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: '#e3f2fd',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 4px 12px rgba(0, 123, 255, 0.2)'
        }}>
          <Users style={{ width: '40px', height: '40px', color: '#007bff' }} />
        </div>
        <h2 style={{ marginBottom: '8px', color: '#333' }}>사용자 관리</h2>
        <p style={{ color: '#666', marginBottom: '4px' }}>
          Home › 사용자 관리 {currentTenantId && `(Tenant: ${currentTenantId})`}
        </p>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px',
          backgroundColor: '#e8f5e8',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          color: '#4caf50',
          fontWeight: '500'
        }}>
          <div style={{ width: '6px', height: '6px', backgroundColor: '#4caf50', borderRadius: '50%' }}></div>
          인증됨
        </div>
      </div>

      {/* 검색 및 통계 섹션 */}
      <div style={{ 
        backgroundColor: '#f8f9fa',
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: '1px solid #e9ecef'
      }}>
        {/* 검색창 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ position: 'relative', width: '400px' }}>
            <Search style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#666',
              width: '18px',
              height: '18px'
            }} />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="사용자명 또는 이메일로 검색..."
              style={{
                width: '100%',
                padding: '12px 16px 12px 45px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="confirm-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {isLoading ? (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              <Search style={{ width: '16px', height: '16px' }} />
            )}
            검색
          </button>
        </div>

        {/* 통계 카드 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px'
        }}>
          <div className="placeholder-item" style={{
            textAlign: 'center',
            padding: '24px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: '#e3f2fd',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Users style={{ width: '24px', height: '24px', color: '#007bff' }} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
              {users.length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>총 사용자</div>
          </div>

          <div className="placeholder-item" style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: '#e8f5e8',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <span style={{ fontSize: '18px', color: '#4caf50' }}>✓</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
              {selectedCount}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>선택됨</div>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleAddUser}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            사용자 추가
          </button>

          <button
            onClick={handleDeleteSelected}
            disabled={isLoading || selectedCount === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: selectedCount > 0 ? '#dc3545' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (isLoading || selectedCount === 0) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: (isLoading || selectedCount === 0) ? 0.6 : 1
            }}
          >
            <Trash2 style={{ width: '16px', height: '16px' }} />
            삭제하기 ({selectedCount})
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={isLoading}
          className="confirm-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {isLoading ? (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          ) : (
            <Download style={{ width: '16px', height: '16px' }} />
          )}
          저장
        </button>
      </div>

      {/* 테이블 */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: '1px solid #e9ecef'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={headerStyle}>
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  disabled={isLoading}
                  style={{ width: '16px', height: '16px' }}
                />
              </th>
              <th style={headerStyle}>순번</th>
              <th style={headerStyle}>성명</th>
              <th style={headerStyle}>이메일</th>
              <th style={headerStyle}>비밀번호</th>
              <th style={headerStyle}>역할</th>
              <th style={headerStyle}>액션</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ 
                  padding: '60px 20px', 
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '16px'
                }}>
                  {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid #f3f3f3',
                        borderTop: '3px solid #007bff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <span>로딩 중...</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <Users style={{ width: '48px', height: '48px', color: '#ccc' }} />
                      <div>
                        <div style={{ fontSize: '18px', marginBottom: '8px' }}>데이터가 없습니다</div>
                        <div style={{ fontSize: '14px', color: '#999' }}>새로운 사용자를 추가해보세요</div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id || index} style={{ 
                  borderBottom: '1px solid #e9ecef',
                  backgroundColor: user.selected ? '#f8f9fa' : 'white',
                  transition: 'background-color 0.2s'
                }}>
                  <td style={cellStyle}>
                    <input
                      type="checkbox"
                      checked={user.selected || false}
                      onChange={(e) => handleSelectUser(index, e.target.checked)}
                      disabled={isLoading}
                      style={{ width: '16px', height: '16px' }}
                    />
                  </td>
                  <td style={cellStyle}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '50%',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#495057'
                    }}>
                      {index + 1}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="text"
                      value={user.name || user.userName || ''}
                      onChange={(e) => handleUpdateUser(index, 'name', e.target.value)}
                      style={inputStyle}
                      placeholder="이름을 입력하세요"
                      disabled={isLoading}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="email"
                      value={user.email || ''}
                      onChange={(e) => handleUpdateUser(index, 'email', e.target.value)}
                      style={inputStyle}
                      placeholder="이메일을 입력하세요"
                      disabled={isLoading}
                    />
                  </td>
                  <td style={cellStyle}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword[index] ? "text" : "password"}
                        value={user.password || ''}
                        onChange={(e) => handleUpdateUser(index, 'password', e.target.value)}
                        onClick={(e) => {
                          if (e.target.value === '******') {
                            handleUpdateUser(index, 'password', '');
                          }
                        }}
                        style={{ ...inputStyle, paddingRight: '40px' }}
                        placeholder={user.isNew ? '비밀번호 입력' : '변경시에만 입력'}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(index)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#666'
                        }}
                      >
                        {showPassword[index] ? 
                          <EyeOff style={{ width: '16px', height: '16px' }} /> : 
                          <Eye style={{ width: '16px', height: '16px' }} />
                        }
                      </button>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <select
                      value={user.role || ''}
                      onChange={(e) => handleUpdateUser(index, 'role', e.target.value)}
                      style={selectStyle}
                      disabled={isLoading}
                    >
                      <option value="">선택</option>
                      {roleOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{...cellStyle, textAlign: 'center'}}>
                    <button
                      onClick={() => handleDeleteUser(index)}
                      disabled={isLoading}
                      style={{
                        padding: '8px',
                        backgroundColor: '#fff5f5',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        color: '#dc2626',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        opacity: isLoading ? 0.5 : 1
                      }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 모달 - 기존 CSS 클래스 사용 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modalType === 'confirm' ? '확인 필요' : '알림'}</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{modalMessage}</p>
            <div className="modal-buttons">
              <button 
                onClick={handleModalConfirm}
                className="confirm-btn"
              >
                확인
              </button>
              {modalType === 'confirm' && (
                <button 
                  onClick={handleModalCancel}
                  className="cancel-btn"
                >
                  취소
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS 애니메이션 및 오버라이드 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* 상위 컨테이너 너비 제한 해제하되 적당한 최대 너비 설정 */
          .temp-content {
            max-width: 1400px !important;
            margin: 0 auto !important;
            padding: 20px !important;
          }
          
          .tab-content {
            padding: 20px !important;
          }
        `}
      </style>
    </div>
  );
};

// 스타일 상수들
const headerStyle = {
  padding: '16px 12px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#495057',
  fontSize: '14px',
  backgroundColor: '#f8f9fa',
  borderBottom: '1px solid #dee2e6'
};

const cellStyle = {
  padding: '12px',
  borderBottom: '1px solid #e9ecef',
  verticalAlign: 'middle'
};

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ced4da',
  borderRadius: '4px',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
  backgroundColor: 'white'
};

const selectStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ced4da',
  borderRadius: '4px',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
  backgroundColor: 'white'
};

export default UserManagement;