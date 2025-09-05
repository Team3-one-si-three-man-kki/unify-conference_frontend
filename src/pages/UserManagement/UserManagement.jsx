import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Download, Upload, Edit2 } from 'lucide-react';

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

  // 토큰에서 Bearer 접두사 완전 제거하는 함수
  const getCleanAuthToken = () => {
    let token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    
    if (!token) {
      return null;
    }
    
    // Bearer 접두사가 있다면 제거 (여러번 중복되어도 모두 제거)
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
    
    // 토큰이 있으면 Bearer 접두사를 한 번만 추가
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
      // tenantId 파라미터 없이 요청 (백엔드에서 JWT로 처리)
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
      console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));

      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

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
          // 백엔드에서 받은 실제 tenantId를 상태에 저장
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
      tenantId: currentTenantId, // 백엔드에서 받은 실제 tenantId 사용
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

  const handleReset = () => {
    showPopup('모든 데이터를 초기화하시겠습니까?', true, (result) => {
      if (result) {
        setUsers([]);
        setSearchKeyword('');
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

  const checkEmailDuplicate = async (email) => {
    try {
        const response = await fetch('/api/user/check-email-by-tenant', {
        method: 'POST',
        headers: getApiHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          email: email
          // tenantId 제거 - 백엔드에서 JWT로 처리
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.success && data.available;
      }
      return false;
    } catch (error) {
      console.error('이메일 중복 검사 오류:', error);
      return false;
    }
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
        // tenantId 제거 - 백엔드에서 JWT로 자동 설정
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

  return (
    <div className="user-management" style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
          사용자 관리
        </h2>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Home &gt; 사용자 관리 {currentTenantId && `(Tenant ID: ${currentTenantId})`}
        </div>
        <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
          토큰 상태: {getCleanAuthToken() ? '인증됨' : '인증 필요'} | 백엔드: localhost:8080
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: '500', minWidth: '60px' }}>검색어</label>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="사용자명 또는 이메일로 검색"
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '200px'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isLoading}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            <Search size={16} />
            {isLoading ? '검색중...' : '검색'}
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleAddUser} style={buttonStyle} disabled={isLoading}>
            <Plus size={16} />
            행추가
          </button>
          <button onClick={() => handleDeleteUser(users.findIndex(u => u.selected))} style={buttonStyle} disabled={isLoading}>
            <Trash2 size={16} />
            행삭제
          </button>
          <button onClick={handleDeleteSelected} style={buttonStyle} disabled={isLoading}>
            <Trash2 size={16} />
            다중삭제
          </button>
          <button onClick={handleReset} style={buttonStyle} disabled={isLoading}>
            초기화
          </button>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8f9fa' }}>
            <tr>
              <th style={headerStyle}>
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  disabled={isLoading}
                />
              </th>
              <th style={headerStyle}>순번</th>
              <th style={headerStyle}>성명</th>
              <th style={headerStyle}>이메일</th>
              <th style={headerStyle}>비밀번호</th>
              <th style={headerStyle}>역할</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  {isLoading ? '로딩 중...' : '데이터가 없습니다.'}
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id || index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={cellStyle}>
                    <input
                      type="checkbox"
                      checked={user.selected || false}
                      onChange={(e) => handleSelectUser(index, e.target.checked)}
                      disabled={isLoading}
                    />
                  </td>
                  <td style={cellStyle}>{index + 1}</td>
                  <td style={cellStyle}>
                    <input
                      type="text"
                      value={user.name || user.userName || ''}
                      onChange={(e) => handleUpdateUser(index, 'name', e.target.value)}
                      style={inputStyle}
                      disabled={isLoading}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="email"
                      value={user.email || ''}
                      onChange={(e) => handleUpdateUser(index, 'email', e.target.value)}
                      style={inputStyle}
                      disabled={isLoading}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="password"
                      value={user.password || ''}
                      onChange={(e) => handleUpdateUser(index, 'password', e.target.value)}
                      onClick={(e) => {
                        if (e.target.value === '******') {
                          handleUpdateUser(index, 'password', '');
                        }
                      }}
                      placeholder={user.isNew ? '비밀번호 입력' : '변경시에만 입력'}
                      style={inputStyle}
                      disabled={isLoading}
                    />
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '10px',
        marginTop: '20px'
      }}>
        <button onClick={handleSave} style={primaryButtonStyle} disabled={isLoading}>
          {isLoading ? '저장중...' : '저장'}
        </button>
        <button style={buttonStyle} disabled={isLoading}>
          취소
        </button>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            minWidth: '320px',
            maxWidth: '450px',
            textAlign: 'center'
          }}>
            <div style={{
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#333',
              whiteSpace: 'pre-wrap'
            }}>
              {modalMessage}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={handleModalConfirm} style={primaryButtonStyle}>
                확인
              </button>
              {modalType === 'confirm' && (
                <button onClick={handleModalCancel} style={buttonStyle}>
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

const buttonStyle = {
  padding: '8px 16px',
  backgroundColor: '#f8f9fa',
  border: '1px solid #ddd',
  borderRadius: '4px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '14px'
};

const primaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#007bff',
  color: 'white',
  border: '1px solid #007bff'
};

const headerStyle = {
  padding: '12px 8px',
  textAlign: 'left',
  fontWeight: 'bold',
  borderBottom: '2px solid #ddd',
  backgroundColor: '#f8f9fa'
};

const cellStyle = {
  padding: '8px',
  borderBottom: '1px solid #eee'
};

const inputStyle = {
  width: '100%',
  padding: '4px 8px',
  border: '1px solid #ddd',
  borderRadius: '3px',
  fontSize: '14px'
};

const selectStyle = {
  width: '100%',
  padding: '4px 8px',
  border: '1px solid #ddd',
  borderRadius: '3px',
  fontSize: '14px'
};

export default UserManagement;