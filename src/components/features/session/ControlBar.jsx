// src/components/features/session/ControlBar.jsx

import React from 'react';
import styles from './ControlBar.module.css'; // ControlBar 전용 CSS Module 임포트
import { useSessionStore } from '../../../store/session/sessionStore'; // Zustand 스토어 임포트

const ControlBar = ({
  modules, // modules prop 추가
  isMicMuted,
  isCameraOff,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onLeave,
  isAdmin, // isAdmin prop 추가
  isWhiteboardActive, // isWhiteboardActive prop 추가
}) => {
  const { roomClient, setIsWhiteboardActive, toggleModuleActive, sessionModules } = useSessionStore();

  const handleToggleWhiteboard = () => {
    if (!roomClient) {
      console.error("RoomClient is not initialized.");
      return;
    }
    const activate = !isWhiteboardActive;
    roomClient._sendWsMessage({ action: "canvas", data: { type: activate ? "activate" : "deactivate" } });
    // Zustand 상태는 RoomClient의 'canvas' 이벤트 리스너에서 업데이트됩니다.
  };

  const getModuleProps = (module) => {
    switch (module.code) {
      case 'MIC':
        return {
          isActive: isMicMuted,
          handler: () => { console.log('ControlBar: MIC button clicked'); onToggleAudio(); },
          activeText: '음소거 됨',
          inactiveText: '음소거',
          activeIcon: '🔇',
          inactiveIcon: '🎤',
          activeColor: '#e74c3c',
        };
      case 'CAMERA':
        return {
          isActive: isCameraOff,
          handler: () => { console.log('ControlBar: CAMERA button clicked'); onToggleVideo(); },
          activeText: '비디오 끔',
          inactiveText: '비디오 켜기',
          activeIcon: '❌',
          inactiveIcon: '📷',
          activeColor: '#e74c3c',
        };
      case 'SCREEN':
        return {
          isActive: isScreenSharing,
          handler: () => { console.log('ControlBar: SCREEN button clicked'); onToggleScreenShare(); },
          activeText: '공유 중지',
          inactiveText: '화면 공유',
          activeIcon: '🖥️',
          inactiveIcon: '🖥️',
          activeColor: '#27ae60',
        };
      case 'CHAT':
        return {
          handler: () => { console.log('ControlBar: CHAT button clicked'); onToggleChat(); },
          inactiveText: module.name,
          inactiveIcon: module.icon,
        };
      case 'WHITEBOARD': // 화이트보드 모듈 추가
        return {
          isActive: isWhiteboardActive,
          handler: () => { console.log('ControlBar: WHITEBOARD button clicked'); handleToggleWhiteboard(); },
          activeText: '칠판 끄기',
          inactiveText: '칠판',
          activeIcon: '📝',
          inactiveIcon: '📝',
          activeColor: '#3498db',
        };
      case 'FACEAI': // Face AI 모듈 추가
        const faceAiModule = sessionModules.find(m => m.code === 'FACEAI');
        return {
          isActive: faceAiModule?.isActive || false,
          handler: () => { console.log('ControlBar: FACEAI button clicked'); toggleModuleActive('FACEAI'); },
          activeText: 'AI 끄기',
          inactiveText: 'AI 켜기',
          activeIcon: '🤖',
          inactiveIcon: '🤖',
          activeColor: '#9b59b6',
        };
      default:
        return {
          isActive: false,
          handler: () => { console.log(`ControlBar: ${module.name} button clicked`); alert(`${module.name} 기능 실행`); },
          inactiveText: module.name,
          inactiveIcon: module.icon,
        };
    }
  };

  return (
    <div id="group11" className={styles.controlBarContainer}>
      {modules.map(module => {
        // 관리자가 아니면 화이트보드 모듈을 숨깁니다.
        if (module.code === 'WHITEBOARD' && !isAdmin) {
          return null;
        }
        // 화면 공유 모듈은 isScreenSharing 상태에 따라 활성화/비활성화
        if (module.code === 'SCREEN' && !isAdmin) {
          return null; // 일반 사용자는 화면 공유 버튼 숨김
        }

        const props = getModuleProps(module);
        return (
          <button
            key={module.code}
            className={`${styles.controlButton} ${props.isActive ? styles.active : ''}`}
            onClick={props.handler}
            style={{ background: props.isActive ? props.activeColor : '' }}
          >
            <div className={styles.buttonIcon}>
              {props.isActive ? props.activeIcon : props.inactiveIcon}
            </div>
            <div className={styles.buttonName}>
              {props.isActive ? props.activeText : props.inactiveText}
            </div>
          </button>
        );
      })}

      {/* 나가기 버튼은 항상 표시 */}
      <button
        className={styles.leaveButton}
        style={{ order: 999 }}
        onClick={() => { console.log('ControlBar: Leave button clicked'); onLeave(); }}
      >
        나가기
      </button>
    </div>
  );
};

export default ControlBar;
