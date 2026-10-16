/**
 * CC — Career Craft
 * API client — centralized axios instance with JWT token injection.
 */
import axios from 'axios';

// Automatic endpoint resolution:
// 1. Explicit VITE_API_URL if configured in deployment
// 2. In local dev (port 5173), direct connect to backend port 5000 with proxy fallback
// 3. In production, relative '/api' route handled by server
// Centralized API client:
// Vite dev server proxies '/api' to 'http://127.0.0.1:5000'
// In production on Render, relative '/api' is routed to Flask
const API_BASE = import.meta.env.VITE_API_URL || '/api';

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

// Handle 401 globally without triggering hard page reload loops
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      // Only dispatch an event or let React router handle unauthenticated state;
      // avoid window.location.href reload loop
      window.dispatchEvent(new CustomEvent('cc_auth_unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
