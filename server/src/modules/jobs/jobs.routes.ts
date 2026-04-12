import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { getAllJobs, getJobById, createJob, updateJob, deleteJob } from "./jobs.controller";

const router = Router();

router.get("/",        getAllJobs);
router.get("/:id",     getJobById);
router.post("/",       authenticate, requireRole("HR"), createJob);
router.put("/:id",     authenticate, requireRole("HR"), updateJob);
router.delete("/:id",  authenticate, requireRole("HR"), deleteJob);

export default router;