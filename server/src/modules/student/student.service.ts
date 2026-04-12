import { prisma } from "../../config/db";
import { recalculateForStudent } from "../matching/matching.service";
import { StudentStatus, ProficiencyLevel } from "@prisma/client";

export const getStudentProfile = async (studentId: number) => {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      university: true,
      profile: true,
      skills: { include: { skill: true } },
      projects: true,
    },
  });
};

export const updateStudentProfile = async (
  studentId: number,
  data: {
    firstName?: string;
    lastName?: string;
    department?: string;
    degree?: string;
    gpa?: number;
    graduationDate?: Date;
    graduationYear?: number;
    status?: StudentStatus;
  }
) => {
  const student = await prisma.student.update({
    where: { id: studentId },
    data,
  });
  // Auto-trigger matching recalculation
  await recalculateForStudent(studentId);
  return student;
};

export const updateExtendedProfile = async (
  studentId: number,
  data: {
    cvUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    phone?: string;
    bio?: string;
  }
) => {
  const profile = await prisma.studentProfile.upsert({
    where: { studentId },
    update: data,
    create: { studentId, ...data },
  });
  // Auto-trigger matching recalculation
  await recalculateForStudent(studentId);
  return profile;
};

export const addStudentSkill = async (
  studentId: number,
  skillId: number,
  proficiencyLevel: ProficiencyLevel
) => {
  const skill = await prisma.studentSkill.create({
    data: { studentId, skillId, proficiencyLevel },
    include: { skill: true },
  });
  // Auto-trigger matching recalculation
  await recalculateForStudent(studentId);
  return skill;
};

export const removeStudentSkill = async (
  studentId: number,
  skillId: number
) => {
  await prisma.studentSkill.delete({
    where: { studentId_skillId: { studentId, skillId } },
  });
  // Auto-trigger matching recalculation
  await recalculateForStudent(studentId);
};

export const addProject = async (
  studentId: number,
  data: {
    title: string;
    description?: string;
    techStack?: string;
    projectUrl?: string;
  }
) => {
  const project = await prisma.project.create({
    data: { studentId, ...data },
  });
  // Auto-trigger matching recalculation
  await recalculateForStudent(studentId);
  return project;
};

export const removeProject = async (studentId: number, projectId: number) => {
  await prisma.project.delete({
    where: { id: projectId, studentId },
  });
  // Auto-trigger matching recalculation
  await recalculateForStudent(studentId);
};

export const getMyApplications = async (studentId: number) => {
  return prisma.application.findMany({
    where: { studentId },
    orderBy: { applicationDate: "desc" },
    include: {
      job: { include: { company: true } },
    },
  });
};