"use client";

// Placeholder wordmarks for local development — swap in real, authorized
// brand logos before any public launch (see project constraints, section 4).
const BRANDS = ["Garnier", "Philips", "Rapido", "L'Oréal", "CeraVe", "Reliance"];

export default function TrustedBrands() {
  return (
    <section className="py-10 border-y border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs font-medium text-slate-400 uppercase tracking-wide mb-6">
          Trusted by growing brands
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {BRANDS.map((name) => (
            <span key={name} className="text-lg font-bold text-slate-300 select-none">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
