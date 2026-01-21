import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import interviewRoutes from "./routes/interview.routes";

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

app.listen(4000, () => {
  console.log("API running on http://localhost:4000");
});
