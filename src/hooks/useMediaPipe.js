// src/hooks/useMediaPipe.js
import { useState, useEffect, useRef } from 'react';
import { useSessionStore } from '../store/session/sessionStore';

// ✅ 핵심: 훅 외부에서 Promise를 관리하여 앱 전체에서 단 한 번만 실행되도록 보장합니다.
let visionPromise = null;
let filesetResolverPromise = null;

const loadVisionModule = () => {
    if (!visionPromise) {
        console.log("MediaPipe: Vision module loading initiated for the FIRST time.");
        visionPromise = import('@mediapipe/tasks-vision');
    }
    return visionPromise;
};

const createFilesetResolver = async () => {
    if (!filesetResolverPromise) {
        console.log("MediaPipe: FilesetResolver creation initiated for the FIRST time.");
        const vision = await loadVisionModule();
        filesetResolverPromise = vision.FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
    }
    return filesetResolverPromise;
};


export const useMediaPipe = (videoRef, canvasRef, enabled = true) => {
    const { roomClient, setIsDrowsy, setIsAbsent } = useSessionStore();
    const [isMediaPipeReady, setIsMediaPipeReady] = useState(false);
    const [faceLandmarker, setFaceLandmarker] = useState(null);
    const animationFrameIdRef = useRef(null);
    const drowsinessTimeoutRef = useRef(null);
    const absenceTimeoutRef = useRef(null);

    // Effect 1: 'enabled' 상태에 따라 MediaPipe 모듈과 FaceLandmarker 인스턴스를 관리합니다.
    useEffect(() => {
        let isCancelled = false;
        if (!enabled) {
            if (faceLandmarker) {
                faceLandmarker.close();
                setFaceLandmarker(null);
                console.log("useMediaPipe: FaceLandmarker instance closed.");
            }
            setIsMediaPipeReady(false); // Reset ready state when disabled
            return;
        }

        const initializeMediaPipe = async () => {
            try {
                // 전역 Promise를 호출하여, 이미 로드된 경우 즉시 반환받습니다.
                const vision = await loadVisionModule();
                const filesetResolver = await createFilesetResolver();

                if (isCancelled) return;

                // FaceLandmarker 인스턴스가 없으면 새로 생성합니다.
                if (!faceLandmarker) {
                    const newLandmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
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
                }

                if (!isCancelled) {
                    setIsMediaPipeReady(true);
                }
            } catch (error) {
                console.error("Failed to load MediaPipe dependencies or initialize FaceLandmarker:", error);
                if (!isCancelled) {
                    setIsMediaPipeReady(false);
                }
            }
        };

        initializeMediaPipe();

        return () => {
            isCancelled = true;
            // Cleanup FaceLandmarker if it was created in this effect and enabled becomes false
            if (faceLandmarker) {
                faceLandmarker.close();
                setFaceLandmarker(null);
                console.log("useMediaPipe: FaceLandmarker instance closed during cleanup.");
            }
            setIsMediaPipeReady(false);
        };
    }, [enabled, faceLandmarker]); // 'enabled'와 'faceLandmarker' 상태에 따라 실행됩니다.

    // Effect 2: 실제 얼굴 감지 및 렌더링 로직
    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!enabled || !faceLandmarker || !isMediaPipeReady || !video || !canvas || video.readyState < 3) {
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
            return;
        }

        // 이 Effect가 실행될 때 visionPromise는 이미 resolved 상태여야 합니다.
        Promise.resolve(visionPromise).then(vision => {
            const { DrawingUtils, FaceLandmarker: FL } = vision;
            const context = canvas.getContext('2d');
            const drawingUtils = new DrawingUtils(context);
            let lastVideoTime = -1;

            const detectAndRender = () => {
                if (video.readyState < 2) {
                    animationFrameIdRef.current = requestAnimationFrame(detectAndRender);
                    return;
                }

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
        });


        return () => {
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
            if (drowsinessTimeoutRef.current) clearTimeout(drowsinessTimeoutRef.current);
            if (absenceTimeoutRef.current) clearTimeout(absenceTimeoutRef.current);
        };
    }, [faceLandmarker, enabled, isMediaPipeReady]);
};
