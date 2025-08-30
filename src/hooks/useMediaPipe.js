// src/hooks/useMediaPipe.js
import { useState, useEffect, useRef } from 'react';
import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { useSessionStore } from '../store/session/sessionStore';

export const useMediaPipe = (videoRef, canvasRef, enabled = true) => {
    const { roomClient, setIsDrowsy, setIsAbsent } = useSessionStore();
    const [faceLandmarker, setFaceLandmarker] = useState(null);
    const animationFrameIdRef = useRef(null);
    const drowsinessTimeoutRef = useRef(null);
    const absenceTimeoutRef = useRef(null);

    // 1. MediaPipe 초기화
    useEffect(() => {
        if (!enabled) return;

        const initialize = async () => {
            const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
            const landmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                    delegate: "GPU"
                },
                outputFaceBlendshapes: true,
                runningMode: "VIDEO",
                numFaces: 1
            });
            setFaceLandmarker(landmarker);
            console.log("useMediaPipe: FaceLandmarker initialized.");
        };
        initialize();
    }, [enabled]);

    // 2. 얼굴 감지, 상태 분석 및 렌더링 로직 통합
    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!enabled || !faceLandmarker || !video || !canvas || video.readyState < 3) {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }
            if (drowsinessTimeoutRef.current) clearTimeout(drowsinessTimeoutRef.current);
            if (absenceTimeoutRef.current) clearTimeout(absenceTimeoutRef.current);
            return;
        }

        const context = canvas.getContext('2d');
        const drawingUtils = new DrawingUtils(context);
        let lastVideoTime = -1;

        const detectAndRender = () => {
            if (video.currentTime !== lastVideoTime) {
                lastVideoTime = video.currentTime;
                const results = faceLandmarker.detectForVideo(video, performance.now());

                // 렌더링 로직
                context.clearRect(0, 0, canvas.width, canvas.height);
                if (results.faceLandmarks) {
                    for (const landmarks of results.faceLandmarks) {
                        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
                    }
                }

                // AI 상태 분석 및 서버 전송 로직 (디바운싱 유지)
                const currentSessionState = useSessionStore.getState();

                if (results.faceLandmarks.length > 0) {
                    if (currentSessionState.isAbsent) {
                        setIsAbsent(false);
                        if (absenceTimeoutRef.current) clearTimeout(absenceTimeoutRef.current);
                        absenceTimeoutRef.current = setTimeout(() => {
                            roomClient?.sendPeerStatus({ isAbsent: false, time: performance.now() });
                        }, 500);
                    }

                    const blendshapes = results.faceBlendshapes[0]?.categories || [];
                    const eyeBlinkLeft = blendshapes.find(s => s.categoryName === 'eyeBlinkLeft')?.score || 0;
                    const eyeBlinkRight = blendshapes.find(s => s.categoryName === 'eyeBlinkRight')?.score || 0;
                    const isCurrentlyDrowsy = eyeBlinkLeft > 0.4 && eyeBlinkRight > 0.4;

                    if (isCurrentlyDrowsy !== currentSessionState.isDrowsy) {
                        setIsDrowsy(isCurrentlyDrowsy);
                        if (drowsinessTimeoutRef.current) clearTimeout(drowsinessTimeoutRef.current);
                        drowsinessTimeoutRef.current = setTimeout(() => {
                            roomClient?.sendPeerStatus({ isDrowsy: isCurrentlyDrowsy, time: performance.now() });
                        }, 500);
                    }
                } else {
                    if (!currentSessionState.isAbsent) {
                        setIsAbsent(true);
                        if (absenceTimeoutRef.current) clearTimeout(absenceTimeoutRef.current);
                        absenceTimeoutRef.current = setTimeout(() => {
                            roomClient?.sendPeerStatus({ isAbsent: true, time: performance.now() });
                        }, 500);
                    }
                }
            }
            animationFrameIdRef.current = requestAnimationFrame(detectAndRender);
        };

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        detectAndRender();

        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }
            if (drowsinessTimeoutRef.current) clearTimeout(drowsinessTimeoutRef.current);
            if (absenceTimeoutRef.current) clearTimeout(absenceTimeoutRef.current);
        };
    }, [faceLandmarker, videoRef, canvasRef, roomClient, setIsDrowsy, setIsAbsent, enabled]);
};
