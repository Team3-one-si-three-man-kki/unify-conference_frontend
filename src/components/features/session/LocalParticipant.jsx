// src/components/features/session/LocalParticipant.jsx
import React, { useRef, useEffect } from 'react';
import styles from './Participant.module.css';
import { useMediaPipe } from '../../../hooks/useMediaPipe';
import { useSessionStore } from '../../../store/session/sessionStore';

// 🔽 [핵심] useMediaPipe 훅을 직접 호출하는 대신, 이 훅을 포함하는 작은 컴포넌트를 만듭니다.
const AiCanvas = ({ videoRef, canvasRef, aiEnabled }) => {
    useMediaPipe(videoRef, canvasRef, aiEnabled);
    return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />;
};

const LocalParticipant = ({ participant, onPin }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const { isCameraOff, isMicMuted, localStreamError, sessionModules } = useSessionStore();

    // 🔽 1. FACEAI 모듈이 존재하는지 먼저 확인합니다.
    const faceAiModule = sessionModules.find(m => m.code === 'FACEAI');

    // 🔽 2. 모듈이 존재하고, 활성화 상태일 때만 AI 기능을 켭니다.
    const aiEnabled =
        !!faceAiModule &&
        faceAiModule.isActive &&
        !isCameraOff &&
        !localStreamError;

    useEffect(() => {
        if (videoRef.current && participant.localStream) {
            videoRef.current.srcObject = participant.localStream;
        }
    }, [participant.localStream]);

    return (
        <div
            className={`${styles.participantContainer} ${isCameraOff ? styles.videoPaused : ''}`}
            onClick={() => onPin(participant.id)}
            data-username={participant.userName}
        >
            {localStreamError ? (
                 <div className={styles.noVideoOverlay}><p>카메라 오류</p></div>
            ) : (
                <video ref={videoRef} autoPlay playsInline muted className={styles.participantVideo} />
            )}

            {/* 🔽 3. 모듈이 존재할 때만 AiCanvas 컴포넌트를 렌더링하여 useMediaPipe를 호출합니다. */}
            {!!faceAiModule && <AiCanvas videoRef={videoRef} canvasRef={canvasRef} aiEnabled={aiEnabled} />}

            <div className={styles.participantName}>
                {participant.userName}
            </div>
            <div className={styles.statusIndicatorContainer}>
                {isMicMuted && (
                    <div className={styles.audioMutedIndicator} title="음소거됨"></div>
                )}
                {isCameraOff && (
                    <div className={styles.videoPausedIndicator} title="비디오 꺼짐"></div>
                )}
            </div>
        </div>
    );
};

export default LocalParticipant;
