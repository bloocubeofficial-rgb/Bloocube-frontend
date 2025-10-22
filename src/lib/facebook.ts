// src/lib/facebook.ts
import { config, getApiBase } from './config';

export interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
  connectedAt?: string;
}

export interface FacebookAuthResponse {
  success: boolean;
  authURL?: string;
  state?: string;
  error?: string;
}

export interface FacebookValidationResponse {
  success: boolean;
  connected: boolean;
  profile?: FacebookUser;
  error?: string;
}

class FacebookService {
  private baseURL: string;

  constructor() {
    this.baseURL = getApiBase();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Generate Facebook OAuth URL
  async generateAuthURL(redirectUri?: string): Promise<FacebookAuthResponse> {
    return this.request<FacebookAuthResponse>('/api/facebook/auth-url', {
      method: 'POST',
      body: JSON.stringify({
        redirectUri: redirectUri || `${window.location.origin}/auth/facebook/callback`
      })
    });
  }

  // Exchange code for access token
  async exchangeCodeForToken(code: string, state: string, redirectUri: string): Promise<FacebookAuthResponse> {
    return this.request<FacebookAuthResponse>('/api/facebook/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state, redirectUri })
    });
  }

  // Get Facebook profile
  async getProfile(): Promise<{ success: boolean; profile?: FacebookUser; error?: string }> {
    return this.request<{ success: boolean; profile?: FacebookUser; error?: string }>('/api/facebook/profile');
  }

  // Disconnect Facebook account
  async disconnect(): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request<{ success: boolean; message?: string; error?: string }>('/api/facebook/disconnect', {
      method: 'POST'
    });
  }

  // Check if Facebook is connected
  async isConnected(): Promise<boolean> {
    try {
      const profile = await this.getProfile();
      return profile.success;
    } catch {
      return false;
    }
  }

  // Validate Facebook connection
  async validateConnection(): Promise<FacebookValidationResponse> {
    return this.request<FacebookValidationResponse>('/api/facebook/validate');
  }
}

export const facebookService = new FacebookService();
