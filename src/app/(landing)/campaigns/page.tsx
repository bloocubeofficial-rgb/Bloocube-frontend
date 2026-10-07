"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Users } from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import type { Campaign } from "@/types/campaign";

export default function PublicCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest<{ success: boolean; data: { campaigns: Campaign[] } }>(`/api/campaigns?status=active&limit=30`);
        if (!cancelled) setCampaigns(res.data.campaigns);
      } catch {
        if (!cancelled) setCampaigns([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Open Campaigns</h1>
      <p className="text-slate-600 mt-2">Browse live briefs from brands looking for creators right now.</p>

      {loading ? (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <p className="mt-10 text-sm text-slate-500">No campaigns found.</p>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map((c) => {
            const brandName = typeof c.brand_id === "object" ? c.brand_id?.name : "Brand";
            const daysLeft = Math.max(0, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 86400000));
            return (
              <div key={c._id} className="rounded-xl border border-slate-100 shadow-sm bg-white p-5 flex flex-col">
                <div className="text-xs font-semibold text-indigo-600 uppercase">{brandName}</div>
                <div className="font-semibold text-slate-900 mt-1">{c.title}</div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</div>
                <div className="mt-3 text-sm font-medium text-slate-800">
                  ₹{(c.payment?.amount || c.budget).toLocaleString("en-IN")} budget
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {daysLeft}d left</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {c.requirements.platforms.join(", ")}</span>
                </div>
                <Link href={`/creator/marketplace?campaign=${c._id}`} className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  View Details →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
