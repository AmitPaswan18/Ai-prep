"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Mic,
  MicOff,
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
  Volume2,
  User,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import {
  interviewSessionApi,
  userApi,
  type InterviewSession,
  type InterviewResponse,
} from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import { useVoice } from "@/hooks/use-voice";

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

  const {
      connect: connectVoice,
      isConnected: isVoiceConnected,
      isConnecting: isVoiceConnecting,
      transcript: liveTranscript,
      setTranscript,
      speak,
      isAiTalking
  } = useVoice(interviewId, getToken);

  const [isElevenLabsConfigured, setIsElevenLabsConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    if (liveTranscript) {
      setCurrentAnswer(liveTranscript);
    }
  }, [liveTranscript]);

  useEffect(() => {
    if (session?.questions?.[currentQuestionIndex] && isElevenLabsConfigured) {
      speak(session.questions[currentQuestionIndex].question);
    }
  }, [currentQuestionIndex, session, speak, isElevenLabsConfigured]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        
        // Check ElevenLabs configuration
        const settings = await userApi.getSettings(getToken);
        setIsElevenLabsConfigured(settings.isElevenLabsConfigured);

        let sessionData = await interviewSessionApi.getSession(interviewId, getToken);
        
        // If the session returned is not owned by the user (it's a template or belongs to someone else), 
        // startSession will clone it. We should then redirect to the new ID.
        if (!sessionData.questions || sessionData.questions.length === 0 || sessionData.interview.isTemplate) {
          console.log("[Room] Starting fresh session (cloning if needed)");
          const newSession = await interviewSessionApi.startSession(interviewId, getToken);
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
  }, [interviewId, getToken]);

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
    setTranscript("");
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
          description: err.message || "Failed to synchronize interview results with the neural engine.",
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

  const currentQuestion = session?.questions?.[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (session?.questions?.length || 1)) * 100;
  const timeRemaining = Math.max(0, totalDuration - totalTimeElapsed);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Top Bar - Session Status */}
      <div className="pt-14 px-4 md:px-6 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto py-2 flex items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-muted rounded-xl border border-border">
                <Brain className="h-5 w-5 text-primary" />
             </div>
             <div className="hidden sm:block">
                <h2 className="font-bold tracking-tight">{session?.interview?.title}</h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-widest">
                  <span className="text-primary/70">{session?.interview?.category}</span>
                  <span className="opacity-20">•</span>
                  <span>{session?.interview?.difficulty}</span>
                </div>
             </div>
          </div>

          <div className="flex-1 max-w-sm px-8 hidden md:block">
             <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
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

          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Time Remaining</p>
                <p className={`font-mono text-xl font-bold tracking-tighter ${timeRemaining < 60 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
                  {formatTime(timeRemaining)}
                </p>
             </div>
             <Button variant="ghost" className="rounded-xl h-12 px-5 border border-border/50 hover:bg-muted" onClick={() => router.push('/dashboard')}>
                Exit
             </Button>
          </div>
        </div>
      </div>

      {/* Main Studio Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        
        {/* Left Phase - Artificial Intelligence */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
           <Card className="rounded-[2rem] md:rounded-[2.5rem] border-border/50 bg-muted/30 backdrop-blur-sm overflow-hidden p-6 md:p-8 lg:sticky lg:top-28">
              <div className="relative aspect-square rounded-[2rem] bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center mb-8 shadow-soft border border-border/30">
                 {/* Visualizer Pulses */}
                 {isAiTalking && (
                   <>
                     <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 border-2 border-primary/20 rounded-[2rem]" />
                     <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-8 border border-accent/20 rounded-[2rem]" />
                   </>
                 )}
                 <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isAiTalking ? 'bg-primary shadow-glow' : 'bg-muted border border-border'}`}>
                    <Brain className={`w-16 h-16 ${isAiTalking ? 'text-white' : 'text-muted-foreground'}`} />
                 </div>
                 
                 <div className="absolute bottom-6 flex items-center gap-3">
                    <Badge className={`px-4 py-1.5 rounded-full capitalize ${isAiTalking ? 'bg-primary text-white' : 'bg-background text-muted-foreground'}`}>
                       {isAiTalking ? (
                         <span className="flex items-center gap-2"><Volume2 className="h-3 w-3" /> Transmitting...</span>                        ) : 'Ready'}
                    </Badge>
                 </div>
              </div>

              {isElevenLabsConfigured === false && (
                <div className="mb-6 p-4 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-2">
                   <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Voice Disabled</span>
                   </div>
                   <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                      AI voice is disabled because no ElevenLabs API key was found. <Link href="/dashboard/settings" className="text-primary hover:underline">Add key in settings</Link> to enable audio.
                   </p>
                </div>
              )}

              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/30">
                    <div className="flex items-center gap-3">
                       <Activity className="h-4 w-4 text-primary" />
                       <span className="text-sm font-semibold">Voice Status</span>
                    </div>
                    <span className="text-xs font-bold text-primary italic uppercase tracking-widest">{isVoiceConnected ? 'Active' : 'Standby'}</span>
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/30">
                    <div className="flex items-center gap-3">
                       <Zap className="h-4 w-4 text-accent" />
                       <span className="text-sm font-semibold">Role Assessment</span>
                    </div>
                    <span className="text-xs font-bold text-accent italic uppercase tracking-widest">Technical Expert</span>
                 </div>
              </div>
           </Card>
        </div>

        {/* Right Phase - Human Interaction */}
        <div className="lg:col-span-3 space-y-8 order-1 lg:order-2">
           <AnimatePresence mode="wait">
             <motion.div
               key={currentQuestionIndex}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-8"
             >
                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
                      <Sparkles className="h-3.5 w-3.5" /> Question {currentQuestionIndex + 1}
                   </div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display leading-[1.2]">
                       {currentQuestion?.question}
                    </h1>
                </div>

                <div className="relative group">                    <Textarea
                      placeholder="The stage is yours. Focus on structured reasoning..."
                      className="min-h-[300px] md:min-h-[400px] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 text-base md:text-lg border-border/50 bg-muted/10 group-focus-within:bg-background group-focus-within:shadow-elevated transition-all resize-none leading-relaxed"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                    />
                    
                    <div className="absolute bottom-4 md:bottom-6 right-4 md:right-8 flex flex-wrap justify-end items-center gap-3 md:gap-4">
                       {isVoiceConnected && (
                         <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[9px] md:text-[10px] font-bold text-emerald-500 uppercase tracking-widest whitespace-nowrap">Deepgram Active</span>
                         </div>
                       )}
                       <span className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest">{currentAnswer.length} Chars</span>
                    </div>  
                </div>
                 <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button 
                     size="lg" 
                     variant={isVoiceConnected ? 'secondary' : 'outline'}
                     onClick={connectVoice}
                     disabled={isVoiceConnecting}
                     className="h-14 md:h-16 rounded-xl md:rounded-2xl w-full sm:flex-1 border-border/50 text-sm md:text-base font-bold transition-all hover:shadow-soft"
                    >
                      {isVoiceConnecting ? <Loader2 className="animate-spin h-5 w-5" /> : isVoiceConnected ? <MicOff className="h-5 w-5 mr-3 text-emerald-500" /> : <Mic className="h-5 w-5 mr-3" /> }
                      {isVoiceConnected ? 'Disconnect Voice' : 'Start Voice Input'}
                    </Button>
                    
                    {currentQuestionIndex < (session?.questions?.length || 0) - 1 ? (
                      <Button 
                       size="lg" 
                       onClick={handleNextQuestion}
                       disabled={!currentAnswer.trim()}
                       className="h-14 md:h-16 rounded-xl md:rounded-2xl w-full sm:flex-1 gradient-primary shadow-glow text-sm md:text-base font-bold group"
                      >
                        Next Question <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    ) : (
                      <Button 
                       size="lg" 
                       onClick={() => handleFinishInterview(false)}
                       disabled={submitting || !currentAnswer.trim()}
                       className="h-14 md:h-16 rounded-xl md:rounded-2xl w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-glow text-sm md:text-base font-bold"
                      >
                        {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle2 className="h-5 w-5 mr-3" />}
                        Finalize Session
                      </Button>
                    )}
                 </div>
             </motion.div>
           </AnimatePresence>
        </div>

      </main>

      {/* Persistence Dock */}
      <footer className="h-auto py-6 border-t border-border/30 bg-background flex items-center px-4 md:px-12">
         <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 sm:gap-12 text-muted-foreground">
            <div className="flex items-center gap-2">
               <User className="h-4 w-4" />
               <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{responses.size} / {session?.questions?.length} Saved</span>
            </div>
            <div className="flex items-center gap-2">
               <Clock className="h-4 w-4" />
               <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Active {formatTime(totalTimeElapsed)}</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default InterviewRoomPage;