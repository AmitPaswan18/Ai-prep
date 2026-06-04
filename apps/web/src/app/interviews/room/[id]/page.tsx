"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Clock,
  ChevronLeft,
  ChevronRight,
  Brain,
  Sparkles,
  Loader2,
  AlertCircle,
  Timer,
  CheckCircle2,
  Activity,
  Zap,
  User,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import {
  interviewSessionApi,
  type InterviewSession,
  type InterviewResponse,
} from "@/lib/api";
import Navbar from "@/components/layout/Navbar";

const InterviewRoomPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { getToken } = useAuth();
  const interviewId = params.id as string;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Map<string, InterviewResponse>>(new Map());
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        let sessionData = await interviewSessionApi.getSession(interviewId, getToken);

        if (!sessionData.questions || sessionData.questions.length === 0 || sessionData.interview.isTemplate) {
          console.log("[Room] Starting fresh session (cloning if needed)");
          const newSession = await interviewSessionApi.startSession(interviewId, undefined, getToken);
          if (newSession.interview.id !== interviewId) {
            router.replace(`/interviews/room/${newSession.interview.id}`);
            return;
          }
          sessionData = newSession;
        }
        setSession(sessionData);
        setQuestionStartTime(Date.now());
        setTotalDuration((sessionData.interview.duration || 30) * 60);
      } catch (err: any) {
        setError(err.message || "Failed to load interview session");
      } finally {
        setLoading(false);
      }
    };
    if (interviewId) loadSession();
  }, [interviewId, getToken, router]);

  // Auto-scroll textarea to bottom when answer updates
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [currentAnswer]);

  useEffect(() => {
    if (!session || totalDuration === 0) return;
    const timer = setInterval(() => {
      setTotalTimeElapsed((prev) => {
        const newTime = prev + 1;
        if (newTime >= totalDuration) {
          clearInterval(timer);
          handleFinishInterview(true);
          return totalDuration;
        }
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [session, totalDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const saveCurrentResponse = () => {
    const currentQ = session?.questions?.[currentQuestionIndex];
    if (!currentQ) return;
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const response: InterviewResponse = {
      questionId: currentQ.id,
      question: currentQ.question,
      answer: currentAnswer,
      timeSpent,
    };
    setResponses(new Map(responses.set(currentQ.id, response)));
  };

  const handleNextQuestion = () => {
    saveCurrentResponse();
    setCurrentAnswer("");
    if (session && currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleFinishInterview = async (autoSubmit = false) => {
    try {
      setSubmitting(true);
      saveCurrentResponse();
      const responsesArray = Array.from(responses.values());
      await interviewSessionApi.submitSession(interviewId, responsesArray, getToken);
      router.push(`/results/${interviewId}`);
    } catch (err: any) {
      if (!autoSubmit) {
        toast({
          title: "Submission Error",
          description: err.message || "Failed to synchronize interview results.",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-full border-t-2 border-primary animate-spin mb-6" />
        <p className="text-muted-foreground font-display text-lg animate-pulse">Setting up your interview session...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sync Error</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">{error || "Failed to load session."}</p>
        <Button size="lg" className="rounded-2xl" onClick={() => router.push("/dashboard")}>Return to Base</Button>
      </div>
    );
  }

  const currentQuestion = session?.questions?.[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (session?.questions?.length || 1)) * 100;
  const timeRemaining = Math.max(0, totalDuration - totalTimeElapsed);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.2);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.4);
        }
      `}} />

      {/* Top Bar - Session Status */}
      <div className="py-2 px-4 md:px-6 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto py-1 flex items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-muted rounded-xl border border-border">
              <Brain className="h-4.5 w-4.5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h2 className="font-bold tracking-tight text-sm md:text-base">{session?.interview?.title}</h2>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                <span className="text-primary/70">{session?.interview?.category}</span>
                <span className="opacity-20">•</span>
                <span>{session?.interview?.difficulty}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-xs px-6 hidden md:block">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              <span>Phase Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full gradient-primary shadow-glow"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Time Remaining</p>
              <p className={`font-mono text-lg font-bold tracking-tighter ${timeRemaining < 60 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
                {formatTime(timeRemaining)}
              </p>
            </div>
            <Button variant="ghost" className="rounded-xl h-10 px-4 text-sm border border-border/50 hover:bg-muted" onClick={() => router.push('/dashboard')}>
              Exit
            </Button>
          </div>
        </div>
      </div>

      {/* Main Studio Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-4 md:py-5 grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">

        {/* Left Phase - Instructions & Guide */}
        <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
          <Card className="rounded-2xl border-border/50 bg-muted/30 backdrop-blur-sm overflow-hidden p-4 md:p-5 lg:sticky lg:top-20">
            <div className="relative h-36 sm:h-40 w-full rounded-xl bg-gradient-to-br from-primary/10 via-background to-accent/5 flex flex-col items-center justify-center p-6 text-center mb-3 shadow-soft border border-border/30">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-sm">Standard Interview Mode</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Read the questions on the right and type your structured replies.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/50 border border-border/30">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-primary" />
                  <span className="text-xs font-semibold">Session Mode</span>
                </div>
                <span className="text-[9px] font-bold text-primary italic uppercase tracking-widest">Text Response</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/50 border border-border/30">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-accent" />
                  <span className="text-xs font-semibold">Evaluation Engine</span>
                </div>
                <span className="text-[9px] font-bold text-accent italic uppercase tracking-widest">Active</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Phase - Human Interaction */}
        <div className="lg:col-span-3 space-y-4 order-1 lg:order-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[8px] md:text-[9px]">
                  <Sparkles className="h-2.5 w-2.5" /> Question {currentQuestionIndex + 1}
                </div>
                <h1 className="text-lg md:text-xl font-bold font-display leading-[1.2]">
                  {currentQuestion?.question}
                </h1>
              </div>

              <div className="relative group">
                <Textarea
                  ref={textareaRef}
                  placeholder="Type your structured answer here. Take your time..."
                  className="min-h-[160px] md:min-h-[220px] rounded-xl p-3 md:p-4 text-sm border-border/50 bg-muted/10 group-focus-within:bg-background group-focus-within:shadow-elevated transition-all resize-none leading-relaxed custom-scrollbar"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                />

                <div className="absolute bottom-2.5 right-3.5 flex justify-end items-center">
                  <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest">{currentAnswer.length} Chars</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                {currentQuestionIndex < (session?.questions?.length || 0) - 1 ? (
                  <Button
                    size="lg"
                    onClick={handleNextQuestion}
                    disabled={!currentAnswer.trim()}
                    className="h-12 rounded-xl w-full gradient-primary shadow-glow text-xs font-bold group border-none text-white"
                  >
                    Next Question <ChevronRight className="ml-0.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={() => handleFinishInterview(false)}
                    disabled={submitting || !currentAnswer.trim()}
                    className="h-12 rounded-xl w-full bg-emerald-600 hover:bg-emerald-700 shadow-glow text-xs font-bold border-none text-white"
                  >
                    {submitting ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />}
                    Finalize Session
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Persistence Dock */}
      <footer className="h-auto py-3 border-t border-border/30 bg-background flex items-center px-4 md:px-12">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 sm:gap-12 text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{responses.size} / {session?.questions?.length} Saved</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Active {formatTime(totalTimeElapsed)}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InterviewRoomPage;