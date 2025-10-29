// src/hooks/useFacebook.ts
import { useState, useEffect } from "react";
import { facebookService } from "@/lib/facebook";
import { config, getApiBase } from "@/lib/config";
import type { FacebookUser } from "@/lib/facebook";
import { cookieAuthUtils } from "@/lib/cookieAuth";

export const useFacebook = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [profile, setProfile] = useState<FacebookUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Start with false to avoid stuck loading
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize state without making API calls to prevent stuck loading
    if (!cookieAuthUtils.isAuthenticated()) {
      setLoading(false);
      setIsConnected(false);
      setProfile(null);
    } else {
      // For authenticated users, start with loading true and check connection
      setLoading(true);
      setIsConnected(false);
      setProfile(null);
      // Auto-check connection for authenticated users
      checkConnection();
    }
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile directly; derive connection state from profile presence
      const profileResponse = await facebookService.getProfile();

      if (profileResponse.success && profileResponse.profile?.name) {
        setIsConnected(true);
        setProfile(profileResponse.profile);
      } else {
        setIsConnected(false);
        setProfile(null);
      }
    } catch (err: unknown) {
      console.error("Error checking Facebook connection:", err);
      setError(err instanceof Error ? err.message : "Failed to check Facebook connection");
      setIsConnected(false);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const connect = async (redirectUri?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Ensure user is authenticated before requesting auth URL (prevents 401 from backend)
      if (!cookieAuthUtils.isAuthenticated()) {
        throw new Error('Please log in to connect Facebook');
      }

      // Use backend callback URL so Facebook redirects back to API
      const backendCallback = `${getApiBase()}/api/facebook/callback`;
      const callbackUrl = redirectUri || backendCallback;
      const response = await facebookService.generateAuthURL(callbackUrl);
      
      if (response.success && response.authURL) {
        sessionStorage.setItem("facebook_state", response.state || "");
        // Don't set loading to false here since we're redirecting
        window.location.href = response.authURL;
      } else {
        throw new Error(response.error || "Failed to generate auth URL");
      }
    } catch (err: unknown) {
      console.error("Error connecting to Facebook:", err);
      setError(err instanceof Error ? err.message : "Failed to connect to Facebook");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await facebookService.disconnect();
      
      if (response.success) {
        setIsConnected(false);
        setProfile(null);
        return response;
      } else {
        throw new Error(response.error || "Failed to disconnect Facebook");
      }
    } catch (err: unknown) {
      console.error("Error disconnecting Facebook:", err);
      setError(err instanceof Error ? err.message : "Failed to disconnect Facebook");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await facebookService.validateConnection();
      
      if (response.success && response.connected && response.profile) {
        setIsConnected(true);
        setProfile(response.profile);
      } else {
        setIsConnected(false);
        setProfile(null);
      }
      
      return response;
    } catch (err: unknown) {
      console.error("Error validating Facebook connection:", err);
      setError(err instanceof Error ? err.message : "Failed to validate Facebook connection");
      setIsConnected(false);
      setProfile(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    isConnected,
    profile,
    loading,
    error,
    connect,
    disconnect,
    checkConnection,
    validateConnection
  };
};
