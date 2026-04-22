"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  TrendingUp,
  MessageSquare,
  Clock,
  Target,
  Lightbulb,
  Download,
  Share2,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Star as StarIcon,
  Loader2,
  ArrowUpRight,
  Activity,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { interviewSessionApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";

const Results = () => {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const interviewId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const results = await interviewSessionApi.getResults(interviewId, getToken);
        setData(results);
        if (results?.interview?.rating) setRating(results.interview.rating);
      } catch (err: any) {
        setError(err.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };
    if (interviewId) fetchResults();
  }, [interviewId, getToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse font-medium">Processing Neural Feedback...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sync Error</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">{error}</p>
        <Button size="lg" className="rounded-2xl" onClick={() => router.push("/dashboard")}>Return to Base</Button>
      </div>
    );
  }

  const { interview, results, questions, skillScores } = data;
  const overallScore = results.overallScore;

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Success Header */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative overflow-hidden rounded-[3rem] border border-border/50 bg-muted/30 backdrop-blur-sm p-12 text-center mb-12"
        >
           <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
           
           <div className="relative z-10 space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-24 h-24 rounded-full gradient-primary shadow-glow flex items-center justify-center mx-auto"
              >
                <Trophy className="h-12 w-12 text-white" />
              </motion.div>
              
              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight">Session <span className="text-primary italic">Dossier.</span></h1>
                <p className="text-xl text-muted-foreground">{interview.title} • Performance Analysis</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                 <Button 
                   variant="outline" 
                   className="rounded-2xl h-12 px-6 border-border/50 hover:bg-primary/5 hover:text-primary transition-all"
                   onClick={() => window.print()}
                 >
                    <Download className="mr-2 h-4 w-4" /> Export Report
                 </Button>
              </div>
           </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Detailed Feedback List */}
          <div className="lg:col-span-2 space-y-12">
             <section className="space-y-6">
                <h2 className="text-2xl font-bold font-display">Competency Heatmap</h2>
                <Card className="rounded-[2.5rem] border-border/50 bg-background overflow-hidden shadow-soft">
                   <CardContent className="p-10">
                      <div className="grid sm:grid-cols-2 gap-10">
                         {skillScores.map((skill: any, i: number) => (
                           <div key={i} className="space-y-4">
                              <div className="flex justify-between items-end">
                                 <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Target Skill</p>
                                    <p className="font-bold">{skill.skillName}</p>
                                 </div>
                                 <span className="text-2xl font-bold font-display text-primary">{Math.round(skill.score)}%</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${skill.score}%` }}
                                   className="h-full gradient-primary"
                                 />
                              </div>
                           </div>
                         ))}
                      </div>
                      
                      {results.summary && (
                        <div className="mt-12 p-8 rounded-3xl bg-muted/20 border border-border/50 italic text-muted-foreground">
                           "{results.summary}"
                        </div>
                      )}
                   </CardContent>
                </Card>
             </section>

             <section className="space-y-6">
                <h2 className="text-2xl font-bold font-display">Phase Feedback</h2>
                <div className="space-y-6">
                   {questions.map((q: any, i: number) => (
                     <Card key={i} className="group rounded-[2rem] border-border/50 bg-background hover:border-primary/30 transition-all overflow-hidden">
                        <CardContent className="p-8">
                           <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-bold text-lg">
                                    {i + 1}
                                 </div>
                                 <p className="font-bold text-lg max-w-md line-clamp-1">{q.question}</p>
                              </div>
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10">
                                 <StarIcon className="h-4 w-4 fill-primary text-primary" />
                                 <span className="font-bold text-primary">{q.score || 0}%</span>
                              </div>
                           </div>
                           
                           <div className="grid sm:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                 <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                                    <CheckCircle2 className="h-4 w-4" /> Strength Points
                                 </div>
                                 <p className="text-sm text-muted-foreground leading-relaxed italic">
                                    {q.feedback?.split('\n')[0] || "Response structural integrity maintained."}
                                 </p>
                              </div>
                              <div className="space-y-4">
                                 <div className="flex items-center gap-2 text-primary-base text-[10px] font-bold uppercase tracking-widest">
                                    <Lightbulb className="h-4 w-4 text-orange-500" /> Focus Point
                                 </div>
                                 <p className="text-sm text-muted-foreground leading-relaxed italic">
                                    {q.feedback?.split('\n')[1] || "Focus on elaborating the 'Action' phase."}
                                 </p>
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                   ))}
                </div>
             </section>
          </div>

          {/* Performance Sidebar */}
          <div className="space-y-8">
             <h2 className="text-2xl font-bold font-display">Performance Score</h2>
             <Card className="rounded-[2.5rem] gradient-dark border-none shadow-glow p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                   <Activity className="h-16 w-16" />
                </div>
                <div className="relative z-10 text-center space-y-6">
                   <div className="text-7xl font-bold font-display tracking-tightest">
                      {overallScore}<span className="text-3xl text-white/40">%</span>
                   </div>
                   <div className="space-y-2">
                      <p className="font-bold uppercase tracking-widest text-xs opacity-60">Global Rating</p>
                      <Badge className="bg-white/10 text-white border-white/20 px-6 py-2 rounded-full backdrop-blur-md">
                        {overallScore >= 80 ? 'Exceptional' : overallScore >= 60 ? 'Competitive' : 'Developing'}
                      </Badge>
                   </div>
                </div>
             </Card>

             <Card className="rounded-[2.5rem] border-border/50 bg-muted/20 backdrop-blur-sm p-8">
                <CardHeader className="p-0 mb-6">
                   <CardTitle className="text-sm uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" /> Metrics Summary
                   </CardTitle>
                </CardHeader>
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Duration</span>
                      <span className="font-bold">{interview.duration}m</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Analyzed Items</span>
                      <span className="font-bold">{questions.length} Sessions</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Skill Difficulty</span>
                      <Badge variant="secondary" className="rounded-lg">{interview.difficulty}</Badge>
                   </div>
                   
                   <div className="pt-6 border-t border-border/10 space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Validation Review</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            disabled={isRating}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={async () => {
                              try {
                                setIsRating(true);
                                const { interviewApi } = await import("@/lib/api");
                                await interviewApi.rateInterview(interviewId, star, getToken);
                                setRating(star);
                              } catch (err) {} finally { setIsRating(false); }
                            }}
                          >
                            <StarIcon className={`h-6 w-6 transition-all ${
                              (hoverRating || rating) >= star ? 'fill-yellow-500 text-yellow-500 scale-110' : 'text-muted-foreground hover:text-yellow-400'
                            }`} />
                          </button>
                        ))}
                      </div>
                   </div>
                </div>
             </Card>

             <div className="space-y-4">
                <Link href="/interviews" className="block">
                  <Button size="lg" className="w-full h-14 rounded-2xl font-bold gradient-primary shadow-soft">
                    <RotateCcw className="mr-3 h-5 w-5" /> Retake Simulation
                  </Button>
                </Link>
                <Link href="/dashboard" className="block">
                  <Button variant="outline" size="lg" className="w-full h-14 rounded-2xl font-bold border-border/50">
                    Exit Dossier
                  </Button>
                </Link>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;