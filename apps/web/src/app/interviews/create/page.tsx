"use client";
import { useState } from "react";
import { motion } from "framer-motion";

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
} from "lucide-react";
import {
  roleOptions,
  levelOptions,
  interviewTypeOptions,
  durationOptions,
  modeOptions,
} from "@/lib/mock-data";
import { useRouter } from "next/navigation";
const InterviewSetup = () => {
  const router = useRouter();
  const [setup, setSetup] = useState({
    role: "",
    level: "",
    type: "",
    duration: "30",
    mode: "text",
  });

  const handleStartInterview = () => {
    // In a real app, we'd pass this setup to the interview room
    router.push("/interview/new");
  };

  const isValid = setup.role && setup.level && setup.type;

  return (
    <div className="w-full">
      <Navbar />

      <main className=" px-[10%] py-6 w-full mx-auto">
        <PageHeader
          title="Set Up Your Interview"
          description="Customize your mock interview experience"
        />

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl">
          {/* Setup Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Role Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}>
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
                    <Label>Interview Duration</Label>
                    <Select
                      value={setup.duration}
                      onValueChange={(v) =>
                        setSetup((s) => ({ ...s, duration: v }))
                      }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {setup.duration} minutes
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mode</span>
                    <Badge variant="secondary">
                      {modeOptions.find((m) => m.value === setup.mode)?.label}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-2"
                    disabled={!isValid}
                    onClick={handleStartInterview}>
                    <Play className="h-4 w-4" />
                    Start Interview
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
