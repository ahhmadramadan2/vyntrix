import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

// Use after authenticate middleware
// Example: router.post("/jobs", authenticate, requireRole("HR"), createJob)

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Not authenticated", 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, "Access denied: insufficient permissions", 403);
      return;
    }

    next();
  };
};