# Upwork Proposal Engine — Multi-Agent Workflow Plan

**Status:** Draft v0.1 — for revision before execution
**Owner:** Michael Wegter
**Runs in:** Claude Code, against the `michaelwegter.com` repo (+ `mw-backend` when needed)

---

## 1. What this is

A repeatable, multi-agent pipeline that takes a raw Upwork posting (plus your notes) and produces a complete, client-winning proposal package:

- **PPTX pitch deck** — polished, on-brand, structured to win the job.
- **HTML/CSS one-pager** — standalone responsive proposal page using your site's design tokens.
- **Upwork cover letter** — the actual message text to paste, tuned to the posting.
- **Working demo** — a real, clickable app (prototype or full, leaning full) that solves the client's core problem, deployed live to a new `/work-samples` section of michaelwegter.com.
- **Media** — screenshots + a short screen recording of the demo, embedded in the deck and one-pager.

It runs **fully autonomously** end-to-end, then stops once for **your review-and-revise** pass. Because there are no human gates mid-run, the pipeline's own **planning, reflection, and eval** loops are what keep quality high and tokens bounded.

### Locked decisions (from intake)

| Axis | Decision |
|---|---|
| Demo depth | Per-project: prototype **or** full app, decided by a rule in the plan phase. **Lean full.** |
| Deploy target | **Auto-push live** to a new `/work-samples` section (separate from `/apps`). Backend changes to `mw-backend` only when the demo genuinely needs them. |
| Autonomy | **Fully autonomous**, with a single final **review + revise** loop. |
| Deliverables | PPTX deck + HTML one-pager + Upwork cover letter + working demo + media. |

---

## 2. Why multi-agent (and why it saves tokens, not spends them)

The instinct is that more agents = more tokens. The opposite is true when you use **context isolation correctly**.

A single mega-context that reads the whole repo, browses the web, writes an app, captures screenshots, and authors three documents accumulates *everything* in one ballooning window — every later step pays for every earlier step's tokens. Instead:

- A thin **orchestrator** holds only the brief, the plan, and short status summaries.
- Each **specialist subagent** runs in its own fresh context, does one heavy job (read the codebase / browse / build the app / score the package), writes its output **to disk**, and returns **≤1 screen** of structured summary.
- The orchestrator passes **file paths, not file contents**, between phases.

So the expensive context (codebase, web pages, generated code) lives in disposable subagent windows and on disk — never in the main thread. This is the single biggest lever for "don't blow the budget."

---

## 3. The pipeline

```
            ┌─────────────────────────────────────────────────────────┐
  posting → │  ORCHESTRATOR  (/upwork-proposal)  — thin, holds brief   │
  + notes   └─────────────────────────────────────────────────────────┘
                 │        │        │        │        │        │      │
                 ▼        ▼        ▼        ▼        ▼        ▼      ▼
            ┌────────┐ ┌──────┐ ┌────────┐ ┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐
            │INTAKE  │ │PLAN  │ │RESEARCH│ │ DEMO   │ │MEDIA │ │WRITER│ │JUDGE │
            │ brief  │ │ plan │ │ facts  │ │ BUILD  │ │capture│ │ docs │ │ eval │
            └────────┘ └──────┘ └────────┘ └────────┘ └──────┘ └──────┘ └──────┘
                 │        │        │        │        │        │      │
                 └────────┴────────┴── all write to disk ──┴────────┴──────┘
                                          │
                                  DEPLOY + final review/revise
```

Each phase is a subagent with a **typed input/output contract** (a JSON or markdown file at a known path). Contracts make failures *detectable* instead of silently propagating.

### Phase 0 — Intake → `brief.json` *(cheap; small model)*
Parse the posting + your notes into structured fields: client problem, **explicit requirements as a checklist**, implicit needs, domain, tech hints, success signals, budget/timeline cues, red flags, and 2–3 candidate demo concepts. This file is the **contract everything else is graded against** in Phase 6.

