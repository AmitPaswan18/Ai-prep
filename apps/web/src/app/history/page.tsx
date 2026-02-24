"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import PageHeader from "@/components/common/PageHeader";
import ScoreDisplay from "@/components/common/ScoreDisplay";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Calendar,
  Clock,
  Eye,
  Trash2,
  Filter,
  ChevronRight,
  FileText,
  Loader2,
  AlertCircle,
  Star,
} from "lucide-react";
import { interviewApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";

const History = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviews, setInterviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching interview history...");
        const data = await interviewApi.getCompletedInterviews(getToken);
        setInterviews(data);
      } catch (err: any) {
        console.error("Error fetching interview history:", err);
        setError(err.message || "Failed to load interview history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [getToken]);

  const filteredHistory = interviews.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      item.category.toLowerCase().includes(typeFilter.toLowerCase());

    const score = item.results?.overallScore || 0;
    const matchesScore =
      scoreFilter === "all" ||
      (scoreFilter === "excellent" && score >= 80) ||
      (scoreFilter === "good" && score >= 60 && score < 80) ||
      (scoreFilter === "needs-work" && score < 60);

    return matchesSearch && matchesType && matchesScore;
  });

  // Calculate statistics
  const totalInterviews = interviews.length;
  const averageScore =
    totalInterviews > 0
      ? Math.round(
          interviews.reduce(
            (acc, i) => acc + (i.results?.overallScore || 0),
            0,
          ) / totalInterviews,
        )
      : 0;
  const bestScore =
    totalInterviews > 0
      ? Math.max(...interviews.map((i) => i.results?.overallScore || 0))
      : 0;
  const excellentCount = interviews.filter(
    (i) => (i.results?.overallScore || 0) >= 80,
  ).length;

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="page-wrapper max-w-7xl mx-auto">
        <Navbar />
        <main className="page-content">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">
                Loading your interview history...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper max-w-7xl mx-auto">
        <Navbar />
        <main className="page-content">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <h2 className="text-2xl font-bold">Error Loading History</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper max-w-7xl mx-auto">
      <Navbar />

      <main className="page-content">
        <PageHeader
          title="Interview History"
          description="Review your past interview sessions and track progress"
        />

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search interviews..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="system">System Design</SelectItem>
                <SelectItem value="case">Case Study</SelectItem>
              </SelectContent>
            </Select>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="excellent">80%+</SelectItem>
                <SelectItem value="good">60-79%</SelectItem>
                <SelectItem value="needs-work">Below 60%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* History List */}
        {filteredHistory.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4">
            {filteredHistory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}>
                <Card className="gradient-card shadow-card hover:shadow-elevated transition-all">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-semibold truncate">
                            {item.title}
                          </h3>
                          <Badge variant="secondary">{item.category}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(item.updatedAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {item.duration} min
                          </div>
                          {item.rating > 0 && (
                            <div className="flex items-center gap-1 text-yellow-600">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              <span className="font-medium">
                                {item.rating}/5
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <ScoreDisplay
                          score={item.results?.overallScore || 0}
                          size="md"
                        />
                        <div className="flex items-center gap-2">
                          <Link href={`/results/${item.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1">
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={FileText}
            title={
              interviews.length === 0
                ? "No completed interviews yet"
                : "No interviews found"
            }
            description={
              interviews.length === 0
                ? "Complete your first interview to see it here."
                : "No interviews match your current filters. Try adjusting your search criteria."
            }
            actionLabel={
              interviews.length === 0 ? "Browse Interviews" : undefined
            }
            onAction={
              interviews.length === 0
                ? () => router.push("/interviews")
                : undefined
            }
          />
        )}

        {/* Stats Summary */}
        {totalInterviews > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8">
            <Card className="gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Summary Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold">
                      {totalInterviews}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Interviews
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold">
                      {averageScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Score
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold">
                      {bestScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Best Score
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold">
                      {excellentCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Excellent Scores
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default History;
