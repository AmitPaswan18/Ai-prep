"use client";

import { useState, useEffect } from "react";
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    FileText, 
    Upload, 
    CheckCircle2, 
    X, 
    Loader2, 
    Trash2, 
    AlertCircle,
    Info,
    ArrowUpRight
} from "lucide-react";
import { userApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

export const ResumeUpload = () => {
    const { getToken } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [resumeData, setResumeData] = useState<{
        hasResume: boolean;
        updatedAt: string | null;
        snippet: string | null;
        resumeAnalysis: {
            score: number;
            summary: string;
            formattingScore: number;
            skillsScore: number;
            experienceScore: number;
            strengths: string[];
            weaknesses: string[];
            improvements: string[];
        } | null;
    } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'report' | 'remedy'>('report');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, [getToken]);

    const fetchStatus = async () => {
        try {
            setIsLoading(true);
            const data = await userApi.getResume(getToken);
            setResumeData(data);
        } catch (error) {
            console.error("Error fetching resume status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const allowedTypes = [
            'application/pdf', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "Invalid file type",
                description: "Please upload a PDF, DOCX, or TXT file.",
                variant: "destructive"
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            toast({
                title: "File too large",
                description: "Please upload a file smaller than 5MB.",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsUploading(true);
            await userApi.uploadResume(file, getToken);
            toast({
                title: "Resume Analyzed",
                description: "Your professional context has been extracted and updated.",
            });
            fetchStatus();
        } catch (error: any) {
            toast({
                title: "Processing Failed",
                description: error.message || "Could not parse the resume.",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await userApi.deleteResume(getToken);
            toast({
                title: "Context Removed",
                description: "Your resume data has been cleared from your profile.",
            });
            setResumeData({ hasResume: false, updatedAt: null, snippet: null, resumeAnalysis: null });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to remove resume.",
                variant: "destructive"
            });
        }
    };

    const handleGenerateTailored = async () => {
        try {
            setIsGenerating(true);
            const session = await interviewApi.generateTailoredSession(getToken);
            toast({
                title: "Mock Interview Generated",
                description: "Redirecting you to start your resume-tailored practice session.",
            });
            router.push(`/interviews/room/${session.id}`);
        } catch (error: any) {
            toast({
                title: "Generation Failed",
                description: error.message || "Failed to generate tailored mock module.",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="rounded-[2rem] border-border/50 bg-muted/20 animate-pulse h-[200px]" />
        );
    }

    return (
        <Card className="rounded-[2rem] border-border/50 bg-background overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText className="h-24 w-24" />
            </div>
            
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="px-3 rounded-lg border-primary/20 text-primary bg-primary/5 uppercase text-[9px] font-bold tracking-widest">
                        Context Awareness
                    </Badge>
                    {resumeData?.hasResume && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                            <CheckCircle2 className="h-3 w-3" /> Ready
                        </div>
                    )}
                </div>
                <CardTitle className="text-xl font-bold font-display">Professional Persona</CardTitle>
                <CardDescription className="text-xs">
                    Upload your resume to tailor interview questions to your specific expertise and experience.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <AnimatePresence mode="wait">
                    {resumeData?.hasResume ? (
                        <motion.div 
                            key="has-resume"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-5"
                        >
                            {resumeData.resumeAnalysis && (
                                <div className="flex gap-2 border-b border-border/50 pb-3">
                                    <button 
                                        onClick={() => setActiveTab('report')}
                                        className={`flex-1 py-1.5 rounded-xl font-bold uppercase text-[9px] tracking-wider transition-all ${
                                            activeTab === 'report' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-transparent text-muted-foreground hover:bg-muted/30'
                                        }`}
                                    >
                                        ATS Scorecard
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('remedy')}
                                        className={`flex-1 py-1.5 rounded-xl font-bold uppercase text-[9px] tracking-wider transition-all ${
                                            activeTab === 'remedy' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-transparent text-muted-foreground hover:bg-muted/30'
                                        }`}
                                    >
                                        Improvements ({resumeData.resumeAnalysis.improvements.length})
                                    </button>
                                </div>
                            )}

                            {activeTab === 'report' ? (
                                <div className="space-y-4">
                                    {resumeData.resumeAnalysis ? (
                                        <div className="flex items-center gap-6 p-4 rounded-2xl bg-muted/20 border border-border/40">
                                            {/* Circular Gauge */}
                                            <div className="relative flex items-center justify-center shrink-0">
                                                <svg className="w-18 h-18 transform -rotate-90">
                                                    <circle cx="36" cy="36" r="30" className="stroke-muted/30" strokeWidth="4.5" fill="transparent" />
                                                    <circle cx="36" cy="36" r="30" className="stroke-primary" strokeWidth="4.5" fill="transparent"
                                                            strokeDasharray={2 * Math.PI * 30}
                                                            strokeDashoffset={2 * Math.PI * 30 * (1 - (resumeData.resumeAnalysis.score || 0) / 100)} />
                                                </svg>
                                                <span className="absolute text-sm font-bold tracking-tight">{resumeData.resumeAnalysis.score || 0}%</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-white leading-snug">ATS Compatibility</p>
                                                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">{resumeData.resumeAnalysis.summary}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                                            <p className="text-xs italic text-muted-foreground">"{resumeData.snippet}"</p>
                                        </div>
                                    )}

                                    {resumeData.resumeAnalysis && (
                                        <div className="space-y-3">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    <span>Formatting & Structure</span>
                                                    <span>{resumeData.resumeAnalysis.formattingScore}%</span>
                                                </div>
                                                <Progress value={resumeData.resumeAnalysis.formattingScore} className="h-1 bg-muted accent-primary" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    <span>Skills & Tech Stack Alignment</span>
                                                    <span>{resumeData.resumeAnalysis.skillsScore}%</span>
                                                </div>
                                                <Progress value={resumeData.resumeAnalysis.skillsScore} className="h-1 bg-muted accent-primary" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    <span>Experience Detail & Impact</span>
                                                    <span>{resumeData.resumeAnalysis.experienceScore}%</span>
                                                </div>
                                                <Progress value={resumeData.resumeAnalysis.experienceScore} className="h-1 bg-muted accent-primary" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                                    {resumeData.resumeAnalysis?.improvements && resumeData.resumeAnalysis.improvements.length > 0 ? (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold uppercase text-primary/80 tracking-wider">Recommended Changes</p>
                                            {resumeData.resumeAnalysis.improvements.map((imp, idx) => (
                                                <div key={idx} className="flex gap-2 items-start text-[11px] leading-relaxed text-muted-foreground">
                                                    <Badge variant="outline" className="h-4 px-1 rounded bg-primary/5 text-primary border-primary/20 text-[8px] font-bold shrink-0 mt-0.5">FIX</Badge>
                                                    <span>{imp}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">No improvements suggested.</p>
                                    )}
                                </div>
                            )}

                            {resumeData.resumeAnalysis && (
                                <Button 
                                    onClick={handleGenerateTailored}
                                    disabled={isGenerating}
                                    className="w-full h-11 rounded-2xl font-bold uppercase text-[10px] tracking-widest bg-gradient-to-r from-primary to-accent border-none text-white shadow-glow transition-all"
                                >
                                    {isGenerating ? (
                                        <span className="flex items-center gap-1.5 justify-center">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Customizing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 justify-center">
                                            <ArrowUpRight className="h-4 w-4" /> Generate AI Tailored Interview
                                        </span>
                                    )}
                                </Button>
                            )}
                            
                            <div className="flex items-center justify-between pt-2 border-t border-border/10">
                                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                                    Updated: {resumeData.updatedAt ? new Date(resumeData.updatedAt).toLocaleDateString() : 'Unknown'}
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={handleDelete}
                                    className="h-8 rounded-lg text-destructive hover:bg-destructive/5 text-[9px] uppercase font-bold tracking-widest"
                                >
                                    <Trash2 className="h-3 w-3 mr-1.5" /> Clear Data
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="no-resume" 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative"
                        >
                            <label className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-border/50 bg-muted/20 hover:bg-muted/30 hover:border-primary/30 transition-all cursor-pointer group/upload">
                                {isUploading ? (
                                    <div className="flex flex-col items-center gap-4 py-4">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                        <div className="space-y-1 text-center">
                                            <p className="font-bold text-sm">Parsing Persona...</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Extracting skill vectors</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center mb-4 shadow-soft group-hover/upload:scale-110 transition-transform">
                                            <Upload className="h-8 w-8 text-muted-foreground group-hover/upload:text-primary transition-colors" />
                                        </div>
                                        <p className="font-bold text-sm mb-1 group-hover/upload:text-primary transition-colors">Import Professional Context</p>
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest text-center">PDF, DOCX, or TXT (Max 5MB)</p>
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={handleFileChange} 
                                    disabled={isUploading}
                                    accept=".pdf,.docx,.txt"
                                />
                            </label>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};
