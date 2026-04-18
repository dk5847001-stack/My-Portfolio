import { Router } from "express";
import {
  addVisitorMessage,
  createChatConversation,
  listChats,
  replyToChatConversation,
  updateChatConversation,
} from "../controllers/chat-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { editorRoles } from "../constants/access.js";

const router = Router();

router.post("/", createChatConversation);
router.post("/:chatId/messages", addVisitorMessage);
router.get("/", requireAuth, requireRole(...editorRoles), listChats);
router.post("/:chatId/reply", requireAuth, requireRole(...editorRoles), replyToChatConversation);
router.patch("/:chatId", requireAuth, requireRole(...editorRoles), updateChatConversation);

export const chatRouter = router;
