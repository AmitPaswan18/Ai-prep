"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import PageHeader from "@/components/common/PageHeader";
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
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  BookOpen,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import Link from "next/link";
import { interviewApi } from "@/lib/api";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [completedInterviews, setCompletedInterviews] = useState<any[]>([]);
  const [skillRadarData, setSkillRadarData] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const completed = await interviewApi.getCompletedInterviews();
        setCompletedInterviews(completed);

        // Process skill radar data from completed interviews
        const skillMap = new Map<string, { total: number; count: number }>();

        completed.forEach((interview) => {
          if (interview.skillScores && interview.skillScores.length > 0) {
            interview.skillScores.forEach((skill: any) => {
              const existing = skillMap.get(skill.skillName) || {
                total: 0,
                count: 0,
              };
              skillMap.set(skill.skillName, {
                total: existing.total + skill.score,
                count: existing.count + 1,
              });
            });
          }
        });

        // Convert to radar chart format
        const radarData = Array.from(skillMap.entries()).map(
          ([skill, data]) => ({
            skill,
            score: Math.round(data.total / data.count),
          }),
        );

        setSkillRadarData(radarData);

        // Process progress over time (last 6 months)
        const monthlyScores = new Map<
          string,
          { total: number; count: number }
        >();
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        completed.forEach((interview) => {
          const date = new Date(interview.updatedAt);
          const monthKey = `${months[date.getMonth()]}`;
          const score = interview.results?.overallScore || 0;

          const existing = monthlyScores.get(monthKey) || {
            total: 0,
            count: 0,
          };
          monthlyScores.set(monthKey, {
            total: existing.total + score,
            count: existing.count + 1,
          });
        });

        // Get last 6 months
        const now = new Date();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = months[date.getMonth()];
          const data = monthlyScores.get(monthName);
          last6Months.push({
            month: monthName,
            score: data ? Math.round(data.total / data.count) : 0,
          });
        }

        setProgressData(last6Months);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-600 border-red-200";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
      case "low":
        return "bg-green-500/10 text-green-600 border-green-200";
      default:
        return "";
    }
  };

  const weakestAreas = skillRadarData
    .filter((s) => s.score < 75)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  const strongestAreas = skillRadarData
    .filter((s) => s.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Generate learning plan based on weak areas
  const learningPlan = weakestAreas.map((area, index) => ({
    id: `plan-${index}`,
    topic: `Improve ${area.skill}`,
    reason: `Current score: ${area.score}%. Focus on strengthening this skill.`,
    priority: area.score < 60 ? "high" : area.score < 70 ? "medium" : "low",
    suggestedTime: "2-3 hours",
    resources: "5-7",
  }));

  // Calculate improvement percentage
  const calculateImprovement = () => {
    if (progressData.length < 2) return 0;
    const firstScore = progressData[0].score;
    const lastScore = progressData[progressData.length - 1].score;
    if (firstScore === 0) return 0;
    return Math.round(((lastScore - firstScore) / firstScore) * 100);
  };

  const improvement = calculateImprovement();

  if (loading) {
    return (
      <div className="page-wrapper max-w-7xl mx-auto">
        <Navbar />
        <main className="page-content">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (completedInterviews.length === 0) {
    return (
      <div className="page-wrapper max-w-7xl mx-auto">
        <Navbar />
        <main className="page-content">
          <PageHeader
            title="Skills & Analytics"
            description="Track your progress and identify areas for improvement"
          />
          <Card className="gradient-card shadow-card">
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
              <p className="text-muted-foreground mb-6">
                Complete your first interview to see your analytics and
                insights.
              </p>
              <Link href="/interviews">
                <Button>Start Your First Interview</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper max-w-7xl mx-auto">
      <Navbar />

      <main className="page-content">
        <PageHeader
          title="Skills & Analytics"
          description="Track your progress and identify areas for improvement"
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skill Radar Chart */}
            {skillRadarData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}>
                <Card className="gradient-card shadow-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Skill Overview
                    </CardTitle>
                    <CardDescription>
                      Your competency across different interview areas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={skillRadarData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis
                            dataKey="skill"
                            tick={{
                              fill: "hsl(var(--muted-foreground))",
                              fontSize: 12,
                            }}
                          />
                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={{
                              fill: "hsl(var(--muted-foreground))",
                              fontSize: 10,
                            }}
                          />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Progress Over Time */}
            {progressData.some((d) => d.score > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}>
                <Card className="gradient-card shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Progress Over Time
                    </CardTitle>
                    <CardDescription>
                      Your average interview score trend
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={progressData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="month"
                            tick={{
                              fill: "hsl(var(--muted-foreground))",
                              fontSize: 12,
                            }}
                          />
                          <YAxis
                            domain={[0, 100]}
                            tick={{
                              fill: "hsl(var(--muted-foreground))",
                              fontSize: 12,
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            dot={{
                              fill: "hsl(var(--primary))",
                              strokeWidth: 2,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {improvement !== 0 && (
                      <div
                        className={`flex items-center justify-center gap-2 mt-4 text-sm ${improvement > 0 ? "text-green-600" : "text-red-600"}`}>
                        {improvement > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span>
                          {improvement > 0 ? "+" : ""}
                          {improvement}% over time
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* AI Learning Plan */}
            {learningPlan.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}>
                <Card className="gradient-card shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      AI-Powered Learning Plan
                    </CardTitle>
                    <CardDescription>
                      Personalized recommendations based on your performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {learningPlan.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <Badge
                          className={`mt-0.5 ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{item.topic}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.reason}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>⏱️ {item.suggestedTime}</span>
                            <span>📚 {item.resources} resources</span>
                          </div>
                        </div>
                        <Link href="/interviews">
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4">
            {/* Weak Areas */}
            {weakestAreas.length > 0 && (
              <Card className="gradient-card shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {weakestAreas.map((area) => (
                    <div key={area.skill} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{area.skill}</span>
                        <span className="font-medium text-yellow-600">
                          {area.score}%
                        </span>
                      </div>
                      <Progress value={area.score} className="h-2" />
                    </div>
                  ))}
                  <Link href="/interviews">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Practice Weak Areas
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Strong Areas */}
            {strongestAreas.length > 0 && (
              <Card className="gradient-card shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {strongestAreas.map((area) => (
                    <div key={area.skill} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{area.skill}</span>
                        <span className="font-medium text-green-600">
                          {area.score}%
                        </span>
                      </div>
                      <Progress value={area.score} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Next Recommended Interview */}
            {weakestAreas.length > 0 && (
              <Card className="gradient-primary text-primary-foreground shadow-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-5 w-5" />
                    <span className="font-medium">Recommended Next</span>
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2">
                    Focus on {weakestAreas[0].skill}
                  </h3>
                  <p className="text-sm text-primary-foreground/80 mb-4">
                    Based on your skill gaps, we recommend practicing{" "}
                    {weakestAreas[0].skill.toLowerCase()} to improve your score.
                  </p>
                  <Link href="/interviews">
                    <Button variant="secondary" className="w-full">
                      Start Practice
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
