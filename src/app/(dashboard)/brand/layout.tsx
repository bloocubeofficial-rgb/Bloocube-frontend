// "use client";

// import Image from 'next/image';
// import { usePathname, useRouter } from 'next/navigation';
// import { Bell, Briefcase, Home, Settings, Users, Store, BarChart3, LogOut, Menu, FileText } from 'lucide-react';
// import React, { useState, useEffect, useRef } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import { useUserProfile } from '@/hooks/useUserProfile';
// import { cookieAuthUtils } from '@/lib/cookieAuth';
// import { getAvatarUrl } from '@/lib/profile';
// import NotificationDropdown from '@/Components/Brand/NotificationDropdown';
// import HeaderRow from '@/Components/layout/HeaderRow';
// import Sidebar from '@/Components/Brand/Sidebar';
// import LogoutModal from '@/Components/Creater/LogoutModel';

// interface BrandLayoutProps {
//   children: React.ReactNode;
//   title?: string;
//   subtitle?: string;
//   headerActions?: React.ReactNode;
// }

// const UserInfo = React.memo(
//   ({
//     user,
//     onLogoutClick,
//   }: {
//     user: Record<string, unknown> | null;
//     onLogoutClick: () => void;
//   }) => {
//     const { profile: userProfile } = useUserProfile();

//     if (!user) return null;

//     try {
//       const profileAvatar = userProfile?.profile?.avatar_url;
//       const userProfileAvatar = (user.profile as { avatar_url?: string } | undefined)?.avatar_url;
//       const rawAvatarUrl = profileAvatar || userProfileAvatar;
//       const avatarUrl = rawAvatarUrl ? getAvatarUrl(rawAvatarUrl) : null;
//       const userName =
//         userProfile?.name ||
//         (user.name as string) ||
//         (user.email as string) ||
//         "Creator Account";
//       const firstLetter = userName.charAt(0).toUpperCase();

//       return (
//         <div className="flex items-center gap-4">
//           <div className="relative">
//             {avatarUrl ? (
//               <div className="w-12 h-12 relative rounded-full overflow-hidden shadow-lg border-2 border-gray-200 bg-gray-100">
//                 <Image
//                   src={avatarUrl}
//                   alt={userName}
//                   width={48}
//                   height={48}
//                   className="w-full h-full object-cover"
//                   onError={(e) => {
//                     const target = e.currentTarget;
//                     target.style.display = "none";
//                     const fallback = target.nextElementSibling as HTMLElement;
//                     if (fallback) fallback.style.display = "flex";
//                   }}
//                 />
//                 <div className="hidden absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full items-center justify-center">
//                   <span className="text-white text-lg font-semibold">
//                     {firstLetter}
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
//                 <span className="text-white text-lg font-semibold">
//                   {firstLetter}
//                 </span>
//               </div>
//             )}
//             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
//           </div>

//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-bold text-gray-900 truncate">
//               {userName}
//             </p>
//             <p className="text-xs text-gray-500 truncate font-medium">
//               {userProfile?.email ||
//                 (user.email as string) ||
//                 "creator@Bloocube.com"}
//             </p>
//           </div>

//           <button
//             onClick={onLogoutClick}
//             onTouchStart={onLogoutClick}
//             className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 group"
//           >
//             <LogOut className="w-5 h-5" />
//           </button>
//         </div>
//       );
//     } catch (error) {
//       console.error("Error rendering UserInfo:", error);
//       const userName =
//         (user.name as string) || (user.email as string) || "Creator Account";
//       const firstLetter = userName.charAt(0).toUpperCase();

//       return (
//         <div className="flex items-center gap-4">
//           <div className="relative">
//             <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
//               <span className="text-white text-lg font-semibold">
//                 {firstLetter}
//               </span>
//             </div>
//             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
//           </div>

//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-bold text-gray-900 truncate">
//               {userName}
//             </p>
//             <p className="text-xs text-gray-500 truncate font-medium">
//               {(user.email as string) || "creator@Bloocube.com"}
//             </p>
//           </div>

