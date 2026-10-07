"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import CreatorLayout from "@/Components/Creater/CreatorLayout";

type Collaboration = {
  _id: string;
  campaign: { _id: string; title: string };
  amount: number;
  status: string;
  paymentStatus: string;
  submissions: { _id: string; contentUrl: string; status: string }[];
  createdAt: string;
};

export default function CreatorCollaborationsPage() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [urlDrafts, setUrlDrafts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const refetch = () => {
    setLoading(true);
    apiRequest<{ success: boolean; data: { collaborations: Collaboration[] } }>("/api/collaborations")
      .then((res) => setCollaborations(res.data.collaborations))
      .catch(() => setCollaborations([]))
      .finally(() => setLoading(false));
  };

  useEffect(refetch, []);

  const submit = async (id: string) => {
    const url = urlDrafts[id];
    if (!url) return;
    setSubmitting(id);
    try {
      await apiRequest(`/api/collaborations/${id}/submissions`, { method: "POST", body: JSON.stringify({ contentUrl: url }) });
      setUrlDrafts((d) => ({ ...d, [id]: "" }));
      refetch();
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <CreatorLayout title="My Collaborations" subtitle="Deliver content and track collaboration status">
      <div className="max-w-5xl mx-auto">
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />)}</div>
      ) : collaborations.length === 0 ? (
        <p className="text-sm text-slate-500">No collaborations yet. Once a brand accepts your bid, it will show up here.</p>
      ) : (
        <div className="space-y-4">
          {collaborations.map((c) => (
            <div key={c._id} className="rounded-xl border border-slate-100 bg-white p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-slate-900">{c.campaign.title}</div>
                  <div className="text-xs text-slate-500 capitalize mt-1">Status: {c.status.replace("_", " ")} · Payment: {c.paymentStatus.replace("_", " ")}</div>
                </div>
                <div className="font-semibold text-slate-900">₹{c.amount.toLocaleString("en-IN")}</div>
              </div>

              {c.submissions.length > 0 && (
                <div className="mt-3 space-y-1">
                  {c.submissions.map((s) => (
                    <div key={s._id} className="text-xs text-slate-600">
                      Submitted: <a href={s.contentUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline">{s.contentUrl}</a> — <span className="capitalize">{s.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {c.status !== "completed" && (
                <div className="mt-3 flex gap-2">
                  <input
                    placeholder="Paste content link (Instagram/YouTube URL)"
                    value={urlDrafts[c._id] || ""}
                    onChange={(e) => setUrlDrafts((d) => ({ ...d, [c._id]: e.target.value }))}
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm"
                  />
                  <button
                    onClick={() => submit(c._id)}
                    disabled={submitting === c._id}
                    className="px-4 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </CreatorLayout>
  );
}
