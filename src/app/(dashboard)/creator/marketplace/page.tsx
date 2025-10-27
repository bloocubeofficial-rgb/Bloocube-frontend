"use client";
import { useMemo, useState, useEffect } from 'react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useBids, createBidApi } from '@/hooks/useBids';
import type { Campaign } from '@/types/campaign';
import { cookieAuthUtils } from '@/lib/cookieAuth';
import { Search, Filter, IndianRupee, Calendar, Users, Globe, CheckCircle, Clock, XCircle } from 'lucide-react';
import CreatorLayout from '@/Components/Creater/CreatorLayout';

export default function CreatorMarketplacePage() {
  const { data: campaigns, loading, error, params, setParams, refetch } = useCampaigns({ status: 'active', limit: 10 });
  const { data: bids, loading: bidsLoading, refetch: refetchBids } = useBids({});
  const [placing, setPlacing] = useState<string | null>(null);
  const [proposal, setProposal] = useState('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const user = (cookieAuthUtils.getUser?.() as { role?: string } | null) || null;
  const isCreator = user?.role === 'creator';
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Helper function to get bid status for a campaign
  const getBidStatus = (campaignId: string) => {
    const userBid = bids.find(bid => {
      // Handle both string and object campaign_id
      const bidCampaignId = typeof bid.campaign_id === 'string' 
        ? bid.campaign_id 
        : bid.campaign_id?._id;
      
      console.log('Comparing:', {
        campaignId,
        bidCampaignId,
        bidId: bid._id,
        match: bidCampaignId === campaignId
      });
      
      return bidCampaignId === campaignId;
    });
    
    console.log('Bid status result:', {
      campaignId,
      foundBid: userBid,
      status: userBid?.status || 'not_applied'
    });
    
    if (!userBid) return { status: 'not_applied', bid: null };
    return { status: userBid.status, bid: userBid };
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return campaigns;
    const q = search.toLowerCase();
    return campaigns.filter((c) => {
      const titleMatch = c.title?.toLowerCase().includes(q);
      const descMatch = (c.description || '').toLowerCase().includes(q);
      const platformMatch = Array.isArray(c.requirements?.platforms)
        ? c.requirements.platforms.some((p) => String(p).toLowerCase().includes(q))
        : false;
      const brandMatch = typeof (c as any).brand_id?.name === 'string'
        ? (c as any).brand_id.name.toLowerCase().includes(q)
        : false;
      return titleMatch || descMatch || platformMatch || brandMatch;
    });
  }, [campaigns, search]);

  // Debounce search input and update params
  useEffect(() => {
    const id = setTimeout(() => {
      setParams({ page: 1, search: search || undefined });
    }, 300);
    return () => clearTimeout(id);
  }, [search, setParams]);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch bids when component mounts
  useEffect(() => {
    if (isCreator) {
      refetchBids();
    }
  }, [isCreator, refetchBids]);

  // Debug: Log bids data when it changes
  useEffect(() => {
    console.log('Bids data updated:', {
      bidsCount: bids.length,
      bids: bids.map(b => ({
        id: b._id,
        campaign_id: b.campaign_id,
        status: b.status
      }))
    });
  }, [bids]);

  const placeBid = async () => {
    if (!isCreator) {
      setMessage({ type: 'error', text: 'Only creator accounts can place bids. Please login as a creator.' });
      return;
    }
    if (!selectedCampaign) return;
    try {
      setPlacing(selectedCampaign._id);
      await createBidApi({ campaign_id: selectedCampaign._id, proposal_text: proposal, bid_amount: amount, currency: 'INR' });
      // Close the modal immediately on success
      setSelectedCampaign(null);
      setMessage({ type: 'success', text: 'Bid submitted successfully!' });
      // Reset inputs
      setProposal('');
      setAmount(0);
      setAmountInput('');
      // Refresh data in the background
      void Promise.allSettled([refetch(), refetchBids()]);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to place bid';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setPlacing(null);
    }
  };

  return (
    <CreatorLayout 
      title="Creator Marketplace" 
      subtitle="Discover and bid on brand campaigns"
    >
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="hidden md:block text-3xl font-bold text-gray-300">Creator Marketplace</h1>
            <p className="hidden md:block mt-2 text-gray-400">Discover and bid on exciting brand campaigns</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search campaigns..."
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-400 transition-colors duration-200 min-w-[300px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>


    
      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 mr-2" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Filters Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 mb-8 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Filter Campaigns</h3>
              <p className="text-sm text-gray-500">Refine your search to find the perfect campaigns</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{filtered.length} campaigns found</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Platform</label>
            <select 
              className="w-full border  border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-400 transition-colors duration-200" 
              value={params.platform || ''} 
              onChange={e => setParams({ platform: e.target.value || undefined })}
            >
              <option value="">All Platforms</option>
              <option value="instagram">📸 Instagram</option>
              <option value="youtube">🎥 YouTube</option>
              <option value="twitter">🐦 X (Twitter)</option>
              <option value="linkedin">💼 LinkedIn</option>
              <option value="facebook">👥 Facebook</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Sort By</label>
            <select 
              className="w-full border  border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-400 transition-colors duration-200" 
              value={params.sort || '-createdAt'} 
              onChange={e => setParams({ sort: e.target.value })}
            >
              <option value="-createdAt">🕒 Newest First</option>
              <option value="createdAt">📅 Oldest First</option>
              <option value="-budget">💰 Highest Budget</option>
              <option value="budget">💵 Lowest Budget</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Budget Range</label>
            <select 
              className="w-full border  border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-400 transition-colors duration-200"
              defaultValue=""
            >
              <option value="">Any Budget</option>
              <option value="0-10000">₹0 - ₹10K</option>
              <option value="10000-50000">₹10K - ₹50K</option>
              <option value="50000-100000">₹50K - ₹1L</option>
              <option value="100000+">₹1L+</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Campaign Type</label>
            <select 
              className="w-full border  border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-400 transition-colors duration-200"
              defaultValue=""
            >
              <option value="">All Types</option>
              <option value="sponsored">🎯 Sponsored Posts</option>
              <option value="collaboration">🤝 Collaborations</option>
              <option value="review">⭐ Product Reviews</option>
              <option value="brand">🏷️ Brand Partnerships</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Quick filters:</span>
            <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200">
              High Budget
            </button>
            <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors duration-200">
              Instagram
            </button>
            <button className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors duration-200">
              YouTube
            </button>
          </div>
          <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
            Clear all filters
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {(loading || bidsLoading) && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">
            {loading ? 'Loading campaigns...' : 'Loading bid status...'}
          </span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading campaigns</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => {
          const bidStatus = getBidStatus(c._id);
          console.log('Rendering campaign:', c.title, 'bid status:', bidStatus);
          return (
            <div key={c._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{c.title}</h3>
                      {/* Bid Status Badge - Always show */}
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        bidStatus.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        bidStatus.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        bidStatus.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        bidStatus.status === 'not_applied' ? 'bg-gray-100 text-gray-600' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {bidStatus.status === 'accepted' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {bidStatus.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                        {bidStatus.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                        {bidStatus.status === 'not_applied' && <XCircle className="w-3 h-3 mr-1" />}
                        {bidStatus.status === 'accepted' ? 'Accepted' :
                         bidStatus.status === 'rejected' ? 'Rejected' :
                         bidStatus.status === 'pending' ? 'Pending' :
                         bidStatus.status === 'not_applied' ? 'Not Applied' : 'Applied'}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{c.description}</p>
                  </div>
                </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-green-600">
                  <IndianRupee className="w-4 h-4 mr-1" />
                  <span className="text-lg font-bold">₹{c.budget.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Active</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Globe className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Platforms</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.requirements.platforms.map(p => (
                    <span key={p} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-500 text-sm">
                  <Users className="w-4 h-4 mr-1" />
                  <span>Target: {(c as Campaign & { targetAudience?: string }).targetAudience || 'General'}</span>
                </div>
                <button 
                  className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                    bidStatus.status === 'accepted' 
                      ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-500' :
                    bidStatus.status === 'rejected' 
                      ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500' :
                    bidStatus.status === 'pending' 
                      ? 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:ring-yellow-500' :
                    bidStatus.status !== 'not_applied'
                      ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-blue-500' :
                    'border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={!isCreator || bidStatus.status !== 'not_applied'} 
                  onClick={() => bidStatus.status === 'not_applied' ? setSelectedCampaign(c) : null}
                >
                  {!isCreator ? 'Login Required' :
                   bidStatus.status === 'accepted' ? 'Accepted ✓' :
                   bidStatus.status === 'rejected' ? 'Rejected ✗' :
                   bidStatus.status === 'pending' ? 'Pending ⏳' :
                   bidStatus.status !== 'not_applied' ? 'Applied ✓' :
                   'Place Bid'}
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && !bidsLoading && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later.</p>
        </div>
      )}

      {selectedCampaign && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Place Your Bid</h2>
              <button 
                onClick={() => setSelectedCampaign(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">{selectedCampaign.title}</h3>
              <p className="text-sm text-gray-600 mt-1">Budget: ₹{selectedCampaign.budget.toLocaleString()}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Proposal
                </label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                  rows={4} 
                  value={proposal} 
                  onChange={e => setProposal(e.target.value)}
                  placeholder="Describe how you'll approach this campaign..."
                />
              </div>
              
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Bid Amount (INR)
  </label>
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <IndianRupee className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type="number"
      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={amountInput}
      onChange={(e) => {
        const val = e.target.value;
        setAmountInput(val);
        setAmount(val ? Number(val) : 0);  // only update numeric when valid
      }}
      placeholder="0"
    />
  </div>
</div>

            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200" 
                onClick={() => setSelectedCampaign(null)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200" 
                disabled={!isCreator || placing === selectedCampaign._id || !proposal || !amount} 
                onClick={placeBid}
              >
                {placing === selectedCampaign._id ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Bid'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </CreatorLayout>
  );
}


