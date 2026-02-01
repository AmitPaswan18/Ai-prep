import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import interviewRoutes from "./routes/interview.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/interview", interviewRoutes);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

export default app;
