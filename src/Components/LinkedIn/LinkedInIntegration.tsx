// LinkedInIntegration.tsx
"use client";
import React, { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { SocialIntegrationCard } from '@/Components/LazyComponents';
import { useLinkedIn } from '@/hooks/useLinkedIn';

interface LinkedInIntegrationProps {
  className?: string;
}

export interface LinkedInIntegrationRef {
  checkConnection: () => void;
}

export const LinkedInIntegration = forwardRef<LinkedInIntegrationRef, LinkedInIntegrationProps>(({ className = '' }, ref) => {
  const { connect, getProfile, disconnect, isConnected, profile, loading, error } = useLinkedIn();
  const [cachedConnected, setCachedConnected] = useState(false);
  const PROFILE_LOADED_KEY = 'conn_profile_loaded:linkedin';

  // Read cached connection on mount to avoid extra API checks
  useEffect(() => {
    try {
      const raw = localStorage.getItem('platform_connections_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.platforms)) {
          setCachedConnected(parsed.platforms.includes('linkedin'));
        }
      }
    } catch {}
  }, []);

  // If cached connected but no profile yet, fetch once per session or when invalidated
  useEffect(() => {
    if (!cachedConnected) return;
    if (profile) return;
    if (loading) return;
    try {
      const invalidated = sessionStorage.getItem('invalidate_connections_cache') === '1';
      const loaded = sessionStorage.getItem(PROFILE_LOADED_KEY) === '1';
      if (!loaded || invalidated) {
        sessionStorage.setItem(PROFILE_LOADED_KEY, '1');
        sessionStorage.removeItem('invalidate_connections_cache');
        getProfile();
      }
    } catch {
      getProfile();
    }
  }, [cachedConnected, profile, loading, getProfile]);

  const checkConnectionStatus = async () => {
    // This function now just triggers the hook's getProfile method.
    // The component will automatically re-render with the new state.
    await getProfile();
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('LinkedIn connection error:', err);
    }
  };
  
  const handleDisconnect = async () => {
    await disconnect();
    // Update cache to reflect disconnection
    try {
      const raw = localStorage.getItem('platform_connections_v1');
      const parsed = raw ? JSON.parse(raw) : { platforms: [], timestamp: Date.now() };
      const set = new Set<string>(Array.isArray(parsed.platforms) ? parsed.platforms : []);
      set.delete('linkedin');
      localStorage.setItem('platform_connections_v1', JSON.stringify({ platforms: Array.from(set), timestamp: Date.now() }));
      sessionStorage.setItem('invalidate_connections_cache', '1');
      setCachedConnected(false);
    } catch {}
  };

  // Expose checkConnection method to the parent component
  useImperativeHandle(ref, () => ({
    checkConnection: checkConnectionStatus
  }));

  // FIX: Derive display text directly from the hook's state (profile, isConnected).
  // This removes the need for local 'connectionStatus' state.
  const getStatusText = () => {
    if (loading) return 'Checking...';
    if (isConnected && profile) {
      return `Connected as ${profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim()}`;
    }
    return 'Not Connected';
  };

  return (
    <SocialIntegrationCard
      className={className}
      icon={<span className="text-blue-600 font-medium text-sm">in</span>}
      title="LinkedIn"
      connected={Boolean((isConnected && profile) || cachedConnected)}
      loading={loading}
      error={error || undefined}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onRefresh={() => {
        try { sessionStorage.removeItem(PROFILE_LOADED_KEY); } catch {}
        checkConnectionStatus();
      }}
      connectLabel="Connect LinkedIn"
      profileName={profile ? `@${profile.username || profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim()}` : undefined}
      profileDetail={profile?.headline || profile?.industry}
    />
  );
});

LinkedInIntegration.displayName = 'LinkedInIntegration';