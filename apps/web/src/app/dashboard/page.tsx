"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { interviewApi } from "@/lib/api";
import { useUser, useAuth } from "@clerk/nextjs";

const Dashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [completedInterviews, setCompletedInterviews] = useState<any[]>([]);
  const [templateInterviews, setTemplateInterviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const completed = await interviewApi.getCompletedInterviews(getToken);
        setCompletedInterviews(completed);
        const templates = await interviewApi.getInterviews({ template: false }, getToken);
        setTemplateInterviews(templates.slice(0, 4));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken]);

  const totalCompleted = completedInterviews.length;
  const averageScore = totalCompleted > 0
    ? Math.round(completedInterviews.reduce((acc, i) => acc + (i.results?.overallScore || 0), 0) / totalCompleted)
    : 0;
  const totalHours = completedInterviews.reduce((acc, i) => acc + (i.duration || 0), 0) / 60;
  const recentInterviews = completedInterviews.slice(0, 3);

  const stats = [
    { label: "Completion Rate", value: totalCompleted, icon: Target, suffix: "", color: "bg-blue-500" },
    { label: "Focus Time", value: totalHours.toFixed(1), icon: Clock, suffix: "h", color: "bg-purple-500" },
    { label: "Performance", value: averageScore, icon: TrendingUp, suffix: "%", color: "bg-emerald-500" },
    { label: "Day Streak", value: "4", icon: Flame, suffix: "", color: "bg-orange-500" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse font-medium">Synchronizing Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Hero Welcome Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-muted/30 backdrop-blur-sm p-8 md:p-12 mb-12"
        >
          {/* Decorative Blooms */}
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 text-primary bg-primary/5">
                <Sparkles className="h-4 w-4 mr-2" />
                Performance Dashboard
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight">
                Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{user?.firstName || "Candidate"}</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                You're in the top 15% of candidates this week. One more session to hit your daily goal!
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Link href="/interviews">
                  <Button size="lg" className="rounded-2xl h-12 px-8 gradient-primary shadow-glow hover:scale-105 transition-all">
                    Start Session <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="rounded-2xl h-12 px-8 border-border/50">
                  View Analytics
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="rounded-[2rem] border-border/50 bg-background hover:border-primary/30 hover:shadow-soft transition-all group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-10 transition-transform group-hover:scale-110`}>
                      <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                    </div>
                    <Activity className="h-4 w-4 text-muted-foreground opacity-30" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-display tracking-tight">{stat.value}</span>
                    <span className="text-lg font-medium text-muted-foreground">{stat.suffix}</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-display">Active Modules</h2>
              <Link href="/interviews" className="text-sm font-semibold text-primary hover:underline flex items-center">
                Explore All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <AnimatePresence>
                {templateInterviews.map((interview, i) => (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link href={`/interviews/room/${interview.id}`}>
                      <Card className="group relative h-full overflow-hidden rounded-[2rem] border-border/50 bg-muted/20 hover:border-primary/50 hover:shadow-elevated transition-all cursor-pointer">
                        <CardContent className="p-8">
                          <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-background rounded-2xl border border-border shadow-soft group-hover:bg-primary transition-colors">
                              <Play className="h-6 w-6 text-primary group-hover:text-white transition-colors capitalize" />
                            </div>
                            <Badge className="bg-background/50 backdrop-blur-md rounded-lg">{interview.duration}m</Badge>
                          </div>
                          <h3 className="text-xl font-bold mb-2 tracking-tight group-hover:text-primary transition-colors">{interview.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-6">{interview.description || "Simulated technical assessment"}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-border/10">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary/70">{interview.difficulty}</span>
                            <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold font-display">Recent Activity</h2>
            <Card className="rounded-[2.5rem] border-border/50 bg-muted/20 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-2">
                {recentInterviews.length > 0 ? (
                  <div className="space-y-1">
                    {recentInterviews.map((interview, i) => (
                      <Link key={interview.id} href={`/results/${interview.id}`}>
                        <div className="flex items-center gap-4 p-5 hover:bg-background rounded-3xl transition-all cursor-pointer group">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                            (interview.results?.overallScore || 0) >= 80 ? 'bg-emerald-500/10 text-emerald-500' :
                            (interview.results?.overallScore || 0) >= 60 ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {interview.results?.overallScore || 0}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate group-hover:text-primary transition-colors">{interview.title}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(interview.updatedAt)}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center space-y-6">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <Activity className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold">No Data Points</p>
                      <p className="text-sm text-muted-foreground">Your performance metrics will appear here after your first session.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Growth Card */}
            {totalCompleted > 0 && (
              <Card className="rounded-[2.5rem] bg-gradient-dark border-none shadow-glow p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <TrendingUp className="h-12 w-12" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold">Performance Goal</h3>
                    <p className="text-white/60 text-sm">Target: 90% accuracy</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span>Progress</span>
                      <span>{averageScore}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${averageScore}%` }}
                        className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/40 italic">Last assessment: {formatDate(completedInterviews[0].updatedAt)}</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default Dashboard;