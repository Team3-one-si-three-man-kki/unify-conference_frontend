// src/services/sessionApi.js

// 서버 API를 호출하는 것을 시뮬레이션하는 함수입니다.
// 1초 후에 미리 정의된 모듈 목록을 반환합니다.
export const fetchSessionModules = async (sessionId) => {
    console.log(`[API] Fetching modules for session: ${sessionId}`);

    return new Promise(resolve => {
        setTimeout(() => {
            const mockModules = [
                { code: 'MIC', name: '마이크', icon: '🎤', type: 'ACTION_MODULE' },
                { code: 'CAMERA', name: '카메라', icon: '📷', type: 'ACTION_MODULE' },
                { code: 'SCREEN', name: '화면공유', icon: '🖥️', type: 'ACTION_MODULE' },
                { code: 'CHAT', name: '채팅', icon: '💬', type: 'UI_MODULE' },
                { code: 'WHITEBOARD', name: '칠판', icon: '칠판아이콘', type: 'UI_MODULE' },
                // { code: 'FACEAI', name: '집중도', icon: '🤖', type: 'UI_MODULE' },
            ];
            console.log('[API] Mock modules fetched:', mockModules);
            resolve(mockModules);
        }, 1000); // 1초 지연 시뮬레이션
    });
};
