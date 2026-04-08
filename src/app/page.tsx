export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
      <main className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">AI Platform</h1>
        <p className="mt-3 text-slate-600">
          Auth flow is ready. Login/signup first, then open the dashboard to see user details.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/dashboard"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Open Dashboard
          </a>
          <a
            href="http://localhost:3000/api/user/me"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
          >
            Test /api/user/me
          </a>
        </div>
      </main>
    </div>
  );
}
