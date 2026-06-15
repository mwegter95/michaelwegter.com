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
  {
    id: 5,
    slug: "full-stack-developer-python-fastapi",
    title: "Compliance Reconciliation Console",
    description:
      "A fiscal XML reconciliation console: it detects a SAF-T file's schema, runs a memory-stable streaming parse, evaluates 10 named reconciliation rules with adjustable thresholds and drill-down to the offending records, and paginates a 100,000-row ledger the way a real API would.",
    category: "Data",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/full-stack-developer-python-fastapi/",
    color: "#12b4c8",
    icon: "🧾",
    frameStyle: "baroque",
    client: "Upwork / Fiscal Compliance SaaS",
    postingSummary:
      "Build a B2B compliance SaaS that ingests 500+ MB XML files, applies 170+ reconciliation rules, and delivers multi-tenant analytical dashboards.",
    builtFor: "Full-Stack Developer (Python/FastAPI + React) Compliance SaaS (Upwork)",
    date: "2026-06-14",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 6,
    slug: "healthstack-patient-portal",
    title: "HealthStack Patient Portal",
    description:
      "A Sesame-style healthcare booking portal demonstrating Next.js/Supabase architecture patterns: role-based JWT auth (patient vs admin), provider browsing, slot booking, mock Stripe checkout, and HIPAA-aware PHI minimization with an audit log.",
    category: "Productivity",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/healthstack-patient-portal/",
    color: "#12b4c8",
    icon: "🏥",
    frameStyle: "baroque",
    client: "US Healthcare Startup (Upwork)",
    postingSummary:
      "Full-stack developer needed to build a healthcare web app with Next.js, Supabase, Stripe, and Vercel for US healthcare clients requiring HIPAA-aware design.",
    builtFor: "Full-Stack Developer (Next.js + Supabase + Stripe) Healthcare Startup (Upwork)",
    date: "2026-06-14",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 7,
    slug: "edtech-school-connect-web-portal",
    title: "SchoolConnect Portal",
    description:
      "A two-role school-parent communication portal with real-time messaging, a live student performance dashboard with a Chart.js radar chart, and an announcements feed backed by a Flask API.",
    category: "EdTech",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/edtech-school-connect-web-portal/",
    color: "#1A56DB",
    icon: "🎓",
    frameStyle: "walnut",
    client: "Upwork EdTech Prospect",
    postingSummary:
      "Build an EdTech School Connect Web Portal for school-parent communication with real-time student performance and activity updates.",
    builtFor: "EdTech School Connect Web Portal (Upwork)",
    date: "2026-06-15",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 8,
    slug: "construction-company-website",
    title: "Cornerstone Construction Co.",
    description:
      "Full marketing site for a regional construction company: video hero homepage, services and pricing page, filterable projects gallery with lightbox, and a validated contact form. Built with a bespoke industrial design system (charcoal + safety amber, Oswald + DM Sans).",
    category: "Creative",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/construction-company-website/",
    color: "#E8991A",
    icon: "🏗️",
    frameStyle: "walnut",
    client: "Upwork, Construction Company Owner",
    postingSummary:
      "Professional website for a residential and commercial construction company. Needed video hero homepage, services with pricing, projects gallery, and contact page. Extra emphasis on premium, clean UI.",
    builtFor: "Construction Company Website (Upwork)",
    date: "2026-06-15",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
];
