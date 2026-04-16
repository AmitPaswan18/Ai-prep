"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Code,
  Users,
  Brain,
  Monitor,
  Filter,
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
  Star as StarIcon,
  ChevronRight,
  Loader2,
  Globe,
  Database,
  Briefcase,
  Plus,
  Trash2
} from "lucide-react";
import { interviewApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";

const Interviews = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "Library", icon: Globe },
    { id: "technical", label: "Technical", icon: Code },
    { id: "behavioral", label: "Behavioral", icon: Users },
    { id: "system-design", label: "Architecture", icon: Database },
  ];

  const getCategoryStyle = (category: string) => {
    const categoryLower = category.toLowerCase().replace("_", "-");
    const styles: Record<string, { icon: any; color: string; badge: string }> = {
      technical: { icon: Code, color: "text-blue-500", badge: "bg-blue-500/10" },
      behavioral: { icon: Users, color: "text-green-500", badge: "bg-green-500/10" },
      "system-design": { icon: Database, color: "text-purple-500", badge: "bg-purple-500/10" },
      "case-study": { icon: Briefcase, color: "text-orange-500", badge: "bg-orange-500/10" },
    };
    return styles[categoryLower] || { icon: Globe, color: "text-primary", badge: "bg-primary/10" };
  };

  useEffect(() => {
    const fetchInterviews = async () => {
      setIsLoading(true);
      try {
        const data = await interviewApi.getAllInterviews(getToken);
        setInterviews(data);
      } catch (err: any) {
        setError(err.message || "Failed to load interviews");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterviews();
  }, [getToken]);

  const handleDelete = async (id: string) => {
    try {
      await interviewApi.deleteInterview(id, getToken);
      setInterviews(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete interview");
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (interview.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      interview.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse font-medium">Synchronizing Lab...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-center md:text-left">
          <div className="space-y-1.5">
            <h1 className="text-4xl font-bold font-display tracking-tight">Interview <span className="text-primary italic font-medium">Lab.</span></h1>
            <p className="text-muted-foreground text-sm">Select your simulation domain and begin precision training.</p>
          </div>
          <Button 
            size="lg"
            onClick={() => router.push("/interviews/create")}
            className="rounded-xl h-11 px-6 gradient-primary shadow-glow hover:shadow-primary/40 transition-all font-bold text-xs"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Mock
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10 items-center">
          <div className="relative w-full lg:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search simulations..."
              className="pl-11 h-12 rounded-xl border-border/50 bg-muted/20 focus:bg-background focus:shadow-soft transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full pb-1 no-scrollbar lg:justify-end">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl h-11 px-6 gap-2 min-w-fit whitespace-nowrap transition-all uppercase text-[10px] font-bold tracking-widest ${
                  selectedCategory === cat.id 
                    ? "gradient-primary text-white shadow-glow border-none" 
                    : "bg-muted/30 border border-border/10 text-muted-foreground hover:bg-muted"
                }`}
              >
                <cat.icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredInterviews.map((interview, i) => {
              const style = getCategoryStyle(interview.category);
              return (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="group relative rounded-3xl border-border/50 bg-background hover:bg-muted/10 hover:border-primary/20 transition-all overflow-hidden flex flex-col h-full">
                    <CardHeader className="p-6 pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2.5 rounded-xl ${style.badge} ${style.color} border border-border/10`}>
                          <style.icon className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-lg border border-border/50">
                          <StarIcon className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span className="text-[10px] font-bold tracking-tighter">{(interview.rating || 5).toFixed(1)}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg font-bold tracking-tight mb-2 group-hover:text-primary transition-colors leading-tight">{interview.title}</CardTitle>
                      <CardDescription className="text-xs leading-relaxed line-clamp-2 italic text-muted-foreground/80 font-medium">
                        {interview.description || "Industry-standard rigorous simulation"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 mt-auto space-y-4">
                      <div className="flex items-center justify-between pt-4 border-t border-border/10">
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {interview.duration}m</span>
                        </div>
                        <Badge variant="outline" className="rounded-lg border-border/50 text-[9px] font-bold uppercase tracking-widest bg-muted/30 px-3 py-0.5">
                          {interview.difficulty || 'Intermediate'}
                        </Badge>
                      </div>
                      <Link href={`/interviews/room/${interview.id}`} className="block">
                        <Button className="w-full h-11 rounded-xl font-bold gap-2 bg-muted/50 text-foreground border-none group-hover:gradient-primary group-hover:text-white transition-all text-xs">
                          Start Session <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                      
                      {!interview.isTemplate && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (confirm("Permanently deconstruct this simulation?")) {
                              handleDelete(interview.id);
                            }
                          }}
                          className="w-full h-9 rounded-xl font-bold gap-2 text-destructive hover:bg-destructive/10 text-[10px] uppercase tracking-widest mt-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Deconstruct Module
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {!isLoading && filteredInterviews.length === 0 && (
          <div className="text-center py-32 bg-muted/20 rounded-3xl border border-border/30 border-dashed">
             <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft border border-border/50">
                <Search className="h-8 w-8 text-muted-foreground/40" />
             </div>
             <p className="text-2xl font-bold mb-2">No modules found</p>
             <p className="text-muted-foreground">Try adjusting your keyword or category selection.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Interviews;
