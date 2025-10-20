// src/hooks/useLinkedIn.ts
import { useState } from 'react';
import { linkedInService, LinkedInUser, LinkedInProfileResponse } from '@/lib/linkedin'; // Import LinkedInUser
import { cookieAuthUtils } from '@/lib/cookieAuth';
import { getApiBase } from '@/lib/config'; 

export const useLinkedIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  // ✅ Use the specific LinkedInUser type for better type safety
  const [profile, setProfile] = useState<LinkedInUser | null>(null);

  const connect = async () => { // Removed 'redirectUri' since we now have a fixed backend callback
    try {
      setLoading(true);
      setError(null);
  
      // BEFORE:
      // const callbackUrl = redirectUri || `${window.location.origin}/auth/linkedin/callback`;
  
      // ✅ AFTER: Point to your Express backend
      const callbackUrl = `${getApiBase()}/api/linkedin/callback`;
      
      // This part is important: the redirectUri sent to your backend
      // must be the one that will be used in the final step.
      const res = await linkedInService.generateAuthURL(callbackUrl);
  
      if (res.success && res.authURL) {
        window.location.href = res.authURL;
      } else {
        throw new Error(res.error || 'Failed to generate LinkedIn auth URL');
      }
    } catch (e: unknown) {
      // ... error handling
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async (): Promise<LinkedInProfileResponse> => {
    try {
      setLoading(true);
      setError(null);

      if (!cookieAuthUtils.isAuthenticated()) {
        const authError = 'Not authenticated';
        setIsConnected(false);
        setProfile(null);
        return { success: false, error: authError };
      }

      const res = await linkedInService.getProfile();
      
      // ✅ No more 'as any' casts needed, TypeScript understands the shape of 'res'
      if (res.success && res.profile) {
        setIsConnected(true);
        setProfile(res.profile);
      } else {
        setIsConnected(false);
        setProfile(null);
      }
      return res;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch LinkedIn profile';
      setIsConnected(false);
      setProfile(null);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await linkedInService.disconnect();
      if (res.success) {
        setIsConnected(false);
        setProfile(null);
      }
      return res;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to disconnect LinkedIn';
      setError(message);
      // FIX: Return a consistent error object to the caller.
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { connect, getProfile, disconnect, isConnected, profile, loading, error };
};