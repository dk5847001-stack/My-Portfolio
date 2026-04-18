import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { serializeDocument } from "../utils/serializers.js";
import { Blog } from "../models/blog.js";
import { Portfolio } from "../models/portfolio.js";
import { Settings } from "../models/settings.js";
import {
  generateBlogDraft,
  generateChatReply,
  generateSeoMeta,
} from "../services/smart-features.js";

const loadContext = async () => {
  const [portfolio, settings] = await Promise.all([
    Portfolio.findOne().sort({ updatedAt: -1 }),
    Settings.findOne().sort({ updatedAt: -1 }),
  ]);

  return { portfolio, settings };
};

export const chatAboutPortfolio = asyncHandler(async (req, res) => {
  const { portfolio, settings } = await loadContext();
  const result = generateChatReply({
    question: req.body?.question,
    portfolio: serializeDocument(portfolio),
    settings: serializeDocument(settings),
  });

  res.json(result);
});

export const createBlogDraftFromAi = asyncHandler(async (req, res) => {
  const { portfolio, settings } = await loadContext();
  const draft = generateBlogDraft({
    topic: req.body?.topic,
    keywords: req.body?.keywords,
    tone: req.body?.tone,
    portfolio: serializeDocument(portfolio),
    settings: serializeDocument(settings),
  });

  res.json({ draft });
});

export const generateBlogSeo = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne().sort({ updatedAt: -1 });
  const seo = generateSeoMeta({
    title: req.body?.title,
    description: req.body?.description,
    content: req.body?.content,
    keywords: req.body?.keywords,
    siteName: settings?.siteName,
  });

  res.json({ seo });
});

export const applyBlogSeo = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.blogId);

  if (!blog) {
    throw new ApiError(404, "Blog not found.");
  }

  const settings = await Settings.findOne().sort({ updatedAt: -1 });
  blog.seo = generateSeoMeta({
    title: blog.title,
    description: blog.excerpt,
    content: blog.content,
    keywords: [...(blog.tags || []), ...(req.body?.keywords || [])],
    siteName: settings?.siteName,
  });

  await blog.save();
  res.json({ blog: serializeDocument(blog) });
});
