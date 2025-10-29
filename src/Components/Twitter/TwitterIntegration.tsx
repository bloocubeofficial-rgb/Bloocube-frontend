'use client';
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useTwitter } from '@/hooks/useTwitter';
import { Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { SocialIntegrationCard } from '@/Components/LazyComponents';
import { cookieAuthUtils } from '@/lib/cookieAuth';

interface TwitterIntegrationProps {
  className?: string;
}

export interface TwitterIntegrationRef {
  checkConnection: () => void;
}

export const TwitterIntegration = forwardRef<TwitterIntegrationRef, TwitterIntegrationProps>(({ className = '' }, ref) => {
  const { isConnected, profile, loading, error, connect, disconnect, checkConnection } = useTwitter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [cachedConnected, setCachedConnected] = useState<boolean>(false);
  const PROFILE_LOADED_KEY = 'conn_profile_loaded:twitter';

  // Read cached connection on mount to avoid extra API checks
  useEffect(() => {
    try {
      const raw = localStorage.getItem('platform_connections_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.platforms)) {
          setCachedConnected(parsed.platforms.includes('twitter'));
        }
      }
    } catch {}
  }, []);

  // If no cache available, perform a one-time check per session (authenticated only)
  useEffect(() => {
    try {
      if (!cookieAuthUtils.isAuthenticated()) return;
    } catch {}
    if (cachedConnected) return;
    if (loading || isConnecting || isDisconnecting) return;
    const loaded = sessionStorage.getItem(PROFILE_LOADED_KEY) === '1';
    if (!loaded) {
      try { sessionStorage.setItem(PROFILE_LOADED_KEY, '1'); } catch {}
      checkConnection();
    }
  }, [cachedConnected, loading, isConnecting, isDisconnecting, checkConnection]);

  // When connection confirmed, add to cache
  useEffect(() => {
    if (isConnected && profile) {
      try {
        const raw = localStorage.getItem('platform_connections_v1');
        const parsed = raw ? JSON.parse(raw) : { platforms: [], timestamp: 0 };
        const set = new Set<string>(Array.isArray(parsed.platforms) ? parsed.platforms : []);
        if (!set.has('twitter')) {
          set.add('twitter');
          localStorage.setItem('platform_connections_v1', JSON.stringify({ platforms: Array.from(set), timestamp: Date.now() }));
          setCachedConnected(true);
        }
      } catch {}
    }
  }, [isConnected, profile]);

  // If cached connected but no profile yet, fetch once per session or when invalidated
  useEffect(() => {
    if (!cachedConnected) return;
    if (profile) return;
    if (loading || isConnecting || isDisconnecting) return;
    try {
      const invalidated = sessionStorage.getItem('invalidate_connections_cache') === '1';
      const loaded = sessionStorage.getItem(PROFILE_LOADED_KEY) === '1';
      if (!loaded || invalidated) {
        sessionStorage.setItem(PROFILE_LOADED_KEY, '1');
        sessionStorage.removeItem('invalidate_connections_cache');
        checkConnection();
      }
    } catch {
      checkConnection();
    }
  }, [cachedConnected, profile, loading, isConnecting, isDisconnecting, checkConnection]);

  // Do not purge cache automatically; only explicit Disconnect updates cache

  // Expose checkConnection method to parent component
  useImperativeHandle(ref, () => ({
    checkConnection
  }));

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connect();
      // After successful connection, check the status to update UI
      setTimeout(() => {
        checkConnection();
      }, 1000);
    } catch (error) {
      console.error('Twitter connection error:', error);
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
        set.delete('twitter');
        localStorage.setItem('platform_connections_v1', JSON.stringify({ platforms: Array.from(set), timestamp: Date.now() }));
        sessionStorage.setItem('invalidate_connections_cache', '1');
        setCachedConnected(false);
      } catch {}
    } catch (error) {
      console.error('Twitter disconnection error:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Note: Removed automatic checkConnection() call to prevent 429 errors
  // Connection status will be checked only when user manually clicks connect/disconnect

  return (
    <SocialIntegrationCard
      className={className}
      icon={<span className="text-black font-medium text-sm">X</span>}
      title="X (Twitter)"
      connected={Boolean((isConnected && profile) || cachedConnected)}
      loading={loading || isConnecting || isDisconnecting}
      error={error || undefined}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onRefresh={() => {
        try { sessionStorage.removeItem(PROFILE_LOADED_KEY); } catch {}
        checkConnection();
      }}
      connectLabel="Connect Twitter"
      profileName={profile ? `@${profile.username}` : undefined}
      profileDetail={profile?.name}
    />
  );
});

TwitterIntegration.displayName = 'TwitterIntegration';
