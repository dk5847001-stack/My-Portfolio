import { Router } from "express";
import { listNotifications, updateNotification } from "../controllers/notifications-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { editorRoles } from "../constants/access.js";

const router = Router();

router.use(requireAuth, requireRole(...editorRoles));
router.get("/", listNotifications);
router.patch("/:notificationId", updateNotification);

export const notificationsRouter = router;
