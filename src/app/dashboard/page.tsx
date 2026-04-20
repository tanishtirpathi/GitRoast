"use client";

import { ApiError, apiFetch } from "@/libs/api";
import { useRouter } from "next/navigation";
import AISide from "@/Components/AISide";
import { useEffect, useRef, useState } from "react";
import DashboardHeader from "@/Components/Dashboard/DashboardHeader";
import CandidateBooth from "@/Components/Dashboard/CandidateBooth";

type MeResponse = {
    user?: {
        name?: string;
        email?: string;
        interviewStarted?: boolean;
        interviewCompleted?: boolean;
        interviewQuestionCount?: number;
    };
};

type StartChatResponse = {
    startingreply?: string;
    interviewCompleted?: boolean;
    questionCount?: number;
    maxQuestions?: number;
    error?: string;
};

type ChatResponse = {
    reply?: string;
    interviewCompleted?: boolean;
    questionCount?: number;
    maxQuestions?: number;
    error?: string;
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
    const [aiResponse, setAiResponse] = useState<string>("Welcome! Click \"Start Interview\" when you're ready to begin.");
    const [isStarting, setIsStarting] = useState(false);
    const [answer, setAnswer] = useState("");
    const [isSendingAnswer, setIsSendingAnswer] = useState(false);
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [interviewCompleted, setInterviewCompleted] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const [maxQuestions, setMaxQuestions] = useState(10);
    const [isListening, setIsListening] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState("");
    const [finalTranscript, setFinalTranscript] = useState("");
    const [voiceError, setVoiceError] = useState<string | null>(null);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const allowUnloadRef = useRef(false);
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
    const progressPercent = Math.min(100, Math.round((questionCount / maxQuestions) * 100));
    const interviewStatusLabel = interviewCompleted
        ? "Completed"
        : interviewStarted
            ? "In Progress"
            : "Awaiting Start";

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraEnabled(false);
    };

    const startCamera = async () => {
        if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
            setCameraError("Camera access is not supported in this browser.");
            return;
        }

        try {
            setCameraError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user",
                },
                audio: false,
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setCameraEnabled(true);
        } catch (error) {
            stopCamera();
            setCameraError(error instanceof Error ? error.message : "Unable to access camera.");
        }
    };

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

                setInterviewStarted(Boolean(data.user?.interviewStarted));
                setInterviewCompleted(Boolean(data.user?.interviewCompleted));
                setQuestionCount(data.user?.interviewQuestionCount ?? 0);
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
            stopCamera();
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    useEffect(() => {
        if (interviewCompleted) {
            stopListening();
            stopCamera();
            router.replace("/interview-complete");
        }
    }, [interviewCompleted, router]);

    useEffect(() => {
        if (isLoading || interviewCompleted) {
            return;
        }

        void startCamera();
    }, [isLoading, interviewCompleted]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (allowUnloadRef.current || interviewCompleted) {
                return;
            }

            event.preventDefault();
            event.returnValue = "";
        };

        const handleReloadShortcut = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            const isShortcutReload = (event.ctrlKey || event.metaKey) && key === "r";
            const isF5Reload = event.key === "F5";

            if ((!isShortcutReload && !isF5Reload) || interviewCompleted) {
                return;
            }

            event.preventDefault();

            const firstConfirm = window.confirm("Do you really want to reload this interview page?");
            if (!firstConfirm) {
                return;
            }

            const secondConfirm = window.confirm("Please confirm again. Reloading may interrupt your interview.");
            if (!secondConfirm) {
                return;
            }

            allowUnloadRef.current = true;
            window.location.reload();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("keydown", handleReloadShortcut);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("keydown", handleReloadShortcut);
        };
    }, [interviewCompleted]);

    const sendAnswerMessage = async (message: string) => {
        const trimmedAnswer = message.trim();
        if (!trimmedAnswer || isSendingAnswer || interviewCompleted || !interviewStarted) {
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

            const nextCount = data.questionCount ?? questionCount;
            const nextMax = data.maxQuestions ?? maxQuestions;
            const nextCompleted = Boolean(data.interviewCompleted);

            setQuestionCount(nextCount);
            setMaxQuestions(nextMax);
            setInterviewCompleted(nextCompleted);
            setInterviewStarted(!nextCompleted);

            if (nextCompleted) {
                setErrorMessage("Interview completed automatically after 10 questions.");
                stopListening();
            }
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                router.replace("/login");
                return;
            }

            if (error instanceof ApiError && error.status === 409) {
                const payload = (error.data ?? {}) as ChatResponse;
                setInterviewCompleted(Boolean(payload.interviewCompleted));
                setInterviewStarted(false);
                setQuestionCount(payload.questionCount ?? maxQuestions);
                setMaxQuestions(payload.maxQuestions ?? maxQuestions);
                stopListening();
            }

            setErrorMessage(error instanceof Error ? error.message : "Failed to send your answer.");
        } finally {
            setIsSendingAnswer(false);
        }
    };

    const handleStart = async () => {
        if (isStarting || isLoading || interviewStarted || interviewCompleted) {
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
            setInterviewStarted(true);
            setInterviewCompleted(Boolean(data.interviewCompleted));
            setQuestionCount(data.questionCount ?? 1);
            setMaxQuestions(data.maxQuestions ?? maxQuestions);
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                console.log(error)
                router.replace("/login");
                return;
            }

            if (error instanceof ApiError && error.status === 409) {
                const payload = (error.data ?? {}) as StartChatResponse;
                setInterviewCompleted(Boolean(payload.interviewCompleted));
                setInterviewStarted(!Boolean(payload.interviewCompleted));
                setQuestionCount(payload.questionCount ?? questionCount);
                setMaxQuestions(payload.maxQuestions ?? maxQuestions);
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
        if (interviewCompleted || !interviewStarted) {
            setVoiceError("Start the interview first. Voice input is disabled after completion.");
            return;
        }

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
        <div className="dashboard-bg relative h-screen w-full overflow-hidden p-4">
            <main className="mx-auto h-full w-full max-w-[1600px] flex flex-col gap-4">
                <DashboardHeader
                    name={name}
                    isLoading={isLoading}
                    greeting={greeting}
                    handleStart={handleStart}
                    isStarting={isStarting}
                    interviewStarted={interviewStarted}
                    interviewCompleted={interviewCompleted}
                    interviewStatusLabel={interviewStatusLabel}
                    questionCount={questionCount}
                    maxQuestions={maxQuestions}
                    progressPercent={progressPercent}
                />

                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-7 h-full min-h-0">
                        <AISide responseText={aiResponse} />
                    </div>
                    <div className="lg:col-span-5 h-full min-h-0">
                        <CandidateBooth
                            videoRef={videoRef}
                            cameraEnabled={cameraEnabled}
                            cameraError={cameraError}
                            startCamera={startCamera}
                            stopCamera={stopCamera}
                            isListening={isListening}
                            answer={answer}
                            setAnswer={setAnswer}
                            finalTranscript={finalTranscript}
                            interimTranscript={interimTranscript}
                            startListening={startListening}
                            stopListening={stopListening}
                            handleSendAnswer={handleSendAnswer}
                            sendFinalTranscript={sendFinalTranscript}
                            isSendingAnswer={isSendingAnswer}
                            interviewStarted={interviewStarted}
                            interviewCompleted={interviewCompleted}
                            voiceError={voiceError}
                        />
                    </div>
                </div>

                {errorMessage && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-rose-100 bg-white/90 p-4 text-sm font-medium text-rose-600 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
                        <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                        {errorMessage}
                    </div>
                )}
            </main>
        </div>
    );
}

// REST OF THE FILE WAS DUPLICATED/INVALID AND REMOVED --
