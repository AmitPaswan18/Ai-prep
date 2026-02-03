import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import interviewSessionRoutes from "./routes/interview-session.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load from various locations to be safe
dotenv.config({ path: path.join(__dirname, "../../../.env") });
dotenv.config({ path: path.join(__dirname, "../.env") });
const envResult = dotenv.config();
console.log(`[SERVER] Environment loaded: ${envResult.error ? 'FAILED' : 'SUCCESS'}`);
console.log(`[SERVER] GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
console.log(`[SERVER] DATABASE_URL present: ${!!process.env.DATABASE_URL}`);


const app = express();

// Configure CORS for production
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/interview", interviewRoutes);
app.use("/interview-session", interviewSessionRoutes);

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

// Only listen if not in a serverless environment
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ API Server running on port ${PORT}`);
    console.log(`📡 Allowed Origins:`, allowedOrigins);
  });
}

export default app;
