"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
	"http://localhost:8000";

type FormState = {
	name: string;
	email: string;
	password: string;
};

const initialFormState: FormState = {
	name: "",
	email: "",
	password: "",
};

export default function SignupPage() {
	const router = useRouter();
	const [form, setForm] = useState<FormState>(initialFormState);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const passwordHint = useMemo(() => {
		if (!form.password) {
			return "Use at least 8 characters.";
		}
		if (form.password.length < 8) {
			return "Password is too short.";
		}
		return "Looks good.";
	}, [form.password]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage(null);
		setSuccessMessage(null);

		if (!form.name.trim() || !form.email.trim() || !form.password) {
			setErrorMessage("Please fill all required fields.");
			return;
		}

		if (form.password.length < 8) {
			setErrorMessage("Password must be at least 8 characters long.");
			return;
		}
		try {
			setIsSubmitting(true);

			const response = await fetch(`${API_BASE_URL}/api/user/signup`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					name: form.name.trim(),
					email: form.email.trim(),
					password: form.password,
				}),
			});

			const data = (await response.json()) as { message?: string };
			if (!response.ok) {
				throw new Error(data.message ?? "Signup failed. Please try again.");
			}

			setSuccessMessage(data.message ?? "Signup successful.");
			setForm(initialFormState);
			router.push("/dashboard");
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: "Something went wrong. Please try again.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 text-slate-900">
			<main className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
					AI Platform
				</p>
				<h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">
					Create account
				</h1>
				<p className="mt-1 text-sm text-slate-600">
					Minimal setup, quick start.
				</p>

				<form className="mt-5 space-y-3" onSubmit={handleSubmit} noValidate>
					<label className="block text-sm font-medium text-slate-700" htmlFor="name">
						Full name
					</label>
					<input
						id="name"
						type="text"
						autoComplete="name"
						value={form.name}
						onChange={(event) =>
							setForm((previous) => ({ ...previous, name: event.target.value }))
						}
						className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-400/20"
						placeholder="Ada Lovelace"
						required
					/>

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
						autoComplete="new-password"
						value={form.password}
						onChange={(event) =>
							setForm((previous) => ({ ...previous, password: event.target.value }))
						}
						className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-400/20"
						placeholder="At least 8 characters"
						required
					/>
					<p className="text-xs text-slate-500">{passwordHint}</p>


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
						{isSubmitting ? "Creating account..." : "Create account"}
					</button>
				</form>

				<p className="mt-4 text-center text-sm text-slate-600">
					Already have an account?{" "}
					<Link href="/login" className="font-semibold text-slate-900 hover:text-slate-700">
						Login
					</Link>
				</p>
			</main>
		</div>
	);
}
