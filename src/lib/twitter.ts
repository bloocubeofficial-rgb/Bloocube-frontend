// src/lib/twitter.ts FRONTEND 
import { getApiBase } from './config';
import { apiRequest } from './apiClient';

export interface TwitterUser {
  id: string;
  username: string;
  name: string;
  connectedAt: string;
}

export interface TwitterAuthResponse {
  success: boolean;
  authURL?: string;
  state?: string;
  error?: string;
}

export interface TwitterCallbackResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    socialAccounts: {
      twitter: TwitterUser;
    };
  };
  error?: string;
}

export interface TwitterProfile {
  success: boolean;
  profile?: TwitterUser;
  error?: string;
}

export interface TweetResponse {
  success: boolean;
  message?: string;
  tweet?: {
    tweet_id: string;
    text: string;
    created_at: string;
  };
  error?: string;
}

export interface MediaUploadResponse {
  success: boolean;
  mediaId?: string;
  error?: string;
}

class TwitterService {
  private baseURL: string;

  constructor() {
    this.baseURL = getApiBase();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return apiRequest<T>(endpoint, options);
  }
  

  // Generate Twitter OAuth URL
  async generateAuthURL(redirectUri: string): Promise<TwitterAuthResponse> {
    // Try public GET first
    try {
      const url = `/api/twitter/auth-url?redirectUri=${encodeURIComponent(redirectUri)}`;
      return await this.request<TwitterAuthResponse>(url, { method: 'GET' });
    } catch {
      // Fallback to POST if GET fails
      return this.request<TwitterAuthResponse>('/api/twitter/auth-url', {
        method: 'POST',
        body: JSON.stringify({ redirectUri }),
      });
    }
  }

  // Handle Twitter OAuth callback (this would be called by the backend)
  async handleCallback(code: string, state: string, redirectUri: string): Promise<TwitterCallbackResponse> {
    return this.request<TwitterCallbackResponse>(
      `/api/twitter/callback?code=${code}&state=${state}&redirectUri=${redirectUri}`,
      { method: 'GET' }
    );
    
  }

  // Get Twitter profile
  async getProfile(): Promise<TwitterProfile> {
    return this.request<TwitterProfile>('/api/twitter/profile');
  }

  // Post a tweet
  async postTweet(content: string, mediaIds?: string[]): Promise<TweetResponse> {
    return this.request<TweetResponse>('/api/twitter/tweet', {
      method: 'POST',
      body: JSON.stringify({ content, mediaIds }),
    });
  }

  // Upload media
  async uploadMedia(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('media', file);
    const res = await fetch(`${this.baseURL}/api/twitter/upload-media`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      headers: {}
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null) as { error?: string; message?: string } | null;
      throw new Error(err?.error || err?.message || 'Upload failed');
    }
    return res.json();
  }
  

  // Disconnect Twitter account
  async disconnect(): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request('/api/twitter/disconnect', {
      method: 'DELETE',
    });
  }

  // Check if Twitter is connected
  async isConnected(): Promise<boolean> {
    try {
      const profile = await this.getProfile();
      // Consider connected only if success AND a valid profile with username exists
      return Boolean(profile.success && profile.profile && (profile.profile as any).username);
    } catch {
      return false;
    }
  }
}

export const twitterService = new TwitterService();
