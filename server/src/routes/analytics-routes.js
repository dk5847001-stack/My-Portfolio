import { Router } from "express";
import {
  createAnalytics,
  deleteAnalytics,
  getAnalytics,
  listAnalytics,
  updateAnalytics,
} from "../controllers/analytics-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { adminRoles } from "../constants/access.js";

const router = Router();

router.use(requireAuth, requireRole(...adminRoles));
router.get("/", listAnalytics);
router.post("/", createAnalytics);
router.get("/:analyticsId", getAnalytics);
router.patch("/:analyticsId", updateAnalytics);
router.delete("/:analyticsId", deleteAnalytics);

export const analyticsRouter = router;
