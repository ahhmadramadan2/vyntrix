import { Response } from "express";

// Standardized API response format for every endpoint
// All responses follow: { success, message, data } or { success, message, error }

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message = "Something went wrong",
  statusCode = 500,
  error?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || null,
  });
};