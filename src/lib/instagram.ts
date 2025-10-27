// src/lib/instagram.ts
import { getApiBase } from './config';
import { apiRequest } from './apiClient';
import {
  InstagramUser,
  InstagramAuthResponse,
  InstagramCallbackResponse,
  InstagramProfile,
  InstagramPostResponse,
  InstagramStoryResponse,
  MediaUploadResponse,
  InstagramInsights,
  InstagramMediaResponse,
  InstagramPostData,
  InstagramValidationResponse,
  
} from '@/types/instagram';

class InstagramService {
  private baseURL: string;

  constructor() {
    this.baseURL = getApiBase();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return apiRequest<T>(endpoint, options);
  }

  // Generate Instagram OAuth URL
  async generateAuthURL(redirectUri?: string): Promise<InstagramAuthResponse> {
    return this.request<InstagramAuthResponse>('/api/instagram/auth-url', {
      method: 'POST',
      body: JSON.stringify({ 
        redirectUri: redirectUri || `${window.location.origin}/auth/instagram/callback`
      }),
    });
  }

  // Handle Instagram OAuth callback (this would be called by the backend)
  async handleCallback(code: string, state: string, redirectUri: string): Promise<InstagramCallbackResponse> {
    return this.request<InstagramCallbackResponse>(
      `/api/instagram/callback?code=${code}&state=${state}&redirectUri=${redirectUri}`,
      { method: 'GET' }
    );
  }

  // Get Instagram profile
  async getProfile(): Promise<InstagramProfile> {
    return this.request<InstagramProfile>('/api/instagram/profile');
  }

  // Post content to Instagram
  async postContent(postData: InstagramPostData): Promise<InstagramPostResponse> {
    return this.request<InstagramPostResponse>('/api/instagram/post', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  // Post story to Instagram
  async postStory(mediaUrl: string, caption?: string): Promise<InstagramStoryResponse> {
    return this.request<InstagramStoryResponse>('/api/instagram/post', {
      method: 'POST',
      body: JSON.stringify({
        type: 'story',
        mediaUrl,
        caption
      }),
    });
  }

  // Upload media
  async uploadMedia(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('media', file);
    
    const res = await fetch(`${this.baseURL}/api/instagram/upload-media`, {
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

  // Disconnect Instagram account
  async disconnect(): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request('/api/instagram/disconnect', {
      method: 'DELETE',
    });
  }

  // Check if Instagram is connected
  async isConnected(): Promise<boolean> {
    try {
      const profile = await this.getProfile();
      return profile.success;
    } catch {
      return false;
    }
  }

  // Validate Instagram connection
  async validateConnection(): Promise<InstagramValidationResponse> {
    return this.request<InstagramValidationResponse>('/api/instagram/validate');
  }

  // Get Instagram insights
  async getInsights(): Promise<InstagramInsights> {
    return this.request<InstagramInsights>('/api/instagram/insights');
  }

  // Get Instagram media
  async getMedia(limit: number = 25): Promise<InstagramMediaResponse> {
    return this.request<InstagramMediaResponse>(`/api/instagram/media?limit=${limit}`);
  }
}

export const instagramService = new InstagramService();
