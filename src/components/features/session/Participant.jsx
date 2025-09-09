// src/components/features/session/Participant.jsx

import React, { useEffect, useRef } from 'react';
import styles from './Participant.module.css';
import { useMediaPipe } from '../../../hooks/useMediaPipe';
import { useSessionStore } from '../../../store/session/sessionStore'; // Import useSessionStore

const Participant = ({ participant, onPin }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const { faceAiModule } = useSessionStore(); // Get faceAiModule from store

  const aiEnabled = participant.isLocal && !participant.isCameraOff && (faceAiModule?.isActive || false); // Add faceAiModule?.isActive check
  useMediaPipe(videoRef, canvasRef, aiEnabled);

  // 비디오 트랙 연결
  useEffect(() => {
    let stream = null;
    if (participant.isLocal) {
      stream = participant.localStream;
    } else if (participant.videoConsumer?.track) {
      stream = new MediaStream([participant.videoConsumer.track]);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [participant.localStream, participant.videoConsumer]);

  // 오디오 트랙 연결
  useEffect(() => {
    if (audioRef.current && participant.audioConsumer?.track) {
      audioRef.current.srcObject = new MediaStream([participant.audioConsumer.track]);
    }
  }, [participant.audioConsumer]);

  // 클릭 시 onPin 함수를 호출합니다.
  const handleClick = () => {
    if (onPin) {
      onPin(participant.id);
    }
  };

  const { isMicMuted, isCameraOff } = participant;

  return (
    <div
      className={`${styles.participantContainer} ${isCameraOff ? styles.videoPaused : ''}`}
      onClick={handleClick}
      data-username={participant.userName || `User-${participant.id?.slice(-4)}`}
    >
      <audio ref={audioRef} autoPlay playsInline />
      
      <div className={styles.videoWrapper}>
        {(participant.videoConsumer?.track || participant.localStream) ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={participant.isLocal}
            className={styles.participantVideo}
            style={{ opacity: isCameraOff ? 0 : 1 }}
          />
        ) : (
          <div className={styles.noVideoOverlay}><p>영상 없음</p></div>
        )}
        {isCameraOff && (
          <div className={styles.cameraOffOverlay}>
            <div className={styles.avatarPlaceholder}>
              {participant.userName ? participant.userName.charAt(0).toUpperCase() : ''}
            </div>
            <span>{participant.userName || `User-${participant.id?.slice(-4)}`}</span>
          </div>
        )}
      </div>
      
      {aiEnabled && <canvas ref={canvasRef} className={styles.aiCanvas} />}
      <div className={styles.participantName}>
        {participant.userName || `참가자 ${participant.id?.slice(-4)}`}
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

export default Participant;
