"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import AdminLayout from "@/Components/Admin/AdminLayout";

type ContactMessage = { id: string; name: string; email: string; subject: string | null; message: string; createdAt: string };

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ success: boolean; data: { messages: ContactMessage[] } }>("/api/contact")
      .then((res) => setMessages(res.data.messages))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Contact Messages</h1>
      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-slate-500">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-900">{m.name} · {m.email}</span>
                <span className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              {m.subject && <div className="text-xs text-indigo-600 mt-1">{m.subject}</div>}
              <p className="text-sm text-slate-700 mt-2">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
