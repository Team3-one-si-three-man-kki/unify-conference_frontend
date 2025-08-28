import React, { useState, useEffect } from 'react';
import { FiSearch, FiMessageCircle, FiVideo, FiEdit3, FiCheckCircle, FiUser, FiClock, FiMonitor, FiMic, FiCamera } from 'react-icons/fi';

const ModuleMarketplace = () => {
  // 상태 관리
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('alert');
  const [modalCallback, setModalCallback] = useState(null);

  // 아이콘 매핑
  const iconComponents = {
    chat: <FiMessageCircle size={24} />,
    video: <FiVideo size={24} />,
    canvas: <FiEdit3 size={24} />,
    attendance: <FiCheckCircle size={24} />,
    drowsy: <FiUser size={24} />,
    absent: <FiClock size={24} />,
    screen: <FiMonitor size={24} />,
    mic: <FiMic size={24} />,
    camera: <FiCamera size={24} />
  };

  // 아이콘 스타일 매핑
  const iconStyles = {
    chat: { backgroundColor: '#e0e7ff', color: '#3674B5' },
    video: { backgroundColor: '#fce7f3', color: '#be185d' },
    canvas: { backgroundColor: '#ecfdf5', color: '#059669' },
    attendance: { backgroundColor: '#fef3c7', color: '#d97706' },
    drowsy: { backgroundColor: '#fce7f3', color: '#db2777' },
    absent: { backgroundColor: '#fffbeb', color: '#d97706' },
    screen: { backgroundColor: '#f0f9ff', color: '#0369a1' },
    mic: { backgroundColor: '#fffbeb', color: '#d97706' },
    camera: { backgroundColor: '#fef2f2', color: '#dc2626' }
  };

  // 컴포넌트 마운트 시 모듈 목록 로드
  useEffect(() => {
    loadModuleList();
  }, []);

  // 필터링 및 검색
  useEffect(() => {
    let filtered = modules;

    // 카테고리 필터
    if (activeFilter !== 'all') {
      filtered = filtered.filter(module => module.category === activeFilter);
    }

    // 검색 키워드 필터
    if (searchKeyword.trim()) {
      filtered = filtered.filter(module => 
        module.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (module.description && module.description.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }

    setFilteredModules(filtered);
  }, [modules, activeFilter, searchKeyword]);

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
    return params.get('tenant') || 'default-tenant';
  };

  // 모듈 목록 로드
  const loadModuleList = async () => {
    const tenantId = getTenantId();
    setIsLoading(true);

    try {
      const response = await fetch(`/InsWebApp/MarketplaceModuleList.pwkjson?pageSize=50&pageIndex=1&tenantId=${tenantId}`);
      
      if (response.ok) {
        const data = await response.json();
        let moduleList = data.moduleListVo?.moduleVoList || data.moduleVoList || [];
        
        // 구독 상태 로드 및 모듈 데이터 처리
        const processedModules = await processModuleList(moduleList);
        setModules(processedModules);
      } else {
        // 대체 API 시도
        await loadModuleListFallback();
      }
    } catch (error) {
      console.error('모듈 목록 로드 오류:', error);
      showPopup('모듈 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 대체 API 호출
  const loadModuleListFallback = async () => {
    const tenantId = getTenantId();
    try {
      const response = await fetch('/InsWebApp/ModuleList.pwkjson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageSize: 50, pageIndex: 1, tenantId })
      });

      if (response.ok) {
        const data = await response.json();
        let moduleList = data.moduleListVo?.moduleVoList || data.moduleVoList || [];
        const processedModules = await processModuleList(moduleList);
        setModules(processedModules);
      }
    } catch (error) {
      console.error('대체 API 오류:', error);
      showPopup('모듈 목록을 불러오는데 실패했습니다.');
    }
  };

  // 모듈 데이터 처리
  const processModuleList = async (moduleList) => {
    const tenantId = getTenantId();
    
    // 구독된 모듈 목록 가져오기
    const subscribedModulesKey = `subscribedModules_${tenantId}`;
    const subscribedModules = JSON.parse(localStorage.getItem(subscribedModulesKey) || '[]');

    return moduleList.map((module, index) => {
      const moduleCode = module.code || module.moduleId;
      const moduleId = module.moduleId || module.id;

      // 아이콘 설정
      const iconList = ["chat", "video", "canvas", "attendance", "drowsy", "absent", "screen", "mic", "camera"];
      let icon = iconList[index % iconList.length];
      
      // 특정 모듈 ID에 따른 아이콘 설정
      switch (moduleCode) {
        case 'CHAT': icon = "chat"; break;
        case 'VIDEO': icon = "video"; break;
        case 'CANVAS': icon = "canvas"; break;
        case 'QUIZ': icon = "attendance"; break;
        case 'FACEAI': icon = "drowsy"; break;
        case 'PARTICIPANTS': icon = "absent"; break;
        case 'ABSENT': icon = "absent"; break;
        case 'SCREEN': icon = "screen"; break;
        case 'MIC': icon = "mic"; break;
        case 'CAMERA': icon = "camera"; break;
        case 'ATTENDANCE': icon = "attendance"; break;
      }

      // 카테고리 설정
      let category = 'etc';
      switch (moduleCode) {
        case 'VIDEO':
        case 'CHAT':
        case 'CANVAS':
        case 'SCREEN':
          category = 'meeting';
          break;
        case 'FACEAI':
        case 'QUIZ':
        case 'ATTENDANCE':
          category = 'education';
          break;
        case 'PARTICIPANTS':
        case 'ABSENT':
        case 'MIC':
        case 'CAMERA':
          category = 'management';
          break;
      }

      // 구독 상태 확인
      const subscribed = subscribedModules.includes(moduleCode) || 
                        subscribedModules.includes(String(moduleId)) || 
                        subscribedModules.includes(moduleId);

      // 가격 포맷팅
      const price = module.price ? parseInt(module.price, 10) : 0;
      const formattedPrice = price > 0 ? `₩${price.toLocaleString()}` : '무료';

      // 평점 생성
      const rating = (Math.random() + 4.0).toFixed(1);

      return {
        ...module,
        moduleId: moduleId,
        code: moduleCode,
        icon,
        category,
        subscribed,
        price,
        formattedPrice,
        rating: parseFloat(rating),
        ratingStars: generateStarRating(parseFloat(rating))
      };
    });
  };

  // 별점 생성
  const generateStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars) + ` ${rating}`;
  };

  // 구독 상태 업데이트
  const updateSubscriptionStatus = (moduleId, moduleCode, isSubscribed) => {
    const tenantId = getTenantId();
    if (!tenantId) return;

    const subscribedModulesKey = `subscribedModules_${tenantId}`;
    let subscribedModules = JSON.parse(localStorage.getItem(subscribedModulesKey) || '[]');

    if (isSubscribed) {
      if (!subscribedModules.includes(String(moduleId))) {
        subscribedModules.push(String(moduleId));
      }
      if (moduleCode && !subscribedModules.includes(moduleCode)) {
        subscribedModules.push(moduleCode);
      }
    } else {
      subscribedModules = subscribedModules.filter(id => 
        id !== String(moduleId) && id !== moduleCode && id !== moduleId
      );
    }

    localStorage.setItem(subscribedModulesKey, JSON.stringify(subscribedModules));
  };

  // 모듈 구독
  const subscribeModule = async (module) => {
    const tenantId = getTenantId();
    if (!tenantId) {
      showPopup('테넌트 정보가 없어 구독할 수 없습니다.');
      return;
    }

    try {
      const response = await fetch('/InsWebApp/TMD0001Subscribe.pwkjson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantModuleVo: {
            moduleId: module.moduleId,
            tenantId: tenantId
          }
        })
      });

      if (response.ok) {
        showPopup(`${module.name} 모듈이 구독되었습니다!`);
        
        // 상태 업데이트
        setModules(prev => prev.map(m => 
          m.moduleId === module.moduleId ? { ...m, subscribed: true } : m
        ));
        
        updateSubscriptionStatus(module.moduleId, module.code, true);
      } else {
        const errorData = await response.json();
        const errorMsg = errorData.elHeader?.resMsg || '구독에 실패했습니다.';
        showPopup(`${module.name} 모듈 구독에 실패했습니다: ${errorMsg}`);
      }
    } catch (error) {
      console.error('구독 오류:', error);
      showPopup(`${module.name} 모듈 구독에 실패했습니다.`);
    }
  };

  // 모듈 구독 해지
  const unsubscribeModule = async (module) => {
    const tenantId = getTenantId();
    if (!tenantId) {
      showPopup('테넌트 정보가 없어 구독을 해지할 수 없습니다.');
      return;
    }

    try {
      const response = await fetch('/InsWebApp/TMD0001Unsubscribe.pwkjson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantModuleVo: {
            moduleId: module.moduleId,
            tenantId: tenantId
          }
        })
      });

      if (response.ok) {
        showPopup(`${module.name} 모듈 구독이 해지되었습니다!`);
        
        // 상태 업데이트
        setModules(prev => prev.map(m => 
          m.moduleId === module.moduleId ? { ...m, subscribed: false } : m
        ));
        
        updateSubscriptionStatus(module.moduleId, module.code, false);
      } else {
        const errorData = await response.json();
        const errorMsg = errorData.elHeader?.resMsg || '구독 해지에 실패했습니다.';
        showPopup(`${module.name} 모듈 구독 해지에 실패했습니다: ${errorMsg}`);
      }
    } catch (error) {
      console.error('구독 해지 오류:', error);
      showPopup(`${module.name} 모듈 구독 해지에 실패했습니다.`);
    }
  };

  // 구독 버튼 클릭 처리
  const handleSubscribeClick = (module) => {
    if (module.subscribed) {
      showPopup(`${module.name} 모듈의 구독을 해지하시겠습니까?`, true, (confirmed) => {
        if (confirmed) {
          unsubscribeModule(module);
        }
      });
    } else {
      subscribeModule(module);
    }
  };

  // 필터 버튼 클릭
  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);
  };

  // 검색 처리
  const handleSearch = () => {
    // 검색은 useEffect에서 자동으로 처리됨
  };

  const paidModules = filteredModules.filter(m => m.price > 0);

  const popularModules = filteredModules.slice(0, 4);

  return (
    <div style={{ fontFamily: '"Malgun Gothic", sans-serif', fontSize: '12px', color: '#333' }}>
      {/* 페이지 헤더 */}
      <div style={{ 
        marginTop: '17px', 
        marginBottom: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingBottom: '12px',
        borderBottom: '2px solid #e9ecef'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#2c3e50' }}>
          모듈 구매
        </h2>
        <div style={{ fontSize: '12px', color: '#6c757d' }}>
          Home &gt; 모듈 &gt; 모듈 구매
        </div>
      </div>

      {/* 메인 컨테이너 */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        gap: '24px'
      }}>
        
        {/* 좌측 섹션 - 모듈 리스트 */}
        <div style={{ flex: '6', display: 'flex', flexDirection: 'column' }}>
          {/* 검색 영역 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>모듈 목록</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="모듈명으로 검색"
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  width: '200px'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                style={{
                  backgroundColor: '#3674B5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <FiSearch size={16} />
                검색
              </button>
            </div>
          </div>

          {/* 모듈 리스트 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                로딩 중...
              </div>
            ) : paidModules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                모듈이 없습니다.
              </div>
            ) : (
              paidModules.map((module, index) => (
                <div key={module.moduleId || index} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  {/* 모듈 아이콘 */}
                  <div style={{
                    flexShrink: 0,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...iconStyles[module.icon]
                  }}>
                    {iconComponents[module.icon] || iconComponents['drowsy']}
                  </div>

                  {/* 모듈 정보 */}
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '16px', color: '#1f2937' }}>
                      {module.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                      {module.description || ''}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginTop: '8px' }}>
                      {module.formattedPrice}
                    </div>
                  </div>

                  {/* 모듈 액션 */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', color: '#f59e0b', marginBottom: '8px' }}>
                      {module.ratingStars}
                    </div>
                    {module.price > 0 && (
                      <button
                        onClick={() => handleSubscribeClick(module)}
                        style={{
                          width: '93px',
                          height: '28px',
                          backgroundColor: module.subscribed ? '#6c757d' : '#3674B5',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {module.subscribed ? '구독중' : '구독하기'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 우측 섹션 - 카테고리 필터 및 인기 모듈 */}
        <div style={{
          flex: '4',
          backgroundColor: '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #f3f4f6'
        }}>
          <h3 style={{ color: '#000000', marginBottom: '10px', fontSize: '18px', fontWeight: '600' }}>
            카테고리
          </h3>

          {/* 필터 탭 */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '12px'
          }}>
            {[
              { key: 'all', label: '전체' },
              { key: 'education', label: '교육' },
              { key: 'meeting', label: '회의' },
              { key: 'management', label: '관리' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => handleFilterClick(filter.key)}
                style={{
                  width: '50px',
                  height: '28px',
                  backgroundColor: activeFilter === filter.key ? '#eef2ff' : 'transparent',
                  color: activeFilter === filter.key ? '#3674B5' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0',
                  fontSize: '12px',
                  fontWeight: activeFilter === filter.key ? '600' : '400',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* 인기 모듈 그리드 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            {popularModules.map((module, index) => (
              <div key={module.moduleId || index} style={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
              }}>
                {/* 헤더 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    flexShrink: 0,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...iconStyles[module.icon]
                  }}>
                    {iconComponents[module.icon] || iconComponents['drowsy']}
                  </div>
                  <div style={{ color: '#000000', fontWeight: '600', fontSize: '14px' }}>
                    {module.name}
                  </div>
                </div>

                {/* 평점 */}
                <div style={{ color: '#f59e0b', fontSize: '12px' }}>
                  {module.ratingStars}
                </div>

                {/* 가격 */}
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  color: '#111827', 
                  marginTop: 'auto' 
                }}>
                  {module.formattedPrice || '무료'}
                </div>

                {/* 구독 버튼 */}
                {module.price > 0 && (
                  <div style={{ paddingTop: '8px' }}>
                    <button
                      onClick={() => handleSubscribeClick(module)}
                      style={{
                        width: '100%',
                        height: '29px',
                        backgroundColor: module.subscribed ? '#6c757d' : '#3674B5',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {module.subscribed ? '구독중' : '구독하기'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
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
              <button
                onClick={handleModalConfirm}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                확인
              </button>
              {modalType === 'confirm' && (
                <button
                  onClick={handleModalCancel}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
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

export default ModuleMarketplace;