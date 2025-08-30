import { LayoutDesigner } from './LayoutDesigner';
import './ModuleLayoutDesignerWidget.css';

export const ModuleLayoutDesignerWidget = ({ 
  width = '100%', 
  height = '600px', 
  showHeader = true,
  className = '',
  onSave
}) => {
  return (
    <div 
      className={`module-layout-widget ${className}`}
      style={{ width, height }}
    >
      <LayoutDesigner 
        showHeader={showHeader}
        onSave={onSave}
      />
    </div>
  );
};