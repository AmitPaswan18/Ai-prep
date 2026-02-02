"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { interviewApi, Interview as APIInterview } from "@/lib/api";
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
import Link from "next/link";
import { useRouter } from "next/navigation";

const Interviews = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [interviews, setInterviews] = useState<APIInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const categories = [
    { id: "all", label: "All", icon: Globe },
    { id: "technical", label: "Technical", icon: Code },
    { id: "behavioral", label: "Behavioral", icon: Users },
    { id: "system-design", label: "System Design", icon: Database },
    { id: "case-study", label: "Case Study", icon: Briefcase },
  ];

  // Map category to icon and color
  const getCategoryStyle = (category: string) => {
    const categoryLower = category.toLowerCase().replace("_", "-");
    const styles: Record<string, { icon: any; color: string }> = {
      technical: { icon: Code, color: "bg-blue-500/10 text-blue-600" },
      behavioral: { icon: Users, color: "bg-green-500/10 text-green-600" },
      "system-design": {
        icon: Database,
        color: "bg-purple-500/10 text-purple-600",
      },
      "case-study": {
        icon: Briefcase,
        color: "bg-orange-500/10 text-orange-600",
      },
    };
    return (
      styles[categoryLower] || {
        icon: Code,
        color: "bg-blue-500/10 text-blue-600",
      }
    );
  };

  // Fetch interviews on mount and when filters change
  useEffect(() => {
    const fetchInterviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await interviewApi.getInterviews({
          category: selectedCategory,
          search: searchQuery,
          // template: true,
        });
        setInterviews(data);
      } catch (err: any) {
        setError(err.message || "Failed to load interviews");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, [selectedCategory, searchQuery]);

  const filteredInterviews = interviews.filter((interview) => {
    const matchesCategory =
      selectedCategory === "all" ||
      interview.category.toLowerCase().replace("_", "-") === selectedCategory;
    const matchesSearch =
      interview.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.description?.toLowerCase().includes(searchQuery.toLowerCase());
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
          <div className="flex w-full justify-between">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Interview Library
            </h1>
            <Button
              className="cursor-pointer"
              onClick={() => {
                router.push("/interviews/create");
              }}>
              Create an Interview
            </Button>
          </div>

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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading interviews...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredInterviews.map((interview, index) => {
              const style = getCategoryStyle(interview.category);
              const IconComponent = style.icon;

              return (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}>
                  <Card className="gradient-card shadow-card hover:shadow-elevated transition-all hover:-translate-y-1 cursor-pointer group h-full flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-2.5 rounded-xl ${style.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                          {interview.rating.toFixed(1)}
                        </div>
                      </div>
                      <CardTitle className="text-base leading-tight">
                        {interview.title}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {interview.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 mt-auto">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {interview.topics?.slice(0, 3).map((topic) => (
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
                          {interview.duration} min
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {interview.difficulty}
                        </Badge>
                      </div>
                      <Link href={`/interviews/room/${interview.id}`}>
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
              );
            })}
          </motion.div>
        )}

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
