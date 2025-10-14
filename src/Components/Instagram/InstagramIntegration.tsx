'use client';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useInstagram } from '@/hooks/useInstagram'; // FIX: Changed path alias '@/hooks/useInstagram' to relative path '../hooks/useInstagram'
import { Loader2, CheckCircle, ExternalLink, Instagram } from 'lucide-react';
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
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-3 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Instagram className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-medium text-gray-900">Instagram</p>
          {loading ? (
            <p className="text-sm text-gray-500">Checking connection...</p>
          ) : isConnected && profile ? (
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-sm text-green-600">@{profile.username}</p>
              {profile.account_type && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {profile.account_type}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500">Not connected</p>
              <button
                onClick={checkConnection}
                disabled={loading}
                className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check'}
              </button>
            </div>
          )}
          {error && (
            <div className="mt-2">
              <p className="text-sm text-red-500 mb-2">{error}</p>
              {(error.includes('Facebook Pages') || error.includes('Business Account') || error.includes('Instagram Business')) && (
                <InstagramSetupGuide className="mt-3" />
              )}
            </div>
          )}
        </div>
        </div>
      
      <div className="flex items-center space-x-2">
        {isConnected ? (
          <>
            <button
              onClick={checkConnection}
              disabled={loading}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
              <>
                <ExternalLink className="w-3 h-3" />
                <span>Check Status</span>
              </>
              )}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Disconnecting...</span>
                </>
              ) : (
                'Disconnect'
              )}
            </button>
          </>
        ) : (
          // Streamlined to use only the main connection button
          <button
            onClick={handleConnect}
            disabled={isConnecting || loading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded text-sm hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-3 h-3" />
                <span>Connect Instagram</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
});

InstagramIntegration.displayName = 'InstagramIntegration';
