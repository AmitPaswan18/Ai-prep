"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Mic,
    ChevronLeft,
    Volume2,
    Zap,
    Activity,
    Loader2,
    Headphones,
    CheckCircle2,
    X,
    SkipForward,
    Radio,
    HelpCircle,
    Trophy,
    AlertCircle,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import {
    interviewSessionApi,
    userApi,
    voiceApi,
    type InterviewSession,
    type InterviewResponse,
} from "@/lib/api";
import { useVoice } from "@/hooks/use-voice";

const PodcastInterviewPage = () => {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { getToken } = useAuth();
    const interviewId = params.id as string;

    const [session, setSession] = useState<InterviewSession | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [responses, setResponses] = useState<Map<string, InterviewResponse>>(new Map());
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [isAutoTransitioning, setIsAutoTransitioning] = useState(false);
    const [stage, setStage] = useState<"IDLE" | "LISTENING" | "TALKING" | "PROCESSING">("IDLE");
    const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
    const [statusText, setStatusText] = useState("Tap to Start");
    const [isGettingHint, setIsGettingHint] = useState(false);
    const [hintUsed, setHintUsed] = useState(false);
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);

    const sessionRef = useRef<InterviewSession | null>(null);
    const loadedRef = useRef(false);
    const responsesRef = useRef<Map<string, InterviewResponse>>(new Map());
    const currentAnswerRef = useRef("");
    const currentQuestionIndexRef = useRef(0);
    const questionStartTimeRef = useRef(Date.now());

    // Keep refs in sync
    useEffect(() => { responsesRef.current = responses; }, [responses]);
    useEffect(() => { currentAnswerRef.current = currentAnswer; }, [currentAnswer]);
    useEffect(() => { currentQuestionIndexRef.current = currentQuestionIndex; setHintUsed(false); }, [currentQuestionIndex]);
    useEffect(() => { questionStartTimeRef.current = questionStartTime; }, [questionStartTime]);

    const {
        connect: connectVoice,
        disconnect: disconnectVoice,
        isConnected: isVoiceConnected,
        isConnecting: isVoiceConnecting,
        transcript: liveTranscript,
        setTranscript,
        speak,
        isAiTalking,
    } = useVoice(interviewId, getToken);

    // ── Stage sync ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (isVoiceConnecting) {
            setStatusText("Syncing...");
            setStage("IDLE");
        } else if (isAiTalking) {
            setStage("TALKING");
            setStatusText("AI Speaking");
        } else if (isVoiceConnected) {
            setStage("LISTENING");
            setStatusText("Listening...");
        } else {
            setStage("IDLE");
            setStatusText("Tap to Start");
        }
    }, [isAiTalking, isVoiceConnected, isVoiceConnecting]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const saveCurrentResponse = useCallback(() => {
        const s = sessionRef.current;
        const idx = currentQuestionIndexRef.current;
        const currentQ = s?.questions?.[idx];
        if (!currentQ) return;
        const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
        const response: InterviewResponse = {
            questionId: currentQ.id,
            question: currentQ.question,
            answer: currentAnswerRef.current,
            timeSpent,
        };
        setResponses((prev) => {
            const next = new Map(prev);
            next.set(currentQ.id, response);
            responsesRef.current = next;
            return next;
        });
    }, []);

    const handleFinish = useCallback(async () => {
        if (submitting) return;
        try {
            setSubmitting(true);
            saveCurrentResponse();
            // Small delay to let state flush
            await new Promise(r => setTimeout(r, 100));
            const responsesArray = Array.from(responsesRef.current.values());
            await interviewSessionApi.submitSession(interviewId, responsesArray, getToken);
            await speak("Interview complete! Excellent work. Your performance report is now ready. Redirecting to your results.");
            router.push(`/results/${interviewId}`);
        } catch {
            toast({ title: "Sync Failed", description: "Redirecting to results...", variant: "destructive" });
            router.push(`/results/${interviewId}`);
        } finally {
            setSubmitting(false);
        }
    }, [submitting, saveCurrentResponse, interviewId, getToken, speak, router, toast]);

    const handleNext = useCallback(async () => {
        if (isAutoTransitioning || submitting) return;
        setIsAutoTransitioning(true);

        saveCurrentResponse();
        setCurrentAnswer("");
        setTranscript("");

        const s = sessionRef.current;
        const currentIdx = currentQuestionIndexRef.current;

        if (s && currentIdx < s.questions.length - 1) {
            // Move to next question
            const nextIndex = currentIdx + 1;
            setCurrentQuestionIndex(nextIndex);
            setQuestionStartTime(Date.now());
            setIsAutoTransitioning(false);
            // Speak next question
            await speak(s.questions[nextIndex].question);
        } else {
            // This IS the last question — finish the session
            setIsAutoTransitioning(false);
            await handleFinish();
        }
    }, [isAutoTransitioning, submitting, saveCurrentResponse, speak, handleFinish, setTranscript]);

    // ── Help: get AI hint and speak it ────────────────────────────────────────
    const handleHelp = useCallback(async () => {
        const s = sessionRef.current;
        const currentQ = s?.questions?.[currentQuestionIndexRef.current];
        if (!currentQ || isGettingHint || isAiTalking) return;

        try {
            setIsGettingHint(true);
            setHintUsed(true);
            const { hint } = await voiceApi.getHint(currentQ.question, currentAnswerRef.current || undefined, getToken);
            await speak(hint);
        } catch (err: any) {
            toast({ title: "Hint Failed", description: err.message || "Could not generate hint.", variant: "destructive" });
        } finally {
            setIsGettingHint(false);
        }
    }, [isGettingHint, isAiTalking, speak, getToken, toast]);

    // ── Load session ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!interviewId || loadedRef.current) return;
        loadedRef.current = true;

        const loadSession = async () => {
            try {
                setLoading(true);
                const settings = await userApi.getSettings(getToken);
                if (!settings.isElevenLabsConfigured) {
                    setIsConfigured(false);
                    return;
                }
                setIsConfigured(true);

                let sessionData = await interviewSessionApi.getSession(interviewId, getToken);
                if (!sessionData.questions?.length || sessionData.interview.isTemplate) {
                    const newSession = await interviewSessionApi.startSession(interviewId, undefined, getToken);
                    if (newSession.interview.id !== interviewId) {
                        router.replace(`/interviews/podcast/${newSession.interview.id}`);
                        return;
                    }
                    sessionData = newSession;
                }
                setSession(sessionData);
                sessionRef.current = sessionData;

                // Connect voice, then greet + read Q1
                setTimeout(async () => {
                    await speak(
                        "Welcome to Podcast Mode. I'll read each question aloud. Answer at your own pace, then tap Next to continue. You can also tap the Help button for a hint at any time. Let's begin."
                    );
                    if (sessionData.questions?.[0]) {
                        await speak(sessionData.questions[0].question);
                    }
                }, 800);
            } catch (err: any) {
                toast({
                    title: "Initialization Failed",
                    description: err.message || "Could not start the podcast session.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        loadSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interviewId]);

    // ── Transcript sync ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!liveTranscript) return;
        setCurrentAnswer(liveTranscript);
        const lower = liveTranscript.toLowerCase();
        if (liveTranscript.length > 20) {
            if (lower.includes("next question") || lower.includes("move on") || lower.includes("proceed")) {
                handleNext();
            }
            // Only trigger finish via voice if explicitly saying finish
            if (lower.includes("finish interview") || lower.includes("end interview")) {
                handleFinish();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [liveTranscript]);

    // ── Screens ───────────────────────────────────────────────────────────────
    if (isConfigured === false) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center gap-8">
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center">
                    <Zap className="h-9 w-9 text-red-400" />
                </div>
                <div className="space-y-3 max-w-sm">
                    <h2 className="text-xl font-bold text-white tracking-tight">ElevenLabs Key Required</h2>
                    <p className="text-white/50 text-sm leading-relaxed">
                        Podcast Mode needs an ElevenLabs API key to synthesise speech. Add it in Settings to continue.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => router.push("/dashboard/settings")} className="gradient-primary shadow-glow font-bold text-xs uppercase tracking-wider h-11 px-6 rounded-xl">
                        Open Settings
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/interviews")} className="border-white/10 text-white/60 hover:bg-white/5 font-bold text-xs uppercase tracking-wider h-11 px-6 rounded-xl">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-28 h-28 rounded-full border-2 border-primary/20 animate-[spin_3s_linear_infinite]" />
                    <Headphones className="absolute inset-0 m-auto h-11 w-11 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-primary/70 font-bold tracking-[0.25em] uppercase text-xs">Initializing Podcast Session</p>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest animate-pulse">Warming up neural synthesiser...</p>
                </div>
            </div>
        );
    }

    const totalQuestions = session?.questions?.length ?? 0;
    const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    const currentQuestion = session?.questions?.[currentQuestionIndex];

    return (
        <div className="h-[100dvh] bg-[#080808] text-white flex flex-col overflow-hidden select-none">

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <header className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/5">
                <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 hover:bg-white/10 h-9 w-9" onClick={() => router.push("/interviews")}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                    <Radio className="h-3 w-3 text-primary animate-pulse" />
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Podcast Mode</span>
                </div>
                <div className="flex items-center gap-3">
                    {isLastQuestion && (
                        <span className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-widest animate-pulse">
                            Last Question
                        </span>
                    )}
                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                        {currentQuestionIndex + 1} / {totalQuestions}
                    </span>
                </div>
            </header>

            {/* ── Progress bar ────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 h-0.5 bg-white/5">
                <motion.div
                    className="h-full bg-primary/60"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                />
            </div>

            {/* ── Main ────────────────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-between p-6 md:p-8 min-h-0 gap-5 overflow-hidden">

                {/* Question */}
                <div className="w-full max-w-2xl text-center flex-shrink-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.35 }}
                            className="space-y-3"
                        >
                            <motion.p
                                className="text-base md:text-lg lg:text-xl font-semibold leading-relaxed text-white/90"
                            >
                                <span className="text-primary/60 font-bold mr-2">{currentQuestionIndex + 1}.</span>
                                {currentQuestion?.question}
                            </motion.p>
                            {/* Help button for podcast mode — inline with question */}
                            <div className="flex items-center justify-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isGettingHint || isAiTalking || submitting}
                                    onClick={handleHelp}
                                    className={`h-8 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-1.5 transition-all ${hintUsed
                                        ? "text-amber-400/60 hover:bg-amber-500/5"
                                        : "text-white/30 hover:bg-white/5 hover:text-amber-400/80"
                                        }`}
                                    title="Get an AI hint spoken aloud"
                                >
                                    {isGettingHint ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <HelpCircle className="h-3 w-3" />
                                    )}
                                    {isGettingHint ? "Getting hint..." : hintUsed ? "Hint Used" : "Need a Hint?"}
                                </Button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Central Orb */}
                <div className="flex-1 flex items-center justify-center relative min-h-0 w-full">
                    {/* Ambient glow */}
                    <motion.div
                        className="absolute w-72 h-72 rounded-full blur-3xl pointer-events-none"
                        animate={{
                            backgroundColor:
                                stage === "TALKING" ? "rgba(139,92,246,0.15)" :
                                    stage === "LISTENING" ? "rgba(16,185,129,0.12)" :
                                        "rgba(255,255,255,0.03)",
                            scale: stage !== "IDLE" ? [1, 1.08, 1] : 1,
                        }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                    />

                    {/* Pulsing rings */}
                    <AnimatePresence>
                        {(stage === "TALKING" || stage === "LISTENING") && (
                            <>
                                <motion.div
                                    key="ring1"
                                    initial={{ scale: 1, opacity: 0.3 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                                    className={`absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border ${stage === "TALKING" ? "border-primary/40" : "border-emerald-500/40"}`}
                                />
                                <motion.div
                                    key="ring2"
                                    initial={{ scale: 1, opacity: 0.2 }}
                                    animate={{ scale: 1.85, opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                                    className={`absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border ${stage === "TALKING" ? "border-primary/20" : "border-emerald-500/20"}`}
                                />
                            </>
                        )}
                    </AnimatePresence>

                    {/* Orb button — tap to connect, NOT to trigger next */}
                    <Button
                        disabled={isVoiceConnecting || submitting}
                        onClick={() => {
                            if (!isVoiceConnected) connectVoice();
                        }}
                        className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-500 border-2 overflow-hidden ${stage === "TALKING"
                            ? "bg-primary/15 border-primary/60 shadow-[0_0_40px_rgba(139,92,246,0.3)]"
                            : stage === "LISTENING"
                                ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                                : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"
                            }`}
                    >
                        {isVoiceConnecting ? (
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        ) : stage === "TALKING" ? (
                            <Volume2 className="h-10 w-10 text-primary" />
                        ) : stage === "LISTENING" ? (
                            <Mic className="h-10 w-10 text-emerald-400 animate-pulse" />
                        ) : (
                            <Headphones className="h-10 w-10 text-white/30" />
                        )}
                        <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${stage === "TALKING" ? "text-primary/70" : stage === "LISTENING" ? "text-emerald-400/70" : "text-white/30"}`}>
                            {statusText}
                        </span>
                    </Button>
                </div>

                {/* Bottom panel */}
                <div className="w-full max-w-lg flex flex-col items-center gap-4 flex-shrink-0">

                    {/* Transcript card */}
                    <div className="w-full rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm px-4 py-3 min-h-[88px] max-h-[104px] flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/25">
                                <span className={`w-1.5 h-1.5 rounded-full ${stage === "LISTENING" ? "bg-emerald-500 animate-pulse" : "bg-white/15"}`} />
                                Live Transcript
                            </span>
                            <span className="text-[8px] text-white/15 font-medium uppercase tracking-wider">Deepgram STT</span>
                        </div>
                        <div className="flex-1 flex items-center overflow-hidden">
                            <AnimatePresence mode="wait">
                                {currentAnswer ? (
                                    <motion.p
                                        key="transcript"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-xs sm:text-sm text-white/75 italic leading-relaxed line-clamp-2"
                                    >
                                        &ldquo;{currentAnswer}&rdquo;
                                    </motion.p>
                                ) : (
                                    <motion.p key="placeholder" className="text-[11px] text-white/20 italic">
                                        {isVoiceConnected ? "Your answer will appear here as you speak..." : "Connect microphone to start transcription"}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3 w-full justify-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 rounded-xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/60 flex-shrink-0"
                            onClick={() => disconnectVoice()}
                            title="Disconnect microphone"
                        >
                            <X className="h-4 w-4" />
                        </Button>

                        <Button
                            disabled={submitting || isAutoTransitioning}
                            onClick={handleNext}
                            className={`flex-1 h-12 px-8 rounded-[1rem] font-bold uppercase tracking-widest text-xs group transition-all ${isLastQuestion
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                : "gradient-primary shadow-glow"
                                }`}
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isLastQuestion ? (
                                <><Trophy className="mr-2 h-3.5 w-3.5" /> Finish Interview</>
                            ) : (
                                <>Next <SkipForward className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={isGettingHint || isAiTalking || submitting}
                            className={`h-11 w-11 rounded-xl flex-shrink-0 transition-all ${hintUsed
                                ? "bg-amber-500/10 text-amber-400/60 hover:bg-amber-500/15"
                                : "bg-white/5 hover:bg-amber-500/10 text-white/30 hover:text-amber-400"
                                }`}
                            onClick={handleHelp}
                            title="Get AI hint (spoken aloud)"
                        >
                            {isGettingHint ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <HelpCircle className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Footer hint */}
                    <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-[0.18em] text-white/15">
                        <span className="flex items-center gap-1.5"><Activity className="h-2.5 w-2.5" /> Smart Audio</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5"><Zap className="h-2.5 w-2.5" /> Real-time STT</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5"><HelpCircle className="h-2.5 w-2.5" /> AI Hints</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PodcastInterviewPage;
