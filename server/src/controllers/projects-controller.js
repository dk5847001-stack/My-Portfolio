import { asyncHandler } from "../utils/async-handler.js";
import { ApiError, createNotFoundMessage } from "../utils/api-error.js";
import { parseBoolean } from "../utils/request.js";
import { serializeDocument } from "../utils/serializers.js";
import { Project } from "../models/project.js";

export const listProjects = asyncHandler(async (req, res) => {
  const filter = {};
  const featured = parseBoolean(req.query.featured);
  const published = parseBoolean(req.query.published);

  if (featured !== undefined) {
    filter.featured = featured;
  }

  if (published !== undefined) {
    filter.published = published;
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  const projects = await Project.find(filter).sort({ createdAt: -1 });
  res.json({ projects: projects.map(serializeDocument) });
});

export const getProject = asyncHandler(async (req, res) => {
  const filter = req.params.projectId.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: req.params.projectId }
    : { slug: req.params.projectId };
  const project = await Project.findOne(filter);

  if (!project) {
    throw new ApiError(404, createNotFoundMessage("Project"));
  }

  res.json({ project: serializeDocument(project) });
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    ...req.body,
    createdBy: req.auth.user._id,
    updatedBy: req.auth.user._id,
  });

  res.status(201).json({ project: serializeDocument(project) });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.projectId,
    { ...req.body, updatedBy: req.auth.user._id },
    { new: true, runValidators: true }
  );

  if (!project) {
    throw new ApiError(404, createNotFoundMessage("Project"));
  }

  res.json({ project: serializeDocument(project) });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.projectId);

  if (!project) {
    throw new ApiError(404, createNotFoundMessage("Project"));
  }

  res.json({ message: "Project deleted successfully." });
});
