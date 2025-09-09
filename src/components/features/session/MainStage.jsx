// src/components/features/session/MainStage.jsx

import React, { useRef, useEffect, useMemo } from 'react';
import styles from './MainStage.module.css';
import { useMediaPipe } from '../../../hooks/useMediaPipe';
import { useSessionStore } from '../../../store/session/sessionStore';
import Whiteboard from './Whiteboard'; // Whiteboard 컴포넌트 임포트

// 🔽 LocalParticipant와 동일한 AiCanvas 컴포넌트 추가
const AiCanvas = ({ videoRef, canvasRef, aiEnabled }) => {
    useMediaPipe(videoRef, canvasRef, aiEnabled);
    return <canvas ref={canvasRef} className={styles.aiCanvas} />;
};

const MainStage = ({ participants, pinnedId, isCameraOff, localStream, localStreamError, isWhiteboardActive }) => {
  const mainVideoRef = useRef(null); // For main participant video
  const pipVideoRef = useRef(null); // For picture-in-picture local video when whiteboard is active
  const screenShareVideoRef = useRef(null);
  const aiCanvasRef = useRef(null);

  const { screenShareTrack, remoteScreenShareTrack, screenSharingParticipantId, sessionModules } = useSessionStore();

  const mainParticipant = useMemo(() => {
    const screenSharingParticipant = screenSharingParticipantId
      ? {
          id: screenSharingParticipantId, isScreenSharing: true,
          videoConsumer: { track: remoteScreenShareTrack },
          userName: participants.find(p => p.id === screenSharingParticipantId)?.userName || '화면 공유'
        }
      : null;

    if (screenSharingParticipant) return screenSharingParticipant;
    if (screenShareTrack) return null; // 로컬 화면 공유
    if (pinnedId) return participants.find(p => p.id === pinnedId);
    return participants.find(p => p.isLocal);
  }, [participants, pinnedId, screenShareTrack, remoteScreenShareTrack, screenSharingParticipantId]);


  const faceAiModule = sessionModules.find(m => m.code === 'FACEAI');
  const isScreenShareActive = !!screenShareTrack || !!remoteScreenShareTrack;
  
  const aiEnabled =
    !!faceAiModule &&
    mainParticipant?.isLocal &&
    !isCameraOff &&
    faceAiModule.isActive &&
    !isScreenShareActive;

  // 비디오 스트림 설정
  useEffect(() => {
    let targetVideoElement = null;
    if (isWhiteboardActive && mainParticipant?.isLocal) {
      targetVideoElement = pipVideoRef.current;
    } else if (!isWhiteboardActive) {
      targetVideoElement = mainVideoRef.current;
    }

    if (targetVideoElement) {
      let stream = null;
      if (mainParticipant?.isLocal) {
        stream = localStream;
      } else if (mainParticipant?.videoConsumer?.track) {
        stream = new MediaStream([mainParticipant.videoConsumer.track]);
      }
      targetVideoElement.srcObject = stream;
    }
  }, [mainParticipant, localStream, isWhiteboardActive]);

  // 화면 공유 스트림 설정 (기존과 동일)
  useEffect(() => {
    if (!screenShareVideoRef.current) return;
    const trackToDisplay = screenShareTrack || remoteScreenShareTrack;
    if (trackToDisplay) {
      screenShareVideoRef.current.srcObject = new MediaStream([trackToDisplay]);
    } else {
      screenShareVideoRef.current.srcObject = null;
    }
  }, [screenShareTrack, remoteScreenShareTrack]);

  const renderContent = () => {
    if (isWhiteboardActive) {
      return (
        <div className={`${styles.mainStageLayer} ${styles.whiteboardLayer}`}>
          <Whiteboard isVisible={isWhiteboardActive} />
          {/* Local participant's camera as a small picture-in-picture when whiteboard is active */}
          {mainParticipant?.isLocal && !isCameraOff && !localStreamError && (
            <div className={styles.pipVideoWrapper}>
              <video
                ref={pipVideoRef}
                autoPlay
                playsInline
                muted
                className={styles.pipVideoElement}
              />
              {/* When in PIP, AI canvas should also use pipVideoRef */}
              {!!faceAiModule && <AiCanvas videoRef={pipVideoRef} canvasRef={aiCanvasRef} aiEnabled={aiEnabled} />}
            </div>
          )}
        </div>
      );
    }

    if (isScreenShareActive) {
      return (
        <div className={`${styles.mainStageLayer} ${styles.screenShareLayer}`}>
          <video ref={screenShareVideoRef} autoPlay playsInline className={styles.mainVideoElement} />
        </div>
      );
    }

    if (mainParticipant) {
      const isActuallyCameraOff = mainParticipant.isLocal ? isCameraOff : mainParticipant.isCameraOff;
      return (
        <div className={`${styles.mainStageLayer} ${styles.pinnedVideoLayer}`}>
          {mainParticipant.isLocal && localStreamError ? (
            <div className={styles.videoErrorOverlay}>
              <p>카메라를 사용할 수 없습니다.</p>
            </div>
          ) : (
            <div className={styles.videoWrapper}>
              <video
                ref={mainVideoRef} autoPlay playsInline muted={mainParticipant.isLocal}
                className={styles.mainVideoElement}
                style={{ opacity: isActuallyCameraOff ? 0 : 1 }}
              />
              {isActuallyCameraOff && (
                <div className={styles.cameraOffOverlay}>
                  <div className={styles.avatarPlaceholder}>
                    {mainParticipant.userName ? mainParticipant.userName.charAt(0).toUpperCase() : ''}
                  </div>
                  <span>{mainParticipant.userName}</span>
                </div>
              )}
              {/* 🔽 모듈 존재 여부 확인 후 AiCanvas 렌더링 */}
              {!!faceAiModule && <AiCanvas videoRef={mainVideoRef} canvasRef={aiCanvasRef} aiEnabled={aiEnabled} />}
            </div>
          )}
        </div>
      );
    }
    
    return <div className={styles.dropZoneLabel}>메인 화면에 표시할 참여자가 없습니다.</div>;
  };
  
  return (
    <div id="mainStageContainer" className={styles.mainStageContainer}>
        {renderContent()}
    </div>
  );
};

export default MainStage;
