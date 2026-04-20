"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/libs/api";

type MeResponse = {
  user?: {
    name?: string;
    interviewCompleted?: boolean;
  };
};

export default function InterviewCompletePage() {
  const router = useRouter();
  const [name, setName] = useState("Candidate");
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      await apiFetch("/api/user/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      router.replace("/");
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const data = await apiFetch<MeResponse>("/api/user/me");
        if (!mounted) {
          return;
        }

        const safeName = data.user?.name?.trim();
        if (safeName) {
          setName(safeName);
        }

        if (!data.user?.interviewCompleted) {
          router.replace("/dashboard");
          return;
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          router.replace("/login");
          return;
        }

        router.replace("/dashboard");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="dashboard-bg flex min-h-screen items-center justify-center px-4">
        <p className="text-sm font-medium text-slate-700">Loading interview summary...</p>
      </main>
    );
  }

  return (
    <main className="dashboard-bg flex min-h-screen items-center justify-center px-4 py-8">
      <section className="dashboard-reveal w-full max-w-2xl rounded-[2rem] border border-white/80 bg-white/85 p-8 text-center shadow-[0_28px_80px_rgba(11,23,56,0.16)] backdrop-blur-sm sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Interview Closed</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">You Have Completed The Interview</h1>
        <p className="mt-4 text-sm text-slate-600 sm:text-base">
          Great work, <span className="font-semibold text-slate-900">{name}</span>. Your interview reached all 10 questions and is now locked.
        </p>
        <p className="mt-2 text-sm text-slate-600">This interview cannot be started again from this account.</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-2xl border border-slate-300 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back To Dashboard
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out..." : "Go Home"}
          </button>
        </div>
      </section>
    </main>
  );
}
