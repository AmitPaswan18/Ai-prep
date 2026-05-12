"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-[3rem] border border-border/50 bg-muted/20 backdrop-blur-sm p-16 text-center shadow-soft ${className}`}
    >
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse" />
          <div className="relative w-20 h-20 bg-background rounded-3xl flex items-center justify-center shadow-elevated border border-border/50">
            <Icon className="h-10 w-10 text-primary/60" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold font-display tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            size="lg"
            className="mt-4 rounded-2xl h-12 px-10 gradient-primary shadow-glow hover:scale-105 transition-all font-bold text-xs uppercase tracking-widest"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
