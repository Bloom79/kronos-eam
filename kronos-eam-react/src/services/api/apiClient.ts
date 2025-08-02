/**
 * API Client Configuration
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { tokenStorage } from '../storage/tokenStorage';

// Get API URL from environment or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant ID from user data
    const userData = tokenStorage.getUserData();
    if (userData?.tenant_id) {
      config.headers['X-Tenant-ID'] = userData.tenant_id;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: new_refresh_token, expires_in } = response.data;
          
          // Update tokens
          tokenStorage.setTokens({
            access_token,
            refresh_token: new_refresh_token,
            expires_in,
            token_type: 'bearer',
          });

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        tokenStorage.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error('Permission denied:', error.response.data);
    } else if (error.response?.status === 404) {
      // Not found
      console.error('Resource not found:', error.response.data);
    } else if (error.response?.status === 500) {
      // Server error
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    } else if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.message) {
      return error.message;
    }
  }
  return 'An unexpected error occurred';
};

// Export configured axios instance
export default apiClient;