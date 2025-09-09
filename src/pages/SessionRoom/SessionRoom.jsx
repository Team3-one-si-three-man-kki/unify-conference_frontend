import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SessionRoom.module.css';

import { RoomClient } from '../../services/RoomClient';
import { useSessionStore } from '../../store/session/sessionStore';

import MainStage from '../../components/features/session/MainStage';
import ControlBar from '../../components/features/session/ControlBar';
import Sidebar from '../../components/features/session/Sidebar';
import ChatWindow from '../../components/features/chat/ChatWindow';
import Modal from '../../components/ui/Modal/Modal';
import Participant from '../../components/features/session/Participant';
import LocalParticipant from '../../components/features/session/LocalParticipant';
import Whiteboard from '../../components/features/session/Whiteboard'; // Whiteboard 컴포넌트 임포트

export const SessionRoom = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [localRoomClient, setLocalRoomClient] = useState(null);
    const didAutoJoinRef = useRef(false);

    // Zustand 스토어에서 상태와 액션을 가져옵니다.
    const {
        isConnected, participants, localStream, isMicMuted, isCameraOff,
        isScreenSharing, screenShareTrack, remoteScreenShareTrack, screenSharingParticipantId,
        sessionModules, messages, isAdmin, isWhiteboardActive,
        isDrowsy, isAbsent, showAttendanceModal, error, localStreamError
    } = useSessionStore();

    const {
        handleConnectionOpen, handleConnectionClose, updateParticipant, removeParticipant,
        addMessage, setRoomClient, setLocalStream, setLocalStreamError, setIsAdmin, setIsMicMuted,
        setIsCameraOff, setIsScreenSharing, setRemoteScreenShare, setIsWhiteboardActive, setCanvasData,
        setIsDrowsy, setIsAbsent, setShowAttendanceModal, setError
    } = useSessionStore();

    // 컴포넌트 마운트 시 RoomClient 인스턴스 생성 및 이벤트 리스너 설정
    useEffect(() => {
        const client = new RoomClient(useSessionStore.setState, useSessionStore.getState);
        setLocalRoomClient(client); // 로컬 상태에 RoomClient 인스턴스 저장
        setRoomClient(client); // Zustand 스토어에 RoomClient 인스턴스 저장

        // --- 이벤트 리스너 재정리 ---

        // 1. 서버로부터 내 고유 ID를 받으면, '나'의 정보를 '생성'합니다.
        client.on('adminStatus', ({ peerId, isAdmin }) => {
            setIsAdmin(isAdmin);
            const { userName } = location.state || {}; // Get userName from location.state
            updateParticipant({ id: peerId, isLocal: true, userName: userName || '나' }); // Use provided userName or default to '나'
        });

        // 2. 내 로컬 미디어 스트림이 준비되면, '생성된 내 정보'에 스트림을 '추가(업데이트)'합니다.
        client.on('localStreamReady', (videoElement, peerId) => {
            setLocalStream(videoElement.srcObject);
            updateParticipant({ id: peerId, localStream: videoElement.srcObject });
        });
        
        // 3. 다른 사람의 미디어를 받으면, 해당 참가자 정보를 생성/업데이트합니다.
        client.on('new-consumer', (consumer) => {
            const { peerId, userName, source } = consumer.appData;

            if (source === 'screen') {
                setRemoteScreenShare(consumer.track, peerId);
                return;
            }

            const update = { id: peerId, userName, isLocal: false };
            if (consumer.kind === 'video') {
                update.videoConsumer = consumer;
            } else if (consumer.kind === 'audio') {
                update.audioConsumer = consumer;
            }
            updateParticipant(update);
        });

        // 4. 다른 사람이 나가면 명확한 이벤트로 처리합니다.
        client.on('peer-closed', ({ peerId }) => {
            removeParticipant(peerId);
        });

        client.on('producer-closed', ({ isRemoteScreenShare }) => {
            if (isRemoteScreenShare) {
                setRemoteScreenShare(null, null);
            }
        });
        
        // --- 나머지 이벤트 리스너들은 동일 ---
        client.on('connected', () => handleConnectionOpen('1004'));
        client.on('screenShareState', ({ isSharing, track }) => setIsScreenSharing(isSharing, track));
        client.on('chatMessage', addMessage);
        client.on('canvas', (data) => {
            if (data.type === 'activate') setIsWhiteboardActive(true);
            else if (data.type === 'deactivate') setIsWhiteboardActive(false);
            else setCanvasData(data);
        });
        client.on("localVideoStateChanged", (isEnabled) => setIsCameraOff(!isEnabled));
        client.on("localAudioStateChanged", (isEnabled) => setIsMicMuted(!isEnabled));

        // --- 원격 참여자 상태 변경 이벤트 핸들러 추가 ---
        const handleRemoteProducerState = ({ peerId, kind, paused }) => {
            if (!peerId) return;

            if (kind === 'video') {
                updateParticipant({ id: peerId, isCameraOff: paused });
            } else if (kind === 'audio') {
                updateParticipant({ id: peerId, isMicMuted: paused });
            }
        };

        client.on("remote-producer-pause", ({ producerId, kind }) => {
            const peerId = client.producerToPeerIdMap.get(producerId);
            handleRemoteProducerState({ peerId, kind, paused: true });
        });
        client.on("remote-producer-resume", ({ producerId, kind }) => {
            const peerId = client.producerToPeerIdMap.get(producerId);
            handleRemoteProducerState({ peerId, kind, paused: false });
        });
        // --- 핸들러 추가 끝 ---

        // 컴포넌트 언마운트 시 클린업
        return () => {
            client.close();
            handleConnectionClose();
        };
    }, []); // 의존성 배열을 비워 컴포넌트 마운트 시 한 번만 실행되도록 수정

    // 자동 조인 로직
    useEffect(() => {
        if (localRoomClient && !isConnected && !didAutoJoinRef.current) {
            didAutoJoinRef.current = true;
            const { userName, userEmail, isMicMuted: initialMicMuted, isCameraOff: initialCameraOff } = location.state || {};
            
            // 초기 음소거 및 카메라 상태 설정
            setIsMicMuted(initialMicMuted || false);
            setIsCameraOff(initialCameraOff || false);

            const testRoomId = '1004';
            const testUserName = userName || `TestUser-${Math.random().toString(36).substring(7)}`;
            const testUserEmail = userEmail || `test-${Math.random().toString(36).substring(7)}@example.com`;
            const testTenantId = '2';
            localRoomClient.join(testRoomId, testUserName, testUserEmail, testTenantId, {
                initialMicMuted: initialMicMuted,
                initialCameraOff: initialCameraOff
            });
        }
    }, [localRoomClient, isConnected, location.state]);

    // UI 상태 및 핸들러
    const [pinnedId, setPinnedId] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const handlePinParticipant = React.useCallback((id) => {
        setPinnedId(prev => (prev === id ? null : id));
    }, []);

    const { mainParticipant, sidebarParticipants } = useMemo(() => {
        const localParticipant = participants.find(p => p.isLocal);
        const remoteParticipants = participants.filter(p => !p.isLocal);
        const screenSharingParticipant = screenSharingParticipantId
            ? {
                id: screenSharingParticipantId,
                isScreenSharing: true,
                videoConsumer: { track: remoteScreenShareTrack },
                userName: participants.find(p => p.id === screenSharingParticipantId)?.userName || '화면 공유'
              }
            : null;

        let main = localParticipant;
        let sidebar = remoteParticipants;

        const isScreenShareActive = isScreenSharing || !!screenSharingParticipantId;

        if (isScreenShareActive) {
            main = screenSharingParticipant; // The screen share itself is the main content
            sidebar = participants; // All camera feeds (including the screen sharer's camera) go to the sidebar
        } else if (pinnedId) {
            main = participants.find(p => p.id === pinnedId);
            sidebar = participants.filter(p => p.id !== pinnedId);
        } else {
            // Default state: local participant is main, remote participants are sidebar
            main = localParticipant;
            sidebar = remoteParticipants;
        }

        // If whiteboard is active, and no screen share or pinned participant,
        // the local participant should still be the main content.
        // The MainStage component will handle rendering the whiteboard over/alongside it.
        if (isWhiteboardActive && !isScreenShareActive && !pinnedId) {
            main = localParticipant;
            sidebar = participants; // All camera feeds go to the sidebar
        }

        return { mainParticipant: main, sidebarParticipants: sidebar };
    }, [participants, pinnedId, isScreenSharing, screenSharingParticipantId, remoteScreenShareTrack, isWhiteboardActive]);
    const handleToggleChat = () => setIsChatOpen(prev => !prev);
    const handleLeaveRoom = () => {
        localRoomClient?.close();
        const roomId = location.pathname.split('/')[2];
        navigate(`/waiting/${roomId}`);
    };
    const toggleAudio = () => localRoomClient?.setAudioEnabled(isMicMuted);
    const toggleVideo = () => localRoomClient?.setVideoEnabled(isCameraOff);
    const toggleScreenShare = () => isScreenSharing ? localRoomClient?.stopScreenShare() : localRoomClient?.startScreenShare();
    const sendChatMessage = (text) => localRoomClient?.sendChatMessage(text);

    if (!isConnected) {
        return <div>세션 연결 중...</div>;
    }

    return (
        <div className={styles.sessionRoomContainer}>
            <div className={styles.mainContentArea}>
                <div className={styles.mainVideoArea}>
                    <MainStage
                        participants={participants}
                        pinnedId={pinnedId}
                        localStream={localStream}
                        isCameraOff={isCameraOff}
                        localStreamError={localStreamError}
                        isWhiteboardActive={isWhiteboardActive} // Pass isWhiteboardActive to MainStage
                    />
                </div>
                <Sidebar>
                    {sidebarParticipants.map(p => {
                        if (p.isLocal) {
                            return <LocalParticipant key={p.id} participant={p} onPin={handlePinParticipant} />;
                        }
                        return <Participant key={p.id} participant={p} onPin={handlePinParticipant} />;
                    })}
                </Sidebar>
            </div>
            {sessionModules.length > 0 && (
                <ControlBar
                    modules={sessionModules}
                    isMicMuted={isMicMuted}
                    isCameraOff={isCameraOff}
                    isScreenSharing={isScreenSharing}
                    onToggleAudio={toggleAudio}
                    onToggleVideo={toggleVideo}
                    onToggleScreenShare={toggleScreenShare}
                    onToggleChat={handleToggleChat}
                    onLeave={handleLeaveRoom}
                    isAdmin={isAdmin}
                    isWhiteboardActive={isWhiteboardActive}
                />
            )}
            {isChatOpen && <ChatWindow messages={messages} onSendMessage={sendChatMessage} onClose={handleToggleChat} />}
            
            {/* Modals */}
            <Modal isOpen={isDrowsy} onClose={() => setIsDrowsy(false)} title="경고: 졸음 감지!"><p>졸음이 감지되었습니다. 잠시 휴식을 취해주세요.</p></Modal>
            <Modal isOpen={isAbsent} onClose={() => setIsAbsent(false)} title="경고: 자리비움 감지!"><p>자리비움이 감지되었습니다. 화면으로 돌아와 주세요.</p></Modal>
            <Modal isOpen={showAttendanceModal} onClose={() => setShowAttendanceModal(false)} title="출석 확인"><p>세션에 입장하셨습니다. 출석이 확인되었습니다.</p></Modal>
            <Modal isOpen={!!error} onClose={() => setError(null)} title="오류 발생">
                <p>{error?.message}</p>
                {error?.details && <p><small>세부 정보: {error.details}</small></p>}
            </Modal>
        </div>
    );
};

export default SessionRoom;
