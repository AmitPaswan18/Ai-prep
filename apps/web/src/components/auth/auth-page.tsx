"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Video,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import Navbar from "../layout/Navbar";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Interviews",
    description:
      "Practice with intelligent AI that adapts to your responses and provides realistic interview scenarios.",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Feedback",
    description:
      "Get instant analysis of your answers with suggestions for improvement as you practice.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Track your progress with detailed metrics and identify areas that need more practice.",
  },
  {
    icon: Target,
    title: "Personalized Learning",
    description:
      "Receive customized interview questions based on your target role and experience level.",
  },
];

const stats = [
  { value: "50K+", label: "Interviews Completed" },
  { value: "95%", label: "Success Rate" },
  { value: "4.9", label: "User Rating", icon: Star },
  { value: "100+", label: "Interview Types" },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    content:
      "InterviewAI helped me prepare for my dream job. The AI feedback was incredibly accurate and helpful.",
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    role: "Product Manager at Meta",
    content:
      "The variety of interview types and realistic scenarios made all the difference in my preparation.",
    avatar: "MJ",
  },
  {
    name: "Emily Rodriguez",
    role: "Data Scientist at Netflix",
    content:
      "I went from nervous to confident in just two weeks of practice. Highly recommend!",
    avatar: "ER",
  },
];

export default function AuthPage() {
  const [isAuthenticated, setIsAuthenticated] = useState("");
  const getClerkAuth = async () => {
    const res = await fetch("http://localhost:4000/auth/me", {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    setIsAuthenticated(data);
    console.log("Response", data);
  };

  useEffect(() => {
    getClerkAuth();
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/20 text-primary-foreground border-primary/30 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              AI-Powered Interview Practice
            </Badge>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              Master Your Next
              <br />
              <span className="text-gradient">Interview</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-2xl mx-auto">
              Practice with AI-powered mock interviews, get real-time feedback,
              and land your dream job. Trusted by professionals at top
              companies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?mode=signup">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  Start Practicing Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/interviews">
                <Button
                  variant="outline"
                  className="gap-2 w-full sm:w-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  <Video className="h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-bold text-primary-foreground flex items-center justify-center gap-1">
                  {stat.value}
                  {stat.icon && (
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  )}
                </div>
                <div className="text-sm text-primary-foreground/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive interview
              preparation tools designed to help you succeed.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}>
                <Card className="gradient-card shadow-card hover:shadow-elevated transition-all hover:-translate-y-1 h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              How It Works
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Three Steps to Interview Success
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Choose Your Interview",
                desc: "Select from technical, behavioral, or case study interviews.",
              },
              {
                step: "02",
                title: "Practice with AI",
                desc: "Engage in realistic conversations with our AI interviewer.",
              },
              {
                step: "03",
                title: "Review & Improve",
                desc: "Get detailed feedback and track your progress over time.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center">
                <div className="font-display text-6xl font-bold text-primary/20 mb-4">
                  {item.step}
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Users className="h-3.5 w-3.5 mr-2" />
              Testimonials
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Loved by Professionals
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}>
                <Card className="gradient-card shadow-card h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-500 text-yellow-500"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {testimonial.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}>
            <Card className="gradient-hero shadow-elevated overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center relative">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/50 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/50 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10">
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                    Ready to Ace Your Interview?
                  </h2>
                  <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
                    Join thousands of professionals who have transformed their
                    interview skills with InterviewAI.
                  </p>
                  <Link href="/auth?mode=signup">
                    <Button className="gap-2">
                      Get Started for Free
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <div className="mt-6 flex items-center justify-center gap-6 text-sm text-primary-foreground/60">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      No credit card required
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Free practice interviews
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="gradient-primary rounded-lg p-1.5">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">InterviewAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 InterviewAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
