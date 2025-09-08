// src/hooks/useMediaPipe.js
import { useState, useEffect, useRef } from 'react';
import { useSessionStore } from '../store/session/sessionStore';

export const useMediaPipe = (videoRef, canvasRef, enabled = true) => {
    const { roomClient, setIsDrowsy, setIsAbsent } = useSessionStore();
    const visionModuleRef = useRef(null);
    const filesetResolverRef = useRef(null); // 🔽 FilesetResolver를 저장할 ref 추가
    const [isMediaPipeReady, setIsMediaPipeReady] = useState(false); // 🔽 모듈과 리졸버 로딩 완료를 알리는 state
    const [faceLandmarker, setFaceLandmarker] = useState(null);
    const animationFrameIdRef = useRef(null);
    const drowsinessTimeoutRef = useRef(null);
    const absenceTimeoutRef = useRef(null);

    // Effect 1: MediaPipe 모듈과 FilesetResolver를 최초 1회만 로드합니다.
    useEffect(() => {
        const loadMediaPipe = async () => {
            if (visionModuleRef.current) return; // 이미 로드되었으면 중단

            try {
                const vision = await import('@mediapipe/tasks-vision');
                visionModuleRef.current = vision;
                console.log("useMediaPipe: Vision module loaded ONCE.");

                const { FilesetResolver } = vision;
                const resolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
                filesetResolverRef.current = resolver; // ref에 저장
                console.log("useMediaPipe: FilesetResolver created ONCE.");

                setIsMediaPipeReady(true); // 모든 준비가 끝났음을 알림
            } catch (error) {
                console.error("Failed to load MediaPipe dependencies:", error);
            }
        };
        loadMediaPipe();
    }, []); // 마운트 시 한 번만 실행

    // Effect 2: 'enabled'와 'isMediaPipeReady' 상태에 따라 FaceLandmarker 인스턴스를 관리합니다.
    useEffect(() => {
        if (!enabled || !isMediaPipeReady) {
            if (faceLandmarker) {
                faceLandmarker.close();
                setFaceLandmarker(null);
                console.log("useMediaPipe: FaceLandmarker instance closed.");
            }
            return;
        }

        let isCancelled = false;
        const initializeFaceLandmarker = async () => {
            if (faceLandmarker) return; // 이미 인스턴스가 있으면 중단

            try {
                const { FaceLandmarker } = visionModuleRef.current;
                const newLandmarker = await FaceLandmarker.createFromOptions(filesetResolverRef.current, { // 저장된 리졸버 사용
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true, runningMode: "VIDEO", numFaces: 1
                });

                if (!isCancelled) {
                    setFaceLandmarker(newLandmarker);
                    console.log("useMediaPipe: FaceLandmarker instance created.");
                } else {
                    newLandmarker.close();
                }
            } catch (error) {
                console.error("Failed to initialize FaceLandmarker:", error);
            }
        };

        initializeFaceLandmarker();

        return () => {
            isCancelled = true;
            // enabled가 false가 될 때 landmarker를 정리하는 로직은 effect 시작 부분에서 처리
        };
    }, [enabled, isMediaPipeReady]); // 'enabled' 상태 또는 준비 상태가 바뀔 때 실행

    // Effect 3: 실제 얼굴 감지 및 렌더링 로직 (기존과 거의 동일)
    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        // 🔽 visionModule 대신 isMediaPipeReady, visionModuleRef.current 사용
        if (!enabled || !faceLandmarker || !isMediaPipeReady || !video || !canvas || video.readyState < 3) {
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
            return;
        }

        const { DrawingUtils, FaceLandmarker: FL } = visionModuleRef.current;
        const context = canvas.getContext('2d');
        const drawingUtils = new DrawingUtils(context);
        let lastVideoTime = -1;

        const detectAndRender = () => {
            if (video.currentTime !== lastVideoTime) {
                lastVideoTime = video.currentTime;
                const results = faceLandmarker.detectForVideo(video, performance.now());

                context.clearRect(0, 0, canvas.width, canvas.height);
                if (results.faceLandmarks) {
                    for (const landmarks of results.faceLandmarks) {
                        drawingUtils.drawConnectors(landmarks, FL.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
                    }
                }

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
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
            if (drowsinessTimeoutRef.current) clearTimeout(drowsinessTimeoutRef.current);
            if (absenceTimeoutRef.current) clearTimeout(absenceTimeoutRef.current);
        };
    }, [faceLandmarker, enabled, isMediaPipeReady, videoRef, canvasRef, roomClient, setIsDrowsy, setIsAbsent]); // 🔽 의존성 배열 수정
};
