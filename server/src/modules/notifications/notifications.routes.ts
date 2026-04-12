import { Router } from "express";
import {
  studentRegister,
  studentLogin,
  companyRegister,
  companyLogin,
  forgotPassword,
  resetPassword,
  changeStudentCredentials,
  changeHrCredentials,
} from "../auth/auth.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { prisma } from "../../config/db";

const router = Router();

router.post("/student/register", studentRegister);
router.post("/student/login",    studentLogin);
router.post("/company/register", companyRegister);
router.post("/company/login",    companyLogin);

// Password reset
router.post("/forgot-password",  forgotPassword);
router.post("/reset-password",   resetPassword);

// Change credentials
router.put("/student/credentials", authenticate, requireRole("STUDENT"), changeStudentCredentials);
router.put("/company/credentials", authenticate, requireRole("HR"),      changeHrCredentials);

// Public universities list
router.get("/universities", async (_req, res) => {
  const universities = await prisma.university.findMany({
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: universities });
});

export default router;