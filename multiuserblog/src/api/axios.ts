import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Auth routes that should NOT go through the token-refresh interceptor.
// If a login/register call returns 401 (e.g. wrong password), we must
// surface the original backend message — not swallow it with a failing refresh.
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/google', '/auth/refresh'];

const isAuthRoute = (url?: string) =>
  AUTH_ROUTES.some((route) => url?.includes(route));

// Response interceptor to handle token refreshing automatically on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for auth endpoints — pass original error straight through
    if (isAuthRoute(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // Check if response is 401 Unauthorized and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the cookie-based session/tokens
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });

        // Retry the original request using the updated cookie-based session
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, reject the promise (which triggers redirect to login in authContext)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
