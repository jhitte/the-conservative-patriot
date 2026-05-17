/**
 * Site configuration for The Conservative Patriot
 * 
 * TODO: Replace YOUR_GITHUB_USERNAME and the repo name below with your actual values
 * so the "Suggest a Link" flow opens the correct GitHub Issues page.
 */
export const siteConfig = {
  name: "The Conservative Patriot",
  tagline: "Balanced breaking news from across the spectrum",
  url: "https://theconservativepatriot.com", // update after you have a custom domain

  // GitHub repo used for community submissions
  github: {
    owner: "jhitte",
    repo: "the-conservative-patriot",
  },

  // How often live feeds are considered "fresh" (seconds)
  liveRevalidateSeconds: 300,

  // Max items to show from live aggregation
  maxLiveItems: 80,
};

export const getGithubNewIssueUrl = (title: string, body: string) => {
  const { owner, repo } = siteConfig.github;
  const params = new URLSearchParams({
    title,
    body,
  });
  return `https://github.com/${owner}/${repo}/issues/new?${params.toString()}`;
};
