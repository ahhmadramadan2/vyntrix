import { Request, Response } from "express";
import * as jobsService from "./jobs.service";
import { sendSuccess, sendError } from "../../utils/response";

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await jobsService.getAllJobs(req.query as any);
    sendSuccess(res, jobs, "Jobs fetched");
  } catch (err: unknown) {
    sendError(res, "Failed to fetch jobs", 500);
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await jobsService.getJobById(parseInt(req.params.id));
    if (!job) return sendError(res, "Job not found", 404);
    sendSuccess(res, job, "Job fetched");
  } catch (err: unknown) {
    sendError(res, "Failed to fetch job", 500);
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const hrUser = await import("../../config/db").then(({ prisma }) =>
      prisma.hrUser.findUnique({ where: { id: req.user!.id } })
    );
    if (!hrUser) return sendError(res, "HR user not found", 404);

    const job = await jobsService.createJob(hrUser.id, hrUser.companyId, req.body);
    sendSuccess(res, job, "Job created", 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create job";
    sendError(res, message, 400);
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const job = await jobsService.updateJob(parseInt(req.params.id), req.body);
    sendSuccess(res, job, "Job updated");
  } catch (err: unknown) {
    sendError(res, "Failed to update job", 500);
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    await jobsService.deleteJob(parseInt(req.params.id));
    sendSuccess(res, null, "Job closed successfully");
  } catch (err: unknown) {
    sendError(res, "Failed to delete job", 500);
  }
};