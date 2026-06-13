// Work-sample registry for client-proposal demos.
//
// This mirrors src/data/apps.js but is a SEPARATE list so client demos stay
// distinct from Michael's personal tools. The Upwork Proposal Engine appends one
// entry here per run.
//
// Demos built by the workflow are same-origin static apps under public/demos/<slug>/,
// so `href` is a BASE_URL-relative path, not an external GitHub Pages URL.
//
// Schema (extends the apps.js schema):
//   id            unique number, sequential
//   slug          kebab-case -> /work-samples/<slug> and /demos/<slug>/
//   title         display name
//   description   one or two plain sentences
//   category      "Utility" | "Creative" | "Productivity" | "Data" | ...
//   status        "live"
//   href          import.meta.env.BASE_URL + "demos/<slug>/"
//   color         "#rrggbb" from the site palette
//   icon          single emoji
//   frameStyle    "baroque" | "walnut"
//   client        client name or null
//   postingSummary one-line summary of the Upwork posting
//   builtFor      the role/job title from the posting
//   date          ISO date the demo was built

export const workSamples = [
  {
    id: 1,
    slug: "aba-services-website",
    title: "Bright Path ABA",
    description:
      "A warm, light-mode marketing site for a fictional ABA clinic, with an interactive services explorer, BCBA team strip, FAQ accordion, and a HIPAA-aware intake form.",
    category: "Creative",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/aba-services-website/",
    color: "#e8b820",
    icon: "🌿",
    frameStyle: "walnut",
    client: "Demo for Upwork posting",
    postingSummary:
      "ABA clinic needs a visually appealing, user-friendly website that communicates services and values, with design and development handled as one package.",
    builtFor: "ABA Services Website Design and Development (Upwork)",
    date: "2026-06-10",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 2,
    slug: "grocapitus-investor-tools",
    title: "Rental Deal Analyzer",
    description:
      "A live real estate investor calculator that recomputes NOI, cap rate, cash-on-cash return, and monthly cash flow on every keystroke, with a color-coded deal verdict and a rent sensitivity slider.",
    category: "Data",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/grocapitus-investor-tools/",
    color: "#12b4c8",
    icon: "🏠",
    frameStyle: "baroque",
    client: "Grocapitus Investments",
    postingSummary:
      "Data-driven multifamily firm wants a vibe-coder to turn concepts into lightweight, AI-built educational investor tools, fast and under CEO direction.",
    builtFor: "AI-Powered Real Estate Investor Tools (Upwork)",
    date: "2026-06-11",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 3,
    slug: "repsetta-fitness",
    title: "Repsetta",
    description:
      "A real React Native strength-training app, exported to web. Pick exercises from a catalog, log sets with reps and weight, run a live rest timer between sets, and save the session to a Flask backend. Includes a guided Today program and a Progress view with an SVG volume chart.",
    category: "Productivity",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/repsetta-fitness/",
    color: "#12b4c8",
    icon: "🏋️",
    frameStyle: "walnut",
    client: "Repsetta (Upwork)",
    postingSummary:
      "Early-stage fitness startup seeks a hybrid mobile developer to build high-quality, user-friendly iOS and Android apps in React Native, for a long-term engagement.",
    builtFor: "Hybrid Mobile App Developer for Fitness Startup (Upwork)",
    date: "2026-06-12",
    proposalDeckUrl: "demos/repsetta-fitness/proposal/deck.pdf",
    proposalPageUrl: "demos/repsetta-fitness/proposal/one-pager.pdf",
  },
  {
    id: 4,
    slug: "art-print-storefront",
    title: "Art Print Storefront",
    description:
      "A Shopify OS 2.0-style fine-art print store with a horizontal scroll gallery, editorial product pages, JWT login, and mock checkout. Built to demo the tutoring workflow the client will learn.",
    category: "Shopify",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/art-print-storefront/",
    color: "#e8b820",
    icon: "🖼️",
    frameStyle: "walnut",
    client: "Upwork / Vibe Claude Coding Tutor",
    postingSummary:
      "Build and teach a custom editorial Shopify storefront for fine-art print selling, using Claude as a core part of the workflow.",
    builtFor: "Shopify Liquid Tutoring Proposal (Upwork)",
    date: "2026-06-13",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
];
