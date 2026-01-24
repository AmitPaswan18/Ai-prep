
import {
    Code,
    Users,
    Briefcase,
    Database,
    Brain,
    Zap,
    Globe,
    Palette,
    MessageSquare,
    Target,
    TrendingUp,
    Clock,
    Flame
} from "lucide-react";

// User Data
export const currentUser = {
    id: "user_1",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "AJ",
    plan: "pro" as const,
    joinedAt: "2024-01-15",
    streak: 5,
    totalInterviews: 12,
    totalHours: 8.5,
    averageScore: 85,
};

// Dashboard Stats
export const dashboardStats = [
    { label: "Interviews Completed", value: "12", icon: Target, trend: "+3 this week" },
    { label: "Practice Hours", value: "8.5", icon: Clock, trend: "+2.5 hrs" },
    { label: "Average Score", value: "85%", icon: TrendingUp, trend: "+12%" },
    { label: "Current Streak", value: "5", icon: Flame, trend: "days" },
];

// Interview Types for Dashboard
export const interviewTypes = [
    {
        id: "technical",
        title: "Technical Interview",
        description: "Data structures, algorithms, and system design",
        icon: Code,
        difficulty: "Advanced" as const,
        duration: "45 min",
        color: "bg-blue-500/10 text-blue-600"
    },
    {
        id: "behavioral",
        title: "Behavioral Interview",
        description: "Leadership, teamwork, and problem-solving scenarios",
        icon: Users,
        difficulty: "Intermediate" as const,
        duration: "30 min",
        color: "bg-green-500/10 text-green-600"
    },
    {
        id: "case-study",
        title: "Case Study",
        description: "Business strategy and analytical thinking",
        icon: Briefcase,
        difficulty: "Advanced" as const,
        duration: "60 min",
        color: "bg-purple-500/10 text-purple-600"
    },
    {
        id: "quick",
        title: "Quick Practice",
        description: "Rapid-fire questions for daily practice",
        icon: Zap,
        difficulty: "Beginner" as const,
        duration: "15 min",
        color: "bg-orange-500/10 text-orange-600"
    },
];

// Interview Library Items
export const interviewLibrary = [
    {
        id: "1",
        title: "Frontend Developer Interview",
        description: "React, TypeScript, CSS, and modern web development best practices",
        category: "technical",
        difficulty: "Intermediate" as const,
        duration: "45 min",
        rating: 4.8,
        completions: 1250,
        icon: Code,
        color: "bg-blue-500/10 text-blue-600",
        topics: ["React", "TypeScript", "CSS"]
    },
    {
        id: "2",
        title: "Backend Systems Design",
        description: "Scalable architecture, databases, and distributed systems",
        category: "system-design",
        difficulty: "Advanced" as const,
        duration: "60 min",
        rating: 4.9,
        completions: 890,
        icon: Database,
        color: "bg-purple-500/10 text-purple-600",
        topics: ["Microservices", "Databases", "Caching"]
    },
    {
        id: "3",
        title: "Leadership & Management",
        description: "Team leadership, conflict resolution, and strategic thinking",
        category: "behavioral",
        difficulty: "Advanced" as const,
        duration: "30 min",
        rating: 4.7,
        completions: 2100,
        icon: Users,
        color: "bg-green-500/10 text-green-600",
        topics: ["Leadership", "Communication", "Strategy"]
    },
    {
        id: "4",
        title: "Product Strategy Case",
        description: "Market analysis, product roadmap, and go-to-market strategy",
        category: "case-study",
        difficulty: "Advanced" as const,
        duration: "60 min",
        rating: 4.6,
        completions: 560,
        icon: Briefcase,
        color: "bg-orange-500/10 text-orange-600",
        topics: ["Strategy", "Analysis", "Product"]
    },
    {
        id: "5",
        title: "Data Structures & Algorithms",
        description: "Arrays, trees, graphs, dynamic programming, and complexity analysis",
        category: "technical",
        difficulty: "Advanced" as const,
        duration: "45 min",
        rating: 4.9,
        completions: 3200,
        icon: Brain,
        color: "bg-red-500/10 text-red-600",
        topics: ["DSA", "Problem Solving", "Optimization"]
    },
    {
        id: "6",
        title: "UI/UX Design Discussion",
        description: "Design thinking, user research, and interface design principles",
        category: "behavioral",
        difficulty: "Intermediate" as const,
        duration: "35 min",
        rating: 4.5,
        completions: 780,
        icon: Palette,
        color: "bg-pink-500/10 text-pink-600",
        topics: ["Design", "UX", "Accessibility"]
    },
    {
        id: "7",
        title: "Quick Technical Screen",
        description: "Rapid-fire coding questions for initial technical assessment",
        category: "technical",
        difficulty: "Beginner" as const,
        duration: "15 min",
        rating: 4.4,
        completions: 4500,
        icon: Zap,
        color: "bg-yellow-500/10 text-yellow-600",
        topics: ["Basics", "Quick", "Screening"]
    },
    {
        id: "8",
        title: "API Design Interview",
        description: "RESTful APIs, GraphQL, and API architecture best practices",
        category: "system-design",
        difficulty: "Intermediate" as const,
        duration: "40 min",
        rating: 4.7,
        completions: 920,
        icon: Globe,
        color: "bg-teal-500/10 text-teal-600",
        topics: ["REST", "GraphQL", "Architecture"]
    },
];

