import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { clerkMiddleware, getAuth } from "@clerk/express";
import authRoutes from "./routes/auth.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import interviewSessionRoutes from "./routes/interview-session.routes.js";
import voiceRoutes from "./routes/voice.routes.js";
import userRoutes from "./routes/user.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { getOrCreateUser } from "./services/user.service.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load from various locations to be safe
dotenv.config({ path: path.join(__dirname, "../../../.env") });
dotenv.config({ path: path.join(__dirname, "../.env") });
const envResult = dotenv.config();


const app = express();

// Enable trust proxy so Express correctly interprets headers forwarded by Vercel's proxy (HTTPS, host, etc.)
app.set("trust proxy", true);

// Configure CORS for production
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Explicitly handle OPTIONS preflight requests before Clerk middleware
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  res.set('Cache-Control',
    next();
});

app.use(clerkMiddleware());

// Auto-provision Clerk users in the database
app.use(async (req, res, next) => {
  const auth = getAuth(req);
  if (auth && auth.userId) {
    try {
      await getOrCreateUser({ clerkUserId: auth.userId });
    } catch (err) {
      console.error("[Auth Middleware] Auto-provisioning user failed:", err);
    }
  }
  next();
});

app.use("/auth", authRoutes);
app.use("/interview", interviewRoutes);
app.use("/interview-session", interviewSessionRoutes);
app.use("/voice", voiceRoutes);
app.use("/user", userRoutes);
app.use("/analytics", analyticsRoutes);

// Global error handler to preserve CORS headers and return clean JSON
app.use((err: any, req: any, res: any, next: any) => {
  console.error("[Unhandled API Error]:", err);

  // Set CORS headers manually in case the error bypassed CORS middleware
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      code: err.code || "internal_error"
    }
  });
});



app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/db-test", async (req, res) => {
  try {
    const { prisma } = await import("@repo/db");
    const count = await prisma.interview.count();
    res.json({
      ok: true,
      count,
      message: "Database connection successful"
    });
  } catch (error: any) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  try {
    app.listen(PORT, () => {
      console.log(`✅ API Server running on port ${PORT}`);
      console.log(`📡 Allowed Origins:`, allowedOrigins);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

export default app;
