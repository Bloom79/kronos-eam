/**
 * Authentication Service
 * Handles login, logout, registration, and user management
 */

import apiClient, { handleApiError } from './apiClient';
import { tokenStorage, TokenData, UserData } from '../storage/tokenStorage';

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserData;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  ruolo?: string;
  invitation_token?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
  message: string;
}

export interface PasswordResetRequest {
  email: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Create URLSearchParams for form-urlencoded data
      const params = new URLSearchParams();
      params.append('username', credentials.email);
      params.append('password', credentials.password);
      params.append('grant_type', 'password');
      
      const response = await apiClient.post<LoginResponse>('/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = response.data;

      // Store tokens and user data
      tokenStorage.setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        token_type: data.token_type,
      });
      tokenStorage.setUserData(data.user);

      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate token on server
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Even if logout fails, clear local tokens
      console.error('Logout error:', error);
    } finally {
      // Always clear local tokens
      tokenStorage.clearTokens();
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserData> {
    try {
      const response = await apiClient.get<UserData>('/auth/me');
      
      // Update stored user data
      tokenStorage.setUserData(response.data);
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<TokenData> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.post<TokenData>('/auth/refresh', {
        refresh_token: refreshToken,
      });

      const data = response.data;
      
      // Update tokens
      tokenStorage.setTokens(data);
      
      return data;
    } catch (error) {
      // Clear tokens on refresh failure
      tokenStorage.clearTokens();
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenStorage.isAuthenticated();
  }

  /**
   * Get stored user data
   */
  getStoredUser(): UserData | null {
    return tokenStorage.getUserData();
  }
}

// Export singleton instance
export const authService = new AuthService();