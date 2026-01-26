"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import Link from "next/link";
const InterviewRoom = () => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  const questions = [
    "Tell me about yourself and your experience with React development.",
    "Can you explain the difference between state and props in React?",
    "How would you optimize a React application for better performance?",
    "Describe a challenging project you worked on and how you overcame obstacles.",
    "What's your approach to testing React components?",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate AI speaking
    setIsAISpeaking(true);
    const timeout = setTimeout(() => setIsAISpeaking(false), 3000);
    return () => clearTimeout(timeout);
  }, [currentQuestion]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen gradient-hero">
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
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary-foreground/70">
              Question {currentQuestion + 1} of {questions.length}
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
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span className="font-display font-semibold text-primary-foreground">
                    Current Question
                  </span>
                </div>
                <p className="text-primary-foreground/90 text-lg leading-relaxed">
                  {questions[currentQuestion]}
                </p>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-accent/10 backdrop-blur-xl border-accent/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-accent mb-1">
                      Pro Tip
                    </p>
                    <p className="text-xs text-primary-foreground/70">
                      Use the STAR method: Situation, Task, Action, Result for
                      behavioral questions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-border/20 text-primary-foreground hover:bg-primary-foreground/10"
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion((prev) => prev - 1)}>
                Previous
              </Button>
              {currentQuestion < questions.length - 1 ? (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCurrentQuestion((prev) => prev + 1)}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Link href="/results/1" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Finish Interview
                  </Button>
                </Link>
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
          <Link href="/dashboard">
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full w-14 h-14">
              <PhoneOff className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default InterviewRoom;
