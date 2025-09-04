import { LayoutDesigner } from '../../components/features/sessionManager/LayoutDesigner';

export const SessionDesigner = ({ onNext, onPrev, sessionInfo, initialLayoutConfig, readOnly = false }) => {
  const handleLayoutSave = (layoutData) => {
    if (onNext) {
      onNext(layoutData);
    }
  };

  return (
    <div style={{ width: '100%', height: readOnly ? '100%' : '100vh', display: 'flex', flexDirection: 'column' }}>
      <LayoutDesigner 
        onSave={handleLayoutSave}
        onPrev={onPrev}
        sessionInfo={sessionInfo}
        showNavigation={!readOnly}
        initialLayoutConfig={initialLayoutConfig}
        readOnly={readOnly}
      />
    </div>
  );
};