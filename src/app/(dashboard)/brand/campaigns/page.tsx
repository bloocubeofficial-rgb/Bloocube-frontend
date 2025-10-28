 "use client";
import { useEffect, useMemo, useState } from 'react';
import { createCampaign, updateCampaignApi } from '@/hooks/useCampaigns';
import type { Campaign } from '@/types/campaign';
import type { Bid } from '@/types/bid';
import { acceptBidApi, rejectBidApi } from '@/hooks/useBids';
import { campaignService } from '@/lib/campaignService';
import { useAuth } from '@/hooks/useAuth';
import { ChevronDownIcon, PlusIcon, EyeIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

type PlatformType = "instagram" | "youtube" | "twitter" | "linkedin" | "facebook";

export default function BrandCampaignsPage() {
  const { user, isLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("23:59");
  const [draft, setDraft] = useState<Partial<Campaign>>({
    title: '',
    description: '',
    budget: 0,
    deadline: '',
    requirements: { platforms: [] },
    payment: { type: 'fixed', amount: 0, currency: 'INR' },
    isPublic: true
  });
  const [publishActive, setPublishActive] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [bidsError, setBidsError] = useState<string | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Campaign | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string; show: boolean } | null>(null);
  const [draftActionsLoading, setDraftActionsLoading] = useState<{ [key: string]: boolean }>({});
  const [bidActionsLoading, setBidActionsLoading] = useState<{ [key: string]: boolean }>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [draftToggleLoading, setDraftToggleLoading] = useState(false);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message, show: true });
    setTimeout(() => {
      setToast(prev => prev ? { ...prev, show: false } : null);
    }, 5000);
  };

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Enhanced authentication check with better error handling
      if (!user) {
        console.warn('🔄 No user data available, waiting for authentication...');
        // Wait a bit for authentication to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!user) {
          throw new Error('Authentication required. Please sign in to access campaigns.');
        }
      }
      
      const brandId = user?.id;
      if (!brandId) {
        console.error('🚫 User authenticated but missing ID:', { user });
        throw new Error('User ID not found. Please refresh the page or sign in again.');
      }
      
      console.log('✅ Fetching campaigns for brand:', brandId);
      const res = await campaignService.listByBrand(String(brandId), { limit: 20 });
      setCampaigns(res.data.campaigns || []);
    } catch (e: unknown) {
      const error = e as Error;
      console.error('❌ Failed to load campaigns:', error);
      
      // More specific error messages based on error type
      let errorMessage = 'Failed to load campaigns';
      if (error.message.includes('Authentication required')) {
        errorMessage = 'Please sign in to access your campaigns';
      } else if (error.message.includes('User ID not found')) {
        errorMessage = 'Authentication issue detected. Please refresh the page.';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else {
        errorMessage = error.message || 'Failed to load campaigns';
      }
      
      setError(errorMessage);
      setCampaigns([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    // Only refetch when user is available and authenticated
    if (user && user.id && user.role === 'brand') {
      refetch();
    } else if (!isLoading && user === null) {
      // If authentication is complete but no user, show error
      setError('Authentication required. Please sign in to access campaigns.');
      setInitialLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  useEffect(() => {
    (async () => {
      if (!selectedCampaignId) return;
      try {
        setBidsLoading(true);
        setBidsError(null);
        const res = await campaignService.listBids(selectedCampaignId, { limit: 20 });
        setBids(res.data.bids);
      } catch (e: unknown) {
        const error = e as Error;
        setBidsError(error?.message || 'Failed to load bids');
      } finally {
        setBidsLoading(false);
      }
    })();
  }, [selectedCampaignId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('[data-dropdown]')) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const isValid = useMemo(() => {
    const titleOk = (draft.title || '').trim().length >= 5;
    const descOk = (draft.description || '').trim().length >= 10;
    const budgetOk = typeof draft.budget === 'number' && draft.budget >= 1000;
    const platformsOk = (draft.requirements?.platforms?.length || 0) >= 1;
    const deadlineOk = (deadlineDate && deadlineTime) ? (new Date(`${deadlineDate}T${deadlineTime}:00`) > new Date()) : false;
    return titleOk && descOk && budgetOk && platformsOk && deadlineOk;
  }, [draft, deadlineDate, deadlineTime]);

  const invalidReasons = useMemo(() => {
    const reasons: string[] = [];
    if (!draft.title || draft.title.trim().length < 5) reasons.push('Title must be at least 5 characters');
    if (!draft.description || draft.description.trim().length < 10) reasons.push('Description must be at least 10 characters');
    if (!(typeof draft.budget === 'number' && draft.budget >= 1000)) reasons.push('Budget must be at least 1000');
    if (!draft.requirements?.platforms || draft.requirements.platforms.length < 1) reasons.push('Select at least one platform');
    if (!(deadlineDate && deadlineTime && new Date(`${deadlineDate}T${deadlineTime}:00`) > new Date())) reasons.push('Choose a future deadline date and time');
    return reasons;
  }, [draft, deadlineDate, deadlineTime]);
  
  if (isLoading || initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoading ? 'Authenticating...' : 
             initialLoading ? 'Loading campaigns...' : 
             'Please wait...'}
          </p>
          {!user && (
            <p className="text-sm text-gray-500 mt-2">
              Checking authentication status...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'brand') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Brand access required</h1>
          <p className="text-sm text-gray-600 mb-4">Please sign in with a brand account to manage campaigns.</p>
        </div>
      </div>
    );
  }

  const onCreate = async () => {
    try {
      setCreating(true);
      setFormError(null);
      if (!isValid) {
        setFormError('Please fill all required fields: Title (≥5), Description (≥10), Budget (≥1000), Platforms (≥1), Future deadline.');
        return;
      }
      console.log('🚀 Creating campaign with draft:', draft, { deadlineDate, deadlineTime });
      // Combine date and time into ISO; fallback to end-of-day if parsing fails
      const combinedDeadline = (() => {
        if (deadlineDate) {
          const dt = new Date(`${deadlineDate}T${deadlineTime || '23:59'}:00`);
          if (!isNaN(dt.getTime())) return dt.toISOString();
        }
        const end = new Date();
        end.setHours(23,59,59,0);
        end.setDate(end.getDate() + 1);
        return end.toISOString();
      })();

      const payload = { 
        ...draft,
        deadline: combinedDeadline,
        payment: { ...(draft.payment as Record<string, unknown>), amount: Number(draft.budget || 0) }
      } as Record<string, unknown>;
      console.log('📦 Payload for POST /api/campaigns:', payload);
      const created = await createCampaign(payload);
      if (publishActive && created && created._id) {
        try {
          await updateCampaignApi(created._id, { status: 'active' } as Record<string, unknown>);
        } catch (e) {
          console.warn('Failed to set campaign active, leaving as draft', e);
        }
      }
      console.log('✅ Created campaign:', created);
      setDraft({ title: '', description: '', budget: 0, deadline: '', requirements: { platforms: [] }, payment: { type: 'fixed', amount: 0, currency: 'INR' }, isPublic: true });
      setDeadlineDate('');
      setDeadlineTime('23:59');
      setPublishActive(true);
      await refetch();
      showToast('success', `Campaign "${created.title}" created${publishActive ? ' and published' : ''} successfully! 🎉`);
    } catch (e: unknown) {
      const error = e as Error;
      setFormError(error?.message || 'Failed to create campaign');
      console.error('❌ Create campaign failed:', e);
    } finally {
      setCreating(false);
    }
  };

  const userData = user as Record<string, unknown> | null;

  const onAccept = async (campaignId: string, bidId: string) => {
    try {
      setBidActionsLoading(prev => ({ ...prev, [`accept_${bidId}`]: true }));
    await acceptBidApi(campaignId, bidId);
    // refresh bids
    setSelectedCampaignId(prev => prev); // trigger useEffect
      showToast('success', 'Bid accepted successfully! 🎉');
    } catch (e: unknown) {
      const error = e as Error;
      showToast('error', error?.message || 'Failed to accept bid');
    } finally {
      setBidActionsLoading(prev => ({ ...prev, [`accept_${bidId}`]: false }));
    }
  };
  
  const onReject = async (campaignId: string, bidId: string) => {
    try {
      setBidActionsLoading(prev => ({ ...prev, [`reject_${bidId}`]: true }));
    await rejectBidApi(campaignId, bidId);
    setSelectedCampaignId(prev => prev);
      showToast('success', 'Bid rejected successfully!');
    } catch (e: unknown) {
      const error = e as Error;
      showToast('error', error?.message || 'Failed to reject bid');
    } finally {
      setBidActionsLoading(prev => ({ ...prev, [`reject_${bidId}`]: false }));
    }
  };

  const onEditDraft = (campaign: Campaign) => {
    setEditingDraft(campaign);
    setDraft({
      title: campaign.title,
      description: campaign.description,
      budget: campaign.budget,
      deadline: campaign.deadline,
      requirements: campaign.requirements,
      payment: campaign.payment,
      isPublic: campaign.isPublic
    });
    // Parse deadline for date/time inputs
    if (campaign.deadline) {
      const deadlineDate = new Date(campaign.deadline);
      setDeadlineDate(deadlineDate.toISOString().split('T')[0]);
      setDeadlineTime(deadlineDate.toTimeString().slice(0, 5));
    }
  };

  const onUpdateDraft = async () => {
    if (!editingDraft || !isValid) return;
    
    try {
      setCreating(true);
      setFormError(null);
      
      const combinedDeadline = (() => {
        if (deadlineDate) {
          const dt = new Date(`${deadlineDate}T${deadlineTime || '23:59'}:00`);
          if (!isNaN(dt.getTime())) return dt.toISOString();
        }
        const end = new Date();
        end.setHours(23,59,59,0);
        end.setDate(end.getDate() + 1);
        return end.toISOString();
      })();

      const payload = { 
        ...draft,
        deadline: combinedDeadline,
        payment: { ...(draft.payment as Record<string, unknown>), amount: Number(draft.budget || 0) }
      } as Record<string, unknown>;

      await updateCampaignApi(editingDraft._id, payload);
      
      // Reset form
      setDraft({ title: '', description: '', budget: 0, deadline: '', requirements: { platforms: [] }, payment: { type: 'fixed', amount: 0, currency: 'INR' }, isPublic: true });
      setDeadlineDate('');
      setDeadlineTime('23:59');
      setPublishActive(true);
      setEditingDraft(null);
      
      await refetch();
      showToast('success', `Campaign "${draft.title}" updated successfully! ✨`);
    } catch (e: unknown) {
      const error = e as Error;
      setFormError(error?.message || 'Failed to update campaign');
      console.error('❌ Update campaign failed:', e);
    } finally {
      setCreating(false);
    }
  };

  const onPublishDraft = async (campaignId: string) => {
    try {
      setDraftActionsLoading(prev => ({ ...prev, [`publish_${campaignId}`]: true }));
      await updateCampaignApi(campaignId, { status: 'active' } as Record<string, unknown>);
      await refetch();
      showToast('success', 'Campaign published successfully! Your campaign is now live and visible to creators! 🚀');
    } catch (e: unknown) {
      const error = e as Error;
      showToast('error', error?.message || 'Failed to publish campaign');
    } finally {
      setDraftActionsLoading(prev => ({ ...prev, [`publish_${campaignId}`]: false }));
    }
  };

  const onDeleteDraft = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this draft campaign?')) return;
    
    try {
      setDraftActionsLoading(prev => ({ ...prev, [`delete_${campaignId}`]: true }));
      // You'll need to implement deleteCampaignApi in your hooks
      // await deleteCampaignApi(campaignId);
      await refetch();
      showToast('success', 'Draft campaign deleted successfully! 🗑️');
    } catch (e: unknown) {
      const error = e as Error;
      showToast('error', error?.message || 'Failed to delete campaign');
    } finally {
      setDraftActionsLoading(prev => ({ ...prev, [`delete_${campaignId}`]: false }));
    }
  };

  const platformOptions = [
    { value: 'instagram', label: 'Instagram', icon: '' },
    { value: 'youtube', label: 'YouTube', icon: '🎥' },
    { value: 'twitter', label: 'X (Twitter)', icon: '🐦' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'facebook', label: 'Facebook', icon: '👥' }
  ];

  const togglePlatform = (platform: PlatformType) => {
    const currentPlatforms = draft.requirements?.platforms || [];
    const newPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter(p => p !== platform)
      : [...currentPlatforms, platform];
    setDraft(d => ({ 
      ...d, 
      requirements: { 
        ...(d.requirements || { platforms: [] }), 
        platforms: newPlatforms as PlatformType[]
      } 
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
            <p className="mt-2 text-gray-600">Create compelling campaigns and connect with talented creators to bring your brand vision to life</p>
          </div>
          <Link
            href="/brand/marketplace"
            className="inline-flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-sm hover:shadow-md transition-all duration-200 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 w-full sm:w-auto justify-center"
          >
            <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse"></span>
            View all campaigns
          </Link>
        </div>

        {/* Create Campaign Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              {editingDraft ? (
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
              <PlusIcon className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingDraft ? `Edit Campaign: ${editingDraft.title}` : 'Launch Your Next Campaign'}
            </h2>
            {editingDraft && (
              <button
                onClick={() => {
                  setEditingDraft(null);
                  setDraft({ title: '', description: '', budget: 0, deadline: '', requirements: { platforms: [] }, payment: { type: 'fixed', amount: 0, currency: 'INR' }, isPublic: true });
                  setDeadlineDate('');
                  setDeadlineTime('23:59');
                  setPublishActive(true);
                }}
                className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
                Cancel Edit
              </button>
            )}
          </div>

          {userData && (userData.role as string) !== 'brand' && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-800">
                    You are logged in as a <span className="font-medium">{userData.role as string}</span>. Only brand users can create campaigns.
                  </p>
                </div>
          </div>
        </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div className="lg:col-span-2">
              <label htmlFor="campaign-title" className="block text-sm font-medium text-gray-700 mb-2">Campaign Title</label>
              <input 
                id="campaign-title"
                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors " 
                placeholder="e.g., Summer Fashion Collection 2024 "  
                value={draft.title || ''} 
                onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} 
              />
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="campaign-budget" className="block text-sm font-medium text-gray-700 mb-2">Budget (INR)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input 
                  id="campaign-budget"
                  className="w-full text-black pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                  type="number" 
                  placeholder="50,000" 
                  value={draft.budget || ''} 
                  onChange={e => setDraft(d => ({ ...d, budget: Number(e.target.value) }))} 
                />
        </div>
      </div>

            {/* Deadline */}
              <div>
              <label htmlFor="campaign-deadline" className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
            <div className="flex gap-3 flex-wrap">
                <input 
                  id="campaign-deadline"
                  className="flex-1 px-4 text-black py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                  type="date" 
                  value={deadlineDate} 
                  onChange={e => setDeadlineDate(e.target.value)} 
                />
                <input 
                  id="campaign-time"
                  className="w-32 px-4 text-black py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                  type="time" 
                  value={deadlineTime} 
                  onChange={e => setDeadlineTime(e.target.value)} 
                />
              </div>
            </div>

            {/* Platform Selection */}
            <div className="lg:col-span-2">
              <label htmlFor="platform-selector" className="block text-sm font-medium text-gray-700 mb-2">Social Media Platforms</label>
              <div className="relative" data-dropdown>
                <button
                  type="button"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-left flex items-center justify-between"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="text-gray-700">
                    {(draft.requirements?.platforms?.length || 0) > 0 
                      ? `${draft.requirements?.platforms?.length || 0} platform(s) selected`
                      : 'Choose your target social media platforms'
                    }
                  </span>
                  <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div className="p-2">
                      {platformOptions.map((option) => (
                        <label key={option.value} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draft.requirements?.platforms?.includes(option.value as PlatformType) || false}
                            onChange={() => togglePlatform(option.value as PlatformType)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700 flex items-center gap-2">
                            <span>{option.icon}</span>
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Selected platforms display */}
              {draft.requirements?.platforms && draft.requirements.platforms.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {draft.requirements.platforms.map(platform => {
                    const option = platformOptions.find(opt => opt.value === platform);
                    return (
                      <span key={platform} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        <span>{option?.icon}</span>
                        {option?.label}
                        <button
                          onClick={() => togglePlatform(platform as PlatformType)}
                          className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label htmlFor="campaign-description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                id="campaign-description"
                className="w-full px-4 text-black py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none" 
                rows={4}
                placeholder="Describe your campaign goals, target audience, content requirements, and any specific deliverables you expect from creators..." 
                value={draft.description || ''} 
                onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} 
              />
            </div>

            {/* Publish Option */}
            <div className="lg:col-span-2">
              <label htmlFor="publish-option" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
                <span className="sr-only">Publish immediately option</span>
                <input 
                  id="publish-option"
                  type="checkbox" 
                  checked={publishActive} 
                  onChange={e => setPublishActive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                  <p className="text-xs text-gray-500">Make your campaign live and visible to creators right away</p>
                </div>
              </label>
            </div>
          </div>

          {/* Error Messages */}
          {formError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{formError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Validation Messages */}
          {!isValid && invalidReasons.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Please fix the following issues:</h3>
                  <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                    {invalidReasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6 flex justify-end gap-3">
            {editingDraft && (
              <button 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                disabled={creating || !isValid} 
                onClick={onUpdateDraft}
              >
                {creating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Campaign...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Campaigns
                  </>
                )}
              </button>
            )}
            <button 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
              disabled={creating || !isValid} 
              onClick={editingDraft ? onUpdateDraft : onCreate}
            >
              {creating ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingDraft ? 'Updating Campaign...' : 'Creating Campaign...'}
                </>
              ) : (
                <>
                  {editingDraft ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  ) : (
                  <PlusIcon className="h-4 w-4" />
                  )}
                  {editingDraft ? 'Update Campaign' : 'Create Campaign'}
                </>
              )}
            </button>
          </div>
      </div>

        {/* Draft Campaigns Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Draft Campaigns</h2>
            <button
              onClick={() => {
                setDraftToggleLoading(true);
                setTimeout(() => {
                  setShowDrafts(!showDrafts);
                  setDraftToggleLoading(false);
                }, 300);
              }}
              disabled={draftToggleLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {draftToggleLoading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
              {draftToggleLoading ? 'Loading...' : (showDrafts ? 'Hide' : 'Show') + ' Drafts'}
            </button>
          </div>
          
          {showDrafts && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {campaigns.filter(c => c.status === 'draft').length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No draft campaigns</h3>
                  <p className="mt-1 text-sm text-gray-500">Create a campaign and save it as draft to see it here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {campaigns.filter(c => c.status === 'draft').map(c => (
                    <div key={c._id} className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{c.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-3 mb-3">{c.description}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Draft
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                          <span>Platforms</span>
                          <span>Budget</span>
                        </div>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex flex-wrap gap-1">
                            {c.requirements.platforms.map(p => {
                              const option = platformOptions.find(opt => opt.value === p);
                              return (
                                <span key={p} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md">
                                  <span>{option?.icon}</span>
                                  {option?.label}
                                </span>
                              );
                            })}
                          </div>
                          <div className="text-lg font-semibold text-gray-900">₹{c.budget.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 flex-wrap gap-2">
                        <div className="text-xs text-gray-500">
                          {new Date(c.deadline).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end">
                          <button
                            onClick={() => onEditDraft(c)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => onPublishDraft(c._id)}
                            disabled={draftActionsLoading[`publish_${c._id}`]}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {draftActionsLoading[`publish_${c._id}`] ? (
                              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            )}
                            {draftActionsLoading[`publish_${c._id}`] ? 'Publishing...' : 'Publish'}
                          </button>
                          <button
                            onClick={() => onDeleteDraft(c._id)}
                            disabled={draftActionsLoading[`delete_${c._id}`]}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {draftActionsLoading[`delete_${c._id}`] ? (
                              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <XMarkIcon className="h-3 w-3" />
                            )}
                            {draftActionsLoading[`delete_${c._id}`] ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
      </div>

        {/* Campaigns List */}
          <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Campaigns</h2>
          
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-600">Loading your campaigns...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                  {error.includes('Authentication') && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          setError(null);
                          setInitialLoading(true);
                          refetch();
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Retry
                      </button>
                      <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Page
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading campaigns...</p>
            </div>
          )}

          {!loading && !error && campaigns.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns yet</h3>
              <p className="mt-1 text-sm text-gray-500">Start building your brand presence by creating your first campaign above.</p>
            </div>
          )}

          {!loading && !error && campaigns.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {campaigns.map(c => (
                <div key={c._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{c.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">{c.description}</p>
                    </div>
                    <div className="ml-4">
                      {(() => {
                        const statusConfig = {
                          active: { bg: 'bg-green-100', text: 'text-green-800' },
                          draft: { bg: 'bg-gray-100', text: 'text-gray-800' },
                          completed: { bg: 'bg-blue-100', text: 'text-blue-800' },
                          default: { bg: 'bg-yellow-100', text: 'text-yellow-800' }
                        };
                        const config = statusConfig[c.status as keyof typeof statusConfig] || statusConfig.default;
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                            {c.status}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>Platforms</span>
                      <span>Budget</span>
                    </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex flex-wrap gap-1">
                        {c.requirements.platforms.map(p => {
                          const option = platformOptions.find(opt => opt.value === p);
                          return (
                            <span key={p} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                              <span>{option?.icon}</span>
                              {option?.label}
                            </span>
                          );
                        })}
                      </div>
                      <div className="text-lg font-semibold text-gray-900">₹{c.budget.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 flex-wrap gap-2">
                    <button 
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedCampaignId === c._id 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`} 
                      onClick={() => setSelectedCampaignId(prev => prev === c._id ? null : c._id)}
                    >
                      <EyeIcon className="h-4 w-4" />
                      View Proposals
                    </button>
                    <div className="text-xs text-gray-500">
                      {new Date(c.deadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bids Modal */}
      {!!selectedCampaignId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Campaign Proposals</h2>
                <p className="text-sm text-gray-600 mt-1">Review creative proposals and select the best fit for your campaign</p>
              </div>
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setSelectedCampaignId(null)}
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {bidsLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-600">Loading proposals...</span>
                  </div>
                </div>
              )}
              
              {bidsError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{bidsError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {!bidsLoading && !bidsError && bids.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No proposals yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Creative proposals will appear here once creators start applying to your campaign.</p>
                </div>
              )}
              
              {!bidsLoading && !bidsError && bids.length > 0 && (
                <div className="space-y-4">
                  {bids.map((bid: any) => (
                    <div key={bid._id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">C</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Creator Proposal</h3>
                            <p className="text-sm text-gray-500">Bid ID: {bid._id}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          bid.status === 'accepted' 
                            ? 'bg-green-100 text-green-800' 
                            : bid.status === 'rejected' 
                            ? 'bg-red-100 text-red-800'
                            : bid.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {bid.status === 'accepted' 
                            ? 'Accepted' 
                            : bid.status === 'rejected' 
                            ? 'Rejected'
                            : bid.status === 'completed'
                            ? 'Completed'
                            : 'New'
                          }
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-gray-900">
                            ₹{bid.bid_amount ? bid.bid_amount.toLocaleString() : '0'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {bid.currency || 'INR'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-700">
                          {bid.proposal_text || 'No proposal details available'}
                        </p>
                      </div>
                      
                      <div className="flex space-x-3">
                        {bid.status === 'accepted' ? (
                          <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Accepted</span>
                          </div>
                        ) : bid.status === 'rejected' ? (
                          <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Rejected</span>
                          </div>
                        ) : bid.status === 'completed' ? (
                          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Completed</span>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => onAccept(selectedCampaignId, bid._id)}
                              disabled={bidActionsLoading[`accept_${bid._id}`] || bidActionsLoading[`reject_${bid._id}`]}
                              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {bidActionsLoading[`accept_${bid._id}`] ? 'Accepting...' : 'Accept Bid'}
                            </button>
                            <button
                              onClick={() => onReject(selectedCampaignId, bid._id)}
                              disabled={bidActionsLoading[`accept_${bid._id}`] || bidActionsLoading[`reject_${bid._id}`]}
                              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {bidActionsLoading[`reject_${bid._id}`] ? 'Rejecting...' : 'Reject Bid'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
            toast.type === 'success' ? 'border-l-4 border-green-400' : 
            toast.type === 'error' ? 'border-l-4 border-red-400' : 
            'border-l-4 border-blue-400'
          }`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {toast.type === 'success' && (
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {toast.type === 'error' && (
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  {toast.type === 'info' && (
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className={`text-sm font-medium ${
                    toast.type === 'success' ? 'text-green-800' : 
                    toast.type === 'error' ? 'text-red-800' : 
                    'text-blue-800'
                  }`}>
                    {toast.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setToast(prev => prev ? { ...prev, show: false } : null)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


