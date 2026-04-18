import { Router } from "express";
import { downloadResumePdf, syncGithubProjects } from "../controllers/integrations-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { editorRoles } from "../constants/access.js";

const router = Router();

router.get("/resume.pdf", downloadResumePdf);
router.post("/github-sync", requireAuth, requireRole(...editorRoles), syncGithubProjects);

export const integrationsRouter = router;
