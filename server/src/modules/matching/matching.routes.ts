import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { getMyMatches, getJobRanking, recalculateStudent } from "./matching.controller";

const router = Router();

// GET  /api/v1/matching/my-matches — student sees their scores
router.get("/my-matches", authenticate, requireRole("STUDENT"), getMyMatches);

// GET  /api/v1/matching/job/:jobId — HR sees ranked students
router.get("/job/:jobId", authenticate, requireRole("HR"), getJobRanking);

// POST /api/v1/matching/recalculate — student triggers manual recalc
router.post("/recalculate", authenticate, requireRole("STUDENT"), recalculateStudent);

export default router;