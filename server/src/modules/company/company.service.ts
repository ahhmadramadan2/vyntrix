import { prisma } from "../../config/db";

export const getCompanyProfile = async (companyId: number) => {
  return prisma.company.findUnique({
    where: { id: companyId },
    include: {
      hrUsers: { select: { id: true, fullName: true, email: true, role: true } },
      jobPostings: { orderBy: { postedDate: "desc" } },
    },
  });
};

export const updateCompanyProfile = async (
  companyId: number,
  data: {
    companyName?: string;
    industry?: string;
    location?: string;
    website?: string;
    logoUrl?: string;
  }
) => {
  return prisma.company.update({ where: { id: companyId }, data });
};

export const getCompanyJobs = async (companyId: number) => {
  return prisma.jobPosting.findMany({
    where: { companyId },
    include: {
      requiredSkills: { include: { skill: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { postedDate: "desc" },
  });
};

export const deleteJob = async (jobId: number, companyId: number) => {
  const job = await prisma.jobPosting.findFirst({
    where: { id: jobId, companyId },
  });
  if (!job) throw new Error("Job not found or unauthorized");
  return prisma.jobPosting.update({
    where: { id: jobId },
    data: { status: "CLOSED" },
  });
};

export const getPublicCompanyProfile = async (companyId: number) => {
  return prisma.company.findUnique({
    where: { id: companyId },
    include: {
      jobPostings: {
        where: { status: "OPEN" },
        include: { requiredSkills: { include: { skill: true } } },
        orderBy: { postedDate: "desc" },
      },
    },
  });
};

export const searchCandidates = async (filters: {
  skillIds?: number[];
  minGpa?: number;
  status?: "STUDENT" | "GRADUATE";
  universityId?: number;
}) => {
  return prisma.student.findMany({
    where: {
      ...(filters.minGpa && { gpa: { gte: filters.minGpa } }),
      ...(filters.status && { status: filters.status }),
      ...(filters.universityId && { universityId: filters.universityId }),
      ...(filters.skillIds &&
        filters.skillIds.length > 0 && {
          skills: { some: { skillId: { in: filters.skillIds } } },
        }),
    },
    include: {
      university: true,
      profile: true,
      skills: { include: { skill: true } },
      projects: true,
    },
    orderBy: { gpa: "desc" },
  });
};