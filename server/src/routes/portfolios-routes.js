import { Router } from "express";
import {
  createPortfolio,
  deletePortfolio,
  getPortfolio,
  listPortfolios,
  updatePortfolio,
} from "../controllers/portfolios-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { editorRoles } from "../constants/access.js";

const router = Router();

router.get("/", listPortfolios);
router.get("/:portfolioId", getPortfolio);
router.post("/", requireAuth, requireRole(...editorRoles), createPortfolio);
router.patch("/:portfolioId", requireAuth, requireRole(...editorRoles), updatePortfolio);
router.delete("/:portfolioId", requireAuth, requireRole(...editorRoles), deletePortfolio);

export const portfoliosRouter = router;
