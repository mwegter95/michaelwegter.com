// Simulated push integrations  -  Drive, GitHub, LinkedIn, X
// All return success receipts after a short delay to simulate network latency

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function shortId() {
  return Math.random().toString(36).slice(2, 10);
}

function slugify(title = "untitled") {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

// --- Google Drive ---

export async function pushToGoogleDrive(content, title = "Pathwaize KB Entry") {
  await delay(600 + Math.random() * 400);
  const fileId = "1" + shortId().toUpperCase() + shortId().toUpperCase();
  const slug = slugify(title);
  return {
    platform: "Google Drive",
    icon: "📁",
    fileId,
    fileName: `${title}.md`,
    path: `/Pathwaize KB/${title}.md`,
    url: `https://drive.google.com/file/d/${fileId}/view`,
    timestamp: new Date().toISOString()
  };
}

// --- GitHub ---

export async function pushToGitHub(content, title = "kb-entry") {
  await delay(700 + Math.random() * 300);
  const sha = shortId() + shortId().slice(0, 5);
  const slug = slugify(title);
  return {
    platform: "GitHub",
    icon: "🐙",
    sha,
    branch: "main",
    path: `kb/${slug}.md`,
    url: `https://github.com/pathwaize/knowledge-base/commit/${sha}`,
    commit_message: `docs: add ${title}`,
    timestamp: new Date().toISOString()
  };
}

// --- LinkedIn ---

export async function pushToLinkedIn(content, platform) {
  await delay(550 + Math.random() * 350);
  const postId = "720918" + Math.floor(Math.random() * 9999999).toString().padStart(7, "0");
  return {
    platform: "LinkedIn",
    icon: "💼",
    postId,
    status: "draft_saved",
    preview: (content || "").slice(0, 80) + (content && content.length > 80 ? "..." : ""),
    url: `https://www.linkedin.com/feed/update/urn:li:share:${postId}/`,
    timestamp: new Date().toISOString()
  };
}

// --- X / Twitter ---

export async function pushToTwitter(content) {
  await delay(480 + Math.random() * 320);
  const tweetId = "180233" + Math.floor(Math.random() * 9999999999).toString().padStart(10, "0");
  return {
    platform: "X",
    icon: "✖️",
    tweetId,
    status: "draft_saved",
    preview: (content || "").slice(0, 60) + (content && content.length > 60 ? "..." : ""),
    url: `https://x.com/i/web/status/${tweetId}`,
    timestamp: new Date().toISOString()
  };
}

// --- Unified push by destination ---

export async function pushOutput(destination, content, title) {
  switch (destination) {
    case "gdrive":  return pushToGoogleDrive(content, title);
    case "github":  return pushToGitHub(content, title);
    case "linkedin": return pushToLinkedIn(content, "linkedin");
    case "twitter": return pushToTwitter(content);
    default:        return pushToLinkedIn(content, destination);
  }
}
