"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, BadgeCheck } from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { Button } from "@/Components/ui/Button";

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

const CATEGORIES = [
  { label: "Fashion", count: "12K+" },
  { label: "Beauty", count: "18K+" },
  { label: "Lifestyle", count: "25K+" },
  { label: "Tech", count: "8K+" },
  { label: "Fitness", count: "6K+" },
  { label: "Food", count: "10K+" },
  { label: "Travel", count: "9K+" },
];

function formatFollowers(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export default function ExploreCreators() {
  const [creators, setCreators] = useState<CreatorCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest<{ success: boolean; data: { creators: CreatorCard[] } }>(`/api/profile/creators?limit=6`);
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
  }, []);

  return (
    <section id="find-creators" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Explore creators</h2>
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creators by niche, location, or keyword..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <span key={c.label} className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
              {c.label} <span className="text-slate-400">· {c.count}</span>
            </span>
          ))}
          <Link href="/find-creators" className="px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-600">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : creators.length === 0 ? (
          <p className="text-sm text-slate-500">No creators found yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {creators
              .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.niches.some((n) => n.toLowerCase().includes(search.toLowerCase())))
              .map((c) => (
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
                    <div className="mt-2 text-xs text-slate-700 font-medium">{formatFollowers(c.followers)} followers</div>
                    <div className="text-xs text-emerald-600 font-medium">{c.engagementRate}% engagement</div>
                    <div className="text-xs text-slate-500 mt-1">From ₹{c.startingPrice.toLocaleString("en-IN")}</div>
                    <Button size="sm" className="mt-3 w-full bg-slate-900 hover:bg-slate-800 rounded-lg text-xs">
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
