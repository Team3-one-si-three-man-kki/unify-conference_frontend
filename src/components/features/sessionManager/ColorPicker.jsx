import { useState } from 'react';
import './ColorPicker.css';

const ColorPicker = ({ onColorsChange, initialColors = { primary: '#4285f4', secondary: '#34A853' } }) => {
  const [selectedColors, setSelectedColors] = useState(initialColors);

  const predefinedColors = {
    primary: [
      '#4285f4', // Google Blue
      '#1976D2', // Blue
      '#673AB7', // Deep Purple
      '#9C27B0', // Purple
      '#E91E63', // Pink
      '#F44336', // Red
      '#FF5722', // Deep Orange
      '#FF9800', // Orange
    ],
    secondary: [
      '#34A853', // Green
      '#4CAF50', // Light Green
      '#8BC34A', // Light Green Alt
      '#CDDC39', // Lime
      '#FFEB3B', // Yellow
      '#FFC107', // Amber
      '#795548', // Brown
      '#607D8B', // Blue Grey
    ]
  };

  const handleColorChange = (type, color) => {
    const newColors = {
      ...selectedColors,
      [type]: color
    };
    setSelectedColors(newColors);
    onColorsChange(newColors);
  };

  return (
    <div className="color-picker-container">
      <div className="color-picker-header">
        <h3 className="color-picker-title">세션룸 색상</h3>
        <div className="current-colors">
          <div 
            className="color-preview primary" 
            style={{ backgroundColor: selectedColors.primary }}
            title="메인 컬러"
          ></div>
          <div 
            className="color-preview secondary" 
            style={{ backgroundColor: selectedColors.secondary }}
            title="서브 컬러"
          ></div>
        </div>
      </div>

      <div className="color-picker-content">
        <div className="color-section">
          <label className="color-label">메인 컬러</label>
          <div className="color-grid">
            {predefinedColors.primary.map((color) => (
              <button
                key={color}
                className={`color-option ${selectedColors.primary === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange('primary', color)}
                title={color}
              />
            ))}
          </div>
          <div className="custom-color-input">
            <input
              type="color"
              value={selectedColors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="color-input"
            />
            <span className="color-input-label">직접 선택</span>
          </div>
        </div>

        <div className="color-section">
          <label className="color-label">서브 컬러</label>
          <div className="color-grid">
            {predefinedColors.secondary.map((color) => (
              <button
                key={color}
                className={`color-option ${selectedColors.secondary === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange('secondary', color)}
                title={color}
              />
            ))}
          </div>
          <div className="custom-color-input">
            <input
              type="color"
              value={selectedColors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="color-input"
            />
            <span className="color-input-label">직접 선택</span>
          </div>
        </div>

        <div className="color-preview-section">
          <div className="preview-item">
            <span>메인:</span>
            <span style={{ color: selectedColors.primary, fontWeight: 'bold' }}>
              {selectedColors.primary}
            </span>
          </div>
          <div className="preview-item">
            <span>서브:</span>
            <span style={{ color: selectedColors.secondary, fontWeight: 'bold' }}>
              {selectedColors.secondary}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;