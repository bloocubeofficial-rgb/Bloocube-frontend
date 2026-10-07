"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, MapPin, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useBids } from "@/hooks/useBids";
import { useWallet } from "@/hooks/useWallet";
import { apiRequest } from "@/lib/apiClient";
import CreatorLayout from "@/Components/Creater/CreatorLayout";

function formatFollowers(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export default function CreatorDashboardPage() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { data: campaigns, loading: campaignsLoading } = useCampaigns({ status: "active", limit: 6 });
  const { data: bids } = useBids({ limit: 100 });
  const { wallet } = useWallet();
  const [payments, setPayments] = useState<Array<{ _id: string; amount: number; netAmount: number; status: string; campaign: { title: string }; createdAt: string }>>([]);

  useEffect(() => {
    apiRequest<{ success: boolean; data: { payments: typeof payments } }>("/api/payments")
      .then((res) => setPayments(res.data.payments))
      .catch(() => setPayments([]));
  }, []);

  const activeCollaborations = useMemo(() => bids.filter((b) => b.status === "accepted").length, [bids]);
  const applicationsCount = bids.length;

  const creator = profile?.creator;

  return (
    <CreatorLayout title="Dashboard" subtitle="Get brand opportunities on your terms.">
      <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-6 sm:p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-2xl font-bold">Get brand opportunities. On your terms.</h1>
              <p className="text-indigo-100 mt-2 max-w-md text-sm">
                Discover campaigns, submit your bids, collaborate with top brands and get paid securely.
              </p>
              <Link href="/creator/marketplace">
                <button className="mt-5 bg-white text-slate-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-slate-100">
                  Browse Campaigns →
                </button>
              </Link>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-slate-900">Recommended Campaigns</h2>
              <Link href="/creator/marketplace" className="text-sm font-semibold text-indigo-600">View All Campaigns →</Link>
            </div>
            {campaignsLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 rounded-xl bg-slate-100 animate-pulse" />)}
              </div>
            ) : campaigns.length === 0 ? (
              <p className="text-sm text-slate-500">No campaigns found yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((c) => {
                  const brandName = typeof c.brand_id === "object" ? c.brand_id?.name : "Brand";
                  return (
                    <div key={c._id} className="rounded-xl border border-slate-100 shadow-sm bg-white p-4">
                      <div className="text-xs font-semibold text-indigo-600 uppercase">{brandName}</div>
                      <div className="font-semibold text-slate-900 text-sm mt-1">{c.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{c.requirements.platforms.join(", ")}</div>
                      <div className="text-sm font-medium text-slate-800 mt-2">₹{(c.payment?.amount || c.budget).toLocaleString("en-IN")}</div>
                      <div className="flex gap-2 mt-3">
                        <Link href={`/creator/marketplace?campaign=${c._id}`} className="flex-1 text-center text-xs font-semibold border border-slate-200 rounded-lg py-2 hover:bg-slate-50">
                          View Details
                        </Link>
                        <Link href={`/creator/marketplace?campaign=${c._id}&apply=1`} className="flex-1 text-center text-xs font-semibold bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700">
                          Place Bid
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-100 shadow-sm bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                {(user?.id ? profile?.name : "")?.split(" ").map((p) => p[0]).join("") || "U"}
              </div>
              <div>
                <div className="flex items-center gap-1 font-semibold text-slate-900">
                  {profile?.name}
                  {creator?.verified && <BadgeCheck className="w-4 h-4 text-indigo-500" />}
                </div>
                <div className="text-xs text-slate-500">{creator?.niches?.join(", ") || "Creator"}</div>
                {profile?.profile?.location && (
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {profile.profile.location}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div>
                <div className="font-bold text-slate-900">{creator ? formatFollowers(creator.followers) : "—"}</div>
                <div className="text-[10px] text-slate-500">Followers</div>
              </div>
              <div>
                <div className="font-bold text-slate-900">{creator?.engagementRate ?? "—"}%</div>
                <div className="text-[10px] text-slate-500">Eng. Rate</div>
              </div>
              <div>
                <div className="font-bold text-slate-900">{creator ? formatFollowers(creator.avgReach) : "—"}</div>
                <div className="text-[10px] text-slate-500">Avg Reach</div>
              </div>
            </div>
            <Link href="/creator/settings">
              <button className="mt-4 w-full text-sm font-semibold border border-slate-200 rounded-lg py-2 hover:bg-slate-50">
                Edit Profile
              </button>
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-100 shadow-sm bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Earnings</h3>
              <Link href="/creator/payments" className="text-xs font-semibold text-indigo-600">View Details →</Link>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">₹{(wallet?.totalEarnings ?? 0).toLocaleString("en-IN")}</div>
            <div className="text-xs text-slate-500">Total Earnings</div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div>
                <div className="font-semibold text-slate-800">₹{(wallet?.availableBalance ?? 0).toLocaleString("en-IN")}</div>
                <div className="text-slate-500">Available</div>
              </div>
              <div>
                <div className="font-semibold text-slate-800">{applicationsCount}</div>
                <div className="text-slate-500">Applications</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 shadow-sm bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 text-sm">Payment Status</h3>
              <Link href="/creator/payments" className="text-xs font-semibold text-indigo-600">See All →</Link>
            </div>
            {payments.length === 0 ? (
              <p className="text-xs text-slate-500">No payments yet.</p>
            ) : (
              <div className="space-y-3">
                {payments.slice(0, 3).map((p) => (
                  <div key={p._id} className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-slate-800">{p.campaign.title}</div>
                      <div className="text-slate-400 capitalize">{p.status.replace("_", " ")}</div>
                    </div>
                    <div className="font-semibold text-slate-900">₹{p.netAmount.toLocaleString("en-IN")}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 shadow-sm bg-white p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h3 className="font-semibold text-slate-900 text-sm">Active Collaborations</h3>
            </div>
            <div className="text-2xl font-bold text-slate-900">{activeCollaborations}</div>
            <p className="text-xs text-slate-500 mt-1">Accepted applications in progress.</p>
          </div>
        </div>
      </div>
      </div>
    </CreatorLayout>
  );
}
