'use client';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useFacebook } from '@/hooks/useFacebook';
import { Loader2, CheckCircle, ExternalLink, Facebook } from 'lucide-react';
import { SocialIntegrationCard } from '@/Components/LazyComponents';

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
      // Auto-check connection to ensure UI shows correct state after refresh
      checkConnection();
    }
  }, [hasCheckedConnection, loading]);

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
      connected={Boolean(isConnected && profile)}
      loading={loading || isConnecting || isDisconnecting}
      error={error || undefined}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onRefresh={checkConnection}
      connectLabel="Connect Facebook"
      rightArea={undefined}
    />
  );
});

FacebookIntegration.displayName = 'FacebookIntegration';
