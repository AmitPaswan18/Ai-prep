"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
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
  Star as StarIcon,
  Activity,
  Trophy,
  Target,
  BarChart3,
  SearchCode,
  ArrowUpRight,
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
        const data = await interviewApi.getCompletedInterviews(getToken);
        setInterviews(data);
      } catch (err: any) {
        setError(err.message || "Failed to load interview history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [getToken]);

  const filteredHistory = interviews.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || item.category.toLowerCase().includes(typeFilter.toLowerCase());
    const score = item.results?.overallScore || 0;
    const matchesScore = scoreFilter === "all" || (scoreFilter === "excellent" && score >= 80) || (scoreFilter === "good" && score >= 60 && score < 80) || (scoreFilter === "needs-work" && score < 60);
    return matchesSearch && matchesType && matchesScore;
  });

  const totalInterviews = interviews.length;
  const averageScore = totalInterviews > 0 ? Math.round(interviews.reduce((acc, i) => acc + (i.results?.overallScore || 0), 0) / totalInterviews) : 0;
  const bestScore = totalInterviews > 0 ? Math.max(...interviews.map((i) => i.results?.overallScore || 0)) : 0;
  const topCategories = interviews.length > 0 ? Array.from(new Set(interviews.map(i => i.category))).slice(0, 3) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse font-medium">Retrieving Archive...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        {/* KPI Dashboard */}
        <section className="mb-16">
           <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
              <div className="space-y-2">
                 <h1 className="text-4xl font-bold font-display tracking-tight">Performance <span className="text-primary italic">Archive.</span></h1>
                 <p className="text-muted-foreground text-lg">Detailed history of your interview simulations and technical builds.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-2xl border border-border/50">
                 <Calendar className="h-4 w-4 text-primary" />
                 <span className="text-sm font-semibold tracking-tight">History since {interviews.length > 0 ? new Date(interviews[0].createdAt).getFullYear() : '2024'}</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Sessions', value: totalInterviews, icon: Activity, color: 'text-blue-500' },
                { label: 'Global Average', value: `${averageScore}%`, icon: BarChart3, color: 'text-primary' },
                { label: 'Peak Rating', value: `${bestScore}%`, icon: Trophy, color: 'text-amber-500' },
                { label: 'Top Domain', value: topCategories[0] || 'N/A', icon: Target, color: 'text-emerald-500' },
              ].map((kpi, i) => (
                <Card key={i} className="rounded-3xl border-border/50 bg-background hover:shadow-soft transition-all p-6 group">
                   <div className="flex items-start justify-between">
                      <div className="space-y-2">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
                         <p className="text-3xl font-bold font-display">{kpi.value}</p>
                      </div>
                      <div className={`p-3 rounded-2xl bg-muted group-hover:bg-background transition-colors ${kpi.color}`}>
                         <kpi.icon className="h-5 w-5" />
                      </div>
                   </div>
                </Card>
              ))}
           </div>
        </section>

        {/* Global Controls */}
        <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
           <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search archive dossier..." 
                className="pl-11 h-12 rounded-2xl border-border/50 bg-muted/30 focus-visible:bg-background transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                 <SelectTrigger className="h-12 w-[160px] rounded-2xl border-border/50 bg-muted/30">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Domain" />
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl">
                    <SelectItem value="all">All Domains</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="system">Architecture</SelectItem>
                 </SelectContent>
              </Select>

              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                 <SelectTrigger className="h-12 w-[160px] rounded-2xl border-border/50 bg-muted/30">
                    <SelectValue placeholder="Precision" />
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl">
                    <SelectItem value="all">Any Score</SelectItem>
                    <SelectItem value="excellent">Elite (80%+)</SelectItem>
                    <SelectItem value="good">Advanced (60-79%)</SelectItem>
                    <SelectItem value="needs-work">Developing</SelectItem>
                 </SelectContent>
              </Select>
           </div>
        </div>

        {/* Archive List */}
        <div className="space-y-4">
           {filteredHistory.length > 0 ? (
             filteredHistory.map((item, i) => (
               <motion.div
                 key={item.id}
                 initial={{ opacity: 0, y: 15 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.03 }}
               >
                 <Link href={`/results/${item.id}`}>
                    <Card className="group rounded-[2rem] border-border/50 bg-background hover:bg-muted/30 hover:border-primary/20 transition-all overflow-hidden p-6 sm:px-10">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="flex-1 min-w-0 flex items-center gap-6">
                             <div className={`hidden sm:flex w-16 h-16 rounded-[1.25rem] items-center justify-center font-display font-bold text-2xl transition-all ${
                               (item.results?.overallScore || 0) >= 80 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-muted text-muted-foreground'
                             }`}>
                                {item.results?.overallScore || 0}%
                             </div>
                             
                             <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center gap-3">
                                   <h3 className="font-bold text-lg tracking-tight truncate">{item.title}</h3>
                                   <Badge variant="outline" className="rounded-full border-border/50 bg-muted/50 text-[10px] uppercase font-bold tracking-widest">{item.category}</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-muted-foreground text-xs font-medium">
                                   <span className="flex items-center gap-1.5 leading-none"><Calendar className="h-3.5 w-3.5" /> {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                   <span className="flex items-center gap-1.5 leading-none"><Clock className="h-3.5 w-3.5" /> {item.duration}m duration</span>
                                   {item.rating > 0 && <span className="flex items-center gap-1 text-amber-500"><StarIcon className="h-3 w-3 fill-current" /> {item.rating} Rating</span>}
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center gap-3">
                             <Button variant="ghost" className="rounded-xl h-11 px-6 font-bold group-hover:bg-primary group-hover:text-white transition-all gap-2">
                                Details <ArrowUpRight className="h-4 w-4" />
                             </Button>
                          </div>
                       </div>
                    </Card>
                 </Link>
               </motion.div>
             ))
           ) : (
             <Card className="rounded-[2.5rem] border-border/50 bg-muted/20 border-dashed p-20 text-center space-y-4">
                <SearchCode className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <div className="space-y-1">
                   <p className="font-bold text-xl">Empty Archive</p>
                   <p className="text-muted-foreground max-w-xs mx-auto text-sm">No interviews found for the current filter criteria.</p>
                </div>
                <Button onClick={() => {setSearchQuery(""); setTypeFilter("all"); setScoreFilter("all");}} className="rounded-xl">Clear All Filters</Button>
             </Card>
           )}
        </div>

      </main>
    </div>
  );
};

export default History;