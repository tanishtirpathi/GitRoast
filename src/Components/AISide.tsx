import Image from "next/image";

type AISideProps = {
    responseText: string;
};

export default function AISide({ responseText }: AISideProps) {
    return (
        <section className="dashboard-reveal flex h-full min-h-0 flex-col rounded-[2rem] border border-white/40 bg-white/60 p-4 shadow-sm backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Interviewer View</p>
                </div>
            </div>
            <div className="flex-1 min-h-0 flex flex-col gap-4">
                <div className="relative group overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50 flex-shrink-0" style={{ height: '40%' }}>
                    <Image
                        src="/assets/ai-side.png"
                        alt="AI Side"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="relative flex-1 min-h-0">
                    <div className="absolute inset-0 overflow-auto custom-scrollbar rounded-2xl bg-white/40 p-5 text-[1.1rem] font-medium leading-relaxed text-slate-700 border border-slate-50 shadow-inner">
                        {responseText || "Waiting for user input..."}
                    </div>
                </div>
            </div>
        </section>
    );
}