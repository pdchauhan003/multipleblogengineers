import axios from 'axios';

const isServer = typeof window === 'undefined';    // check server side or not window == undefine then server otherwise client
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://multipleblogengineers.onrender.com';
const baseURL = isServer
  ? `${backendUrl}/api`   // SSR: direct call to Render (server-to-server, no CORS)
  : '/api';               // Client: goes through Vercel proxy (vercel.json rewrite → Render)

const api = axios.create({
  baseURL,
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
api.interceptors.request.use((config) => {
  console.log(
    `[API] ${config.method?.toUpperCase()} ${config.url}`
  );
  return config;
});

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
        await api.post('/auth/refresh', {}, { withCredentials: true });

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
