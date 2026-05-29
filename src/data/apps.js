// App data for the portfolio.
// color drives the frame border, shadow, and interior composition of each card.
// frameStyle picks a unique ornate picture frame for each card.
// href: set to the deployed URL once live; '#' means coming soon.
//
// VITE_GALLERY_URL overrides the gallery wall iframe src — set by `npm run dev:local`
// to point the iframe at localhost:5173 instead of the deployed GitHub Pages URL.
// VITE_SEO_URL overrides the SEO analyzer iframe src — set by `npm run dev:local`
// to point the iframe at localhost:5015 (seo-analyzer-app local dev server).
// VITE_SPOTIFY_URL overrides the Spotify Super User Tools iframe src for local dev.
// VITE_GROWYARD_URL overrides the Growyard iframe src for local dev.
const GALLERY_URL = import.meta.env.VITE_GALLERY_URL || "https://mwegter95.github.io/gallery-wall-planner/"
const SEO_URL =
  import.meta.env.VITE_SEO_URL ||
  "https://mwegter95.github.io/free-seo-analyzer-with-js-rendering/";
const SPOTIFY_URL =
  import.meta.env.VITE_SPOTIFY_URL ||
  "https://api.michaelwegter.com/spotify/";
const GROWYARD_URL =
  import.meta.env.VITE_GROWYARD_URL ||
  "https://mwegter95.github.io/growyard/";
// VITE_LIFE_DASHBOARD_URL overrides the Life Dashboard iframe src for local dev
// (set by `npm run dev:local`) — points at the life-dashboard Vite dev server.
const LIFE_DASHBOARD_URL =
  import.meta.env.VITE_LIFE_DASHBOARD_URL ||
  "https://mwegter95.github.io/life-dashboard/";

export const apps = [
  {
    id: 1,
    slug: "gallery-wall", // → michaelwegter.com/#/apps/gallery-wall (iframe)
    title: "Stage: Room & Art Planner",
    description:
      "Calibrate a room photo & arrange art on the wall to real scale.",
    category: "Creative",
    status: "live",
    href: GALLERY_URL,
    color: "#C4875A", // Stage terracotta
    icon: "🖼",
    frameStyle: "baroque",
  },
  {
    id: 2,
    slug: "seo-analyzer",
    title: "SEO Analyzer",
    description:
      "Deep SEO audit tool with JS rendering support. Crawls pages using a headless browser and scores them across 30+ technical and content factors.",
    category: "Utility",
    status: "live",
    href: SEO_URL,
    color: "#12b4c8", // cyan
    icon: "📊",
    frameStyle: "walnut",
  },
  {
    id: 3,
    slug: "spotify-tools",
    title: "Spotify Super User Tools",
    description:
      "Power tools for Spotify: extract playlist track lists, build playlists from a song list, and create clean (non-explicit) versions of any playlist.",
    category: "Music",
    status: "live",
    href: SPOTIFY_URL,
    color: "#1DB954", // Spotify green
    icon: "🎵",
    frameStyle: "baroque",
  },
  {
    id: 4,
    slug: "growyard",
    title: "Growyard",
    description:
      "Per-yard plant database with a month-by-month maintenance calendar. Track what needs pruning, watering, or planting and check it off as you go.",
    category: "Utility",
    status: "live",
    href: GROWYARD_URL,
    color: "#4F6F44", // sage / leaf green
    icon: "🌱",
    frameStyle: "walnut",
  },
  {
    id: 5,
    slug: "life-dashboard",
    title: "Life Dashboard",
    description:
      "A behavioral-science habit tracker. Build streaks, level up, earn badges, & surface dated reminders.",
    category: "Productivity",
    status: "live",
    href: LIFE_DASHBOARD_URL,
    color: "#f0186e", // hot-pink — matches the website palette token
    icon: "🚗",         // emoji fallback; MacDesktop renders the SVG glyph when iconKey is set
    iconKey: "life-dashboard",
    frameStyle: "baroque",
  },
];
