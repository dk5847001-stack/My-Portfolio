import { Router } from "express";
import { listRoles, login, me, register } from "../controllers/auth-controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/roles", listRoles);
router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);

export const authRouter = router;
