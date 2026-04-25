import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "./notifications.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.get("/",             authenticate, getNotifications);
router.get("/unread-count", authenticate, getUnreadCount);
router.patch("/:id/read",   authenticate, markAsRead);
router.patch("/read-all",   authenticate, markAllAsRead);

export default router;