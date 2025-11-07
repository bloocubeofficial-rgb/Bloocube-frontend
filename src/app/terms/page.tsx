"use client";
import React from "react";

const TermsPage: React.FC = () => {
  return (
    <>
    <div className="w-full bg-black absolute md:fixed inset-0 z-0 pointer-events-none will-change-transform">
  <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 opacity-20 md:opacity-30 rounded-full blur-[120px] animate-gradient-60" />
  <div className="absolute top-[30%] -left-20 w-[400px] h-[400px] bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 opacity-18 md:opacity-28 rounded-full blur-[120px] animate-gradient-60" />
  <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-pink-500 opacity-16 md:opacity-24 rounded-full blur-[140px] animate-gradient-60" />
</div>
    <main className="relative z-10 max-w-3xl mx-auto px-6 py-16 text-zinc-300">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Terms of Service</h1>
      <p className="text-sm text-zinc-400 mb-10">Last updated: 2025-10-06</p>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Agreement to Terms</h2>
        <p>
          By accessing or using Bloocube, you agree to be bound by these Terms. If you do not agree,
          do not use the Service.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Use of Service</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Comply with applicable laws and platform policies</li>
          <li>Do not misuse, reverse engineer, or disrupt the Service</li>
          <li>You are responsible for content you create, upload, or distribute</li>
        </ul>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Accounts & Security</h2>
        <p>
          Keep your credentials secure. You are responsible for all activities under your account.
          Notify us immediately of any unauthorized use or breach.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Subscriptions & Billing</h2>
        <p>
          Paid plans renew on a monthly basis unless canceled. Fees are non‑refundable except as
          required by law.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Intellectual Property</h2>
        <p>
          Bloocube and its logos are our property. You retain rights to your content; you grant us a
          limited license to operate the Service.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Disclaimers & Liability</h2>
        <p>
          The Service is provided “as is” without warranties. To the fullest extent permitted by law,
          our liability is limited.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Changes</h2>
        <p>
          We may update these Terms. Continued use after changes means you accept the updated Terms.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Contact</h2>
        <p>
          For questions about these Terms, contact legal@bloocube.com.
        </p>
      </section>
      </main>
    </>
    
  );
};

export default TermsPage;


