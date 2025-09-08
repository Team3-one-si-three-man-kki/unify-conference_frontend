import { useState, useEffect, useRef, useCallback } from 'react';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import { useSessionStore } from '../store/session/sessionStore';

export const useWhiteboard = (containerRef) => {
    const { roomClient, canvasData, isAdmin } = useSessionStore();
    const stageRef = useRef(null);
    const layerRef = useRef(null);
    const transformerRef = useRef(null);

    const [mode, setMode] = useState('select');
    const [color, setColor] = useState('#000000');
    const [width, setWidth] = useState(5);
    const [objects, setObjects] = useState([]);
    const [selectedObjectIds, setSelectedObjectIds] = useState([]); // New state for selected object IDs

    const isDrawing = useRef(false);
    const currentShape = useRef(null);

    // mode, color, width는 자주 바뀌므로, 이벤트 핸들러에서 직접 참조할 수 있도록 ref에 저장합니다.
    const modeRef = useRef(mode);
    const colorRef = useRef(color);
    const widthRef = useRef(width);
    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { colorRef.current = color; }, [color]);
    useEffect(() => { widthRef.current = width; }, [width]);

    const signal = useCallback((data) => {
        if (isAdmin) {
            roomClient?.sendCanvasData(data);
        }
    }, [roomClient, isAdmin]);

    // Effect 1: Konva Stage를 생성하고 파괴하는 역할만 담당합니다.
    useEffect(() => {
        // containerRef.current가 유효할 때만 Stage를 생성합니다.
        if (containerRef.current && !stageRef.current) {
            console.log('useWhiteboard: Initializing Konva Stage because container is ready.');
            const container = containerRef.current;
            const stage = new Konva.Stage({
                container: container,
                width: container.offsetWidth,
                height: container.offsetHeight,
            });
            stageRef.current = stage;

            const layer = new Konva.Layer();
            stage.add(layer);
            layerRef.current = layer;

            const transformer = new Konva.Transformer({
                nodes: [],
                keepRatio: true,
                boundBoxFunc: (oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox),
            });
            layer.add(transformer);
            transformerRef.current = transformer;

            const resizeObserver = new ResizeObserver(() => {
                if (stageRef.current && containerRef.current) {
                    stageRef.current.width(containerRef.current.offsetWidth);
                    stageRef.current.height(containerRef.current.offsetHeight);
                }
            });
            resizeObserver.observe(container);

            // Cleanup 함수: 컴포넌트가 사라질 때 Stage를 파괴합니다.
            return () => {
                console.log('useWhiteboard: Cleaning up Konva Stage.');
                resizeObserver.disconnect();
                stage.destroy();
                stageRef.current = null;
                layerRef.current = null;
                transformerRef.current = null;
            };
        }
    }, [containerRef.current]); // containerRef.current가 변경될 때 (DOM 마운트/언마운트) 실행됩니다.

    // Effect 2: Stage에 이벤트 리스너를 추가/제거합니다.
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;

        const handleMouseDown = (e) => {
            if (modeRef.current === 'select') {
                if (e.target === stage) {
                    setSelectedObjectIds([]); // Deselect all
                    return;
                }
                // Selection logic is now handled by the click event on individual Konva nodes in Effect 4
                // This ensures the transformer gets the *new* node instance after redraws.
                return;
            }

            isDrawing.current = true;
            const pos = stage.getPointerPosition();
            const id = uuidv4();
            const commonProps = { id, name: 'shape' };
            const currentStroke = colorRef.current;
            const currentStrokeWidth = widthRef.current;

            let newShape;
            switch (modeRef.current) {
                case 'pen':
                case 'eraser':
                    newShape = { ...commonProps, type: 'line', points: [pos.x, pos.y], stroke: currentStroke, strokeWidth: currentStrokeWidth, mode: modeRef.current };
                    break;
                case 'rect':
                    newShape = { ...commonProps, type: 'rect', x: pos.x, y: pos.y, width: 0, height: 0, stroke: currentStroke, strokeWidth: currentStrokeWidth, fill: 'transparent' };
                    break;
                case 'circle':
                    newShape = { ...commonProps, type: 'circle', x: pos.x, y: pos.y, radius: 0, stroke: currentStroke, strokeWidth: currentStrokeWidth, fill: 'transparent' };
                    break;
                case 'arrow':
                    newShape = { ...commonProps, type: 'arrow', points: [pos.x, pos.y, pos.x, pos.y], stroke: currentStroke, strokeWidth: currentStrokeWidth, fill: currentStroke, pointerLength: 10, pointerWidth: 10 };
                    break;
                default:
                    isDrawing.current = false;
                    return;
            }
            currentShape.current = newShape;
            setObjects(prev => [...prev, newShape]);
        };

        const handleMouseMove = () => {
            if (!isDrawing.current || !currentShape.current) return;
            const pos = stage.getPointerPosition();
            const shape = currentShape.current;
            let updatedShape = { ...shape };

            switch (shape.type) {
                case 'line':
                    updatedShape.points = [...shape.points, pos.x, pos.y];
                    break;
                case 'rect':
                    updatedShape.width = pos.x - shape.x;
                    updatedShape.height = pos.y - shape.y;
                    break;
                case 'circle':
                    updatedShape.radius = Math.sqrt(Math.pow(pos.x - shape.x, 2) + Math.pow(pos.y - shape.y, 2));
                    break;
                case 'arrow':
                    updatedShape.points = [shape.points[0], shape.points[1], pos.x, pos.y];
                    break;
            }
            setObjects(prev => prev.map(obj => obj.id === shape.id ? updatedShape : obj));
            currentShape.current = updatedShape;
        };

        const handleMouseUp = () => {
            if (isDrawing.current && currentShape.current) {
                signal({ type: 'add_object', object: currentShape.current });
            }
            isDrawing.current = false;
            currentShape.current = null;
        };

        const handleDblClick = (e) => {
            if (modeRef.current === 'text' && e.target === stage) {
                const pos = stage.getPointerPosition();
                const id = uuidv4();
                const newText = { id, type: 'text', x: pos.x, y: pos.y, text: '텍스트 입력', fontSize: widthRef.current * 3, fill: colorRef.current, name: 'shape' };
                setObjects(prev => [...prev, newText]);
                signal({ type: 'add_object', object: newText });
            }
        };

        stage.on('mousedown touchstart', handleMouseDown);
        stage.on('mousemove touchmove', handleMouseMove);
        stage.on('mouseup touchend', handleMouseUp);
        stage.on('dblclick', handleDblClick);

        return () => {
            stage.off('mousedown touchstart', handleMouseDown);
            stage.off('mousemove touchmove', handleMouseMove);
            stage.off('mouseup touchend', handleMouseUp);
            stage.off('dblclick', handleDblClick);
        };
    }, [signal, stageRef.current]); // signal 함수가 변경될 때만 리스너를 다시 부착합니다.

    // Effect 3: 외부 데이터(네트워크)를 받아 캔버스를 업데이트합니다.
    useEffect(() => {
        if (!canvasData || (canvasData.sender && canvasData.sender === roomClient?.myPeerId)) return;
        switch (canvasData.type) {
            case 'add_object':
                setObjects(prev => [...prev.filter(o => o.id !== canvasData.object.id), canvasData.object]);
                break;
            case 'update_object':
                setObjects(prev => prev.map(obj => obj.id === canvasData.object.id ? canvasData.object : obj));
                break;
            case 'remove_objects':
                setObjects(prev => prev.filter(obj => !canvasData.ids.includes(obj.id)));
                setSelectedObjectIds(prev => prev.filter(id => !canvasData.ids.includes(id))); // Clear selected IDs
                break;
            case 'clear':
                setObjects([]);
                setSelectedObjectIds([]); // Clear selected IDs
                break;
        }
    }, [canvasData, roomClient]);

    // Effect 4: 로컬 `objects` 상태가 변경되면 Konva 객체를 다시 그립니다.
    useEffect(() => {
        const layer = layerRef.current;
        const stage = stageRef.current;
        const transformer = transformerRef.current;
        if (!layer || !transformer) return;

        layer.destroyChildren(); // transformer는 유지해야 하므로 자식만 제거
        layer.add(transformer); // 제거된 transformer 다시 추가

        objects.forEach(obj => {
            let konvaNode;
            const commonProps = { id: obj.id, draggable: isAdmin && mode === 'select', name: 'shape' };
            switch (obj.type) {
                case 'line':
                    konvaNode = new Konva.Line({ ...obj, ...commonProps, globalCompositeOperation: obj.mode === 'eraser' ? 'destination-out' : 'source-over' });
                    break;
                case 'rect':
                    konvaNode = new Konva.Rect({ ...obj, ...commonProps });
                    break;
                case 'circle':
                    konvaNode = new Konva.Circle({ ...obj, ...commonProps });
                    break;
                case 'arrow':
                    konvaNode = new Konva.Arrow({ ...obj, ...commonProps });
                    break;
                case 'text':
                    konvaNode = new Konva.Text({ ...obj, ...commonProps });
                    konvaNode.on('dblclick', () => {
                        if (!isAdmin) return;
                        const textPosition = konvaNode.getAbsolutePosition();
                        const stageBox = stage.container().getBoundingClientRect();
                        const areaPosition = { x: stageBox.left + textPosition.x, y: stageBox.top + textPosition.y };

                        const textarea = document.createElement('textarea');
                        document.body.appendChild(textarea);
                        textarea.value = konvaNode.text();
                        textarea.style.position = 'absolute';
                        textarea.style.top = `${areaPosition.y}px`;
                        textarea.style.left = `${areaPosition.x}px`;
                        textarea.style.width = `${konvaNode.width()}px`;
                        textarea.style.zIndex = '10000';
                        textarea.focus();

                        const finishEditing = () => {
                            konvaNode.text(textarea.value);
                            const updatedText = { ...obj, text: textarea.value };
                            setObjects(prev => prev.map(o => o.id === obj.id ? updatedText : o));
                            signal({ type: 'update_object', object: updatedText });
                            if (document.body.contains(textarea)) {
                                document.body.removeChild(textarea);
                            }
                        };
                        textarea.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter' && !e.shiftKey) finishEditing();
                            else if (e.key === 'Escape') document.body.removeChild(textarea);
                        });
                        textarea.addEventListener('blur', finishEditing);
                    });
                    break;
                default: return;
            }
            konvaNode.on('dragend', (e) => {
                const updatedObj = { ...obj, x: e.target.x(), y: e.target.y() };
                setObjects(prev => prev.map(o => o.id === obj.id ? updatedObj : o));
                signal({ type: 'update_object', object: updatedObj });
            });
            konvaNode.on('transformend', (e) => {
                const node = e.target;
                const updatedObj = { ...obj, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() };
                setObjects(prev => prev.map(o => o.id === obj.id ? updatedObj : o));
                signal({ type: 'update_object', object: updatedObj });
            });

            // Add click handler for selection
            konvaNode.on('click', (e) => {
                if (modeRef.current === 'select' && isAdmin) {
                    setSelectedObjectIds([e.target.id()]);
                }
            });

            layer.add(konvaNode);
        });

        // Update transformer nodes after all objects are redrawn
        const newSelectedNodes = selectedObjectIds
            .map(id => layer.findOne(`#${id}`))
            .filter(node => node); // Filter out null/undefined if a selected object was removed

        transformer.nodes(newSelectedNodes);
        transformer.getLayer()?.batchDraw(); // Redraw transformer to show/hide handles
    }, [objects, isAdmin, mode, signal, selectedObjectIds]); // Add selectedObjectIds to dependencies

    const clearCanvas = useCallback(() => {
        setObjects([]);
        signal({ type: 'clear' });
        setSelectedObjectIds([]); // Clear selected IDs
    }, [signal]);

    const removeSelected = useCallback(() => {
        const nodes = transformerRef.current?.nodes() || [];
        if (nodes.length > 0) {
            const idsToRemove = nodes.map(node => node.id());
            setObjects(prev => prev.filter(obj => !idsToRemove.includes(obj.id)));
            signal({ type: 'remove_objects', ids: idsToRemove });
            setSelectedObjectIds([]); // Clear selected IDs
        }
    }, [signal]);

    return { mode, setMode, color, setColor, width, setWidth, clearCanvas, removeSelected };
};
