import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from "../controllers/users-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { adminRoles } from "../constants/access.js";

const router = Router();

router.use(requireAuth, requireRole(...adminRoles));
router.get("/", listUsers);
router.post("/", createUser);
router.get("/:userId", getUser);
router.patch("/:userId", updateUser);
router.delete("/:userId", deleteUser);

export const usersRouter = router;
