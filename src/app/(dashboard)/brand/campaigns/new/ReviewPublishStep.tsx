"use client";

import type { CampaignDraft, DeliverableCounts } from "./types";

const DELIVERABLE_LABELS: Record<keyof DeliverableCounts, string> = {
  instagramReel: "Instagram Reel",
  instagramStory: "Instagram Story",
  instagramPost: "Instagram Post",
  youtubeVideo: "YouTube Video",
  youtubeShort: "YouTube Short",
  tiktokVideo: "TikTok Video",
  ugcVideo: "UGC Video",
};

export default function ReviewPublishStep({ draft }: { draft: CampaignDraft }) {
  const { brief, contentDeliverables, creatorRequirements, budgetBidding } = draft;
  const activeDeliverables = (Object.keys(contentDeliverables.deliverables) as (keyof DeliverableCounts)[]).filter((k) => contentDeliverables.deliverables[k] > 0);

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">Review & Publish</h2>
      <p className="text-sm text-slate-500 mt-1">Review your campaign details before publishing. You can go back and make changes if needed.</p>

      <div className="mt-6 grid sm:grid-cols-2 gap-5">
        <div className="rounded-xl border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-3">1. Campaign Overview</h3>
          <div className="text-sm font-medium text-slate-900">{brief.campaignName || "Untitled Campaign"}</div>
          <div className="text-xs text-indigo-600 mt-1 capitalize">{brief.campaignType.replace(/_/g, " ")}</div>
          <p className="text-xs text-slate-500 mt-2 line-clamp-3">{brief.description}</p>
        </div>

        <div className="rounded-xl border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-3">2. Content Deliverables</h3>
          {activeDeliverables.length === 0 ? (
            <p className="text-xs text-slate-500">No deliverables selected yet.</p>
          ) : (
            <ul className="text-xs text-slate-600 space-y-1">
              {activeDeliverables.map((k) => (
                <li key={k}>{contentDeliverables.deliverables[k]} × {DELIVERABLE_LABELS[k]}</li>
              ))}
            </ul>
          )}
          <div className="text-xs text-slate-500 mt-2 capitalize">Style: {contentDeliverables.contentStyle.replace(/_/g, " ")}</div>
        </div>

        <div className="rounded-xl border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-3">3. Creator Requirements</h3>
          <dl className="text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between"><dt className="text-slate-400">Platforms</dt><dd>{creatorRequirements.platforms.join(", ") || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Category / Niche</dt><dd>{creatorRequirements.categories.join(", ") || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Location</dt><dd className="capitalize">{creatorRequirements.locationScope.replace(/_/g, " ")}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Creator Size</dt><dd className="capitalize">{creatorRequirements.creatorSize}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Min. Engagement</dt><dd>{creatorRequirements.minEngagementRate}%</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Target Audience</dt><dd>Age {creatorRequirements.audienceAgeMin}-{creatorRequirements.audienceAgeMax} · {creatorRequirements.audienceGender}</dd></div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-3">4. Budget & Bidding</h3>
          <dl className="text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between"><dt className="text-slate-400">Bidding Type</dt><dd className="capitalize">{budgetBidding.biddingType === "OPEN" ? "Open Bidding" : "Fixed Budget"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Budget Range</dt><dd>₹{budgetBidding.budgetMin || "0"} – ₹{budgetBidding.budgetMax || "0"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">No. of Creators</dt><dd>{budgetBidding.creatorsRequired}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Application Deadline</dt><dd>{budgetBidding.applicationDeadline || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Start Date</dt><dd>{budgetBidding.startDate || "Not set"}</dd></div>
          </dl>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
        <h3 className="font-semibold text-slate-900 text-sm mb-2">Pre-publish Checklist</h3>
        <ul className="text-xs text-slate-600 space-y-1.5">
          <li className={brief.campaignName && brief.description ? "text-emerald-700" : ""}>✓ Campaign goals are clear</li>
          <li className={activeDeliverables.length > 0 ? "text-emerald-700" : ""}>✓ Deliverables and requirements are detailed</li>
          <li className={creatorRequirements.platforms.length > 0 ? "text-emerald-700" : ""}>✓ Target creators and audience are defined</li>
          <li className={budgetBidding.applicationDeadline ? "text-emerald-700" : ""}>✓ Budget and timeline are realistic</li>
        </ul>
      </div>
    </div>
  );
}
