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
//   tags          string[]; technologies + descriptors used to filter the gallery.
//                 Every tag SHOULD belong to a section in `tagSections` below.
//   screenshot    BASE_URL-relative path to a hero still under public/work-samples/,
//                 or null when no capture exists yet.
//   client        client name or null
//   postingSummary one-line summary of the Upwork posting
//   builtFor      the role/job title from the posting
//   date          ISO date the demo was built

const workSampleRegistry = [
  {
    id: 11,
    slug: "ks-global-estates",
    title: "KS Global Estates",
    description:
      "A full-featured luxury real estate platform: synchronized split-pane map and list, faceted filtering across 6 dimensions, custom Leaflet price-pin markers, property detail modals with gallery carousel and inquiry form, and a persisted favorites system. 25 properties across 14 global cities.",
    category: "Creative",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/ks-global-estates/",
    color: "#B8975A",
    icon: "🏛️",
    frameStyle: "baroque",
    tags: ["React", "Leaflet", "Maps", "JavaScript", "Full-Stack", "E-commerce", "Dashboard", "Mobile App"],
    screenshot: import.meta.env.BASE_URL + "work-samples/ks-global-estates.png",
    client: "KS Global Estates",
    postingSummary:
      "Professional website for a global real estate firm: premium design, property listings in list and map view, and a mock database of properties.",
    builtFor: "Website Design and Development for KS Global Estates (Upwork)",
    date: "2025-07-14",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 10,
    slug: "card-shopper",
    title: "Card Shopper - curated trading card marketplace",
    description:
      "A card-show-style marketplace for sports, Pokemon, and Magic cards: browse verified shops on a US map, dig through a value box with a real face-down card flip, and run a zero-fee seller booth with AI-assisted upload and drop announcements. Fully interactive prototype with localStorage persistence.",
    category: "E-commerce",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/card-shopper/",
    color: "#0E3B2E",
    icon: "🃏",
    frameStyle: "baroque",
    tags: ["React", "JavaScript", "Maps", "E-commerce", "Dashboard", "Mobile App", "Real-time"],
    screenshot: import.meta.env.BASE_URL + "work-samples/card-shopper.png",
    client: "Upwork, Card Shopper (trading card marketplace founder)",
    postingSummary:
      "Curated card-show-style marketplace: US map of verified shops, value-box flip browse, 4-step AI upload, zero-fee Stripe subscription.",
    builtFor: "Card Shopper - curated trading card marketplace (Upwork)",
    date: "2026-06-30",
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
    tags: ["React", "Flask", "Python", "Leaflet", "Maps", "JWT Auth", "Full-Stack"],
    screenshot: null,
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
    tags: ["JavaScript", "Marketing Site", "Landing Page"],
    screenshot: import.meta.env.BASE_URL + "work-samples/construction-company-website.png",
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
    tags: ["React", "Chart.js", "Flask", "Python", "Real-time", "JWT Auth", "Dashboard", "Data Viz", "Full-Stack"],
    screenshot: import.meta.env.BASE_URL + "work-samples/edtech-school-connect-web-portal.png",
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
    tags: ["JavaScript", "Calculator", "Data Viz"],
    screenshot: import.meta.env.BASE_URL + "work-samples/grocapitus-investor-tools.png",
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
    tags: ["JavaScript", "Marketing Site", "HIPAA-aware"],
    screenshot: import.meta.env.BASE_URL + "work-samples/aba-services-website.png",
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
    tags: ["Shopify", "E-commerce", "JWT Auth"],
    screenshot: import.meta.env.BASE_URL + "work-samples/art-print-storefront.png",
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
    tags: ["Next.js", "JWT Auth", "RBAC", "Booking", "E-commerce", "HIPAA-aware", "Dashboard", "Full-Stack"],
    screenshot: null,
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
    tags: ["React Native", "Mobile App", "Flask", "Python", "Data Viz", "Full-Stack"],
    screenshot: import.meta.env.BASE_URL + "work-samples/repsetta-fitness.png",
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
    tags: ["React", "FastAPI", "Python", "Data Viz", "ETL", "Dashboard", "Full-Stack"],
    screenshot: import.meta.env.BASE_URL + "work-samples/full-stack-developer-python-fastapi.png",
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
    tags: ["React", "Landing Page", "Data Viz", "Flask", "Python"],
    screenshot: null,
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
    tags: ["NestJS", "Node.js", "TypeScript", "PostgreSQL", "Next.js", "RBAC", "Dashboard", "Full-Stack"],
    screenshot: import.meta.env.BASE_URL + "work-samples/trucking-freight-factoring-and-banking.png",
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
    tags: ["JavaScript", "AI", "RAG", "On-device AI", "WebGPU", "Dashboard"],
    screenshot: import.meta.env.BASE_URL + "work-samples/ai-chatbot-for-customer-support.png",
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
    tags: ["JavaScript", "Audio", "Real-time"],
    screenshot: import.meta.env.BASE_URL + "work-samples/audio-software-engineer-needed-for.png",
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
    tags: ["React", "Leaflet", "Maps", "RBAC", "Dashboard", "Full-Stack"],
    screenshot: import.meta.env.BASE_URL + "work-samples/adverteyes.png",
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
    tags: ["Angular", "TypeScript", "Tailwind CSS", "Flask", "Python", "JWT Auth", "CMS", "Multilingual", "AI", "WebGPU", "Full-Stack"],
    screenshot: import.meta.env.BASE_URL + "work-samples/solo-law.png",
    client: "Solo/Boutique Law Practice (Upwork)",
    postingSummary:
      "Premium responsive CMS-driven law firm website with multilingual support, editorial B&W design, AI-assisted visual content, and Angular TypeScript frontend.",
    builtFor: "Premium Website Designer/Developer: CMS, Multilingual, AI-Assisted (Upwork)",
    date: "2026-06-22",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
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
    tags: ["JavaScript", "AI", "CRM", "Dashboard", "Data Viz"],
    screenshot: import.meta.env.BASE_URL + "work-samples/telehealthy.png",
    client: "Healthcare / Service Business (Upwork)",
    postingSummary:
      "AI Receptionist (24/7 inbound booking, FAQs, escalation) + AI Outbound Caller (dynamic CRM scripts, reminders) for a medical/psychiatry practice. Webhook + SMS integration, call recording, analytics dashboard, warm transfer logic.",
    builtFor: "AI & Automation Engineer -- Voice Receptionist & Automated Caller System (Upwork)",
    date: "2026-06-21",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 15,
    slug: "auction-scraper",
    title: "Auction Scraper Console",
    description:
      "Live multi-source ETL pipeline: three auction houses (static + JS-rendered), SSE streaming dashboard, real-time lot cards with images, raw vs. normalized JSON inspector, per-source telemetry log with rate-limit and retry events, and CSV/JSON export.",
    category: "Data",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/auction-scraper/",
    color: "#8B6914",
    icon: "🏺",
    frameStyle: "walnut",
    tags: ["Python", "Web Scraping", "ETL", "Real-time", "Dashboard"],
    screenshot: import.meta.env.BASE_URL + "work-samples/auction-scraper.png",
    client: "Upwork / Collectibles Subscription Service",
    postingSummary:
      "Data Acquisition Engineer for a collectibles subscription service: Python scrapers (requests+BS4 for static, Playwright for JS-rendered), normalized JSON output, rate limiting, responsible scraping, ongoing ETL pipeline.",
    builtFor: "Backend Data Acquisition / ETL Engineer (Upwork)",
    date: "2026-06-23",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 17,
    slug: "maryland-driveway-restore",
    title: "Maryland Driveway Restore",
    description:
      "Full WordPress demo for a premium Maryland driveway restoration company. Real WP dashboard login available. 9 pages, mobile-first with sticky CTAs, before/after comparison slider, 3-tier pricing, gallery with lightbox, FAQ accordion, and Rank Math SEO. Custom mdr-theme built from scratch.",
    category: "Creative",
    status: "live",
    href: "https://api.michaelwegter.com/demos/maryland-driveway-restore/",
    color: "#2F5D3A",
    icon: "🛣️",
    frameStyle: "walnut",
    tags: ["WordPress", "PHP", "Marketing Site", "CMS"],
    screenshot: import.meta.env.BASE_URL + "work-samples/maryland-driveway-restore.png",
    client: "Maryland Driveway Restore",
    postingSummary:
      "Phase 1 WordPress site: 9 pages, mobile-first, local SEO, lead capture forms. Phase 2: 30-50 city landing pages, interactive estimate calculator, advanced SEO.",
    builtFor: "WordPress Developer (Upwork)",
    date: "2026-06-27",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 18,
    slug: "orschell-excavating-e-commerce-full",
    title: "Orschell Supply Co.",
    description:
      "Full-stack e-commerce platform: storefront, cart, checkout, JWT auth, admin CMS with product/inventory/order management. Node.js + TypeScript + SQLite backend (PostgreSQL-ready schema). Mock payment labeled as demo.",
    category: "Data",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/orschell-excavating-e-commerce-full/",
    color: "#F76B10",
    icon: "🏗",
    frameStyle: "walnut",
    tags: ["Node.js", "TypeScript", "SQLite", "E-commerce", "JWT Auth", "CMS", "REST API", "Dashboard", "Full-Stack"],
    screenshot: import.meta.env.BASE_URL + "work-samples/orschell-excavating-e-commerce-full.png",
    client: "Orschell Excavating",
    postingSummary:
      "Backend for existing e-commerce site: auth, catalog, inventory, orders, payment gateway, REST API, Node.js + TypeScript + PostgreSQL.",
    builtFor: "Full-Stack E-Commerce Developer (Upwork)",
    date: "2026-06-28",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 19,
    slug: "panhandle-garage-door-company",
    title: "Dimitroff Door Repair — SEO-First WordPress",
    description:
      "Production WordPress site for a Texas Panhandle door company: SEO-architected service silos, 12 city landing pages, LocalBusiness schema, Core Web Vitals optimization, click-to-call conversion CTAs, and an integrated live SEO audit tool.",
    category: "Utility",
    status: "live",
    href: "https://api.michaelwegter.com/demos/panhandle-garage-door-company/",
    color: "#1B3A5C",
    icon: "🚪",
    frameStyle: "walnut",
    client: "Dimitroff Door Repair",
    postingSummary:
      "SEO-first WordPress redesign for a Texas Panhandle garage door and commercial door company targeting the highest regional rankings and qualified phone call generation.",
    builtFor: "WordPress & SEO Developer (Upwork)",
    date: "2026-06-29",
    proposalDeckUrl: null,
    proposalPageUrl: null,
    screenshot: null,
    tags: ["WordPress", "Local SEO", "Technical SEO", "PHP", "Full-Stack", "Landing Page", "Dashboard"],
  },
  {
    id: 20,
    slug: "real-estate-intelligence-center",
    title: "Pathwaize Intelligence Center",
    description:
      "AI workflow execution console for real estate investors. Three engines (Authority, Newsletter, Knowledge) wired end-to-end through a run/review/approve/push pipeline powered by on-device WebGPU inference.",
    category: "Data",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/real-estate-intelligence-center/",
    color: "#0EA5E9",
    icon: "🎯",
    frameStyle: "walnut",
    tags: ["JavaScript", "WebGPU", "On-device AI", "AI", "Dashboard", "Full-Stack", "Data Viz"],
    screenshot: null,
    client: "Pathwaize",
    postingSummary:
      "Build an AI-powered execution console for real estate investors: 3 AI engines, run/review/approve/push workflow, backend LLM routing layer, approval-gated publishing.",
    builtFor: "Full-Stack SaaS Developer (Upwork)",
    date: "2026-06-30",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 16,
    slug: "client-finder-1-0",
    title: "Client Finder 1.0",
    description:
      "B2B lead discovery and analysis tool for MN-based SMBs: Google-powered search pipeline, WebGPU AI site audit (modernity, mobile, functionality scores), contact enrichment, and a full CRM dashboard with drill-down modals, screenshots, and outreach tracking.",
    category: "Data",
    status: "live",
    hidden: true,
    href: import.meta.env.BASE_URL + "demos/client-finder-1-0/",
    color: "#2563EB",
    icon: "🔍",
    frameStyle: "walnut",
    tags: ["React", "FastAPI", "Python", "SQLite", "AI", "WebGPU", "CRM", "Web Scraping", "Dashboard", "Full-Stack"],
    screenshot: null,
    client: "Upwork / Custom Software Agency",
    postingSummary:
      "Local client discovery tool for a MN-based custom software and web dev agency: Google/Serper search pipeline, WebGPU AI technical audit, contact enrichment, FastAPI + React CRM dashboard with SQLite persistence.",
    builtFor: "Expert Python & AI System Architect -- Client Finder 1.0 (Upwork)",
    date: "2026-06-24",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 20,
    slug: "agripro",
    title: "AgriPro Operations Console",
    description:
      "Internal ops platform for an agricultural procurement business: role-based access for four user types, field inspection workflows with AI-powered OCR cert scanning and anomaly detection, multi-stage procurement approvals, warehouse allocation, audit logging, and dashboards with PDF and Excel export.",
    category: "Dashboard",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/agripro/",
    color: "#1D4ED8",
    icon: "🌾",
    frameStyle: "walnut",
    tags: ["React", "JavaScript", "AI", "RBAC", "Dashboard", "Full-Stack", "Data Viz"],
    screenshot: import.meta.env.BASE_URL + "work-samples/agripro.png",
    client: "Upwork, Agricultural Procurement Business",
    postingSummary:
      "Internal ops platform for ag procurement: field inspections, lab testing, OCR cert scanning, anomaly detection, multi-stage approvals, warehouse allocation, and role-based dashboards.",
    builtFor: "AI App & Web Development for Agriculture Procurement Business (Upwork)",
    date: "2025-07-11",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 21,
    slug: "realty-ops-console",
    title: "Plat Realty Ops Console",
    description:
      "Full-featured property management platform built on Angular + TypeScript + Tailwind: listing CRUD with a deal state machine that enforces valid pipeline transitions, CRM lead capture from public inquiry forms, Kanban deal pipeline with commission calculations, a block-based CMS with live preview and publish, and a dashboard aggregating KPIs across all pipeline stages. Laravel/PHP backend architecture modeled in demo-src with Eloquent models, migrations, policies, form requests, and a DealStateMachine.",
    category: "Dashboard",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/realty-ops-console/",
    color: "#4A5C47",
    icon: "🏡",
    frameStyle: "walnut",
    tags: ["Angular", "TypeScript", "Tailwind CSS", "PHP", "CMS", "CRM", "Dashboard", "Full-Stack", "RBAC"],
    screenshot: import.meta.env.BASE_URL + "work-samples/realty-ops-console.png",
    client: "Wacky Eagle Technologies",
    postingSummary:
      "Freelance full-stack web developer (PHP/WordPress/Laravel) for a small web shop. Screening question: describe your most complex PHP project. Demo answers with a Laravel/Angular realty ops console.",
    builtFor: "Freelance Web Developer (As-Needed - Full-Stack - WordPress - PHP) (Upwork)",
    date: "2025-07-01",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
  {
    id: 22,
    slug: "cinched-crm",
    title: "Cinched CRM - Multi-Tenant SaaS",
    description:
      "Interactive architecture demo for converting a single-tenant wedding CRM into a multi-tenant SaaS: Supabase RLS isolation with live SQL generator, self-serve onboarding wizard, Stripe billing state machine, role-based access control with seat-limit gates, and a 4-tab strategy hub covering hosting migration, Google OAuth vs Nylas, and production readiness.",
    category: "Dashboard",
    status: "live",
    href: import.meta.env.BASE_URL + "demos/cinched-crm/",
    color: "#1B2B4B",
    icon: "💍",
    frameStyle: "baroque",
    tags: ["React", "Supabase", "SaaS", "RBAC", "Dashboard", "CRM", "Full-Stack"],
    screenshot: import.meta.env.BASE_URL + "work-samples/cinched-crm.png",
    postingSummary:
      "Convert a single-tenant wedding CRM into a multi-tenant SaaS: Supabase + RLS, Stripe billing, self-serve onboarding, white-label branding, roles/seats, and production migration from Replit.",
    builtFor: "Converting Single Tenant to Multi-Tenant CRM (Upwork)",
    date: "2025-07-15",
    proposalDeckUrl: null,
    proposalPageUrl: null,
  },
];

// Grouped tag taxonomy for the Work Samples filter UI. Sections render as
// toggle-able groups; each tag is an individual toggle. When adding a new work
// sample, reuse an existing tag where one fits and only add a new tag here when
// no current tag describes the technology or app style.
export const tagSections = [
  {
    id: "frontend",
    label: "Frontend",
    tags: [
      "React",
      "React Native",
      "Angular",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "Chart.js",
      "Leaflet",
      "WordPress",
      "Shopify",
    ],
  },
  {
    id: "backend",
    label: "Backend",
    tags: ["Node.js", "Python", "Flask", "FastAPI", "NestJS", "PHP", "REST API"],
  },
  {
    id: "data",
    label: "Data & Infra",
    tags: ["PostgreSQL", "SQLite", "Supabase", "Web Scraping", "ETL", "Data Viz", "Real-time"],
  },
  {
    id: "ai",
    label: "AI",
    tags: ["AI", "RAG", "On-device AI", "WebGPU"],
  },
  {
    id: "auth",
    label: "Auth & Security",
    tags: ["JWT Auth", "RBAC", "HIPAA-aware"],
  },
  {
    id: "type",
    label: "Type & Features",
    tags: [
      "Dashboard",
      "Landing Page",
      "Marketing Site",
      "SaaS",
      "E-commerce",
      "CMS",
      "Booking",
      "CRM",
      "Mobile App",
      "Calculator",
      "Audio",
      "Maps",
      "Multilingual",
      "Full-Stack",
    ],
  },
];

// Sections limited to the tags actually present on `samples`, preserving the
// canonical section + tag order. Used by the gallery to avoid rendering filters
// that match nothing.
export function availableTagSections(samples) {
  const present = new Set(samples.flatMap((s) => s.tags || []));
  return tagSections
    .map((section) => ({
      ...section,
      tags: section.tags.filter((tag) => present.has(tag)),
    }))
    .filter((section) => section.tags.length > 0);
}

export const allWorkSamples = workSampleRegistry;
export const workSamples = workSampleRegistry.filter((sample) => !sample.hidden);
