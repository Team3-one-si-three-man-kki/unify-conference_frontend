import axios from 'axios';

// 1. Axios 인스턴스 생성
const apiClient = axios.create({
    // baseURL: 'http://localhost:9093', // 로컬 테스트용
    baseURL: 'https://api.unify-conference.store', // 백엔드 API 기본 주소
    withCredentials: true, // Refresh Token 쿠키를 주고받기 위해 필수!
});

// 2. 요청 인터셉터 (Request Interceptor)
//    - 모든 API 요청을 보내기 전에 가로채서 특정 작업을 수행합니다.
apiClient.interceptors.request.use(
    (config) => {
        // 세션 스토리지에서 Access Token을 가져옵니다.
        const accessToken = sessionStorage.getItem('accessToken');

        // 토큰이 있으면 Authorization 헤더에 추가합니다.
        if (accessToken) {
            config.headers['Authorization'] = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. 응답 인터셉터 (Response Interceptor)
//    - API 응답을 받은 후 가로채서 특정 작업을 수행합니다.
apiClient.interceptors.response.use(
    (response) => {
        // 정상 응답은 그대로 반환합니다.
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Access Token이 만료되었다는 응답(401 Unauthorized)을 받고,
        // 이 요청이 재시도된 요청이 아닐 경우에만 토큰 재발급을 시도합니다.
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // 무한 재발급 요청을 방지하기 위한 플래그

            try {
                // 토큰 재발급 API 호출 (이 요청은 인터셉터에 걸리지 않도록 새 인스턴스 사용 가능)
                // const refreshResponse = await axios.post('http://localhost:9093/api/guest/reissue-token', {}, { // 로컬 테스트용
                //     withCredentials: true // Refresh Token 쿠키 전송
                // });
                const refreshResponse = await axios.post('https://api.unify-conference.store/api/guest/reissue-token', {}, {
                    withCredentials: true // Refresh Token 쿠키 전송
                });

                const newAccessToken = refreshResponse.headers['authorization'];
                if (newAccessToken) {
                    sessionStorage.setItem('accessToken', newAccessToken);

                    // 실패했던 원래 요청의 헤더에 새로운 토큰을 설정하여 다시 보냅니다.
                    originalRequest.headers['Authorization'] = newAccessToken;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh Token도 만료되었거나 유효하지 않은 경우
                console.error('세션이 만료되었습니다. 다시 로그인해주세요.', refreshError);
                sessionStorage.removeItem('accessToken');
                // 로그인 페이지로 이동
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // 401 에러가 아니거나 재시도 실패 시, 원래 에러를 반환합니다.
        return Promise.reject(error);
    }
);

export const verifyRecaptcha = async (token) => {
    try {
        const response = await apiClient.post('/api/guest/verify-recaptcha', {
            recaptchaToken: token,
        });
        return response.data;
    } catch (error) {
        console.error('Error verifying reCAPTCHA', error);
        // 실패 시 에러 객체 또는 특정 값을 반환하여 UI에서 처리할 수 있도록 함
        return error.response ? error.response.data : { success: false, message: 'Network error' };
    }
};

export default apiClient;