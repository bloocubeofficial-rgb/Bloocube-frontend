"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import AdminLayout from "@/Components/Admin/AdminLayout";

type AdminUser = { _id: string; name: string; email: string; role: string; isActive: boolean; isVerified: boolean; createdAt: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    setLoading(true);
    const qs = roleFilter ? `?role=${roleFilter}` : "";
    apiRequest<{ success: boolean; data: { users: AdminUser[] } }>(`/api/admin/users${qs}`)
      .then((res) => setUsers(res.data.users))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(refetch, [roleFilter]);

  const toggleActive = async (id: string, isActive: boolean) => {
    await apiRequest(`/api/admin/users/${id}/status`, { method: "PUT", body: JSON.stringify({ isActive: !isActive }) });
    refetch();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm">
          <option value="">All Roles</option>
          <option value="creator">Creators</option>
          <option value="brand">Brands</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Joined</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 text-slate-400" colSpan={6}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td className="px-4 py-6 text-slate-400" colSpan={6}>No users found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${u.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(u._id, u.isActive)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
