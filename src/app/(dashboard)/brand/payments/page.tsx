"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";

type Payment = { _id: string; amount: number; netAmount: number; status: string; campaign: { title: string }; creator: string; createdAt: string };
type Collaboration = {
  _id: string;
  campaign: { title: string };
  creatorName: string;
  amount: number;
  status: string;
  paymentStatus: string;
  submissions: { _id: string; contentUrl: string; status: string }[];
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  initiated: "Initiated",
  in_escrow: "In Escrow",
  approved: "Approved",
  released: "Released",
  refunded: "Refunded",
  disputed: "Disputed",
};

export default function BrandPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState<string | null>(null);

  const refetch = () => {
    setLoading(true);
    Promise.all([
      apiRequest<{ success: boolean; data: { payments: Payment[] } }>("/api/payments"),
      apiRequest<{ success: boolean; data: { collaborations: Collaboration[] } }>("/api/collaborations"),
    ])
      .then(([p, c]) => {
        setPayments(p.data.payments);
        setCollaborations(c.data.collaborations);
      })
      .catch(() => {
        setPayments([]);
        setCollaborations([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(refetch, []);

  const release = async (collaborationId: string) => {
    setReleasing(collaborationId);
    try {
      await apiRequest(`/api/payments/${collaborationId}/release`, { method: "POST" });
      refetch();
    } finally {
      setReleasing(null);
    }
  };

  const totalSpent = payments.filter((p) => p.status === "released").reduce((s, p) => s + p.amount, 0);
  const inEscrow = payments.filter((p) => p.status === "in_escrow").reduce((s, p) => s + p.amount, 0);
  const awaitingApproval = collaborations.filter((c) => c.paymentStatus === "in_escrow" && c.submissions.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Payments</h1>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-100 bg-white p-5">
          <div className="text-xs text-slate-500">Total Spent (Released)</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">₹{totalSpent.toLocaleString("en-IN")}</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-5">
          <div className="text-xs text-slate-500">Currently In Escrow</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">₹{inEscrow.toLocaleString("en-IN")}</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-5">
        <h3 className="font-semibold text-slate-900 mb-3">Awaiting Your Approval</h3>
        {loading ? (
          <p className="text-xs text-slate-500">Loading...</p>
        ) : awaitingApproval.length === 0 ? (
          <p className="text-xs text-slate-500">No content submissions awaiting approval right now.</p>
        ) : (
          <div className="space-y-3">
            {awaitingApproval.map((c) => (
              <div key={c._id} className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div>
                  <div className="text-sm font-medium text-slate-800">{c.campaign.title} · {c.creatorName}</div>
                  {c.submissions.map((s) => (
                    <a key={s._id} href={s.contentUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 underline block">
                      {s.contentUrl}
                    </a>
                  ))}
                </div>
                <button
                  onClick={() => release(c._id)}
                  disabled={releasing === c._id}
                  className="px-4 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap"
                >
                  {releasing === c._id ? "Releasing..." : `Approve & Pay ₹${c.amount.toLocaleString("en-IN")}`}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-5">
        <h3 className="font-semibold text-slate-900 mb-3">All Payments</h3>
        {payments.length === 0 ? (
          <p className="text-xs text-slate-500">No payments yet.</p>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p._id} className="flex justify-between items-center border-b border-slate-50 pb-3">
                <div>
                  <div className="text-sm font-medium text-slate-800">{p.campaign.title}</div>
                  <div className="text-xs text-slate-400">{p.creator} · {STATUS_LABEL[p.status] || p.status}</div>
                </div>
                <div className="font-semibold text-slate-900 text-sm">₹{p.amount.toLocaleString("en-IN")}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
