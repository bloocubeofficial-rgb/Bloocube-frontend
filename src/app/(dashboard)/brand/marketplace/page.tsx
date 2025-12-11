"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userService, type CreatorUser } from '@/lib/userService';
import { Search, Filter, Users, Star, MapPin, Eye, MessageCircle, Plus, Zap, ChevronDownIcon, CheckIcon } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAuth } from '@/hooks/useAuth';

interface Creator {
  id: string;
  name: string;
  handle: string;
  bio: string;
  location: string;
  platforms: string[];
  followers: {
    total: number;
    breakdown: { [key: string]: number };
  };
  engagement: {
    rate: number;
    avgLikes: number;
    avgComments: number;
    avgShares: number;
  };
  rating: number;
  reviewCount: number;
  categories: string[];
  verified: boolean;
  recentWork: {
    title: string;
    platform: string;
    metrics: {
      views: number;
      likes: number;
      comments: number;
    };
  }[];
  pricing: {
    min: number;
    max: number;
    currency: string;
  };
  availability: 'available' | 'busy' | 'unavailable';
  responseTime: string;
  completionRate: number;
}

export default function BrandMarketplacePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: campaigns } = useCampaigns({ limit: 24 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
const [isExpanded, setIsExpanded] = useState(false);
  // Dynamic load creators
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await userService.listCreators({ active: 'true' });
        const users = res.data?.users || [];
        const mapped: Creator[] = users.map((u: CreatorUser) => {
          const ig = (u.socialAccounts as any)?.instagram;
          const yt = (u.socialAccounts as any)?.youtube;
          const tw = (u.socialAccounts as any)?.twitter;
          const platforms: string[] = [
            ig?.username ? 'Instagram' : null,
            yt?.id ? 'YouTube' : null,
            tw?.username ? 'Twitter' : null
          ].filter(Boolean) as string[];
          return {
            id: u._id,
            name: u.name || u.email || 'Creator',
            handle: ig?.username ? `@${ig.username}` : (tw?.username ? `@${tw.username}` : ''),
            bio: u.profile?.bio || '',
            location: '',
            platforms,
            followers: {
              total: Number(yt?.subscriberCount || 0),
              breakdown: {
                Instagram: 0,
                YouTube: Number(yt?.subscriberCount || 0),
                TikTok: 0
              }
            },
            engagement: { rate: 0, avgLikes: 0, avgComments: 0, avgShares: 0 },
            rating: 0,
            reviewCount: 0,
            categories: [],
            verified: false,
            recentWork: [],
            pricing: { min: 0, max: 0, currency: 'INR' },
            availability: 'available',
            responseTime: '-',
            completionRate: 0
          };
        });
        if (!cancelled) setCreators(mapped);
      } catch (e) {
        if (!cancelled) setCreators([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         creator.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         creator.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = selectedPlatform === 'all' || creator.platforms.some(p => p.toLowerCase() === selectedPlatform);
    const matchesCategory = selectedCategory === 'all' || creator.categories.some(cat => cat.toLowerCase() === selectedCategory);
    
    return matchesSearch && matchesPlatform && matchesCategory;
  });

  const sortedCreators = [...filteredCreators].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'followers':
        return b.followers.total - a.followers.total;
      case 'engagement':
        return b.engagement.rate - a.engagement.rate;
      case 'price-low':
        return a.pricing.min - b.pricing.min;
      case 'price-high':
        return b.pricing.max - a.pricing.max;
      default:
        return 0;
    }
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'busy':
        return 'text-yellow-600 bg-yellow-100';
      case 'unavailable':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 6) return 'text-green-600';
    if (rate >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]')) {
        setIsPlatformDropdownOpen(false);
        setIsCategoryDropdownOpen(false);
        setIsSortDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'brand') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Brand access required</h1>
          <p className="text-sm text-gray-600 mb-4">Please sign in with a brand account to access the marketplace.</p>
        </div>
      </div>
    );
  }

  const platformOptions = [
    { value: 'all', label: 'All Platforms' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'twitter', label: 'Twitter'},
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'tiktok', label: 'TikTok' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories'},
    { value: 'fashion', label: 'Fashion' },
    { value: 'technology', label: 'Technology' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'lifestyle', label: 'Lifestyle'},
    { value: 'beauty', label: 'Beauty' },
    { value: 'food', label: 'Food' },
    { value: 'travel', label: 'Travel' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'followers', label: 'Most Followers' },
    { value: 'engagement', label: 'Best Engagement' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading creators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto mt-4 sm:mt-2 ">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Creator Marketplace</h1>
              <p className="mt-2 text-gray-600">Discover talented creators and build meaningful partnerships for your brand</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search creators, categories, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-80 pl-10 pr-4 py-3 border border-gray-300 rounded-sm  focus:outline-none transition-colors"
                />
              </div>
              <Link 
                href="/brand/campaigns"
                className="inline-flex items-center justify-center px-6 py-3  bg-gradient-to-r from-blue-600 to-purple-600  text-white font-medium rounded-sm hover:bg-blue-700 focus:outline-none  transition-colors duration-200 w-full sm:w-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Campaign
              </Link>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-sm hove:shadow-sm  border border-gray-200/04 p-6 mb-8">
        <div className="flex mb-5 item-center justify-center sm:flex-row sm:items-center sm:justify-between gap-6 w-full ">


         <div className="flex items-center gap-3">
  <div className="p-2 bg-blue-100 rounded-sm flex items-center justify-center">
    <Filter className="w-5 h-5 text-blue-600" />
  </div>
  <span className="text-sm font-semibold text-gray-900 lg:text-lg">Filter & Sort</span>
</div>

           {/* View Mode Toggle */}
           <div className="flex items-center gap-2">
  <span className="text-sm text-gray-500">View:</span>
  <div className="flex items-center bg-gray-300 rounded-sm p-1">
    <button
      onClick={() => setViewMode('grid')}
      className={`p-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
        <div className="bg-current rounded-sm"></div>
        <div className="bg-current rounded-sm"></div>
        <div className="bg-current rounded-sm"></div>
        <div className="bg-current rounded-sm"></div>
      </div>
    </button>
    <button
      onClick={() => setViewMode('list')}
      className={`p-1 rounded transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <div className="w-3 h-3 flex flex-col gap-0.5">
        <div className="bg-current h-0.5 rounded"></div>
        <div className="bg-current h-0.5 rounded"></div>
        <div className="bg-current h-0.5 rounded"></div>
      </div>
    </button>
  </div>
</div>

        </div>
           <div className="flex flex-col lg:flex-row gap-3 w-full">
              {/* Platform Filter */}
              <div className="relative" data-dropdown>
                <button
                  type="button"
             className="w-full inline-flex items-center gap-2 px-4 py-3 border border-gray-200/04 rounded-sm focus:outline-none transition-colors text-left"

                  onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)}
                >
                  <span className="text-gray-700">
                    {platformOptions.find(opt => opt.value === selectedPlatform)?.label}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ml-auto ${isPlatformDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isPlatformDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200/04 rounded-sm shadow-sm">
                    <div className="p-1">
                      {platformOptions.map((option) => (
                        <button
                          key={option.value}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded text-left transition-colors"
                          onClick={() => {
                            setSelectedPlatform(option.value);
                            setIsPlatformDropdownOpen(false);
                          }}
                        >
                        
                          <span className="text-sm text-gray-700">{option.label}</span>
                          {selectedPlatform === option.value && (
                            <CheckIcon className="w-4 h-4 text-blue-600 " />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="relative" data-dropdown>
                <button
                  type="button"
              className="w-full inline-flex items-center gap-2 px-4 py-3 border border-gray-200/04 rounded-sm focus:outline-none transition-colors text-left"

                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                >
                 <span className="text-gray-700">
  {categoryOptions.find(opt => opt.value === selectedCategory)?.label}
</span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isCategoryDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200/04 rounded-sm shadow-lg">
                    <div className="p-2">
                      {categoryOptions.map((option) => (
                        <button
                          key={option.value}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded text-left transition-colors"
                          onClick={() => {
                            setSelectedCategory(option.value);
                            setIsCategoryDropdownOpen(false);
                          }}
                        >
                          {/* <span>{option.icon}</span> */}
                          <span className="text-sm text-gray-700 ">{option.label}</span>
                          {selectedCategory === option.value && (
                            <CheckIcon className="w-4 h-4 text-blue-600 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Filter */}
              <div className="relative" data-dropdown>
                <button
                  type="button"
              className="w-full inline-flex items-center gap-2 px-4 py-3 border border-gray-200/04 rounded-sm focus:outline-none transition-colors text-left"

                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                >
                  <span className="text-gray-700">
                    {sortOptions.find(opt => opt.value === sortBy)?.label}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isSortDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200/04 rounded-sm shadow-lg">
                    <div className="p-2">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded text-left transition-colors"
                          onClick={() => {
                            setSortBy(option.value);
                            setIsSortDropdownOpen(false);
                          }}
                        >
                          {/* <span>{option.icon}</span> */}
                          <span className="text-sm text-gray-700">{option.label}</span>
                          {sortBy === option.value && (
                            <CheckIcon className="w-4 h-4 text-blue-600 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Discovering amazing creators...</span>
            </div>
          </div>
        )}

        {/* Creators Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCreators.map(creator => (
              <div key={creator.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 p-6 group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {creator.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg truncate">{creator.name}</h3>
                        {creator.verified && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{creator.handle}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getAvailabilityColor(creator.availability)} mt-2 sm:mt-0 shrink-0`}>
                    {creator.availability}
                  </span>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{creator.bio}</p>

                {/* Location & Rating */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {creator.location}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-semibold">{creator.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">({creator.reviewCount})</span>
                  </div>
                </div>

                {/* Platforms */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {creator.platforms.map(platform => (
                      <span key={platform} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Followers</div>
                    <div className="font-bold text-lg text-gray-900">{formatNumber(creator.followers.total)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Engagement</div>
                    <div className={`font-bold text-lg ${getEngagementColor(creator.engagement.rate)}`}>
                      {creator.engagement.rate}%
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xs text-green-600 uppercase tracking-wide font-medium">Price Range</div>
                  <div className="font-bold text-lg text-green-700">
                    ₹{formatNumber(creator.pricing.min)} - ₹{formatNumber(creator.pricing.max)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button className="flex-1 px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 group-hover:shadow-md">
                    <Eye className="w-4 h-4 inline mr-2" />
                    View Profile
                  </button>
                  <button className="px-4 py-3 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 w-full sm:w-auto">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
            </div>
          ))}
        </div>
      )}

        {/* Campaigns Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-xl font-semibold text-gray-900">All Campaigns</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(campaigns || []).filter((c: any) => {
              // Filter out expired campaigns (only show campaigns with active timeline)
              if (!c.deadline) return false;
              const deadlineDate = new Date(c.deadline);
              const now = new Date();
              return deadlineDate > now; // Only include campaigns with future deadlines
            }).map((c: any) => (
              <div key={c._id} className="bg-white rounded-sm hover:shadow-sm border border-gray-200/04 p-6  transition-shadow">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{c.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">{c.status}</span>
                </div>
 <div className='m-auto '><p className={`text-sm text-gray-600 mt-2 mb-3  break-words whitespace-normal ${isExpanded ? '' : 'line-clamp-2'}`}>
    {c.description}
  </p>

  {c.description.length > 120 && (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className="text-blue-600 mt-1  mb-4 text-xs hover:underline"
    >
      {isExpanded ? "Read less" : "Read more"}
    </button>
  )}</div>
                <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                  <span className="text-gray-700 font-medium">₹{Number(c.budget || 0).toLocaleString()}</span>
                  <span className="text-gray-500">{c.deadline ? new Date(c.deadline).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {!loading && sortedCreators.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
              <Users className="w-16 h-16" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No creators found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search criteria or filters to discover more creators.</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedPlatform('all');
                setSelectedCategory('all');
                setSortBy('rating');
              }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600   text-white rounded-sm hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Insights Section */}
        {!loading && sortedCreators.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Marketplace Insights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 font-medium uppercase tracking-wide">Total Creators</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">{sortedCreators.length}</div>
                <div className="text-xs text-blue-600 mt-1">Available for collaboration</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-600 font-medium uppercase tracking-wide">Avg. Engagement</div>
                <div className="text-2xl font-bold text-green-900 mt-1">
                  {(sortedCreators.reduce((sum, c) => sum + c.engagement.rate, 0) / sortedCreators.length).toFixed(1)}%
                </div>
                <div className="text-xs text-green-600 mt-1">Across all creators</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-600 font-medium uppercase tracking-wide">Total Reach</div>
                <div className="text-2xl font-bold text-purple-900 mt-1">
                  {formatNumber(sortedCreators.reduce((sum, c) => sum + c.followers.total, 0))}
                </div>
                <div className="text-xs text-purple-600 mt-1">Combined followers</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm text-yellow-600 font-medium uppercase tracking-wide">Avg. Rating</div>
                <div className="text-2xl font-bold text-yellow-900 mt-1">
                  {(sortedCreators.reduce((sum, c) => sum + c.rating, 0) / sortedCreators.length).toFixed(1)}
                </div>
                <div className="text-xs text-yellow-600 mt-1">Creator satisfaction</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}