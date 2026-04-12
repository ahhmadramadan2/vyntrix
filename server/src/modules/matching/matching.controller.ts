import { Request, Response } from "express";
import * as matchingService from "./matching.service";
import { sendSuccess, sendError } from "../../utils/response";

export const getMyMatches = async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const matches = await matchingService.getStudentMatches(studentId);
    sendSuccess(res, matches, "Match results fetched");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch matches";
    sendError(res, message, 500);
  }
};

export const getJobRanking = async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId);
    const matches = await matchingService.getJobMatches(jobId);
    sendSuccess(res, matches, "Job ranking fetched");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch ranking";
    sendError(res, message, 500);
  }
};

export const recalculateStudent = async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const count = await matchingService.recalculateForStudent(studentId);
    sendSuccess(res, { recalculated: count }, "Scores recalculated");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Recalculation failed";
    sendError(res, message, 500);
  }
};