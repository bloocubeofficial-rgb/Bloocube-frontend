"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '@/lib/apiClient';
import type { Campaign, CampaignListResponse, CampaignResponse } from '@/types/campaign';

type ListParams = {
  page?: number;
  limit?: number;
  status?: Campaign['status'];
  platform?: string;
  minBudget?: number;
  maxBudget?: number;
  sort?: string;
  search?: string;
};

export function useCampaigns(initialParams: ListParams = {}) {
  const [params, setParams] = useState<ListParams>(initialParams);
  const [data, setData] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async (overrides: ListParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(
        Object.entries({ ...params, ...overrides })
          .filter(([, v]) => v !== undefined && v !== null)
          .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {} as Record<string, string>)
      ).toString();
      const res = await apiRequest<CampaignListResponse>(`/api/campaigns?${query}`);
      setData(res.data.campaigns);
      setTotal(res.data.pagination.total);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load campaigns';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const updateParams = useCallback((next: Partial<ListParams>) => {
    setParams(prev => ({ ...prev, ...next }));
  }, []);

  return useMemo(() => ({ data, total, loading, error, params, setParams: updateParams, refetch: fetchCampaigns }), [data, total, loading, error, params, updateParams, fetchCampaigns]);
}

export async function getCampaign(id: string) {
  const res = await apiRequest<CampaignResponse>(`/api/campaigns/${id}`);
  return res.data.campaign;
}

export async function createCampaign(payload: Partial<Campaign>) {
  const res = await apiRequest<CampaignResponse>(`/api/campaigns`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res.data.campaign;
}

export async function updateCampaignApi(id: string, payload: Partial<Campaign>) {
  const res = await apiRequest<CampaignResponse>(`/api/campaigns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  return res.data.campaign;
}

