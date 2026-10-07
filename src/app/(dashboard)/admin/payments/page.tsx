"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import AdminLayout from "@/Components/Admin/AdminLayout";

type AdminPayment = { _id: string; amount: number; status: string; campaign: string; createdAt: string };

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ success: boolean; data: { payments: AdminPayment[] } }>("/api/admin/payments")
      .then((res) => setPayments(res.data.payments))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Payments</h1>
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="text-left px-4 py-3">Campaign</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 text-slate-400" colSpan={4}>Loading...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td className="px-4 py-6 text-slate-400" colSpan={4}>No payments found.</td></tr>
            ) : (
              payments.map((p) => (
                <tr key={p._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.campaign}</td>
                  <td className="px-4 py-3 text-slate-600">₹{p.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{p.status.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
