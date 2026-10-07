"use client";

import { Instagram, Youtube, Music2, Video as VideoIcon, Minus, Plus } from "lucide-react";
import type { CampaignDraft, ContentStyle, DeliverableCounts, UsageRights } from "./types";

const DELIVERABLE_OPTIONS: { key: keyof DeliverableCounts; label: string; desc: string; icon: typeof Instagram }[] = [
  { key: "instagramReel", label: "Instagram Reel", desc: "Short vertical video (15-60 sec)", icon: Instagram },
  { key: "instagramStory", label: "Instagram Story", desc: "Vertical story (15 sec)", icon: Instagram },
  { key: "instagramPost", label: "Instagram Post", desc: "Static image or carousel", icon: Instagram },
  { key: "youtubeVideo", label: "YouTube Video", desc: "Long form video", icon: Youtube },
  { key: "youtubeShort", label: "YouTube Short", desc: "Short vertical video (15-60 sec)", icon: Youtube },
  { key: "tiktokVideo", label: "TikTok Video", desc: "Short vertical video (15-60 sec)", icon: Music2 },
  { key: "ugcVideo", label: "UGC Video", desc: "Raw or edited product video", icon: VideoIcon },
];

const CONTENT_STYLES: { value: ContentStyle; label: string }[] = [
  { value: "organic", label: "Organic" },
  { value: "professional", label: "Professional" },
  { value: "raw_real", label: "Raw & Real" },
  { value: "creative", label: "Creative" },
  { value: "tutorial", label: "Tutorial / How-to" },
  { value: "testimonial", label: "Testimonial" },
];

const USAGE_RIGHTS: { value: UsageRights; label: string }[] = [
  { value: "organic", label: "Organic use only (creator's profile)" },
  { value: "paid_ads", label: "Paid ads usage (with creator's permission)" },
  { value: "whitelisting", label: "Whitelisting / Spark Ads" },
  { value: "full_rights", label: "Full usage rights (website, ads, etc.)" },
];

export default function ContentDeliverablesStep({ draft, setDraft }: { draft: CampaignDraft; setDraft: (d: CampaignDraft) => void }) {
  const cd = draft.contentDeliverables;
  const update = (patch: Partial<CampaignDraft["contentDeliverables"]>) => setDraft({ ...draft, contentDeliverables: { ...cd, ...patch } });
  const setCount = (key: keyof DeliverableCounts, value: number) => update({ deliverables: { ...cd.deliverables, [key]: Math.max(0, value) } });

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">Content Deliverables</h2>
      <p className="text-sm text-slate-500 mt-1">Select the type and number of content pieces you need from creators.</p>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-800">1. Select Content Platforms & Deliverables</label>
        <div className="mt-3 space-y-2">
          {DELIVERABLE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const count = cd.deliverables[opt.key];
            return (
              <div key={opt.key} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-slate-500" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">{opt.label}</div>
                    <div className="text-xs text-slate-500">{opt.desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setCount(opt.key, count - 1)} className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{count}</span>
                  <button type="button" onClick={() => setCount(opt.key, count + 1)} className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-800">2. Content Requirements</label>
        <div className="mt-3 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Video Duration (for Reels/Shorts)</label>
            <select value={cd.videoDuration} onChange={(e) => update({ videoDuration: e.target.value })} className="w-full h-10 mt-1 px-3 rounded-lg border border-slate-200 text-sm">
              <option value="15-60">15 - 60 seconds</option>
              <option value="60-180">60 - 180 seconds</option>
              <option value="180+">180+ seconds</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Content Style</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {CONTENT_STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => update({ contentStyle: s.value })}
                  className={`text-xs px-3 py-1.5 rounded-full border ${cd.contentStyle === s.value ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 text-slate-600"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-slate-600">Talking Points / Key Message</label>
          <textarea
            value={cd.talkingPoints}
            onChange={(e) => update({ talkingPoints: e.target.value.slice(0, 500) })}
            rows={3}
            placeholder="Highlight product features..."
            className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-slate-600">Brand Mentions & Hashtags</label>
          <textarea
            value={cd.brandMentions}
            onChange={(e) => update({ brandMentions: e.target.value.slice(0, 200) })}
            rows={2}
            placeholder="@yourbrand, #brandname, #SummerCollection"
            className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-slate-600">Additional Requirements</label>
          <div className="mt-2 space-y-2">
            {[
              { key: "requireFaceVisible" as const, label: "Face should be visible" },
              { key: "requireOriginalContent" as const, label: "Use original, authentic content" },
              { key: "requireSubtitles" as const, label: "Add subtitles (recommended)" },
              { key: "requireProductLink" as const, label: "Include product link in bio / description" },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={cd[opt.key]} onChange={(e) => update({ [opt.key]: e.target.checked } as Partial<CampaignDraft["contentDeliverables"]>)} className="rounded border-slate-300" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-800">3. Usage Rights (Optional)</label>
        <p className="text-xs text-slate-500 mb-2">Define how the brand can use the content.</p>
        <div className="space-y-2">
          {USAGE_RIGHTS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" checked={cd.usageRights === opt.value} onChange={() => update({ usageRights: opt.value })} className="text-indigo-600" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
