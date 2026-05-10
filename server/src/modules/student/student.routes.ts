import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import {
  getProfile, updateProfile, updateExtendedProfile,
  addSkill, removeSkill, addProject, removeProject,
  getMyApplications, uploadCv,
} from "./student.controller";

const router = Router();

// Multer in-memory storage — keep the file in RAM, then forward to Supabase.
// 25 MB cap matches the validation in the service layer.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// All student routes require authentication and STUDENT role
router.use(authenticate, requireRole("STUDENT"));

router.get("/profile",                getProfile);
router.put("/profile",                updateProfile);
router.put("/profile/extended",       updateExtendedProfile);
router.post("/profile/cv",            upload.single("file"), uploadCv);
router.post("/skills",                addSkill);
router.delete("/skills/:skillId",     removeSkill);
router.post("/projects",              addProject);
router.delete("/projects/:projectId", removeProject);
router.get("/applications",           getMyApplications);

export default router;