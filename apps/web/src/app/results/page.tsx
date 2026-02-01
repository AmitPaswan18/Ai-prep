"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  TrendingUp,
  MessageSquare,
  Clock,
  Target,
  Lightbulb,
  Download,
  Share2,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Star,
} from "lucide-react";
import Link from "next/link";

const Results = () => {
  const overallScore = 85;

  const categories = [
    { name: "Technical Knowledge", score: 88, maxScore: 100 },
    { name: "Communication", score: 82, maxScore: 100 },
    { name: "Problem Solving", score: 90, maxScore: 100 },
    { name: "Code Quality", score: 78, maxScore: 100 },
  ];

  const feedback = [
    {
      question:
        "Tell me about yourself and your experience with React development.",
      score: 90,
      strengths: [
        "Clear and structured response",
        "Good examples from past experience",
      ],
      improvements: ["Could elaborate more on specific project outcomes"],
      type: "strength",
    },
    {
      question:
        "Can you explain the difference between state and props in React?",
      score: 85,
      strengths: ["Accurate technical explanation", "Good use of analogies"],
      improvements: ["Could mention useState and useContext hooks"],
      type: "strength",
    },
    {
      question:
        "How would you optimize a React application for better performance?",
      score: 75,
      strengths: ["Mentioned key concepts like memoization"],
      improvements: [
        "Could discuss React.memo, useMemo, useCallback in more detail",
        "Consider mentioning code splitting",
      ],
      type: "improvement",
    },
  ];

  const tips = [
    "Practice explaining technical concepts with real-world analogies",
    "Prepare specific examples from your past projects",
    "Focus on quantifying your achievements (e.g., 'improved load time by 40%')",
    "Review React performance optimization techniques",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full gradient-primary shadow-elevated mb-6">
            <Trophy className="h-12 w-12 text-primary-foreground" />
          </motion.div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Interview Complete!
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Frontend Developer Interview • 45 minutes
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Download Report
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" /> Share Results
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}>
              <Card className="gradient-card shadow-elevated overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-display text-2xl font-bold mb-1">
                        Overall Performance
                      </h2>
                      <p className="text-muted-foreground">
                        Great job! You're above average.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-5xl font-bold text-gradient">
                        {overallScore}%
                      </div>
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        +12% from last time
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {categories.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{category.name}</span>
                          <span className="font-medium">{category.score}%</span>
                        </div>
                        <Progress value={category.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Question Feedback */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}>
              <h2 className="font-display text-xl font-semibold mb-4">
                Question-by-Question Feedback
              </h2>
              <div className="space-y-4">
                {feedback.map((item, index) => (
                  <Card key={index} className="gradient-card shadow-card">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg ${
                              item.score >= 80
                                ? "bg-green-500/10"
                                : "bg-yellow-500/10"
                            }`}>
                            {item.score >= 80 ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                          <Badge variant="secondary">Q{index + 1}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-semibold">{item.score}%</span>
                        </div>
                      </div>
                      <p className="font-medium mb-3">{item.question}</p>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <div className="font-medium text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                          </div>
                          <ul className="space-y-1 text-muted-foreground">
                            {item.strengths.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium text-yellow-600 flex items-center gap-1">
                            <Lightbulb className="h-3.5 w-3.5" /> Areas to
                            Improve
                          </div>
                          <ul className="space-y-1 text-muted-foreground">
                            {item.improvements.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4">
            {/* Stats */}
            <Card className="gradient-card shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Interview Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Duration
                  </div>
                  <span className="font-medium">42:15</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    Questions
                  </div>
                  <span className="font-medium">5 answered</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Accuracy
                  </div>
                  <span className="font-medium">85%</span>
                </div>
              </CardContent>
            </Card>

            {/* Personalized Tips */}
            <Card className="gradient-card shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Personalized Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Link href="/interviews" className="block">
                <Button variant="outline" className="w-full gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Practice Again
                </Button>
              </Link>
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Results;
