// src/lib/youtube.ts
import { getApiBase } from './config';
import { apiRequest } from './apiClient';

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
}

export interface YouTubeAuthResponse {
  success: boolean;
  authURL?: string;
  state?: string;
  error?: string;
}

export interface YouTubeCallbackResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    socialAccounts: {
      youtube: YouTubeChannel;
    };
  };
  error?: string;
}

export interface YouTubeChannelResponse {
  success: boolean;
  channel?: YouTubeChannel;
  error?: string;
}

export interface YouTubeVideoUploadResponse {
  success: boolean;
  video?: {
    video_id: string;
    title: string;
    description: string;
    publishedAt: string;
  };
  error?: string;
}

export interface YouTubeVideoAnalytics {
  viewCount: string;
  likeCount: string;
  commentCount: string;
  title: string;
  publishedAt: string;
}

export interface YouTubeAnalyticsResponse {
  success: boolean;
  analytics?: YouTubeVideoAnalytics;
  error?: string;
}

class YouTubeService {
  private baseURL: string;

  constructor() {
    this.baseURL = getApiBase();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return apiRequest<T>(endpoint, options);
  }

  // Generate YouTube OAuth URL
  async generateAuthURL(redirectUri: string): Promise<YouTubeAuthResponse> {
    return this.request<YouTubeAuthResponse>('/api/youtube/auth-url', {
      method: 'POST',
      body: JSON.stringify({ redirectUri }),
    });
  }

  // Handle YouTube OAuth callback (this would be called by the backend)
  async handleCallback(code: string, state: string, redirectUri: string): Promise<YouTubeCallbackResponse> {
    return this.request<YouTubeCallbackResponse>(
      `/api/youtube/callback?code=${code}&state=${state}&redirectUri=${redirectUri}`,
      { method: 'GET' }
    );
  }

  // Get YouTube channel info
  async getChannelInfo(): Promise<YouTubeChannelResponse> {
    return this.request<YouTubeChannelResponse>('/api/youtube/channel');
  }

  // Upload video to YouTube
  // Upload video to YouTube with progress tracking
async uploadVideo(
  file: File, 
  title: string, 
  description: string, 
  tags: string[] = [], 
  _onProgress?: (progress: number) => void
): Promise<YouTubeVideoUploadResponse> {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('title', title);
  formData.append('description', description);
  formData.append('tags', tags.join(','));

  // Increased timeout for large files
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 300000); // 5 minutes

  let res: Response;
  try {
    res = await fetch(`${this.baseURL}/api/youtube/upload-video`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      signal: controller.signal
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error('Upload timed out after 5 minutes. Please try a smaller file or check your connection.');
    }
    throw new Error(`Upload failed: ${(err as Error).message}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => null) as { error?: string; message?: string } | null;
    throw new Error(err?.error || err?.message || 'Video upload failed');
  }

  return res.json();
}

  // Get video analytics
  async getVideoAnalytics(videoId: string): Promise<YouTubeAnalyticsResponse> {
    return this.request<YouTubeAnalyticsResponse>(`/api/youtube/video/${videoId}/analytics`);
  }

  // Disconnect YouTube account
  async disconnect(): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request('/api/youtube/disconnect', {
      method: 'DELETE',
    });
  }

  // Check if YouTube is connected
  async isConnected(): Promise<boolean> {
    try {
      // Use channel info to avoid false positives from stale tokens
      const info = await this.getChannelInfo();
      return !!(info && info.success && info.channel);
    } catch (error: unknown) {
      return false;
    }
  }

  // Lightweight connection check (DB + backend auto-refresh)
  async isConnectedLight(): Promise<boolean> {
    try {
      const status = await this.request<{ success: boolean; connected: boolean; expired?: boolean }>(
        '/api/youtube/status'
      );
      return !!(status && status.success && status.connected);
    } catch (error: unknown) {
      return false;
    }
  }
}

export const youtubeService = new YouTubeService();
