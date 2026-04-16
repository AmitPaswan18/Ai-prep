"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "@clerk/nextjs";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Brain,
  Sparkles,
  Target,
  Video,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Star,
  Users,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import Navbar from "../layout/Navbar";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Our neuro-linguistic model adapts to your specific tone and industry jargon for a 1:1 simulation.",
  },
  {
    icon: Zap,
    title: "Instant Behavioral Analysis",
    description: "Receive micro-feedback on your pacing, fillers, and sentiment analysis within seconds.",
  },
  {
    icon: BarChart3,
    title: "Competency Mapping",
    description: "Identify exactly which skills are lagging with heatmaps showing your performance trends.",
  },
  {
    icon: ShieldCheck,
    title: "Realistic Stress Testing",
    description: "Experience high-pressure follow-up questions designed to test your resilience and logic.",
  },
];

const stats = [
  { value: "50K+", label: "Mock Interviews" },
  { value: "98%", label: "Placement Rate" },
  { value: "24/7", label: "AI Availability" },
  { value: "100+", label: "Standard Roles" },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AuthPage() {
  const { getToken } = useAuth();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="relative min-h-screen bg-background selection:bg-primary/20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
        </div>

        <motion.div 
          style={{ opacity, scale }}
          className="container mx-auto relative z-10"
        >
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-8 px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 backdrop-blur-md animate-float">
                <Sparkles className="h-4 w-4 mr-2" />
                Next-Gen Interview Preparation
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="font-display text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
            >
              Master the Art of the 
              <span className="block italic font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-accent">
                Perfect Interview
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              The first AI-driven platform that doesn't just ask questions—it teaches you how to answer them with confidence and precision.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link href="/auth?mode=signup">
                <Button size="lg" className="h-14 px-10 rounded-2xl text-lg font-semibold gradient-primary shadow-glow hover:scale-105 transition-all">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/interviews">
                <Button variant="ghost" size="lg" className="h-14 px-10 rounded-2xl text-lg font-medium hover:bg-muted group">
                  <Video className="mr-2 h-5 w-5 group-hover:text-primary transition-colors" />
                  View Core Features
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-24 pt-10 border-t border-border/50 grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-3xl font-bold font-display">{stat.value}</span>
                  <span className="text-sm text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/3">
              <Badge variant="outline" className="mb-4 border-primary/20 text-primary">Intelligence</Badge>
              <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Designed for Professionals</h2>
              <p className="text-xl text-muted-foreground mb-8">We've built a system that goes deeper than simple flashcards. We analyze the psychology behind your answers.</p>
              <Button variant="secondary" className="rounded-xl">Read our Whitepaper</Button>
            </div>
            
            <div className="lg:w-2/3 grid sm:grid-cols-2 gap-6">
              {features.map((feature, i) => (
                <Card key={i} className="group overflow-hidden rounded-3xl border-border/50 bg-muted/30 backdrop-blur-sm hover:border-primary/30 transition-all hover:shadow-elevated">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-2xl bg-background border border-border shadow-soft flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section (Premium Trust) */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-12">Empowering talent at global leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
             {/* Use your generate_image tool if you wanted actual logos, but stylized text for now is premium too */}
             <span className="text-2xl font-bold font-display opacity-80">GOOGLE</span>
             <span className="text-2xl font-bold font-display opacity-80">META</span>
             <span className="text-2xl font-bold font-display opacity-80">STRIPE</span>
             <span className="text-2xl font-bold font-display opacity-80">NETFLIX</span>
             <span className="text-2xl font-bold font-display opacity-80">OPENAI</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6">
        <div className="max-w-5xl mx-auto">
          <Card className="relative overflow-hidden rounded-[3rem] border-none shadow-elevated">
            <div className="absolute inset-0 gradient-primary opacity-90" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            
            <CardContent className="relative z-10 p-12 md:p-24 text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Your next career milestone starts here.</h2>
              <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">Join 10,000+ candidates who used InterviewAI to secure offers at Fortune 500 companies this year.</p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/auth?mode=signup">
                  <Button size="lg" className="h-16 px-12 rounded-2xl bg-white text-primary hover:bg-white/90 shadow-xl font-bold text-lg">
                    Start Your First Session
                  </Button>
                </Link>
              </div>
              
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm font-medium">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-white" /> 10 Free Tokens</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-white" /> Live AI Interviews</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-white" /> 24/7 Coaching</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 px-6 border-t border-border/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="flex flex-col gap-4 max-w-sm">
              <Link href="/" className="flex items-center gap-2">
                <div className="gradient-primary rounded-xl p-2 shadow-glow">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight">InterviewAI</span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed italic">
                Pioneering the intersection of psychology and generative AI to create the most realistic interview training experience available.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div className="flex flex-col gap-4">
                <span className="font-bold text-sm uppercase tracking-widest">Platform</span>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Enterprise</Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-bold text-sm uppercase tracking-widest">Resources</span>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Guide</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-bold text-sm uppercase tracking-widest">Legal</span>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Security</Link>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-border/30 text-xs text-muted-foreground">
            <div className="flex items-center gap-6">
              <span>Made with ❤️ for candidates everywhere.</span>
            </div>
            <div className="flex items-center gap-6">
              <span>© 2026 InterviewAI Corp. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
