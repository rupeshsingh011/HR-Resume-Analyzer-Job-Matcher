import "./config/env.js";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet({
  crossOriginResourcePolicy: false,
  frameguard: false
}));
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "smart-hr-api", version: 3 }));
app.use("/src/uploads", express.static("src/uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.name === "ZodError" ? 400 : 500;
  res.status(status).json({ message: error.message || "Unexpected server error", details: error.errors });
});

connectDB()
  .then(() => {
    if (process.env.NODE_ENV !== "production") {
      app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
    }
  })
  .catch((error) => {
    console.error("Failed to start API", error);
  });

export default app;
