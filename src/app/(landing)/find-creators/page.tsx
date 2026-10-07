"use client";

import { useEffect, useState } from "react";
import { Search, BadgeCheck } from "lucide-react";
import { apiRequest } from "@/lib/apiClient";

type CreatorCard = {
  _id: string;
  name: string;
  verified: boolean;
  niches: string[];
  location: string | null;
  followers: number;
  engagementRate: number;
  startingPrice: number;
  platforms: string[];
};

const NICHES = ["All", "Fashion", "Beauty", "Lifestyle", "Tech", "Fitness", "Food", "Travel"];

export default function FindCreatorsPage() {
  const [creators, setCreators] = useState<CreatorCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("All");
  const [minFollowers, setMinFollowers] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const qs = new URLSearchParams();
        if (niche !== "All") qs.set("niche", niche);
        if (minFollowers) qs.set("minFollowers", minFollowers);
        qs.set("limit", "50");
        const res = await apiRequest<{ success: boolean; data: { creators: CreatorCard[] } }>(`/api/profile/creators?${qs.toString()}`);
        if (!cancelled) setCreators(res.data.creators);
      } catch {
        if (!cancelled) setCreators([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [niche, minFollowers]);

  const filtered = creators.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.niches.some((n) => n.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Find Creators</h1>
      <p className="text-slate-600 mt-2">Browse verified creators by niche, platform, followers and location.</p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or niche..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <select value={niche} onChange={(e) => setNiche(e.target.value)} className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm">
          {NICHES.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <select value={minFollowers} onChange={(e) => setMinFollowers(e.target.value)} className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm">
          <option value="">Any followers</option>
          <option value="10000">10K+</option>
          <option value="50000">50K+</option>
          <option value="100000">100K+</option>
        </select>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-sm text-slate-500">No creators match your filters.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filtered.map((c) => (
            <div key={c._id} className="rounded-xl border border-slate-100 shadow-sm bg-white overflow-hidden flex flex-col">
              <div className="aspect-square bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold">
                {c.name.split(" ").map((p) => p[0]).join("")}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                  {c.name}
                  {c.verified && <BadgeCheck className="w-3.5 h-3.5 text-indigo-500" />}
                </div>
                <div className="text-xs text-slate-500">{c.niches[0] || "Creator"} · {c.location || "India"}</div>
                <div className="mt-2 text-xs text-slate-700 font-medium">{(c.followers / 1000).toFixed(0)}K followers</div>
                <div className="text-xs text-emerald-600 font-medium">{c.engagementRate}% engagement</div>
                <div className="text-xs text-slate-500 mt-1">From ₹{c.startingPrice.toLocaleString("en-IN")}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
