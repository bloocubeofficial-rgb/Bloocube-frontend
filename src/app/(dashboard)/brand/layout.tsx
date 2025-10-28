"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Briefcase, Home, Settings, Users, Store, BarChart3, User, LogOut, Search, Menu, FileText } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cookieAuthUtils } from '@/lib/cookieAuth';
import NotificationDropdown from '@/Components/Brand/NotificationDropdown';
import HeaderRow from '@/Components/layout/HeaderRow';
import Sidebar from '@/Components/Brand/Sidebar';

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, isLoading } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useUserProfile();
  
  const nav = [
    { name: 'Overview', href: '/brand', icon: Home, color: 'blue' },
    { name: 'Campaigns', href: '/brand/campaigns', icon: Briefcase, color: 'green' },
    { name: 'Marketplace', href: '/brand/marketplace', icon: Store, color: 'purple' },
    { name: 'Bids', href: '/brand/bids', icon: Users, color: 'orange' },
    { name: 'Analytics', href: '/brand/analytics', icon: BarChart3, color: 'indigo' },
    { name: 'Notifications', href: '/brand/notifications', icon: Bell, color: 'red' },
    { name: 'Settings', href: '/brand/settings', icon: Settings, color: 'gray' }
  ];

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);
  // Require auth for brand routes - only check when not loading
  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) return;
    
    const isBrand = user?.role === 'brand';
    if (!isAuthenticated || !isBrand) {
      console.log('🚫 Auth check failed, redirecting to login', { isAuthenticated, isBrand, userRole: user?.role });
      router.replace('/login');
    }
  }, [isAuthenticated, user, router, isLoading]);

  const onLogout = () => {
    cookieAuthUtils.clearAuth();
    router.replace('/login');
  };

  const displayName = profile?.name || profile?.email || 'Brand Account';

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not a brand user
  if (!isAuthenticated || user?.role !== 'brand') {
    return null;
  }

  const getNavItemClasses = (item: typeof nav[0], isActive: boolean) => {
    const baseClasses = "group relative flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-500 ease-out transform hover:scale-[1.02] hover:shadow-lg";
    const activeClasses = `bg-gradient-to-r from-${item.color}-500 via-${item.color}-600 to-${item.color}-700 text-white shadow-xl shadow-${item.color}-200/50 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300`;
    const inactiveClasses = "text-gray-700 hover:bg-white/80 hover:text-gray-900 hover:shadow-md backdrop-blur-sm border border-transparent hover:border-gray-200/50";
    
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  const getIconClasses = (item: typeof nav[0], isActive: boolean) => {
    const baseClasses = "w-5 h-5 transition-all duration-500 ease-out";
    const activeClasses = "text-white drop-shadow-sm";
    const inactiveClasses = `text-gray-500 group-hover:text-${item.color}-600 group-hover:scale-110`;
    
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br via-[#654387] from-[#091536] to-[#0B0819]">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* Main Content wrapper aligned with CreatorLayout */}
      <div className="lg:ml-80">
        {/* Mobile Header (sticky) */}
        <div className="lg:hidden bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200/50 px-3 py-2 flex items-center justify-between sticky top-0 z-[100]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-gray-900 truncate">Brand Dashboard</h1>
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              >
                <User className="w-3.5 h-3.5" />
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[10000]">
                  <a
                    href="/brand/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </a>
                  <a
                    href="/brand/bids"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <FileText className="w-4 h-4 mr-3" />
                    Bids
                  </a>
                  <a
                    href="/brand/analytics"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Analytics
                  </a>
                  <hr className="my-1" />
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full flex items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
     

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto bg-transparent">
            <div className="p-4 lg:p-5">
              <div className="animate-in fade-in-0 slide-in-from-bottom-6 duration-700 ease-out">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

