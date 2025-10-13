'use client'
import React, { useState, useEffect, Suspense } from "react";
import { Eye, EyeOff, Menu } from "lucide-react";
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

interface FormData {
  email: string;
  currentPassword: string;
  name: string;
  phone: string;
}

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    type="button"
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      enabled ? "bg-blue-600" : "bg-gray-300"
    }`}
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
  const [tokenPresent, setTokenPresent] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailUpdates, setEmailUpdates] = useState<boolean>(true);
  const [appNotifications, setAppNotifications] = useState<boolean>(true);
  const [pushNotifications, setPushNotifications] = useState<boolean>(false);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  
  // Refs to trigger connection checks
  const twitterRef = useRef<TwitterIntegrationRef>(null);
  const linkedinRef = useRef<LinkedInIntegrationRef>(null);
  const youtubeRef = useRef<YouTubeIntegrationRef>(null);
  const instagramRef = useRef<InstagramIntegrationRef>(null);
  const facebookRef = useRef<FacebookIntegrationRef>(null);

  const [formData, setFormData] = useState<FormData>({
    email: "john@example.com",
    currentPassword: "",
    name: "John Doe",
    phone: "+1 (555) 123-4567",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle URL parameters for Twitter/LinkedIn/YouTube/Instagram connection status
  useEffect(() => {
    const twitterStatus = searchParams.get('twitter');
    const linkedinStatus = searchParams.get('linkedin');
    const youtubeStatus = searchParams.get('youtube');
    const instagramStatus = searchParams.get('instagram');
    const message = searchParams.get('message');
    
    console.log('🔍 Settings page useEffect triggered with params:', {
      twitterStatus,
      linkedinStatus,
      youtubeStatus,
      instagramStatus,
      message,
      currentUrl: window.location.href
    });

    if (twitterStatus === 'success') {
      setNotification({ type: 'success', message: 'Twitter account connected successfully!' });
      // Trigger connection check for Twitter
      setTimeout(() => {
        twitterRef.current?.checkConnection();
      }, 1000);
      // Clear URL parameters after showing notification
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
      // Trigger connection check for LinkedIn
      setTimeout(() => {
        linkedinRef.current?.checkConnection();
      }, 1000);
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
      // Trigger connection check for YouTube with longer delay to allow backend to save tokens
      console.log('🎉 YouTube success detected, will check connection in 3 seconds');
      setTimeout(() => {
        console.log('🔄 Triggering YouTube connection check after success');
        youtubeRef.current?.checkConnection();
      }, 3000);
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
      // Trigger connection check for Instagram (slight delay to allow backend DB write)
      setTimeout(() => {
        instagramRef.current?.checkConnection();
      }, 1500);
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
    }
  }, [searchParams]);

  // Check for auth token on mount
  useEffect(() => {
    try {
      const t = localStorage.getItem('token');
      setTokenPresent(!!t);
      console.log('🔎 Token present:', !!t, t ? (t.substring(0, 20) + '...') : 'none');
    } catch {
      setTokenPresent(false);
    }
  }, []);

  // Auto-check social connections on load after login (staggered to avoid rate limits)
  useEffect(() => {
    const twitterStatus = searchParams.get('twitter');
    const linkedinStatus = searchParams.get('linkedin');
    const youtubeStatus = searchParams.get('youtube');
    const instagramStatus = searchParams.get('instagram');

    // Only run if logged in and no immediate callback status is being handled
    if (tokenPresent && !twitterStatus && !linkedinStatus && !youtubeStatus && !instagramStatus) {
      // Stagger checks to reduce burst calls
      const timers: number[] = [];
      timers.push(window.setTimeout(() => {
        youtubeRef.current?.checkConnection?.();
      }, 400));
      timers.push(window.setTimeout(() => {
        twitterRef.current?.checkConnection?.();
      }, 900));
      // Optional: LinkedIn if needed
      timers.push(window.setTimeout(() => {
        linkedinRef.current?.checkConnection?.();
      }, 1400));
      // Instagram connection check
      timers.push(window.setTimeout(() => {
        instagramRef.current?.checkConnection?.();
      }, 1900));

      return () => {
        timers.forEach((id) => clearTimeout(id));
      };
    }
  }, [tokenPresent, searchParams]);

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
            : 'bg-red-50/80 border-red-200/50 text-red-800 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className={`text-sm ${notification.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
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
                    onChange={(e) =>
                      handleInputChange("email", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) =>
                        handleInputChange("currentPassword", e.target.value)
                      }
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      type="button"
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-blue-600 text-sm hover:text-blue-800"
                    >
                      Update Password
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500">Minimum 8 characters</p>
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
                    onChange={(e) =>
                      handleInputChange("name", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("phone", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Update your phone number below in your account.
                </p>
              </div>
            </div>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
              Save Changes
            </button>
          </div>
        </section>

        {/* Linked Accounts */}
        {/* ... rest of your sections remain unchanged (no special typing needed) */}
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
          <p className="text-sm text-gray-600 mb-6">Choose how you&apos;d like to receive updates about your Biocube Vision</p>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Updates</p>
                <p className="text-sm text-gray-500">Receive product news, feature updates and special offers via email</p>
              </div>
              <ToggleSwitch enabled={emailUpdates} onToggle={() => setEmailUpdates(!emailUpdates)} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">In-App Notifications</p>
                <p className="text-sm text-gray-500">Get alerts about your tasks, projects and team communication</p>
              </div>
              <ToggleSwitch enabled={appNotifications} onToggle={() => setAppNotifications(!appNotifications)} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Get push notifications on your mobile device and browser</p>
              </div>
              <ToggleSwitch enabled={pushNotifications} onToggle={() => setPushNotifications(!pushNotifications)} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Reminders</p>
                <p className="text-sm text-gray-500">Receive email reminders for upcoming posts or urgent project deadlines</p>
              </div>
              <ToggleSwitch enabled={emailNotifications} onToggle={() => setEmailNotifications(!emailNotifications)} />
            </div>
          </div>
        </section>

        {/* API Key Management */}
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-2">API Key Management</h2>
          <p className="text-sm text-gray-600 mb-6">Generate or manage API keys for third-party integrations and custom applications</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current API Key</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="text"
                  
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 text-sm"
                />
                <div className="flex space-x-2">
                  <button className="flex-1 sm:flex-none bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                    Copy
                  </button>
                  <button className="flex-1 sm:flex-none bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm">
                    Regenerate
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Warning: When regenerating an API key, all integrations and applications
                using the previous key will stop working until they use the new key.
              </p>
            </div>

            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View API documentation
            </button>
          </div>
        </section>
      </div>
      </div>
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
