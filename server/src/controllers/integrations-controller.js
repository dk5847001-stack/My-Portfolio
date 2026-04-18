import { asyncHandler } from "../utils/async-handler.js";
import { serializeDocument } from "../utils/serializers.js";
import { Portfolio } from "../models/portfolio.js";
import { Settings } from "../models/settings.js";
import { Project } from "../models/project.js";
import { fetchGithubRepositories } from "../services/github-sync.js";
import { buildResumePdf } from "../services/resume-pdf.js";
import { createNotification } from "../services/notifications.js";

export const syncGithubProjects = asyncHandler(async (req, res) => {
  const repos = await fetchGithubRepositories();
  const syncedProjects = [];

  for (const repo of repos) {
    const project = await Project.findOneAndUpdate(
      { "githubSync.repoId": repo.githubSync.repoId },
      { ...repo, updatedBy: req.auth.user._id, createdBy: req.auth.user._id },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    syncedProjects.push(project);
  }

  await createNotification({
    title: "GitHub sync completed",
    message: `${syncedProjects.length} repositories were synced into projects.`,
    type: "success",
    source: "github",
    link: "/projects",
  });

  res.json({ projects: syncedProjects.map(serializeDocument) });
});

export const downloadResumePdf = asyncHandler(async (_req, res) => {
  const [portfolio, settings, projects] = await Promise.all([
    Portfolio.findOne().sort({ updatedAt: -1 }),
    Settings.findOne().sort({ updatedAt: -1 }),
    Project.find({ published: true }).sort({ featured: -1, createdAt: -1 }),
  ]);

  const pdf = buildResumePdf({
    portfolio: serializeDocument(portfolio),
    settings: serializeDocument(settings),
    projects: projects.map(serializeDocument),
  });

  await createNotification({
    title: "Resume PDF downloaded",
    message: "A resume PDF was generated from the latest portfolio data.",
    type: "info",
    source: "resume",
    link: "/integrations",
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="portfolio-resume.pdf"');
  res.send(pdf);
});
