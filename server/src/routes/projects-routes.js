import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from "../controllers/projects-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { editorRoles } from "../constants/access.js";

const router = Router();

router.get("/", listProjects);
router.get("/:projectId", getProject);
router.post("/", requireAuth, requireRole(...editorRoles), createProject);
router.patch("/:projectId", requireAuth, requireRole(...editorRoles), updateProject);
router.delete("/:projectId", requireAuth, requireRole(...editorRoles), deleteProject);

export const projectsRouter = router;
