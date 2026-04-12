import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { getAllSkills, createSkill } from "./skills.controller";

const router = Router();

router.get("/",    getAllSkills);
router.post("/",   authenticate, requireRole("HR"), createSkill);

export default router;