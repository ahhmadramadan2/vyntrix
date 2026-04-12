import { Request, Response } from "express";
import * as studentService from "./student.service";
import { sendSuccess, sendError } from "../../utils/response";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const profile = await studentService.getStudentProfile(req.user!.id);
    sendSuccess(res, profile, "Profile fetched");
  } catch (err: unknown) {
    sendError(res, "Failed to fetch profile", 500);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const student = await studentService.updateStudentProfile(req.user!.id, req.body);
    sendSuccess(res, student, "Profile updated");
  } catch (err: unknown) {
    sendError(res, "Failed to update profile", 500);
  }
};

export const updateExtendedProfile = async (req: Request, res: Response) => {
  try {
    const profile = await studentService.updateExtendedProfile(req.user!.id, req.body);
    sendSuccess(res, profile, "Extended profile updated");
  } catch (err: unknown) {
    sendError(res, "Failed to update profile", 500);
  }
};

export const addSkill = async (req: Request, res: Response) => {
  try {
    const { skillId, proficiencyLevel } = req.body;
    const skill = await studentService.addStudentSkill(
      req.user!.id, skillId, proficiencyLevel
    );
    sendSuccess(res, skill, "Skill added", 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add skill";
    sendError(res, message, 400);
  }
};

export const removeSkill = async (req: Request, res: Response) => {
  try {
    await studentService.removeStudentSkill(req.user!.id, parseInt(req.params.skillId));
    sendSuccess(res, null, "Skill removed");
  } catch (err: unknown) {
    sendError(res, "Failed to remove skill", 500);
  }
};

export const addProject = async (req: Request, res: Response) => {
  try {
    const project = await studentService.addProject(req.user!.id, req.body);
    sendSuccess(res, project, "Project added", 201);
  } catch (err: unknown) {
    sendError(res, "Failed to add project", 500);
  }
};

export const removeProject = async (req: Request, res: Response) => {
  try {
    await studentService.removeProject(req.user!.id, parseInt(req.params.projectId));
    sendSuccess(res, null, "Project removed");
  } catch (err: unknown) {
    sendError(res, "Failed to remove project", 500);
  }
};

export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const applications = await studentService.getMyApplications(req.user!.id);
    sendSuccess(res, applications, "Applications fetched");
  } catch (err: unknown) {
    sendError(res, "Failed to fetch applications", 500);
  }
};