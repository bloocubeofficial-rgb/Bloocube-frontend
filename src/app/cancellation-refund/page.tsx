"use client";
import React from "react";

const CancellationRefundPage: React.FC = () => {
  return (
    <>
      <div className="w-full bg-black text-black pointer-events-none absolute md:fixed inset-0 z-0 overflow-hidden will-change-transform">
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 opacity-20 md:opacity-30 rounded-full blur-[120px] animate-gradient-60" />
        <div className="absolute top-[30%] -left-20 w-[400px] h-[400px] bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 opacity-18 md:opacity-28 rounded-full blur-[120px] animate-gradient-60" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-pink-500 opacity-16 md:opacity-24 rounded-full blur-[140px] animate-gradient-60" />
      </div>
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-16 text-zinc-300">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Cancellation & Refund Policy – Bloocube</h1>
        <p className="text-sm text-zinc-400 mb-10">
          Effective Date: 07/11/2025<br />
          Last Updated: 07/11/2025
        </p>

        <section className="space-y-4 mb-10">
          <p>
            Bloocube ("we," "our," "us") is an AI-powered SaaS and marketplace platform. This Cancellation & Refund Policy explains how cancellations and refunds are handled for subscriptions and marketplace transactions.
          </p>
          <p>
            By using Bloocube, you agree to this policy.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white">1. Subscription Cancellation (SaaS Plans)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Users can cancel their SaaS subscription at any time from their account dashboard or by contacting support.</li>
            <li>Upon cancellation, access to paid features will remain active until the end of the current billing cycle.</li>
            <li>No additional charges will be applied after cancellation.</li>
          </ul>
          <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="font-semibold text-white mb-2">✅ Important:</p>
            <p>Cancellation stops future billing but does not automatically qualify for a refund.</p>
          </div>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white">2. Subscription Refund Policy</h2>
          <p>
            Bloocube follows a no-refund policy for subscription fees once payment is successfully processed.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>This applies to monthly, quarterly, or annual plans.</li>
          </ul>
          <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="font-semibold text-white mb-2">💡 Reason:</p>
            <p>Bloocube provides instant access to digital tools, AI features, and platform resources, which cannot be "returned."</p>
          </div>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white">3. Free Trial & Early Access Users</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Users on a free trial or early-access plan can cancel at any time with no charges.</li>
            <li>If a user upgrades to a paid plan, the refund policy for paid subscriptions applies immediately.</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white">4. Marketplace Transactions (Brands & Creators)</h2>
          <p>
            Bloocube marketplace payments are protected through an escrow system.
          </p>
          
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">a) Before Campaign Start</h3>
              <p>
                If a campaign is cancelled before work begins, funds held in escrow may be refunded to the brand (after platform fees, if applicable).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">b) After Campaign Start</h3>
              <p>Once a creator has started or delivered work, refunds are not guaranteed.</p>
              <p className="mt-2">Partial refunds may be issued only if:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>The creator fails to deliver as per agreed terms.</li>
                <li>The campaign is cancelled due to a verified breach of agreement.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">c) Completed Campaigns</h3>
              <p>
                Once work is completed and approved, payments are released to the creator and no refunds are applicable.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white">5. Platform Fees</h2>
          <p>
            Platform or service fees charged by Bloocube are non-refundable, including marketplace facilitation, escrow, or transaction processing fees.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white">6. Disputes & Resolution</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>In case of a dispute between a brand and creator, Bloocube may review submitted evidence (messages, deliverables, timelines).</li>
            <li>Bloocube's decision will be final and binding to ensure fairness to both parties.</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white">7. Exceptional Cases</h2>
          <p>
            Refunds may be considered only at Bloocube's discretion in rare situations such as:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Duplicate payments</li>
            <li>Technical errors caused solely by Bloocube</li>
            <li>Unauthorized charges verified after investigation</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white">8. Policy Changes</h2>
          <p>
            Bloocube reserves the right to update or modify this policy at any time. Changes will be effective immediately upon posting on the website.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white">9. Contact Us</h2>
          <p>
            For cancellation, refund queries, or disputes, contact us at:
          </p>
          <ul className="list-none space-y-2 mt-2">
            <li>📧 <a href="mailto:Contact@Bloocube.com" className="text-blue-400 hover:text-blue-300 transition-colors">Contact@Bloocube.com</a></li>
            <li>🌐 <a href="https://www.Bloocube.com" className="text-blue-400 hover:text-blue-300 transition-colors">www.Bloocube.com</a></li>
          </ul>
        </section>
      </main>
    </>
  );
};

export default CancellationRefundPage;


