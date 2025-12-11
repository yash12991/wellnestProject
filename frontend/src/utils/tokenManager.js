import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Auto-refresh access token when it expires
 * Call this function to get a valid access token
 */
export const getValidAccessToken = async () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!accessToken || !refreshToken) {
    return null;
  }

  // Check if token is expired or about to expire
  try {
    const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiryTime = tokenPayload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;

    // If token expires in less than 2 minutes, refresh it
    if (timeUntilExpiry < 2 * 60 * 1000) {
      console.log('🔄 Access token expiring soon, refreshing...');
      return await refreshAccessToken(refreshToken);
    }

    return accessToken;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    // If we can't parse token, try to refresh it
    return await refreshAccessToken(refreshToken);
  }
};

/**
 * Refresh the access token using the refresh token
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axios.post(
      `${API_URL}/v1/api/oauth/refresh-token`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (response.data.success) {
      const { accessToken, user } = response.data;
      
      // Update localStorage with new token
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ Access token refreshed successfully');
      return accessToken;
    }

    throw new Error('Token refresh failed');
  } catch (error) {
    console.error('❌ Failed to refresh token:', error.message);
    
    // If refresh fails, clear storage and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Redirect to login
    window.location.href = '/login?error=session_expired';
    
    return null;
  }
};

/**
 * Axios interceptor to automatically refresh tokens on 401 errors
 */
export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const newAccessToken = await refreshAccessToken(refreshToken);
          
          if (newAccessToken) {
            // Retry the original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          }
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Get authorization header with valid token
 */
export const getAuthHeader = async () => {
  const token = await getValidAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Check if user is logged in
 */
export const isAuthenticated = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return !!(accessToken && refreshToken);
};

/**
 * Logout user and clear all tokens
 */
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
