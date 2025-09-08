import React, { useState, useEffect } from 'react';
import { FiSearch, FiMessageCircle, FiVideo, FiEdit3, FiCheckCircle, FiUser, FiClock, FiMonitor, FiMic, FiCamera, FiList, FiGrid, FiStar, FiShoppingCart, FiDownload, FiPackage, FiUsers, FiSettings, FiZap, FiEye } from 'react-icons/fi';

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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // 목업 데이터
  const mockModules = [
    {
      moduleId: '1',
      name: '실시간 채팅',
      description: '참가자들 간의 실시간 소통을 위한 채팅 시스템입니다.',
      category: 'meeting',
      price: 5000,
      rating: 4.8,
      downloads: 1250,
      icon: 'chat',
      subscribed: false,
      tags: ['실시간', '소통', '채팅']
    },
    {
      moduleId: '2',
      name: '화면 공유',
      description: '프레젠테이션과 자료 공유를 위한 화면 공유 기능입니다.',
      category: 'meeting',
      price: 8000,
      rating: 4.9,
      downloads: 980,
      icon: 'screen',
      subscribed: true,
      tags: ['화면공유', '프레젠테이션', '협업']
    },
    {
      moduleId: '3',
      name: '출석 체크',
      description: '자동화된 출석 관리 시스템으로 참석자를 효율적으로 관리합니다.',
      category: 'education',
      price: 3000,
      rating: 4.6,
      downloads: 2100,
      icon: 'attendance',
      subscribed: false,
      tags: ['출석', '관리', '자동화']
    },
    {
      moduleId: '4',
      name: '퀴즈 시스템',
      description: '실시간 퀴즈와 투표를 통한 참여형 교육 도구입니다.',
      category: 'education',
      price: 6000,
      rating: 4.7,
      downloads: 850,
      icon: 'quiz',
      subscribed: false,
      tags: ['퀴즈', '교육', '참여']
    },
    {
      moduleId: '5',
      name: '참가자 관리',
      description: '회의 참가자의 권한과 상태를 체계적으로 관리합니다.',
      category: 'management',
      price: 7000,
      rating: 4.5,
      downloads: 1100,
      icon: 'users',
      subscribed: true,
      tags: ['관리', '권한', '참가자']
    },
    {
      moduleId: '6',
      name: 'AI 얼굴 인식',
      description: 'AI 기반 얼굴 인식으로 참석자 확인과 집중도를 측정합니다.',
      category: 'education',
      price: 12000,
      rating: 4.9,
      downloads: 650,
      icon: 'ai',
      subscribed: false,
      tags: ['AI', '얼굴인식', '분석']
    }
  ];

  // 아이콘 컴포넌트 매핑
  const iconComponents = {
    chat: <FiMessageCircle size={24} />,
    screen: <FiMonitor size={24} />,
    attendance: <FiCheckCircle size={24} />,
    quiz: <FiZap size={24} />,
    users: <FiUsers size={24} />,
    ai: <FiPackage size={24} />
  };

  // 아이콘 스타일 매핑
  const iconStyles = {
    chat: { backgroundColor: '#e0e7ff', color: '#3674B5' },
    screen: { backgroundColor: '#f0f9ff', color: '#0369a1' },
    attendance: { backgroundColor: '#fef3c7', color: '#d97706' },
    quiz: { backgroundColor: '#ecfdf5', color: '#059669' },
    users: { backgroundColor: '#fce7f3', color: '#be185d' },
    ai: { backgroundColor: '#fef2f2', color: '#dc2626' }
  };

  useEffect(() => {
    // 목업 데이터 로드
    setTimeout(() => {
      setModules(mockModules);
      setIsLoading(false);
    }, 500);
    setIsLoading(true);
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
        module.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        module.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase()))
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

  // 구독 버튼 클릭 처리
  const handleSubscribeClick = (module) => {
    if (module.subscribed) {
      showPopup(`${module.name} 모듈의 구독을 해지하시겠습니까?`, true, (confirmed) => {
        if (confirmed) {
          setModules(prev => prev.map(m => 
            m.moduleId === module.moduleId ? { ...m, subscribed: false } : m
          ));
          showPopup(`${module.name} 모듈 구독이 해지되었습니다!`);
        }
      });
    } else {
      setModules(prev => prev.map(m => 
        m.moduleId === module.moduleId ? { ...m, subscribed: true } : m
      ));
      showPopup(`${module.name} 모듈이 구독되었습니다!`);
    }
  };

  // 별점 생성 - React Icons 사용
  const generateStarRating = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar 
        key={i} 
        style={{
          width: '16px',
          height: '16px',
          color: i < Math.floor(rating) ? '#fbbf24' : '#d1d5db',
          fill: i < Math.floor(rating) ? '#fbbf24' : 'none'
        }}
      />
    ));
  };

  const subscribedCount = modules.filter(m => m.subscribed).length;
  const totalPrice = modules.filter(m => m.subscribed).reduce((sum, m) => sum + m.price, 0);

  return (
    <div className="temp-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
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
          <FiShoppingCart style={{ width: '40px', height: '40px', color: '#007bff' }} />
        </div>
        <h2 style={{ marginBottom: '8px', color: '#333' }}>모듈 마켓플레이스</h2>
        <p style={{ color: '#666', marginBottom: '4px' }}>
          Home › 모듈 › 모듈 구매
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
          연결됨
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
            <FiSearch style={{ 
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
              placeholder="모듈명, 설명, 태그로 검색..."
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
              disabled={isLoading}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: 'white',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {viewMode === 'grid' ? <FiList size={16} /> : <FiGrid size={16} />}
            </button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '24px',
            backgroundColor: 'white',
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
              <FiPackage style={{ width: '24px', height: '24px', color: '#007bff' }} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
              {filteredModules.length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>사용 가능한 모듈</div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '24px',
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
              <FiDownload style={{ width: '24px', height: '24px', color: '#4caf50' }} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
              {subscribedCount}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>구독 중인 모듈</div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: '#fff3cd',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <span style={{ fontSize: '18px', color: '#856404' }}>₩</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
              ₩{totalPrice.toLocaleString()}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>총 구독 비용</div>
          </div>
        </div>
      </div>

      {/* 필터 탭 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'all', label: '전체', icon: <FiPackage size={16} /> },
          { key: 'meeting', label: '회의', icon: <FiEye size={16} /> },
          { key: 'education', label: '교육', icon: <FiZap size={16} /> },
          { key: 'management', label: '관리', icon: <FiUsers size={16} /> }
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: activeFilter === filter.key ? '#007bff' : 'white',
              color: activeFilter === filter.key ? 'white' : '#666',
              border: '2px solid #e0e0e0',
              borderColor: activeFilter === filter.key ? '#007bff' : '#e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: activeFilter === filter.key ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {filter.icon}
            {filter.label}
            <span style={{
              backgroundColor: activeFilter === filter.key ? 'rgba(255,255,255,0.3)' : '#f8f9fa',
              color: activeFilter === filter.key ? 'white' : '#666',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {filter.key === 'all' ? modules.length : modules.filter(m => m.category === filter.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* 모듈 리스트 */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: '1px solid #e9ecef'
      }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <span>로딩 중...</span>
          </div>
        ) : filteredModules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            <FiPackage style={{ width: '48px', height: '48px', color: '#ccc', margin: '0 auto 16px' }} />
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>검색 결과가 없습니다</div>
            <div style={{ fontSize: '14px', color: '#999' }}>다른 키워드로 검색해보세요</div>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            padding: '24px'
          }}>
            {filteredModules.map((module) => (
              <div key={module.moduleId} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '24px',
                transition: 'all 0.3s ease',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '320px',
                maxHeight: '400px'
              }}>
                {/* 모듈 헤더 */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                  <div style={{
                    flexShrink: 0,
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...iconStyles[module.icon],
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}>
                    {iconComponents[module.icon] || iconComponents['chat']}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: '700', 
                      fontSize: '18px', 
                      color: '#1f2937', 
                      marginBottom: '8px',
                      lineHeight: '1.2',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {module.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {generateStarRating(module.rating)}
                        <span style={{ fontSize: '14px', color: '#666', marginLeft: '6px', fontWeight: '600' }}>
                          {module.rating}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#999' }}>•</span>
                      <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                        {module.downloads}회
                      </span>
                    </div>
                  </div>
                </div>

                {/* 모듈 설명 */}
                <p style={{ 
                  fontSize: '15px', 
                  color: '#6b7280', 
                  marginBottom: '20px', 
                  lineHeight: '1.6',
                  flex: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '72px'
                }}>
                  {module.description}
                </p>

                {/* 태그 */}
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginBottom: '20px', 
                  flexWrap: 'wrap',
                  minHeight: '32px',
                  alignItems: 'flex-start'
                }}>
                  {module.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} style={{
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: '1px solid #e2e8f0'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 가격 및 액션 */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: 'auto',
                  paddingTop: '16px',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  <div style={{ 
                    fontSize: '22px', 
                    fontWeight: '800', 
                    color: '#111827',
                    letterSpacing: '-0.5px'
                  }}>
                    ₩{module.price.toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleSubscribeClick(module)}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: module.subscribed ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)',
                      transform: 'translateY(0)',
                      minWidth: '120px',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 16px rgba(0, 123, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.3)';
                    }}
                  >
                    {module.subscribed ? (
                      <>
                        <FiDownload size={16} />
                        구독중
                      </>
                    ) : (
                      <>
                        <FiShoppingCart size={16} />
                        구독하기
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            {filteredModules.map((module) => (
              <div key={module.moduleId} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                backgroundColor: 'white'
              }}>
                {/* 모듈 아이콘 */}
                <div style={{
                  flexShrink: 0,
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...iconStyles[module.icon]
                }}>
                  {iconComponents[module.icon] || iconComponents['chat']}
                </div>

                {/* 모듈 정보 */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '18px', color: '#1f2937', marginBottom: '4px' }}>
                    {module.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                    {module.description}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {generateStarRating(module.rating)}
                      <span style={{ fontSize: '14px', color: '#666', marginLeft: '4px' }}>
                        {module.rating}
                      </span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      {module.downloads}회 다운로드
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {module.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} style={{
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 가격 및 액션 */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                    ₩{module.price.toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleSubscribeClick(module)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: module.subscribed ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {module.subscribed ? (
                      <>
                        <FiDownload size={16} />
                        구독중
                      </>
                    ) : (
                      <>
                        <FiShoppingCart size={16} />
                        구독하기
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
          zIndex: 9999,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            minWidth: '400px',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '24px', marginBottom: '15px', color: '#333' }}>
              {modalType === 'confirm' ? '확인 필요' : '알림'}
            </h3>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '25px', lineHeight: '1.5' }}>
              {modalMessage}
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  if (modalCallback) modalCallback(true);
                }}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minWidth: '100px'
                }}
              >
                확인
              </button>
              {modalType === 'confirm' && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    if (modalCallback) modalCallback(false);
                  }}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    minWidth: '100px'
                  }}
                >
                  취소
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ModuleMarketplace;