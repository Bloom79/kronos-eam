/**
 * Token Storage Service
 * Manages JWT tokens in localStorage with security considerations
 */

const ACCESS_TOKEN_KEY = 'kronos_access_token';
const REFRESH_TOKEN_KEY = 'kronos_refresh_token';
const USER_DATA_KEY = 'kronos_user_data';

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  ruolo?: string;
  role?: string;
  tenant_id: string;
  permissions: string[];
}

class TokenStorage {
  // Store tokens
  setTokens(tokens: TokenData): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    
    // Calculate and store expiry time
    const expiryTime = new Date().getTime() + (tokens.expires_in * 1000);
    localStorage.setItem(`${ACCESS_TOKEN_KEY}_expiry`, expiryTime.toString());
  }

  // Get access token
  getAccessToken(): string | null {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const expiry = localStorage.getItem(`${ACCESS_TOKEN_KEY}_expiry`);
    
    // Check if token is expired
    if (token && expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (new Date().getTime() > expiryTime) {
        // Token is expired
        this.clearAccessToken();
        return null;
      }
    }
    
    return token;
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  // Clear access token only (used during refresh)
  clearAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(`${ACCESS_TOKEN_KEY}_expiry`);
  }

  // Clear all tokens (logout)
  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(`${ACCESS_TOKEN_KEY}_expiry`);
    localStorage.removeItem(USER_DATA_KEY);
  }

  // Store user data
  setUserData(user: UserData): void {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }

  // Get user data
  getUserData(): UserData | null {
    const data = localStorage.getItem(USER_DATA_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  // Get time until token expiry (in seconds)
  getTokenExpiryTime(): number | null {
    const expiry = localStorage.getItem(`${ACCESS_TOKEN_KEY}_expiry`);
    if (expiry) {
      const expiryTime = parseInt(expiry, 10);
      const now = new Date().getTime();
      const timeLeft = (expiryTime - now) / 1000; // Convert to seconds
      return timeLeft > 0 ? timeLeft : null;
    }
    return null;
  }
}

// Export singleton instance
export const tokenStorage = new TokenStorage();