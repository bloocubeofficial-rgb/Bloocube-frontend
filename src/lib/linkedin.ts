// LinkedIn service for handling OAuth flow and profile data

export interface LinkedInUser {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  headline?: string;
  industry?: string;
  connectedAt?: string;
}

export interface LinkedInAuthResponse {
  success: boolean;
  authURL?: string;
  state?: string;
  error?: string;
}

export interface LinkedInProfileResponse {
  success: boolean;
  profile?: LinkedInUser;
  error?: string;
}

import { apiRequest } from '@/lib/apiClient';
import { getApiBase } from '@/lib/config';

class LinkedInService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = getApiBase();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return apiRequest<T>(endpoint, options);
  }

  async generateAuthURL(redirectUri: string): Promise<LinkedInAuthResponse> {
    // FIX: Simplified to use a single POST request for clarity.
    // The backend is already configured to handle it.
    return this.request<LinkedInAuthResponse>('/api/linkedin/auth-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ redirectUri }),
    });
  }

  async getProfile(): Promise<LinkedInProfileResponse> {
    return this.request<LinkedInProfileResponse>('/api/linkedin/profile');
  }

  async disconnect(): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request('/api/linkedin/disconnect', {
      method: 'DELETE',
    });
  }
  
}

export const linkedInService = new LinkedInService();


