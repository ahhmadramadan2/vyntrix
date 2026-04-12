import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import {
  getProfile,
  updateProfile,
  searchCandidates,
  getMyJobs,
  deleteJob,
  getPublicCompanyProfile,
} from "./company.controller";

const router = Router();

// Public route — students can view company profiles
router.get("/public/:id", getPublicCompanyProfile);

// Protected HR routes
router.use(authenticate, requireRole("HR"));
router.get("/profile",           getProfile);
router.put("/profile",           updateProfile);
router.get("/jobs",              getMyJobs);
router.delete("/jobs/:jobId",    deleteJob);
router.get("/candidates",        searchCandidates);

export default router;