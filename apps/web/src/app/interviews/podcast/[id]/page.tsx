"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
    Mic, 
    MicOff, 
    ChevronLeft, 
    Volume2, 
    Zap, 
    Activity, 
    Loader2, 
    Headphones,
    CheckCircle2,
    X,
    SkipForward
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { 
    interviewSessionApi, 
    userApi,
    type InterviewSession, 
    type InterviewResponse 
} from "@/lib/api";
import { useVoice } from "@/hooks/use-voice";
import { Badge } from "@/components/ui/badge";

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
    const [stage, setStage] = useState<'IDLE' | 'LISTENING' | 'TALKING' | 'PROCESSING'>('IDLE');
    const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

    const {
        connect: connectVoice,
        disconnect: disconnectVoice,
        isConnected: isVoiceConnected,
        isConnecting: isVoiceConnecting,
        transcript: liveTranscript,
        setTranscript,
        speak,
        isAiTalking
    } = useVoice(interviewId, getToken);

    // Handle Stage transitions
    useEffect(() => {
        if (isAiTalking) {
            setStage('TALKING');
        } else if (isVoiceConnected) {
            setStage('LISTENING');
        } else {
            setStage('IDLE');
        }
    }, [isAiTalking, isVoiceConnected]);

    // 1. Define helper functions first (hoisting fix)
    const handlePlayQuestion = useCallback((index: number, sessionData: InterviewSession | null) => {
        const q = sessionData?.questions?.[index];
        if (q) {
            speak(q.question);
        }
    }, [speak]);

    const saveCurrentResponse = useCallback(() => {
        const currentQ = session?.questions?.[currentQuestionIndex];
        if (!currentQ) return;
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
        const response: InterviewResponse = {
            questionId: currentQ.id,
            question: currentQ.question,
            answer: currentAnswer,
            timeSpent,
        };
        setResponses(prev => new Map(prev.set(currentQ.id, response)));
    }, [session, currentQuestionIndex, questionStartTime, currentAnswer]);

    const handleFinish = useCallback(async () => {
        try {
            setSubmitting(true);
            saveCurrentResponse();
            const responsesArray = Array.from(responses.values());
            await interviewSessionApi.submitSession(interviewId, responsesArray, getToken);
            speak("Interview complete. Your results are ready.");
            setTimeout(() => {
                router.push(`/results/${interviewId}`);
            }, 3000);
        } catch (err: any) {
            toast({
                title: "Sync Failed",
                description: "Recording saved locally. Redirecting to results...",
                variant: "destructive"
            });
            router.push(`/results/${interviewId}`);
        } finally {
            setSubmitting(false);
        }
    }, [saveCurrentResponse, responses, interviewId, getToken, speak, router, toast]);

    const handleNext = useCallback(async () => {
        if (isAutoTransitioning) return;
        
        setIsAutoTransitioning(true);
        saveCurrentResponse();
        setCurrentAnswer("");
        setTranscript("");
        
        if (session && currentQuestionIndex < session.questions.length - 1) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            setQuestionStartTime(Date.now());
            handlePlayQuestion(nextIndex, session);
        } else {
            // End of interview
            await handleFinish();
        }
        setIsAutoTransitioning(false);
    }, [isAutoTransitioning, saveCurrentResponse, session, currentQuestionIndex, handlePlayQuestion, handleFinish, setTranscript]);

    // 2. Load session and check configuration
    useEffect(() => {
        const loadSession = async () => {
            try {
                setLoading(true);
                
                // Check ElevenLabs configuration FIRST
                const settings = await userApi.getSettings(getToken);
                if (!settings.isElevenLabsConfigured) {
                    setIsConfigured(false);
                    setLoading(false);
                    return;
                }
                setIsConfigured(true);

                let sessionData = await interviewSessionApi.getSession(interviewId, getToken);
                if (!sessionData.questions || sessionData.questions.length === 0 || sessionData.interview.isTemplate) {
                    const newSession = await interviewSessionApi.startSession(interviewId, getToken);
                    if (newSession.interview.id !== interviewId) {
                        router.replace(`/interviews/podcast/${newSession.interview.id}`);
                        return;
                    }
                    sessionData = newSession;
                }
                setSession(sessionData);
                
                // Greeting & First Question
                setTimeout(() => {
                    speak("Welcome to Podcast Mode. I will read the questions to you. When you are done answering, tap the center of your screen to proceed to the next question. Let's begin.");
                    setTimeout(() => {
                        handlePlayQuestion(0, sessionData);
                    }, 8000);
                }, 1000);
                
            } catch (err: any) {
                toast({
                    title: "Initialization Failed",
                    description: err.message || "Could not start the podcast session.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };
        if (interviewId) loadSession();
    }, [interviewId, getToken, toast, speak, handlePlayQuestion, router]);

    // 3. Sync transcript
    useEffect(() => {
        if (liveTranscript) {
            const lowerTranscript = liveTranscript.toLowerCase();
            setCurrentAnswer(liveTranscript);

            // Hands-free Voice Commands
            if (lowerTranscript.includes("next question") || lowerTranscript.includes("proceed")) {
                if (liveTranscript.length > 20) { // Avoid accidental triggers
                    handleNext();
                }
            }
            if (lowerTranscript.includes("finish interview") || lowerTranscript.includes("i'm done")) {
                handleFinish();
            }
        }
    }, [liveTranscript, handleNext, handleFinish]);

    if (isConfigured === false) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center space-y-8">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
                        <Zap className="h-10 w-10 text-destructive" />
                    </div>
                </div>
                <div className="space-y-4 max-w-md">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">API Key Required</h2>
                    <p className="text-white/60 text-sm leading-relaxed">
                        To use the Podcast Mode voice features, you need to provide an ElevenLabs API key in your account settings.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                    <Button 
                        onClick={() => router.push('/dashboard/settings')}
                        className="flex-1 bg-white text-black hover:bg-white/90 font-bold uppercase tracking-wider text-xs h-12"
                    >
                        Go to Settings
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => router.push('/interviews')}
                        className="flex-1 border-white/20 text-white hover:bg-white/5 font-bold uppercase tracking-wider text-xs h-12"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-2 border-primary/20 animate-[spin_3s_linear_infinite]" />
                    <Headphones className="absolute inset-0 m-auto h-12 w-12 text-primary animate-pulse" />
                </div>
                <p className="text-primary/60 font-medium tracking-[0.2em] uppercase text-xs">Initializing Podcast Environment</p>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] bg-black text-white flex flex-col touch-none overflow-hidden select-none relative">
            
            {/* Minimal Header */}
            <header className="p-4 flex items-center justify-between z-50">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full bg-white/5 hover:bg-white/10"
                    onClick={() => router.push('/interviews')}
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div className="flex flex-col items-end">
                    <Badge variant="outline" className="border-white/20 text-white/40 uppercase text-[10px] tracking-widest font-bold">
                        Podcast Mode
                    </Badge>
                    <span className="text-[10px] font-bold text-primary tracking-tighter mt-1 uppercase">
                        Question {currentQuestionIndex + 1} / {session?.questions?.length}
                    </span>
                </div>
            </header>

            {/* Main Interactive Zone */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative min-h-0">
                
                {/* Background Visualizer */}
                <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
                    <motion.div 
                        animate={{ 
                            scale: stage === 'TALKING' || stage === 'LISTENING' ? [1, 1.2, 1.1, 1.3, 1] : 1,
                            opacity: stage === 'TALKING' || stage === 'LISTENING' ? [0.1, 0.3, 0.2, 0.4, 0.1] : 0.05
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] border border-primary/30 rounded-full blur-3xl bg-primary/10"
                    />
                </div>

                {/* Central Focus Ring */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center"
                    onClick={() => !isVoiceConnected && connectVoice()}
                >
                    {/* Pulsing Outer Rings */}
                    <AnimatePresence>
                        {(stage === 'TALKING' || stage === 'LISTENING') && (
                            <>
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                    className="absolute inset-0 border-2 border-primary/40 rounded-full"
                                />
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1.8, opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                                    className="absolute inset-0 border border-primary/20 rounded-full"
                                />
                            </>
                        )}
                    </AnimatePresence>

                    {/* Main Interaction Button */}
                    <Button 
                        disabled={isVoiceConnecting || submitting}
                        onClick={() => {
                            if (!isVoiceConnected) connectVoice();
                            else if (stage === 'LISTENING') handleNext();
                        }}
                        className={`w-full h-full rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-700 relative overflow-hidden ${
                            stage === 'TALKING' ? 'bg-primary/20 border-primary shadow-glow' :
                            stage === 'LISTENING' ? 'bg-emerald-500/10 border-emerald-500/50' : 
                            'bg-white/5 border-white/10 hover:bg-white/10'
                        } border-2`}
                    >
                        {isVoiceConnecting ? (
                            <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        ) : stage === 'TALKING' ? (
                            <Volume2 className="h-20 w-20 text-primary" />
                        ) : stage === 'LISTENING' ? (
                            <Mic className="h-20 w-20 text-emerald-500 animate-pulse" />
                        ) : (
                            <Headphones className="h-20 w-20 text-white/50" />
                        )}
                        
                        <div className="absolute bottom-16 text-center space-y-1">
                            <p className="text-xs font-bold uppercase tracking-[0.3em] font-display">
                                {isVoiceConnecting ? 'Syncing...' :
                                 stage === 'TALKING' ? 'AI Interviewer' :
                                 stage === 'LISTENING' ? (currentAnswer.length > 10 ? 'Tap to Submit' : 'Listening...') : 
                                 'Tap to Start'}
                            </p>
                            {stage === 'LISTENING' && currentAnswer.length > 0 && (
                                <p className="text-[10px] text-emerald-500/50 font-medium px-8 truncate max-w-[200px]">
                                    {currentAnswer}
                                </p>
                            )}
                        </div>
                    </Button>
                </motion.div>

                {/* Question Display (Subtle) */}
                <div className="mt-8 md:mt-16 text-center max-w-xl mx-auto space-y-4 md:space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.h2 
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xl md:text-2xl font-bold font-display leading-relaxed opacity-80"
                        >
                            {currentQuestionIndex + 1}. {session?.questions?.[currentQuestionIndex]?.question}
                        </motion.h2>
                    </AnimatePresence>
                </div>

            </main>

            {/* Bottom Interaction Controls */}
            <footer className="p-6 md:p-12 flex flex-col items-center gap-6 md:gap-8">
                <div className="flex items-center gap-3 md:gap-4">
                    <Button 
                        variant="ghost" 
                        size="lg" 
                        className="rounded-xl md:rounded-2xl h-14 w-14 md:h-16 md:w-16 bg-white/5 hover:bg-white/10 text-white/40"
                        onClick={() => disconnectVoice()}
                    >
                        <X className="h-5 w-5 md:h-6 md:w-6" />
                    </Button>
                    
                    <Button 
                        disabled={submitting}
                        onClick={handleNext}
                        className="h-16 md:h-20 px-8 md:px-12 rounded-[1.5rem] md:rounded-[2rem] gradient-primary shadow-glow font-bold uppercase tracking-widest text-xs md:text-sm group"
                    >
                        Next <SkipForward className="ml-2 md:ml-3 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <Button 
                         variant="ghost" 
                         size="lg" 
                         className="rounded-xl md:rounded-2xl h-14 w-14 md:h-16 md:w-16 bg-white/5 hover:bg-white/10 text-white/40"
                         onClick={handleFinish}
                     >
                         <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
                     </Button>
                </div>
                
                <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                    <div className="flex items-center gap-2">
                        <Activity className="h-3 w-3" /> Smart Audio Optimization
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3" /> Real-time Analytics
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PodcastInterviewPage;
