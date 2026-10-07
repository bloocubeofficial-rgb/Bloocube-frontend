"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { apiRequest } from "@/lib/apiClient";
import CreatorLayout from "@/Components/Creater/CreatorLayout";

type Payment = { _id: string; amount: number; netAmount: number; platformFee: number; status: string; campaign: { title: string }; createdAt: string };

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  initiated: "Initiated",
  in_escrow: "In Escrow",
  approved: "Approved",
  released: "Released",
  refunded: "Refunded",
  disputed: "Disputed",
};

export default function CreatorPaymentsPage() {
  const { wallet, transactions, withdrawals, loading, withdraw } = useWallet();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"upi" | "bank">("upi");
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiRequest<{ success: boolean; data: { payments: Payment[] } }>("/api/payments")
      .then((res) => setPayments(res.data.payments))
      .catch(() => setPayments([]));
  }, []);

  const onWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amt = Number(amount);
    if (!amt || amt <= 0) return setError("Enter a valid amount");
    if (method === "upi" && !upiId) return setError("Enter your UPI ID");
    setSubmitting(true);
    try {
      await withdraw(amt, method, method === "upi" ? { upiId } : {});
      setAmount("");
      setUpiId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CreatorLayout title="Payments & Wallet" subtitle="Track escrow status and manage withdrawals">
      <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-100 bg-white p-5">
          <div className="text-xs text-slate-500">Available Balance</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">₹{(wallet?.availableBalance ?? 0).toLocaleString("en-IN")}</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-5">
          <div className="text-xs text-slate-500">Pending Balance</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">₹{(wallet?.pendingBalance ?? 0).toLocaleString("en-IN")}</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-5">
          <div className="text-xs text-slate-500">Total Earnings</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">₹{(wallet?.totalEarnings ?? 0).toLocaleString("en-IN")}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-100 bg-white p-5">
          <h3 className="font-semibold text-slate-900 mb-3">Withdraw Funds</h3>
          <form onSubmit={onWithdraw} className="space-y-3">
            <input
              type="number"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
            />
            <select value={method} onChange={(e) => setMethod(e.target.value as "upi" | "bank")} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm">
              <option value="upi">UPI</option>
              <option value="bank">Bank Transfer</option>
            </select>
            {method === "upi" && (
              <input
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
              />
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button disabled={submitting} className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold">
              {submitting ? "Submitting..." : "Request Withdrawal"}
            </button>
          </form>

          <h4 className="font-semibold text-slate-900 text-sm mt-6 mb-2">Withdrawal History</h4>
          {withdrawals.length === 0 ? (
            <p className="text-xs text-slate-500">No withdrawals yet.</p>
          ) : (
            <div className="space-y-2">
              {withdrawals.map((w) => (
                <div key={w._id} className="flex justify-between text-xs border-b border-slate-50 pb-2">
                  <span className="capitalize text-slate-600">{w.method} · {w.status}</span>
                  <span className="font-semibold text-slate-900">₹{w.amount.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5">
          <h3 className="font-semibold text-slate-900 mb-3">Payment Status</h3>
          {payments.length === 0 ? (
            <p className="text-xs text-slate-500">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p._id} className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{p.campaign.title}</div>
                    <div className="text-xs text-slate-400">{STATUS_LABEL[p.status] || p.status}</div>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">₹{p.netAmount.toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>
          )}

          <h4 className="font-semibold text-slate-900 text-sm mt-6 mb-2">Recent Transactions</h4>
          {transactions.length === 0 ? (
            <p className="text-xs text-slate-500">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((t) => (
                <div key={t._id} className="flex justify-between text-xs">
                  <span className="capitalize text-slate-600">{t.type.toLowerCase()} {t.note ? `· ${t.note}` : ""}</span>
                  <span className="font-semibold text-slate-900">₹{t.amount.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </CreatorLayout>
  );
}
