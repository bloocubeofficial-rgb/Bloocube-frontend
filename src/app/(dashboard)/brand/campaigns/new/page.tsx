"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { emptyDraft, type CampaignDraft } from "./types";
import CampaignBriefStep from "./CampaignBriefStep";
import ContentDeliverablesStep from "./ContentDeliverablesStep";
import CreatorRequirementsStep from "./CreatorRequirementsStep";
import BudgetBiddingStep from "./BudgetBiddingStep";
import ReviewPublishStep from "./ReviewPublishStep";

const STEPS = ["Campaign Brief", "Content Deliverables", "Creator Requirements", "Budget & Bidding", "Review & Publish"];

function validateStep(step: number, draft: CampaignDraft): string | null {
  if (step === 0) {
    if (draft.brief.campaignName.trim().length < 5) return "Campaign name must be at least 5 characters.";
    if (draft.brief.description.trim().length < 10) return "Campaign objective must be at least 10 characters.";
  }
  if (step === 2) {
    if (draft.creatorRequirements.platforms.length === 0) return "Select at least one platform.";
  }
  if (step === 3) {
    const { budgetMin, budgetMax, applicationDeadline } = draft.budgetBidding;
    if (budgetMin && Number(budgetMin) < 0) return "Minimum budget cannot be negative.";
    if (budgetMax && Number(budgetMax) < 0) return "Maximum budget cannot be negative.";
    if (budgetMin && budgetMax && Number(budgetMin) > Number(budgetMax)) return "Minimum budget cannot exceed maximum budget.";
    if (!applicationDeadline) return "Set an application deadline.";
    if (new Date(applicationDeadline).getTime() <= Date.now()) return "Application deadline must be in the future.";
  }
  return null;
}

function buildPayload(draft: CampaignDraft, publish: boolean) {
  return {
    brief: { campaignType: draft.brief.campaignType, campaignName: draft.brief.campaignName, objective: draft.brief.objective || draft.brief.campaignName, description: draft.brief.description },
    contentDeliverables: draft.contentDeliverables,
    creatorRequirements: draft.creatorRequirements,
    budgetBidding: {
      ...draft.budgetBidding,
      budgetMin: draft.budgetBidding.budgetMin ? Number(draft.budgetBidding.budgetMin) : undefined,
      budgetMax: draft.budgetBidding.budgetMax ? Number(draft.budgetBidding.budgetMax) : undefined,
    },
    isPublic: publish,
  };
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<CampaignDraft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const goNext = () => {
    const err = validateStep(step, draft);
    if (err) return setError(err);
    setError(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const submit = async (publish: boolean) => {
    const err = validateStep(3, draft);
    if (err) return setError(err);
    setSubmitting(true);
    setError(null);
    try {
      await apiRequest("/api/campaigns", { method: "POST", body: JSON.stringify(buildPayload(draft, publish)) });
      router.push("/brand/campaigns");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save campaign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Create a Campaign</h1>

      <div className="flex items-center gap-2 mt-6 mb-8 overflow-x-auto">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                i < step ? "bg-indigo-600 text-white" : i === step ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs font-medium ${i === step ? "text-indigo-600" : "text-slate-400"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-slate-200" />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-100 shadow-sm bg-white p-6 sm:p-8">
        {step === 0 && <CampaignBriefStep draft={draft} setDraft={setDraft} />}
        {step === 1 && <ContentDeliverablesStep draft={draft} setDraft={setDraft} />}
        {step === 2 && <CreatorRequirementsStep draft={draft} setDraft={setDraft} />}
        {step === 3 && <BudgetBiddingStep draft={draft} setDraft={setDraft} error={error} />}
        {step === 4 && <ReviewPublishStep draft={draft} />}

        {error && step !== 3 && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 disabled:opacity-40"
          >
            Back
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => submit(false)}
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700"
            >
              Save as Draft
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={goNext} className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => submit(true)}
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {submitting ? "Publishing..." : "Publish Campaign →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
