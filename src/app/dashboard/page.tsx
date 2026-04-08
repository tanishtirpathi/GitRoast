"use client";

import { useEffect, useState } from "react";

type DashboardUser = {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Session expired. Please login again.");
            return;
          }

          setError("Failed to load dashboard user details.");
          return;
        }

        const data = (await response.json()) as { user: DashboardUser };
        setUser(data.user);
      } catch {
        setError("Unable to connect to backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
        <p className="text-lg font-medium text-slate-700">Loading dashboard...</p>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Access Required</h1>
          <p className="mt-3 text-slate-600">{error ?? "Please login to continue."}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">User Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome, {user.name}</h1>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">User ID</p>
            <p className="mt-2 break-all text-slate-900">{user._id}</p>
          </article>
          <article className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
            <p className="mt-2 text-slate-900">{user.email}</p>
          </article>
          <article className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Joined</p>
            <p className="mt-2 text-slate-900">{new Date(user.createdAt).toLocaleString()}</p>
          </article>
          <article className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last Updated</p>
            <p className="mt-2 text-slate-900">{new Date(user.updatedAt).toLocaleString()}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
