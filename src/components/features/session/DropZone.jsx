import { useDroppable, useDraggable } from '@dnd-kit/core';
import './DropZone.css';

// 드롭존 정의를 컴포넌트 내부로 이동
const dropZones = [
  {
    id: 'main_video',
    name: '메인 화상회의 영역',
    description: '화상회의 메인 화면',
    maxItems: 1,
    acceptedCategories: ['basic'],
    gridArea: 'main'
  },
  // 10개의 하단 버튼 영역들
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `bottom_${i + 1}`,
    name: `버튼 ${i + 1}`,
    description: '',
    maxItems: 1,
    acceptedCategories: ['basic', 'premium', 'ai'],
    gridArea: 'bottom'
  }))
];

const PlacedModule = ({ module, index, zoneId, onRemoveModule, readOnly = false }) => {
  const draggableProps = !readOnly ? useDraggable({
    id: `${module.id}_${zoneId}_${index}`,
    disabled: module.isFixed,
    data: {
      type: 'placed-module',
      module,
      zoneId,
      index
    }
  }) : {
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    isDragging: false
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = draggableProps;

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`placed-module ${module.isFixed ? 'fixed' : ''} ${isDragging ? 'dragging' : ''} ${readOnly ? 'read-only' : ''}`} 
      data-size={module.size}
      {...attributes}
      {...(!module.isFixed && !readOnly ? listeners : {})}
    >
      <div className="placed-module-content">
        <div className="placed-module-icon" style={{ color: module.color }}>
          {module.icon}
        </div>
        <div className="placed-module-info">
          <h5 className="placed-module-name">{module.name}</h5>
          <p className="placed-module-description">{module.description}</p>
        </div>
        {!module.isFixed && !readOnly && onRemoveModule && (
          <button 
            className="remove-module-btn"
            onClick={() => onRemoveModule(zoneId, index)}
            aria-label={`${module.name} 제거`}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

const DropZoneArea = ({ zone, placedModules = [], onRemoveModule, readOnly = false }) => {
  const droppableProps = !readOnly ? useDroppable({
    id: zone.id,
    data: {
      type: 'dropzone',
      zone: zone
    }
  }) : {
    isOver: false,
    setNodeRef: () => {}
  };

  const {
    isOver,
    setNodeRef
  } = droppableProps;

  const remainingSlots = zone.maxItems - placedModules.length;

  return (
    <div
      ref={setNodeRef}
      className={`drop-zone ${zone.id} ${isOver ? 'drag-over' : ''} ${placedModules.length === 0 ? 'empty' : ''}`}
      data-zone={zone.id}
    >
      <div className="drop-zone-header">
        <h4 className="drop-zone-title">{zone.name}</h4>
        <div className="drop-zone-info">
          <span className="slot-count">{placedModules.length}/{zone.maxItems}</span>
        </div>
      </div>
      
      <div className="drop-zone-content">
        {placedModules.length === 0 ? (
          <div className="drop-zone-placeholder">
            <div className="placeholder-icon">📋</div>
            <p className="placeholder-text">{zone.description}</p>
            <p className="placeholder-hint">{readOnly ? '배치된 모듈이 없습니다' : '모듈을 여기로 드래그하세요'}</p>
          </div>
        ) : (
          <div className="placed-modules">
            {placedModules.map((module, index) => (
              <PlacedModule
                key={`${module.id}-${index}`}
                module={module}
                index={index}
                zoneId={zone.id}
                onRemoveModule={onRemoveModule}
                readOnly={readOnly}
              />
            ))}
          </div>
        )}
        
        {remainingSlots > 0 && placedModules.length > 0 && (
          <div className="empty-slots">
            {Array(remainingSlots).fill().map((_, index) => (
              <div key={index} className="empty-slot">
                <span className="empty-slot-text">빈 슬롯</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {zone.id !== 'main_video' && !readOnly && (
        <div className="drop-zone-footer">
          <span className="accepted-categories">
            허용: {zone.acceptedCategories.map(cat => 
              cat === 'basic' ? '기본' : 
              cat === 'premium' ? '프리미엄' : 'AI'
            ).join(', ')}
          </span>
        </div>
      )}
    </div>
  );
};

export const DropZone = ({ placedModules, onRemoveModule, onClearAll, onSaveLayout, onPrev, totalModulesCount, showNavigation = false, sessionInfo, readOnly = false }) => {
  return (
    <div className={`drop-zones-container ${readOnly ? 'read-only' : ''}`}>
      {!readOnly && (
        <div className="drop-zones-header">
          <div className="drop-zones-info">
            <h3 className="drop-zones-title">레이아웃 디자이너</h3>
            <p className="drop-zones-subtitle">사용할 모듈을 배치하세요</p>
          </div>
          <div className="drop-zones-actions">
            {showNavigation && onPrev && (
              <button 
                className="prev-btn"
                onClick={onPrev}
              >
                ◀ 이전 단계
              </button>
            )}
            
            <button 
              className="clear-btn"
              onClick={onClearAll}
              disabled={totalModulesCount === 0}
            >
              배치 초기화
            </button>
            
            <button 
              className="save-btn"
              onClick={onSaveLayout}
            >
              {showNavigation ? '다음 단계 ▶' : '레이아웃 저장'}
            </button>
          </div>
        </div>
      )}
      
      <div className="drop-zones-layout">
        <div className="main-content">
          {dropZones.filter(zone => zone.id === 'main_video').map(zone => (
            <DropZoneArea 
              key={zone.id} 
              zone={zone} 
              placedModules={placedModules[zone.id] || []}
              onRemoveModule={onRemoveModule}
              readOnly={readOnly}
            />
          ))}
        </div>
        
        
        <div className="bottom-content">
          {dropZones.filter(zone => zone.gridArea === 'bottom').map(zone => (
            <DropZoneArea 
              key={zone.id} 
              zone={zone} 
              placedModules={placedModules[zone.id] || []}
              onRemoveModule={onRemoveModule}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
    </div>
  );
};