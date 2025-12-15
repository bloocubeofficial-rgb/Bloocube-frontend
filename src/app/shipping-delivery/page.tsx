"use client";
import React from "react";

const ShippingDeliveryPage: React.FC = () => {
  return (
    <>
      <div className="w-full bg-black text-black pointer-events-none absolute md:fixed inset-0 z-0 overflow-hidden will-change-transform">
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 opacity-20 md:opacity-30 rounded-full blur-[120px] animate-gradient-60" />
        <div className="absolute top-[30%] -left-20 w-[400px] h-[400px] bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 opacity-18 md:opacity-28 rounded-full blur-[120px] animate-gradient-60" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-pink-500 opacity-16 md:opacity-24 rounded-full blur-[140px] animate-gradient-60" />
      </div>
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-16 text-zinc-300">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Shipping & Delivery Policy – Bloocube</h1>
        <p className="text-sm text-zinc-400 mb-10">
          Effective Date: 07/11/2025<br />
          Last Updated: 07/11/2025
        </p>

        <section className="space-y-4 mb-10">
          <p>
            Bloocube is a digital SaaS and marketplace platform. We do not sell or ship any physical products. This Shipping & Delivery Policy explains how access to our services is provided.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white">1. Digital Service Delivery</h2>
          <p>
            All Bloocube services are delivered digitally.
          </p>
          <p>
            Once a user:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Signs up, or</li>
            <li>Purchases a subscription, or</li>
            <li>Participates in a marketplace transaction</li>
          </ul>
          <p className="mt-4">
            access to the platform and its features is provided electronically through the Bloocube website or application.
          </p>
          <p className="mt-2 font-semibold text-white">
            There is no physical shipping involved.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white">2. Access Timeline</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-white">Account creation:</strong> Immediate access after successful registration</li>
            <li><strong className="text-white">Paid subscription activation:</strong> Access is enabled instantly after payment confirmation</li>
            <li><strong className="text-white">Marketplace campaigns:</strong> Access and campaign tools are enabled as per agreed timelines between brands and creators</li>
          </ul>
          <p className="mt-4">
            In rare cases of technical delay, access may take up to 24 hours.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white">3. No Physical Shipment</h2>
          <p>
            Bloocube does not deliver:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Physical products</li>
            <li>Printed materials</li>
            <li>Merchandise</li>
            <li>Hardware or devices</li>
          </ul>
          <p className="mt-4">
            Any reference to "shipping" applies only to digital access and service activation.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white">4. Communication & Notifications</h2>
          <p>
            Users will receive confirmation via:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Email</li>
            <li>Dashboard notification</li>
          </ul>
          <p className="mt-4">
            for successful registration, subscription activation, or marketplace-related updates.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white">5. Service Availability</h2>
          <p>
            Bloocube services are accessible online and may occasionally be unavailable due to:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>System maintenance</li>
            <li>Updates</li>
            <li>Technical issues beyond our control</li>
          </ul>
          <p className="mt-4">
            We strive to minimize downtime and restore services promptly.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold text-white">6. Contact Us</h2>
          <p>
            If you experience delays or issues accessing Bloocube services, contact us at:
          </p>
          <ul className="list-none space-y-2 mt-2">
            <li>📧 <a href="mailto:contact@Bloocube.com" className="text-blue-400 hover:text-blue-300 transition-colors">contact@Bloocube.com</a></li>
            <li>🌐 <a href="https://www.Bloocube.com" className="text-blue-400 hover:text-blue-300 transition-colors">www.Bloocube.com</a></li>
          </ul>
        </section>
      </main>
    </>
  );
};

export default ShippingDeliveryPage;


