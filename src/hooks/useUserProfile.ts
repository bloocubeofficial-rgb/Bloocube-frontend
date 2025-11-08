import { useState, useEffect, useCallback } from 'react';
import { profileApi, type UserProfile } from '@/lib/profile';
import { cookieAuthUtils } from '@/lib/cookieAuth';

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export function useUserProfile(): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    // Only fetch profile if user is authenticated
    // This prevents API calls on public pages like landing page
    const isAuthenticated = cookieAuthUtils.isAuthenticated();
    if (!isAuthenticated) {
      setLoading(false);
      setProfile(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await profileApi.getProfile();
      
      if (response.success) {
        setProfile(response.data.user);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      // Don't log errors for unauthenticated users on public pages
      const isAuthenticated = cookieAuthUtils.isAuthenticated();
      if (isAuthenticated) {
        console.error('Error fetching user profile:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await profileApi.updateProfile(data);
      
      if (response.success) {
        setProfile(response.data.user);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      console.error('Error updating user profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile,
    updateProfile
  };
}
