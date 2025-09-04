import { useDraggable } from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import apiClient from '../../../services/api/api';
import './ModuleList.css';

// 개별 모듈 카드 컴포넌트
const ModuleCard = ({ module, isPlaced }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: module.id,
    data: {
      type: 'module',
      module: module
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isPlaced ? {} : listeners)}
      {...(isPlaced ? {} : attributes)}
      className={`module-card ${isDragging ? 'dragging' : ''} ${isPlaced ? 'placed' : ''}`}
      data-category={module.category}
    >
      <div className="module-icon" style={{ color: module.color }}>
        {module.icon}
      </div>
      <div className="module-info">
        <h4 className="module-name">{module.name}</h4>
        <p className="module-description">{module.description}</p>
        <div className="module-meta">
          <span className={`module-badge ${module.category}`}>
            {module.category === 'basic' ? '기본' : 
             module.category === 'premium' ? '프리미엄' : 'AI'}
          </span>
          {!module.isFree && <span className="module-price">유료</span>}
        </div>
      </div>
    </div>
  );
};

// 모듈 리스트 컴포넌트
export const ModuleList = ({ totalPlacedModules = 0, placedModules = {}, onModulesLoad = null, showInitialAnimation = false }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 백엔드에서 테넌트 모듈 데이터 가져오기
  useEffect(() => {
    const loadTenantModules = async () => {
      console.log('🚀 백엔드에서 테넌트 모듈 데이터 로드 시작...');
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get('/api/user/tenant_module');
        const tenantModules = response.data;
        console.log('✅ 백엔드에서 받은 데이터:', tenantModules);
        
        // 백엔드 데이터를 프론트엔드 모듈 형식으로 변환
        const convertedModules = tenantModules.map(module => ({
          id: module.code || module.moduleId.toString(),
          name: module.name,
          description: module.description,
          icon: module.icon || '📦',
          category: 'basic', // 기본값으로 설정, 필요시 백엔드에서 카테고리 필드 추가
          isFree: true, // 기본값으로 설정
          color: '#4285f4', // 기본 색상
          defaultSize: 'medium'
        }));
        
        console.log('🔄 변환된 모듈 데이터:', convertedModules);

        // 백엔드에서 받은 모듈 데이터만 사용
        setModules(convertedModules);
        console.log('✨ 최종 모듈 리스트 설정 완료:', convertedModules);
        
        // 상위 컴포넌트에 모듈 리스트 전달
        if (onModulesLoad) {
          onModulesLoad(convertedModules);
        }
      } catch (err) {
        console.error('❌ 백엔드 API 호출 실패:', err);
        setError('모듈 정보를 불러오는데 실패했습니다.');
        // 에러 발생 시 빈 배열로 설정
        setModules([]);
      } finally {
        setLoading(false);
        console.log('🏁 테넌트 모듈 로드 완료');
      }
    };

    loadTenantModules();
  }, []);

  // 배치된 모듈 ID 목록 생성 (고정 모듈 제외)
  const placedModuleIds = Object.values(placedModules)
    .flat()
    .filter(module => !module.isFixed)
    .map(module => module.id);

  // 카테고리별로 모듈 그룹화 (화상통화 모듈 제외)
  const modulesByCategory = modules
    .filter(module => module.id !== 'video_call') // 화상통화 모듈 제외
    .reduce((acc, module) => {
      if (!acc[module.category]) {
        acc[module.category] = [];
      }
      acc[module.category].push(module);
      return acc;
    }, {});

  const categoryNames = {
    basic: '기본 모듈',
    premium: '프리미엄 모듈', 
    ai: 'AI 모듈'
  };

  if (loading) {
    return (
      <div className="module-list">
        <div className="module-list-header">
          <h3 className="module-list-title">모듈 라이브러리</h3>
          <p className="module-list-subtitle">모듈 정보를 불러오는 중...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // 에러 발생 시 대시보드에 영향을 주지 않도록 안전한 렌더링
  if (error) {
    return (
      <div className="module-list">
        <div className="module-list-header">
          <h3 className="module-list-title">모듈 라이브러리</h3>
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        </div>
        <div className="module-categories">
          <p>모듈을 불러올 수 없습니다. 페이지를 새로고침해보세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`module-list ${showInitialAnimation ? 'initial-animation' : ''}`}>
      <div className="module-list-header">
        <div className="module-list-title-container">
          <h3 className="module-list-title">모듈 라이브러리</h3>
          <span className="placed-count-badge">{totalPlacedModules}개 배치됨</span>
        </div>
        <p className="module-list-subtitle">원하는 모듈을 드래그해서 배치하세요</p>
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}
      </div>

      <div className="module-categories">
        {Object.keys(modulesByCategory).length === 0 ? (
          <div className="no-modules-message">
            <p>사용 가능한 모듈이 없습니다.</p>
            <small>관리자에게 문의하거나 모듈을 구매해보세요.</small>
          </div>
        ) : (
          Object.entries(modulesByCategory).map(([category, modules]) => (
            <div key={category} className="module-category">
              <h4 className="category-title">{categoryNames[category]}</h4>
              <div className="category-modules">
                {modules.map(module => (
                  <ModuleCard 
                    key={module.id} 
                    module={module} 
                    isPlaced={placedModuleIds.includes(module.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};