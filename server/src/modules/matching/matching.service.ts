import { prisma } from "../../config/db";
import { ProficiencyLevel } from "@prisma/client";

// Proficiency level numeric weights for comparison
const LEVEL_WEIGHT: Record<ProficiencyLevel, number> = {
  BEGINNER:     1,
  INTERMEDIATE: 2,
  EXPERT:       3,
};

// ── Core Scoring Function ─────────────────────────────────────

const calculateScore = async (studentId: number, jobId: number) => {
  const [student, job, studentSkills, jobSkills, profile, projects] =
    await Promise.all([
      prisma.student.findUnique({ where: { id: studentId } }),
      prisma.jobPosting.findUnique({ where: { id: jobId } }),
      prisma.studentSkill.findMany({ where: { studentId } }),
      prisma.jobSkill.findMany({ where: { jobId } }),
      prisma.studentProfile.findUnique({ where: { studentId } }),
      prisma.project.findMany({ where: { studentId } }),
    ]);

  if (!student || !job) return null;

  // ── 1. Skill Score (60 pts max) ───────────────────────────
  let skillScore = 0;
  if (jobSkills.length > 0) {
    const basePerSkill = 60 / jobSkills.length;

    for (const required of jobSkills) {
      const studentSkill = studentSkills.find(
        (s) => s.skillId === required.skillId
      );
      if (!studentSkill) continue;

      const studentLevel = LEVEL_WEIGHT[studentSkill.proficiencyLevel];
      const requiredLevel = LEVEL_WEIGHT[required.requiredLevel];

      if (studentLevel >= requiredLevel) {
        skillScore += basePerSkill;           // full points
      } else {
        skillScore += basePerSkill * 0.5;     // partial credit
      }
    }
  } else {
    skillScore = 60; // no skills required → full skill score
  }

  // ── 2. GPA Score (30 pts max) ─────────────────────────────
  let gpaScore = 15; // neutral default if no requirement
  if (job.minGpa !== null && job.minGpa > 0) {
    if (student.gpa === null) {
      gpaScore = 0;
    } else if (student.gpa >= job.minGpa) {
      gpaScore = 30;
    } else {
      gpaScore = (student.gpa / job.minGpa) * 30;
    }
  }

  // ── 3. Extra Score (10 pts max) ───────────────────────────
  let extraScore = 0;
  if (profile?.cvUrl)       extraScore += 2;
  if (profile?.linkedinUrl) extraScore += 3;
  if (profile?.githubUrl)   extraScore += 3;
  if (projects.length > 0)  extraScore += 2;

  // ── Final Score ───────────────────────────────────────────
  const matchScore = Math.min(
    100,
    Math.round(skillScore + gpaScore + extraScore)
  );

  return {
    matchScore,
    skillScore:  Math.round(skillScore),
    gpaScore:    Math.round(gpaScore),
    extraScore:  Math.round(extraScore),
  };
};

// ── Upsert score into MATCH_RESULT ────────────────────────────

export const upsertMatchResult = async (studentId: number, jobId: number) => {
  const scores = await calculateScore(studentId, jobId);
  if (!scores) return null;

  return prisma.matchResult.upsert({
    where:  { studentId_jobId: { studentId, jobId } },
    update: { ...scores, matchedOn: new Date() },
    create: { studentId, jobId, ...scores },
  });
};

// ── Recalculate all jobs for one student ──────────────────────
// Triggered when student updates profile, skills, or projects

export const recalculateForStudent = async (studentId: number) => {
  const openJobs = await prisma.jobPosting.findMany({
    where: { status: "OPEN" },
    select: { id: true },
  });

  const results = await Promise.all(
    openJobs.map((job) => upsertMatchResult(studentId, job.id))
  );

  return results.filter(Boolean).length;
};

// ── Recalculate all students for one job ──────────────────────
// Triggered when HR creates or updates a job

export const recalculateForJob = async (jobId: number) => {
  const students = await prisma.student.findMany({
    select: { id: true },
  });

  const results = await Promise.all(
    students.map((student) => upsertMatchResult(student.id, jobId))
  );

  return results.filter(Boolean).length;
};

// ── Get all match scores for a student (sorted best first) ────

export const getStudentMatches = async (studentId: number) => {
  return prisma.matchResult.findMany({
    where: { studentId },
    orderBy: { matchScore: "desc" },
    include: {
      job: {
        include: { company: true, requiredSkills: { include: { skill: true } } },
      },
    },
  });
};

// ── Get ranked students for a job (sorted best first) ─────────

export const getJobMatches = async (jobId: number) => {
  return prisma.matchResult.findMany({
    where: { jobId },
    orderBy: { matchScore: "desc" },
    include: {
      student: {
        include: { profile: true, skills: { include: { skill: true } } },
      },
    },
  });
};