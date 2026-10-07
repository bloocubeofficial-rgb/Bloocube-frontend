"use client";

import Link from "next/link";
import { Instagram, Youtube, Music2 } from "lucide-react";
import { Button } from "@/Components/ui/Button";

const SHOWCASE = [
  { name: "Ananya Kapoor", niche: "Beauty · Delhi", followers: "128K", engagement: "4.8%", icon: Instagram, color: "from-pink-400 to-rose-500" },
  { name: "Rohan Sharma", niche: "Tech · Mumbai", followers: "82K", engagement: "6.2%", icon: Youtube, color: "from-red-400 to-orange-500" },
  { name: "Mehak Patel", niche: "Lifestyle · Bengaluru", followers: "210K", engagement: "5.1%", icon: Music2, color: "from-indigo-400 to-purple-500" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--brand-lavender)] to-white">
      <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-indigo-200/40 rounded-full blur-3xl" />
      <div className="absolute top-40 -left-24 w-[380px] h-[380px] bg-blue-200/40 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block text-xs font-semibold tracking-wide text-indigo-600 uppercase mb-4">
            Influencer Marketing Marketplace
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
            Find the right creators.{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              Build campaigns that matter.
            </span>
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-xl">
            Discover creators, receive bids, manage collaborations and secure payments — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/find-creators">
              <Button className="h-12 px-7 bg-slate-900 hover:bg-slate-800 rounded-xl text-white font-semibold">
                Find Creators →
              </Button>
            </Link>
            <Link href="/signup?role=brand">
              <Button variant="outline" className="h-12 px-7 rounded-xl font-semibold border-slate-300">
                Create Campaign
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg">
            {[
              { label: "Verified Creators", sub: "Real profiles, real reach" },
              { label: "Transparent Bidding", sub: "Get the best rates" },
              { label: "Secure Escrow", sub: "Safe & reliable payments" },
              { label: "End-to-End", sub: "Brief to final report" },
            ].map((item) => (
              <div key={item.label} className="text-xs">
                <div className="font-semibold text-slate-800">{item.label}</div>
                <div className="text-slate-500">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SHOWCASE.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.name} className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-4 sm:translate-y-0 first:sm:-translate-y-4 last:sm:translate-y-4">
                  <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-2xl font-bold mb-3`}>
                    {c.name.split(" ").map((p) => p[0]).join("")}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                    {c.name}
                    <Icon className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div className="text-xs text-slate-500">{c.niche}</div>
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">{c.followers} followers</span>
                    <span className="text-emerald-600 font-medium">{c.engagement}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute -bottom-6 -left-4 bg-white rounded-xl shadow-xl border border-slate-100 px-4 py-3">
            <div className="text-xl font-bold text-slate-900">300M+</div>
            <div className="text-xs text-slate-500">Content Reach Generated</div>
          </div>
        </div>
      </div>
    </section>
  );
}
