"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { interviewApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";

import Navbar from "@/components/layout/Navbar";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  AlignLeft,
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
      let minsPerQ = 3; // default intermediate
      if (setup.level === "junior") minsPerQ = 5;
      else if (setup.level === "senior" || setup.level === "lead") minsPerQ = 2;
      const computedDuration = qCount * minsPerQ;

      const interviewData = {
        title: setup.title,
        description: setup.description,
        category: setup.type as any, // maps to category in backend
        difficulty: setup.level as any,
        duration: computedDuration,
        questionCount: qCount,
        topics: setup.topics,
        role: setup.role,
        level: setup.level,
      };

      await interviewApi.createInterview(interviewData, getToken);

      toast({
        title: "Success!",
        description: "Interview created successfully",
      });

      router.push("/interviews");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create interview",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = setup.title && setup.role && setup.level && setup.type;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Navbar />

      <main className=" px-[10%] py-6 w-full mx-auto">
        <PageHeader
          title="Set Up Your Interview"
          description="Customize your mock interview experience"
        />

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl">
          {/* Setup Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}>
              <Card className="gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Interview Title
                  </CardTitle>
                  <CardDescription>
                    Give your interview a descriptive title
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="e.g., Senior React Developer Interview"
                    value={setup.title}
                    onChange={(e) =>
                      setSetup((s) => ({ ...s, title: e.target.value }))
                    }
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}>
              <Card className="gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlignLeft className="h-5 w-5 text-primary" />
                    Description
                  </CardTitle>
                  <CardDescription>
                    Provide additional details about this interview (optional)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="e.g., Focus on React hooks, state management, and performance optimization"
                    value={setup.description}
                    onChange={(e) =>
                      setSetup((s) => ({ ...s, description: e.target.value }))
                    }
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Role Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}>
              <Card className="gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Target Role
                  </CardTitle>
                  <CardDescription>
                    Select the role you're preparing for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={setup.role}
                    onValueChange={(v) => setSetup((s) => ({ ...s, role: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </motion.div>

            {/* Level Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}>
              <Card className="gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Experience Level
                  </CardTitle>
                  <CardDescription>
                    Choose your experience level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={setup.level}
                    onValueChange={(v) => setSetup((s) => ({ ...s, level: v }))}
                    className="grid grid-cols-2 gap-3">
                    {levelOptions.map((option) => (
                      <div key={option.value}>
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={option.value}
                          className="flex items-center justify-center rounded-lg border-2 border-muted bg-card p-4 hover:bg-muted cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>

            {/* Interview Type */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}>
              <Card className="gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Interview Type
                  </CardTitle>
                  <CardDescription>
                    What type of interview do you want to practice?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={setup.type}
                    onValueChange={(v) => setSetup((s) => ({ ...s, type: v }))}
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {interviewTypeOptions.map((option) => (
                      <div key={option.value}>
                        <RadioGroupItem
                          value={option.value}
                          id={`type-${option.value}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`type-${option.value}`}
                          className="flex items-center justify-center rounded-lg border-2 border-muted bg-card p-4 hover:bg-muted cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all text-center">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>

            {/* Topics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}>
              <Card className="gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Topics
                  </CardTitle>
                  <CardDescription>
                    Add topics or skills covered in this interview (optional)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., React Hooks"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTopic();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddTopic}
                      disabled={!topicInput.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {setup.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {setup.topics.map((topic) => (
                        <Badge
                          key={topic}
                          variant="secondary"
                          className="gap-1">
                          {topic}
                          <button
                            type="button"
                            onClick={() => handleRemoveTopic(topic)}
                            className="ml-1 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Duration & Mode */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}>
              <Card className="gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Duration & Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Number of Questions</Label>
                    <Select
                      value={setup.questionCount}
                      onValueChange={(v) =>
                        setSetup((s) => ({ ...s, questionCount: v }))
                      }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionCountOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Duration:{" "}
                      {parseInt(setup.questionCount) *
                        (setup.level === "junior"
                          ? 5
                          : setup.level === "senior" || setup.level === "lead"
                            ? 2
                            : 3)}{" "}
                      minutes
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Response Mode</Label>
                    <RadioGroup
                      value={setup.mode}
                      onValueChange={(v) =>
                        setSetup((s) => ({ ...s, mode: v }))
                      }
                      className="grid grid-cols-2 gap-3">
                      {modeOptions.map((option) => (
                        <div key={option.value}>
                          <RadioGroupItem
                            value={option.value}
                            id={`mode-${option.value}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`mode-${option.value}`}
                            className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card p-4 hover:bg-muted cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all">
                            {option.value === "text" ? (
                              <MessageSquare className="h-5 w-5 mb-2" />
                            ) : (
                              <Mic className="h-5 w-5 mb-2" />
                            )}
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4">
            <Card className="gradient-card shadow-elevated sticky top-24">
              <CardHeader>
                <CardTitle>Interview Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Title</span>
                    <span className="font-medium">
                      {setup.title || "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium">
                      {roleOptions.find((r) => r.value === setup.role)?.label ||
                        "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-medium">
                      {levelOptions
                        .find((l) => l.value === setup.level)
                        ?.label.split(" ")[0] || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">
                      {interviewTypeOptions.find((t) => t.value === setup.type)
                        ?.label || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Num Questions</span>
                    <span className="font-medium">{setup.questionCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Duration</span>
                    <span className="font-medium">
                      {parseInt(setup.questionCount) *
                        (setup.level === "junior"
                          ? 5
                          : setup.level === "senior" || setup.level === "lead"
                            ? 2
                            : 3)}{" "}
                      minutes
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mode</span>
                    <Badge variant="secondary">
                      {modeOptions.find((m) => m.value === setup.mode)?.label}
                    </Badge>
                  </div>
                  {setup.topics.length > 0 && (
                    <div>
                      <span className="text-muted-foreground text-sm">
                        Topics
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {setup.topics.map((topic) => (
                          <Badge
                            key={topic}
                            variant="secondary"
                            className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-2"
                    disabled={!isValid || isLoading}
                    onClick={handleCreateInterview}>
                    <Play className="h-4 w-4" />
                    {isLoading ? "Creating..." : "Create Interview"}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {!isValid && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Please complete all required fields
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default InterviewSetup;
