"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  MessageSquare,
  Clock,
  Lightbulb,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Star as StarIcon,
  Loader2,
  Activity,
  Zap,
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Code,
} from "lucide-react";
import Link from "next/link";
import { interviewSessionApi, voiceApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";

// Per-question analysis panel
const QuestionHelpPanel = ({
  question,
  answer,
  getToken,
}: {
  question: string;
  answer: string | null;
  getToken: () => Promise<string | null>;
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (analysis) {
      setOpen((o) => !o);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setOpen(true);
      const result = await voiceApi.analyzeAnswer(question, answer, getToken);
      setAnalysis(result.analysis);
    } catch (err: any) {
      setError(err.message || "Failed to analyze answer.");
    } finally {
      setLoading(false);
    }
  }, [analysis, question, answer, getToken]);

  return (
    <div className="mt-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleAnalyze}
        disabled={loading}
        className="gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-500/70 hover:bg-amber-500/5 hover:text-amber-400 h-8 px-4 rounded-xl transition-all"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : analysis ? (
          open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <HelpCircle className="h-3.5 w-3.5" />
        )}
        {loading ? "Analyzing..." : analysis ? (open ? "Hide Analysis" : "Show AI Analysis") : "What's Missing?"}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/15 relative">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">AI Coach Analysis</span>
              </div>
              {error ? (
                <div className="flex items-start gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">{analysis}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-12">
        {/* Success Header */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative overflow-hidden rounded-3xl border border-border/50 bg-muted/30 backdrop-blur-sm py-8 px-6 text-center mb-8"
        >
           <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
           
           <div className="relative z-10 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-16 h-16 rounded-full gradient-primary shadow-glow flex items-center justify-center mx-auto"
              >
                <Trophy className="h-8 w-8 text-white" />
              </motion.div>
              
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight">Session <span className="text-primary italic">Dossier.</span></h1>
                <p className="text-sm md:text-base text-muted-foreground">{interview.title} • Performance Analysis</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                 <Button 
                   variant="outline" 
                   className="rounded-xl h-10 px-5 border-border/50 hover:bg-primary/5 hover:text-primary transition-all text-xs font-bold"
                   onClick={() => window.print()}
                 >
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Export Report
                 </Button>
              </div>
           </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Detailed Feedback List */}
          <div className="lg:col-span-2 space-y-6">
             <section className="space-y-4">
                <h2 className="text-xl font-bold font-display">Competency Heatmap</h2>
                <Card className="rounded-2xl border-border/50 bg-background overflow-hidden shadow-soft">
                   <CardContent className="p-6 md:p-8">
                      <div className="grid sm:grid-cols-2 gap-6">
                         {skillScores.map((skill: any, i: number) => (
                           <div key={i} className="space-y-2">
                              <div className="flex justify-between items-end">
                                 <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Target Skill</p>
                                    <p className="font-bold text-sm">{skill.skillName}</p>
                                 </div>
                                 <span className="text-lg font-bold font-display text-primary">{Math.round(skill.score)}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
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
                        <div className="mt-6 p-5 rounded-2xl bg-muted/20 border border-border/50 italic text-muted-foreground text-sm leading-relaxed">
                           &ldquo;{results.summary}&rdquo;
                        </div>
                      )}
                   </CardContent>
                </Card>
             </section>

             <section className="space-y-4">
                <h2 className="text-xl font-bold font-display">Phase Feedback</h2>
                <div className="space-y-4">
                   {questions.map((q: any, i: number) => (
                     <Card key={i} className="group rounded-2xl border-border/50 bg-background hover:border-primary/30 transition-all overflow-hidden">
                        <CardContent className="p-5 md:p-6">
                           <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center font-bold text-sm">
                                    {i + 1}
                                 </div>
                                 <p className="font-bold text-sm md:text-base max-w-sm sm:max-w-md line-clamp-1">{q.question}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                 <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 rounded-lg border border-primary/10">
                                    <StarIcon className="h-3.5 w-3.5 fill-primary text-primary" />
                                    <span className="font-bold text-xs text-primary">{q.score || 0}%</span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <div className="flex items-center gap-1.5 text-emerald-500 text-[9px] font-bold uppercase tracking-widest">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Strength Points
                                 </div>
                                 <p className="text-xs text-muted-foreground leading-relaxed italic">
                                    {q.feedback?.split('\n')[0] || "Response structural integrity maintained."}
                                 </p>
                              </div>
                              <div className="space-y-2">
                                 <div className="flex items-center gap-1.5 text-primary-base text-[9px] font-bold uppercase tracking-widest">
                                    <Lightbulb className="h-3.5 w-3.5 text-orange-500" /> Focus Point
                                 </div>
                                 <p className="text-xs text-muted-foreground leading-relaxed italic">
                                    {q.feedback?.split('\n')[1] || "Focus on elaborating the 'Action' phase."}
                                 </p>
                              </div>
                           </div>

                            {/* Your answer / submitted code */}
                            {q.answer && (
                               q.codeReview ? (
                                 <div className="mt-4 p-4 rounded-xl bg-black/90 text-zinc-100 border border-border/30 font-mono text-xs overflow-x-auto leading-relaxed max-h-[300px] custom-scrollbar">
                                    <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                                       <Code className="h-3.5 w-3.5 text-primary" /> Submitted Code Solution
                                    </div>
                                    <pre className="whitespace-pre">{q.answer}</pre>
                                 </div>
                               ) : (
                                 <div className="mt-4 p-3.5 rounded-xl bg-muted/20 border border-border/30">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
                                       <MessageSquare className="h-3 w-3" /> Your Answer
                                    </p>
                                    <p className="text-xs text-muted-foreground/80 italic leading-relaxed line-clamp-2">
                                       &ldquo;{q.answer}&rdquo;
                                    </p>
                                 </div>
                               )
                            )}

                            {/* Code Review details */}
                            {q.codeReview && (
                               <div className="mt-4 grid sm:grid-cols-2 gap-4 border-t border-zinc-800 pt-4">
                                  <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10">
                                     <h5 className="text-[9px] font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-1">
                                        <Zap className="h-3 w-3" /> Runtime Complexity
                                     </h5>
                                     <p className="text-xs text-muted-foreground leading-relaxed">
                                        {q.codeReview.runtimeComplexity}
                                     </p>
                                  </div>
                                  <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                     <h5 className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 mb-2 flex items-center gap-1">
                                        <Activity className="h-3 w-3" /> Space Complexity
                                     </h5>
                                     <p className="text-xs text-muted-foreground leading-relaxed">
                                        {q.codeReview.spatialComplexity}
                                     </p>
                                  </div>
                                  <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 sm:col-span-2">
                                     <h5 className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 mb-2 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Correctness & Edge Cases
                                     </h5>
                                     <p className="text-xs text-muted-foreground leading-relaxed">
                                        {q.codeReview.correctness}
                                     </p>
                                  </div>
                                  <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 sm:col-span-2">
                                     <h5 className="text-[9px] font-bold uppercase tracking-widest text-amber-500 mb-2 flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" /> Clean Code & Style
                                     </h5>
                                     <p className="text-xs text-muted-foreground leading-relaxed">
                                        {q.codeReview.cleanCode}
                                     </p>
                                  </div>
                               </div>
                            )}

                           {/* Pacing and Speech indicators */}
                           {(q.wpm !== null && q.wpm !== undefined) && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                 <Badge variant="secondary" className="rounded-lg text-[10px] py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    <Clock className="mr-1 h-3 w-3 inline" /> {q.wpm} WPM Pacing
                                 </Badge>
                                 <Badge variant="secondary" className={`rounded-lg text-[10px] py-1 border ${
                                    q.fillerCount > 3 ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                                 }`}>
                                    <MessageSquare className="mr-1 h-3 w-3 inline" /> {q.fillerCount} Filler Words
                                 </Badge>
                              </div>
                           )}

                           {/* Per-question AI Help */}
                           <QuestionHelpPanel
                              question={q.question}
                              answer={q.answer}
                              getToken={getToken}
                           />
                        </CardContent>
                     </Card>
                   ))}
                </div>
             </section>
          </div>

          {/* Performance Sidebar */}
          <div className="space-y-6">
             <div className="space-y-4">
                <h2 className="text-xl font-bold font-display">Performance Score</h2>
                <Card className="rounded-2xl gradient-dark border-none shadow-glow p-8 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Activity className="h-12 w-12" />
                   </div>
                   <div className="relative z-10 text-center space-y-4">
                      <div className="text-5xl md:text-6xl font-bold font-display tracking-tightest">
                         {Math.round(overallScore || 0)}<span className="text-2xl text-white/40">%</span>
                      </div>
                      <div className="space-y-1">
                         <p className="font-bold uppercase tracking-widest text-[9px] opacity-60">Global Performance</p>
                         <Badge className="bg-white/20 text-white border-white/30 px-5 py-1 text-xs rounded-full backdrop-blur-md border shadow-lg">
                           {overallScore >= 80 ? 'Exceptional' : overallScore >= 60 ? 'Competitive' : 'Developing'}
                         </Badge>
                      </div>
                   </div>
                </Card>
             </div>

             <Card className="rounded-2xl border-border/50 bg-muted/20 backdrop-blur-sm p-6">
                <CardHeader className="p-0 mb-4">
                   <CardTitle className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-primary" /> Metrics Summary
                   </CardTitle>
                </CardHeader>
                <div className="space-y-4">
                   <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Duration</span>
                      <span className="font-bold text-foreground">{interview.duration}m</span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Analyzed Items</span>
                      <span className="font-bold text-foreground">{questions.length} Sessions</span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Skill Difficulty</span>
                      <Badge variant="secondary" className="rounded-lg text-xs py-0.5">{interview.difficulty}</Badge>
                   </div>
                   
                   <div className="pt-4 border-t border-border/10 space-y-3">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Validation Review</p>
                      <div className="flex gap-1.5">
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
                            <StarIcon className={`h-5 w-5 transition-all ${
                              (hoverRating || rating) >= star ? 'fill-yellow-500 text-yellow-500 scale-110' : 'text-muted-foreground hover:text-yellow-400'
                            }`} />
                          </button>
                        ))}
                      </div>
                   </div>
                </div>
             </Card>

             <div className="space-y-3">
                <Link href="/interviews" className="block">
                  <Button size="lg" className="w-full h-11 rounded-xl font-bold gradient-primary shadow-soft text-xs">
                    <RotateCcw className="mr-2 h-4 w-4" /> Retake Simulation
                  </Button>
                </Link>
                <Link href="/dashboard" className="block">
                  <Button variant="outline" size="lg" className="w-full h-11 rounded-xl font-bold border-border/50 text-xs">
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