import { Request, Response } from "express";
import * as appService from "./applications.service";
import { sendSuccess, sendError } from "../../utils/response";

export const applyToJob = async (req: Request, res: Response) => {
  try {
    const { jobId, coverLetter } = req.body;
    const application = await appService.applyToJob(req.user!.id, jobId, coverLetter);
    sendSuccess(res, application, "Application submitted", 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to apply";
    sendError(res, message, 400);
  }
};

export const getJobApplicants = async (req: Request, res: Response) => {
  try {
    const applicants = await appService.getJobApplicants(parseInt(req.params.jobId));
    sendSuccess(res, applicants, "Applicants fetched");
  } catch (err: unknown) {
    sendError(res, "Failed to fetch applicants", 500);
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    console.log("Update status called:", req.params.id, req.body);
    const application = await appService.updateApplicationStatus(
      parseInt(req.params.id),
      req.body.status
    );
    sendSuccess(res, application, "Status updated");
  } catch (err: unknown) {
    console.error("Update status error:", err);
    const message = err instanceof Error ? err.message : "Failed to update status";
    sendError(res, message, 400);
  }
};