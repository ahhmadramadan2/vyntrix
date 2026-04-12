import { Request, Response, NextFunction } from "express";

// Global error handler — catches anything thrown in route handlers
// Must be registered LAST in app.ts after all routes

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`❌ [${req.method}] ${req.path} →`, err.message);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : null,
  });
};