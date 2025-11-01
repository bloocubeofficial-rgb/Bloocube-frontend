"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Briefcase, Home, Settings, Users, Store, BarChart3, User, LogOut } from 'lucide-react';
import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cookieAuthUtils } from '@/lib/cookieAuth';
import { getAvatarUrl } from '@/lib/profile';

interface SidebarProps {
  sidebarOpen: boolean;
}

const nav = [
  { name: 'Overview', href: '/brand', icon: Home, color: 'blue' },
  { name: 'Campaigns', href: '/brand/campaigns', icon: Briefcase, color: 'green' },
  { name: 'Marketplace', href: '/brand/marketplace', icon: Store, color: 'purple' },
  { name: 'Bids', href: '/brand/bids', icon: Users, color: 'orange' },
  { name: 'Analytics', href: '/brand/analytics', icon: BarChart3, color: 'indigo' },
  { name: 'Notifications', href: '/brand/notifications', icon: Bell, color: 'red' },
  { name: 'Settings', href: '/brand/settings', icon: Settings, color: 'gray' }
];

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

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading: profileLoading, error: profileError } = useUserProfile();

  const onLogout = () => {
    cookieAuthUtils.clearAuth();
    router.replace('/login');
  };

  return (
    <aside
      className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed left-0 top-0 z-50 w-64 sm:w-72 md:w-80 h-screen bg-white/95 backdrop-blur-2xl shadow-2xl border-r border-gray-200/30 flex flex-col transition-transform duration-500 ease-out will-change-transform`}
    >
      <div className="p-6 sm:p-7 md:p-8 border-b border-gray-200/30 bg-gradient-to-br via-[#654387] from-[#091536] to-[#0B0819]  relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
            <Image src="/logo.png" alt="Bloocube Logo" fill className="object-contain p-2" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full translate-y-8 -translate-x-8"></div>
      </div>

      <nav className="flex-1 py-6 md:py-8 px-4 md:px-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100 [scrollbar-width:thin]">
        <div className="space-y-2.5 md:space-y-3">
          {nav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={getNavItemClasses(item, isActive)}>
                <div className="relative">
                  <item.icon className={getIconClasses(item, isActive)} />
                  {isActive && <div className="absolute -inset-1 bg-white/20 rounded-lg blur-sm"></div>}
                </div>
                <span className="ml-4 font-medium truncate">{item.name}</span>
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

      <div className="p-4 md:p-6 border-t border-gray-200/30 bg-gradient-to-r from-gray-50/30 to-blue-50/20">
        <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-gray-200/30 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
          <div className="relative">
            {profileLoading ? (
              <div className="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center animate-pulse">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            ) : profile && getAvatarUrl(profile.profile?.avatar_url) ? (
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 border-2 border-gray-200">
                <Image src={getAvatarUrl(profile.profile?.avatar_url) || ''} alt={profile?.name || 'User Avatar'} width={48} height={48} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-white text-xl font-semibold">
                  {(profile?.name || 'B').charAt(0).toUpperCase()}
                </span>
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
                <p className="text-sm font-bold text-gray-900 truncate">{profile?.name || 'Brand Account'}</p>
                <p className="text-xs text-gray-500 truncate font-medium">{profile?.email || 'brand@bloocube.com'}</p>
              </div>
            )}
          </div>
          <button onClick={onLogout} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 group">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;


