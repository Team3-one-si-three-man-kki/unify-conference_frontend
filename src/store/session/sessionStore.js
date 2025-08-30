// src/store/sessionStore.js

import { create } from 'zustand';
import { fetchSessionModules } from '../../services/api/sessionApi';

export const useSessionStore = create((set, get) => ({
    // =================================================================
    // S T A T E (상태)
    // =================================================================
    isConnected: false,
    participants: [],
    localStream: null,
    isAdmin: false,
    isMicMuted: false,
    isCameraOff: false,
    isScreenSharing: false,
    screenShareTrack: null,
    isDrowsy: false,
    isAbsent: false,
    showAttendanceModal: false,
    sessionModules: [],
    messages: [],
    isWhiteboardActive: false,
    canvasData: null,
    error: null,
    localStreamError: null,

    // =================================================================
    // A C T I O N S (액션)
    // =================================================================

    handleConnectionOpen: async (roomId) => {
        set({ isConnected: true });
        try {
            const modules = await fetchSessionModules(roomId);
            set({ sessionModules: modules, showAttendanceModal: true });
        } catch (error) {
            console.error("Failed to fetch session modules:", error);
            set({ error: { message: "세션 모듈을 불러오는 데 실패했습니다." } });
        }
    },

    handleConnectionClose: () => {
        get().resetSession();
    },

    updateParticipant: (participantUpdate) => set(state => {
        const participants = [...state.participants];
        const index = participants.findIndex(p => p.id === participantUpdate.id);

        if (index > -1) {
            // Merge new properties into the existing participant object
            participants[index] = { ...participants[index], ...participantUpdate };
        } else {
            // Add new participant
            participants.push(participantUpdate);
        }
        return { participants };
    }),

    removeParticipant: (peerId) => set(state => ({
        participants: state.participants.filter(p => p.id !== peerId),
    })),

    addMessage: (message) => set(state => ({
        messages: [...state.messages, message],
    })),

    setLocalStream: (stream) => set({ localStream: stream }),
    setLocalStreamError: (error) => set({ localStreamError: error }),
    setIsAdmin: (isAdmin) => set({ isAdmin }),
    setIsMicMuted: (isMuted) => set({ isMicMuted: isMuted }),
    setIsCameraOff: (isOff) => set({ isCameraOff: isOff }),
    setIsScreenSharing: (isSharing, track = null) => set({ isScreenSharing: isSharing, screenShareTrack: track }),
    setIsWhiteboardActive: (isActive) => set({ isWhiteboardActive: isActive }),
    setCanvasData: (data) => set({ canvasData: data }),
    setIsDrowsy: (isDrowsy) => set({ isDrowsy }),
    setIsAbsent: (isAbsent) => set({ isAbsent }),
    setShowAttendanceModal: (show) => set({ showAttendanceModal: show }),
    setError: (error) => set({ error }),

    resetSession: () => {
        set({
            isConnected: false,
            participants: [],
            localStream: null,
            isAdmin: false,
            isMicMuted: false,
            isCameraOff: false,
            isScreenSharing: false,
            screenShareTrack: null,
            isDrowsy: false,
            isAbsent: false,
            showAttendanceModal: false,
            sessionModules: [],
            messages: [],
            isWhiteboardActive: false,
            canvasData: null,
            error: null,
            localStreamError: null,
        });
    }
}));
