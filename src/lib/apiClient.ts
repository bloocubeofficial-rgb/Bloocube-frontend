import { measureApiCall } from '@/lib/performance';
import { loadingManager } from '@/lib/loading';
import { getApiBase } from '@/lib/config';
import { ApiError } from '@/lib/errors';

// type TokenPair = { accessToken: string; refreshToken: string; expiresIn: number };

// Request cache for GET requests
const requestCache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
const pendingRequests = new Map<string, Promise<unknown>>();

// Cache TTL in milliseconds
const CACHE_TTL = {
  SHORT: 30 * 1000,    // 30 seconds
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000   // 30 minutes
};

function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Enhanced token refresh with caching
let refreshPromise: Promise<string | null> | null = null;

async function refreshAppToken(): Promise<string | null> {
  // Prevent multiple simultaneous refresh attempts
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    if (typeof window === 'undefined') return null;

    const base = getApiBase();
    const res = await fetch(`${base}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include' // This will send the refresh token cookie
    });
    
    if (!res.ok) return null;
    
    const data: { success?: boolean; data?: { user: Record<string, unknown> } } = await res.json().catch(() => ({}));
    if (data && data.data && data.data.user) {
      // Update user data in cookie (tokens are handled by server)
      const { cookieAuthUtils } = await import('@/lib/cookieAuth');
      cookieAuthUtils.updateUserData(data.data.user);
      return 'refreshed'; // Return a success indicator
    }
    return null;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

// Generate cache key for requests
function getCacheKey(path: string, init: RequestInit): string {
  const method = init.method || 'GET';
  const body = init.body ? JSON.stringify(init.body) : '';
  return `${method}:${path}:${body}`;
}

// Check if request should be cached
function shouldCache(path: string, method: string): boolean {
  return method === 'GET' && !path.includes('/auth/') && !path.includes('/callback');
}

// Get cache TTL based on endpoint
function getCacheTTL(path: string): number {
  if (path.includes('/profile') || path.includes('/channel')) return CACHE_TTL.MEDIUM;
  if (path.includes('/analytics') || path.includes('/campaigns')) return CACHE_TTL.SHORT;
  return CACHE_TTL.SHORT;
}

export async function apiRequest<T = unknown>(path: string, init: RequestInit = {}, retries = 1): Promise<T> {
  const base = getApiBase();
  const method = init.method || 'GET';
  const cacheKey = getCacheKey(path, init);
  // Only show global loading when explicitly requested (manual refresh)
  const showLoading = (init as unknown as { showLoading?: boolean })?.showLoading === true
    || (typeof init.headers === 'object' && init.headers !== null && (init.headers as Record<string, string>)['X-Show-Loading'] === '1');
  
  // Check cache for GET requests
  if (shouldCache(path, method)) {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`📦 Cache hit: ${method} ${path}`);
      return cached.data as T;
    }
  }

  // Check for pending requests to prevent duplicates
  if (pendingRequests.has(cacheKey)) {
    console.log(`⏳ Request deduplication: ${method} ${path}`);
    return pendingRequests.get(cacheKey)! as Promise<T>;
  }

  // With HttpOnly cookies, we don't need to manually add Authorization header
  // The cookies will be sent automatically with credentials: 'include'
  
  console.log(`🌐 API Request: ${method} ${base}${path}`, {
    retries,
    cached: false,
    baseUrl: base,
    fullUrl: `${base}${path}`,
    usingCookies: true
  });

  // Create request promise with performance monitoring
  const requestPromise = (async (): Promise<T> => {
    if (showLoading) loadingManager.start();
    return measureApiCall(async (): Promise<T> => {
    try {
      // Check if body is FormData - if so, don't set Content-Type header
      const isFormData = init.body instanceof FormData;
      const headers: Record<string, string> = {};
      
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      
      // Merge any additional headers
      if (init.headers) {
        Object.assign(headers, init.headers);
      }
      
      const res = await fetch(`${base}${path}`, {
        ...init,
        headers,
        credentials: 'include' // This sends HttpOnly cookies automatically
      });

      // Only attempt refresh for protected, non-auth endpoints
      const isAuthEndpoint = path.startsWith('/api/auth/');
      if (res.status === 401 && retries > 0 && !isAuthEndpoint) {
        console.log('🔑 Token expired, attempting refresh...');
        const newToken = await refreshAppToken();
        if (newToken) {
          console.log('✅ Token refreshed successfully, retrying request');
          return apiRequest<T>(path, init, retries - 1);
        } else {
          console.log('❌ Token refresh failed, clearing auth and redirecting');
          if (typeof window !== 'undefined') {
            // Clear user data cookie
            const { cookieAuthUtils } = await import('@/lib/cookieAuth');
            cookieAuthUtils.clearAuth();
            // Trigger auth sync to update UI
            window.dispatchEvent(new CustomEvent('authChange'));
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
          throw new ApiError('Authentication failed - please sign in again', { status: 401 });
        }
      }

      // Exponential backoff for 429 and 5xx
      if ((res.status === 429 || (res.status >= 500 && res.status <= 599)) && retries > 0) {
        const attempt = Math.max(1, 2 - retries + 1);
        const delay = Math.min(300 * Math.pow(2, attempt - 1), 3000);
        await sleep(delay);
        return apiRequest<T>(path, init, retries - 1);
      }

      if (!res.ok) {
        // Read response as text first (response body can only be consumed once)
        const responseText = await res.text().catch(() => 'Could not read response text');
        let body: unknown = null;
        try {
          body = responseText ? JSON.parse(responseText) : { message: `HTTP ${res.status} ${res.statusText}` };
        } catch (e) {
          console.log(`❌ Failed to parse error response as JSON:`, e);
          body = { message: `HTTP ${res.status} ${res.statusText}` };
        }
        
        const parsed = body as { error?: string; message?: string; code?: string | number; details?: unknown; validation_errors?: unknown; errors?: unknown; validation?: unknown } | null;
        const baseMessage = (parsed?.error || parsed?.message);
        const message = baseMessage || `HTTP ${res.status} ${res.statusText}`;
        const retryAfterHeader = res.headers.get('retry-after');
        const retryAfter = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : undefined;
        
        console.log(`❌ API Error: ${res.status} ${res.statusText}`, {
          path,
          message,
          code: parsed?.code,
          details: parsed?.details,
          validationErrors: parsed?.validation_errors || parsed?.errors || parsed?.validation,
          fullResponse: parsed,
          responseText: responseText
        });
        
        // Throw structured ApiError with helpful fields
        throw new ApiError(message, {
          status: res.status,
          code: parsed?.code,
          details: parsed?.details || parsed?.validation_errors || parsed?.errors || parsed?.validation,
          retryAfter,
          raw: parsed ?? body
        });
      }

      const data = await res.json() as T;

      // Cache successful GET requests
      if (shouldCache(path, method)) {
        const ttl = getCacheTTL(path);
        requestCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl
        });
        console.log(`💾 Cached: ${method} ${path} (TTL: ${ttl}ms)`);
      }

      return data;
    } finally {
      // Remove from pending requests
      pendingRequests.delete(cacheKey);
      if (showLoading) loadingManager.done();
    }
    }, path);
  })();

  // Store pending request
  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

// Cache management utilities
export const cacheUtils = {
  // Clear all cache
  clearAll(): void {
    requestCache.clear();
    pendingRequests.clear();
    console.log('🗑️ All API cache cleared');
  },

  // Clear cache for specific path pattern
  clearPattern(pattern: string): void {
    const keysToDelete = Array.from(requestCache.keys()).filter(key => key.includes(pattern));
    keysToDelete.forEach(key => requestCache.delete(key));
    console.log(`🗑️ Cleared cache for pattern: ${pattern} (${keysToDelete.length} entries)`);
  },

  // Get cache stats
  getStats(): { size: number; keys: string[] } {
    return {
      size: requestCache.size,
      keys: Array.from(requestCache.keys())
    };
  }
};

