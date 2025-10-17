// src/lib/profile.ts
import { apiRequest } from './apiClient';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  profile: {
    bio: string;
    avatar_url: string;
    phone: string;
    location: string;
    address?: string;
    website: string;
    dateOfBirth?: string;
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    language: string;
    timezone: string;
    social_links: {
      youtube?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      facebook?: string;
      tiktok?: string;
      snapchat?: string;
      website?: string;
    };
    preferences: {
      emailNotifications: boolean;
      pushNotifications: boolean;
      smsNotifications: boolean;
      marketingEmails: boolean;
      profileVisibility: 'public' | 'private' | 'followers_only';
    };
  };
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  profile?: {
    bio?: string;
    avatar_url?: string;
    phone?: string;
    location?: string;
    address?: string;
    website?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    language?: string;
    timezone?: string;
    social_links?: {
      youtube?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      facebook?: string;
      tiktok?: string;
      snapchat?: string;
      website?: string;
    };
    preferences?: {
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      smsNotifications?: boolean;
      marketingEmails?: boolean;
      profileVisibility?: 'public' | 'private' | 'followers_only';
    };
  };
}

export interface UserStats {
  connectedAccounts: number;
  accountAge: number;
  isVerified: boolean;
  lastLogin?: string;
  profileCompleteness: number;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountData {
  password: string;
}

// Profile API functions
export const profileApi = {
  // Get current user profile
  getProfile: async (): Promise<{ success: boolean; data: { user: UserProfile } }> => {
    return apiRequest('/api/profile/me');
  },

  // Update user profile
  updateProfile: async (data: ProfileUpdateData): Promise<{ success: boolean; data: { user: UserProfile } }> => {
    return apiRequest('/api/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Get user statistics
  getStats: async (): Promise<{ success: boolean; data: { stats: UserStats } }> => {
    return apiRequest('/api/profile/stats');
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/api/profile/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ success: boolean; data: { avatar_url: string } }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiRequest('/api/profile/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
      }
    });
  },

  // Delete account
  deleteAccount: async (data: DeleteAccountData): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/api/profile/account', {
      method: 'DELETE',
      body: JSON.stringify(data)
    });
  }
};

// Utility functions
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Format as +1 (555) 123-4567
  if (cleaned.length === 10) {
    return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const parsePhoneNumber = (formattedPhone: string): string => {
  if (!formattedPhone) return '';
  // Remove all non-digit characters except +
  return formattedPhone.replace(/[^\d+]/g, '');
};

export const getProfileCompletenessColor = (percentage: number): string => {
  if (percentage >= 80) return 'text-green-600 bg-green-100';
  if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
  if (percentage >= 40) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
};

export const getProfileCompletenessMessage = (percentage: number): string => {
  if (percentage >= 80) return 'Excellent! Your profile is well-completed.';
  if (percentage >= 60) return 'Good! Add a few more details to complete your profile.';
  if (percentage >= 40) return 'Getting there! Complete more fields to improve your profile.';
  return 'Complete your profile to get the most out of Bloocube.';
};
