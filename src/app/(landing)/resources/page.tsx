import Link from "next/link";
import { FileText, HelpCircle, ShieldCheck, Scale } from "lucide-react";

const RESOURCES = [
  { icon: HelpCircle, title: "How It Works", desc: "Understand the full brand-to-creator collaboration flow.", href: "/how-it-works" },
  { icon: FileText, title: "Pricing", desc: "See how brand and creator pricing works on BlooCube.", href: "/pricing" },
  { icon: ShieldCheck, title: "Privacy Policy", desc: "How we handle your data.", href: "/privacy" },
  { icon: Scale, title: "Terms of Service", desc: "The terms that govern using BlooCube.", href: "/terms" },
];

export default function ResourcesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Resources</h1>
      <p className="text-slate-600 mt-2">Guides and policies to help you get the most out of BlooCube.</p>

      <div className="mt-10 grid sm:grid-cols-2 gap-5">
        {RESOURCES.map((r) => {
          const Icon = r.icon;
          return (
            <Link key={r.title} href={r.href} className="rounded-xl border border-slate-100 shadow-sm bg-white p-6 hover:border-indigo-200 transition-colors">
              <Icon className="w-5 h-5 text-indigo-500 mb-3" />
              <div className="font-semibold text-slate-900">{r.title}</div>
              <div className="text-sm text-slate-500 mt-1">{r.desc}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
