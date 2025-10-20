// src/hooks/useTwitter.ts
import { useState, useEffect } from "react";
import { twitterService, TwitterUser } from "@/lib/twitter";
import { config } from "@/lib/config";
import { cookieAuthUtils } from "@/lib/cookieAuth";

export const useTwitter = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [profile, setProfile] = useState<TwitterUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Removed automatic checkConnection() to prevent 429 errors
    // Connection status will be checked manually when needed
    if (!cookieAuthUtils.isAuthenticated()) {
      setLoading(false);
      setIsConnected(false);
      setProfile(null);
    } else {
      // Set initial state without making API calls
      setLoading(false);
      setIsConnected(false);
      setProfile(null);
    }
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      const isTwitterConnected = await twitterService.isConnected();

      if (!isTwitterConnected) {
        setIsConnected(false);
        setProfile(null);
        return;
      }

      const profileResponse = await twitterService.getProfile();

      if (profileResponse.success && profileResponse.profile?.username) {
        setIsConnected(true);
        setProfile(profileResponse.profile);
      } else {
        setIsConnected(false);
        setProfile(null);
      }
    } catch (err: unknown) {
      console.error("Error checking Twitter connection:", err);
      setError(err instanceof Error ? err.message : "Failed to check Twitter connection");
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
        throw new Error('Please log in to connect Twitter');
      }

      const callbackUrl = redirectUri || config.twitter.callbackUrl;
      const response = await twitterService.generateAuthURL(callbackUrl);
      
      // When user clicks "Connect Twitter"



      if (response.success && response.authURL) {
        sessionStorage.setItem("twitter_state", response.state || "");
        window.location.href = response.authURL;
      } else {
        throw new Error(response.error || "Failed to generate auth URL");
      }
    } catch (err: unknown) {
      console.error("Error connecting to Twitter:", err);
      setError(err instanceof Error ? err.message : "Failed to connect to Twitter");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await twitterService.disconnect();

      if (response.success) {
        setIsConnected(false);
        setProfile(null);
        return true;
      } else {
        throw new Error(response.error || "Failed to disconnect");
      }
    } catch (err: unknown) {
      console.error("Error disconnecting Twitter:", err);
      setError(err instanceof Error ? err.message : "Failed to disconnect Twitter");
      throw err;
    } finally {
      setLoading(false);
    } 
  };

  // ✅ Add postTweet
  const postTweet = async (text: string, mediaIds?: string[]): Promise<unknown> => {
    try {
      setError(null);
      const response = await twitterService.postTweet(text, mediaIds);
  
      if (!response.success) {
        throw new Error(response.error || "Failed to post tweet");
      }
  
      // Return the actual tweet object
      return response.tweet;
    } catch (err: unknown) {
      console.error("Error posting tweet:", err);
      setError(err instanceof Error ? err.message : "Failed to post tweet");
      throw err;
    }
  };
  
  
  

  // ✅ Add uploadMedia
  const uploadMedia = async (file: File): Promise<string> => {
    try {
      setError(null);
      const response = await twitterService.uploadMedia(file);

      if (!response.success || !response.mediaId) {
        throw new Error(response.error || "Failed to upload media");
      }
      return response.mediaId;
    } catch (err: unknown) {
      console.error("Error uploading media:", err);
      setError(err instanceof Error ? err.message : "Failed to upload media");
      throw err;
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
    postTweet,   // ✅ now exposed
    uploadMedia, // ✅ now exposed
  };
};
