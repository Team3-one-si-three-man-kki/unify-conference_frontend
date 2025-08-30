// src/components/features/session/MainStage.jsx

import React, { useRef, useEffect } from 'react';
import styles from './MainStage.module.css';
import Whiteboard from './Whiteboard';
import { useSessionStore } from '../../../store/session/sessionStore';
const MainStage = ({ mainParticipant, isCameraOff, localStreamError }) => {
  const mainVideoRef = useRef(null);
  const screenShareVideoRef = useRef(null);

  const { roomClient, screenShareTrack, localStream, isWhiteboardActive } = useSessionStore();

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
    if (screenShareTrack) {
      screenShareVideoRef.current.srcObject = new MediaStream([screenShareTrack]);
    } else {
      screenShareVideoRef.current.srcObject = null;
    }
  }, [screenShareTrack]);

  return (
    <div id="mainStageContainer" className={styles.mainStageContainer}>
      {/* 3. screenShareTrack이 있으면 화면 공유를, 없으면 참여자 비디오를 보여줍니다. */}
      {screenShareTrack ? (
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
                <video
                  ref={mainVideoRef}
                  autoPlay
                  playsInline
                  muted={mainParticipant.isLocal}
                  className={`${styles.mainVideoElement} ${mainParticipant.isCameraOff ? styles.videoPaused : ''}`}
                  data-username={mainParticipant.userName || `User-${mainParticipant.id?.slice(-4)}`}
                />
              )}
            </>
          ) : (
            <div className={styles.dropZoneLabel}>연결된 참여자가 없습니다.</div>
          )}
        </div>
      )}
      
      <Whiteboard isVisible={isWhiteboardActive} roomClient={roomClient} />
    </div>
  );
};

export default MainStage;
