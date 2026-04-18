import { Router } from "express";
import {
  applyBlogSeo,
  chatAboutPortfolio,
  createBlogDraftFromAi,
  generateBlogSeo,
} from "../controllers/smart-features-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { editorRoles } from "../constants/access.js";

const router = Router();

router.post("/chat", chatAboutPortfolio);
router.post("/blog-draft", requireAuth, requireRole(...editorRoles), createBlogDraftFromAi);
router.post("/seo", requireAuth, requireRole(...editorRoles), generateBlogSeo);
router.post("/blogs/:blogId/seo", requireAuth, requireRole(...editorRoles), applyBlogSeo);

export const smartFeaturesRouter = router;
