import { Router } from "express";
import {
  createMessage,
  deleteMessage,
  getMessage,
  listMessages,
  updateMessage,
} from "../controllers/messages-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { editorRoles } from "../constants/access.js";

const router = Router();

router.post("/", createMessage);
router.get("/", requireAuth, requireRole(...editorRoles), listMessages);
router.get("/:messageId", requireAuth, requireRole(...editorRoles), getMessage);
router.patch("/:messageId", requireAuth, requireRole(...editorRoles), updateMessage);
router.delete("/:messageId", requireAuth, requireRole(...editorRoles), deleteMessage);

export const messagesRouter = router;
