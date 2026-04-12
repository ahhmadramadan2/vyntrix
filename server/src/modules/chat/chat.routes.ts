import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import {
  searchStudents, sendConnectionRequest, respondToConnection,
  getConnections, getPendingRequests, getMessages, getUnreadCount,
} from "./chat.controller";

const router = Router();

// All chat routes require student auth
router.use(authenticate, requireRole("STUDENT"));

router.get("/search",                          searchStudents);
router.get("/connections",                     getConnections);
router.get("/connections/pending",             getPendingRequests);
router.post("/connections",                    sendConnectionRequest);
router.put("/connections/:id/respond",         respondToConnection);
router.get("/connections/:connectionId/messages", getMessages);
router.get("/unread",                          getUnreadCount);

export default router;