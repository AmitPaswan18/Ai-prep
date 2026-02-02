"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Clock,
  ChevronRight,
  Brain,
  Sparkles,
  Volume2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import Navbar from "@/components/layout/Navbar";
import {
  interviewSessionApi,
  type InterviewSession,
  type InterviewResponse,
} from "@/lib/api";

const InterviewRoomPage = () => {
  const params = useParams();
  const router = useRouter();
  const { userId } = useAuth();
  const interviewId = params.id as string;

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
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

  // Load interview session
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        // Try to get existing session first
        let sessionData = await interviewSessionApi.getSession(interviewId);

        // If no questions, start a new session
        if (!sessionData.questions || sessionData.questions.length === 0) {
          sessionData = await interviewSessionApi.startSession(
            interviewId,
            userId || "guest",
          );
        }

        setSession(sessionData);
        setQuestionStartTime(Date.now());
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
  }, [interviewId, userId]);

  // Timer for total elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate AI speaking when question changes
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

  const getCurrentQuestion = () => {
    if (!session?.questions) return null;
    return session.questions[currentQuestionIndex];
  };

  const handleNextQuestion = () => {
    const currentQ = getCurrentQuestion();
    if (!currentQ) return;

    // Save current response
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const response: InterviewResponse = {
      questionId: currentQ.id,
      question: currentQ.question,
      answer: currentAnswer,
      timeSpent,
    };

    setResponses(new Map(responses.set(currentQ.id, response)));
    setCurrentAnswer("");

    // Move to next question
    if (session && currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Save current answer
      const currentQ = getCurrentQuestion();
      if (currentQ) {
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
        const response: InterviewResponse = {
          questionId: currentQ.id,
          question: currentQ.question,
          answer: currentAnswer,
          timeSpent,
        };
        setResponses(new Map(responses.set(currentQ.id, response)));
      }

      // Load previous question's answer
      setCurrentQuestionIndex((prev) => prev - 1);
      setQuestionStartTime(Date.now());

      const prevQ = session?.questions[currentQuestionIndex - 1];
      if (prevQ) {
        const prevResponse = responses.get(prevQ.id);
        setCurrentAnswer(prevResponse?.answer || "");
      }
    }
  };

  const handleFinishInterview = async () => {
    try {
      setSubmitting(true);

      // Save final answer
      const currentQ = getCurrentQuestion();
      if (currentQ) {
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
        const response: InterviewResponse = {
          questionId: currentQ.id,
          question: currentQ.question,
          answer: currentAnswer,
          timeSpent,
        };
        responses.set(currentQ.id, response);
      }

      // Submit all responses
      const responsesArray = Array.from(responses.values());
      const result = await interviewSessionApi.submitSession(
        interviewId,
        responsesArray,
      );

      // Redirect to results page
      router.push(`/results/${interviewId}`);
    } catch (err: any) {
      console.error("Error submitting interview:", err);
      alert(err.message || "Failed to submit interview");
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
  const questionTimeElapsed = Math.floor(
    (Date.now() - questionStartTime) / 1000,
  );
  const timeRemaining = Math.max(0, 60 - questionTimeElapsed); // 1 minute per question

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/20 bg-background/5 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge
              variant="secondary"
              className="bg-green-500/20 text-green-400 border-0">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Live Interview
            </Badge>
            <div className="flex items-center gap-2 text-primary-foreground/70">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeElapsed)}</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground">
              <span className="text-sm font-medium">
                Time for this question:
              </span>
              <span
                className={`font-mono ${timeRemaining < 10 ? "text-destructive" : ""}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary-foreground/70">
              Question {currentQuestionIndex + 1} of {session.questions.length}
            </span>
            <Progress value={progress} className="w-24 h-2" />
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Video Feeds */}
          <div className="lg:col-span-2 space-y-4">
            {/* AI Interviewer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}>
              <Card className="overflow-hidden bg-card/10 backdrop-blur-xl border-border/20">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
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
                      {isAISpeaking && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                          <div className="flex items-center gap-1 bg-accent/20 rounded-full px-3 py-1">
                            <Volume2 className="h-3 w-3 text-accent" />
                            <span className="text-xs text-accent">
                              Speaking...
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-background/80 text-foreground">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Interviewer
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* User Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}>
              <Card className="overflow-hidden bg-card/10 backdrop-blur-xl border-border/20">
                <CardContent className="p-0">
                  <div className="relative aspect-[3/1] bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center">
                    {isVideoOn ? (
                      <div className="text-primary-foreground/50 text-center">
                        <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <span className="text-sm">Your camera feed</span>
                      </div>
                    ) : (
                      <div className="text-primary-foreground/50 text-center">
                        <VideoOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <span className="text-sm">Camera is off</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-background/80 text-foreground">
                        You
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Question Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4">
            <Card className="bg-card/10 backdrop-blur-xl border-border/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span className="font-display font-semibold text-primary-foreground">
                    Current Question
                  </span>
                </div>
                <p className="text-primary-foreground/90 text-lg leading-relaxed">
                  {currentQuestion?.question}
                </p>

                {/* Answer Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary-foreground/70">
                    Your Answer
                  </label>
                  <Textarea
                    placeholder="Type your answer here..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    className="min-h-[120px] bg-background/50 border-border/20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Interview Info */}
            <Card className="bg-accent/10 backdrop-blur-xl border-accent/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-accent mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-accent">
                      {session.interview.title}
                    </p>
                    <p className="text-xs text-primary-foreground/70">
                      {session.interview.category} •{" "}
                      {session.interview.difficulty}
                    </p>
                    {session.interview.topics &&
                      session.interview.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {session.interview.topics.map((topic, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-border/20 text-primary-foreground hover:bg-primary-foreground/10"
                disabled={currentQuestionIndex === 0}
                onClick={handlePreviousQuestion}>
                Previous
              </Button>
              {currentQuestionIndex < session.questions.length - 1 ? (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleNextQuestion}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handleFinishInterview}
                  disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Finish Interview"
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Control Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 border-t border-border/20 bg-background/10 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-center gap-4">
          <Button
            variant={isMicOn ? "secondary" : "destructive"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => setIsMicOn(!isMicOn)}>
            {isMicOn ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant={isVideoOn ? "secondary" : "destructive"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => setIsVideoOn(!isVideoOn)}>
            {isVideoOn ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => {
              if (confirm("Are you sure you want to leave the interview?")) {
                router.push("/interviews");
              }
            }}>
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default InterviewRoomPage;
