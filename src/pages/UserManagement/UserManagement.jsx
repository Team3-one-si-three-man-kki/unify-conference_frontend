import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Download, Upload, Edit2 } from 'lucide-react';

const UserManagement = () => {
  // 상태 관리
  const [users, setUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('alert'); // 'alert' or 'confirm'
  const [modalCallback, setModalCallback] = useState(null);

  // 역할 옵션
  const roleOptions = [
    { value: 'manager', label: '매니저' },
    { value: 'user', label: '사용자' }
  ];

  // 컴포넌트 마운트 시 사용자 목록 조회
  useEffect(() => {
    handleSearch();
  }, []);

  // 모달 표시 함수
  const showPopup = (message, isConfirm = false, callback = null) => {
    setModalMessage(message);
    setModalType(isConfirm ? 'confirm' : 'alert');
    setModalCallback(() => callback);
    setShowModal(true);
  };

  // 모달 확인 처리
  const handleModalConfirm = () => {
    setShowModal(false);
    if (modalCallback) {
      modalCallback(true);
    }
  };

  // 모달 취소 처리
  const handleModalCancel = () => {
    setShowModal(false);
    if (modalCallback) {
      modalCallback(false);
    }
  };

  // URL에서 tenant 파라미터 가져오기
  const getTenantId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tenant') || '1'; // 기본값을 1로 설정
  };

  // JWT 토큰 가져오기 (Authorization 헤더용)
  const getAuthToken = () => {
    // localStorage나 sessionStorage에서 토큰 가져오기
    return localStorage.getItem('accessToken') || '';
  };

  // API 요청 공통 헤더 설정
  const getApiHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // 사용자 검색 - REST API 형식으로 변경
  const handleSearch = async () => {
    const tenantId = getTenantId();
    if (!tenantId) {
      showPopup('테넌트 정보가 없습니다. 페이지를 새로고침 해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // GET 요청으로 변경하고 쿼리 파라미터 사용
      const queryParams = new URLSearchParams({
        tenantId: tenantId,
        ...(searchKeyword && { searchKeyword })
      });

      const response = await fetch(`/api/user/list?${queryParams}`, {
        method: 'GET',
        headers: getApiHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          const userArray = data.data || [];
          
          // 비밀번호 마스킹 처리
          const processedUsers = userArray.map((user, index) => ({
            ...user,
            originalPassword: user.password,
            password: '******',
            passwordChanged: 'N',
            selected: false,
            displayIndex: index + 1
          }));
          
          setUsers(processedUsers);
        } else {
          showPopup(data.message || '사용자 목록을 불러오는데 실패했습니다.');
        }
      } else {
        const errorData = await response.json();
        showPopup(errorData.message || '사용자 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('검색 오류:', error);
      showPopup('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 추가
  const handleAddUser = () => {
    const tenantId = getTenantId();
    if (!tenantId) {
      showPopup('테넌트 정보가 없어 사용자를 추가할 수 없습니다.');
      return;
    }

    const newUser = {
      id: Date.now(), // 임시 ID
      tenantId: parseInt(tenantId),
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

  // 사용자 삭제
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

  // 선택된 사용자들 삭제
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

  // 전체 초기화
  const handleReset = () => {
    showPopup('모든 데이터를 초기화하시겠습니까?', true, (result) => {
      if (result) {
        setUsers([]);
        setSearchKeyword('');
      }
    });
  };

  // 사용자 정보 수정
  const handleUpdateUser = (index, field, value) => {
    setUsers(prev => prev.map((user, i) => {
      if (i === index) {
        const updatedUser = { 
          ...user, 
          [field]: value,
          modified: true // 수정 플래그
        };
        
        // 비밀번호 변경 처리
        if (field === 'password' && value !== '******') {
          updatedUser.passwordChanged = 'Y';
        }
        
        return updatedUser;
      }
      return user;
    }));
  };

  // 체크박스 처리
  const handleSelectUser = (index, checked) => {
    setUsers(prev => prev.map((user, i) => ({
      ...user,
      selected: i === index ? checked : user.selected
    })));
  };

  // 전체 선택/해제
  const handleSelectAll = (checked) => {
    setUsers(prev => prev.map(user => ({ ...user, selected: checked })));
  };

  // 이메일 중복 검사
  const checkEmailDuplicate = async (email, tenantId) => {
    try {
      const response = await fetch('/api/user/check-email-by-tenant', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          email: email,
          tenantId: tenantId
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

  // 저장
  const handleSave = () => {
    const modifiedUsers = users.filter(user => user.isNew || user.modified);
    
    if (modifiedUsers.length === 0) {
      showPopup('저장할 변경사항이 없습니다.');
      return;
    }

    // 유효성 검사
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
      // 새 사용자의 경우 비밀번호 필수
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

  // 사용자 저장 API 호출 - REST API 형식으로 변경
  const saveUsers = async (modifiedUsers) => {
    try {
      setIsLoading(true);
      
      const processedData = modifiedUsers.map(user => ({
        userId: user.userId,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        password: user.passwordChanged === 'Y' && user.password !== '******' ? user.password : 'KEEP_EXISTING_PASSWORD',
        role: user.role,
        isActive: user.isActive !== undefined ? user.isActive : true,
        rowStatus: user.isNew ? 'C' : 'U'
      }));

      const response = await fetch('/api/user/save', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          saveDataList: processedData
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showPopup('저장이 완료되었습니다.', false, () => {
            handleSearch(); // 목록 새로고침
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

  // Excel 다운로드
  const handleDownload = () => {
    showPopup('Excel 다운로드 기능은 추후 구현될 예정입니다.');
  };

  // Excel 업로드
  const handleUpload = () => {
    showPopup('Excel 업로드 기능은 추후 구현될 예정입니다.');
  };

  return (
    <div className="user-management" style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
          사용자 관리
        </h2>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Home &gt; 사용자 관리
        </div>
      </div>

      {/* 검색 영역 */}
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

      {/* 버튼 영역 */}
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
          <button onClick={handleDownload} style={buttonStyle} disabled={isLoading}>
            <Download size={16} />
            다운로드
          </button>
          <button onClick={handleUpload} style={buttonStyle} disabled={isLoading}>
            <Upload size={16} />
            업로드
          </button>
        </div>
      </div>

      {/* 테이블 */}
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

      {/* 저장 버튼 */}
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

      {/* 모달 */}
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

// 스타일 정의
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