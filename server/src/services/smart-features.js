import { sanitizeText } from "../utils/request.js";

const fallbackProfile = {
  name: "the developer",
  title: "Full Stack Web Developer",
  subtitle: "Builds polished frontend experiences and structured backend systems.",
  bio: "Builds portfolio platforms, admin dashboards, APIs, and content systems with React, Node.js, Express, and MongoDB.",
  location: "India",
  email: "hello@pkportfolio.dev",
  skills: ["React", "Node.js", "Express", "MongoDB", "Framer Motion", "REST APIs"],
};

const spamKeywords = [
  "crypto",
  "bitcoin",
  "casino",
  "betting",
  "viagra",
  "loan",
  "forex",
  "seo package",
  "backlink",
  "whatsapp",
  "telegram",
  "earn money",
  "click here",
  "investment",
];

const chatbotPlaybook = [
  {
    matches: ["skill", "stack", "technology", "tech"],
    buildReply: (profile) =>
      `${profile.name} mainly works with ${profile.skills.slice(0, 6).join(", ")}. The focus is on modern frontend delivery plus dependable backend architecture.`,
  },
  {
    matches: ["project", "work", "portfolio"],
    buildReply: (profile) =>
      `${profile.name} builds portfolio systems, dashboards, content-managed websites, and full stack product experiences. The goal is usually clean UX on the surface and maintainable architecture underneath.`,
  },
  {
    matches: ["contact", "hire", "email", "reach"],
    buildReply: (profile) =>
      `You can reach ${profile.name} at ${profile.email}. If you share the project type, current stack, and timeline, the reply can be more practical and specific.`,
  },
  {
    matches: ["location", "based"],
    buildReply: (profile) =>
      `${profile.name} is based in ${profile.location} and works on frontend, backend, and admin dashboard projects.`,
  },
];

const stripMarkdown = (value = "") =>
  String(value)
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const toTitleCase = (value = "") =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const createSlug = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

const buildKeywords = (...sets) => {
  const unique = [];

  for (const item of sets.flat()) {
    const cleaned = sanitizeText(String(item || "").toLowerCase());

    if (!cleaned || unique.includes(cleaned)) {
      continue;
    }

    unique.push(cleaned);
  }

  return unique.slice(0, 8);
};

export const buildPortfolioProfile = (portfolio, settings) => {
  const siteName = settings?.siteName || "this portfolio";
  const heroTitle = sanitizeText(portfolio?.heroTitle || "") || fallbackProfile.title;
  const heroSubtitle = sanitizeText(portfolio?.heroSubtitle || "") || fallbackProfile.subtitle;
  const bio = stripMarkdown(portfolio?.bio || "") || fallbackProfile.bio;
  const skills = Array.isArray(portfolio?.skills) && portfolio.skills.length
    ? portfolio.skills
    : fallbackProfile.skills;

  return {
    name: siteName,
    title: heroTitle,
    subtitle: heroSubtitle,
    bio,
    location: sanitizeText(portfolio?.location || "") || fallbackProfile.location,
    email: sanitizeText(portfolio?.email || settings?.supportEmail || "") || fallbackProfile.email,
    skills,
  };
};

export const generateChatReply = ({ question, portfolio, settings }) => {
  const cleanQuestion = sanitizeText(question || "");
  const profile = buildPortfolioProfile(portfolio, settings);

  if (!cleanQuestion) {
    return {
      answer: `Ask about ${profile.name}'s skills, project style, availability, or contact details.`,
      suggestions: ["What stack do you use?", "What kind of projects do you build?", "How can I contact you?"],
    };
  }

  const lowerQuestion = cleanQuestion.toLowerCase();
  const matchedRule = chatbotPlaybook.find((rule) =>
    rule.matches.some((token) => lowerQuestion.includes(token))
  );

  const answer = matchedRule
    ? matchedRule.buildReply(profile)
    : `${profile.name} focuses on ${profile.title.toLowerCase()} work. ${profile.subtitle} Core strengths include ${profile.skills.slice(0, 5).join(", ")}.`;

  return {
    answer,
    suggestions: ["What stack do you use?", "What do you build?", "How can I hire you?"],
  };
};

