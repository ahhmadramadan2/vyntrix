import { Request, Response } from "express";
import * as notifService from "./notifications.service";
import { sendSuccess, sendError } from "../../utils/response";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await notifService.getNotifications(req.user!.id);
    sendSuccess(res, notifications, "Notifications fetched");
  } catch {
    sendError(res, "Failed to fetch notifications", 500);
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const count = await notifService.getUnreadCount(req.user!.id);
    sendSuccess(res, { count }, "Unread count fetched");
  } catch {
    sendError(res, "Failed to fetch count", 500);
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    await notifService.markAsRead(parseInt(req.params.id), req.user!.id);
    sendSuccess(res, null, "Marked as read");
  } catch {
    sendError(res, "Failed to mark as read", 500);
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await notifService.markAllAsRead(req.user!.id);
    sendSuccess(res, null, "All marked as read");
  } catch {
    sendError(res, "Failed to mark all as read", 500);
  }
};