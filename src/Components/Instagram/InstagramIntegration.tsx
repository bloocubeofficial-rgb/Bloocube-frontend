'use client';
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useInstagram } from '@/hooks/useInstagram'; // FIX: Changed path alias '@/hooks/useInstagram' to relative path '../hooks/useInstagram'
import { Loader2, CheckCircle, ExternalLink, Instagram } from 'lucide-react';
import { SocialIntegrationCard } from '@/Components/LazyComponents';
import { cookieAuthUtils } from '@/lib/cookieAuth';
import { InstagramSetupGuide } from './InstagramSetupGuide';

interface InstagramIntegrationProps {
  className?: string;
}

export interface InstagramIntegrationRef {
  checkConnection: () => void;
}

export const InstagramIntegration = forwardRef<InstagramIntegrationRef, InstagramIntegrationProps>(({ className = '' }, ref) => {
  // We rely on the useInstagram hook to handle all API/auth URL generation logic
  const { isConnected, profile, loading, error, connect, disconnect, checkConnection } = useInstagram();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [cachedConnected, setCachedConnected] = useState(false);
  const PROFILE_LOADED_KEY = 'conn_profile_loaded:instagram';
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);

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
          const isCached = parsed.platforms.includes('instagram');
          setCachedConnected(isCached);
        }
      }
    } catch { }
  }, []);

  // Always fetch profile if cached but not loaded yet, or if no cache and authenticated
  useEffect(() => {
    try { if (!cookieAuthUtils.isAuthenticated()) return; } catch { }
    if (loading || isConnecting || isDisconnecting) return;

    // If we have profile already, don't fetch again
    if (profile) return;

    // Check if we've already attempted to load in this session
    const loaded = sessionStorage.getItem(PROFILE_LOADED_KEY) === '1';

    // If cached connected, always fetch profile on mount/refresh to get details
    // If not cached, only fetch if we haven't tried yet this session
    if (cachedConnected || !loaded) {
      try { sessionStorage.setItem(PROFILE_LOADED_KEY, '1'); } catch { }
      setHasCheckedConnection(true);
      // checkConnection() now uses status endpoint with auto-refresh internally
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
        if (!set.has('instagram')) {
          set.add('instagram');
          localStorage.setItem('platform_connections_v1', JSON.stringify({ platforms: Array.from(set), timestamp: Date.now() }));
          setCachedConnected(true);
        }
      } catch { }
    }
  }, [isConnected, profile]);


  // Do not purge cache automatically; only explicit Disconnect updates cache
  // If we've verified a check and the result is disconnected, purge cached connection
  useEffect(() => {
    try { if (!cookieAuthUtils.isAuthenticated()) return; } catch { }
    const loaded = sessionStorage.getItem(PROFILE_LOADED_KEY) === '1';
    if (!(hasCheckedConnection || loaded)) return;
    if (loading || isConnecting || isDisconnecting) return;
    const disconnected = !(isConnected && profile);
    if (disconnected && cachedConnected) {
      try {
        const raw = localStorage.getItem('platform_connections_v1');
        const parsed = raw ? JSON.parse(raw) : { platforms: [], timestamp: Date.now() };
        const set = new Set<string>(Array.isArray(parsed.platforms) ? parsed.platforms : []);
        if (set.delete('instagram')) {
          localStorage.setItem('platform_connections_v1', JSON.stringify({ platforms: Array.from(set), timestamp: Date.now() }));
          sessionStorage.setItem('invalidate_connections_cache', '1');
        }
        setCachedConnected(false);
      } catch { }
    }
  }, [hasCheckedConnection, loading, isConnecting, isDisconnecting, isConnected, profile, cachedConnected]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      // Calling connect() will hit the backend to get the dynamic OAuth URL.
      // The backend will ensure the redirect_uri points back to the server's /api/instagram/callback endpoint.
      await connect();

      // After successful redirection and return from Instagram, check the status to update UI
      // (This check happens after the user returns and the backend handler fires, but 
      // running it here ensures the UI updates after the user manually returns or refreshes)
      setTimeout(() => {
        checkConnection();
      }, 1000);
    } catch (error) {
      console.error('Instagram connection error:', error);
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
        set.delete('instagram');
        localStorage.setItem('platform_connections_v1', JSON.stringify({ platforms: Array.from(set), timestamp: Date.now() }));
        sessionStorage.setItem('invalidate_connections_cache', '1');
        setCachedConnected(false);
      } catch { }
    } catch (error) {
      console.error('Instagram disconnection error:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <SocialIntegrationCard
      className={className}
      icon={<div className="w-5 h-5 flex items-center justify-center"><Instagram className="w-5 h-5 text-pink-600" /></div>}
      title="Instagram"
      connected={Boolean((isConnected && profile) || cachedConnected)}
      loading={loading || isConnecting || isDisconnecting}
      error={error || undefined}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onRefresh={() => {
        try { sessionStorage.removeItem(PROFILE_LOADED_KEY); } catch { }
        checkConnection();
      }}
      connectLabel="Connect Instagram"
      profileName={profile ? `@${profile.username}` : undefined}
      profileDetail={profile?.account_type || profile?.limitations}
    />
  );
});

// Purge cache if a verified check shows disconnected
export const _InstagramIntegrationCacheSync = () => null;

InstagramIntegration.displayName = 'InstagramIntegration';
