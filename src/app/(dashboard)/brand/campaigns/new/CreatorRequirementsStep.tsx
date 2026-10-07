"use client";

import { Instagram, Youtube, Music2, Video as VideoIcon } from "lucide-react";
import type { CampaignDraft, CreatorSize, LocationScope } from "./types";
import { CATEGORY_OPTIONS } from "./types";

const PLATFORMS = [
  { value: "instagram", label: "Instagram", desc: "Reels, Stories, Posts", icon: Instagram },
  { value: "youtube", label: "YouTube", desc: "Videos, Shorts", icon: Youtube },
  { value: "tiktok", label: "TikTok", desc: "Videos, Shorts", icon: Music2 },
  { value: "ugc", label: "UGC Content", desc: "Raw or edited content", icon: VideoIcon },
];

const SIZES: { value: CreatorSize; label: string; range: string; note: string }[] = [
  { value: "nano", label: "Nano", range: "1K – 10K followers", note: "High engagement, niche audience" },
  { value: "micro", label: "Micro", range: "10K – 100K followers", note: "Authentic content, better engagement" },
  { value: "mid", label: "Mid", range: "100K – 500K followers", note: "Larger reach, established creators" },
  { value: "macro", label: "Macro", range: "500K – 1M followers", note: "High reach, celebrity creators" },
  { value: "mega", label: "Mega", range: "1M+ followers", note: "Massive reach, top celebrities" },
];

export default function CreatorRequirementsStep({ draft, setDraft }: { draft: CampaignDraft; setDraft: (d: CampaignDraft) => void }) {
  const cr = draft.creatorRequirements;
  const update = (patch: Partial<CampaignDraft["creatorRequirements"]>) => setDraft({ ...draft, creatorRequirements: { ...cr, ...patch } });
  const togglePlatform = (p: string) => update({ platforms: cr.platforms.includes(p) ? cr.platforms.filter((x) => x !== p) : [...cr.platforms, p] });
  const toggleCategory = (c: string) => update({ categories: cr.categories.includes(c) ? cr.categories.filter((x) => x !== c) : [...cr.categories, c] });

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">Creator Requirements</h2>
      <p className="text-sm text-slate-500 mt-1">Set the ideal creator criteria for your campaign.</p>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-800">1. Platforms</label>
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          {PLATFORMS.map((p) => {
            const Icon = p.icon;
            const active = cr.platforms.includes(p.value);
            return (
              <button key={p.value} type="button" onClick={() => togglePlatform(p.value)} className={`flex items-center gap-3 rounded-xl border p-3 text-left ${active ? "border-indigo-400 bg-indigo-50" : "border-slate-200"}`}>
                <Icon className={`w-5 h-5 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                <div>
                  <div className="text-sm font-medium text-slate-900">{p.label}</div>
                  <div className="text-xs text-slate-500">{p.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-800">2. Category / Niche</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCategory(c)}
              className={`text-xs px-3 py-1.5 rounded-full border ${cr.categories.includes(c) ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 text-slate-600"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-800">3. Location</label>
        <div className="space-y-2 mt-2">
          {([
            ["any", "Any Location"],
            ["india", "India"],
            ["specific_cities", "Specific Cities"],
            ["international", "International"],
          ] as [LocationScope, string][]).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" checked={cr.locationScope === value} onChange={() => update({ locationScope: value })} />
              {label}
            </label>
          ))}
          {cr.locationScope === "specific_cities" && (
            <input
              value={cr.specificCities.join(", ")}
              onChange={(e) => update({ specificCities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="Delhi, Mumbai, Bangalore"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm mt-1"
            />
          )}
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-800">4. Creator Size (Followers)</label>
        <div className="space-y-2 mt-2">
          {SIZES.map((s) => (
            <label key={s.value} className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer ${cr.creatorSize === s.value ? "border-indigo-400 bg-indigo-50" : "border-slate-200"}`}>
              <div className="flex items-center gap-2">
                <input type="radio" checked={cr.creatorSize === s.value} onChange={() => update({ creatorSize: s.value })} />
                <div>
                  <div className="text-sm font-medium text-slate-900">{s.label}</div>
                  <div className="text-xs text-slate-500">{s.range}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500">{s.note}</div>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-800">5. Minimum Engagement Rate</label>
        <select value={cr.minEngagementRate} onChange={(e) => update({ minEngagementRate: Number(e.target.value) })} className="w-full h-10 mt-1 px-3 rounded-lg border border-slate-200 text-sm">
          {[0, 1, 2, 3, 5, 8].map((v) => (
            <option key={v} value={v}>{v}% or above</option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-800">6. Target Audience (Optional)</label>
        <div className="grid sm:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="text-xs font-medium text-slate-600">Age Range</label>
            <div className="flex items-center gap-2 mt-1">
              <input type="number" value={cr.audienceAgeMin} onChange={(e) => update({ audienceAgeMin: Number(e.target.value) })} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" />
              <span className="text-slate-400">–</span>
              <input type="number" value={cr.audienceAgeMax} onChange={(e) => update({ audienceAgeMax: Number(e.target.value) })} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Gender</label>
            <div className="flex gap-4 mt-2.5 text-sm text-slate-700">
              {(["all", "male", "female"] as const).map((g) => (
                <label key={g} className="flex items-center gap-1.5 capitalize">
                  <input type="radio" checked={cr.audienceGender === g} onChange={() => update({ audienceGender: g })} />
                  {g}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <label className="text-xs font-medium text-slate-600">Interests (Optional)</label>
          <input
            value={cr.audienceInterests.join(", ")}
            onChange={(e) => update({ audienceInterests: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            placeholder="Skincare, Fashion, Lifestyle"
            className="w-full h-10 mt-1 px-3 rounded-lg border border-slate-200 text-sm"
          />
        </div>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={cr.requirePortfolio} onChange={(e) => update({ requirePortfolio: e.target.checked })} className="rounded border-slate-300" />
            Portfolio required
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={cr.requireCustomProposal} onChange={(e) => update({ requireCustomProposal: e.target.checked })} className="rounded border-slate-300" />
            Custom proposal required
          </label>
        </div>
      </div>
    </div>
  );
}