// Interview Categories
export const interviewCategories = [
    { id: "all", label: "All", icon: Globe },
    { id: "technical", label: "Technical", icon: Code },
    { id: "behavioral", label: "Behavioral", icon: Users },
    { id: "system-design", label: "System Design", icon: Database },
    { id: "case-study", label: "Case Study", icon: Briefcase },
];

// Recent Interviews
export const recentInterviews = [
    { id: "1", title: "Frontend Developer - React", score: 88, date: "2 hours ago", status: "completed" as const },
    { id: "2", title: "System Design - Distributed Systems", score: 72, date: "Yesterday", status: "completed" as const },
    { id: "3", title: "Behavioral - Leadership", score: 95, date: "3 days ago", status: "completed" as const },
];

// Interview History
export const interviewHistory = [
    { id: "1", title: "Frontend Developer - React", score: 88, date: "Jan 15, 2024", duration: "42:15", type: "Technical", status: "completed" as const },
    { id: "2", title: "System Design - Distributed Systems", score: 72, date: "Jan 14, 2024", duration: "58:30", type: "System Design", status: "completed" as const },
    { id: "3", title: "Behavioral - Leadership", score: 95, date: "Jan 12, 2024", duration: "28:45", type: "Behavioral", status: "completed" as const },
    { id: "4", title: "DSA - Dynamic Programming", score: 68, date: "Jan 10, 2024", duration: "45:00", type: "Technical", status: "completed" as const },
    { id: "5", title: "Product Manager Case Study", score: 82, date: "Jan 8, 2024", duration: "55:20", type: "Case Study", status: "completed" as const },
    { id: "6", title: "Backend Developer - Node.js", score: 90, date: "Jan 5, 2024", duration: "40:15", type: "Technical", status: "completed" as const },
];

// Sample Interview Questions
export const sampleQuestions = [
    "Tell me about yourself and your experience with React development.",
    "Can you explain the difference between state and props in React?",
    "How would you optimize a React application for better performance?",
    "Describe a challenging project you worked on and how you overcame obstacles.",
    "What's your approach to testing React components?",
];

// Skill Radar Data
export const skillRadarData = [
    { skill: "DSA", score: 75, fullMark: 100 },
    { skill: "JavaScript", score: 88, fullMark: 100 },
    { skill: "React", score: 92, fullMark: 100 },
    { skill: "System Design", score: 65, fullMark: 100 },
    { skill: "Communication", score: 78, fullMark: 100 },
    { skill: "Problem Solving", score: 85, fullMark: 100 },
];

// Progress Over Time Data
export const progressData = [
    { month: "Aug", score: 62 },
    { month: "Sep", score: 68 },
    { month: "Oct", score: 71 },
    { month: "Nov", score: 78 },
    { month: "Dec", score: 82 },
    { month: "Jan", score: 85 },
];