### Phase 1 — Plan → `plan.md` *(strong model)*
Decide the demo concept and the **prototype-vs-full** call via an explicit rule (below). Define the tech stack (default: clone your existing Vite/React sub-app pattern), the **one hero feature + ≤2 supporting features**, an explicit **out-of-scope list** (the main guard against gold-plating and token runaway), and a **requirement → feature traceability matrix** so nothing in the brief goes unaddressed.

> **Prototype-vs-full rule (lean full):** Build a full deployable app unless any of these trip → fall back to prototype: (a) the hero feature requires a backend integration that can't be stubbed safely in the run budget, (b) estimated build exceeds the file/feature caps, or (c) the concept is inherently visual/throwaway. The choice and its reason are recorded in `plan.md`.

### Phase 2 — Research → `research.md` *(isolated context)*
Web-search the client/domain, competitor apps, and any APIs/libraries the demo needs. Read **only the relevant slices** of your repo (the apps.js schema, design tokens, and the simplest existing sub-app to use as a scaffold). Returns compact facts + links + a **"clone this template" pointer**. All the heavy browsing stays in this subagent's window.

### Phase 3 — Demo build → working app + registry entry *(strong model; the expensive phase)*
Scaffold a new sub-app by **cloning the simplest existing sub-app** (not greenfield), implement the hero feature mapped to the client's #1 requirement, use **mock data by default**, and wire `mw-backend` only if the plan greenlit it. Self-test: `npm run build`, `vitest`, and a smoke load. Register the demo in the new `/work-samples` registry and add its iframe route. Returns: app path, local preview URL, slug, build status — **never the code itself**.

### Phase 4 — Media capture → `media/` *(deterministic; small model)*
Run the demo's preview server and use a **Playwright script in the Linux sandbox** (deterministic, no vision tokens) to capture stills + a short screen recording / GIF of the hero flow. Save to `public/screenshots/`, return paths. One optional vision check on the hero screenshot for quality.

### Phase 5 — Proposal assembly → `proposal/` *(strong model + skills)*
- `cover-letter.md` — addresses **each requirement from the brief checklist**, links the live demo, concise, in your voice.
- `one-pager.html` — on-brand via your design tokens; embeds media + demo link.
- `deck.pptx` — via the `pptx` skill: Problem → Approach → **Live Demo** → Why Me → Scope/Next Steps; embeds media.

Each written to disk; writer returns paths only.

### Phase 6 — Eval / reflection → `eval-report.md` *(isolated judge subagent)*
Score the package against a rubric derived from `brief.json`. **Hard gates** (must pass or the run loops): every explicit requirement addressed; demo builds; demo URL returns 200; demo link present in cover letter + deck. **Soft scores**: on-brand quality, cover-letter specificity (no generic filler), conciseness, design polish. Returns a prioritized fix list. On failure, the orchestrator **re-runs only the responsible subagent** (max 2 retries) — bounded reflection, not infinite self-correction.

### Phase 7 — Deploy + final review
Commit demo + registry entry, push to `main` → GitHub Actions deploys. **Verify** the deployed `/work-samples/<slug>` URL returns 200 and the iframe loads. Then present the full package to you for the one human **review + revise** loop, and apply your edits.

---

## 4. The new `/work-samples` section (built once)

Mirrors your existing `/apps` pattern so demos stay separate from your personal tools and future clients get a browsable gallery of proven work:

- Routes `/work-samples` and `/work-samples/:slug` (parallel to `Apps` / `AppFrame`).
- Registry `src/data/workSamples.js` — same schema as `apps.js` plus: `client`, `postingSummary`, `proposalDeckUrl`, `proposalPageUrl`, `builtFor`, `date`.
- Reuse `MacDesktop` / `AppFrame` (or thin parallel components).
- Add a **"Work Samples"** nav link.

This doubles as your growing portfolio — every proposal compounds into a library that wins *future* clients.

---

## 5. Token-budget engineering (explicit)

