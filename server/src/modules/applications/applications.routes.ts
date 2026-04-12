import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { applyToJob, getJobApplicants, updateStatus } from "./applications.controller";

const router = Router();

router.post("/",                    authenticate, requireRole("STUDENT"), applyToJob);
router.get("/job/:jobId",           authenticate, requireRole("HR"),      getJobApplicants);
router.put("/:id/status",           authenticate, requireRole("HR"),      updateStatus);

export default router;