import { prisma } from "../../config/db";
import { recalculateForJob } from "../matching/matching.service";
import { JobType, JobStatus } from "@prisma/client";

export const getAllJobs = async (filters: {
  title?: string;
  location?: string;
  jobType?: JobType;
  status?: JobStatus;
}) => {
  return prisma.jobPosting.findMany({
    where: {
      status: filters.status || "OPEN",
      ...(filters.title && {
        title: { contains: filters.title, mode: "insensitive" },
      }),
      ...(filters.location && {
        location: { contains: filters.location, mode: "insensitive" },
      }),
      ...(filters.jobType && { jobType: filters.jobType }),
    },
    include: {
      company: true,
      requiredSkills: { include: { skill: true } },
    },
    orderBy: { postedDate: "desc" },
  });
};

export const getJobById = async (jobId: number) => {
  return prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: {
      company: true,
      hrUser: { select: { fullName: true, email: true } },
      requiredSkills: { include: { skill: true } },
    },
  });
};

export const createJob = async (
  hrUserId: number,
  companyId: number,
  data: {
    title: string;
    description: string;
    jobType: JobType;
    location: string;
    minGpa?: number;
    deadline?: Date;
    skillRequirements?: { skillId: number; requiredLevel: string }[];
  }
) => {
  const { skillRequirements, ...jobData } = data;

  const job = await prisma.jobPosting.create({
    data: { ...jobData, hrUserId, companyId },
  });

  if (skillRequirements && skillRequirements.length > 0) {
    await prisma.jobSkill.createMany({
      data: skillRequirements.map((s) => ({
        jobId: job.id,
        skillId: s.skillId,
        requiredLevel: s.requiredLevel as any,
      })),
    });
  }

  // Auto-trigger matching for all students
  await recalculateForJob(job.id);

  return prisma.jobPosting.findUnique({
    where: { id: job.id },
    include: { requiredSkills: { include: { skill: true } } },
  });
};

export const updateJob = async (
  jobId: number,
  data: Partial<{
    title: string;
    description: string;
    jobType: JobType;
    location: string;
    minGpa: number;
    deadline: Date;
    status: JobStatus;
  }>
) => {
  const job = await prisma.jobPosting.update({
    where: { id: jobId },
    data,
  });

  // Auto-trigger matching recalculation
  await recalculateForJob(jobId);
  return job;
};

export const deleteJob = async (jobId: number) => {
  // Soft delete — set status to CLOSED
  return prisma.jobPosting.update({
    where: { id: jobId },
    data: { status: "CLOSED" },
  });
};