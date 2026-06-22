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
//   hidden        optional boolean; hidden samples stay available by direct slug
//                 but do not appear in work-sample galleries
//   href          import.meta.env.BASE_URL + "demos/<slug>/"
//   color         "#rrggbb" from the site palette
//   icon          single emoji
//   frameStyle    "baroque" | "walnut"
//   client        client name or null
//   postingSummary one-line summary of the Upwork posting
//   builtFor      the role/job title from the posting
//   date          ISO date the demo was built

const workSampleRegistry = [
  {
    id: 10,
    slug: "telehealthy",
    title: "TeleHealthy Voice Ops Console",
    description:
      "AI-powered voice operations platform for healthcare practices: 24/7 inbound call simulator with live intent detection, confidence scoring, and automated booking; outbound dialer with dynamic CRM-driven scripts; patient CRM; and a call analytics dashboard.",
    category: "Utility",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/telehealthy/",
    color: "#0D9488",
    icon: "🩺",
    frameStyle: "walnut",
    client: "Healthcare / Service Business (Upwork)",
    postingSummary:
      "AI Receptionist (24/7 inbound booking, FAQs, escalation) + AI Outbound Caller (dynamic CRM scripts, reminders) for a medical/psychiatry practice. Webhook + SMS integration, call recording, analytics dashboard, warm transfer logic.",
    builtFor: "AI & Automation Engineer -- Voice Receptionist & Automated Caller System (Upwork)",
    date: "2026-06-21",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 9,
    slug: "mn-state-park-tracker",
    title: "MN State Park Tracker",
    description:
      "A full-stack personal journal for tracking Minnesota's 73 state parks: interactive Leaflet map with custom pins, visit logs with photo uploads, distance from home, and per-park descriptions. Real auth, real backend, real data.",
    category: "Productivity",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/mn-state-park-tracker/",
    color: "#2D5A3D",
    icon: "🌲",
    frameStyle: "walnut",
    client: "Upwork, MN State Park Enthusiast",
    postingSummary:
      "User-friendly app to track which MN state parks you've visited, with map/list views, photo memories, attendees, date, home distance, and login.",
    builtFor: "MN State Park Tracker App (Upwork)",
    date: "2026-06-21",
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
    id: 2,
    slug: "grocapitus-investor-tools",
    title: "Rental Data Analyzer",
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
    id: 1,
    slug: "aba-services-website",
    title: "BrightPath ABA",
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
    id: 5,
    slug: "full-stack-developer-python-fastapi",
    title: "Compliance Reconciliation Console",
    description:
      "A fiscal XML reconciliation console: it detects a SAF-T file's schema, runs a memory-stable streaming parse, evaluates 10 named reconciliation rules with adjustable thresholds and drill-down to the offending records, and paginates a 100,000-row ledger the way a real API would.",
    category: "Data",
    status: "live",
    hidden: true,
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
    id: 9,
    slug: "civicq",
    title: "CivicQ Landing Page",
    description:
      "A full 10-section, build-to-spec landing page plus a methodology page for a nonpartisan civic-data platform: sticky scroll-spy nav, an interactive six-dimension scoring chart, a $75K funds breakdown, an Organization Hub mockup, and a working email-capture form backed by a real database with CSV export.",
    category: "Data",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/civicq/",
    color: "#3DBFA8",
    icon: "🏛️",
    frameStyle: "walnut",
    client: "Upwork / CivicQ",
    postingSummary:
      "Build the public-facing home page at civicq.org: a 10-section dark-mode landing page matched precisely to an existing staging design system, with three coded data visualizations, an email-capture form with CSV backup, and a /methodology page, fully responsive and WCAG 2.1 AA accessible.",
    builtFor: "Front-End Developer, Civic Tech Landing Page (React/Next.js, Dark Mode, Data Viz) (Upwork)",
    date: "2026-06-15",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 10,
    slug: "trucking-freight-factoring-and-banking",
    title: "Freight Factoring & Banking Console",
    description:
      "Full-stack freight factoring and banking operations platform: invoice submission, advance calculation, underwriter approval queue, double-entry FIDC ledger, and role-based access control. Built with NestJS + Drizzle + Postgres, integer-cents money discipline throughout.",
    category: "Data",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/trucking-freight-factoring-and-banking/",
    color: "#10B981",
    icon: "🚛",
    frameStyle: "walnut",
    client: "Upwork / Freight Fintech",
    postingSummary:
      "Migrate a mature freight factoring + banking platform (PHP/Laravel + Flutter) to a TypeScript NestJS + Drizzle monorepo; build factoring/FIDC, banking/BaaS, payments, identity & RBAC domains with real-DB integration tests and a Next.js 15 admin console.",
    builtFor: "JS Senior Expert for Claude Code Refactor (Upwork)",
    date: "2026-06-16",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 11,
    slug: "ai-chatbot-for-customer-support",
    title: "AI Customer Support Chatbot",
    description:
      "In-browser AI chatbot with RAG knowledge base, real-time order lookup, Zendesk-style escalation routing, and an admin dashboard. Runs entirely on-device via Transformers.js, zero token cost.",
    category: "Utility",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/ai-chatbot-for-customer-support/",
    color: "#1D6AE5",
    icon: "💬",
    frameStyle: "walnut",
    client: "US Online Retailer",
    postingSummary:
      "AI-powered chatbot for customer support with FAQ knowledge base, order status lookup, human escalation with ET business-hours detection, and Zendesk ticket creation. In-browser AI, zero token cost.",
    builtFor: "AI Chatbot for Customer Support (Website + Help Desk Integration) (Upwork)",
    date: "2026-06-17",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 12,
    slug: "audio-software-engineer-needed-for",
    title: "Sanctuary Playback Engine",
    description:
      "A full-featured worship playback engine built in the browser: 6-stem multitrack mixer with sample-accurate sync, section navigation with A/B loop, configurable count-in, beat-locked cue cards, and a waveform scrubber. All audio generated programmatically via Web Audio API.",
    category: "Music",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/audio-software-engineer-needed-for/",
    color: "#F0A830",
    icon: "🎙️",
    frameStyle: "walnut",
    client: "Worship Platform (Upwork)",
    postingSummary:
      "Experienced audio software engineer needed to audit, stabilize, and fix a desktop worship playback platform covering transport reliability, section navigation, audio sync, click track timing, stem routing, and mixer channel behavior.",
    builtFor: "Audio Software Engineer for Worship Playback Platform (Upwork)",
    date: "2026-06-18",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 13,
    slug: "adverteyes",
    title: "AdvertEyes OOH Ops Platform",
    description:
      "Full-stack internal ops platform for an OOH advertising company. Inventory management with Leaflet map, campaign builder, booking conflict detection, live weather/install-risk (Open-Meteo), traffic scoring (TomTom), and RBAC across 4 user roles.",
    category: "Data",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/adverteyes/",
    color: "#FF6B1A",
    icon: "👁",
    frameStyle: "walnut",
    client: "OOH Advertising Co. (Upwork)",
    postingSummary:
      "Full Stack Developer needed for custom business web application with admin dashboard, user management, API integrations, database-driven features, and modern responsive frontend (React/Next.js/Node/TS).",
    builtFor: "Full Stack Developer - Custom Web App + Admin Dashboard (Upwork)",
    date: "2026-06-19",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 14,
    slug: "solo-law",
    title: "Solo Law Premium Website + CMS",
    description:
      "Full-stack boutique law firm site: Angular 18 + TypeScript + Tailwind CSS, multilingual (EN/ES/FR), Flask OOP backend with JWT-auth CMS. Features a live WebGPU agentic AI content assistant (Draft → Reflect → Eval rubric loop, falls back to mock mode).",
    category: "Utility",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/solo-law/",
    color: "#C9A96E",
    icon: "⚖️",
    frameStyle: "baroque",
    client: "Solo/Boutique Law Practice (Upwork)",
    postingSummary:
      "Premium responsive CMS-driven law firm website with multilingual support, editorial B&W design, AI-assisted visual content, and Angular TypeScript frontend.",
    builtFor: "Premium Website Designer/Developer: CMS, Multilingual, AI-Assisted (Upwork)",
    date: "2026-06-22",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
];

export const allWorkSamples = workSampleRegistry;
export const workSamples = workSampleRegistry.filter((sample) => !sample.hidden);
