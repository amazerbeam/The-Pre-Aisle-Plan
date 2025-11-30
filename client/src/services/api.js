import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true  // IMPORTANT: Send cookies with requests
});

// Handle 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Don't redirect if already on login page or fetching current user
      const isAuthEndpoint = error.config?.url?.includes('/auth/me');
      if (!isAuthEndpoint && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
