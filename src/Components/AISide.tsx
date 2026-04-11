import Image from "next/image";

type AISideProps = {
    responseText: string;
};

export default function AISide({ responseText }: AISideProps) {
    return (
        <section className="dashboard-reveal rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-6 shadow-[0_16px_48px_rgba(2,32,71,0.1)]">
            <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">AI View</p>
                <span className="rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
                    Active
                </span>
            </div>
            <Image src="/assets/ai-side.png" alt="AI Side" width={800} height={600} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" />
            <p className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700">{responseText}</p>
        </section>
    );
}