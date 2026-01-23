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
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Code,
  Users,
  Briefcase,
  Zap,
  Brain,
  Database,
  Globe,
  Palette,
  Play,
  Clock,
  Star,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const Interviews = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All", icon: Globe },
    { id: "technical", label: "Technical", icon: Code },
    { id: "behavioral", label: "Behavioral", icon: Users },
    { id: "system-design", label: "System Design", icon: Database },
    { id: "case-study", label: "Case Study", icon: Briefcase },
  ];

  const interviews = [
    {
      id: 1,
      title: "Frontend Developer Interview",
      description:
        "React, TypeScript, CSS, and modern web development best practices",
      category: "technical",
      difficulty: "Intermediate",
      duration: "45 min",
      rating: 4.8,
      completions: 1250,
      icon: Code,
      color: "bg-blue-500/10 text-blue-600",
      topics: ["React", "TypeScript", "CSS"],
    },
    {
      id: 2,
      title: "Backend Systems Design",
      description: "Scalable architecture, databases, and distributed systems",
      category: "system-design",
      difficulty: "Advanced",
      duration: "60 min",
      rating: 4.9,
      completions: 890,
      icon: Database,
      color: "bg-purple-500/10 text-purple-600",
      topics: ["Microservices", "Databases", "Caching"],
    },
    {
      id: 3,
      title: "Leadership & Management",
      description:
        "Team leadership, conflict resolution, and strategic thinking",
      category: "behavioral",
      difficulty: "Advanced",
      duration: "30 min",
      rating: 4.7,
      completions: 2100,
      icon: Users,
      color: "bg-green-500/10 text-green-600",
      topics: ["Leadership", "Communication", "Strategy"],
    },
    {
      id: 4,
      title: "Product Strategy Case",
      description:
        "Market analysis, product roadmap, and go-to-market strategy",
      category: "case-study",
      difficulty: "Advanced",
      duration: "60 min",
      rating: 4.6,
      completions: 560,
      icon: Briefcase,
      color: "bg-orange-500/10 text-orange-600",
      topics: ["Strategy", "Analysis", "Product"],
    },
    {
      id: 5,
      title: "Data Structures & Algorithms",
      description:
        "Arrays, trees, graphs, dynamic programming, and complexity analysis",
      category: "technical",
      difficulty: "Advanced",
      duration: "45 min",
      rating: 4.9,
      completions: 3200,
      icon: Brain,
      color: "bg-red-500/10 text-red-600",
      topics: ["DSA", "Problem Solving", "Optimization"],
    },
    {
      id: 6,
      title: "UI/UX Design Discussion",
      description:
        "Design thinking, user research, and interface design principles",
      category: "behavioral",
      difficulty: "Intermediate",
      duration: "35 min",
      rating: 4.5,
      completions: 780,
      icon: Palette,
      color: "bg-pink-500/10 text-pink-600",
      topics: ["Design", "UX", "Accessibility"],
    },
    {
      id: 7,
      title: "Quick Technical Screen",
      description:
        "Rapid-fire coding questions for initial technical assessment",
      category: "technical",
      difficulty: "Beginner",
      duration: "15 min",
      rating: 4.4,
      completions: 4500,
      icon: Zap,
      color: "bg-yellow-500/10 text-yellow-600",
      topics: ["Basics", "Quick", "Screening"],
    },
    {
      id: 8,
      title: "API Design Interview",
      description: "RESTful APIs, GraphQL, and API architecture best practices",
      category: "system-design",
      difficulty: "Intermediate",
      duration: "40 min",
      rating: 4.7,
      completions: 920,
      icon: Globe,
      color: "bg-teal-500/10 text-teal-600",
      topics: ["REST", "GraphQL", "Architecture"],
    },
  ];

  const filteredInterviews = interviews.filter((interview) => {
    const matchesCategory =
      selectedCategory === "all" || interview.category === selectedCategory;
    const matchesSearch =
      interview.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Interview Library
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose from our collection of AI-powered mock interviews
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search interviews..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2 whitespace-nowrap">
                <category.icon className="h-4 w-4" />
                {category.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Interview Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredInterviews.map((interview, index) => (
            <motion.div
              key={interview.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}>
              <Card className="gradient-card shadow-card hover:shadow-elevated transition-all hover:-translate-y-1 cursor-pointer group h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2.5 rounded-xl ${interview.color}`}>
                      <interview.icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                      {interview.rating}
                    </div>
                  </div>
                  <CardTitle className="text-base leading-tight">
                    {interview.title}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {interview.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 mt-auto">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {interview.topics.map((topic) => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {interview.duration}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {interview.difficulty}
                    </Badge>
                  </div>
                  <Link href={`/interview/${interview.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2">
                      <Play className="h-3.5 w-3.5" />
                      Start Interview
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredInterviews.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12">
            <p className="text-muted-foreground">
              No interviews found matching your criteria.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Interviews;
