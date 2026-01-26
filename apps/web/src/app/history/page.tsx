import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
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
} from "lucide-react";
import { interviewHistory } from "@/lib/mock-data";

const History = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");

  const filteredHistory = interviewHistory.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      item.type.toLowerCase().includes(typeFilter.toLowerCase());
    const matchesScore =
      scoreFilter === "all" ||
      (scoreFilter === "excellent" && item.score >= 80) ||
      (scoreFilter === "good" && item.score >= 60 && item.score < 80) ||
      (scoreFilter === "needs-work" && item.score < 60);
    return matchesSearch && matchesType && matchesScore;
  });

  return (
    <div className="page-wrapper">
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
                          <Badge variant="secondary">{item.type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {item.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {item.duration}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <ScoreDisplay score={item.score} size="md" />
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
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
            title="No interviews found"
            description="No interviews match your current filters. Try adjusting your search criteria."
          />
        )}

        {/* Stats Summary */}
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
                    {interviewHistory.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Interviews
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-display text-2xl font-bold">
                    {Math.round(
                      interviewHistory.reduce((acc, i) => acc + i.score, 0) /
                        interviewHistory.length,
                    )}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Score
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-display text-2xl font-bold">
                    {Math.max(...interviewHistory.map((i) => i.score))}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Best Score
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-display text-2xl font-bold">
                    {interviewHistory.filter((i) => i.score >= 80).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Excellent Scores
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default History;
