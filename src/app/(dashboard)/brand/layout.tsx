"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Briefcase, Home, Settings, Users, Store, BarChart3, User, LogOut, Search, Menu } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import NotificationDropdown from '@/Components/Brand/NotificationDropdown';

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Trigger auth sync across tabs
      window.dispatchEvent(new CustomEvent('authChange'));
    }
    router.replace('/login');
  };

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
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-indigo-500/30 to-purple-400">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-2xl shadow-2xl border-r border-gray-200/30 flex flex-col transition-all duration-700 ease-out`}>
          {/* Logo */}
          <div className="p-8 border-b border-gray-200/30 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-600/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <div className="relative z-10 flex items-center justify-center">
              <div className="relative w-20 h-20">
                <Image
                  src="/logo.png"
                  alt="Bloocube Logo"
                  fill
                  className="object-contain p-2"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full translate-y-8 -translate-x-8"></div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-8 px-6">
            <div className="space-y-3">
              {nav.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href} 
                    className={getNavItemClasses(item, isActive)}
                  >
                    <div className="relative">
                      <item.icon className={getIconClasses(item, isActive)} />
                      {isActive && (
                        <div className="absolute -inset-1 bg-white/20 rounded-lg blur-sm"></div>
                      )}
                    </div>
                    <span className="ml-4 font-medium">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse delay-75"></div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-6 border-t border-gray-200/30 bg-gradient-to-r from-gray-50/30 to-blue-50/20">
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-gray-200/30 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
              <div className="relative">
                {profileLoading ? (
                  <div className="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center animate-pulse">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                ) : profile?.profile?.avatar_url ? (
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Image
                      src={profile.profile.avatar_url}
                      alt={profile.name || 'User Avatar'}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                {profileLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                ) : profileError ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900 truncate">Brand Account</p>
                    <p className="text-xs text-red-500 truncate font-medium">Error loading profile</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {profile?.name || 'Brand Account'}
                    </p>
                    <p className="text-xs text-gray-500 truncate font-medium">
                      {profile?.email || 'brand@bloocube.com'}
                    </p>
                  </div>
                )}
              </div>
              <button onClick={onLogout} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 group">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden transition-all duration-500"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white/90 backdrop-blur-2xl border-b border-gray-200/30 shadow-lg relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <div className="relative z-10 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button 
                    className="lg:hidden p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-2xl transition-all duration-300 hover:scale-105"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profileLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
                      ) : profileError ? (
                        'Brand Dashboard'
                      ) : (
                        `Welcome back, ${profile?.name?.split(' ')[0] || 'Brand'}!`
                      )}
                    </h2>
                    <p className="text-sm text-gray-600 font-medium">Manage campaigns and connect with creators</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Search */}
                  <div className="relative hidden md:block">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search campaigns, creators..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 text-gray-900 pr-4 py-3.5 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-300 w-80 hover:shadow-md focus:shadow-lg"
                    />
                  </div>
                  
                  {/* Notifications */}
                  <NotificationDropdown />
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto bg-transparent">
            <div className="p-8 lg:p-10">
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

