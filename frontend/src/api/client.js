/**
 * CC — Career Craft
 * API client — centralized axios instance with JWT token injection.
 */
import axios from 'axios';

// Automatic endpoint resolution:
// 1. Explicit VITE_API_URL if configured in deployment
// 2. In local dev (port 5173), direct connect to backend port 5000 with proxy fallback
// 3. In production, relative '/api' route handled by server
const API_BASE = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://127.0.0.1:5000/api'
    : '/api'
);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — DO NOT redirect if the request is login or register
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
