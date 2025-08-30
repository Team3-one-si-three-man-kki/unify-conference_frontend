import React, { useRef, useEffect } from 'react';
import styles from './Participant.module.css';
import { useMediaPipe } from '../../../hooks/useMediaPipe';
import { useSessionStore } from '../../../store/session/sessionStore';

const LocalParticipant = ({ participant, onPin }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const { isCameraOff, localStreamError } = useSessionStore();

    const aiEnabled = !isCameraOff && !localStreamError;
    useMediaPipe(videoRef, canvasRef, aiEnabled);

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

            {aiEnabled && <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />}

            <div className={styles.participantName}>
                {participant.userName}
            </div>
            <div className={styles.statusIndicatorContainer}>
                {participant.isMicMuted && (
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