//           <button
//             onClick={onLogoutClick}
//             className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110"
//           >
//             <LogOut className="w-5 h-5" />
//           </button>
//         </div>
//       );
//     }
//   }
// );
// UserInfo.displayName = "UserInfo";
// const BrandLayout:React.FC<BrandLayoutProps>=({children,
//   title = "Brand Dashboard",
//   subtitle = "Welcome back! Here's your content overview",
//   headerActions,})=> {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [userDropdownOpen, setUserDropdownOpen] = useState(false);
//   const userDropdownRef = useRef<HTMLDivElement>(null);
//   const { isAuthenticated, user, isLoading } = useAuth();
//   const { profile, loading: profileLoading, error: profileError } = useUserProfile();
//   const [openLogoutModal, setOpenLogoutModal] = useState(false);
//   const nav = [
//     { name: 'Overview', href: '/brand', icon: Home, color: 'blue' },
//     { name: 'Campaigns', href: '/brand/campaigns', icon: Briefcase, color: 'green' },
//     { name: 'Marketplace', href: '/brand/marketplace', icon: Store, color: 'purple' },
//     { name: 'Bids', href: '/brand/bids', icon: Users, color: 'orange' },
//     { name: 'Analytics', href: '/brand/analytics', icon: BarChart3, color: 'indigo' },
//     { name: 'Notifications', href: '/brand/notifications', icon: Bell, color: 'red' },
//     { name: 'Settings', href: '/brand/settings', icon: Settings, color: 'gray' }
//   ];

//   // Close sidebar on route change
//   useEffect(() => {
//     setSidebarOpen(false);
//   }, [pathname]);
//   // Require auth for brand routes - only check when not loading
//   useEffect(() => {
//     if (typeof window === 'undefined' || isLoading) return;
    
//     const isBrand = user?.role === 'brand';
//     if (!isAuthenticated || !isBrand) {
//       console.log('🚫 Auth check failed, redirecting to login', { isAuthenticated, isBrand, userRole: user?.role });
//       router.replace('/login');
//     }
//   }, [isAuthenticated, user, router, isLoading]);

//    const handleOpenLogoutModal = () => {
//     setUserDropdownOpen(false);
//     setOpenLogoutModal(true);
//   };
//   const handleLogout = () => {
//       try {
//         cookieAuthUtils.clearAuth();
//       } finally {
//         setUserDropdownOpen(false);
//         router.push("/login");
//       }
//     };
  
//     const displayName =
//       profile?.name ||
//       ((user as Record<string, unknown>)?.name as string) ||
//       ((user as Record<string, unknown>)?.email as string) ||
//       "Brand Account";
//   // Handle escape key
//   useEffect(() => {
//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === 'Escape' && sidebarOpen) {
//         setSidebarOpen(false);
//       }
//     };
//     document.addEventListener('keydown', handleEscape);
//     return () => document.removeEventListener('keydown', handleEscape);
//   }, [sidebarOpen]);

//   // Close user dropdown on outside click
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
//         setUserDropdownOpen(false);
//       }
//     };
//     if (userDropdownOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [userDropdownOpen]);

//   // Show loading state while checking auth
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // Redirect if not authenticated or not a brand user
//   if (!isAuthenticated || user?.role !== 'brand') {
//     return null;
//   }

//   const getNavItemClasses = (item: typeof nav[0], isActive: boolean) => {
//     const baseClasses = "group relative flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-500 ease-out transform hover:scale-[1.02] hover:shadow-lg";
//     const activeClasses = `bg-gradient-to-r from-${item.color}-500 via-${item.color}-600 to-${item.color}-700 text-white shadow-xl shadow-${item.color}-200/50 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300`;
//     const inactiveClasses = "text-gray-700 hover:bg-white/80 hover:text-gray-900 hover:shadow-md backdrop-blur-sm border border-transparent hover:border-gray-200/50";
    
//     return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
//   };

//   const getIconClasses = (item: typeof nav[0], isActive: boolean) => {
//     const baseClasses = "w-5 h-5 transition-all duration-500 ease-out";
//     const activeClasses = "text-white drop-shadow-sm";
//     const inactiveClasses = `text-gray-500 group-hover:text-${item.color}-600 group-hover:scale-110`;
    
