"use client";

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
import { skillRadarData, progressData, learningPlan } from "@/lib/mock-data";
import Link from "next/link";

const Analytics = () => {
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
    .sort((a, b) => a.score - b.score);

  const strongestAreas = skillRadarData
    .filter((s) => s.score >= 80)
    .sort((a, b) => b.score - a.score);

  return (
    <div className="page-wrapper">
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

            {/* Progress Over Time */}
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
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+23% improvement over 6 months</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Learning Plan */}
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
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4">
            {/* Weak Areas */}
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

            {/* Strong Areas */}
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

            {/* Next Recommended Interview */}
            <Card className="gradient-primary text-primary-foreground shadow-elevated">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium">Recommended Next</span>
                </div>
                <h3 className="font-display text-lg font-bold mb-2">
                  System Design Practice
                </h3>
                <p className="text-sm text-primary-foreground/80 mb-4">
                  Based on your skill gaps, we recommend focusing on system
                  design concepts.
                </p>
                <Link href="/setup">
                  <Button variant="secondary" className="w-full">
                    Start Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