1. **Context isolation** — orchestrator never holds codebase/web/code; subagents do, and return short summaries. (#1 lever.)
2. **Disk as memory** — all intermediates on disk; pass paths, not contents; re-read only the needed slice.
3. **`CLAUDE.md` as a conventions cache** — design tokens, registry schema, deploy steps, brand voice, template pointer written once so no agent re-explores the repo each run.
4. **Right-sized models** — Haiku for intake, media orchestration, link checks, rubric scoring; the strong model only for plan, build, and writing.
5. **Scope fences** — explicit out-of-scope list + hard caps (≤1 hero + 2 features, max files touched, build timeout, max 2 retries).
6. **Template reuse over greenfield** — always clone the simplest existing sub-app.
7. **Narrow reads** — Grep/Glob + targeted `Read` offsets; never cat large files.
8. **Bounded reflection** — eval re-runs only the failing sub-step, capped.
9. **Prompt caching** — stable schemas/rubric/CLAUDE.md positioned for cache hits.
10. **Stream to files, not chat** — deliverables never echoed into context.

---

## 6. Robustness mechanisms

- **Typed contracts** between phases (JSON/markdown schemas) → failures are detected, not propagated.
- **Hard gates** → build passes, URL 200s, every requirement checked, or the run doesn't "succeed."
- **Branch-based, idempotent git** + post-deploy verification → bad runs trivially revertible.
- **Determinism where possible** (Playwright capture, automated link checks) over vision-dependent steps.
- **Graceful degradation** → if the full-app build fails/times out, auto-fall back to the prototype tier and flag it rather than failing the whole run.
- **Run log** → each phase appends to `upwork-runs/<slug>/run.log` for debuggability.
- **Golden evals** → a small library of scored rubrics + a sample posting to regression-test the pipeline itself.

---

## 7. Proposed file layout

```
michaelwegter.com/
  .claude/
    commands/upwork-proposal.md      # orchestrator entry point (slash command)
    agents/
      intake.md  planner.md  researcher.md  demo-builder.md
      media-capture.md  proposal-writer.md  evaluator.md
  CLAUDE.md                          # conventions cache
  src/
    data/workSamples.js              # new registry
    pages/WorkSamples.jsx            # new section (clones Apps.jsx)
  upwork-runs/<slug>/                # per-run working dir (gitignored except demo)
    brief.json  plan.md  research.md  eval-report.md  run.log
    proposal/{deck.pptx, one-pager.html, cover-letter.md, media/}
```

**Invocation:** `/upwork-proposal` then paste the posting + notes (or point it at a file).

---

## 8. Build order (how we stand this up)

1. **`CLAUDE.md`** — capture design tokens, `apps.js`/`workSamples.js` schema, deploy process, brand voice, template pointer. *(One-time; saves thousands of tokens/run.)*
2. **`/work-samples` section** — route + registry + nav, wired to the existing iframe machinery. *(One-time.)*
3. **Subagents + orchestrator** — write the 7 agent definitions and the `/upwork-proposal` command with their contracts.
4. **Eval rubric + golden posting** — author the rubric and a representative sample posting to validate end-to-end.
5. **Dry run** — execute on the sample, measure token use per phase, tune caps/models.
6. **Iterate** — tighten prompts, scope fences, and the prototype-vs-full rule.

---

## 9. Open questions / things to revise

- **Brand voice + deck template:** do you have an existing deck/template or voice guide to anchor the writer, or should it derive voice from your site copy + resume?
- **`mw-backend` access:** is its repo available in this workspace for the build agent to add endpoints, or should backend-dependent demos stay stubbed until you wire them?
- **`/work-samples` vs client privacy:** some postings are sensitive — do we want a "private/unlisted" flag so a demo deploys but isn't shown in the public gallery?
- **Capture tooling:** Playwright-in-sandbox (deterministic, proposed) vs. Claude-in-Chrome (richer, more tokens) for screenshots/recording — preference?
- **Run retention:** keep every `upwork-runs/<slug>` or prune losers and keep only winners promoted to the gallery?
```