//     return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
//   };

//   return (
//     <>
//     <div className="min-h-screen ">
//       {/* Overlay for mobile */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ease-in-out"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

//       {/* Main Content wrapper aligned with CreatorLayout */}
//       <div className="lg:ml-80">
//         {/* Mobile Header (sticky) */}
//         <div className="lg:hidden bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200/50 px-3 py-2 flex items-center justify-between sticky top-0 z-[100]">
//           <button
//             onClick={() => setSidebarOpen(true)}
//             className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
//           >
//             <Menu className="w-5 h-5" />
//           </button>
//           <h1 className="text-base font-semibold text-gray-900 truncate">Brand Dashboard</h1>
//           <div className="flex items-center gap-2">
//             <NotificationDropdown />
//             <div className="relative" ref={userDropdownRef}>
//               <button
//                 onClick={() => setUserDropdownOpen(!userDropdownOpen)}
//                 className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200"
//               >
//                 {profile && getAvatarUrl(profile.profile?.avatar_url) ? (
//                   <Image
//                     src={getAvatarUrl(profile.profile?.avatar_url) || ''}
//                     alt={profile?.name || 'User'}
//                     width={32}
//                     height={32}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
//                     <span className="text-white text-xs font-semibold">
//                       {(profile?.name || ((user as Record<string, unknown>)?.name as string) || 'B').charAt(0).toUpperCase()}
//                     </span>
//                   </div>
//                 )}
//               </button>
//                 {userDropdownOpen && (
//                   <div className="fixed top-14 left-1/2 -translate-x-1/2 sm:absolute sm:right-0 sm:left-auto sm:translate-x-0 w-[92vw] sm:w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-[99999] overflow-hidden animate-in fade-in slide-in-from-top-2">
//                      <div className="p-4 bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-b border-gray-200">
//                       <UserInfo user={user || null} onLogoutClick={handleOpenLogoutModal} />
//                     </div>

//                 <div  className='py-1'>
//                   <a
//                     href="/brand/settings"
//                     className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
//                     onClick={() => setUserDropdownOpen(false)}
//                   >
//                     <Settings className="w-4 h-4 mr-3" />
//                     Settings
//                   </a>
//                   <a
//                     href="/brand/bids"
//                     className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
//                     onClick={() => setUserDropdownOpen(false)}
//                   >
//                     <FileText className="w-4 h-4 mr-3" />
//                     Bids
//                   </a>
//                   <a
//                     href="/brand/analytics"
//                     className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
//                     onClick={() => setUserDropdownOpen(false)}
//                   >
//                     <BarChart3 className="w-4 h-4 mr-3" />
//                     Analytics
//                   </a>
//                   <hr className="my-1" />
//                   <button
//                     type="button"
//                     onTouchStart={handleOpenLogoutModal}
//                     className="w-full flex items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
//                   >
//                     <LogOut className="w-4 h-4 mr-3" />
//                     Logout
//                   </button>
//                 </div>
//                   </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Desktop Header */}
//           <div className="hidden lg:block bg-white/80 backdrop-blur-sm  shadow-sm border-b border-gray-200 relative z-[9999]">
//             <div className="px-5 py-3.5">
//               <HeaderRow
//                 left={
//                   <div>
//                     <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
//                       {title}
//                     </h2>
//                     <p className="text-xs text-gray-500">{subtitle}</p>
//                   </div>
//                 }
//                 right={
//                   <div className="flex items-center space-x-2">
//                     <NotificationDropdown />
//                     {headerActions}
//                     <div className="relative" ref={userDropdownRef}>
//                       <div
//                         onClick={() => setUserDropdownOpen(!userDropdownOpen)}
//                         className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 cursor-pointer"
//                       >
//                         {profile && getAvatarUrl(profile.profile?.avatar_url) ? (
//                           <Image
//                             src={getAvatarUrl(profile.profile.avatar_url) || ""}
//                             alt={profile.name || "User"}
//                             width={32}
//                             height={32}
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
//                             <span className="text-white text-xs font-semibold">
//                               {displayName.charAt(0).toUpperCase()}
//                             </span>
//                           </div>
//                         )}
//                       </div>

