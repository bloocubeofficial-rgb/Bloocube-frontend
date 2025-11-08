import { apiRequest, cacheUtils } from '@/lib/apiClient';
import type { CampaignListResponse, CampaignResponse } from '@/types/campaign';
import type { BidListResponse } from '@/types/bid';

export const campaignService = {
  async list(params: Record<string, string | number | undefined>) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => [k, String(v)])
    ).toString();
    return apiRequest<CampaignListResponse>(`/api/campaigns?${qs}`);
  },

  async listByBrand(brandId: string, params: Record<string, string | number | undefined> = {}) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => [k, String(v)])
    ).toString();
    return apiRequest<CampaignListResponse>(`/api/campaigns/brand/${brandId}?${qs}`);
  },

  async get(id: string) {
    return apiRequest<CampaignResponse>(`/api/campaigns/${id}`);
  },

  async create(payload: unknown) {
    const result = await apiRequest<CampaignResponse>(`/api/campaigns`, { method: 'POST', body: JSON.stringify(payload) });
    // Cache invalidation is now handled automatically in apiClient, but we can also do it explicitly
    cacheUtils.clearPattern('/api/campaigns');
    return result;
  },

  async update(id: string, payload: unknown) {
    const result = await apiRequest<CampaignResponse>(`/api/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    // Cache invalidation is now handled automatically in apiClient, but we can also do it explicitly
    cacheUtils.clearPattern('/api/campaigns');
    return result;
  },

  async listBids(campaignId: string, params: Record<string, string | number | undefined> = {}) {
    const qs = new URLSearchParams(
      Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => [k, String(v)])
    ).toString();
    const url = qs ? `/api/campaigns/${campaignId}/bids?${qs}` : `/api/campaigns/${campaignId}/bids`;
    return apiRequest<BidListResponse>(url);
  }
};

