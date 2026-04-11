export default function Myside() {
    return (
        <section className="dashboard-reveal rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6 shadow-[0_16px_48px_rgba(2,32,71,0.1)]">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Your Side</p>
                <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                    3 Tasks
                </span>
            </div>

            <h2 className="text-xl font-semibold text-slate-900">Execution Panel</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Keep momentum by moving from idea to action with a small, focused sprint queue.
            </p>

            <ul className="mt-5 space-y-3 text-sm text-slate-700">
                <li className="rounded-2xl border border-slate-200 bg-white px-4 py-3">Finalize WebSocket event schema</li>
                <li className="rounded-2xl border border-slate-200 bg-white px-4 py-3">Tune STT confidence thresholds</li>
                <li className="rounded-2xl border border-slate-200 bg-white px-4 py-3">Validate TTS chunk timing</li>
            </ul>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                Last update: 2 minutes ago.
            </div>
        </section>
    );
}