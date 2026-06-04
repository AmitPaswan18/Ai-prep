"use client";

import { useState, useEffect } from "react";
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
   TrendingUp,
   TrendingDown,
   Target,
   Lightbulb,
   BookOpen,
   ChevronRight,
   AlertTriangle,
   CheckCircle2,
   BarChart3,
   Loader2,
   Zap,
   Activity,
   Compass,
   ArrowUpRight,
   Trophy,
   BrainCircuit,
   Timer,
   ShieldCheck,
   Flame,
} from "lucide-react";
import {
   RadarChart,
   PolarGrid,
   PolarAngleAxis,
   PolarRadiusAxis,
   Radar,
   ResponsiveContainer,
   LineChart,
   Line,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   BarChart,
   Bar,
   Cell,
} from "recharts";
import Link from "next/link";
import { analyticsApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";

const Analytics = () => {
   const { getToken } = useAuth();
   const [loading, setLoading] = useState(true);
   const [statsData, setStatsData] = useState({
      sessionsDone: 0,
      totalPractice: 0,
      averageScore: 0,
      topScore: 0,
      comparativeRank: "Top 100%",
      averageWpm: 0,
      averageFillerCount: 0
   });
   const [skillRadarData, setSkillRadarData] = useState<any[]>([]);
   const [progressData, setProgressData] = useState<any[]>([]);
   const [categoryData, setCategoryData] = useState<any[]>([]);

   useEffect(() => {
      const fetchAnalytics = async () => {
         try {
            setLoading(true);
            const data = await analyticsApi.getAnalyticsData(getToken);
            setStatsData({
               sessionsDone: data.sessionsDone,
               totalPractice: data.totalPractice,
               averageScore: data.averageScore,
               topScore: data.topScore,
               comparativeRank: data.comparativeRank,
               averageWpm: data.averageWpm,
               averageFillerCount: data.averageFillerCount
            });
            setSkillRadarData(data.skillRadarData);
            setCategoryData(data.categoryData);
            setProgressData(data.progressData);
         } catch (error) {
            console.error("Analytics fetch error:", error);
         } finally {
            setLoading(false);
         }
      };
      fetchAnalytics();
   }, [getToken]);

   const stats = [
      { label: "Overall Score", value: `${statsData.averageScore}%`, icon: Target, trend: "+4.2%", color: "text-primary" },
      { label: "Sessions Done", value: statsData.sessionsDone, icon: BrainCircuit, trend: "Stable", color: "text-emerald-500" },
      { label: "Total Practice", value: `${statsData.totalPractice}m`, icon: Timer, trend: "+12m", color: "text-amber-500" },
      { label: "Comparative Rank", value: statsData.comparativeRank, icon: Trophy, trend: "Rising", color: "text-indigo-500" },
   ];

   const weakestAreas = skillRadarData
      .filter((s) => s.score < 75)
      .sort((a, b) => a.score - b.score)
      .slice(0, 4);

   const strongestAreas = skillRadarData
      .filter((s) => s.score >= 80)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

   const learningPlan = weakestAreas.map((area, index) => ({
      id: `plan-${index}`,
      topic: `${area.skill} Optimization`,
      reason: `Recent assessments indicate ${area.score}% accuracy. Focused practice recommended to reach senior standards.`,
      priority: area.score < 65 ? "critical" : "strategic",
      suggestedTime: "45-60m",
      icon: area.score < 65 ? AlertTriangle : ShieldCheck
   }));

   if (loading) {
      return (
         <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground animate-pulse font-medium">Preparing Analytics...</p>
         </div>
      );
   }

   if (statsData.sessionsDone === 0) {
      return (
         <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
            <Navbar />
            <div className="max-w-md w-full text-center space-y-8">
               <div className="w-24 h-24 rounded-[2.5rem] bg-muted/30 mx-auto flex items-center justify-center border border-border/50 shadow-soft">
                  <Zap className="h-12 w-12 text-muted-foreground/30" />
               </div>
               <div className="space-y-3">
                  <h2 className="text-4xl font-bold font-display tracking-tight">Performance <span className="text-primary italic">Gap.</span></h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">You haven't completed any interviews yet. Start one to see your performance metrics.</p>
               </div>
               <Link href="/interviews" className="block pt-4">
                  <Button size="lg" className="w-full h-14 rounded-2xl font-bold gradient-primary shadow-glow text-lg">Start First Interview</Button>
               </Link>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-background selection:bg-primary/20">
         <Navbar />

         <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">

            {/* Header and Filter */}
            <section className="mb-12">
               <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10 text-center md:text-left">
                  <div className="space-y-1.5">
                     <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tightest">Skill <span className="text-primary italic">Analytics.</span></h1>
                     <p className="text-muted-foreground">Comprehensive performance tracking and skill diagnostic reports.</p>
                  </div>
                  <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl border border-border/50">
                     <Button variant="ghost" size="sm" className="rounded-lg px-4 h-9 font-bold text-[10px] uppercase tracking-widest bg-background shadow-soft">6 Months</Button>
                     <Button variant="ghost" size="sm" className="rounded-lg px-4 h-9 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">All Time</Button>
                  </div>
               </div>

               {/* Metrics Grid */}
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, i) => (
                     <Card key={i} className="rounded-2xl border-border/50 bg-muted/20 p-6 space-y-3 hover:bg-muted/30 transition-all">
                        <div className="flex items-center justify-between">
                           <div className={`p-2 rounded-lg bg-background shadow-soft ${stat.color}`}>
                              <stat.icon className="h-4 w-4" />
                           </div>
                           <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">{stat.trend}</span>
                        </div>
                        <div className="space-y-0.5">
                           <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                        </div>
                     </Card>
                  ))}
               </div>
            </section>

            {/* Primary Intelligence Row */}
            <div className="grid lg:grid-cols-7 gap-6 mb-12">
               {/* Neural Map */}
               <Card className="lg:col-span-4 rounded-[2.5rem] border-border/50 bg-background shadow-soft p-8 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-8 relative z-10">
                     <div className="space-y-1">
                        <h3 className="text-lg font-bold font-display flex items-center gap-2">
                           <Activity className="h-4 w-4 text-primary" /> Skill Distribution
                        </h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Your performance across different competency areas</p>
                     </div>
                     <Badge variant="outline" className="rounded-lg border-border/50 text-[9px] font-bold uppercase tracking-widest px-3 py-0.5 bg-muted/20">Real-time Engine</Badge>
                  </div>

                  <div className="h-[350px] relative z-10">
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillRadarData}>
                           <PolarGrid stroke="rgba(0,0,0,0.05)" />
                           <PolarAngleAxis dataKey="skill" tick={{ fill: "rgba(0,0,0,0.4)", fontSize: 10, fontWeight: 700 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Accuracy" dataKey="score" stroke="#C065F5" fill="#C065F5" fillOpacity={0.15} strokeWidth={3} />
                        </RadarChart>
                     </ResponsiveContainer>
                  </div>
               </Card>

               {/* Performance Modules */}
               <div className="lg:col-span-3 space-y-6">
                  <Card className="rounded-[2.5rem] border-border/50 bg-muted/30 p-8 space-y-6 h-full flex flex-col">
                     <div className="space-y-1 mb-2">
                        <h3 className="text-lg font-bold font-display flex items-center gap-2">
                           <BarChart3 className="h-4 w-4 text-primary" /> Domain Mastery
                        </h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Aggregate performance per category</p>
                     </div>

                     <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                        {categoryData.length > 0 ? categoryData.map((cat, i) => (
                           <div key={i} className="space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                                 <span>{cat.name}</span>
                                 <span className={cat.score >= 80 ? 'text-emerald-500' : 'text-primary'}>{cat.score}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                 <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${cat.score}%` }}
                                    className={`h-full ${cat.score >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'gradient-primary shadow-glow'}`}
                                 />
                              </div>
                           </div>
                        )) : (
                           <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 italic text-sm">
                              Insufficient domain data
                           </div>
                        )}
                     </div>

                     <div className="grid grid-cols-2 gap-3 pt-4">
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                           <p className="text-[9px] font-bold text-emerald-500 uppercase mb-1">Peak Perf</p>
                           <p className="text-xs font-bold truncate">{strongestAreas[0]?.skill || 'Ready'}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                           <p className="text-[9px] font-bold text-primary uppercase mb-1">Growth Gap</p>
                           <p className="text-xs font-bold truncate">{weakestAreas[0]?.skill || 'Identifying'}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                           <p className="text-[9px] font-bold text-amber-500 uppercase mb-1">Avg Pacing</p>
                           <p className="text-xs font-bold truncate">{statsData.averageWpm} WPM</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                           <p className="text-[9px] font-bold text-indigo-500 uppercase mb-1">Avg Fillers</p>
                           <p className="text-xs font-bold truncate">{statsData.averageFillerCount} per answer</p>
                        </div>
                     </div>
                  </Card>
               </div>
            </div>

            {/* Secondary Diagnostic Row */}
            <div className="grid lg:grid-cols-3 gap-8 items-start">
               {/* Strategic Roadmap */}
               <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-1">
                     <h2 className="text-2xl font-bold font-display">Improvement Roadmap</h2>
                     <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-4">Personalized recommendations for growth</p>
                  </div>
                  <div className="space-y-3">
                     {learningPlan.map((plan, i) => (
                        <motion.div
                           key={i}
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.1 }}
                           className="p-5 rounded-2xl border border-border/50 bg-background hover:bg-muted/10 transition-all flex items-start gap-4"
                        >
                           <div className={`p-3 rounded-xl ${plan.priority === 'critical' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-500'}`}>
                              <plan.icon className="h-5 w-5" />
                           </div>
                           <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                 <h4 className="font-bold text-sm">{plan.topic}</h4>
                                 <Badge variant="outline" className={`rounded-lg text-[8px] font-black uppercase tracking-widest border-none ${plan.priority === 'critical' ? 'bg-primary/20 text-primary' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                    {plan.priority}
                                 </Badge>
                              </div>
                              <p className="text-muted-foreground text-xs leading-relaxed">{plan.reason}</p>
                           </div>
                        </motion.div>
                     ))}
                     {learningPlan.length === 0 && (
                        <div className="p-8 rounded-2xl border border-dashed border-border/50 text-center italic text-muted-foreground text-xs">
                           Insufficient session data to generate roadmap.
                        </div>
                     )}
                  </div>
               </div>

               {/* Velocity and Action */}
               <div className="space-y-6">
                  <div className="space-y-1">
                     <h2 className="text-2xl font-bold font-display">Velocity Trend</h2>
                     <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-4">Accuracy projection</p>
                  </div>

                  <Card className="rounded-[2rem] border-border/50 bg-background shadow-soft p-6 h-[250px] relative overflow-hidden">
                     {progressData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                           {/* Mini decorative graph lines */}
                           <div className="flex items-end gap-1.5 opacity-10">
                              {[30, 48, 38, 62, 55, 75].map((h, i) => (
                                 <div key={i} className="w-3 rounded-t-sm bg-primary" style={{ height: `${h}px` }} />
                              ))}
                           </div>
                           <div className="space-y-1.5">
                              <p className="text-sm font-bold text-muted-foreground/70">No trend data yet</p>
                              <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-medium leading-relaxed max-w-[180px]">
                                 Complete more sessions to see your accuracy projection here
                              </p>
                           </div>
                           <Link href="/interviews">
                              <Button size="sm" variant="outline" className="rounded-xl text-[10px] font-bold uppercase tracking-widest border-primary/30 text-primary hover:bg-primary/5 h-8 px-4">
                                 Start Session →
                              </Button>
                           </Link>
                        </div>
                     ) : (
                        <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={progressData}>
                              <XAxis dataKey="month" stroke="rgba(0,0,0,0.3)" fontSize={9} axisLine={false} tickLine={false} />
                              <Tooltip
                                 contentStyle={{ background: '#000', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '10px' }}
                                 itemStyle={{ color: '#C065F5' }}
                              />
                              <Line
                                 type="monotone"
                                 dataKey="score"
                                 stroke="#C065F5"
                                 strokeWidth={3}
                                 dot={{ r: 4, fill: "#C065F5", strokeWidth: 2, stroke: "#fff" }}
                                 activeDot={{ r: 6, strokeWidth: 0 }}
                              />
                           </LineChart>
                        </ResponsiveContainer>
                     )}
                  </Card>

                  <Card className="rounded-[2rem] gradient-primary text-white p-8 space-y-6 shadow-glow border-none relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                        <Flame className="h-20 w-20" />
                     </div>
                     <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-2">
                           <ShieldCheck className="h-5 w-5" />
                           <span className="font-bold uppercase tracking-widest text-[10px]">Next Step</span>
                        </div>
                        <div>
                           <h3 className="text-xl font-bold leading-tight mb-2">Strengthen {weakestAreas[0]?.skill || 'Core'} Skills</h3>
                           <p className="text-white/80 text-xs leading-relaxed">Intelligence analysis identifies this domain as the #1 growth multiplier for your next career tier.</p>
                        </div>
                        <Link href="/interviews" className="block pt-2">
                           <Button variant="secondary" className="w-full h-12 rounded-xl font-bold text-primary group text-xs">
                              Launch Dedicated Lab <ArrowUpRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                           </Button>
                        </Link>
                     </div>
                  </Card>
               </div>
            </div>

         </main>
      </div>
   );
};

export default Analytics;
