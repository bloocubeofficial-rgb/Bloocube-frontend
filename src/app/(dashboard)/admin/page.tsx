"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import AdminLayout from "@/Components/Admin/AdminLayout";

type Overview = { users: number; creators: number; brands: number; campaigns: number; activeCampaigns: number; applications: number; gmv: number; openDisputes: number };

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    apiRequest<{ success: boolean; data: Overview }>("/api/admin/overview")
      .then((res) => setOverview(res.data))
      .catch(() => setOverview(null));
  }, []);

  const tiles = [
    { label: "Total Users", value: overview?.users },
    { label: "Creators", value: overview?.creators },
    { label: "Brands", value: overview?.brands },
    { label: "Total Campaigns", value: overview?.campaigns },
    { label: "Active Campaigns", value: overview?.activeCampaigns },
    { label: "Applications", value: overview?.applications },
    { label: "GMV (Released)", value: overview ? `₹${overview.gmv.toLocaleString("en-IN")}` : undefined },
    { label: "Open Disputes", value: overview?.openDisputes },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Platform Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs text-slate-500">{t.label}</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{t.value ?? "—"}</div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
