import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import chatRoutes from "./modules/chat/chat.routes";

// Route imports
import authRoutes        from "./modules/auth/auth.routes";
import studentRoutes     from "./modules/student/student.routes";
import companyRoutes     from "./modules/company/company.routes";
import jobRoutes         from "./modules/jobs/jobs.routes";
import applicationRoutes from "./modules/applications/applications.routes";
import skillRoutes       from "./modules/skills/skills.routes";
import matchingRoutes    from "./modules/matching/matching.routes";
import notificationRoutes from "./modules/notifications/notifications.routes";

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/notifications", notificationRoutes);

// ── Health check ──────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ success: true, message: "Vyntrix API is running 🚀" });
});

// ── Routes ────────────────────────────────────────────────────
app.use("/api/v1/auth",         authRoutes);
app.use("/api/v1/student",      studentRoutes);
app.use("/api/v1/company",      companyRoutes);
app.use("/api/v1/jobs",         jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/skills",       skillRoutes);
app.use("/api/v1/matching",     matchingRoutes);

// ── Global error handler (must be last) ───────────────────────
app.use(errorHandler);

export default app;