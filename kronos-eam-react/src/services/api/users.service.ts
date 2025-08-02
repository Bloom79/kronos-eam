/**
 * Users Service
 * Manages user operations including CRUD, role management, and bulk actions
 */

import apiClient, { handleApiError } from './apiClient';

export type UserRole = 'Admin' | 'Asset Manager' | 'Plant Owner' | 'Operative' | 'Viewer';
export type UserStatus = 'Active' | 'Suspended' | 'Invited';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  department?: string;
  position?: string;
  plants?: number[];
  lastAccess?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  permissions?: string[];
}

export interface UserCreate {
  name: string;
  email: string;
  role: UserRole;
  plants?: number[];
  phone?: string;
  department?: string;
  position?: string;
  sendInvite?: boolean;
}

export interface UserUpdate extends Partial<UserCreate> {
  status?: UserStatus;
}

export interface UserListResponse {
  items: User[];
  total: number;
  skip: number;
  limit: number;
  stats?: {
    total: number;
    byRole: Record<UserRole, number>;
    byStatus: Record<UserStatus, number>;
    activeToday: number;
    activeThisWeek: number;
  };
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  plants?: number[];
  department?: string;
  sortBy?: 'name' | 'email' | 'lastAccess' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface BulkOperation {
  userIds: string[];
  operation: 'activate' | 'suspend' | 'delete' | 'changeRole';
  params?: {
    role?: UserRole;
    reason?: string;
  };
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details?: Record<string, any>;
  ip?: string;
}

class UsersService {
  private readonly basePath = '/users';

  /**
   * Get all users with optional filters
   */
  async getUsers(filters?: UserFilters): Promise<UserListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await apiClient.get(`${this.basePath}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<User> {
    try {
      const response = await apiClient.get(`${this.basePath}/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new user
   */
  async createUser(data: UserCreate): Promise<User> {
    try {
      const response = await apiClient.post(this.basePath, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UserUpdate): Promise<User> {
    try {
      const response = await apiClient.put(`${this.basePath}/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Bulk operations on multiple users
   */
  async bulkOperation(operation: BulkOperation): Promise<{ success: number; failed: number; errors?: string[] }> {
    try {
      const response = await apiClient.post(`${this.basePath}/bulk`, operation);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Reset user password
   */
  async resetPassword(userId: string): Promise<void> {
    try {
      await apiClient.post(`${this.basePath}/${userId}/reset-password`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Resend invitation email
   */
  async resendInvite(userId: string): Promise<void> {
    try {
      await apiClient.post(`${this.basePath}/${userId}/resend-invite`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get user activity log
   */
  async getUserActivity(userId: string, limit: number = 50): Promise<UserActivity[]> {
    try {
      const response = await apiClient.get(`${this.basePath}/${userId}/activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Export users to CSV
   */
  async exportUsers(filters?: UserFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.get(`${this.basePath}/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(role: UserRole): Promise<string[]> {
    try {
      const response = await apiClient.get(`${this.basePath}/roles/${role}/permissions`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const usersService = new UsersService();