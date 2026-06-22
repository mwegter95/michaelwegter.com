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
// VITE_APPLE_MUSIC_URL overrides the Apple Music Tools iframe src for local dev.
const APPLE_MUSIC_URL =
  import.meta.env.VITE_APPLE_MUSIC_URL ||
  "https://api.michaelwegter.com/apple/";
const GROWYARD_URL =
  import.meta.env.VITE_GROWYARD_URL ||
  "https://mwegter95.github.io/growyard/";
// VITE_LIFE_DASHBOARD_URL overrides the Life Dashboard iframe src for local dev
// (set by `npm run dev:local`) — points at the life-dashboard Vite dev server.
const LIFE_DASHBOARD_URL =
  import.meta.env.VITE_LIFE_DASHBOARD_URL ||
  "https://mwegter95.github.io/life-dashboard/";
// VITE_FEELGOOD_URL overrides the Feel-Good Productivity iframe src for local dev.
const FEELGOOD_URL =
  import.meta.env.VITE_FEELGOOD_URL ||
  "https://mwegter95.github.io/feel-good-productivity/";

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
  {
    id: 6,
    slug: "apple-music-tools",
    title: "Apple Music Tools",
    description:
      "Power tools for Apple Music: extract the track list from any public playlist (including shared links — no sign-in needed).",
    category: "Music",
    status: "live",
    href: APPLE_MUSIC_URL,
    color: "#FA243C", // Apple Music red
    icon: "🎧",
    frameStyle: "walnut",
  },
  {
    id: 7,
    slug: "feel-good-productivity",
    title: "Feel-Good Productivity",
    description:
      "An interactive workbook for Ali Abdaal's Feel-Good Productivity. Work through all 54 experiments, save your reflections, and track what you've done — signed in to your account.",
    category: "Productivity",
    status: "live",
    href: FEELGOOD_URL,
    color: "#F5973A", // warm sun orange
    icon: "🌅",
    frameStyle: "baroque",
  },
  {
    id: 8,
    slug: "mn-state-park-tracker",
    title: "MN State Park Tracker",
    description:
      "Track all 73 Minnesota state parks: an interactive map, visit logs with photos, attendees, dates, and distance from home — with real login and a real backend.",
    category: "Utility",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/mn-state-park-tracker/",
    color: "#2E6B3E", // pine green
    icon: "🌲",
    frameStyle: "walnut",
  },
];
