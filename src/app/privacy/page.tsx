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
        <h2 className="text-xl font-semibold text-white">Google Sign-In Data</h2>
        <p>
          When you sign in with Google, Bloocube accesses the following information from your Google account:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li><strong>Email address:</strong> Used to create and manage your Bloocube account</li>
          <li><strong>Name:</strong> Used to set up your profile and display your name in the platform</li>
          <li><strong>Profile image:</strong> Used to display your profile picture in your Bloocube account</li>
        </ul>
        <p className="mt-4">
          <strong>Purpose:</strong> This information is used solely for authentication and account setup. We use Google Sign-In to securely authenticate your identity and create your Bloocube account.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">YouTube Integration (Optional & User-Initiated)</h2>
        <p>
          <strong>Important:</strong> YouTube integration is completely optional and separate from Google Sign-In. YouTube access is only requested when you explicitly choose to connect your YouTube channel in your account settings.
        </p>
        <p className="mt-4">
          <strong>When YouTube access is requested:</strong> YouTube permissions are NOT requested during Google Sign-In. They are only requested when you:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Navigate to your account settings</li>
          <li>Click "Connect YouTube" or similar option</li>
          <li>Explicitly initiate the YouTube connection process</li>
        </ul>
        <p className="mt-4">
          <strong>YouTube data accessed:</strong> When you connect your YouTube channel, Bloocube accesses:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Channel ID and channel name</li>
          <li>Channel description and custom URL</li>
          <li>Channel thumbnail images</li>
          <li>Subscriber count, video count, and total view count</li>
          <li>Permission to upload videos to your YouTube channel (when you choose to publish content)</li>
        </ul>
        <p className="mt-4">
          <strong>What we do NOT access:</strong> We do not access your YouTube videos, comments, playlists, or any other YouTube content without your explicit action to publish content through our platform.
        </p>
        <p className="mt-4">
          <strong>Revocation:</strong> You can disconnect your YouTube account at any time from your account settings. This immediately revokes all YouTube permissions and stops any further access to your YouTube data.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Data Storage</h2>
        <p>
          <strong>What is stored:</strong> We store the following Google and YouTube data in our secure database:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li><strong>Google Sign-In data:</strong> Your email address and name are stored in our user database to maintain your account</li>
          <li><strong>YouTube data (if connected):</strong> Channel information (ID, title, description, statistics) and OAuth tokens (access token, refresh token) are stored in your user profile</li>
        </ul>
        <p className="mt-4">
          <strong>Where:</strong> All data is stored in our MongoDB database hosted on secure cloud infrastructure. OAuth tokens are encrypted at rest.
        </p>
        <p className="mt-4">
          <strong>Retention:</strong> Your Google email and name are retained until you delete your Bloocube account. YouTube channel data and tokens are retained until you disconnect your YouTube account or delete your Bloocube account. When you disconnect YouTube, all YouTube-related data is immediately removed from our database.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-white">Data Deletion</h2>
        <p>
          You have full control over your Google and YouTube data:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li><strong>Disconnect YouTube:</strong> Go to your account settings and click "Disconnect YouTube" to immediately revoke YouTube access and remove all YouTube data from our database</li>
          <li><strong>Delete account:</strong> Delete your Bloocube account from account settings to remove all stored data, including Google Sign-In information</li>
          <li><strong>Email request:</strong> Send a data deletion request to <a href="mailto:privacy@bloocube.com" className="text-blue-400 hover:text-blue-300 transition-colors">privacy@bloocube.com</a> with your account email address</li>
        </ul>
        <p className="mt-4">
          Upon account deletion or YouTube disconnection, we will remove your data from our active databases within 30 days. Some data may be retained in backups for up to 90 days for security and legal compliance purposes, after which it is permanently deleted.
        </p>
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
          For privacy questions, data deletion requests, or concerns about Google/YouTube data usage, contact us at <a href="mailto:privacy@bloocube.com" className="text-blue-400 hover:text-blue-300 transition-colors">privacy@bloocube.com</a>.
        </p>
      </section>
    </main>
  </>
   
  );
};

export default PrivacyPage;


