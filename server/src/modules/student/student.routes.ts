import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import {
  getProfile, updateProfile, updateExtendedProfile,
  addSkill, removeSkill, addProject, removeProject,
  getMyApplications,
} from "./student.controller";

const router = Router();

// All student routes require authentication and STUDENT role
router.use(authenticate, requireRole("STUDENT"));

router.get("/profile",              getProfile);
router.put("/profile",              updateProfile);
router.put("/profile/extended",     updateExtendedProfile);
router.post("/skills",              addSkill);
router.delete("/skills/:skillId",   removeSkill);
router.post("/projects",            addProject);
router.delete("/projects/:projectId", removeProject);
router.get("/applications",         getMyApplications);

export default router;