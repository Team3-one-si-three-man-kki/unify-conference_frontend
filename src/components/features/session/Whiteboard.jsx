import React, { useRef } from 'react';
import styles from './Whiteboard.module.css';
import { useWhiteboard } from '../../../hooks/useWhiteboard';
import { useSessionStore } from '../../../store/session/sessionStore'; // Corrected import path
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMousePointer, faPencilAlt, faEraser, faSquare, faCircle, faSlash, faFont, faTrash, faBan } from '@fortawesome/free-solid-svg-icons';

const Whiteboard = ({ isVisible }) => {
  const canvasRef = useRef(null);
  const { isAdmin } = useSessionStore();

  const {
    color, width, mode,
    setColor, setWidth, setMode,
    clearCanvas, removeSelected
  } = useWhiteboard(canvasRef);

  if (!isVisible) return null;

  return (
    <div className={styles.canvasLayer}>
      {isAdmin && (
        <div className={styles.toolbar}>
          <button
            onClick={() => setMode('select')}
            className={`${styles.toolButton} ${mode === 'select' ? styles.active : ''}`}
            title="선택"
          >
            <FontAwesomeIcon icon={faMousePointer} />
          </button>
          <button
            onClick={() => setMode('pen')}
            className={`${styles.toolButton} ${mode === 'pen' ? styles.active : ''}`}
            title="펜"
          >
            <FontAwesomeIcon icon={faPencilAlt} />
          </button>
          <button
            onClick={() => setMode('eraser')}
            className={`${styles.toolButton} ${mode === 'eraser' ? styles.active : ''}`}
            title="지우개"
          >
            <FontAwesomeIcon icon={faEraser} />
          </button>
          <button
            onClick={() => setMode('rect')}
            className={`${styles.toolButton} ${mode === 'rect' ? styles.active : ''}`}
            title="사각형"
          >
            <FontAwesomeIcon icon={faSquare} />
          </button>
          <button
            onClick={() => setMode('circle')}
            className={`${styles.toolButton} ${mode === 'circle' ? styles.active : ''}`}
            title="원"
          >
            <FontAwesomeIcon icon={faCircle} />
          </button>
          <button
            onClick={() => setMode('line')}
            className={`${styles.toolButton} ${mode === 'line' ? styles.active : ''}`}
            title="선"
          >
            <FontAwesomeIcon icon={faSlash} />
          </button>
          <button
            onClick={() => setMode('text')}
            className={`${styles.toolButton} ${mode === 'text' ? styles.active : ''}`}
            title="텍스트"
          >
            <FontAwesomeIcon icon={faFont} />
          </button>

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className={styles.colorPicker}
            title="색상"
          />
          <input
            type="range"
            min="1"
            max="20"
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value))}
            className={styles.widthSlider}
            title="두께"
          />
          <button onClick={removeSelected} className={styles.toolButton} title="선택 삭제">
            <FontAwesomeIcon icon={faTrash} />
          </button>
          <button onClick={clearCanvas} className={styles.toolButton} title="모두 지우기">
            <FontAwesomeIcon icon={faBan} />
          </button>
        </div>
      )}
      <canvas ref={canvasRef} className={styles.whiteboardCanvas} />
    </div>
  );
};

export default Whiteboard;
