"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { interviewSessionApi } from "@/lib/api";

const Results = () => {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const results = await interviewSessionApi.getResults(interviewId);
        setData(results);
      } catch (err: any) {
        console.error("Error fetching results:", err);
        setError(err.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchResults();
    }
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading your results...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <h2 className="text-2xl font-bold">Error Loading Results</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { interview, results, questions, skillScores } = data;
  const overallScore = results.overallScore;

  // Parse feedback from questions to extract strengths and improvements
  const questionFeedback = questions.map((q: any, index: number) => {
    // Try to parse feedback if it's structured
    let strengths: string[] = [];
    let improvements: string[] = [];

    if (q.feedback) {
      // Simple parsing - you can enhance this based on AI output format
      const feedbackLines = q.feedback
        .split("\n")
        .filter((line: string) => line.trim());
      strengths = feedbackLines.filter(
        (line: string) =>
          line.toLowerCase().includes("good") ||
          line.toLowerCase().includes("strength") ||
          line.toLowerCase().includes("well"),
      );
      improvements = feedbackLines.filter(
        (line: string) =>
          line.toLowerCase().includes("improve") ||
          line.toLowerCase().includes("could") ||
          line.toLowerCase().includes("consider"),
      );

      // If no structured feedback, use the whole feedback as strength or improvement based on score
      if (strengths.length === 0 && improvements.length === 0) {
        if (q.score && q.score >= 80) {
          strengths = [q.feedback];
        } else {
          improvements = [q.feedback];
        }
      }
    }

    return {
      question: q.question,
      score: q.score || 0,
      strengths: strengths.length > 0 ? strengths : ["Good response"],
      improvements:
        improvements.length > 0 ? improvements : ["Keep practicing"],
      type: (q.score || 0) >= 80 ? "strength" : "improvement",
    };
  });

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
            {interview.title} • {interview.duration} minutes
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
                        {overallScore >= 80
                          ? "Excellent work!"
                          : overallScore >= 60
                            ? "Good job! Keep improving."
                            : "Keep practicing!"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-5xl font-bold text-gradient">
                        {overallScore}%
                      </div>
                    </div>
                  </div>

                  {/* Skill Scores */}
                  {skillScores.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {skillScores.map((skill: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{skill.skillName}</span>
                            <span className="font-medium">
                              {Math.round(skill.score)}%
                            </span>
                          </div>
                          <Progress value={skill.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary */}
                  {results.summary && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold mb-2">Summary</h3>
                      <p className="text-sm text-muted-foreground">
                        {results.summary}
                      </p>
                    </div>
                  )}
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
                {questionFeedback.map((item: any, index: number) => (
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
                            {item.strengths.map((s: string, i: number) => (
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
                            {item.improvements.map((s: string, i: number) => (
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
                  <span className="font-medium">{interview.duration} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    Questions
                  </div>
                  <span className="font-medium">
                    {questions.length} answered
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Category
                  </div>
                  <Badge variant="secondary">{interview.category}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Difficulty
                  </div>
                  <Badge variant="secondary">{interview.difficulty}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            {(results.strengths.length > 0 ||
              results.weaknesses.length > 0) && (
              <Card className="gradient-card shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-600 mb-2">
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {results.strengths.map(
                          (strength: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                              <span className="text-muted-foreground">
                                {strength}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                  {results.weaknesses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-600 mb-2">
                        Areas to Improve
                      </h4>
                      <ul className="space-y-1">
                        {results.weaknesses.map(
                          (weakness: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm">
                              <ChevronRight className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                              <span className="text-muted-foreground">
                                {weakness}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
