import axios from 'axios';

// Get base URL from environment or fall back to /api (for proxy or unified deployment)
const rawBaseURL = import.meta.env.VITE_API_URL;
const baseURL = (rawBaseURL && rawBaseURL.trim() !== '') ? rawBaseURL : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('finora_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (err) {
        console.error('Failed to parse stored user token:', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear localStorage
      localStorage.removeItem('finora_user');
      // Only redirect if not already on login or register pages
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/') {
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
