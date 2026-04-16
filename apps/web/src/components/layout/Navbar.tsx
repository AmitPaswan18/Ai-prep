"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  LayoutDashboard,
  Video,
  BarChart3,
  Settings,
  Menu,
  X,
  History,
  CreditCard,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/interviews", label: "Interviews", icon: Video },
    { href: "/history", label: "History", icon: History },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "py-3 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-soft" 
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/40 transition-all" />
              <div className="relative gradient-primary rounded-xl p-2.5 shadow-glow group-hover:scale-105 transition-transform">
                <BrainCircuit className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <span className="font-display text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              InterviewAI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center bg-muted/50 backdrop-blur-md border border-border/50 rounded-2xl p-1.5 px-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`relative gap-2 px-4 rounded-xl transition-all ${
                      isActive 
                        ? "text-primary bg-background shadow-soft ring-1 ring-border/50" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <link.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                    <span className="font-medium">{link.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-glow"
                        className="absolute inset-0 rounded-xl bg-primary/5 -z-10"
                      />
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" className="font-medium hover:bg-muted">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="gradient-primary shadow-glow hover:shadow-primary/40 transition-all rounded-xl px-6 h-11">
                  Get Started
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <div className="p-1 rounded-full border border-border shadow-soft bg-background">
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
              </div>
            </SignedIn>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-xl bg-muted/50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full left-4 right-4 mt-4 p-4 bg-background/95 backdrop-blur-xl rounded-3xl shadow-elevated overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              <SignedIn>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={pathname === link.href ? "secondary" : "ghost"}
                      className="w-full justify-start gap-4 h-12 rounded-2xl"
                    >
                      <link.icon className="h-5 w-5" />
                      <span className="font-medium">{link.label}</span>
                    </Button>
                  </Link>
                ))}
              </SignedIn>

              <SignedOut>
                <div className="grid grid-cols-2 gap-3 p-2">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="rounded-2xl h-11">Sign In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="gradient-primary rounded-2xl h-11 shadow-glow">Start Free</Button>
                  </SignUpButton>
                </div>
              </SignedOut>
              
              <SignedIn>
                <div className="mt-2 p-4 bg-muted/50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserButton />
                    <span className="font-medium">My Account</span>
                  </div>
                </div>
              </SignedIn>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
