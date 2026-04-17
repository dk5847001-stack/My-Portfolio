import { Router } from "express";
import {
  createSettings,
  deleteSettings,
  getSettings,
  listSettings,
  updateSettings,
} from "../controllers/settings-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { adminRoles } from "../constants/access.js";

const router = Router();

router.use(requireAuth, requireRole(...adminRoles));
router.get("/", listSettings);
router.post("/", createSettings);
router.get("/:settingsId", getSettings);
router.patch("/:settingsId", updateSettings);
router.delete("/:settingsId", deleteSettings);

export const settingsRouter = router;
