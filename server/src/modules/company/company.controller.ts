import { Request, Response } from "express";
import * as companyService from "./company.service";
import { sendSuccess, sendError } from "../../utils/response";
import { prisma } from "../../config/db";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const hrUser = await prisma.hrUser.findUnique({ where: { id: req.user!.id } });
    if (!hrUser) return sendError(res, "HR user not found", 404);
    const company = await companyService.getCompanyProfile(hrUser.companyId);
    sendSuccess(res, company, "Company profile fetched");
  } catch {
    sendError(res, "Failed to fetch company", 500);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const hrUser = await prisma.hrUser.findUnique({ where: { id: req.user!.id } });
    if (!hrUser) return sendError(res, "HR user not found", 404);
    const company = await companyService.updateCompanyProfile(hrUser.companyId, req.body);
    sendSuccess(res, company, "Company profile updated");
  } catch {
    sendError(res, "Failed to update company", 500);
  }
};

export const getMyJobs = async (req: Request, res: Response) => {
  try {
    const hrUser = await prisma.hrUser.findUnique({ where: { id: req.user!.id } });
    if (!hrUser) return sendError(res, "HR user not found", 404);
    const jobs = await companyService.getCompanyJobs(hrUser.companyId);
    sendSuccess(res, jobs, "Jobs fetched");
  } catch {
    sendError(res, "Failed to fetch jobs", 500);
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const hrUser = await prisma.hrUser.findUnique({ where: { id: req.user!.id } });
    if (!hrUser) return sendError(res, "HR user not found", 404);
    await companyService.deleteJob(parseInt(req.params.jobId), hrUser.companyId);
    sendSuccess(res, null, "Job closed successfully");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete job";
    sendError(res, message, 400);
  }
};

export const getPublicCompanyProfile = async (req: Request, res: Response) => {
  try {
    const company = await companyService.getPublicCompanyProfile(parseInt(req.params.id));
    if (!company) return sendError(res, "Company not found", 404);
    sendSuccess(res, company, "Company profile fetched");
  } catch {
    sendError(res, "Failed to fetch company", 500);
  }
};

export const searchCandidates = async (req: Request, res: Response) => {
  try {
    const { skillIds, minGpa, status, universityId } = req.query;
    const candidates = await companyService.searchCandidates({
      skillIds: skillIds ? (skillIds as string).split(",").map(Number) : undefined,
      minGpa: minGpa ? parseFloat(minGpa as string) : undefined,
      status: status as any,
      universityId: universityId ? parseInt(universityId as string) : undefined,
    });
    sendSuccess(res, candidates, "Candidates fetched");
  } catch {
    sendError(res, "Failed to search candidates", 500);
  }
};