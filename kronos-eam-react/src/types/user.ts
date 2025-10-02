export enum UserRole {
  ADMIN = "Admin",
  ASSET_MANAGER = "Asset Manager",
  PLANT_OWNER = "Plant Owner",
  OPERATIVE = "Operative",
  VIEWER = "Viewer",
}

export enum UserStatus {
  ACTIVE = "Active",
  SUSPENDED = "Suspended",
  INVITED = "Invited",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  notifications: boolean;
}

export interface UserActivity {
  id: string;
  action: string;
  timestamp: string;
  details?: any;
}

export interface UserTenant {
  id: string;
  name: string;
  role: UserRole;
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
  // Legacy fields
  action?: 'activate' | 'deactivate' | 'delete' | 'changeRole';
  newRole?: UserRole;
}