//                       {userDropdownOpen && (
//                         <div className="absolute right-0 mt-5 w-72 rounded-xl bg-white border border-gray-200 shadow-lg z-[10000] overflow-hidden">
//                           <div className="p-4 bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-b border-gray-200">
//                             <UserInfo user={user || null} onLogoutClick={handleOpenLogoutModal} />
//                           </div>
//                           <div className="py-1">
//                             <a href="/creator/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50">
//                               <Settings className="w-4 h-4" /> Settings
//                             </a>
//                             <a href="/creator/bids" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50">
//                               <FileText className="w-4 h-4" /> My Bids
//                             </a>
//                             <a href="/creator/analytics" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50">
//                               <BarChart3 className="w-4 h-4" /> Analytics
//                             </a>
//                             <hr className="my-1 border-gray-200" />
//                             <button
//                               onClick={handleOpenLogoutModal}
//                               className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 font-medium hover:bg-red-50"
//                             >
//                               <LogOut className="w-4 h-4" /> Logout
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 }
//               />
//             </div>
//           </div>
//         {/* Main Content */}
//        <div className="p-4 lg:p-5">
//               <div className="animate-in fade-in-0 slide-in-from-bottom-6 duration-700 ease-out">
//                 {children}
//               </div>
//         </div>
     
//       </div>
//     </div>
//      <LogoutModal
//             open={openLogoutModal}
//             onOpenChange={setOpenLogoutModal}
//             onConfirm={handleLogout}
//           />
//     </>
//   );
// }
// export default BrandLayout

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Settings,
  FileText,
  BarChart3,
  LogOut,
} from "lucide-react";
import Sidebar from "@/Components/Brand/Sidebar";
import NotificationDropdown from "@/Components/Brand/NotificationDropdown";
import { useRouter } from "next/navigation";
import { cookieAuthUtils } from "@/lib/cookieAuth";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import HeaderRow from "@/Components/layout/HeaderRow";
import LogoutModal from "@/Components/Creater/LogoutModel";
import Image from "next/image";
import { getAvatarUrl } from "@/lib/profile";

interface BrandLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
}

