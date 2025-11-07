"use client";
import React from "react";

const PrivacyPage: React.FC = () => {
  return (
    <>
    <div className="w-full bg-black text-black pointer-events-none absolute md:fixed inset-0 z-0 overflow-hidden will-change-transform">
      <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 opacity-20 md:opacity-30 rounded-full blur-[120px] animate-gradient-60" />
          <div className="absolute top-[30%] -left-20 w-[400px] h-[400px] bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 opacity-18 md:opacity-28 rounded-full blur-[120px] animate-gradient-60" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-pink-500 opacity-16 md:opacity-24 rounded-full blur-[140px] animate-gradient-60" />
</div>
       <main className="relative  z-10 max-w-3xl mx-auto px-6 py-16 text-zinc-300">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Privacy Policy</h1>
      <p className="text-sm text-zinc-400 mb-10">Last updated: 2025-10-06</p>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Introduction</h2>
        <p className="">
          This Privacy Policy explains how Bloocube ("we", "us") collects, uses, and protects your
          information when you use our platform and services.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Account information: name, email, organization</li>
          <li>Usage data: device information, app interactions, diagnostics</li>
          <li>Content you provide: posts, captions, assets you upload</li>
          <li>Third‑party data: data you authorize from connected social platforms</li>
        </ul>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">How We Use Information</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Provide and improve the Bloocube platform and features</li>
          <li>Personalize content, recommendations, and analytics</li>
          <li>Maintain security, prevent fraud, and ensure service quality</li>
          <li>Communicate updates, service notices, and support</li>
        </ul>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Data Sharing</h2>
        <p>
          We do not sell your personal information. We may share data with vetted processors (e.g., cloud
          hosting, analytics) under strict contractual obligations, and when required by law.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Your Choices</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Access, update, or delete your account information</li>
          <li>Disconnect social accounts at any time</li>
          <li>Manage email preferences and notifications</li>
        </ul>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Security</h2>
        <p>
          We implement administrative, technical, and physical safeguards to protect your data. No method
          of transmission or storage is 100% secure; we continuously improve our practices.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Contact</h2>
        <p>
          For privacy questions or requests, contact us at privacy@bloocube.com.
        </p>
      </section>
    </main>
  </>
   
  );
};

export default PrivacyPage;


