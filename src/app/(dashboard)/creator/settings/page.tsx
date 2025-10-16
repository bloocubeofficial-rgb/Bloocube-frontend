'use client'
import React, { useState, useEffect, Suspense } from "react";
import { Eye, EyeOff, User, Mail, Phone, MapPin, Globe, Calendar, Languages, Clock, Save, Upload, Trash2, AlertTriangle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import CreatorLayout from '@/Components/Creater/CreatorLayout';
import { TwitterIntegrationWithSuspense } from "@/Components/LazyComponents";
import { LinkedInIntegrationWithSuspense } from "@/Components/LazyComponents";
import { YouTubeIntegrationWithSuspense } from "@/Components/LazyComponents";
import { InstagramIntegrationWithSuspense } from "@/Components/LazyComponents";
import { FacebookIntegrationWithSuspense } from "@/Components/LazyComponents";
import type { TwitterIntegrationRef } from "@/Components/Twitter/TwitterIntegration";
import type { LinkedInIntegrationRef } from "@/Components/LinkedIn/LinkedInIntegration";
import type { YouTubeIntegrationRef } from "@/Components/YouTube/YouTubeIntegration";
import type { InstagramIntegrationRef } from "@/Components/Instagram/InstagramIntegration";
import type { FacebookIntegrationRef } from "@/Components/Facebook/FacebookIntegration";
import { useRef } from "react";
import { profileApi, UserProfile, ProfileUpdateData, ChangePasswordData, formatPhoneNumber, parsePhoneNumber, getProfileCompletenessColor, getProfileCompletenessMessage } from '@/lib/profile';
import { useTextPersistence } from '@/hooks/useTextPersistence';

interface NotificationState {
  type: 'success' | 'error' | 'warning' | null;
  message: string;
}

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onToggle, disabled = false }) => (
  <button
    onClick={onToggle}
    disabled={disabled}
    type="button"
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      enabled ? "bg-blue-600" : "bg-gray-300"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

function SettingsPageContent() {
  const searchParams = useSearchParams();
  
  // State management
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({ type: null, message: '' });
  const [tokenPresent, setTokenPresent] = useState<boolean>(true);
  
  // Notification preferences state (maps to backend-supported fields)
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  
  // Form data
  // Use persistence for profile data
  const { value: profileName, setValue: setProfileName } = useTextPersistence({ key: 'settings_profile_name' });
  const { value: profileEmail, setValue: setProfileEmail } = useTextPersistence({ key: 'settings_profile_email' });
  const { value: profilePhone, setValue: setProfilePhone } = useTextPersistence({ key: 'settings_profile_phone' });
  
  const [profileData, setProfileData] = useState<ProfileUpdateData>({});
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: ''
  });
  const [deleteData, setDeleteData] = useState({ password: '' });
  
  // Refs to trigger connection checks
  const twitterRef = useRef<TwitterIntegrationRef>(null);
  const linkedinRef = useRef<LinkedInIntegrationRef>(null);
  const youtubeRef = useRef<YouTubeIntegrationRef>(null);
  const instagramRef = useRef<InstagramIntegrationRef>(null);
  const facebookRef = useRef<FacebookIntegrationRef>(null);

  // Load user profile
  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getProfile();
      if (response.success) {
        setUser(response.data.user);
        setProfileData({
          name: response.data.user.name,
          email: response.data.user.email,
          profile: {
            bio: response.data.user.profile.bio,
            phone: response.data.user.profile.phone,
            location: response.data.user.profile.location,
            website: response.data.user.profile.website,
            dateOfBirth: response.data.user.profile.dateOfBirth,
            gender: response.data.user.profile.gender,
            language: response.data.user.profile.language,
            timezone: response.data.user.profile.timezone,
            social_links: response.data.user.profile.social_links,
            preferences: response.data.user.profile.preferences
          }
        });

        // Initialize toggle UI from backend preferences
        const prefs = response.data.user.profile.preferences || {} as any;
        setMarketingEmails(prefs.marketingEmails ?? true);
        setEmailNotifications(prefs.emailNotifications ?? true);
        setPushNotifications(prefs.pushNotifications ?? false);
        setSmsNotifications(prefs.smsNotifications ?? false);
      }
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  // Save profile changes
  const saveProfile = async () => {
    try {
      setSaving(true);
      const response = await profileApi.updateProfile(profileData);
      if (response.success) {
        setUser(response.data.user);
        setNotification({ type: 'success', message: 'Profile updated successfully!' });
        setTimeout(() => setNotification({ type: null, message: '' }), 5000);
      }
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const changePassword = async () => {
    try {
      setSaving(true);
      const response = await profileApi.changePassword(passwordData);
      if (response.success) {
        setNotification({ type: 'success', message: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '' });
        setTimeout(() => setNotification({ type: null, message: '' }), 5000);
      }
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      setSaving(true);
      const response = await profileApi.deleteAccount(deleteData);
      if (response.success) {
        setNotification({ type: 'success', message: 'Account deleted successfully. You will be redirected to login.' });
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/auth/login';
        }, 3000);
      }
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Failed to delete account' });
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  // Handle profile field changes
  const handleProfileChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
  };

  // Handle social links changes
  const handleSocialLinkChange = (platform: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        social_links: {
          ...prev.profile?.social_links,
          [platform]: value
        }
      }
    }));
  };

  // Handle preferences changes
  const handlePreferenceChange = (preference: string, value: boolean) => {
    setProfileData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        preferences: {
          ...prev.profile?.preferences,
          [preference]: value
        }
      }
    }));
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    if (field === 'name') {
      setProfileName(value);
      setProfileData(prev => ({ ...prev, name: value }));
    } else if (field === 'email') {
      setProfileEmail(value);
      setProfileData(prev => ({ ...prev, email: value }));
    } else if (field === 'currentPassword') {
      setPasswordData(prev => ({ ...prev, currentPassword: value }));
    } else if (field === 'newPassword') {
      setPasswordData(prev => ({ ...prev, newPassword: value }));
    } else if (field === 'phone') {
      setProfilePhone(value);
      handleProfileChange('phone', value);
    }
  };

  // Get form data for display
  const formData = {
    name: profileName || profileData.name || user?.name || '',
    email: profileEmail || profileData.email || user?.email || '',
    phone: profilePhone || profileData.profile?.phone || user?.profile?.phone || '',
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword
  };

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Handle URL parameters for social media connection status
  useEffect(() => {
    const twitterStatus = searchParams.get('twitter');
    const linkedinStatus = searchParams.get('linkedin');
    const youtubeStatus = searchParams.get('youtube');
    const instagramStatus = searchParams.get('instagram');
    const facebookStatus = searchParams.get('facebook');
    const message = searchParams.get('message');
    
    if (twitterStatus === 'success') {
      setNotification({ type: 'success', message: 'Twitter account connected successfully!' });
      setTimeout(() => twitterRef.current?.checkConnection(), 1000);
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        setNotification({ type: null, message: '' });
      }, 5000);
    } else if (twitterStatus === 'error') {
      setNotification({ type: 'error', message: message ? decodeURIComponent(message) : 'Failed to connect Twitter account' });
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        setNotification({ type: null, message: '' });
      }, 5000);
    } else if (linkedinStatus === 'success') {
      setNotification({ type: 'success', message: 'LinkedIn account connected successfully!' });
      setTimeout(() => linkedinRef.current?.checkConnection(), 1000);
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        setNotification({ type: null, message: '' });
      }, 5000);
    } else if (linkedinStatus === 'error') {
      setNotification({ type: 'error', message: message ? decodeURIComponent(message) : 'Failed to connect LinkedIn account' });
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        setNotification({ type: null, message: '' });
      }, 5000);
    } else if (youtubeStatus === 'success') {
      setNotification({ type: 'success', message: 'YouTube account connected successfully!' });
      setTimeout(() => youtubeRef.current?.checkConnection(), 3000);
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        setNotification({ type: null, message: '' });
      }, 5000);
    } else if (youtubeStatus === 'error') {
      setNotification({ type: 'error', message: message ? decodeURIComponent(message) : 'Failed to connect YouTube account' });
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        setNotification({ type: null, message: '' });
      }, 5000);
    } else if (instagramStatus === 'success') {
      setNotification({ type: 'success', message: 'Instagram account connected successfully!' });
      setTimeout(() => instagramRef.current?.checkConnection(), 1500);
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        setNotification({ type: null, message: '' });
      }, 5000);
    } else if (instagramStatus === 'error') {
      setNotification({ type: 'error', message: message ? decodeURIComponent(message) : 'Failed to connect Instagram account' });
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        setNotification({ type: null, message: '' });
      }, 5000);
    } else if (facebookStatus === 'success') {
      setNotification({ type: 'success', message: 'Facebook account connected successfully!' });
      setTimeout(() => facebookRef.current?.checkConnection(), 1500);
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        setNotification({ type: null, message: '' });
      }, 5000);
    } else if (facebookStatus === 'error') {
      setNotification({ type: 'error', message: message ? decodeURIComponent(message) : 'Failed to connect Facebook account' });
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        setNotification({ type: null, message: '' });
      }, 5000);
    }
  }, [searchParams]);

  // Check for auth token on mount
  useEffect(() => {
    try {
      const t = localStorage.getItem('token');
      setTokenPresent(!!t);
    } catch {
      setTokenPresent(false);
    }
  }, []);

  // Auto-check social connections on load after login
  useEffect(() => {
    const twitterStatus = searchParams.get('twitter');
    const linkedinStatus = searchParams.get('linkedin');
    const youtubeStatus = searchParams.get('youtube');
    const instagramStatus = searchParams.get('instagram');

    if (tokenPresent && !twitterStatus && !linkedinStatus && !youtubeStatus && !instagramStatus) {
      const timers: number[] = [];
      timers.push(window.setTimeout(() => youtubeRef.current?.checkConnection?.(), 400));
      timers.push(window.setTimeout(() => twitterRef.current?.checkConnection?.(), 900));
      timers.push(window.setTimeout(() => linkedinRef.current?.checkConnection?.(), 1400));
      timers.push(window.setTimeout(() => instagramRef.current?.checkConnection?.(), 1900));

      return () => timers.forEach((id) => clearTimeout(id));
    }
  }, [tokenPresent, searchParams]);

  if (loading) {
    return (
      <CreatorLayout title="Settings" subtitle="Manage your account settings and integrations">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      </CreatorLayout>
    );
  }

  if (!user) {
    return (
      <CreatorLayout title="Settings" subtitle="Manage your account settings and integrations">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Failed to load profile</div>
          <button 
            onClick={loadProfile}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </CreatorLayout>
    );
  }

  return (
    <CreatorLayout 
      title="Settings" 
      subtitle="Manage your account settings and integrations"
    >
      {/* Notification Banner */}
      {notification.type && (
        <div className={`mb-6 p-4 rounded-2xl backdrop-blur-sm border ${
          notification.type === 'success' 
            ? 'bg-green-50/80 border-green-200/50 text-green-800 shadow-sm' 
            : notification.type === 'error'
            ? 'bg-red-50/80 border-red-200/50 text-red-800 shadow-sm'
            : 'bg-yellow-50/80 border-yellow-200/50 text-yellow-800 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                notification.type === 'success' ? 'bg-green-100' : 
                notification.type === 'error' ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                <span className={`text-sm ${
                  notification.type === 'success' ? 'text-green-600' : 
                  notification.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {notification.type === 'success' ? '✓' : '!'}
                </span>
              </div>
              <span className="font-semibold">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification({ type: null, message: '' })}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Auth Token Banner */}
      {!tokenPresent && (
        <div className="mb-6 p-4 rounded-2xl bg-yellow-50/80 backdrop-blur-sm border border-yellow-200/50 text-yellow-900 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">!</span>
              </div>
              <span className="font-semibold">You are not logged in. Please log in to connect accounts.</span>
            </div>
            <button
              onClick={() => {
                try {
                  const t = localStorage.getItem('token');
                  setTokenPresent(!!t);
                } catch {}
              }}
              className="text-yellow-700 hover:text-yellow-900 text-sm font-medium px-3 py-1 rounded-lg hover:bg-yellow-100/50 transition-colors"
            >
              Recheck
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50">
        <div className="p-6 border-b border-gray-200">
          <h1 className="hidden md:block text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="hidden md:block text-gray-600 mt-1">
            Manage your account preferences and integrations
          </p>
        </div>

        <div className="p-4 md:p-6 space-y-6 md:space-y-8">
          {/* Profile Information */}
          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Profile Information
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Change your personal data and account credentials
            </p>

            <div className="space-y-6">
              {/* Account Details */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Account Details
                </h3>
                <div className="pl-4 space-y-4">
                  <p className="text-xs text-gray-500">
                    Change basic account details
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                  </div>

                  <button
                    onClick={changePassword}
                    disabled={saving || !formData.currentPassword || !formData.newPassword}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Basic Info
                </h3>
                <div className="pl-4 space-y-4">
                  <p className="text-xs text-gray-500">
                    Update your personal information below
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <p className="text-xs text-gray-500">
                    Update your phone number below in your account.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setProfileName('');
                    setProfileEmail('');
                    setProfilePhone('');
                    setProfileData({});
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Clear Form
                </button>
              </div>
            </div>
          </section>

          {/* Linked Accounts */}
          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Linked Accounts</h2>
            <p className="text-sm text-gray-600 mb-6">Connect other accounts with external providers to access your content</p>
            
            <div className="space-y-4">
              <InstagramIntegrationWithSuspense ref={instagramRef} />
              <FacebookIntegrationWithSuspense ref={facebookRef} />
              <TwitterIntegrationWithSuspense ref={twitterRef} />
              <LinkedInIntegrationWithSuspense ref={linkedinRef} />
              <YouTubeIntegrationWithSuspense ref={youtubeRef} />
            </div>
          </section>

          {/* Notification Preferences */}
          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Notification Preferences</h2>
            <p className="text-sm text-gray-600 mb-6">Choose how you&apos;d like to receive updates about your Bloocube Vision</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Marketing Emails</p>
                  <p className="text-sm text-gray-500">Receive product news, feature updates and special offers via email</p>
                </div>
                <ToggleSwitch 
                  enabled={marketingEmails} 
                  onToggle={() => {
                    const next = !marketingEmails;
                    setMarketingEmails(next);
                    handlePreferenceChange('marketingEmails', next);
                  }} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Get email alerts about your tasks, posts and activity</p>
                </div>
                <ToggleSwitch 
                  enabled={emailNotifications} 
                  onToggle={() => {
                    const next = !emailNotifications;
                    setEmailNotifications(next);
                    handlePreferenceChange('emailNotifications', next);
                  }} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-500">Get push notifications on your mobile device and browser</p>
                </div>
                <ToggleSwitch 
                  enabled={pushNotifications} 
                  onToggle={() => {
                    const next = !pushNotifications;
                    setPushNotifications(next);
                    handlePreferenceChange('pushNotifications', next);
                  }} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-500">Receive SMS reminders for upcoming posts or urgent deadlines</p>
                </div>
                <ToggleSwitch 
                  enabled={smsNotifications} 
                  onToggle={() => {
                    const next = !smsNotifications;
                    setSmsNotifications(next);
                    handlePreferenceChange('smsNotifications', next);
                  }} 
                />
              </div>
            </div>
          </section>

          

          {/* Danger Zone */}
          <section>
            <h2 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-6">Irreversible and destructive actions</p>
            
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-red-900">Delete Account</h3>
                    <p className="text-sm text-red-700">Once you delete your account, there is no going back. Please be certain.</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-600 mr-2" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
            </div>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete your account and remove all data from our servers.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={deleteData.password}
                onChange={(e) => setDeleteData({ password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="••••••••••••"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={saving || !deleteData.password}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </CreatorLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
