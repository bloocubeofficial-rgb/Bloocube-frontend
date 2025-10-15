'use client';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useInstagram } from '@/hooks/useInstagram'; // FIX: Changed path alias '@/hooks/useInstagram' to relative path '../hooks/useInstagram'
import { Loader2, CheckCircle, ExternalLink, Instagram } from 'lucide-react';
import { SocialIntegrationCard } from '@/Components/LazyComponents';
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
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);

  // Expose checkConnection method to parent component
  useImperativeHandle(ref, () => ({
    checkConnection: async () => {
      setHasCheckedConnection(true);
      return checkConnection();
    }
  }));

  // Auto-check connection on mount for authenticated users
  React.useEffect(() => {
    if (!hasCheckedConnection && !loading) {
      setHasCheckedConnection(true);
      // Don't auto-check to prevent stuck loading state
      // checkConnection();
    }
  }, [hasCheckedConnection, loading]);

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
      connected={Boolean(isConnected && profile)}
      loading={loading || isConnecting || isDisconnecting}
      error={error || undefined}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onRefresh={checkConnection}
      connectLabel="Connect Instagram"
      profileName={profile ? `@${profile.username}` : undefined}
      profileDetail={profile?.account_type || profile?.limitations}
    />
  );
});

InstagramIntegration.displayName = 'InstagramIntegration';