export const generateBlogDraft = ({ topic, keywords = [], tone = "professional", portfolio, settings }) => {
  const profile = buildPortfolioProfile(portfolio, settings);
  const cleanTopic = sanitizeText(topic || "") || "Modern product development";
  const cleanTone = sanitizeText(tone || "") || "professional";
  const normalizedKeywords = buildKeywords(keywords, profile.skills, cleanTopic.split(" "));
  const title = `${toTitleCase(cleanTopic)} for Modern Teams`;
  const excerpt = `A ${cleanTone} breakdown of ${cleanTopic.toLowerCase()}, with practical lessons from shipping polished interfaces and dependable backend systems.`;
  const slug = createSlug(title);
  const content = [
    `## Why ${cleanTopic} matters`,
    `${profile.name} approaches ${cleanTopic.toLowerCase()} as a systems problem, not just a surface-level task. The work should feel clear for users and stay easy to maintain for the team.`,
    "",
    "## A practical approach",
    `Start with the product goal, map the data flow, and then shape the interface around real user actions. This keeps ${cleanTopic.toLowerCase()} tied to outcomes instead of trends.`,
    "",
    "## What teams should focus on",
    `1. Keep the user journey simple and intentional.`,
    `2. Build APIs and content models that can evolve without rewrites.`,
    `3. Use UI polish to reinforce clarity, not distract from it.`,
    "",
    "## Closing thought",
    `${profile.name} combines frontend craft with backend thinking, which makes ${cleanTopic.toLowerCase()} easier to ship and easier to scale.`,
  ].join("\n");

  return {
    title,
    slug,
    excerpt,
    content,
    tags: normalizedKeywords.slice(0, 5),
    readTimeMinutes: Math.max(3, Math.ceil(content.split(/\s+/).length / 180)),
    seo: generateSeoMeta({
      title,
      description: excerpt,
      content,
      keywords: normalizedKeywords,
      siteName: settings?.siteName,
    }),
    aiGenerated: true,
    generationPrompt: cleanTopic,
  };
};

export const generateSeoMeta = ({ title, description, content, keywords = [], siteName = "Portfolio" }) => {
  const cleanTitle = sanitizeText(title || "");
  const cleanDescription =
    sanitizeText(description || "") ||
    stripMarkdown(content || "").slice(0, 160);
  const topicWords = stripMarkdown(content || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 4)
    .slice(0, 12);
  const seoKeywords = buildKeywords(keywords, topicWords, [siteName, cleanTitle]);
  const seoTitle = cleanTitle
    ? `${cleanTitle} | ${siteName}`.slice(0, 120)
    : `${siteName} | Full Stack Portfolio`;

  return {
    title: seoTitle,
    description: cleanDescription.slice(0, 300),
    keywords: seoKeywords,
  };
};

export const evaluateSpam = ({ name, email, subject, message }) => {
  const combined = [name, email, subject, message]
    .map((value) => String(value || ""))
    .join(" ")
    .toLowerCase();
  let score = 0;
  const signals = [];

  for (const keyword of spamKeywords) {
    if (combined.includes(keyword)) {
      score += 18;
      signals.push(`keyword:${keyword}`);
    }
  }

  const links = combined.match(/https?:\/\//g) || [];
  if (links.length >= 2) {
    score += 30;
    signals.push("multiple-links");
  }

  if ((message || "").length < 12) {
    score += 12;
    signals.push("very-short-message");
  }

  if (/(.)\1{5,}/.test(combined)) {
    score += 15;
    signals.push("repeated-characters");
  }

  if (((message || "").match(/[A-Z]/g) || []).length > Math.max(20, String(message || "").length * 0.35)) {
    score += 10;
    signals.push("excessive-caps");
  }

  score = Math.min(score, 100);

  let verdict = "clean";
  if (score >= 65) {
    verdict = "blocked";
  } else if (score >= 30) {
    verdict = "review";
  }

  return {
    score,
    verdict,
    signals,
  };
};
