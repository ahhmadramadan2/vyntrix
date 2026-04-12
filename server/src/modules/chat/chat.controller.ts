import { Request, Response } from "express";
import * as chatService from "./chat.service";
import { sendSuccess, sendError } from "../../utils/response";

export const searchStudents = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string || "";
    const results = await chatService.searchStudents(query, req.user!.id);
    sendSuccess(res, results, "Students found");
  } catch (err: unknown) {
    sendError(res, "Search failed", 500);
  }
};

export const sendConnectionRequest = async (req: Request, res: Response) => {
  try {
    const { receiverId } = req.body;
    const connection = await chatService.sendConnectionRequest(req.user!.id, receiverId);
    sendSuccess(res, connection, "Connection request sent", 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send request";
    sendError(res, message, 400);
  }
};

export const respondToConnection = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const connection = await chatService.respondToConnection(
      parseInt(req.params.id), req.user!.id, status
    );
    sendSuccess(res, connection, `Connection ${status.toLowerCase()}`);
  } catch (err: unknown) {
    sendError(res, "Failed to respond", 500);
  }
};

export const getConnections = async (req: Request, res: Response) => {
  try {
    const connections = await chatService.getConnections(req.user!.id);
    sendSuccess(res, connections, "Connections fetched");
  } catch (err: unknown) {
    sendError(res, "Failed to fetch connections", 500);
  }
};

export const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const requests = await chatService.getPendingRequests(req.user!.id);
    sendSuccess(res, requests, "Pending requests fetched");
  } catch (err: unknown) {
    sendError(res, "Failed to fetch requests", 500);
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await chatService.getMessages(
      parseInt(req.params.connectionId), req.user!.id
    );
    sendSuccess(res, messages, "Messages fetched");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch messages";
    sendError(res, message, 403);
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const count = await chatService.getUnreadCount(req.user!.id);
    sendSuccess(res, { count }, "Unread count fetched");
  } catch (err: unknown) {
    sendError(res, "Failed to fetch unread count", 500);
  }
};