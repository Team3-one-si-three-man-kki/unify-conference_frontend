// src/components/features/session/MainStage.jsx

import React, { useRef, useEffect } from 'react';
import styles from './MainStage.module.css';
import Whiteboard from './Whiteboard';
import { useSessionStore } from '../../../store/session/sessionStore';
import { useMediaPipe } from '../../../hooks/useMediaPipe';

import { useMemo } from 'react';

const MainStage = ({ participants, pinnedId, isCameraOff, localStream, localStreamError, isVisible }) => {
  const mainVideoRef = useRef(null);
  const screenShareVideoRef = useRef(null);
  const aiCanvasRef = useRef(null); // New ref for AI canvas

  const { roomClient, screenShareTrack, remoteScreenShareTrack, isWhiteboardActive, screenSharingParticipantId, sessionModules } = useSessionStore();

  const mainParticipant = useMemo(() => {
    const screenSharingParticipant = screenSharingParticipantId
      ? {
          id: screenSharingParticipantId,
          isScreenSharing: true,
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
  // AI 기능 활성화 조건: 로컬 참여자이고, 카메라가 켜져 있으며, FACEAI 모듈이 활성화되어 있고, 화면 공유 중이 아닐 때
  const aiEnabled = mainParticipant?.isLocal && !isCameraOff && (faceAiModule?.isActive || false) && !screenShareTrack && !remoteScreenShareTrack;
  useMediaPipe(mainVideoRef, aiCanvasRef, aiEnabled); // Pass aiCanvasRef to useMediaPipe

  // Main participant 비디오 스트림 설정
  useEffect(() => {
    if (mainVideoRef.current) {
      let stream = null;
      if (mainParticipant?.isLocal) {
        stream = localStream;
      } else if (mainParticipant?.videoConsumer?.track) {
        stream = new MediaStream([mainParticipant.videoConsumer.track]);
      }
      mainVideoRef.current.srcObject = stream;
    }
  }, [mainParticipant, localStream]);

  useEffect(() => {
    if (!screenShareVideoRef.current) return;
    const trackToDisplay = screenShareTrack || remoteScreenShareTrack;
    if (trackToDisplay) {
      screenShareVideoRef.current.srcObject = new MediaStream([trackToDisplay]);
    } else {
      screenShareVideoRef.current.srcObject = null;
    }
  }, [screenShareTrack, remoteScreenShareTrack]);

  return (
    <div id="mainStageContainer" className={styles.mainStageContainer}>
      {isVisible && (
        <>
          {/* 3. 화면 공유 트랙(로컬 또는 원격)이 있으면 화면 공유를, 없으면 참여자 비디오를 보여줍니다. */}
          {screenShareTrack || remoteScreenShareTrack ? (
            <div className={`${styles.mainStageLayer} ${styles.screenShareLayer}`}>
              <video
                ref={screenShareVideoRef}
                autoPlay
                playsInline
                className={styles.mainVideoElement}
              />
            </div>
          ) : (
            <div className={`${styles.mainStageLayer} ${styles.pinnedVideoLayer}`}>
              {mainParticipant ? (
                <>
                  {mainParticipant.isLocal && localStreamError ? (
                    <div className={styles.videoErrorOverlay}>
                      <p>카메라를 사용할 수 없습니다.</p>
                      {localStreamError?.details && <small>{localStreamError.details}</small>}
                    </div>
                  ) : (
                    <>
                      <div className={styles.videoWrapper}>
                        <video
                          ref={mainVideoRef}
                          autoPlay
                          playsInline
                          muted={mainParticipant.isLocal}
                          className={styles.mainVideoElement}
                          style={{ opacity: (!mainParticipant.isLocal && mainParticipant.isCameraOff) || (mainParticipant.isLocal && isCameraOff) ? 0 : 1 }}
                          data-username={mainParticipant.userName || `User-${mainParticipant.id?.slice(-4)}`}
                        />
                        {((!mainParticipant.isLocal && mainParticipant.isCameraOff) || (mainParticipant.isLocal && isCameraOff)) && (
                          <div className={styles.cameraOffOverlay}>
                            <span>{mainParticipant.userName}</span>
                          </div>
                        )}
                        {aiEnabled && <canvas ref={aiCanvasRef} className={styles.aiCanvas} />}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className={styles.dropZoneLabel}>연결된 참여자가 없습니다.</div>
              )}
            </div>
          )}
          {/* 디버깅을 위한 aiEnabled 상태 표시 (화면 공유 여부와 관계없이 항상 표시) */}
          <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '5px', zIndex: 1000 }}>
            AI Enabled: {aiEnabled ? 'True' : 'False'}
            <br />
            isLocal: {mainParticipant?.isLocal ? 'True' : 'False'}
            <br />
            isCameraOff: {isCameraOff ? 'True' : 'False'}
            <br />
            FACEAI Module Active: {faceAiModule?.isActive ? 'True' : 'False'}
            <br />
            ScreenShareTrack: {screenShareTrack ? 'True' : 'False'}
            <br />
            RemoteScreenShareTrack: {remoteScreenShareTrack ? 'True' : 'False'}
          </div>
        </>
      )}
    </div>
  );
};

export default MainStage;
