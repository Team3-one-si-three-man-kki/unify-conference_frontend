// src/components/features/session/Whiteboard.jsx
import React, { useRef, useState, useEffect } from 'react';
import styles from './Whiteboard.module.css';
import { useWhiteboard } from '../../../hooks/useWhiteboard';
import { useSessionStore } from '../../../store/session/sessionStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMousePointer, faPencilAlt, faEraser, faSquare, faCircle, faLongArrowAltRight, faFont, faTrash, faBan } from '@fortawesome/free-solid-svg-icons';

const Whiteboard = ({ isVisible }) => {
    const containerDivRef = useRef(null); // Stage의 부모 div를 위한 ref

    const { isAdmin } = useSessionStore();

    // useWhiteboard 훅에서 필요한 모든 상태와 함수를 받아옵니다.
    const {
        mode, setMode, color, setColor, width, setWidth, clearCanvas, removeSelected,
    } = useWhiteboard(containerDivRef); // Pass containerDivRef here

    if (!isVisible) return null;

    const tools = [
        { id: 'select', icon: faMousePointer, title: '선택' },
        { id: 'pen', icon: faPencilAlt, title: '펜' },
        { id: 'eraser', icon: faEraser, title: '지우개' },
        { id: 'rect', icon: faSquare, title: '사각형' },
        { id: 'circle', icon: faCircle, title: '원' },
        { id: 'arrow', icon: faLongArrowAltRight, title: '화살표' },
        { id: 'text', icon: faFont, title: '텍스트 (더블클릭)' },
    ];

    return (
        <div className={styles.whiteboardContainer}>
            {isAdmin && (
                <div className={styles.toolbar}>
                    {tools.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setMode(tool.id)}
                            className={`${styles.toolButton} ${mode === tool.id ? styles.active : ''}`}
                            title={tool.title}
                        >
                            <FontAwesomeIcon icon={tool.icon} />
                        </button>
                    ))}
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
                        max="30"
                        value={width}
                        onChange={(e) => setWidth(parseInt(e.target.value, 10))}
                        className={styles.widthSlider}
                        title="굵기"
                    />
                    <button onClick={removeSelected} className={styles.toolButton} title="선택 삭제">
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <button onClick={clearCanvas} className={styles.toolButton} title="모두 지우기">
                        <FontAwesomeIcon icon={faBan} />
                    </button>
                </div>
            )}
            <div ref={containerDivRef} className={styles.konvaContainer}>
            </div>
        </div>
    );
};

export default Whiteboard;
