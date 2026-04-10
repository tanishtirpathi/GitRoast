"use client";

import { ApiError, apiFetch } from "@/libs/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type FormState = {
    email: string;
    password: string;
};

type UserResponse = {
    user?: {
        name?: string;
        email?: string;
    };
};

const initialFormState: FormState = {
    email: "",
    password: "",
};

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState<FormState>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const redirectIfAuthenticated = async () => {
            try {
                await apiFetch<UserResponse>("/api/user/me");
                if (mounted) {
                    router.replace("/dashboard");
                }
            } catch {
                // If unauthorized, user should remain on this page.
            } finally {
                if (mounted) {
                    setIsCheckingAuth(false);
                }
            }
        };

        void redirectIfAuthenticated();

        return () => {
            mounted = false;
        };
    }, [router]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!form.email.trim() || !form.password) {
            setErrorMessage("Please provide email and password.");
            return;
        }

        try {
            setIsSubmitting(true);

            const data = await apiFetch<{ message?: string; user?: unknown }>("/api/user/login", {
                method: "POST",
                body: JSON.stringify({
                    email: form.email.trim(),
                    password: form.password,
                }),
            });

            console.log("[login] Response payload", data);
            setSuccessMessage(data.message ?? "Logged in successfully.");
            setForm(initialFormState);
            router.push("/dashboard");
        } catch (error) {
            if (error instanceof ApiError) {
                console.error("[login] API error details", {
                    status: error.status,
                    endpoint: error.endpoint,
                    method: error.method,
                    data: error.data,
                });
            }

            setErrorMessage(
                error instanceof Error ? error.message : "Something went wrong. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 text-slate-700">
                <p className="text-sm">Checking session...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 text-slate-900">
            <main className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    AI Platform
                </p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">Login</h1>
                <p className="mt-1 text-sm text-slate-600">Welcome back.</p>

                <form className="mt-5 space-y-3" onSubmit={handleSubmit} noValidate>
                    <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(event) =>
                            setForm((previous) => ({ ...previous, email: event.target.value }))
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-400/20"
                        placeholder="you@example.com"
                        required
                    />

                    <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        value={form.password}
                        onChange={(event) =>
                            setForm((previous) => ({ ...previous, password: event.target.value }))
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-400/20"
                        placeholder="Your password"
                        required
                    />

                    {errorMessage ? (
                        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            {errorMessage}
                        </p>
                    ) : null}

                    {successMessage ? (
                        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            {successMessage}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-1 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-slate-600">
                    New here?{" "}
                    <Link href="/signup" className="font-semibold text-slate-900 hover:text-slate-700">
                        Create account
                    </Link>
                </p>
            </main>
        </div>
    );
}