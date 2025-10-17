// src/lib/config.ts
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  appUrl: process.env.NEXT_FRONTEND_API_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
  twitter: {
    // callbackUrl: 'http://localhost:3000/auth/twitter/callback'
    callbackUrl: (process.env.FRONTEND_URL || 'http://localhost:3000') + '/auth/twitter/callback'
  },
  youtube: {
    // callbackUrl: 'http://localhost:3000/auth/youtube/callback'
    callbackUrl: (process.env.FRONTEND_URL || 'http://localhost:3000') + '/auth/youtube/callback'
  },
  instagram: {
    // callbackUrl: 'http://localhost:3000/auth/instagram/callback'
    callbackUrl: (process.env.FRONTEND_URL || 'http://localhost:3000') + '/auth/instagram/callback'
  },
  facebook: {
    // callbackUrl: 'http://localhost:3000/auth/facebook/callback'
    callbackUrl: (process.env.FRONTEND_URL || 'http://localhost:3000') + '/auth/facebook/callback'
  },
};

export const getApiBase = (): string => {
  // In development mode, always use localhost
  if (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
    return 'https://api-backend.bloocube.com';
  }
  
  const runtime = (globalThis as any)?.NEXT_PUBLIC_API_URL as string | undefined;
  const base = runtime || process.env.NEXT_PUBLIC_API_URL;
  
  if (!base) {
    throw new Error('NEXT_PUBLIC_API_URL is not set. Configure it in your deployment env or .env.local');
  }
  return base.replace(/\/+$/, '');
};
