"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Clock,
  TrendingUp,
  Target,
  ChevronRight,
  Flame,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { interviewApi } from "@/lib/api";
import { useUser, useAuth } from "@clerk/nextjs";

const Dashboard = () => {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [completedInterviews, setCompletedInterviews] = useState<any[]>([]);
  const [templateInterviews, setTemplateInterviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch completed interviews for stats and recent activity
        const completed = await interviewApi.getCompletedInterviews(getToken);
        setCompletedInterviews(completed);

        // Fetch template interviews for "Start an Interview" section
        const templates = await interviewApi.getInterviews(
          { template: false },
          getToken,
        );
        setTemplateInterviews(templates.slice(0, 4)); // Show only 4
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getToken]);

  // Calculate stats from real data
  const totalCompleted = completedInterviews.length;
  const averageScore =
    totalCompleted > 0
      ? Math.round(
          completedInterviews.reduce(
            (acc, i) => acc + (i.results?.overallScore || 0),
            0,
          ) / totalCompleted,
        )
      : 0;

  // Calculate total practice hours (assuming each interview duration)
  const totalHours =
    completedInterviews.reduce((acc, i) => acc + (i.duration || 0), 0) / 60;

  // Get recent 3 interviews
  const recentInterviews = completedInterviews.slice(0, 3);

  const stats = [
    {
      label: "Interviews Completed",
      value: totalCompleted.toString(),
      icon: Target,
      trend:
        totalCompleted > 0 ? `${totalCompleted} total` : "Start practicing",
    },
    {
      label: "Practice Hours",
      value: totalHours.toFixed(1),
      icon: Clock,
      trend: `${totalHours.toFixed(1)} hrs`,
    },
    {
      label: "Average Score",
      value: `${averageScore}%`,
      icon: TrendingUp,
      trend: averageScore >= 70 ? "Good progress" : "Keep practicing",
    },
    {
      label: "This Week",
      value: completedInterviews
        .filter((i) => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(i.updatedAt) > weekAgo;
        })
        .length.toString(),
      icon: Flame,
      trend: "interviews",
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Welcome back,{" "}
            <span className="text-gradient">{user?.firstName || "there"}</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to ace your next interview? Let's practice!
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="gradient-card shadow-card hover:shadow-elevated transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <stat.icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="font-display text-2xl md:text-3xl font-bold">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className="text-xs text-accent mt-1">{stat.trend}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Interview Templates */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">
                Start an Interview
              </h2>
              <Link href="/interviews">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {templateInterviews.length > 0 ? (
                templateInterviews.map((interview, index) => (
                  <motion.div key={interview.id} variants={itemVariants}>
                    <Link href={`/interviews/room/${interview.id}`}>
                      <Card className="gradient-card shadow-card hover:shadow-elevated transition-all hover:-translate-y-1 cursor-pointer group">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="p-2.5 rounded-xl bg-primary/10">
                              <Play className="h-5 w-5 text-primary" />
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {interview.duration} min
                            </Badge>
                          </div>
                          <h3 className="font-display font-semibold text-lg mb-1">
                            {interview.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {interview.description ||
                              "Practice interview questions"}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {interview.difficulty}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-3 w-3" /> Start
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  <p>No interviews available. Check back later!</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">
                Recent Activity
              </h2>
              <Link href="/history">
                <Button variant="ghost" size="sm" className="gap-1">
                  See All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <Card className="gradient-card shadow-card">
              <CardContent className="p-0">
                {recentInterviews.length > 0 ? (
                  recentInterviews.map((interview, index) => (
                    <Link key={interview.id} href={`/results/${interview.id}`}>
                      <div
                        className={`p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                          index !== recentInterviews.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {interview.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(interview.updatedAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-display font-bold text-lg ${
                              (interview.results?.overallScore || 0) >= 80
                                ? "text-green-600"
                                : (interview.results?.overallScore || 0) >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}>
                            {interview.results?.overallScore || 0}%
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p className="mb-4">No completed interviews yet</p>
                    <Link href="/interviews">
                      <Button size="sm">Start Your First Interview</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            {totalCompleted > 0 && (
              <Card className="gradient-card shadow-card mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Your Progress</CardTitle>
                  <CardDescription>
                    {totalCompleted} interview{totalCompleted !== 1 ? "s" : ""}{" "}
                    completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={Math.min((averageScore / 100) * 100, 100)}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Average score: {averageScore}%
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
