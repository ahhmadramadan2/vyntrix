import { Request, Response } from "express";
import * as authService from "./auth.service";
import { sendSuccess, sendError } from "../../utils/response";

export const studentRegister = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerStudent(req.body);
    sendSuccess(res, result, "Student registered successfully", 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    sendError(res, message, 400);
  }
};

export const studentLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginStudent(email, password);
    sendSuccess(res, result, "Login successful");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    sendError(res, message, 401);
  }
};

export const companyRegister = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerCompany(req.body);
    sendSuccess(res, result, "Company registered successfully", 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    sendError(res, message, 400);
  }
};

export const companyLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginCompany(email, password);
    sendSuccess(res, result, "Login successful");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    sendError(res, message, 401);
  }
};
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    await authService.forgotPassword(email, role);
    sendSuccess(res, null, "Password reset email sent");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send reset email";
    sendError(res, message, 400);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword, role } = req.body;
    await authService.resetPassword(token, newPassword, role);
    sendSuccess(res, null, "Password reset successfully");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reset password";
    sendError(res, message, 400);
  }
};

export const changeStudentCredentials = async (req: Request, res: Response) => {
  try {
    const result = await authService.changeStudentCredentials(req.user!.id, req.body);
    sendSuccess(res, result, "Credentials updated successfully");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update credentials";
    sendError(res, message, 400);
  }
};

export const changeHrCredentials = async (req: Request, res: Response) => {
  try {
    const result = await authService.changeHrCredentials(req.user!.id, req.body);
    sendSuccess(res, result, "Credentials updated successfully");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update credentials";
    sendError(res, message, 400);
  }
};