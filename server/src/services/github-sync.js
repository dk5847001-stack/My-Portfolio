const toSlug = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);

export const fetchGithubRepositories = async () => {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  if (!username || !token) {
    throw new Error("GITHUB_USERNAME and GITHUB_TOKEN are required for GitHub sync.");
  }

  const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "portfolio-server",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "GitHub sync failed.");
  }

  return data.map((repo) => ({
    title: repo.name,
    slug: toSlug(repo.name),
    excerpt: repo.description || `Synced from GitHub repository ${repo.full_name}.`,
    description: repo.description || `Repository ${repo.full_name} synced from GitHub.`,
    category: "GitHub Sync",
    techStack: [],
    tags: ["github", "synced"],
    projectUrl: repo.homepage || "",
    repositoryUrl: repo.html_url,
    published: true,
    githubSync: {
      provider: "github",
      repoId: String(repo.id),
      repoName: repo.name,
      repoOwner: repo.owner?.login || username,
      pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : undefined,
      syncedAt: new Date(),
    },
  }));
};
