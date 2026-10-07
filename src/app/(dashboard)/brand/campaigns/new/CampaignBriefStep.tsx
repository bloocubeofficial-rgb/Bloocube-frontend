"use client";

import { Megaphone, Video, Rocket, BarChart3, ShoppingBag } from "lucide-react";
import type { CampaignDraft, CampaignType } from "./types";

const TYPES: { value: CampaignType; label: string; desc: string; icon: typeof Megaphone }[] = [
  { value: "influencer_collab", label: "Influencer Collaboration", desc: "Work with creators to promote your brand", icon: Megaphone },
  { value: "ugc_content", label: "UGC Content", desc: "Get high-quality content for your brand", icon: Video },
  { value: "product_launch", label: "Product Launch", desc: "Create buzz for a new product", icon: Rocket },
  { value: "brand_awareness", label: "Brand Awareness", desc: "Increase brand reach and visibility", icon: BarChart3 },
  { value: "sales_conversion", label: "Sales / Conversion", desc: "Drive traffic and sales through creators", icon: ShoppingBag },
];

export default function CampaignBriefStep({ draft, setDraft }: { draft: CampaignDraft; setDraft: (d: CampaignDraft) => void }) {
  const b = draft.brief;
  const update = (patch: Partial<CampaignDraft["brief"]>) => setDraft({ ...draft, brief: { ...b, ...patch } });

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">Campaign Brief</h2>
      <p className="text-sm text-slate-500 mt-1">Tell creators about your campaign and what you want to achieve.</p>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-800">1. What are you looking for?</label>
        <p className="text-xs text-slate-500 mb-3">Choose the campaign type that best matches your goal.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {TYPES.map((t) => {
            const Icon = t.icon;
            const active = b.campaignType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => update({ campaignType: t.value })}
                className={`text-left rounded-xl border p-4 transition-colors ${active ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <Icon className={`w-5 h-5 mb-2 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                <div className="font-semibold text-sm text-slate-900">{t.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-800">2. Campaign Name</label>
        <p className="text-xs text-slate-500 mb-2">Give your campaign a clear and specific name.</p>
        <input
          value={b.campaignName}
          onChange={(e) => update({ campaignName: e.target.value.slice(0, 100) })}
          placeholder="Summer Collection 2026"
          className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <div className="text-right text-xs text-slate-400 mt-1">{b.campaignName.length}/100</div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-slate-800">3. Campaign Objective</label>
        <p className="text-xs text-slate-500 mb-2">Tell creators about your campaign, your brand and what you want to achieve.</p>
        <textarea
          value={b.description}
          onChange={(e) => update({ description: e.target.value.slice(0, 500), objective: b.objective || e.target.value.slice(0, 120) })}
          rows={4}
          placeholder="We are launching our Summer Collection 2026..."
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <div className="text-right text-xs text-slate-400 mt-1">{b.description.length}/500</div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-slate-800">4. Brand Information (Optional)</label>
        <p className="text-xs text-slate-500 mb-2">Add any relevant links or information to help creators understand your brand better.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            value={b.website}
            onChange={(e) => update({ website: e.target.value })}
            placeholder="https://yourbrand.com"
            className="h-10 px-3 rounded-lg border border-slate-200 text-sm"
          />
          <input
            value={b.instagram}
            onChange={(e) => update({ instagram: e.target.value })}
            placeholder="@yourbrand"
            className="h-10 px-3 rounded-lg border border-slate-200 text-sm"
          />
          <input
            value={b.youtube}
            onChange={(e) => update({ youtube: e.target.value })}
            placeholder="youtube.com/@yourbrand"
            className="h-10 px-3 rounded-lg border border-slate-200 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
