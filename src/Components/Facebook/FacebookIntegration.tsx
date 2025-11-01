'use client';
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useFacebook } from '@/hooks/useFacebook';
import { Loader2, CheckCircle, ExternalLink, Facebook } from 'lucide-react';
import { SocialIntegrationCard } from '@/Components/LazyComponents';
import { cookieAuthUtils } from '@/lib/cookieAuth';

interface FacebookIntegrationProps {
  className?: string;
}

export interface FacebookIntegrationRef {
  checkConnection: () => void;
}

export const FacebookIntegration = forwardRef<FacebookIntegrationRef, FacebookIntegrationProps>(({ className = '' }, ref) => {
  // We rely on the useFacebook hook to handle all API/auth URL generation logic
  const { isConnected, profile, loading, error, connect, disconnect, checkConnection } = useFacebook();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);
  const [cachedConnected, setCachedConnected] = useState(false);
  const PROFILE_LOADED_KEY = 'conn_profile_loaded:facebook';

  // Expose checkConnection method to parent component
  useImperativeHandle(ref, () => ({
    checkConnection: async () => {
      setHasCheckedConnection(true);
      return checkConnection();
    }
  }));

  // Read cached connection on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('platform_connections_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.platforms)) {
          const isCached = parsed.platforms.includes('facebook');
          setCachedConnected(isCached);
        }
      }
    } catch {}
  }, []);

  // Always fetch profile if cached but not loaded yet, or if no cache and authenticated
  useEffect(() => {
    try { if (!cookieAuthUtils.isAuthenticated()) return; } catch {}
    if (loading || isConnecting || isDisconnecting) return;
    
    // If we have profile already, don't fetch again
    if (profile) return;
    
    // Check if we've already attempted to load in this session
    const loaded = sessionStorage.getItem(PROFILE_LOADED_KEY) === '1';
    
    // If cached connected, always fetch profile on mount/refresh to get details
    // If not cached, only fetch if we haven't tried yet this session
    if (cachedConnected || !loaded) {
      try { sessionStorage.setItem(PROFILE_LOADED_KEY, '1'); } catch {}
      setHasCheckedConnection(true);
      // checkConnection() now uses status endpoint with token validation internally
      checkConnection();
    }
  }, [cachedConnected, loading, isConnecting, isDisconnecting, profile, checkConnection]);

  // When connection confirmed, add to cache
  useEffect(() => {
    if (isConnected && profile) {
      try {
        const raw = localStorage.getItem('platform_connections_v1');
        const parsed = raw ? JSON.parse(raw) : { platforms: [], timestamp: 0 };
        const set = new Set<string>(Array.isArray(parsed.platforms) ? parsed.platforms : []);
        if (!set.has('facebook')) {
          set.add('facebook');
          localStorage.setItem('platform_connections_v1', JSON.stringify({ platforms: Array.from(set), timestamp: Date.now() }));
          setCachedConnected(true);
        }
      } catch {}
    }
  }, [isConnected, profile]);


  // Do not purge cache automatically; only explicit Disconnect updates cache
  // If we've verified a check and the result is disconnected, purge cached connection
  useEffect(() => {
    try { if (!cookieAuthUtils.isAuthenticated()) return; } catch {}
    if (!hasCheckedConnection) return;
    if (loading || isConnecting || isDisconnecting) return;
    const disconnected = !(isConnected && profile);
    if (disconnected && cachedConnected) {
      try {
        const raw = localStorage.getItem('platform_connections_v1');
        const parsed = raw ? JSON.parse(raw) : { platforms: [], timestamp: Date.now() };
        const set = new Set<string>(Array.isArray(parsed.platforms) ? parsed.platforms : []);
        if (set.delete('facebook')) {
          localStorage.setItem('platform_connections_v1', JSON.stringify({ platforms: Array.from(set), timestamp: Date.now() }));
          sessionStorage.setItem('invalidate_connections_cache', '1');
        }
        setCachedConnected(false);
      } catch {}
    }
  }, [hasCheckedConnection, loading, isConnecting, isDisconnecting, isConnected, profile, cachedConnected]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      // Calling connect() will hit the backend to get the dynamic OAuth URL.
      // The backend will ensure the redirect_uri points back to the server's /api/facebook/callback endpoint.
      await connect(); 
      
      // After successful redirection and return from Facebook, check the status to update UI
      // (This check happens after the user returns and the backend handler fires, but 
      // running it here ensures the UI updates after the user manually returns or refreshes)
      setTimeout(() => {
        setHasCheckedConnection(true);
        checkConnection();
      }, 1000);
    } catch (error) {
      console.error('Facebook connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await disconnect();
      // Update cache to reflect disconnection
      try {
        const raw = localStorage.getItem('platform_connections_v1');
        const parsed = raw ? JSON.parse(raw) : { platforms: [], timestamp: Date.now() };
        const set = new Set<string>(Array.isArray(parsed.platforms) ? parsed.platforms : []);
        set.delete('facebook');
        localStorage.setItem('platform_connections_v1', JSON.stringify({ platforms: Array.from(set), timestamp: Date.now() }));
        sessionStorage.setItem('invalidate_connections_cache', '1');
        setCachedConnected(false);
      } catch {}
    } catch (error) {
      console.error('Facebook disconnection error:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <SocialIntegrationCard
      className={className}
      icon={<Facebook className="w-5 h-5 text-blue-600" />}
      title="Facebook"
      connected={Boolean((isConnected && profile) || cachedConnected)}
      loading={loading || isConnecting || isDisconnecting}
      error={error || undefined}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onRefresh={() => {
        try { sessionStorage.removeItem(PROFILE_LOADED_KEY); } catch {}
        checkConnection();
      }}
      connectLabel="Connect Facebook"
      profileName={profile?.name}
      profileDetail={profile?.email}
    />
  );
});

FacebookIntegration.displayName = 'FacebookIntegration';
