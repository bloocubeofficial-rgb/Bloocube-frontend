export type Role = 'creator' | 'brand';

export function isAuthorized(role: Role) {
  return role === 'creator' || role === 'brand';
}

// Cache for auth data to avoid repeated localStorage access
let authCache: {
  token: string | null;
  user: Record<string, unknown> | null;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Authentication utilities with caching
export const authUtils = {
  // Get token from localStorage with caching
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Check cache first
    if (authCache && Date.now() - authCache.timestamp < CACHE_DURATION) {
      // Only treat as a valid cache hit if we actually have a token
      if (authCache.token) {
        console.log('🔍 Auth cache hit:', { hasToken: !!authCache.token, timestamp: authCache.timestamp });
        return authCache.token;
      }
      // Otherwise fall through to read from localStorage
      console.log('🔍 Auth cache hit but empty token, refreshing from localStorage');
    }
    
    const token = localStorage.getItem('token');
    console.log('🔍 Auth cache miss - localStorage check:', { 
      hasToken: !!token, 
      tokenLength: token?.length || 0,
      cacheExpired: authCache ? Date.now() - authCache.timestamp > CACHE_DURATION : 'no cache'
    });
    
    // Update cache
    authCache = {
      token,
      user: authCache?.user || null,
      timestamp: Date.now()
    };
    
    return token;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  },

  // Get user data from localStorage with caching
  getUser(): Record<string, unknown> | null {
    if (typeof window === 'undefined') return null;
    
    // Check cache first
    if (authCache && Date.now() - authCache.timestamp < CACHE_DURATION) {
      return authCache.user;
    }
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      
      // Update cache
      authCache = {
        token: authCache?.token || null,
        user,
        timestamp: Date.now()
      };
      
      return user;
    } catch {
      return null;
    }
  },

  // Clear authentication data
  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    
    // Clear cache
    authCache = null;
    console.log('🧹 Auth data cleared');
  },

  // Set authentication data
  setAuth(token: string, user: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update cache
    authCache = {
      token,
      user,
      timestamp: Date.now()
    };
  },

  // Set token only (useful for auto-login scenarios)
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
    
    // Update cache
    authCache = {
      token,
      user: authCache?.user || null,
      timestamp: Date.now()
    };
  },

  // Clear cache (useful for testing or forced refresh)
  clearCache(): void {
    authCache = null;
    console.log('🧹 Auth cache cleared');
  },

  // Force refresh token from localStorage (bypass cache)
  forceRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('token');
    console.log('🔄 Force refresh token:', { hasToken: !!token, tokenLength: token?.length || 0 });
    
    // Update cache with fresh data
    authCache = {
      token,
      user: authCache?.user || null,
      timestamp: Date.now()
    };
    
    return token;
  },

  // Debug function to check authentication state
  debugAuthState(): void {
    if (typeof window === 'undefined') {
      console.log('🔍 Auth debug: Running on server side');
      return;
    }

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const refreshToken = localStorage.getItem('refreshToken');
    
    console.log('🔍 Auth Debug State:', {
      localStorage: {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        hasUser: !!user,
        hasRefreshToken: !!refreshToken,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
      },
      cache: authCache ? {
        hasToken: !!authCache.token,
        hasUser: !!authCache.user,
        timestamp: authCache.timestamp,
        age: Date.now() - authCache.timestamp,
        isExpired: Date.now() - authCache.timestamp > CACHE_DURATION
      } : 'no cache',
      computed: {
        getToken: this.getToken(),
        isAuthenticated: this.isAuthenticated(),
        getUser: this.getUser()
      }
    });
  }
};

// Make debug function available globally for testing
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).debugAuth = () => authUtils.debugAuthState();
  (window as unknown as Record<string, unknown>).clearAuthCache = () => authUtils.clearCache();
  (window as unknown as Record<string, unknown>).forceRefreshToken = () => authUtils.forceRefreshToken();
}

