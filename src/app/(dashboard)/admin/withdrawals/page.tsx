"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import AdminLayout from "@/Components/Admin/AdminLayout";

type AdminWithdrawal = { _id: string; amount: number; method: string; status: string; user: string; createdAt: string };

const STATUSES = ["pending", "processing", "completed", "failed"];

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    setLoading(true);
    apiRequest<{ success: boolean; data: { withdrawals: AdminWithdrawal[] } }>("/api/admin/withdrawals")
      .then((res) => setWithdrawals(res.data.withdrawals))
      .catch(() => setWithdrawals([]))
      .finally(() => setLoading(false));
  };

  useEffect(refetch, []);

  const updateStatus = async (id: string, status: string) => {
    await apiRequest(`/api/admin/withdrawals/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
    refetch();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Withdrawals</h1>
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="text-left px-4 py-3">Creator</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Method</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Update</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 text-slate-400" colSpan={5}>Loading...</td></tr>
            ) : withdrawals.length === 0 ? (
              <tr><td className="px-4 py-6 text-slate-400" colSpan={5}>No withdrawal requests.</td></tr>
            ) : (
              withdrawals.map((w) => (
                <tr key={w._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{w.user}</td>
                  <td className="px-4 py-3 text-slate-600">₹{w.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 uppercase text-slate-600 text-xs">{w.method}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{w.status}</td>
                  <td className="px-4 py-3">
                    <select value={w.status} onChange={(e) => updateStatus(w._id, e.target.value)} className="h-8 px-2 rounded-md border border-slate-200 text-xs">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
