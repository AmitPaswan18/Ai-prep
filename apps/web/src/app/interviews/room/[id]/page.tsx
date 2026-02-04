"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import {
  interviewSessionApi,
  type InterviewSession,
  type InterviewResponse,
} from "@/lib/api";
import Navbar from "@/components/layout/Navbar";

const InterviewRoomPage = () => {
  const params = useParams();
  const router = useRouter();
  const { userId, getToken } = useAuth();
  const interviewId = params.id as string;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Map<string, InterviewResponse>>(
    new Map(),
  );
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0); // in seconds

  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setCurrentAnswer((prev) => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Load interview session
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        let sessionData = await interviewSessionApi.getSession(
          interviewId,
          getToken,
        );

        if (!sessionData.questions || sessionData.questions.length === 0) {
          sessionData = await interviewSessionApi.startSession(
            interviewId,
            getToken,
          );
        }

        setSession(sessionData);
        setQuestionStartTime(Date.now());

        // Calculate total duration (interview duration in minutes * 60)
        const durationInSeconds = (sessionData.interview.duration || 30) * 60;
        setTotalDuration(durationInSeconds);
      } catch (err: any) {
        console.error("Error loading session:", err);
        setError(err.message || "Failed to load interview session");
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      loadSession();
    }
  }, [interviewId, getToken]);

  // Total interview timer with auto-submit
  useEffect(() => {
    if (!session || totalDuration === 0) return;

    const timer = setInterval(() => {
      setTotalTimeElapsed((prev) => {
        const newTime = prev + 1;

        // Auto-submit when time is up
        if (newTime >= totalDuration) {
          clearInterval(timer);
          handleFinishInterview(true); // Auto-submit
          return totalDuration;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, totalDuration]);

  // AI speaking animation
  useEffect(() => {
    if (session?.questions) {
      setIsAISpeaking(true);
      const timeout = setTimeout(() => setIsAISpeaking(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [currentQuestionIndex, session]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert(
        "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
      );
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const getCurrentQuestion = () => {
    if (!session?.questions) return null;
    return session.questions[currentQuestionIndex];
  };

  const saveCurrentResponse = () => {
    const currentQ = getCurrentQuestion();
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

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      saveCurrentResponse();
      setCurrentQuestionIndex((prev) => prev - 1);
      setQuestionStartTime(Date.now());

      const prevQ = session?.questions[currentQuestionIndex - 1];
      if (prevQ) {
        const prevResponse = responses.get(prevQ.id);
        setCurrentAnswer(prevResponse?.answer || "");
      }
    }
  };

  const handleFinishInterview = async (autoSubmit = false) => {
    try {
      setSubmitting(true);

      // Save final answer
      saveCurrentResponse();

      // Submit all responses
      const responsesArray = Array.from(responses.values());
      await interviewSessionApi.submitSession(
        interviewId,
        responsesArray,
        getToken,
      );

      // Redirect to results page
      router.push(`/results/${interviewId}`);
    } catch (err: any) {
      console.error("Error submitting interview:", err);
      if (!autoSubmit) {
        alert(err.message || "Failed to submit interview");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Card className="bg-card/10 backdrop-blur-xl border-border/20 p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-primary-foreground">
              Loading interview session...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Card className="bg-card/10 backdrop-blur-xl border-border/20 p-8 max-w-md">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <p className="text-destructive">{error || "Session not found"}</p>
            <Button onClick={() => router.push("/interviews")}>
              Back to Interviews
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const progress =
    ((currentQuestionIndex + 1) / (session.questions?.length || 1)) * 100;
  const timeRemaining = Math.max(0, totalDuration - totalTimeElapsed);
  const isTimeRunningOut = timeRemaining < 60; // Less than 1 minute

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      {/* Header with Timer */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/20 bg-background/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Left: Interview Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <div>
                  <h1 className="font-display font-semibold text-primary-foreground">
                    {session.interview.title}
                  </h1>
                  <p className="text-xs text-primary-foreground/60">
                    {session.interview.category} •{" "}
                    {session.interview.difficulty}
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Progress */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-primary-foreground/70">
                Question {currentQuestionIndex + 1} of{" "}
                {session.questions.length}
              </span>
              <Progress value={progress} className="w-32 h-2" />
            </div>

            {/* Right: Total Timer */}
            <div className="flex items-center gap-2">
              <Timer
                className={`h-5 w-5 ${isTimeRunningOut ? "text-destructive animate-pulse" : "text-primary"}`}
              />
              <div className="text-right">
                <div className="text-xs text-primary-foreground/60">
                  Time Remaining
                </div>
                <div
                  className={`font-mono text-lg font-bold ${isTimeRunningOut ? "text-destructive" : "text-primary-foreground"}`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: AI Interviewer */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2">
              <Card className="bg-card/10 backdrop-blur-xl border-border/20 sticky top-24">
                <CardContent className="p-6">
                  {/* AI Avatar */}
                  <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-6">
                    <motion.div
                      animate={isAISpeaking ? { scale: [1, 1.05, 1] } : {}}
                      transition={{
                        repeat: isAISpeaking ? Infinity : 0,
                        duration: 0.5,
                      }}
                      className="relative">
                      <div
                        className={`w-32 h-32 rounded-full gradient-primary flex items-center justify-center ${isAISpeaking ? "animate-pulse-glow" : ""}`}>
                        <Brain className="w-16 h-16 text-primary-foreground" />
                      </div>
                    </motion.div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-background/80 text-foreground">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Interviewer
                      </Badge>
                    </div>
                  </div>

                  {/* Interview Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary-foreground/60">
                        Total Time
                      </span>
                      <span className="font-mono text-primary-foreground">
                        {formatTime(totalTimeElapsed)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary-foreground/60">
                        Answered
                      </span>
                      <span className="font-medium text-primary-foreground">
                        {responses.size} / {session?.questions?.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary-foreground/60">
                        Duration
                      </span>
                      <span className="font-medium text-primary-foreground">
                        {session?.interview?.duration} min
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right: Question & Answer */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3 space-y-6">
              {/* Question Card */}
              <Card className="bg-card/10 backdrop-blur-xl border-border/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-display text-lg font-semibold text-primary-foreground mb-2">
                        Question {currentQuestionIndex + 1}
                      </h2>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={currentQuestionIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-primary-foreground/90 text-lg leading-relaxed">
                          {currentQuestion?.question}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Answer Card */}
              <Card className="bg-card/10 backdrop-blur-xl border-border/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-primary-foreground">
                      Your Answer
                    </label>
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      size="sm"
                      onClick={toggleRecording}
                      className="gap-2">
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          Speak to Text
                        </>
                      )}
                    </Button>
                  </div>

                  <Textarea
                    ref={textareaRef}
                    placeholder="Type your answer here or use the 'Speak to Text' button to dictate your response..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    className="min-h-[300px] text-base bg-background/50 border-border/20 resize-none"
                  />

                  <div className="flex items-center justify-between text-xs text-primary-foreground/50">
                    <span>{currentAnswer.length} characters</span>
                    {isRecording && (
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="flex items-center gap-1 text-destructive">
                        <span className="w-2 h-2 bg-destructive rounded-full" />
                        Recording...
                      </motion.span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  disabled={currentQuestionIndex === 0}
                  onClick={handlePreviousQuestion}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {currentQuestionIndex < session.questions.length - 1 ? (
                  <Button
                    size="lg"
                    className="flex-1 gap-2"
                    onClick={handleNextQuestion}
                    disabled={!currentAnswer.trim()}>
                    Next Question
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => handleFinishInterview(false)}
                    disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Finish Interview
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoomPage;
