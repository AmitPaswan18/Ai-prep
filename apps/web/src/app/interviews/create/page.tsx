"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { interviewApi, userApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";

import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Sparkles,
  Mic,
  MessageSquare,
  Clock,
  Target,
  ChevronRight,
  X,
  Plus,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  roleOptions,
  levelOptions,
  interviewTypeOptions,
  questionCountOptions,
  modeOptions,
} from "@/lib/mock-data";
import { useRouter } from "next/navigation";

const InterviewSetup = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [setup, setSetup] = useState({
    title: "",
    description: "",
    role: "",
    level: "",
    type: "",
    questionCount: "10",
    mode: "text",
    topics: [] as string[],
  });
  const [topicInput, setTopicInput] = useState("");
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [hasResume, setHasResume] = useState(false);
  const [isFetchingSkills, setIsFetchingSkills] = useState(false);

  useEffect(() => {
    const fetchResumeAndSkills = async () => {
      try {
        const resumeStatus = await userApi.getResume(getToken);
        if (resumeStatus.hasResume) {
          setHasResume(true);
          setIsFetchingSkills(true);
          const skillsRes = await userApi.getResumeSkills(getToken);
          setResumeSkills(skillsRes.skills || []);
        }
      } catch (error) {
        console.error("Failed to fetch resume/skills:", error);
      } finally {
        setIsFetchingSkills(false);
      }
    };
    fetchResumeAndSkills();
  }, [getToken]);

  const handleToggleResumeSkill = (skill: string) => {
    if (setup.topics.includes(skill)) {
      setSetup((s) => ({ ...s, topics: s.topics.filter((t) => t !== skill) }));
    } else {
      setSetup((s) => ({ ...s, topics: [...s.topics, skill] }));
    }
  };

  const handleAddAllResumeSkills = () => {
    const newTopics = [...setup.topics];
    resumeSkills.forEach((skill) => {
      if (!newTopics.includes(skill)) {
        newTopics.push(skill);
      }
    });
    setSetup((s) => ({ ...s, topics: newTopics }));
  };

  const handleAddTopic = () => {
    if (topicInput.trim() && !setup.topics.includes(topicInput.trim())) {
      setSetup((s) => ({ ...s, topics: [...s.topics, topicInput.trim()] }));
      setTopicInput("");
    }
  };

  const handleRemoveTopic = (topic: string) => {
    setSetup((s) => ({ ...s, topics: s.topics.filter((t) => t !== topic) }));
  };

  const handleCreateInterview = async () => {
    if (!isValid) return;
    setIsLoading(true);
    try {
      const qCount = parseInt(setup.questionCount);
      let minsPerQ = 3;
      if (setup.level === "junior") minsPerQ = 5;
      else if (setup.level === "senior" || setup.level === "lead") minsPerQ = 2;
      const computedDuration = qCount * minsPerQ;

      await interviewApi.createInterview({
        title: setup.title,
        description: setup.description,
        category: setup.type as any,
        difficulty: setup.level as any,
        duration: computedDuration,
        questionCount: qCount,
        topics: setup.topics,
        role: setup.role,
        level: setup.level,
      }, getToken);

      toast({ title: "Interview created!", description: "Redirecting to interviews..." });
      router.push("/interviews");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create interview", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = setup.title && setup.role && setup.level && setup.type;
  const estDuration = parseInt(setup.questionCount) * (setup.level === "junior" ? 5 : setup.level === "senior" || setup.level === "lead" ? 2 : 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* Page Header â€” compact */}
        <div className="my-8">
          <h1 className="text-2xl font-bold tracking-tight">Set Up Your Interview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Customize your mock interview experience</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* â”€â”€ LEFT: Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-5">

              {/* Row 1: Title + Role side by side */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <FileText className="h-3.5 w-3.5 text-primary" /> Interview Title *
                  </Label>
                  <Input
                    placeholder="e.g., Senior React Developer"
                    value={setup.title}
                    onChange={(e) => setSetup((s) => ({ ...s, title: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Target className="h-3.5 w-3.5 text-primary" /> Target Role *
                  </Label>
                  <Select value={setup.role} onValueChange={(v) => setSetup((s) => ({ ...s, role: v }))}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Description (optional, compact) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Description <span className="font-normal normal-case tracking-normal">(optional)</span>
                </Label>
                <Input
                  placeholder="e.g., Focus on React hooks, state management..."
                  value={setup.description}
                  onChange={(e) => setSetup((s) => ({ ...s, description: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Row 3: Experience Level */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Experience Level *
                </Label>
                <RadioGroup
                  value={setup.level}
                  onValueChange={(v) => setSetup((s) => ({ ...s, level: v }))}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                >
                  {levelOptions.map((o) => (
                    <div key={o.value}>
                      <RadioGroupItem value={o.value} id={`level-${o.value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`level-${o.value}`}
                        className="flex items-center justify-center rounded-lg border-2 border-muted bg-muted/30 py-2 px-3 text-sm cursor-pointer hover:bg-muted transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/8 peer-data-[state=checked]:text-primary font-medium"
                      >
                        {o.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Row 4: Interview Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" /> Interview Type *
                </Label>
                <RadioGroup
                  value={setup.type}
                  onValueChange={(v) => setSetup((s) => ({ ...s, type: v }))}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                >
                  {interviewTypeOptions.map((o) => (
                    <div key={o.value}>
                      <RadioGroupItem value={o.value} id={`type-${o.value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`type-${o.value}`}
                        className="flex items-center justify-center rounded-lg border-2 border-muted bg-muted/30 py-2 px-3 text-sm cursor-pointer hover:bg-muted transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/8 peer-data-[state=checked]:text-primary font-medium text-center"
                      >
                        {o.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Row 5: Questions + Mode side by side */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" /> Questions &amp; Duration
                  </Label>
                  <Select value={setup.questionCount} onValueChange={(v) => setSetup((s) => ({ ...s, questionCount: v }))}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {questionCountOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">Est. {estDuration} minutes total</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Response Mode
                  </Label>
                  <RadioGroup
                    value={setup.mode}
                    onValueChange={(v) => setSetup((s) => ({ ...s, mode: v }))}
                    className="grid grid-cols-2 gap-2"
                  >
                    {modeOptions.map((o) => (
                      <div key={o.value}>
                        <RadioGroupItem value={o.value} id={`mode-${o.value}`} className="peer sr-only" />
                        <Label
                          htmlFor={`mode-${o.value}`}
                          className="flex items-center gap-2 rounded-lg border-2 border-muted bg-muted/30 py-2 px-3 text-sm cursor-pointer hover:bg-muted transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/8 peer-data-[state=checked]:text-primary font-medium"
                        >
                          {o.value === "text" ? <MessageSquare className="h-3.5 w-3.5 shrink-0" /> : <Mic className="h-3.5 w-3.5 shrink-0" />}
                          {o.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {/* Row 6: Topics */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Topics <span className="font-normal normal-case tracking-normal">(optional)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., React Hooks, TypeScript..."
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTopic(); } }}
                    className="h-9 text-sm"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleAddTopic} disabled={!topicInput.trim()} className="h-9 px-3">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {setup.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {setup.topics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="gap-1 text-xs">
                        {topic}
                        <button type="button" onClick={() => handleRemoveTopic(topic)} className="ml-0.5 hover:text-destructive">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Resume Skills Suggestion Section */}
                {hasResume && (
                  <div className="pt-3 mt-1 border-t border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-primary" /> Skills from your resume
                      </span>
                      {resumeSkills.length > 0 && (
                        <button
                          type="button"
                          onClick={handleAddAllResumeSkills}
                          className="text-[11px] text-primary hover:underline font-semibold"
                        >
                          + Add All
                        </button>
                      )}
                    </div>
                    {isFetchingSkills ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-1">
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        <span>Extracting skills from resume...</span>
                      </div>
                    ) : resumeSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {resumeSkills.map((skill) => {
                          const isSelected = setup.topics.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleToggleResumeSkill(skill)}
                              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${isSelected
                                  ? "bg-primary/10 border-primary text-primary font-medium"
                                  : "bg-muted/30 border-border hover:bg-muted text-muted-foreground"
                                }`}
                            >
                              {skill}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic py-1">No skills extracted. Try re-uploading your resume.</p>
                    )}
                  </div>
                )}
              </div>

            </div>
          </motion.div>

          {/* â”€â”€ RIGHT: Summary Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="sticky top-20"
          >
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-sm">Interview Summary</h3>
              </div>

              {/* Summary rows */}
              <div className="px-5 py-4 space-y-3">
                {[
                  { label: "Title", value: setup.title || "Not set" },
                  { label: "Role", value: roleOptions.find((r) => r.value === setup.role)?.label || "Not selected" },
                  { label: "Level", value: levelOptions.find((l) => l.value === setup.level)?.label?.split(" ")[0] || "Not selected" },
                  { label: "Type", value: interviewTypeOptions.find((t) => t.value === setup.type)?.label || "Not selected" },
                  { label: "Questions", value: setup.questionCount },
                  { label: "Duration", value: `${estDuration} min` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground shrink-0">{label}</span>
                    <span className="font-medium text-right truncate max-w-[140px]" title={value}>{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mode</span>
                  <Badge variant="secondary" className="text-xs">
                    {modeOptions.find((m) => m.value === setup.mode)?.label}
                  </Badge>
                </div>
                {setup.topics.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-muted-foreground text-sm">Topics</span>
                    <div className="flex flex-wrap gap-1">
                      {setup.topics.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Required fields checklist */}
              <div className="px-5 pb-2 space-y-1">
                {[
                  { label: "Title", done: !!setup.title },
                  { label: "Role", done: !!setup.role },
                  { label: "Level", done: !!setup.level },
                  { label: "Type", done: !!setup.type },
                ].map(({ label, done }) => (
                  <div key={label} className={`flex items-center gap-2 text-xs ${done ? "text-emerald-500" : "text-muted-foreground/60"}`}>
                    <CheckCircle2 className={`h-3 w-3 ${done ? "opacity-100" : "opacity-30"}`} />
                    {label}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="px-5 py-4 border-t border-border">
                <Button
                  className="w-full gap-2 gradient-primary shadow-glow"
                  disabled={!isValid || isLoading}
                  onClick={handleCreateInterview}
                >
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                  ) : (
                    <><Play className="h-4 w-4" /> Create Interview <ChevronRight className="h-4 w-4" /></>
                  )}
                </Button>
                {!isValid && (
                  <p className="text-[11px] text-muted-foreground text-center mt-2">
                    Complete the required fields above
                  </p>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default InterviewSetup;

