type HeaderProps = {
    name: string;
    isLoading: boolean;
    greeting: string;
    handleStart: () => void;
    isStarting: boolean;
    interviewStarted: boolean;
    interviewCompleted: boolean;
    interviewStatusLabel: string;
    questionCount: number;
    maxQuestions: number;
    progressPercent: number;
};

export default function DashboardHeader({
    name,
    isLoading,
    greeting,
    handleStart,
    isStarting,
    interviewStarted,
    interviewCompleted,
    interviewStatusLabel,
    questionCount,
    maxQuestions,
    progressPercent,
}: HeaderProps) {
    return (
        <header className="flex items-center justify-between rounded-3xl border border-white/20 bg-white/40 p-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-6">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        {isLoading ? "Synchronizing..." : `Hi, ${name.split(' ')[0]}`}
                    </h1>
                    <p className="text-[10px] font-medium text-slate-500 flex items-center gap-2">
                        <span className="opacity-60">{greeting}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-indigo-600 font-bold uppercase tracking-wider">{interviewStatusLabel}</span>
                    </p>
                </div>
                
                <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />

                <div className="hidden md:flex flex-col gap-1 w-48">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        <span>Progress</span>
                        <span>{questionCount}/{maxQuestions}</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200/50">
                        <div
                            className="h-full rounded-full bg-indigo-500 transition-all duration-1000"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={handleStart}
                disabled={isStarting || isLoading || interviewStarted || interviewCompleted}
                className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <span className="relative z-10">
                    {interviewCompleted ? "Interview Finalized" : isStarting ? "Initializing..." : interviewStarted ? "Session Active" : "Start Interview"}
                </span>
            </button>
        </header>
    );
}
