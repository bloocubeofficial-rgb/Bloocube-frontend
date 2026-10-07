"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { Button } from "@/Components/ui/Button";

type Pricing = {
  brand: { model: string; priceInr: number };
  creator: { model: string; priceInr: number; billingCycle: string; benefits: string[] };
};

export default function PricingPage() {
  const [pricing, setPricing] = useState<Pricing | null>(null);

  useEffect(() => {
    apiRequest<{ success: boolean; data: Pricing }>(`/api/config/pricing`)
      .then((res) => setPricing(res.data))
      .catch(() => setPricing(null));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 text-center">Simple, transparent pricing</h1>
      <p className="text-slate-600 mt-3 text-center max-w-xl mx-auto">
        Brands post campaigns for free. Creators unlock unlimited applications with a low monthly membership.
      </p>

      <div className="mt-12 grid sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 p-8">
          <div className="text-sm font-semibold text-slate-500 uppercase">Brands</div>
          <div className="mt-2 text-4xl font-extrabold text-slate-900">Free</div>
          <p className="text-sm text-slate-500 mt-1">Post campaigns and receive applications at no cost.</p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            {["Unlimited campaign posts", "Review unlimited applications", "Secure escrow payments", "Campaign analytics"].map((f) => (
              <li key={f} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />{f}</li>
            ))}
          </ul>
          <Link href="/signup?role=brand">
            <Button className="mt-6 w-full bg-slate-900 hover:bg-slate-800 rounded-xl">Get Started as a Brand</Button>
          </Link>
        </div>

        <div className="rounded-2xl border-2 border-indigo-200 p-8 bg-indigo-50/40 relative">
          <span className="absolute -top-3 right-6 text-xs font-semibold bg-indigo-600 text-white px-3 py-1 rounded-full">Recommended</span>
          <div className="text-sm font-semibold text-indigo-600 uppercase">Creators</div>
          <div className="mt-2 text-4xl font-extrabold text-slate-900">
            ₹{pricing?.creator.priceInr ?? 199}
            <span className="text-base font-medium text-slate-500">/{pricing?.creator.billingCycle ?? "monthly"}</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Membership for access — not reach. Apply to unlimited budgeted briefs.</p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            {(pricing?.creator.benefits || [
              "Unlimited applications to budgeted briefs",
              "Priority visibility in brand searches",
              "Access to verified budgeted campaigns",
            ]).map((f) => (
              <li key={f} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />{f}</li>
            ))}
          </ul>
          <Link href="/signup?role=creator">
            <Button className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl">Get Started as a Creator</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