const UserInfo = React.memo(
  ({
    user,
    onLogoutClick,
  }: {
    user: Record<string, unknown> | null;
    onLogoutClick: () => void;
  }) => {
    const { profile: userProfile } = useUserProfile();

    if (!user) return null;

    try {
      const profileAvatar = userProfile?.profile?.avatar_url;
      const userProfileAvatar = (user.profile as { avatar_url?: string } | undefined)?.avatar_url;
      const rawAvatarUrl = profileAvatar || userProfileAvatar;
      const avatarUrl = rawAvatarUrl ? getAvatarUrl(rawAvatarUrl) : null;
      const userName =
        userProfile?.name ||
        (user.name as string) ||
        (user.email as string) ||
        "Creator Account";
      const firstLetter = userName.charAt(0).toUpperCase();

      return (
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarUrl ? (
              <div className="w-12 h-12 relative rounded-full overflow-hidden shadow-lg border-2 border-gray-200 bg-gray-100">
                <Image
                  src={avatarUrl}
                  alt={userName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <div className="hidden absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    {firstLetter}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-semibold">
                  {firstLetter}
                </span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-500 truncate font-medium">
              {userProfile?.email ||
                (user.email as string) ||
                "creator@Bloocube.com"}
            </p>
          </div>

          <button
            onClick={onLogoutClick}
            onTouchStart={onLogoutClick}
            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 group"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      );
    } catch (error) {
      console.error("Error rendering UserInfo:", error);
      const userName =
        (user.name as string) || (user.email as string) || "Creator Account";
      const firstLetter = userName.charAt(0).toUpperCase();

      return (
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-semibold">
                {firstLetter}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-500 truncate font-medium">
              {(user.email as string) || "creator@Bloocube.com"}
            </p>
          </div>

          <button
            onClick={onLogoutClick}
            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      );
    }
  }
);
UserInfo.displayName = "UserInfo";

const BrandLayout: React.FC<BrandLayoutProps> = ({
  children,
  title = "Brand Dashboard",
  subtitle = "Welcome back! Here's your content overview",
  headerActions,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const router = useRouter();

  const handleOpenLogoutModal = () => {
    setUserDropdownOpen(false);
    setOpenLogoutModal(true);
  };

  const handleLogout = () => {
    try {
      cookieAuthUtils.clearAuth();
    } finally {
      setUserDropdownOpen(false);
      router.push("/login");
    }
  };

  const displayName =
    profile?.name ||
    ((user as Record<string, unknown>)?.name as string) ||
    ((user as Record<string, unknown>)?.email as string) ||
    "Creator Account";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen]);

  return (
    <>
      <div className="min-h-screen">
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <button
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main layout */}
        <div className={`
    transition-all duration-500 
    ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
    flex flex-col min-h-screen
  `}>
          {/* Mobile Header */}
          <div className="lg:hidden bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 px-3 py-2 flex items-center justify-between sticky top-0 z-[50]">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <NotificationDropdown />
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200"
                >
                  {profile && getAvatarUrl(profile.profile?.avatar_url) ? (
                    <Image
                      src={getAvatarUrl(profile.profile?.avatar_url) || ""}
                      alt={profile?.name || "User"}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </button>

                {/* Mobile Dropdown */}
                {userDropdownOpen && (
                  <div className="fixed top-14 left-1/2 -translate-x-1/2 sm:absolute sm:right-0 sm:left-auto sm:translate-x-0 w-[92vw] sm:w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-[99999] overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-b border-gray-200">
                      <UserInfo user={user || null} onLogoutClick={handleOpenLogoutModal} />
                    </div>
                    <div className="py-1">
                      <a href="/creator/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                        <Settings className="w-4 h-4" /> Settings
                      </a>
                      <a href="/creator/bids" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                        <FileText className="w-4 h-4" /> My Bids
                      </a>
                      <a href="/creator/analytics" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                        <BarChart3 className="w-4 h-4" /> Analytics
                      </a>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onTouchStart={handleOpenLogoutModal}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 font-medium hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Header */}
        <div className="hidden lg:block bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-[50] transition-all duration-500">

            <div className="px-5 py-3">
              <HeaderRow
                left={
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {title}
                    </h2>
                    <p className="text-xs text-gray-500">{subtitle}</p>
                  </div>
                }
                right={
                  <div className="flex items-center space-x-2">
                    <NotificationDropdown />
                    {headerActions}
                    <div className="relative" ref={userDropdownRef}>
                      <div
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 cursor-pointer"
                      >
                        {profile && getAvatarUrl(profile.profile?.avatar_url) ? (
                          <Image
                            src={getAvatarUrl(profile.profile.avatar_url) || ""}
                            alt={profile.name || "User"}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {userDropdownOpen && (
                        <div className="absolute right-0 mt-5 w-72 rounded-xl bg-white border border-gray-200 shadow-lg z-[10000] overflow-hidden">
                          <div className="p-4 bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-b border-gray-200">
                            <UserInfo user={user || null} onLogoutClick={handleOpenLogoutModal} />
                          </div>
                          <div className="py-1">
                            <a href="/creator/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50">
                              <Settings className="w-4 h-4" /> Settings
                            </a>
                            <a href="/creator/bids" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50">
                              <FileText className="w-4 h-4" /> My Bids
                            </a>
                            <a href="/creator/analytics" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50">
                              <BarChart3 className="w-4 h-4" /> Analytics
                            </a>
                            <hr className="my-1 border-gray-200" />
                            <button
                              onClick={handleOpenLogoutModal}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 font-medium hover:bg-red-50"
                            >
                              <LogOut className="w-4 h-4" /> Logout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                }
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 lg:p-5 relative">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </div>
      </div>

      <LogoutModal
        open={openLogoutModal}
        onOpenChange={setOpenLogoutModal}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default BrandLayout;
