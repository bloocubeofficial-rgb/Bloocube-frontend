"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import AdminLayout from "@/Components/Admin/AdminLayout";

type AdminCampaign = { _id: string; title: string; status: string; brand: string; applications: number; createdAt: string };

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ success: boolean; data: { campaigns: AdminCampaign[] } }>("/api/admin/campaigns")
      .then((res) => setCampaigns(res.data.campaigns))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Campaigns</h1>
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Brand</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Applications</th>
              <th className="text-left px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 text-slate-400" colSpan={5}>Loading...</td></tr>
            ) : campaigns.length === 0 ? (
              <tr><td className="px-4 py-6 text-slate-400" colSpan={5}>No campaigns found.</td></tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.title}</td>
                  <td className="px-4 py-3 text-slate-600">{c.brand}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{c.status}</td>
                  <td className="px-4 py-3 text-slate-600">{c.applications}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
