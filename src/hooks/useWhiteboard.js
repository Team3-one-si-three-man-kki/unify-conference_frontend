// src/hooks/useWhiteboard.js

import { useState, useEffect, useRef, useCallback } from 'react';
import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { useSessionStore } from '../store/session/sessionStore'; // Corrected import path
import pako from 'pako'; // pako 임포트

export const useWhiteboard = (canvasRef) => {
    const { roomClient, canvasData, isAdmin } = useSessionStore();
    const fabricCanvasRef = useRef(null);
    const shapeRef = useRef(null); // 현재 그리고 있는 도형을 저장

    // 툴바 상태
    const [color, setColor] = useState('#000000');
    const [width, setWidth] = useState(5);
    const [mode, setMode] = useState('select');

    // 캔버스 객체를 찾는 헬퍼 함수
    const findObjectById = (id) => {
        return fabricCanvasRef.current?.getObjects().find(obj => obj.id === id);
    };

    // 데이터 전송 함수 (RoomClient를 통해)
    const signal = useCallback((data) => {
        roomClient?.sendCanvasData(data);
    }, [roomClient]);

    // 캔버스 초기화
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
        });
        fabricCanvasRef.current = canvas;

        // Fabric 객체에 id 속성 추가
        fabric.Object.prototype.toObject = ((originalToObject) => {
            return function (propertiesToInclude) {
                return fabric.util.object.extend(originalToObject.call(this, propertiesToInclude), { id: this.id });
            };
        })(fabric.Object.prototype.toObject);

        // 캔버스 사이즈 조절
        const resizeCanvas = () => {
            const container = canvasRef.current.parentElement;
            canvas.setWidth(container.offsetWidth);
            canvas.setHeight(container.offsetHeight);
            canvas.renderAll();
        };

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(canvasRef.current.parentElement);
        resizeCanvas();

        return () => {
            resizeObserver.disconnect();
            canvas.dispose();
        };
    }, [canvasRef]);

    // 서버로부터 받은 캔버스 데이터 처리
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas || !canvasData || canvasData.sender === roomClient?.myPeerId) return;

        switch (canvasData.type) {
            case 'fabric-path':
                fabric.Path.fromObject(canvasData.path, (obj) => canvas.add(obj));
                break;
            case 'shape-create':
                // 도형 생성 로직 (상대 좌표를 절대 좌표로 변환)
                fabric.util.enlivenObjects([canvasData.shape], (objects) => {
                    objects.forEach((obj) => {
                        canvas.add(obj);
                    });
                });
                break;
            case 'object-modified':
                const objToModify = findObjectById(canvasData.object.id);
                objToModify?.set(canvasData.object).setCoords();
                break;
            case 'object-removed':
                const objectsToRemove = canvas.getObjects().filter(obj => canvasData.ids.includes(obj.id));
                if (objectsToRemove.length > 0) canvas.remove(...objectsToRemove);
                break;
            case 'clear':
                canvas.clear();
                break;
        }
        canvas.renderAll();
    }, [canvasData, roomClient, findObjectById]); // findObjectById 추가

    // 그리기 모드 및 캔버스 이벤트 핸들러 설정
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas || !isAdmin) return; // 관리자만 그리기 이벤트 설정

        canvas.isDrawingMode = (mode === 'pen');
        canvas.selection = (mode === 'select');

        if (mode === 'pen') {
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.width = width;
            canvas.freeDrawingBrush.color = color;
        } else if (mode === 'eraser') {
            canvas.freeDrawingBrush = new fabric.EraserBrush(canvas); // Fabric.js 5.x 이상에서 EraserBrush 사용 가능
            canvas.freeDrawingBrush.width = width;
        }

        const handleMouseDown = (opt) => {
            if (mode === 'select' || mode === 'pen' || mode === 'eraser' || opt.target) return;
            const pointer = canvas.getPointer(opt.e);
            shapeRef.current = createShape(mode, pointer, color, width);
            if (shapeRef.current) canvas.add(shapeRef.current);
        };

        const handleMouseMove = (opt) => {
            if (!shapeRef.current) return;
            const pointer = canvas.getPointer(opt.e);
            updateShape(shapeRef.current, pointer);
            canvas.renderAll();
        };

        const handleMouseUp = () => {
            if (!shapeRef.current) return;
            shapeRef.current.setCoords();
            signal({ type: 'shape-create', shape: shapeRef.current.toObject() });
            shapeRef.current = null;
        };

        const handlePathCreated = (e) => {
            e.path.id = uuidv4();
            signal({ type: 'fabric-path', path: e.path.toObject() });
        };

        const handleObjectModified = (e) => {
            if (!e.target) return;
            signal({ type: 'object-modified', object: e.target.toObject(['id']) }); // id 속성 포함
        };

        // 이벤트 리스너 등록
        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);
        canvas.on('path:created', handlePathCreated);
        canvas.on('object:modified', handleObjectModified);

        return () => {
            // 이벤트 리스너 정리
            canvas.off('mouse:down', handleMouseDown);
            canvas.off('mouse:move', handleMouseMove);
            canvas.off('mouse:up', handleMouseUp);
            canvas.off('path:created', handlePathCreated);
            canvas.off('object:modified', handleObjectModified);
        };
    }, [mode, color, width, isAdmin, signal]);

    // 툴바 액션 함수들
    const clearCanvas = useCallback(() => {
        fabricCanvasRef.current?.clear();
        signal({ type: 'clear' });
    }, [signal]);

    const removeSelected = useCallback(() => {
        const activeObjects = fabricCanvasRef.current?.getActiveObjects();
        if (!activeObjects || activeObjects.length === 0) return;
        const ids = activeObjects.map(obj => obj.id);
        fabricCanvasRef.current?.remove(...activeObjects);
        fabricCanvasRef.current?.discardActiveObject().renderAll();
        signal({ type: 'object-removed', ids });
    }, [signal]);

    return { color, width, mode, setColor, setWidth, setMode, clearCanvas, removeSelected };
};

// 도형 생성을 위한 헬퍼 함수들
const createShape = (type, pointer, color, width) => {
    const commonOptions = {
        id: uuidv4(),
        left: pointer.x,
        top: pointer.y,
        originX: 'left',
        originY: 'top',
        stroke: color,
        strokeWidth: width,
        fill: 'transparent',
    };
    switch (type) {
        case 'rect': return new fabric.Rect({ ...commonOptions, width: 0, height: 0 });
        case 'circle': return new fabric.Circle({ ...commonOptions, radius: 0, originX: 'center', originY: 'center' });
        case 'line': return new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], commonOptions);
        case 'text': return new fabric.IText('Text', { ...commonOptions, fill: color, fontSize: width * 5 });
        default: return null;
    }
};

const updateShape = (shape, pointer) => {
    if (shape.type === 'rect') {
        shape.set({ width: pointer.x - shape.left, height: pointer.y - shape.top });
    } else if (shape.type === 'circle') {
        shape.set({ radius: Math.hypot(pointer.x - shape.left, pointer.y - shape.top) / 2 });
    } else if (shape.type === 'line') {
        shape.set({ x2: pointer.x, y2: pointer.y });
    }
};
