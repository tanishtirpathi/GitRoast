"use client";

import { ApiError, apiFetch } from "@/libs/api";
import { useRouter } from "next/navigation";
import AISide from "@/Components/AISide";
import { useEffect, useRef, useState } from "react";

type MeResponse = {
    user?: {
        name?: string;
        email?: string;
    };
};

type StartChatResponse = {
    startingreply?: string;
};

type ChatResponse = {
    reply?: string;
};

type SpeechRecognitionAlternativeLike = {
    transcript: string;
};

type SpeechRecognitionResultLike = {
    isFinal: boolean;
    0: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = {
    resultIndex: number;
    results: ArrayLike<SpeechRecognitionResultLike>;
};

type BrowserSpeechRecognition = {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onerror: ((event: { error?: string }) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
};

type SpeechRecognitionWindow = Window & {
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    SpeechRecognition?: new () => BrowserSpeechRecognition;
};

export default function DashboardPage() {
    const router = useRouter();
    const [name, setName] = useState<string>("User");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [aiResponse, setAiResponse] = useState<string>("Tap Start to get your first AI question.");
    const [isStarting, setIsStarting] = useState(false);
    const [answer, setAnswer] = useState("");
    const [isSendingAnswer, setIsSendingAnswer] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState("");
    const [finalTranscript, setFinalTranscript] = useState("");
    const [voiceError, setVoiceError] = useState<string | null>(null);
    const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

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

    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const sendAnswerMessage = async (message: string) => {
        const trimmedAnswer = message.trim();
        if (!trimmedAnswer || isSendingAnswer) {
            return;
        }

        setIsSendingAnswer(true);
        setErrorMessage(null);

        try {
            const data = await apiFetch<ChatResponse>("/api/ai/chat", {
                method: "POST",
                body: JSON.stringify({ message: trimmedAnswer }),
            });

            const nextReply = data.reply?.trim();
            const resolvedReply = nextReply || "AI responded with an empty message.";
            setAiResponse(resolvedReply);
            speakAIData(resolvedReply);
            setAnswer("");
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                router.replace("/login");
                return;
            }

            setErrorMessage(error instanceof Error ? error.message : "Failed to send your answer.");
        } finally {
            setIsSendingAnswer(false);
        }
    };

    const handleStart = async () => {
        if (isStarting) {
            return;
        }

        setIsStarting(true);
        setErrorMessage(null);

        try {
            const data = await apiFetch<StartChatResponse>("/api/ai/start", {
                method: "POST",
            });

            const nextReply = data.startingreply?.trim();
            const resolvedReply = nextReply || "AI started, but no question was returned.";
            setAiResponse(resolvedReply);
            speakAIData(resolvedReply);
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                console.log(error)
                router.replace("/login");
                return;
            }

            console.log(error);
            setErrorMessage(error instanceof Error ? error.message : "Failed to start AI chat.");
        } finally {
            setIsStarting(false);
        }
    };

    const handleSendAnswer = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await sendAnswerMessage(answer);
    };

    const startListening = () => {
        if (typeof window === "undefined") {
            setVoiceError("Voice recognition is not available in this environment.");
            return;
        }

        const speechWindow = window as SpeechRecognitionWindow;
        const RecognitionCtor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

        if (!RecognitionCtor) {
            setVoiceError("This browser does not support speech recognition.");
            return;
        }

        setVoiceError(null);
        setInterimTranscript("");
        setFinalTranscript("");

        const recognition = new RecognitionCtor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            let liveText = "";
            let committedText = "";

            for (let index = event.resultIndex; index < event.results.length; index += 1) {
                const result = event.results[index];
                const text = result[0]?.transcript ?? "";

                if (result.isFinal) {
                    committedText += `${text} `;
                } else {
                    liveText += text;
                }
            }

            if (committedText) {
                setFinalTranscript((previous) => `${previous} ${committedText}`.trim());
            }

            setInterimTranscript(liveText.trim());
        };

        recognition.onerror = (event) => {
            setVoiceError(event.error ? `Voice error: ${event.error}` : "Voice recognition failed.");
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimTranscript("");
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    const sendFinalTranscript = async () => {
        const payload = `${finalTranscript} ${interimTranscript}`.trim();
        if (!payload || isSendingAnswer) {
            return;
        }

        setAnswer(payload);
        await sendAnswerMessage(payload);
        setFinalTranscript("");
        setInterimTranscript("");
    };

    const speakAIData = (aiResponse: string) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            return;
        }

        if (!aiResponse) {
            return;
        }
        const speech = new SpeechSynthesisUtterance(aiResponse);
        speech.lang = "en-US";
        speech.pitch = 1.2;
        speech.rate = 1.1;
        speech.volume = 1;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
    };


    return (
        <div className="dashboard-bg relative min-h-screen w-full overflow-hidden px-4 py-8 sm:px-8">
            <div className="dashboard-orb dashboard-orb-a" />
            <div className="dashboard-orb dashboard-orb-b" />

            <main className="relative mx-auto w-full max-w-6xl">
                <section className="dashboard-reveal rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(11,23,56,0.14)] backdrop-blur-sm sm:p-10">
                    <header className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Control Center</p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Dashboard</h1>
                            {!isLoading && !errorMessage ? (
                                <p className="mt-3 text-base text-slate-700">
                                    {greeting}, <span className="font-semibold text-slate-900">{name}</span>.
                                </p>
                            ) : null}
                        </div>

                        <button
                            type="button"
                            onClick={handleStart}
                            disabled={isStarting || isLoading}
                            className="rounded-2xl border border-slate-300 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isStarting ? "Starting..." : "Start"}
                        </button>
                    </header>

                    {errorMessage ? (
                        <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {errorMessage}
                        </p>
                    ) : null}

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        <AISide responseText={aiResponse} />
                        <section className="dashboard-reveal rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6 shadow-[0_16px_48px_rgba(2,32,71,0.1)]">
                            <div className="mb-5 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Your Side</p>
                                <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                                    Reply
                                </span>
                            </div>

                            <h2 className="text-xl font-semibold text-slate-900">Send Your Answer</h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                Speak your answer with the mic or type manually as fallback.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={startListening}
                                    disabled={isListening || isSendingAnswer || isLoading}
                                    className="rounded-2xl border border-emerald-300 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isListening ? "Listening..." : "Start Mic"}
                                </button>

                                <button
                                    type="button"
                                    onClick={stopListening}
                                    disabled={!isListening}
                                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Stop Mic
                                </button>

                                <button
                                    type="button"
                                    onClick={sendFinalTranscript}
                                    disabled={!`${finalTranscript} ${interimTranscript}`.trim() || isSendingAnswer || isLoading}
                                    className="rounded-2xl border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSendingAnswer ? "Sending..." : "Send Voice Transcript"}
                                </button>
                            </div>

                            <div className="mt-4 space-y-3 text-sm">
                                <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700">
                                    <span className="font-semibold">Live:</span> {interimTranscript || "Listening output will appear here..."}
                                </p>
                                <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700">
                                    <span className="font-semibold">Final:</span> {finalTranscript || "Final transcript will appear here..."}
                                </p>
                                {voiceError ? (
                                    <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">{voiceError}</p>
                                ) : null}
                            </div>

                            <form onSubmit={handleSendAnswer} className="mt-5 space-y-4">
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(event) => setAnswer(event.target.value)}
                                    placeholder="Type your answer here..."
                                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500"
                                    disabled={isSendingAnswer || isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!answer.trim() || isSendingAnswer || isLoading}
                                    className="w-full rounded-2xl border border-slate-300 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSendingAnswer ? "Sending..." : "Send Answer"}
                                </button>
                            </form>
                        </section>
                    </div>
                </section>
            </main>
        </div>
    );
}