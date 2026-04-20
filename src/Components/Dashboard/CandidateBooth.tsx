"use client";

import { RefObject } from "react";

type CandidateBoothProps = {
    videoRef: RefObject<HTMLVideoElement | null>;
    cameraEnabled: boolean;
    cameraError: string | null;
    startCamera: () => Promise<void>;
    stopCamera: () => void;
    isListening: boolean;
    answer: string;
    setAnswer: (val: string) => void;
    finalTranscript: string;
    interimTranscript: string;
    startListening: () => void;
    stopListening: () => void;
    handleSendAnswer: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    sendFinalTranscript: () => Promise<void>;
    isSendingAnswer: boolean;
    interviewStarted: boolean;
    interviewCompleted: boolean;
    voiceError: string | null;
};

export default function CandidateBooth({
    videoRef,
    cameraEnabled,
    cameraError,
    startCamera,
    stopCamera,
    isListening,
    answer,
    setAnswer,
    finalTranscript,
    interimTranscript,
    startListening,
    stopListening,
    handleSendAnswer,
    sendFinalTranscript,
    isSendingAnswer,
    interviewStarted,
    interviewCompleted,
    voiceError,
}: CandidateBoothProps) {
    return (
        <section className="dashboard-reveal flex h-full min-h-0 flex-col rounded-[2rem] border border-white/40 bg-white/60 p-4 shadow-sm backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Candidate Workspace</p>
                </div>
            </div>

            <div className="relative group aspect-video h-[35%] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950 shadow-lg flex-shrink-0">
                <video
                    ref={videoRef}
                    className="h-full w-full object-cover transition-opacity duration-500"
                    autoPlay
                    muted
                    playsInline
                    style={{ opacity: cameraEnabled ? 1 : 0.4 }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${cameraEnabled ? "bg-emerald-500" : "bg-rose-500"}`} />
                        <span className="text-[8px] font-bold text-white uppercase tracking-widest">
                            {cameraEnabled ? "Active" : "Disabled"}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={cameraEnabled ? stopCamera : () => void startCamera()}
                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-[8px] font-bold text-white backdrop-blur-md transition hover:bg-white/20"
                    >
                        {cameraEnabled ? "Stop" : "Start"}
                    </button>
                </div>

                {!cameraEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Stream Required</p>
                    </div>
                )}
            </div>

            <div className="mt-4 flex flex-col min-h-0 flex-1">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-bold text-slate-900">Your Response</h2>
                </div>
                
                <div className="relative flex-1 min-h-0 group">
                    <textarea
                        value={answer || (isListening ? (finalTranscript + " " + interimTranscript).trim() : "")}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Speak or type your answer here..."
                        className="h-full w-full resize-none rounded-xl border border-slate-100 bg-white/50 p-4 text-sm leading-relaxed text-slate-600 focus:border-indigo-300 focus:bg-white focus:outline-none transition-all custom-scrollbar"
                        readOnly={isListening}
                    />
                    
                    <button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        className={`absolute bottom-3 right-3 h-10 w-10 rounded-xl flex items-center justify-center shadow-md transition-all ${
                            isListening 
                            ? "bg-rose-500 text-white animate-pulse" 
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                    >
                        {isListening ? (
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4c0 1.1-.9 2-2 2s-2-.9-2-2zm12 0h-4c0 1.1.9 2 2 2s2-.9 2-2zM12 2c-3.31 0-6 2.69-6 6v7c0 3.31 2.69 6 6 6s6-2.69-6-6V8c0-3.31-2.69-6-6-6zm4 13h-8V8c0-2.21 1.79-4 4-4s4 1.79 4 4v7z"/></svg>
                        ) : (
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                        )}
                    </button>
                </div>

                <form onSubmit={handleSendAnswer} className="mt-4">
                    <button
                        type="submit"
                        disabled={isSendingAnswer || (!answer.trim() && !finalTranscript.trim()) || interviewCompleted || !interviewStarted}
                        onClick={isListening ? sendFinalTranscript : undefined}
                        className="w-full rounded-xl bg-slate-900 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isSendingAnswer ? "Transmitting..." : "Submit Answer"}
                    </button>
                </form>
            </div>
        </section>
    );
}
