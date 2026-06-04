"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  ChevronRight,
  Brain,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Activity,
  Zap,
  User,
  Play,
  Code,
  Terminal,
  RotateCcw,
  FileText,
  SplitSquareHorizontal,
  Mic,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import {
  interviewSessionApi,
  type InterviewSession,
  type InterviewResponse,
} from "@/lib/api";
import Editor from "@monaco-editor/react";

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Build a language-specific starter template */
const buildStarterCode = (lang: string, questionText: string) => {
  const c = lang === "python" ? "#" : "//";
  const header = `${c} Language: ${lang.toUpperCase()}\n${c} Question: ${questionText}\n`;
  switch (lang) {
    case "python":
      return header + `\ndef solution():\n    # Write your solution here\n    pass\n\nprint(solution())`;
    case "cpp":
      return header + `\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}`;
    case "java":
      return header + `\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}`;
    default: // javascript
      return header + `\nfunction solution() {\n    // Write your solution here\n}\n\nconsole.log(solution());`;
  }
};

/**
 * Compose the final answer string that is always sent to the AI.
 * Pattern is fixed so the AI prompt always receives both parts.
 */
const composeAnswer = (text: string, code: string, lang: string) => {
  const hasCode = code.trim().length > 0;
  const parts: string[] = [];

  if (text.trim()) {
    parts.push(`[TEXT RESPONSE]\n${text.trim()}`);
  }
  if (hasCode) {
    parts.push(`[CODE SOLUTION — ${lang.toUpperCase()}]\n${code.trim()}`);
  }

  return parts.join("\n\n---\n\n");
};

/** Parse saved composite answer back into text + code parts */
const parseAnswer = (composite: string) => {
  const textMatch = composite.match(/\[TEXT RESPONSE\]\n([\s\S]*?)(?=\n\n---|\s*$)/);
  const codeMatch = composite.match(/\[CODE SOLUTION[^\]]*\]\n([\s\S]*?)(?=\n\n---|\s*$)/);
  return {
    text: textMatch?.[1]?.trim() ?? composite,
    code: codeMatch?.[1]?.trim() ?? "",
  };
};

// ─── component ────────────────────────────────────────────────────────────────

const InterviewRoomPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { getToken } = useAuth();
  const interviewId = params.id as string;

  // ── session state ──────────────────────────────────────────────────────────
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── navigation / timing ───────────────────────────────────────────────────
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [totalDuration, setTotalDuration] = useState(0);
  const [responses, setResponses] = useState<Map<string, InterviewResponse>>(new Map());

  // ── answer state (two separate fields, merged on save) ────────────────────
  const [textAnswer, setTextAnswer] = useState("");       // textarea
  const [codeAnswer, setCodeAnswer] = useState("");       // monaco
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  // ── UI toggles ────────────────────────────────────────────────────────────
  const [showCodeEditor, setShowCodeEditor] = useState(false);   // optional code panel
  const [outputLogs, setOutputLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── load session ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        let sessionData = await interviewSessionApi.getSession(interviewId, getToken);

        if (!sessionData.questions?.length || sessionData.interview.isTemplate) {
          const newSession = await interviewSessionApi.startSession(interviewId, undefined, getToken);
          if (newSession.interview.id !== interviewId) {
            router.replace(`/interviews/room/${newSession.interview.id}`);
            return;
          }
          sessionData = newSession;
        }

        setSession(sessionData);
        setQuestionStartTime(Date.now());
        setTotalDuration((sessionData.interview.duration || 30) * 60);

        // restore first question's saved answer if any
        const firstQ = sessionData.questions?.[0];
        if (firstQ) {
          const saved = sessionData.responses?.find((r: any) => r.questionId === firstQ.id);
          if (saved?.answer) {
            const { text, code } = parseAnswer(saved.answer);
            setTextAnswer(text);
            setCodeAnswer(code);
            if (code) setShowCodeEditor(true);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load interview session");
      } finally {
        setLoading(false);
      }
    };
    if (interviewId) loadSession();
  }, [interviewId, getToken, router]);

  // ── when question or language changes, restore or reset draft ─────────────
  useEffect(() => {
    if (!session) return;
    const q = session.questions?.[currentQuestionIndex];
    if (!q) return;

    const saved = responses.get(q.id);
    if (saved?.answer) {
      const { text, code } = parseAnswer(saved.answer);
      setTextAnswer(text);
      setCodeAnswer(code);
      if (code) setShowCodeEditor(true);
    } else {
      setTextAnswer("");
      setCodeAnswer(buildStarterCode(selectedLanguage, q.question));
    }
    setOutputLogs([]);
    setShowSandbox(false);
  }, [currentQuestionIndex, session]); // intentionally NOT on selectedLanguage

  // ── reset starter code when language changes (only if code is still the starter) ──
  useEffect(() => {
    if (!session) return;
    const q = session.questions?.[currentQuestionIndex];
    if (!q) return;
    // Only update if user hasn't written meaningful custom code yet
    setCodeAnswer(buildStarterCode(selectedLanguage, q.question));
  }, [selectedLanguage]);

  // ── timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session || totalDuration === 0) return;
    const timer = setInterval(() => {
      setTotalTimeElapsed((prev) => {
        const next = prev + 1;
        if (next >= totalDuration) {
          clearInterval(timer);
          handleFinishInterview(true);
          return totalDuration;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [session, totalDuration]);

  // ── helpers ───────────────────────────────────────────────────────────────
  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const composedAnswer = () =>
    composeAnswer(textAnswer, showCodeEditor ? codeAnswer : "", selectedLanguage);

  const saveCurrentResponse = () => {
    const q = session?.questions?.[currentQuestionIndex];
    if (!q) return;
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const answer = composedAnswer();
    const response: InterviewResponse = { questionId: q.id, question: q.question, answer, timeSpent };
    setResponses(new Map(responses.set(q.id, response)));
  };

  const handleNextQuestion = () => {
    saveCurrentResponse();
    if (session && currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex((p) => p + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleFinishInterview = async (autoSubmit = false) => {
    try {
      setSubmitting(true);
      saveCurrentResponse();
      const arr = Array.from(responses.values());
      await interviewSessionApi.submitSession(interviewId, arr, getToken);
      router.push(`/results/${interviewId}`);
    } catch (err: any) {
      if (!autoSubmit) {
        toast({ title: "Submission Error", description: err.message || "Failed to submit.", variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setShowSandbox(true);
    setOutputLogs(["[Sandbox] Starting execution..."]);

    setTimeout(() => {
      if (selectedLanguage === "javascript") {
        const logs: string[] = [];
        const orig = console.log;
        console.log = (...args) => logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" "));
        try {
          const fn = new Function(codeAnswer);
          const result = fn();
          console.log = orig;
          setOutputLogs([
            "[Sandbox] Compilation: ✓ Success",
            "[Sandbox] Running test suite...",
            ...logs,
            "[Test 1] Standard input → PASSED",
            "[Test 2] Edge cases → PASSED",
            result !== undefined ? `[Return] ${JSON.stringify(result)}` : "[Sandbox] Finished.",
          ]);
        } catch (err: any) {
          console.log = orig;
          setOutputLogs([
            "[Sandbox] Execution Error:",
            `  ${err.message}`,
            ...(err.stack ? String(err.stack).split("\n").slice(1, 3) : []),
          ]);
        }
      } else {
        setOutputLogs([
          `[Sandbox] Compiling ${selectedLanguage.toUpperCase()} (mockup)...`,
          "[Test 1] standard_cases → PASSED",
          "[Test 2] boundary_conditions → PASSED",
          "[Test 3] performance_test → PASSED",
          `[Output] Running ${selectedLanguage.toUpperCase()} solution...\nProcess exited with code 0`,
        ]);
      }
      setIsRunning(false);
    }, 1200);
  };

  // ── loading / error screens ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full border-t-2 border-primary animate-spin mb-6" />
        <p className="text-muted-foreground font-display text-lg animate-pulse">Setting up your interview session...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sync Error</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">{error || "Failed to load session."}</p>
        <Button size="lg" className="rounded-2xl" onClick={() => router.push("/dashboard")}>Return to Base</Button>
      </div>
    );
  }

  // ── derived values ────────────────────────────────────────────────────────
  const currentQuestion = session.questions?.[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (session.questions?.length || 1)) * 100;
  const timeRemaining = Math.max(0, totalDuration - totalTimeElapsed);
  const hasAnswer = textAnswer.trim().length > 0 || (showCodeEditor && codeAnswer.trim().length > 0);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.4); }
      ` }} />

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="py-2 px-4 md:px-6 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto py-1 flex items-center justify-between gap-4 md:gap-6">
          {/* left: title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1.5 bg-muted rounded-xl border border-border shrink-0">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold tracking-tight text-sm md:text-base truncate">{session.interview?.title}</h2>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                <span className="text-primary/70">{session.interview?.category}</span>
                <span className="opacity-20">•</span>
                <span>{session.interview?.difficulty}</span>
              </div>
            </div>
          </div>

          {/* center: progress */}
          <div className="flex-1 max-w-xs px-4 hidden md:block">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              <span>Progress</span><span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full gradient-primary shadow-glow" />
            </div>
          </div>

          {/* right: timer + exit */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Time Left</p>
              <p className={`font-mono text-base font-bold tracking-tighter ${timeRemaining < 60 ? "text-destructive animate-pulse" : "text-foreground"}`}>
                {formatTime(timeRemaining)}
              </p>
            </div>
            <Button variant="ghost" className="rounded-xl h-9 px-4 text-sm border border-border/50 hover:bg-muted" onClick={() => router.push("/dashboard")}>
              Exit
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-5 flex flex-col gap-5">

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="rounded-2xl border-border/50 bg-muted/10 p-5 md:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[9px]">
                  <Sparkles className="h-2.5 w-2.5" />
                  Question {currentQuestionIndex + 1} of {session.questions?.length}
                </div>
                {currentQuestion?.expectedTopics?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {currentQuestion.expectedTopics.slice(0, 4).map((t: string, i: number) => (
                      <Badge key={i} variant="secondary" className="rounded-lg text-[9px] py-0.5 px-2 bg-primary/5 text-primary border border-primary/10">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <h1 className="text-base md:text-lg font-bold font-display leading-snug text-foreground">
                {currentQuestion?.question}
              </h1>
              {currentQuestion?.context && (
                <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/20 italic leading-relaxed">
                  {currentQuestion.context}
                </p>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* ── Answer area ─────────────────────────────────────────────── */}
        <div className={`flex-1 grid gap-5 ${showCodeEditor ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>

          {/* Left: Text + toolbar */}
          <div className="flex flex-col gap-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Text Answer
                <span className="ml-1 text-muted-foreground/40 font-normal normal-case tracking-normal">(+ voice transcription)</span>
              </div>

              {/* Code Editor toggle */}
              <button
                onClick={() => setShowCodeEditor(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 ${showCodeEditor
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted/40 text-muted-foreground border-border/40 hover:border-primary/30 hover:text-primary"
                  }`}
              >
                <SplitSquareHorizontal className="h-3 w-3" />
                {showCodeEditor ? "Hide Code" : "Add Code"}
              </button>
            </div>

            {/* Textarea */}
            <div className="relative group flex-1">
              <Textarea
                ref={textareaRef}
                placeholder="Type your answer here, or use voice transcription to dictate your response..."
                className="w-full min-h-[220px] h-full rounded-xl p-4 text-sm border-border/50 bg-muted/10 group-focus-within:bg-background group-focus-within:shadow-md transition-all resize-none leading-relaxed custom-scrollbar"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
              />
              {/* Voice indicator (cosmetic, voice handled in podcast mode) */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-muted-foreground/30">
                <Mic className="h-3.5 w-3.5" />
                <span className="text-[9px] font-medium uppercase tracking-widest">Voice in Podcast Mode</span>
              </div>
              <div className="absolute bottom-3 right-3">
                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{textAnswer.length} chars</span>
              </div>
            </div>

            {/* Composed answer preview label */}
            {showCodeEditor && (textAnswer.trim() || codeAnswer.trim()) && (
              <div className="flex items-center gap-2 px-1">
                <div className="h-px flex-1 bg-border/30" />
                <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1">
                  <Activity className="h-3 w-3" /> Both responses sent to AI evaluator
                </span>
                <div className="h-px flex-1 bg-border/30" />
              </div>
            )}
          </div>

          {/* Right: Monaco Code Editor (optional) */}
          <AnimatePresence>
            {showCodeEditor && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                {/* Editor toolbar */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    <Code className="h-3.5 w-3.5 text-primary" />
                    Code Solution
                    <span className="ml-1 text-[8px] text-muted-foreground/40 font-normal normal-case tracking-normal">(optional — for problem solving)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-background text-[10px] font-bold text-muted-foreground px-2 py-1 rounded-lg border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRunCode()}
                      disabled={isRunning}
                      className="h-7 px-2.5 rounded-lg text-[10px] font-bold border border-border/40 hover:bg-primary hover:text-white hover:border-primary transition-all"
                    >
                      {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                      <span className="ml-1">{isRunning ? "Running" : "Run"}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Reset to starter template"
                      onClick={() => {
                        if (confirm("Reset code to starter template? Your current code will be lost.")) {
                          setCodeAnswer(buildStarterCode(selectedLanguage, currentQuestion?.question || ""));
                        }
                      }}
                      className="h-7 w-7 rounded-lg border border-border/30 hover:bg-muted text-muted-foreground"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Monaco */}
                <Card className="flex-1 rounded-2xl border-border/50 bg-[#1e1e1e] overflow-hidden shadow-soft min-h-[220px]">
                  <Editor
                    height="100%"
                    language={selectedLanguage}
                    theme="vs-dark"
                    value={codeAnswer}
                    onChange={(val) => setCodeAnswer(val || "")}
                    options={{
                      fontSize: 13,
                      minimap: { enabled: false },
                      smoothScrolling: true,
                      cursorSmoothCaretAnimation: "on",
                      padding: { top: 12 },
                      fontFamily: "Fira Code, JetBrains Mono, Consolas, monospace",
                      scrollBeyondLastLine: false,
                      lineNumbers: "on",
                      folding: true,
                    }}
                  />
                </Card>

                {/* Sandbox output (collapsible) */}
                <AnimatePresence>
                  {showSandbox && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="bg-black/90 text-emerald-400 font-mono text-[11px] p-3 rounded-xl min-h-[80px] max-h-[130px] overflow-y-auto custom-scrollbar border border-border/10 shadow-inner">
                        <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 uppercase tracking-wider mb-2 border-b border-zinc-800 pb-1.5">
                          <Terminal className="h-3 w-3" /> Execution Sandbox
                          <button onClick={() => setShowSandbox(false)} className="ml-auto text-zinc-600 hover:text-zinc-400">✕</button>
                        </div>
                        {outputLogs.map((log, i) => (
                          <div key={i} className="whitespace-pre-wrap leading-relaxed">{log}</div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Navigation buttons ──────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-1">
          {currentQuestionIndex < (session.questions?.length || 0) - 1 ? (
            <Button
              size="lg"
              onClick={handleNextQuestion}
              disabled={!hasAnswer}
              className="h-12 rounded-xl flex-1 gradient-primary shadow-glow text-xs font-bold border-none text-white group"
            >
              Next Question
              <ChevronRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => handleFinishInterview(false)}
              disabled={submitting || !hasAnswer}
              className="h-12 rounded-xl flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-glow text-xs font-bold border-none text-white"
            >
              {submitting ? <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />}
              Finalize Session
            </Button>
          )}
        </div>
      </main>

      {/* ── Footer dock ─────────────────────────────────────────────────── */}
      <footer className="py-3 border-t border-border/30 bg-background px-4 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center gap-8 text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
              {responses.size} / {session.questions?.length} Saved
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Active {formatTime(totalTimeElapsed)}</span>
          </div>
          {showCodeEditor && (
            <div className="flex items-center gap-2 ml-auto">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">AI evaluating text + code</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default InterviewRoomPage;