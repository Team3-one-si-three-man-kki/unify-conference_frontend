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

export const SessionRoom = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [roomClient, setRoomClient] = useState(null);
    const didAutoJoinRef = useRef(false);

    // Zustand 스토어에서 상태와 액션을 가져옵니다.
    const {
        isConnected, participants, localStream, isMicMuted, isCameraOff,
        isScreenSharing, sessionModules, messages, isAdmin, isWhiteboardActive,
        isDrowsy, isAbsent, showAttendanceModal, error, localStreamError
    } = useSessionStore();

    const {
        handleConnectionOpen, handleConnectionClose, updateParticipant, removeParticipant,
        addMessage, setLocalStream, setLocalStreamError, setIsAdmin, setIsMicMuted,
        setIsCameraOff, setIsScreenSharing, setIsWhiteboardActive, setCanvasData,
        setIsDrowsy, setIsAbsent, setShowAttendanceModal, setError
    } = useSessionStore.getState();

    // 컴포넌트 마운트 시 RoomClient 인스턴스 생성 및 이벤트 리스너 설정
    useEffect(() => {
        const client = new RoomClient(useSessionStore.setState, useSessionStore.getState);
        setRoomClient(client);

        // --- 이벤트 리스너 재정리 ---

        // 1. 서버로부터 내 고유 ID를 받으면, '나'의 정보를 '생성'합니다.
        client.on('adminStatus', ({ peerId, isAdmin }) => {
            setIsAdmin(isAdmin);
            updateParticipant({ id: peerId, isLocal: true, userName: '나' });
        });

        // 2. 내 로컬 미디어 스트림이 준비되면, '생성된 내 정보'에 스트림을 '추가(업데이트)'합니다.
        client.on('localStreamReady', (videoElement, peerId) => {
            setLocalStream(videoElement.srcObject);
            updateParticipant({ id: peerId, localStream: videoElement.srcObject });
        });
        
        // 3. 다른 사람의 미디어를 받으면, 해당 참가자 정보를 생성/업데이트합니다.
        client.on('new-consumer', (consumer) => {
            const { peerId, userName } = consumer.appData;
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

        // 컴포넌트 언마운트 시 클린업
        return () => {
            client.close();
            handleConnectionClose();
        };
    }, []); // 의존성 배열이 비어있는 것은 올바릅니다.

    // 자동 조인 로직
    useEffect(() => {
        if (roomClient && !isConnected && !didAutoJoinRef.current) {
            didAutoJoinRef.current = true;
            const { userName, userEmail, isMicMuted: initialMicMuted, isCameraOff: initialCameraOff } = location.state || {};
            
            // 초기 음소거 및 카메라 상태 설정
            setIsMicMuted(initialMicMuted || false);
            setIsCameraOff(initialCameraOff || false);

            const testRoomId = '1004';
            const testUserName = userName || `TestUser-${Math.random().toString(36).substring(7)}`;
            const testUserEmail = userEmail || `test-${Math.random().toString(36).substring(7)}@example.com`;
            const testTenantId = '2';
            roomClient.join(testRoomId, testUserName, testUserEmail, testTenantId, {
                initialMicMuted: initialMicMuted,
                initialCameraOff: initialCameraOff
            });
        }
    }, [roomClient, isConnected, location.state]);

    // UI 상태 및 핸들러
    const [pinnedId, setPinnedId] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const localParticipant = useMemo(() => {
        const p = participants.find(p => p.isLocal);
        if (p) {
            // Ensure the local participant object has the latest camera status from the store
            return { ...p, isCameraOff };
        }
        return p;
    }, [participants, isCameraOff]);
    const remoteParticipants = useMemo(() => participants.filter(p => !p.isLocal), [participants]);

    const mainParticipant = useMemo(() => {
        if (pinnedId) return participants.find(p => p.id === pinnedId);
        return remoteParticipants.length > 0 ? remoteParticipants[0] : localParticipant;
    }, [pinnedId, participants, remoteParticipants, localParticipant]);

    const handlePinParticipant = React.useCallback((id) => {
        setPinnedId(prev => (prev === id ? null : id));
    }, []);

    const sidebarParticipants = useMemo(() =>
        participants
            .filter(p => p.id !== mainParticipant?.id)
            .map(p => {
                if (p.isLocal) {
                    return <LocalParticipant key={p.id} participant={p} onPin={handlePinParticipant} />;
                }
                return <Participant key={p.id} participant={p} onPin={handlePinParticipant} />;
            }),
        [participants, mainParticipant, handlePinParticipant]
    );
    const handleToggleChat = () => setIsChatOpen(prev => !prev);
    const handleLeaveRoom = () => {
        roomClient?.close();
        navigate('/');
    };
    const toggleAudio = () => roomClient?.setAudioEnabled(!isMicMuted);
    const toggleVideo = () => roomClient?.setVideoEnabled(!isCameraOff);
    const toggleScreenShare = () => isScreenSharing ? roomClient?.stopScreenShare() : roomClient?.startScreenShare();
    const sendChatMessage = (text) => roomClient?.sendChatMessage(text);

    if (!isConnected) {
        return <div>세션 연결 중...</div>;
    }

    return (
        <div className={styles.sessionRoomContainer}>
            <div className={styles.mainContentArea}>
                <div className={styles.mainVideoArea}>
                    <MainStage
                        mainParticipant={mainParticipant}
                        localStream={localStream}
                        isWhiteboardActive={isWhiteboardActive}
                        isCameraOff={isCameraOff}
                        localStreamError={localStreamError}
                    />
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
                </div>
                <Sidebar>
                    {sidebarParticipants}
                </Sidebar>
            </div>
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
