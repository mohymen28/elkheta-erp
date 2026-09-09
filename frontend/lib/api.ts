import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor لإضافة JWT Token تلقائياً وضبط الـ baseURL بمرونة على الشبكة المحلية
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Dynamic host matching for LAN/Mobile devices
    const currentHost = window.location.hostname;
    if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      if (!process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
        config.baseURL = `http://${currentHost}:5000/api`;
      }
    }

    const token = localStorage.getItem('erp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor للتعامل مع انتهاء الجلسة
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user_storage');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
