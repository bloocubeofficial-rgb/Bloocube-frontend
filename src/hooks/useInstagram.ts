// src/hooks/useInstagram.ts
import { useState, useEffect } from "react";
import { instagramService } from "@/lib/instagram";
import { config, getApiBase } from "@/lib/config";
import type { InstagramUser, InstagramPostData } from "@/types/instagram";
import { authUtils } from "@/lib/auth";

export const useInstagram = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [profile, setProfile] = useState<InstagramUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Start with false to avoid stuck loading
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize state without making API calls to prevent stuck loading
    if (!authUtils.isAuthenticated()) {
      setLoading(false);
      setIsConnected(false);
      setProfile(null);
    } else {
      // For authenticated users, we'll check connection manually when needed
      setLoading(false);
      setIsConnected(false);
      setProfile(null);
    }
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      const isInstagramConnected = await instagramService.isConnected();

      if (!isInstagramConnected) {
        setIsConnected(false);
        setProfile(null);
        return;
      }

      const profileResponse = await instagramService.getProfile();

      if (profileResponse.success && profileResponse.profile?.username) {
        setIsConnected(true);
        setProfile(profileResponse.profile);
      } else {
        setIsConnected(false);
        setProfile(null);
      }
    } catch (err: unknown) {
      console.error("Error checking Instagram connection:", err);
      setError(err instanceof Error ? err.message : "Failed to check Instagram connection");
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
      const existingToken = authUtils.getToken();
      const directToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!existingToken && !directToken) {
        // Try to force refresh the token cache from localStorage
        authUtils.forceRefreshToken?.();
      }

      const tokenToUse = authUtils.getToken() || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      if (!tokenToUse) {
        throw new Error('Please log in to connect Instagram');
      }

      // Use backend callback URL so Instagram redirects back to API
      const backendCallback = `${getApiBase()}/api/instagram/callback`;
      const callbackUrl = redirectUri || backendCallback;
      const response = await instagramService.generateAuthURL(callbackUrl);
      
      if (response.success && response.authURL) {
        localStorage.setItem("instagram_state", response.state || "");
        // Don't set loading to false here since we're redirecting
        window.location.href = response.authURL;
      } else {
        throw new Error(response.error || "Failed to generate auth URL");
      }
    } catch (err: unknown) {
      console.error("Error connecting to Instagram:", err);
      setError(err instanceof Error ? err.message : "Failed to connect to Instagram");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await instagramService.disconnect();

      if (response.success) {
        setIsConnected(false);
        setProfile(null);
        return true;
      } else {
        throw new Error(response.error || "Failed to disconnect");
      }
    } catch (err: unknown) {
      console.error("Error disconnecting Instagram:", err);
      setError(err instanceof Error ? err.message : "Failed to disconnect Instagram");
      throw err;
    } finally {
      setLoading(false);
    } 
  };

  // Post content to Instagram
  const postContent = async (postData: InstagramPostData): Promise<unknown> => {
    try {
      setError(null);
      const response = await instagramService.postContent(postData);
  
      if (!response.success) {
        throw new Error(response.error || "Failed to post to Instagram");
      }
  
      // Return the actual post object
      return response.data;
    } catch (err: unknown) {
      console.error("Error posting to Instagram:", err);
      setError(err instanceof Error ? err.message : "Failed to post to Instagram");
      throw err;
    }
  };

  // Post story to Instagram
  const postStory = async (mediaUrl: string, caption?: string): Promise<unknown> => {
    try {
      setError(null);
      const response = await instagramService.postStory(mediaUrl, caption);
  
      if (!response.success) {
        throw new Error(response.error || "Failed to post story");
      }
  
      // Return the actual story object
      return response.data;
    } catch (err: unknown) {
      console.error("Error posting story:", err);
      setError(err instanceof Error ? err.message : "Failed to post story");
      throw err;
    }
  };

  // Upload media
  const uploadMedia = async (file: File): Promise<string> => {
    try {
      setError(null);
      const response = await instagramService.uploadMedia(file);

      if (!response.success || !response.mediaUrl) {
        throw new Error(response.error || "Failed to upload media");
      }
      return response.mediaUrl;
    } catch (err: unknown) {
      console.error("Error uploading media:", err);
      setError(err instanceof Error ? err.message : "Failed to upload media");
      throw err;
    }
  };

  // Get insights
  const getInsights = async () => {
    try {
      setError(null);
      const response = await instagramService.getInsights();

      if (!response.success) {
        throw new Error(response.error || "Failed to get insights");
      }

      return response.insights;
    } catch (err: unknown) {
      console.error("Error getting insights:", err);
      setError(err instanceof Error ? err.message : "Failed to get insights");
      throw err;
    }
  };

  // Get media
  const getMedia = async (limit: number = 25) => {
    try {
      setError(null);
      const response = await instagramService.getMedia(limit);

      if (!response.success) {
        throw new Error(response.error || "Failed to get media");
      }

      return response.media;
    } catch (err: unknown) {
      console.error("Error getting media:", err);
      setError(err instanceof Error ? err.message : "Failed to get media");
      throw err;
    }
  };

  // Validate connection
  const validateConnection = async () => {
    try {
      setError(null);
      const response = await instagramService.validateConnection();

      if (!response.success) {
        throw new Error(response.error || "Failed to validate connection");
      }

      return response;
    } catch (err: unknown) {
      console.error("Error validating connection:", err);
      setError(err instanceof Error ? err.message : "Failed to validate connection");
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
    postContent,
    postStory,
    uploadMedia,
    getInsights,
    getMedia,
    validateConnection,
  };
};
