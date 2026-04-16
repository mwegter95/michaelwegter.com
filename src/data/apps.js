// App data for the portfolio.
// color drives the frame border, shadow, and interior composition of each card.
// frameStyle picks a unique ornate picture frame for each card.
// href: set to the deployed URL once live; '#' means coming soon.
//
// VITE_GALLERY_URL overrides the gallery wall iframe src — set by `npm run dev:local`
// to point the iframe at localhost:5173 instead of the deployed GitHub Pages URL.
const GALLERY_URL = import.meta.env.VITE_GALLERY_URL || "https://mwegter95.github.io/gallery-wall-planner/"

export const apps = [
  {
    id: 1,
    slug: "gallery-wall", // → michaelwegter.com/#/apps/gallery-wall (iframe)
    title: "Gallery Wall Planner",
    description:
      "Drag-and-drop tool for planning gallery wall art layouts at scale. Upload your room photo, calibrate perspective, and arrange pieces to-the-inch before you hang anything.",
    category: "Creative",
    status: "live",
    href: GALLERY_URL,
    color: "#7c6ff7", // purple
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
    href: "#", // update with deployed URL
    color: "#12b4c8", // cyan
    icon: "📊",
    frameStyle: "walnut",
  },
  {
    id: 3,
    title: "Placeholder App 3",
    description: "Coming soon.",
    category: "Productivity",
    status: "soon",
    href: "#",
    color: "#f0186e",
    icon: "∞",
    frameStyle: "silver",
  },
  {
    id: 4,
    title: "Placeholder App 4",
    description: "Coming soon.",
    category: "Data",
    status: "soon",
    href: "#",
    color: "#3a8fcc",
    icon: "▲",
    frameStyle: "ebony",
  },
];
