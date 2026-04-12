import { Request, Response } from "express";
import * as skillsService from "./skills.service";
import { sendSuccess, sendError } from "../../utils/response";

export const getAllSkills = async (req: Request, res: Response) => {
  try {
    const skills = await skillsService.getAllSkills(req.query.category as any);
    sendSuccess(res, skills, "Skills fetched");
  } catch (err: unknown) {
    sendError(res, "Failed to fetch skills", 500);
  }
};

export const createSkill = async (req: Request, res: Response) => {
  try {
    const { name, category } = req.body;
    const skill = await skillsService.createSkill(name, category);
    sendSuccess(res, skill, "Skill created", 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create skill";
    sendError(res, message, 400);
  }
};