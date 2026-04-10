"use client";

import { ApiError, apiFetch } from "@/libs/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type MeResponse = {
    user?: {
        name?: string;
        email?: string;
    };
};

export default function DashboardPage() {
    const router = useRouter();
    const [name, setName] = useState<string>("User");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            } catch (error) {
                if (!mounted) {
                    return;
                }

                if (error instanceof ApiError && error.status === 401) {
                    router.replace("/login");
                    return;
                }

                setErrorMessage(error instanceof Error ? error.message : "Failed to load user.");
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadUser();

        return () => {
            mounted = false;
        };
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
            <main className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>

                {isLoading ? <p className="mt-2 text-slate-600">Loading profile...</p> : null}

                {!isLoading && !errorMessage ? (
                    <p className="mt-2 text-slate-700">Welcome, {name}.</p>
                ) : null}

                {errorMessage ? (
                    <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {errorMessage}
                    </p>
                ) : null}
            </main>
        </div>
    );
}