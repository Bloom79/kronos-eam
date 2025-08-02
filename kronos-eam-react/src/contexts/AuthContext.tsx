import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Utente } from '../types';
import { authService, tokenStorage } from '../services/api';

interface AuthContextType {
  user: Utente | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Utente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map backend role names to frontend role names
  const mapRole = (backendRole: string | undefined): 'Admin' | 'Asset Manager' | 'Plant Owner' | 'Operativo' | 'Viewer' => {
    if (!backendRole) return 'Viewer';
    
    const roleMap: Record<string, 'Admin' | 'Asset Manager' | 'Plant Owner' | 'Operativo' | 'Viewer'> = {
      'Admin': 'Admin',
      'Asset Manager': 'Asset Manager',
      'Plant Owner': 'Plant Owner',
      'Operator': 'Operativo',
      'Viewer': 'Viewer'
    };
    return roleMap[backendRole] || 'Viewer';
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Try to get user data from storage first
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser({
              id: storedUser.id,
              name: storedUser.name,
              email: storedUser.email,
              ruolo: mapRole(storedUser.role || storedUser.ruolo),
              status: 'Attivo',
              tenant: storedUser.tenant_id,
              ultimoAccesso: new Date().toISOString()
            });
          }
          
          // Then fetch fresh user data from server
          try {
            const userData = await authService.getCurrentUser();
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              ruolo: mapRole(userData.role || userData.ruolo),
              status: 'Attivo',
              tenant: userData.tenant_id,
              ultimoAccesso: new Date().toISOString()
            });
          } catch (error) {
            // If fetching fresh data fails, keep the stored user data
            console.error('Failed to fetch fresh user data:', error);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        tokenStorage.clearTokens();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await authService.login({ email, password });
      
      // Convert backend user data to frontend Utente format
      const userData = response.user;
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        ruolo: mapRole(userData.role),
        status: 'Attivo',
        tenant: userData.tenant_id,
        ultimoAccesso: new Date().toISOString()
      });
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setLoading(false);
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  const isAuthenticated = !!user && authService.isAuthenticated();

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      loading,
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};