"use client";

import { Gavel, Minus, Plus } from "lucide-react";
import type { CampaignDraft } from "./types";

export default function BudgetBiddingStep({ draft, setDraft, error }: { draft: CampaignDraft; setDraft: (d: CampaignDraft) => void; error?: string | null }) {
  const bb = draft.budgetBidding;
  const update = (patch: Partial<CampaignDraft["budgetBidding"]>) => setDraft({ ...draft, budgetBidding: { ...bb, ...patch } });
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">Budget & Bidding</h2>
      <p className="text-sm text-slate-500 mt-1">Set your campaign budget expectations and how creators can participate.</p>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-800">1. Bidding Type</label>
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          <button
            type="button"
            onClick={() => update({ biddingType: "OPEN" })}
            className={`text-left rounded-xl border p-4 ${bb.biddingType === "OPEN" ? "border-indigo-400 bg-indigo-50" : "border-slate-200"}`}
          >
            <Gavel className="w-5 h-5 text-indigo-500 mb-2" />
            <div className="font-semibold text-sm text-slate-900">Open Bidding</div>
            <div className="text-xs text-slate-500 mt-1">Creators apply and submit their own proposal and price.</div>
          </button>
          <button
            type="button"
            onClick={() => update({ biddingType: "FIXED" })}
            className={`text-left rounded-xl border p-4 ${bb.biddingType === "FIXED" ? "border-indigo-400 bg-indigo-50" : "border-slate-200"}`}
          >
            <Gavel className="w-5 h-5 text-slate-400 mb-2" />
            <div className="font-semibold text-sm text-slate-900">Fixed Budget</div>
            <div className="text-xs text-slate-500 mt-1">You set a fixed price for the campaign.</div>
          </button>
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-800">2. Expected Budget Range (Optional)</label>
        <p className="text-xs text-slate-500 mb-2">Set a suggested budget range to give creators an idea of your expected pricing.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Minimum Budget (per creator)</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
              <input type="number" value={bb.budgetMin} onChange={(e) => update({ budgetMin: e.target.value })} placeholder="10,000" className="w-full h-10 pl-7 pr-3 rounded-lg border border-slate-200 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Maximum Budget (per creator)</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
              <input type="number" value={bb.budgetMax} onChange={(e) => update({ budgetMax: e.target.value })} placeholder="20,000" className="w-full h-10 pl-7 pr-3 rounded-lg border border-slate-200 text-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-semibold text-slate-800">3. Number of Creators Required</label>
          <div className="flex items-center gap-3 mt-2">
            <button type="button" onClick={() => update({ creatorsRequired: Math.max(1, bb.creatorsRequired - 1) })} className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-semibold">{bb.creatorsRequired}</span>
            <button type="button" onClick={() => update({ creatorsRequired: bb.creatorsRequired + 1 })} className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-800">4. Application Deadline</label>
          <input
            type="date"
            min={today}
            value={bb.applicationDeadline}
            onChange={(e) => update({ applicationDeadline: e.target.value })}
            className="w-full h-10 mt-2 px-3 rounded-lg border border-slate-200 text-sm"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-800">5. Start Date (Tentative)</label>
        <input
          type="date"
          min={bb.applicationDeadline || today}
          value={bb.startDate}
          onChange={(e) => update({ startDate: e.target.value })}
          className="w-full sm:w-64 h-10 mt-2 px-3 rounded-lg border border-slate-200 text-sm"
        />
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={bb.allowInternational} onChange={(e) => update({ allowInternational: e.target.checked })} className="rounded border-slate-300" />
          Allow international creators to apply
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
