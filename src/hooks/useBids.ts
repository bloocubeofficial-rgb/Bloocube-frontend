"use client";
import { useCallback, useMemo, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/apiClient';
import type { Bid, BidListResponse, BidResponse } from '@/types/bid';

type ListParams = {
  page?: number;
  limit?: number;
  status?: Bid['status'];
  campaign_id?: string;
  sort?: string;
};

export function useBids(initialParams: ListParams = {}) {
  const [params, setParams] = useState<ListParams>(initialParams);
  const [data, setData] = useState<Bid[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchBids = useCallback(async (overrides: ListParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(
        Object.entries({ ...params, ...overrides })
          .filter(([, v]) => v !== undefined && v !== null)
          .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {} as Record<string, string>)
      ).toString();
      const res = await apiRequest<BidListResponse>(`/api/bids?${query}`);
      setData(res.data.bids);
      setTotal(res.data.pagination.total);
      setHasFetched(true);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load bids';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const updateParams = useCallback((next: Partial<ListParams>) => {
    setParams(prev => ({ ...prev, ...next }));
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (!hasFetched) {
      fetchBids();
    }
  }, [hasFetched, fetchBids]);

  return useMemo(() => ({ data, total, loading, error, params, setParams: updateParams, refetch: fetchBids }), [data, total, loading, error, params, updateParams, fetchBids]);
}

export async function createBidApi(payload: Partial<Bid> & { campaign_id: string }) {
  const res = await apiRequest<BidResponse>(`/api/bids`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res.data.bid;
}

export async function withdrawBidApi(id: string) {
  const res = await apiRequest<{ success: boolean; message: string; data?: { bid: Bid } }>(`/api/bids/${id}/withdraw`, {
    method: 'POST'
  });
  return res.data?.bid;
}

export async function acceptBidApi(campaignId: string, bidId: string) {
  const res = await apiRequest<{ success: boolean; message: string; data?: { bid: Bid } }>(`/api/campaigns/${campaignId}/bids/${bidId}/accept`, {
    method: 'POST'
  });
  return res.data?.bid;
}

export async function rejectBidApi(campaignId: string, bidId: string) {
  const res = await apiRequest<{ success: boolean; message: string; data?: { bid: Bid } }>(`/api/campaigns/${campaignId}/bids/${bidId}/reject`, {
    method: 'POST'
  });
  return res.data?.bid;
}

