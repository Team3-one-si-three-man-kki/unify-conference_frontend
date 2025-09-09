import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WaitingRoom.module.css';

const WaitingRoom = () => {
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [roomId, setRoomId] = useState('1004');

  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.oncanplay = () => {
          setIsVideoPlaying(true);
        };
      }
    } catch (err) {
      console.error('Error accessing media devices.', err);
      setIsVideoPlaying(false);
    }
  };

  useEffect(() => {
    getMedia();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const showVideo = !isCameraOff && isVideoPlaying;

  const handleJoin = () => {
    if (userName && userEmail && roomId) {
      navigate(`/session/${roomId}`, { 
          state: {
              userName: userName,
              userEmail: userEmail,
              isMicMuted: isMicMuted,
              isCameraOff: isCameraOff
          }
      });
    } else {
      alert('모든 필드를 입력해주세요.');
    }
  };

  return (
    <div className={styles.waitingRoomContainer}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>ModuLink 화상회의</h1>
      </header>
      <div className={styles.mainContentArea}>
        <div className={`${styles.previewArea} ${styles.fadeInUp}`}>
          <div className={styles.localVideoWrapper}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`${styles.localVideo} ${showVideo ? styles.visible : ''}`}
              onPlaying={() => setIsVideoPlaying(true)}
            />
            <div className={`${styles.cameraStatusOverlay} ${showVideo ? styles.hidden : ''}`}>
              <img src="/src/assets/icons/camera_off.svg" alt="Camera Off" className={styles.cameraOffIcon} />
              <p>{isCameraOff ? '카메라가 꺼져 있습니다' : '카메라 준비 중...'}</p>
            </div>
          </div>
          <div className={styles.controls}>
          <button 
            onClick={() => {
              const stream = localStreamRef.current;
              if (stream) {
                stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
                setIsMicMuted(prev => !prev);
              }
            }} 
            className={`${styles.controlButton} ${isMicMuted ? styles.micOff : styles.micOn}`}
          >
            {isMicMuted ? '음소거 해제' : '음소거'}
          </button>
          <button 
            onClick={async () => {
              const newIsCameraOff = !isCameraOff;
              setIsCameraOff(newIsCameraOff);

              if (newIsCameraOff) { // If turning camera OFF
                if (localStreamRef.current) {
                  localStreamRef.current.getTracks().forEach(track => track.stop());
                  localStreamRef.current = null;
                }
                if (localVideoRef.current) {
                  localVideoRef.current.srcObject = null;
                }
                setIsVideoPlaying(false);
              } else { // If turning camera ON
                await getMedia(); // Re-acquire media stream
              }
            }} 
            className={`${styles.controlButton} ${isCameraOff ? styles.videoOff : styles.videoOn}`}
          >
            {isCameraOff ? '카메라 켜기' : '카메라 끄기'}
          </button>
        </div>
      </div>
        <div className={`${styles.inputArea} ${styles.fadeInUp}`}>
          <h2>회의 입장</h2>
          <p>참여 정보를 입력하고 회의실에 입장하세요.</p>
          <label className={styles.inputLabel}>이름</label>
          <input
          type="text"
          placeholder="이름"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className={styles.inputField}
        />
        <label className={styles.inputLabel}>이메일</label>
        <input
          type="email"
          placeholder="your.email@example.com"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          className={styles.inputField}
        />
        <label className={styles.inputLabel}>회의 ID</label>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className={styles.inputField}
        />
        <button onClick={handleJoin} className={styles.joinButton}>입장하기</button>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
