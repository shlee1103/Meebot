import axios from "axios";

const apiClient = axios.create({
  baseURL: `https://meebot.site/`
});

// API 요청 시 모든 요청 헤더에 access token 포함
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // access token 만료 시 refresh token으로 새 access token 요청
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const { data } = await apiClient.post(
          "/api/v1/refresh",
          {},
          {
            headers: { "Refresh-Token": refreshToken },
          }
        );
        localStorage.setItem("access_token", data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('토큰 갱신 샐패 : ', refreshError)
        localStorage.clear()
        // Todo: 새 access token 갱신 실패 시 로직 처리하기
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
