"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/Components/ui/Button";

const CREATOR_POINTS = [
  "Get discovered by brands actively looking for creators like you",
  "Apply to budgeted briefs instead of cold-pitching brands",
  "Get paid securely through escrow once content is approved",
  "Track earnings, applications and profile performance in one place",
];

const BRAND_POINTS = [
  "Post campaigns for free and receive creator applications",
  "Compare verified creators by niche, reach and engagement",
  "Keep budgets transparent with open or fixed bidding",
  "Pay only after you approve the delivered content",
];

export default function ValueProps() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10">
        <div className="rounded-2xl border border-slate-100 shadow-sm p-8 bg-gradient-to-br from-indigo-50 to-white">
          <span className="text-xs font-semibold text-indigo-600 uppercase">For Creators</span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">Turn your content into income</h3>
          <ul className="mt-5 space-y-3">
            {CREATOR_POINTS.map((p) => (
              <li key={p} className="flex gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
          <Link href="/signup?role=creator">
            <Button className="mt-6 bg-slate-900 hover:bg-slate-800 rounded-xl">Join as a Creator</Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-100 shadow-sm p-8 bg-gradient-to-br from-blue-50 to-white">
          <span className="text-xs font-semibold text-blue-600 uppercase">For Brands</span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">Launch campaigns with confidence</h3>
          <ul className="mt-5 space-y-3">
            {BRAND_POINTS.map((p) => (
              <li key={p} className="flex gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
          <Link href="/signup?role=brand">
            <Button variant="outline" className="mt-6 rounded-xl border-slate-300">Join as a Brand</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
