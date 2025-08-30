import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { ModuleList } from './ModuleList';
import { DropZone } from './DropZone';
// import { availableModules } from '../../../utils/moduleData'; // 백엔드 API 사용으로 더 이상 불필요
import './LayoutDesigner.css';

export const LayoutDesigner = ({ onSave, onPrev, sessionInfo, showNavigation = false, initialLayoutConfig, readOnly = false }) => {
  const [availableModulesList, setAvailableModulesList] = useState([]);
  const getInitialPlacedModules = () => {
    const defaultModules = {
      main_video: [{
        id: 'video-call', // 일관된 ID 사용
        name: '화상통화',
        description: '기본 화상통화 기능',
        icon: '📹',
        category: 'basic',
        isFree: true,
        color: '#4285f4',
        size: 'large',
        zoneId: 'main_video',
        isFixed: true // 고정 모듈 표시
      }],
      bottom_1: [], bottom_2: [], bottom_3: [], bottom_4: [], bottom_5: [],
      bottom_6: [], bottom_7: [], bottom_8: [], bottom_9: [], bottom_10: []
    };

    if (initialLayoutConfig && initialLayoutConfig.modules) {
      return initialLayoutConfig.modules;
    }
    
    return defaultModules;
  };

  const [placedModules, setPlacedModules] = useState(getInitialPlacedModules());
  const [activeId, setActiveId] = useState(null);

  // initialLayoutConfig가 변경될 때 placedModules 업데이트
  useEffect(() => {
    if (initialLayoutConfig && initialLayoutConfig.modules) {
      // 모든 필수 zone을 가진 기본 구조 생성
      const processedModules = {
        main_video: [],
        bottom_1: [], bottom_2: [], bottom_3: [], bottom_4: [], bottom_5: [],
        bottom_6: [], bottom_7: [], bottom_8: [], bottom_9: [], bottom_10: []
      };
      
      // 템플릿에서 가져온 모듈들을 편집 가능하도록 처리
      Object.keys(initialLayoutConfig.modules).forEach(zoneId => {
        if (processedModules.hasOwnProperty(zoneId)) {
          processedModules[zoneId] = initialLayoutConfig.modules[zoneId].map((module, index) => ({
            ...module,
            // 고정 모듈이 아닌 경우 편집 가능하도록 설정
            isFixed: module.isFixed || module.id === 'video-call',
            // 드래그 식별을 위한 고유 키 추가
            uniqueKey: `${module.id}_${zoneId}_${index}_${Date.now()}`
          }));
        }
      });
      setPlacedModules(processedModules);
    }
  }, [initialLayoutConfig]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const targetZoneId = over.data.current?.zone?.id;
    const targetZone = over.data.current?.zone;

    if (!targetZoneId || !targetZone) {
      setActiveId(null);
      return;
    }

    // 드래그된 아이템이 기존에 배치된 모듈인지 확인
    let draggedModule = null;
    let sourceZoneId = null;
    let sourceIndex = null;

    // 배치된 모듈에서 찾기
    Object.entries(placedModules).forEach(([zoneId, modules]) => {
      const moduleIndex = modules.findIndex(module => 
        (module.uniqueKey && module.uniqueKey === active.id) ||
        `${module.id}_${zoneId}_${modules.indexOf(module)}` === active.id
      );
      if (moduleIndex !== -1) {
        draggedModule = modules[moduleIndex];
        sourceZoneId = zoneId;
        sourceIndex = moduleIndex;
      }
    });

    // 배치된 모듈이 아니라면 사용 가능한 모듈에서 찾기
    if (!draggedModule) {
      draggedModule = availableModulesList.find(module => module.id === active.id);
    }

    if (!draggedModule) {
      setActiveId(null);
      return;
    }

    // 카테고리 허용 여부 확인
    if (!targetZone.acceptedCategories.includes(draggedModule.category)) {
      alert(`${draggedModule.name} 모듈은 ${targetZone.name}에 배치할 수 없습니다.`);
      setActiveId(null);
      return;
    }

    // 메인 화상회의 영역에는 드롭 불가 (고정 모듈 제외)
    if (targetZoneId === 'main_video' && !draggedModule.isFixed) {
      alert('메인 화상회의 영역에는 화상통화 모듈이 고정되어 있습니다.');
      setActiveId(null);
      return;
    }

    // 고정 모듈은 이동 불가
    if (draggedModule.isFixed && sourceZoneId) {
      alert('고정 모듈은 이동할 수 없습니다.');
      setActiveId(null);
      return;
    }

    // 재배치인 경우 (같은 위치로 이동하는 경우 무시)
    if (sourceZoneId && sourceZoneId === targetZoneId) {
      setActiveId(null);
      return;
    }

    // 모듈 이동/배치/교환 처리
    setPlacedModules(prev => {
      const newState = { ...prev };

      if (sourceZoneId) {
        // 기존 배치된 모듈의 재배치
        // 기존 위치에서 제거
        newState[sourceZoneId] = newState[sourceZoneId].filter((_, index) => index !== sourceIndex);

        // 타겟 존에 이미 모듈이 있는 경우 교환
        if (newState[targetZoneId].length > 0) {
          const existingModules = [...newState[targetZoneId]];
          
          // 기존 모듈들을 원래 위치로 이동
          existingModules.forEach(existingModule => {
            if (!existingModule.isFixed) {
              newState[sourceZoneId].push({
                ...existingModule,
                zoneId: sourceZoneId
              });
            }
          });

          // 타겟 존 비우기 (고정 모듈 제외)
          newState[targetZoneId] = newState[targetZoneId].filter(module => module.isFixed);
        }

        // 드래그한 모듈을 타겟 존에 배치
        newState[targetZoneId].push({
          ...draggedModule,
          zoneId: targetZoneId
        });

      } else {
        // 새로운 모듈 배치
        // targetZoneId가 존재하는지 확인하고 없으면 빈 배열로 초기화
        if (!placedModules[targetZoneId]) {
          newState[targetZoneId] = [];
        }
        
        // 최대 아이템 수 확인
        const currentModules = newState[targetZoneId] || [];
        if (currentModules.length >= targetZone.maxItems) {
          alert(`${targetZone.name}에는 최대 ${targetZone.maxItems}개의 모듈만 배치할 수 있습니다.`);
          setActiveId(null);
          return prev;
        }

        // 중복 배치 확인
        const isAlreadyPlaced = Object.values(placedModules).some(modules =>
          Array.isArray(modules) && modules.some(module => module.id === draggedModule.id)
        );

        if (isAlreadyPlaced) {
          alert(`${draggedModule.name} 모듈은 이미 배치되었습니다.`);
          setActiveId(null);
          return prev;
        }

        // 새 위치에 추가
        const moduleToPlace = {
          ...draggedModule,
          size: draggedModule.defaultSize,
          zoneId: targetZoneId,
          uniqueKey: `${draggedModule.id}_${targetZoneId}_${Date.now()}_new`
        };

        newState[targetZoneId] = [...(newState[targetZoneId] || []), moduleToPlace];
      }

      return newState;
    });

    setActiveId(null);
  };

  const handleRemoveModule = (zoneId, moduleIndex) => {
    const moduleToRemove = placedModules[zoneId][moduleIndex];
    
    // 고정 모듈은 제거 불가
    if (moduleToRemove?.isFixed) {
      alert('고정 모듈은 제거할 수 없습니다.');
      return;
    }

    setPlacedModules(prev => ({
      ...prev,
      [zoneId]: prev[zoneId].filter((_, index) => index !== moduleIndex)
    }));
  };

  const handleClearAll = () => {
    if (window.confirm('모든 모듈 배치를 초기화하시겠습니까?\n(고정 모듈은 유지됩니다)')) {
      const clearedModules = {};
      Object.keys(placedModules).forEach(zoneId => {
        // 고정 모듈만 유지하고 나머지는 제거
        clearedModules[zoneId] = placedModules[zoneId].filter(module => module.isFixed);
      });
      
      // main_video에 기본 화상통화 모듈이 없으면 추가
      if (!clearedModules.main_video || clearedModules.main_video.length === 0) {
        clearedModules.main_video = [{
          id: 'video-call', // 일관된 ID 사용
          name: '화상통화',
          description: '기본 화상통화 기능',
          icon: '📹',
          category: 'basic',
          isFree: true,
          color: '#4285f4',
          size: 'large',
          zoneId: 'main_video',
          isFixed: true
        }];
      }
      
      // bottom 영역들도 빈 배열로 초기화 (고정 모듈이 있으면 유지됨)
      for (let i = 1; i <= 10; i++) {
        const zoneKey = `bottom_${i}`;
        if (!clearedModules[zoneKey]) {
          clearedModules[zoneKey] = [];
        }
      }
      
      setPlacedModules(clearedModules);
    }
  };

  const handleSaveLayout = () => {
    const layoutData = {
      timestamp: new Date().toISOString(),
      modules: placedModules
    };
    
    if (onSave) {
      // 세션 생성 프로세스에서 호출된 경우
      onSave(layoutData);
    } else {
      // 단독 레이아웃 디자이너로 사용된 경우
      console.log('Layout saved:', layoutData);
      alert('레이아웃이 저장되었습니다! (콘솔에서 확인하세요)');
    }
  };

  const getTotalModulesCount = () => {
    return Object.values(placedModules).reduce((total, modules) => {
      // 고정 모듈(isFixed: true)은 개수에서 제외
      const userPlacedModules = modules.filter(module => !module.isFixed);
      return total + userPlacedModules.length;
    }, 0);
  };

  const getActiveModule = () => {
    if (!activeId) return null;
    
    // 먼저 배치된 모듈에서 찾기
    for (const [zoneId, modules] of Object.entries(placedModules)) {
      const module = modules.find((module, index) => 
        (module.uniqueKey && module.uniqueKey === activeId) ||
        `${module.id}_${zoneId}_${index}` === activeId
      );
      if (module) return module;
    }
    
    // 사용 가능한 모듈에서 찾기
    return availableModulesList.find(module => module.id === activeId);
  };

  const activeModule = getActiveModule();

  if (readOnly) {
    // 읽기 전용 모드: 드래그 앤 드롭 없이 레이아웃만 표시
    return (
      <div className="layout-designer read-only">
        <div className="layout-designer-content">
          <DropZone 
            placedModules={placedModules}
            onRemoveModule={null}
            onClearAll={null}
            onSaveLayout={null}
            onPrev={null}
            totalModulesCount={getTotalModulesCount()}
            showNavigation={false}
            sessionInfo={sessionInfo}
            readOnly={true}
          />
        </div>
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="layout-designer">

        <div className="layout-designer-content">
          <ModuleList 
            totalPlacedModules={getTotalModulesCount()} 
            placedModules={placedModules}
            onModulesLoad={setAvailableModulesList}
          />
          <DropZone 
            placedModules={placedModules}
            onRemoveModule={handleRemoveModule}
            onClearAll={handleClearAll}
            onSaveLayout={handleSaveLayout}
            onPrev={onPrev}
            totalModulesCount={getTotalModulesCount()}
            showNavigation={showNavigation}
            sessionInfo={sessionInfo}
            readOnly={false}
          />
        </div>

        <DragOverlay>
          {activeModule ? (
            <div className="drag-overlay-module">
              <div className="drag-overlay-icon" style={{ color: activeModule.color }}>
                {activeModule.icon}
              </div>
              <div className="drag-overlay-info">
                <h4 className="drag-overlay-name">{activeModule.name}</h4>
                <p className="drag-overlay-description">{activeModule.description}</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};