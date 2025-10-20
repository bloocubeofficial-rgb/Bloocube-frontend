// src/hooks/useYouTube.ts
import { useState, useEffect } from "react";
import { youtubeService, YouTubeChannel } from "@/lib/youtube";
import { cookieAuthUtils } from "@/lib/cookieAuth";

export const useYouTube = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Removed automatic checkConnection() to prevent 429 errors
    // Connection status will be checked manually when needed
    if (!cookieAuthUtils.isAuthenticated()) {
      setLoading(false);
      setIsConnected(false);
      setChannel(null);
    } else {
      // Set initial state without making API calls
      setLoading(false);
      setIsConnected(false);
      setChannel(null);
    }
  }, []);

  const checkConnection = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 YouTube checkConnection called (attempt ${retryCount + 1})`);

      // First check if user is authenticated
      if (!cookieAuthUtils.isAuthenticated()) {
        console.log('❌ User not authenticated, skipping YouTube connection check');
        setIsConnected(false);
        setChannel(null);
        return;
      }

      const isYouTubeConnected = await youtubeService.isConnected();

      if (!isYouTubeConnected) {
        console.log('❌ YouTube not connected, setting state to disconnected');
        setIsConnected(false);
        setChannel(null);
        return;
      }

      console.log('✅ YouTube is connected, fetching channel info...');
      const channelResponse = await youtubeService.getChannelInfo();

      if (channelResponse.success && channelResponse.channel?.id) {
        console.log('✅ YouTube channel info retrieved successfully:', channelResponse.channel.title);
        setIsConnected(true);
        setChannel(channelResponse.channel);
      } else {
        console.log('❌ Failed to get channel info or invalid response');
        setIsConnected(false);
        setChannel(null);
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Unknown error';
      console.error("❌ Error checking YouTube connection:", errorMessage);
      
      // If it's a "not connected" error and we haven't retried too many times, retry after a delay
      if (errorMessage.includes('YouTube account not connected') && retryCount < 3) {
        console.log(`🔄 Retrying YouTube connection check in 2 seconds... (attempt ${retryCount + 1})`);
        setTimeout(() => {
          checkConnection(retryCount + 1);
        }, 2000);
        return;
      }
      
      setError(errorMessage);
      setIsConnected(false);
      setChannel(null);
    } finally {
      setLoading(false);
    }
  };

  const connect = async (redirectUri?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Ensure user is authenticated before requesting auth URL (cookies)
      if (!cookieAuthUtils.isAuthenticated()) {
        throw new Error('Please log in to connect YouTube');
      }

      const callbackUrl = redirectUri || `${window.location.origin}/auth/youtube/callback`;
      const response = await youtubeService.generateAuthURL(callbackUrl);
      
      if (response.success && response.authURL) {
        sessionStorage.setItem("youtube_state", response.state || "");
        window.location.href = response.authURL;
      } else {
        throw new Error(response.error || "Failed to generate auth URL");
      }
    } catch (err: unknown) {
      console.error("Error connecting to YouTube:", err);
      setError((err as Error).message || "Failed to connect to YouTube");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await youtubeService.disconnect();

      if (response.success) {
        setIsConnected(false);
        setChannel(null);
        return true;
      } else {
        throw new Error(response.error || "Failed to disconnect");
      }
    } catch (err: unknown) {
      console.error("Error disconnecting YouTube:", err);
      setError((err as Error).message || "Failed to disconnect YouTube");
      throw err;
    } finally {
      setLoading(false);
    } 
  };

  // Upload video to YouTube
  const uploadVideo = async (file: File, title: string, description: string, tags: string[] = []): Promise<unknown> => {
    try {
      setError(null);
      const response = await youtubeService.uploadVideo(file, title, description, tags);
  
      if (!response.success) {
        throw new Error(response.error || "Failed to upload video");
      }
  
      return response.video;
    } catch (err: unknown) {
      console.error("Error uploading video:", err);
      setError((err as Error).message || "Failed to upload video");
      throw err;
    }
  };

  // Get video analytics
  const getVideoAnalytics = async (videoId: string): Promise<unknown> => {
    try {
      setError(null);
      const response = await youtubeService.getVideoAnalytics(videoId);
  
      if (!response.success) {
        throw new Error(response.error || "Failed to get video analytics");
      }
  
      return response.analytics;
    } catch (err: unknown) {
      console.error("Error getting video analytics:", err);
      setError((err as Error).message || "Failed to get video analytics");
      throw err;
    }
  };

  return {
    isConnected,
    channel,
    loading,
    error,
    connect,
    disconnect,
    checkConnection,
    uploadVideo,
    getVideoAnalytics,
  };
};
