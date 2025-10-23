// src/lib/cookieAuth.ts
// Cookie-based authentication utilities for HttpOnly cookies

export type Role = 'creator' | 'brand' | 'admin';

export function isAuthorized(role: Role) {
  return role === 'creator' || role === 'brand' || role === 'admin';
}

// Cache for user data (tokens are HttpOnly and not accessible via JS)
let userCache: {
  user: Record<string, unknown> | null;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cookie-based authentication utilities
export const cookieAuthUtils = {
  // Get user data from cookie (non-HttpOnly cookie)
  getUser(): Record<string, unknown> | null {
    if (typeof window === 'undefined') return null;
    
    try {
      // Check cache first
      if (userCache && Date.now() - userCache.timestamp < CACHE_DURATION) {
        return userCache.user;
      }
      
      // Read from cookie
      const userCookie = this.getCookie('user_data');
      if (!userCookie) {
        console.log('🔍 No user_data cookie found');
        return null;
      }
      
      const user = JSON.parse(userCookie);
      
      // Validate user data structure
      if (!user || typeof user !== 'object' || !user.id) {
        console.warn('⚠️ Invalid user data in cookie:', user);
        this.deleteCookie('user_data');
        return null;
      }
      
      // Update cache
      userCache = {
        user,
        timestamp: Date.now()
      };
      
      return user;
    } catch (error) {
      console.error('❌ Error parsing user data from cookie:', error);
      // Clear corrupted cookie
      this.deleteCookie('user_data');
      userCache = null;
      return null;
    }
  },

  // Check if user is authenticated (based on user data cookie and HttpOnly cookies)
  isAuthenticated(): boolean {
    const user = this.getUser();
    const hasUserData = !!user && !!user.id;
    
    // Also check if we have access token (HttpOnly cookie) - this indicates server-side auth
    // Note: HttpOnly cookies can't be read by JavaScript, so we rely on user_data cookie
    // The server sets both user_data and HttpOnly cookies, so user_data should be sufficient
    return hasUserData;
  },

  // Get user role
  getUserRole(): Role | null {
    const user = this.getUser();
    return user?.role as Role || null;
  },

  // Check if user has specific role
  hasRole(role: Role): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  },

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  },

  // Clear authentication data (cookies will be cleared by server)
  clearAuth(): void {
    if (typeof window === 'undefined') return;
    
    // Clear user data cookie
    this.deleteCookie('user_data');
    
    // Clear cache
    userCache = null;
    console.log('🧹 Auth data cleared (cookies will be cleared by server)');

    // Trigger auth sync across tabs
    this.triggerAuthSync();
  },

  // Update user data in cookie (called after profile updates)
  updateUserData(user: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const userData = JSON.stringify(user);
      this.setCookie('user_data', userData, 7); // 7 days
      
      // Update cache
      userCache = {
        user,
        timestamp: Date.now()
      };
      
      console.log('👤 User data updated in cookie');
    } catch (error) {
      console.error('Failed to update user data in cookie:', error);
    }
  },

  // Clear cache (useful for testing or forced refresh)
  clearCache(): void {
    userCache = null;
    console.log('🧹 User cache cleared');
  },

  // Force refresh user data from cookie (bypass cache)
  forceRefreshUser(): Record<string, unknown> | null {
    if (typeof window === 'undefined') return null;
    
    const userCookie = this.getCookie('user_data');
    if (!userCookie) return null;
    
    try {
      const user = JSON.parse(userCookie);
      
      // Update cache with fresh data
      userCache = {
        user,
        timestamp: Date.now()
      };
      
      return user;
    } catch {
      return null;
    }
  },

  // Trigger auth sync across tabs
  triggerAuthSync(): void {
    if (typeof window === 'undefined') return;
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('authChange'));
    
    // For cross-tab sync, we can trigger a page reload or use other mechanisms
    // Since we can't modify HttpOnly cookies, we'll rely on the server to sync
    console.log('🔄 Auth sync triggered (server will handle cookie sync)');
  },

  // Utility functions for cookie management
  getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  },

  setCookie(name: string, value: string, days: number): void {
    if (typeof window === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  },

  deleteCookie(name: string): void {
    if (typeof window === 'undefined') return;
    
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`;
  },

  // Debug function to check authentication state
  debugAuthState(): void {
    if (typeof window === 'undefined') {
      console.log('🔍 Auth debug: Running on server side');
      return;
    }

    const userData = this.getCookie('user_data');
    const accessToken = this.getCookie('access_token');
    const refreshToken = this.getCookie('refresh_token');
    
    console.log('🔍 Cookie Auth Debug State:', {
      cookies: {
        hasUserData: !!userData,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        userDataPreview: userData ? userData.substring(0, 50) + '...' : 'none',
        allCookies: document.cookie.split(';').map(c => c.trim())
      },
      cache: userCache ? {
        hasUser: !!userCache.user,
        timestamp: userCache.timestamp,
        age: Date.now() - userCache.timestamp,
        isExpired: Date.now() - userCache.timestamp > CACHE_DURATION
      } : 'no cache',
      computed: {
        getUser: this.getUser(),
        isAuthenticated: this.isAuthenticated(),
        getUserRole: this.getUserRole(),
        isAdmin: this.isAdmin()
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        apiUrl: process.env.NEXT_PUBLIC_API_URL
      }
    });
  },

  // Force authentication refresh
  forceAuthRefresh(): void {
    if (typeof window === 'undefined') return;
    
    console.log('🔄 Forcing authentication refresh...');
    userCache = null;
    this.triggerAuthSync();
    
    // Try to refresh user data
    const user = this.getUser();
    if (user) {
      console.log('✅ User data refreshed:', user);
    } else {
      console.warn('⚠️ No user data available after refresh');
    }
  }
};

// Make debug functions available globally for testing
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).debugCookieAuth = () => cookieAuthUtils.debugAuthState();
  (window as unknown as Record<string, unknown>).clearUserCache = () => cookieAuthUtils.clearCache();
  (window as unknown as Record<string, unknown>).forceRefreshUser = () => cookieAuthUtils.forceRefreshUser();
  (window as unknown as Record<string, unknown>).forceAuthRefresh = () => cookieAuthUtils.forceAuthRefresh();
}
