// src/types/instagram.ts
export interface InstagramUser {
  id: string;
  username: string;
  name: string;
  account_type: 'PERSONAL' | 'BUSINESS';
  media_count?: number;
  profileImageUrl?: string;
  connectedAt?: string;
}

export interface InstagramAuthResponse {
  success: boolean;
  authURL?: string;
  state?: string;
  error?: string;
}

export interface InstagramCallbackResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    socialAccounts: {
      instagram: InstagramUser;
    };
  };
  error?: string;
}

export interface InstagramProfile {
  success: boolean;
  profile?: InstagramUser;
  error?: string;
}

export interface InstagramPostResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    permalink?: string;
    created_at: string;
  };
  post_url?: string;
  error?: string;
}

export interface InstagramStoryResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    created_at: string;
  };
  error?: string;
}

export interface MediaUploadResponse {
  success: boolean;
  mediaId?: string;
  mediaUrl?: string;
  error?: string;
}

export interface InstagramInsights {
  success: boolean;
  insights?: {
    impressions?: number;
    reach?: number;
    profile_views?: number;
    website_clicks?: number;
  };
  error?: string;
}

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

export interface InstagramMediaResponse {
  success: boolean;
  media?: InstagramMedia[];
  error?: string;
}

export interface InstagramPostData {
  type: 'post' | 'story';
  content?: string;
  caption?: string;
  mediaUrl: string;
  location?: string;
}

export interface InstagramValidationResponse {
  success: boolean;
  valid?: boolean;
  user?: InstagramUser;
  canPost?: boolean;
  error?: string;
}
