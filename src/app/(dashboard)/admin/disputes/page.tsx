"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import AdminLayout from "@/Components/Admin/AdminLayout";

type Dispute = { id: string; reference: string; raisedBy: string; reason: string; status: string; resolution: string | null; createdAt: string };

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolutionDrafts, setResolutionDrafts] = useState<Record<string, string>>({});

  const refetch = () => {
    setLoading(true);
    apiRequest<{ success: boolean; data: { disputes: Dispute[] } }>("/api/admin/disputes")
      .then((res) => setDisputes(res.data.disputes))
      .catch(() => setDisputes([]))
      .finally(() => setLoading(false));
  };

  useEffect(refetch, []);

  const resolve = async (id: string) => {
    await apiRequest(`/api/admin/disputes/${id}`, { method: "PUT", body: JSON.stringify({ status: "resolved", resolution: resolutionDrafts[id] || "Resolved by admin" }) });
    refetch();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Disputes</h1>
      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : disputes.length === 0 ? (
        <p className="text-sm text-slate-500">No disputes raised yet.</p>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Ref: {d.reference}</div>
                  <div className="text-xs text-slate-500">Raised by {d.raisedBy} · {new Date(d.createdAt).toLocaleDateString()}</div>
                  <p className="text-sm text-slate-700 mt-2">{d.reason}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs shrink-0 ${d.status === "open" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{d.status}</span>
              </div>
              {d.status === "open" ? (
                <div className="mt-3 flex gap-2">
                  <input
                    placeholder="Resolution note"
                    value={resolutionDrafts[d.id] || ""}
                    onChange={(e) => setResolutionDrafts((s) => ({ ...s, [d.id]: e.target.value }))}
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm"
                  />
                  <button onClick={() => resolve(d.id)} className="px-4 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold">
                    Resolve
                  </button>
                </div>
              ) : (
                d.resolution && <p className="text-xs text-slate-500 mt-2">Resolution: {d.resolution}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