// Pricing Plans
export const pricingPlans = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Perfect for getting started",
        features: [
            "3 interviews per month",
            "Basic AI feedback",
            "Community support",
            "Limited question bank",
        ],
        limitations: [
            "No advanced analytics",
            "No priority support",
        ],
        cta: "Get Started",
        popular: false,
    },
    {
        id: "pro",
        name: "Pro",
        price: "$19",
        period: "per month",
        description: "Best for active job seekers",
        features: [
            "Unlimited interviews",
            "Advanced AI feedback",
            "Detailed analytics",
            "Full question bank",
            "Priority email support",
            "Progress tracking",
            "Custom interview types",
        ],
        limitations: [],
        cta: "Start Free Trial",
        popular: true,
    },
    {
        id: "premium",
        name: "Premium",
        price: "$49",
        period: "per month",
        description: "For serious career growth",
        features: [
            "Everything in Pro",
            "1-on-1 coaching sessions",
            "Mock interviews with experts",
            "Resume review",
            "Company-specific prep",
            "24/7 priority support",
            "Career roadmap",
        ],
        limitations: [],
        cta: "Contact Sales",
        popular: false,
    },
];

// AI Suggestions / Learning Plan
export const learningPlan = [
    {
        id: "1",
        topic: "Dynamic Programming",
        priority: "high" as const,
        reason: "Scored 68% - below target",
        suggestedTime: "2 hours",
        resources: 3,
    },
    {
        id: "2",
        topic: "System Design Fundamentals",
        priority: "high" as const,
        reason: "Skill gap detected",
        suggestedTime: "3 hours",
        resources: 5,
    },
    {
        id: "3",
        topic: "Communication Skills",
        priority: "medium" as const,
        reason: "Room for improvement",
        suggestedTime: "1 hour",
        resources: 2,
    },
    {
        id: "4",
        topic: "React Performance",
        priority: "low" as const,
        reason: "Maintain current level",
        suggestedTime: "30 min",
        resources: 2,
    },
];

// Feedback Template
export const feedbackTemplate = [
    {
        question: "Tell me about yourself and your experience with React development.",
        score: 90,
        strengths: ["Clear and structured response", "Good examples from past experience"],
        improvements: ["Could elaborate more on specific project outcomes"],
        type: "strength" as const,
    },
    {
        question: "Can you explain the difference between state and props in React?",
        score: 85,
        strengths: ["Accurate technical explanation", "Good use of analogies"],
        improvements: ["Could mention useState and useContext hooks"],
        type: "strength" as const,
    },
    {
        question: "How would you optimize a React application for better performance?",
        score: 75,
        strengths: ["Mentioned key concepts like memoization"],
        improvements: ["Could discuss React.memo, useMemo, useCallback in more detail", "Consider mentioning code splitting"],
        type: "improvement" as const,
    },
];

// Personalized Tips
export const personalizedTips = [
    "Practice explaining technical concepts with real-world analogies",
    "Prepare specific examples from your past projects",
    "Focus on quantifying your achievements (e.g., 'improved load time by 40%')",
    "Review React performance optimization techniques",
    "Practice the STAR method for behavioral questions",
];

// Role Options for Interview Setup
export const roleOptions = [
    { value: "frontend", label: "Frontend Developer" },
    { value: "backend", label: "Backend Developer" },
    { value: "fullstack", label: "Full Stack Developer" },
    { value: "mobile", label: "Mobile Developer" },
    { value: "devops", label: "DevOps Engineer" },
    { value: "data", label: "Data Engineer" },
    { value: "ml", label: "ML Engineer" },
    { value: "pm", label: "Product Manager" },
];

// Level Options
export const levelOptions = [
    { value: "junior", label: "Junior (0-2 years)" },
    { value: "mid", label: "Mid-Level (2-5 years)" },
    { value: "senior", label: "Senior (5-8 years)" },
    { value: "lead", label: "Lead/Staff (8+ years)" },
];

// Interview Type Options
export const interviewTypeOptions = [
    { value: "dsa", label: "Data Structures & Algorithms" },
    { value: "react", label: "React / JavaScript" },
    { value: "system-design", label: "System Design" },
    { value: "behavioral", label: "Behavioral" },
    { value: "mixed", label: "Mixed (All Types)" },
];

// Duration Options
export const durationOptions = [
    { value: "15", label: "15 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "60 minutes" },
];

// Mode Options
export const modeOptions = [
    { value: "text", label: "Text-based", description: "Type your answers" },
    { value: "voice", label: "Voice (Beta)", description: "Speak your answers" },
];
