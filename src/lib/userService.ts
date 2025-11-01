import { apiRequest } from '@/lib/apiClient';

export type CreatorUser = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  profile?: { bio?: string; avatar_url?: string };
  socialAccounts?: Record<string, any>;
};

export type CreatorListResponse = { success: boolean; data: { users: CreatorUser[] } };

export const userService = {
  async listCreators(params: Record<string, string | number | undefined> = {}) {
    // Use the public creators endpoint (accessible to authenticated brands)
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return apiRequest<CreatorListResponse>(`/api/profile/creators?${qs}`);
  }
};




