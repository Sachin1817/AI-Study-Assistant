import axios from 'axios';

// Create configured Axios instance
const API = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 60000, // 60-second limit for large AI document loads
});

// Automatic JWT request headers injector
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('study_assistant_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Graceful response error inspector
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If JWT expires or is declared invalid by server, flush active session
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('study_assistant_token');
      localStorage.removeItem('study_assistant_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/register') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
