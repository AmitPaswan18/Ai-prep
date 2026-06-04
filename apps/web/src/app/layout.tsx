import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PrepAI — AI Interview Preparation Platform",
    template: "%s | PrepAI",
  },
  description:
    "Ace your next interview with PrepAI — the AI-powered mock interview platform. Practice technical, behavioral, and system design interviews with real-time AI feedback, code editors, voice transcription, and detailed performance analytics.",
  keywords: [
    "AI interview preparation",
    "mock interview",
    "technical interview practice",
    "coding interview",
    "behavioral interview",
    "system design interview",
    "AI feedback",
    "interview coach",
    "software engineer interview",
    "job preparation",
  ],
  authors: [{ name: "PrepAI" }],
  creator: "PrepAI",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "PrepAI — AI Interview Preparation Platform",
    description:
      "Practice technical, behavioral & system design interviews with real-time AI feedback, a Monaco code editor, voice transcription, and deep performance analytics.",
    siteName: "PrepAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepAI — AI Interview Preparation Platform",
    description:
      "Ace your next interview with AI-powered mock sessions, instant code feedback, and detailed performance reports.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: undefined,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const Provider = ClerkProvider as any;

  return (
    <Provider
      proxyUrl={process.env.NEXT_PUBLIC_CLERK_PROXY_URL || undefined}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      domain={process.env.NEXT_PUBLIC_CLERK_DOMAIN || undefined}
      isSatellite={process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === "true"}
    >
      <html lang="en">
        <head>
          {/* Explicitly declare SVG favicon for all modern browsers */}
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/favicon.svg" />
          <meta name="theme-color" content="#7c3aed" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
          <Toaster />
        </body>
      </html>
    </Provider>
  );
}
