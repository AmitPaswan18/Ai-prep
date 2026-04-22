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

export const ResumeUpload = () => {
    const { getToken } = useAuth();
    const { toast } = useToast();
    const [resumeData, setResumeData] = useState<{ hasResume: boolean; updatedAt: string | null; snippet: string | null } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
            setResumeData({ hasResume: false, updatedAt: null, snippet: null });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to remove resume.",
                variant: "destructive"
            });
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
                            className="space-y-4"
                        >
                            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 relative">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 rounded-xl bg-background shadow-soft text-primary">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Extracted Snippet</p>
                                        <p className="text-xs italic text-muted-foreground line-clamp-2 leading-relaxed">
                                            "{resumeData.snippet}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                    Updated: {resumeData.updatedAt ? new Date(resumeData.updatedAt).toLocaleDateString() : 'Unknown'}
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={handleDelete}
                                    className="h-8 rounded-lg text-destructive hover:bg-destructive/5 text-[10px] uppercase font-bold tracking-widest"
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
