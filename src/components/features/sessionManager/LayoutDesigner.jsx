import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { ModuleList } from './ModuleList';
import { DropZone } from './DropZone';
// import { availableModules } from '../../../utils/moduleData'; // 백엔드 API 사용으로 더 이상 불필요
import './LayoutDesigner.css';

export const LayoutDesigner = ({ onSave, onPrev, sessionInfo, showNavigation = false, initialLayoutConfig, readOnly = false }) => {
  const [availableModulesList, setAvailableModulesList] = useState([]);
  const [showInitialAnimation, setShowInitialAnimation] = useState(true);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [insertIndex, setInsertIndex] = useState(-1);
  const [dragOverZoneId, setDragOverZoneId] = useState(null);
  const [showDropModal, setShowDropModal] = useState(false);

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
      bottom_modules: [] // 하나의 바 형태 영역
    };

    if (initialLayoutConfig && initialLayoutConfig.modules) {
      // 기존 bottom_1, bottom_2 등의 형태를 bottom_modules로 변환
      const convertedModules = {
        main_video: initialLayoutConfig.modules.main_video || defaultModules.main_video,
        bottom_modules: []
      };
      
      // 기존의 bottom_1~10 영역의 모듈들을 순서대로 bottom_modules에 합침
      for (let i = 1; i <= 10; i++) {
        const bottomKey = `bottom_${i}`;
        if (initialLayoutConfig.modules[bottomKey] && initialLayoutConfig.modules[bottomKey].length > 0) {
          convertedModules.bottom_modules.push(...initialLayoutConfig.modules[bottomKey]);
        }
      }
      
      return convertedModules;
    }
    
    return defaultModules;
  };

  const [placedModules, setPlacedModules] = useState(getInitialPlacedModules());
  const [activeId, setActiveId] = useState(null);

  // 모듈 아이콘 업데이트 함수 (현재 ModuleList의 데이터 기준)
  const updateModuleWithCurrentIcon = (module) => {
    if (availableModulesList.length === 0) return module;
    
    const currentModule = availableModulesList.find(m => m.id === module.id);
    if (currentModule) {
      return {
        ...module,
        icon: currentModule.icon // 현재 ModuleList의 최신 아이콘으로 업데이트
      };
    }
    return module;
  };

  // initialLayoutConfig가 변경될 때 placedModules 업데이트
  useEffect(() => {
    if (initialLayoutConfig && initialLayoutConfig.modules) {
      // 새로운 구조로 변환
      const processedModules = {
        main_video: [],
        bottom_modules: []
      };
      
      // main_video 처리
      if (initialLayoutConfig.modules.main_video) {
        processedModules.main_video = initialLayoutConfig.modules.main_video.map((module, index) => ({
          ...updateModuleWithCurrentIcon(module), // 최신 아이콘으로 업데이트
          isFixed: module.isFixed || module.id === 'video-call',
          uniqueKey: `${module.id}_main_video_${index}_${Date.now()}`
        }));
      }
      
      // bottom_modules 처리 (순서 기반 데이터 지원)
      if (initialLayoutConfig.modules.bottom_modules) {
        // 새로운 순서 기반 형태인 경우
        let bottomModules = initialLayoutConfig.modules.bottom_modules;
        
        // order 필드 기준으로 정렬 (position은 더 이상 사용하지 않음)
        if (bottomModules.length > 0 && bottomModules[0].order !== undefined) {
          bottomModules = bottomModules.sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : 999;
            const orderB = b.order !== undefined ? b.order : 999;
            return orderA - orderB;
          });
          
          console.log('Loaded modules sorted by order:', bottomModules.map(m => ({ 
            name: m.name, 
            order: m.order
          })));
        }
        
        processedModules.bottom_modules = bottomModules.map((module, index) => ({
          ...updateModuleWithCurrentIcon(module), // 최신 아이콘으로 업데이트
          isFixed: module.isFixed || false,
          uniqueKey: `${module.id}_bottom_modules_${index}_${Date.now()}`
        }));
      } else {
        // 기존 bottom_1~10 형태인 경우 변환
        for (let i = 1; i <= 10; i++) {
          const bottomKey = `bottom_${i}`;
          if (initialLayoutConfig.modules[bottomKey] && initialLayoutConfig.modules[bottomKey].length > 0) {
            const convertedModules = initialLayoutConfig.modules[bottomKey].map((module, index) => ({
              ...updateModuleWithCurrentIcon(module), // 최신 아이콘으로 업데이트
              isFixed: module.isFixed || false,
              uniqueKey: `${module.id}_bottom_modules_${processedModules.bottom_modules.length + index}_${Date.now()}`
            }));
            processedModules.bottom_modules.push(...convertedModules);
          }
        }
      }
      
      setPlacedModules(processedModules);
    }
  }, [initialLayoutConfig, availableModulesList]); // availableModulesList 의존성 추가

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    
    // 드래그 시작 시 상태 초기화
    setInsertIndex(-1);
    setDragOverZoneId(null);
    setCurrentMouseX(null);
    
    // 사용자가 드래그를 시작하면 초기 애니메이션 끄기
    if (showInitialAnimation) {
      setShowInitialAnimation(false);
      setUserHasInteracted(true);
    }
  };

  // 실시간 마우스 추적을 위한 상태
  const [currentMouseX, setCurrentMouseX] = useState(null);

  // 전역 마우스 이벤트 리스너
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (activeId && dragOverZoneId === 'bottom_modules') { 
        const newMouseX = e.clientX;
        setCurrentMouseX(newMouseX);
        
        // 실시간으로 삽입 인덱스 업데이트
        const newInsertIndex = calculateInsertIndex('bottom_modules', newMouseX);
        if (newInsertIndex !== insertIndex) {
          setInsertIndex(newInsertIndex);
        }
      }
    };

    if (activeId) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activeId, dragOverZoneId, insertIndex]);

  const handleDragOver = (event) => {
    const { over } = event;
    
    if (!over) {
      setInsertIndex(-1);
      setDragOverZoneId(null);
      return;
    }

    const targetZoneId = over.data.current?.zone?.id;
    
    // dragOverZoneId가 변경될 때만 업데이트
    if (targetZoneId !== dragOverZoneId) {
      setDragOverZoneId(targetZoneId);
      
      // bottom_modules가 아닌 곳으로 이동하면 삽입 인덱스 초기화
      if (targetZoneId !== 'bottom_modules') {
        setInsertIndex(-1);
      }
    }
  };

  // 삽입 위치 계산 함수 (useCallback으로 메모이제이션)
  const calculateInsertIndex = useCallback((targetZoneId, clientX) => {
    try {
      if (targetZoneId !== 'bottom_modules' || typeof clientX !== 'number') return -1;
      
      const modules = placedModules[targetZoneId] || [];
      const containerElement = document.querySelector('.drop-zone.bottom_modules .horizontal-layout');
      
      if (!containerElement || modules.length === 0) return 0;
      
      const containerRect = containerElement.getBoundingClientRect();
      if (!containerRect) return modules.length;
      
      const relativeX = clientX - containerRect.left;
      
      // 경계값 체크 - 컨테이너 밖이면 끝에 배치
      if (relativeX < 0) return 0;
      if (relativeX > containerRect.width) return modules.length;
      
      // 모든 모듈의 위치 정보 수집
      const modulePositions = [];
      for (let i = 0; i < modules.length; i++) {
        const moduleElement = document.querySelector(`[data-module-index="${i}"]`);
        if (moduleElement) {
          const moduleRect = moduleElement.getBoundingClientRect();
          if (moduleRect && moduleRect.width > 0) {
            const moduleRelativeLeft = moduleRect.left - containerRect.left;
            const moduleRelativeRight = moduleRect.right - containerRect.left;
            
            modulePositions.push({
              index: i,
              left: moduleRelativeLeft,
              right: moduleRelativeRight,
              center: moduleRelativeLeft + (moduleRect.width / 2),
              width: moduleRect.width
            });
          }
        }
      }
      
      // 드롭 영역 계산 (모듈 사이의 실제 간격 고려)
      for (let i = 0; i < modulePositions.length; i++) {
        const currentModule = modulePositions[i];
        const nextModule = modulePositions[i + 1];
        
        // 첫 번째 모듈 앞 영역 체크
        if (i === 0 && relativeX < currentModule.center) {
          console.log(`Inserting before first module (index 0). relativeX: ${relativeX}, moduleCenter: ${currentModule.center}`);
          return 0;
        }
        
        // 모듈들 사이의 영역 체크
        if (nextModule) {
          const gapStart = currentModule.right;
          const gapEnd = nextModule.left;
          const gapCenter = (gapStart + gapEnd) / 2;
          
          // 현재 모듈의 중점을 넘었고, 다음 모듈의 중점 이전이면 사이에 삽입
          if (relativeX > currentModule.center && relativeX < nextModule.center) {
            console.log(`Inserting between modules ${i} and ${i + 1}. relativeX: ${relativeX}, gapCenter: ${gapCenter}`);
            return i + 1;
          }
        }
        // 마지막 모듈 뒤 영역 체크
        else if (relativeX > currentModule.center) {
          console.log(`Inserting after last module (index ${modules.length}). relativeX: ${relativeX}, moduleCenter: ${currentModule.center}`);
          return modules.length;
        }
      }
      
      console.log('Fallback: inserting at end', { relativeX, modulePositions });
      
      // 모든 모듈보다 오른쪽에 드롭하면 맨 뒤에 삽입
      return modules.length;
    } catch (error) {
      console.warn('Error in calculateInsertIndex:', error);
      return -1;
    }
  }, [placedModules]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    // 드래그 상태 정리
    setCurrentMouseX(null);
    
    if (!over) {
      // 배치 영역 외부에 드롭한 경우
      const draggedModule = getActiveModule();
      if (draggedModule && !draggedModule.zoneId) { // 새로운 모듈인 경우만
        setShowDropModal(true);
      }
      setActiveId(null);
      setInsertIndex(-1);
      setDragOverZoneId(null);
      return;
    }

    // DragEnd에서 실제 드롭 위치 사용
    const targetZoneId = over.data.current?.zone?.id;
    
    // 실시간으로 추적된 insertIndex를 최종 인덱스로 사용
    // 만약 insertIndex가 유효하지 않으면 현재 마우스 위치로 재계산
    let finalInsertIndex = insertIndex;
    
    if (targetZoneId === 'bottom_modules' && (insertIndex < 0 || currentMouseX)) {
      console.log('Recalculating insert index. Current insertIndex:', insertIndex, 'currentMouseX:', currentMouseX);
      
      if (currentMouseX) {
        finalInsertIndex = calculateInsertIndex(targetZoneId, currentMouseX);
        console.log('Recalculated finalInsertIndex:', finalInsertIndex);
      }
    }
    
    console.log('Final drop position - insertIndex:', insertIndex, 'finalInsertIndex:', finalInsertIndex);

    // 드래그 종료 시 삽입 인덱스 초기화
    setInsertIndex(-1);

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

    // bottom_modules 영역에만 드롭 가능하도록 제한
    if (targetZoneId !== 'bottom_modules') {
      setShowDropModal(true);
      setActiveId(null);
      setInsertIndex(-1);
      setDragOverZoneId(null);
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

    // bottom_modules 영역에서의 재배치는 허용 (순서 변경)
    if (sourceZoneId && sourceZoneId === targetZoneId && targetZoneId !== 'bottom_modules') {
      setActiveId(null);
      return;
    }

    // 모듈 이동/배치 처리
    setPlacedModules(prev => {
      const newState = { ...prev };

      if (sourceZoneId) {
        // 기존 배치된 모듈의 재배치
        // 기존 위치에서 제거
        newState[sourceZoneId] = newState[sourceZoneId].filter((_, index) => index !== sourceIndex);

        if (targetZoneId === 'bottom_modules') {
          // 계산된 삽입 인덱스 사용, 안전한 범위 체크
          const modules = newState[targetZoneId] || [];
          const targetInsertIndex = (finalInsertIndex >= 0 && finalInsertIndex <= modules.length) ? finalInsertIndex : modules.length;
          
          console.log('Inserting existing module at index:', {
            finalInsertIndex,
            targetInsertIndex,
            modulesLength: modules.length,
            moduleName: draggedModule.name
          });
          
          try {
            // 계산된 위치에 삽입
            newState[targetZoneId].splice(targetInsertIndex, 0, {
              ...draggedModule,
              zoneId: targetZoneId
            });
          } catch (error) {
            console.warn('Error inserting module:', error);
            // 실패시 맨 뒤에 추가
            newState[targetZoneId].push({
              ...draggedModule,
              zoneId: targetZoneId
            });
          }
        } else {
          // main_video 영역 처리
          // 타겟 존에 이미 모듈이 있는 경우 교환 (main_video만)
          if (newState[targetZoneId].length > 0 && targetZoneId === 'main_video') {
            const existingModules = [...newState[targetZoneId]];
            
            // 기존 모듈들을 원래 위치로 이동 (고정 모듈 제외)
            existingModules.forEach(existingModule => {
              if (!existingModule.isFixed && sourceZoneId === 'bottom_modules') {
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
        }

      } else {
        // 새로운 모듈 배치
        if (!newState[targetZoneId]) {
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
        const isAlreadyPlaced = Object.values(newState).some(modules =>
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

        if (targetZoneId === 'bottom_modules') {
          // 계산된 삽입 인덱스 사용, 안전한 범위 체크
          const targetInsertIndex = (finalInsertIndex >= 0 && finalInsertIndex <= currentModules.length) ? finalInsertIndex : currentModules.length;
          
          console.log('Inserting new module at index:', {
            finalInsertIndex,
            targetInsertIndex,
            currentModulesLength: currentModules.length,
            moduleName: moduleToPlace.name
          });
          
          try {
            // 계산된 위치에 삽입
            const newModules = [...currentModules];
            newModules.splice(targetInsertIndex, 0, moduleToPlace);
            newState[targetZoneId] = newModules;
          } catch (error) {
            console.warn('Error inserting new module:', error);
            // 실패시 맨 뒤에 추가
            newState[targetZoneId] = [...currentModules, moduleToPlace];
          }
        } else {
          newState[targetZoneId] = [...currentModules, moduleToPlace];
        }
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
      const clearedModules = {
        main_video: [{
          id: 'video-call',
          name: '화상통화',
          description: '기본 화상통화 기능',
          icon: '📹',
          category: 'basic',
          isFree: true,
          color: '#4285f4',
          size: 'large',
          zoneId: 'main_video',
          isFixed: true
        }],
        bottom_modules: [] // 바 영역은 비워두기
      };
      
      setPlacedModules(clearedModules);
    }
  };

  const handleSaveLayout = () => {
    // bottom_modules 배열을 순서 기반으로 변환
    const convertModulesToOrder = (modules) => {
      return modules.map((module, index) => ({
        ...module,
        order: index + 1, // 1부터 시작하는 순서
        position: index   // 0부터 시작하는 인덱스
      }));
    };

    const layoutData = {
      timestamp: new Date().toISOString(),
      modules: {
        main_video: placedModules.main_video || [],
        bottom_modules: convertModulesToOrder(placedModules.bottom_modules || [])
      }
    };
    
    console.log('Converted layout data with orders:', layoutData);
    
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
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={`layout-designer ${showInitialAnimation ? 'initial-animation' : ''}`}>

        <div className="layout-designer-content">
          <ModuleList 
            totalPlacedModules={getTotalModulesCount()} 
            placedModules={placedModules}
            onModulesLoad={setAvailableModulesList}
            showInitialAnimation={showInitialAnimation}
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
            showInitialAnimation={showInitialAnimation}
            userHasInteracted={userHasInteracted}
            insertIndex={insertIndex}
            dragOverZoneId={dragOverZoneId}
            isDragging={!!activeId}
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
        
        {showInitialAnimation && (
          <div className="drag-drop-guide">
            <div className="drag-drop-cursor">👆</div>
            <div className="drag-path-start"></div>
            <div className="drag-path-end"></div>
          </div>
        )}

        {/* 배치 영역 외부 드롭 모달 */}
        {showDropModal && (
          <div className="drop-modal-overlay" onClick={() => setShowDropModal(false)}>
            <div className="drop-modal" onClick={(e) => e.stopPropagation()}>
              <div className="drop-modal-icon">⚠️</div>
              <h3 className="drop-modal-title">모듈을 배치해주세요</h3>
              <p className="drop-modal-message">
                모듈을 사용하려면 배치 영역 안에 드래그해서 놓아주세요.
              </p>
              <div className="drop-modal-buttons">
                <button 
                  className="drop-modal-btn drop-modal-btn-primary"
                  onClick={() => setShowDropModal(false)}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
};