import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080' });

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// 동시에 여러 요청이 401을 받아도 재발급은 한 번만 하기 위한 처리
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

const handleLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {

    const originalRequest = error.config;

    // 401이 아니거나, 이미 재시도한 요청이면 그대로 에러 반환
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');

    // 리프레시 토큰 자체가 없으면 바로 로그아웃
    if (!refreshToken) {
      handleLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // 이미 다른 요청이 재발급을 진행 중이면, 그 결과를 기다렸다가 재요청
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshSubscribers.push((newAccessToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {

      const response = await axios.post(
        'http://localhost:8080/api/auth/refresh',
        { refreshToken }
      );

      const newAccessToken = response.data.accessToken;
      localStorage.setItem('accessToken', newAccessToken);

      isRefreshing = false;
      onRefreshed(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);

    } catch (refreshError) {

      isRefreshing = false;
      handleLogout();
      return Promise.reject(refreshError);

    }

  }
);

export default api;