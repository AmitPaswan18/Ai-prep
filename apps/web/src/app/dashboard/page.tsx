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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Clock,
  TrendingUp,
  Target,
  Code,
  Users,
  Briefcase,
  Zap,
  ChevronRight,
  Flame,
} from "lucide-react";
import Link from "next/link";

const Dashboard = () => {
  const stats = [
    {
      label: "Interviews Completed",
      value: "12",
      icon: Target,
      trend: "+3 this week",
    },
    { label: "Practice Hours", value: "8.5", icon: Clock, trend: "+2.5 hrs" },
    { label: "Average Score", value: "85%", icon: TrendingUp, trend: "+12%" },
    { label: "Current Streak", value: "5", icon: Flame, trend: "days" },
  ];

  const interviewTypes = [
    {
      title: "Technical Interview",
      description: "Data structures, algorithms, and system design",
      icon: Code,
      difficulty: "Advanced",
      duration: "45 min",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Behavioral Interview",
      description: "Leadership, teamwork, and problem-solving scenarios",
      icon: Users,
      difficulty: "Intermediate",
      duration: "30 min",
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "Case Study",
      description: "Business strategy and analytical thinking",
      icon: Briefcase,
      difficulty: "Advanced",
      duration: "60 min",
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      title: "Quick Practice",
      description: "Rapid-fire questions for daily practice",
      icon: Zap,
      difficulty: "Beginner",
      duration: "15 min",
      color: "bg-orange-500/10 text-orange-600",
    },
  ];

  const recentInterviews = [
    {
      title: "Frontend Developer - React",
      score: 88,
      date: "2 hours ago",
      status: "completed",
    },
    {
      title: "System Design - Distributed Systems",
      score: 72,
      date: "Yesterday",
      status: "completed",
    },
    {
      title: "Behavioral - Leadership",
      score: 95,
      date: "3 days ago",
      status: "completed",
    },
  ];

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Welcome back, <span className="text-gradient">Alex</span>
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
          {/* Interview Types */}
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
              {interviewTypes.map((type, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="gradient-card shadow-card hover:shadow-elevated transition-all hover:-translate-y-1 cursor-pointer group">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2.5 rounded-xl ${type.color}`}>
                          <type.icon className="h-5 w-5" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {type.duration}
                        </Badge>
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-1">
                        {type.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {type.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {type.difficulty}
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
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Interviews */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">
                Recent Activity
              </h2>
              <Link href="/results">
                <Button variant="ghost" size="sm" className="gap-1">
                  See All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <Card className="gradient-card shadow-card">
              <CardContent className="p-0">
                {recentInterviews.map((interview, index) => (
                  <div
                    key={index}
                    className={`p-4 flex items-center gap-4 ${
                      index !== recentInterviews.length - 1
                        ? "border-b border-border"
                        : ""
                    }`}>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {interview.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {interview.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-display font-bold text-lg ${
                          interview.score >= 80
                            ? "text-green-600"
                            : interview.score >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}>
                        {interview.score}%
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card className="gradient-card shadow-card mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weekly Goal</CardTitle>
                <CardDescription>5 of 7 interviews completed</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={71} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  2 more interviews to reach your weekly goal!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
