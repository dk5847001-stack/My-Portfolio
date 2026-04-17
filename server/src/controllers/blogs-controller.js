import { asyncHandler } from "../utils/async-handler.js";
import { ApiError, createNotFoundMessage } from "../utils/api-error.js";
import { serializeDocument } from "../utils/serializers.js";
import { Blog } from "../models/blog.js";

export const listBlogs = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.tag) {
    filter.tags = req.query.tag;
  }

  const blogs = await Blog.find(filter).populate("author", "name email role").sort({ createdAt: -1 });
  res.json({ blogs: blogs.map(serializeDocument) });
});

export const getBlog = asyncHandler(async (req, res) => {
  const filter = req.params.blogId.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: req.params.blogId }
    : { slug: req.params.blogId };
  const blog = await Blog.findOne(filter).populate("author", "name email role");

  if (!blog) {
    throw new ApiError(404, createNotFoundMessage("Blog"));
  }

  res.json({ blog: serializeDocument(blog) });
});

export const createBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.create({
    ...req.body,
    author: req.auth.user._id,
  });

  res.status(201).json({ blog: serializeDocument(blog) });
});

export const updateBlog = asyncHandler(async (req, res) => {
  const updates = { ...req.body };

  if (!updates.author) {
    updates.author = req.auth.user._id;
  }

  const blog = await Blog.findByIdAndUpdate(req.params.blogId, updates, {
    new: true,
    runValidators: true,
  }).populate("author", "name email role");

  if (!blog) {
    throw new ApiError(404, createNotFoundMessage("Blog"));
  }

  res.json({ blog: serializeDocument(blog) });
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.blogId);

  if (!blog) {
    throw new ApiError(404, createNotFoundMessage("Blog"));
  }

  res.json({ message: "Blog deleted successfully." });
});
