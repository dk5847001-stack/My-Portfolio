import { Router } from "express";
import {
  createBlog,
  deleteBlog,
  getBlog,
  listBlogs,
  updateBlog,
} from "../controllers/blogs-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { editorRoles } from "../constants/access.js";

const router = Router();

router.get("/", listBlogs);
router.get("/:blogId", getBlog);
router.post("/", requireAuth, requireRole(...editorRoles), createBlog);
router.patch("/:blogId", requireAuth, requireRole(...editorRoles), updateBlog);
router.delete("/:blogId", requireAuth, requireRole(...editorRoles), deleteBlog);

export const blogsRouter = router;
