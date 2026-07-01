// LLMRouter  -  provider-agnostic contract
// LLMRouter.run(engineName, payload) => Promise<{ output, model, cost_usd, duration_ms }>
// WebGPU path: WebLLM (CreateMLCEngine, main thread, dual model)
// Fallback: rich canned mock responses (full workflow visible)

const PRIMARY_MODEL  = "Qwen2.5-7B-Instruct-q4f16_1-MLC";
const ROUTER_MODEL   = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";
const FALLBACK_MODEL = "Qwen2.5-3B-Instruct-q4f16_1-MLC";

let primaryEngine = null;
let routerEngine  = null;
let mockMode      = false;
let activeModel   = null;
let runCount      = 0;

// --- Canned responses (rotated per run for variety) ---

const CANNED = {
  authority: [
    {
      route: { engine: "authority", platform: "linkedin", topic: "cold calling in real estate", tone: "authoritative", angle: "why it still works" },
      generate: {
        content: "Three things I used to believe about fix-and-flip that cost me money:\n\n1. The lowest ARV estimate is conservative. It is not. It is the one you underwrite to.\n\n2. A 90-day flip timeline is achievable. Budget 120 days and celebrate if you finish at 90.\n\n3. Cold calls do not work in a seller's market. They absolutely do. Sellers who are NOT listing because they do not want showings are exactly who answers the phone.\n\nAustin still has motivated sellers. They just do not advertise. They answer calls.",
        word_count: 94,
        hashtags: ["#RealEstateInvesting", "#FixAndFlip", "#AustinRealEstate", "#MotivatedSellers", "#InvestorMindset"],
        cta: "What is the biggest misconception that cost you money when you started flipping?"
      }
    },
    {
      route: { engine: "authority", platform: "twitter", topic: "follow-up cadence", tone: "authoritative", angle: "persistence wins deals" },
      generate: {
        content: "Most investors make one cold call, hear 'not interested,' and quit.\n\nThe deal is almost never on contact 1. It is on contact 5 or 6.\n\nOur Austin pipeline right now: 214 active follow-up sequences. 12% close rate.\n\nThe edge is not the list. It is the follow-through.",
        word_count: 48,
        hashtags: ["#RealEstate", "#ColdCalling", "#FixAndFlip"],
        cta: "How many touches does your follow-up sequence run?"
      }
    }
  ],
  newsletter: [
    {
      route: { engine: "newsletter", topic: "cold call follow-up cadence", audience: "real estate investors", tone: "direct", brand_voice: "authoritative, no fluff" },
      generate: {
        body: "# The Follow-Up Sequence That Closes 12% of Cold Leads\n\nMost investors make one call and move on. The deal closes on contact five or six, not contact one.\n\nHere is the exact cadence we run for every cold call lead in Austin:\n\n**Day 1 - First call.** Leave a 22-second voicemail. No pitch. Just: who you are, what you do, and a question about their timeline.\n\n**Day 3 - SMS text.** Keep it simple: \"Hi [Name], this is [Your Name]. I called about your property on [Street]. Happy to answer any questions. No pressure.\"\n\n**Day 7 - Second call.** If they answer, lead with: \"I just want to make sure I understand your situation before I send you anything in writing.\"\n\n**Day 14 - Handwritten postcard.** Costs $1.20. Converts at 3x the rate of any digital touch at this stage.\n\n**Day 30 - Final call.** \"I have not heard back and want to respect your time. If your situation changes, here is my direct number.\"\n\nThat five-touch sequence, run consistently, is why our cold-call follow-up converts at 12%.\n\nMost investors stop at two touches. The difference between a dead lead list and a deal pipeline is follow-up discipline.",
        subject_lines: [
          "The 5-touch sequence that converts cold leads at 12%",
          "Why most investors quit at contact 2 (and what to do instead)",
          "Day 1 to Day 30: Our exact follow-up cadence"
        ],
        preview_text: "The deal is almost never on the first call. Here is the cadence that actually closes.",
        word_count: 226
      }
    },
    {
      route: { engine: "newsletter", topic: "LinkedIn content strategy", audience: "real estate investors", tone: "direct", brand_voice: "data-driven, authoritative" },
      generate: {
        body: "# Why LinkedIn Short-Form Is Winning for Real Estate Investors Right Now\n\nSix months ago, I would have told you long-form newsletters were the highest-leverage content for building authority in real estate investing.\n\nI was wrong. At least for Q3 2026.\n\nHere is what the data from our Austin market shows: short-form LinkedIn posts (under 150 words) are generating 4x the inbound referral calls compared to our newsletter sends.\n\nWhy? Three reasons:\n\n**1. Operators in our space are on LinkedIn between deals, not in their inbox.**\nOur newsletter open rate sits at 34% but our LinkedIn engagement rate on short posts is 11%. For a professional audience, that ratio matters.\n\n**2. The algorithm rewards consistency, not length.**\nPosting three times a week with tight, direct insight outperforms one deep-dive per month in reach.\n\n**3. Real estate authority is built on specifics, not frameworks.**\nPosts that reference a real deal, a real number, or a real mistake outperform generic investing advice by a wide margin.\n\nStarting this week, we are shifting our content calendar to LinkedIn short-form as the primary channel for Q3 and using the newsletter for deal updates and quarterly recaps.",
        subject_lines: [
          "Why we are shifting to LinkedIn short-form for Q3",
          "The content channel generating 4x the inbound calls",
          "Long-form vs. short-form: what the data showed us"
        ],
        preview_text: "LinkedIn short-form is outperforming our newsletter for inbound referrals. Here is why we are making the switch.",
        word_count: 234
      }
    }
  ],
  knowledge: [
    {
      route: { engine: "knowledge", topic: "seller objection script", context: "price gap", category: "process" },
      generate: {
        title: "Seller Objection Script: Price Gap",
        content: "# Seller Objection Script: Price Gap\n\n## Context\nUse when the seller's expected price exceeds your maximum allowable offer (MAO) by 10 to 30%.\n\n## Core Objection\n\"Your offer is too low. I need [X] for the property.\"\n\n## Response Framework\n\n**Step 1 - Acknowledge (never argue):**\n\"I completely understand. You have owned this property for [X] years and you know what it is worth to you. Help me understand what is driving that number.\"\n\n**Step 2 - Discover the real need:**\n\"Is the number tied to a payoff, a timeline, or is it based on what neighbors sold for?\"\n\n**Step 3 - Reframe on net proceeds:**\n\"If I could show you a way to net closer to what you are looking for without agent commissions, repairs, or carrying costs, would you be open to hearing the numbers?\"\n\n**Step 4 - Bridge the gap with terms:**\nIf price is firm, offer: flexible close date, leaseback option, or split close structure.\n\n**Step 5 - Set the next step:**\n\"Let me run the numbers overnight and call you tomorrow at [specific time]. Does that work?\"\n\n## When to Walk\nIf the seller is anchored to retail price AND unwilling to discuss net proceeds vs. gross, exit professionally: \"I respect your position. If your situation changes in the next 90 days, I would love to revisit this.\"\n\n## Tags\nobjection-handling | cold-calls | negotiation | seller-scripts | price-gap",
        tags: ["objection-handling", "cold-calls", "negotiation", "seller-scripts", "price-gap"],
        format: "markdown"
      }
    },
    {
      route: { engine: "knowledge", topic: "deal qualification checklist", context: "fix-and-flip Austin", category: "process" },
      generate: {
        title: "Deal Qualification Checklist: Fix-and-Flip",
        content: "# Deal Qualification Checklist: Fix-and-Flip\n\n## Purpose\nStandardized pre-offer checklist for Austin fix-and-flip acquisitions. Run before submitting any written offer.\n\n## Required Inputs\n- Property address and parcel number\n- Seller's timeline and motivation\n- Current condition (exterior walkthrough or photos minimum)\n- Comparable sales within 1 mile, last 90 days\n\n## Step 1 - ARV Calculation\n- Pull 3 comps: same beds/baths, same neighborhood, under 90 days\n- Use lowest comp as conservative ARV\n- Never average comps with outliers above 15% of median\n\n## Step 2 - Repair Estimate\n- Exterior: roof, foundation, siding (call contractor if any doubt)\n- Interior: kitchen, baths, flooring, HVAC, electrical, plumbing\n- Add 15% contingency to all contractor estimates\n\n## Step 3 - MAO Formula\nMAO = (ARV x 0.70) - Repairs - Closing Costs ($3,500) - Holding Costs (est. 90 days)\n\n## Step 4 - Exit Strategy Viability\n- Retail flip viable? (ARV supports after-repair margin > 20%)\n- Wholesale viable? (Can assign at MAO + $5K to another investor?)\n- Buy-and-hold viable? (Monthly rent / purchase price > 1%?)\n\n## Tags\ndeal-analysis | fix-and-flip | qualification | MAO | checklist",
        tags: ["deal-analysis", "fix-and-flip", "qualification", "MAO", "checklist"],
        format: "markdown"
      }
    }
  ]
};

// --- Progress callback storage ---
let _onProgress = null;

export async function initLLMRouter(onProgress) {
  _onProgress = onProgress;

  if (!navigator.gpu) {
    mockMode = true;
    onProgress(1, "Mock mode active  -  WebGPU not available in this browser", "mock");
    return;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      mockMode = true;
      onProgress(1, "Mock mode active  -  no WebGPU adapter", "mock");
      return;
    }

    onProgress(0.02, "WebGPU adapter found  -  loading AI model...", "loading");

    const { CreateMLCEngine } = await import("https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.84/+esm");

    // VRAM heuristic: adapter info description
    const info = await adapter.requestAdapterInfo().catch(() => ({ description: "" }));
    const desc = (info.description || "").toLowerCase();
    const isIntegrated = desc.includes("intel") || desc.includes("integrated");
    const chosenPrimary = isIntegrated ? FALLBACK_MODEL : PRIMARY_MODEL;

    if (isIntegrated) {
      onProgress(0.03, `Compact model selected for integrated GPU: ${FALLBACK_MODEL}`, "info");
    }

    activeModel = chosenPrimary;

    try {
      primaryEngine = await CreateMLCEngine(chosenPrimary, {
        initProgressCallback: (p) => onProgress(p.progress, p.text || "Loading model...", "loading")
      });
    } catch (modelErr) {
      // If pinned version doesn't have the model, try latest
      console.warn("WebLLM 0.2.84 model not found, trying latest:", modelErr.message);
      onProgress(0.02, "Trying latest WebLLM release...", "loading");
      const { CreateMLCEngine: CreateLatest } = await import("https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm/+esm");
      primaryEngine = await CreateLatest(chosenPrimary, {
        initProgressCallback: (p) => onProgress(p.progress, p.text || "Loading model...", "loading")
      });
    }

    onProgress(1, `${chosenPrimary} ready`, "ready");

    // Load router model in background (non-blocking)
    const loadRouter = async () => {
      try {
        const { CreateMLCEngine: C } = await import("https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.84/+esm");
        routerEngine = await C(ROUTER_MODEL, {});
      } catch (e) {
        console.warn("Router model not loaded, using primary for routing:", e.message);
      }
    };
    loadRouter();

  } catch (err) {
    console.warn("WebLLM init failed, switching to mock mode:", err);
    mockMode = true;
    onProgress(1, "Mock mode active  -  AI demo running with pre-built responses", "mock");
  }
}

export function isMockMode() { return mockMode; }
export function getActiveModel() { return mockMode ? "mock-llm" : (activeModel || "unknown"); }

// --- Main run contract ---

export async function runLLM(engineName, systemPrompt, userPrompt, schema) {
  runCount++;

  if (mockMode) {
    return cannedResponse(engineName, userPrompt);
  }

  const t0 = Date.now();
  const useRouter = routerEngine || primaryEngine;

  // Step 1: Route (classify intent)
  let routeOut = null;
  try {
    const rResp = await useRouter.chat.completions.create({
      messages: [
        { role: "system", content: "You are a precise intent classifier. Output ONLY valid JSON matching the provided schema." },
        { role: "user", content: `Classify: ${userPrompt}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 300
    });
    routeOut = JSON.parse(rResp.choices[0].message.content);
  } catch {
    routeOut = { engine: engineName, topic: userPrompt };
  }

  // Step 2: Generate
  let raw = "";
  try {
    const gResp = await primaryEngine.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1400
    });
    raw = gResp.choices[0].message.content;
  } catch (genErr) {
    throw new Error("Generation failed: " + genErr.message);
  }

  // Step 3: Parse + reflection retry
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    try {
      const retryResp = await primaryEngine.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
          { role: "assistant", content: raw },
          { role: "user", content: `Your output was not valid JSON. Rewrite it as valid JSON matching this schema: ${JSON.stringify(schema)}. Output ONLY the JSON object.` }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1400
      });
      parsed = JSON.parse(retryResp.choices[0].message.content);
    } catch (e2) {
      throw new Error("JSON parse failed after retry: " + e2.message);
    }
  }

  const tokenEst = Math.round((raw.length / 4));
  return {
    output: parsed,
    route: routeOut,
    model: activeModel,
    cost_usd: tokenEst * 0.000002,
    duration_ms: Date.now() - t0
  };
}

// Re-run with revision notes injected
export async function reviseLLM(engineName, systemPrompt, originalPrompt, originalOutput, revisionNotes, schema) {
  runCount++;

  if (mockMode) {
    const canned = cannedResponse(engineName, originalPrompt);
    return {
      ...canned,
      output: {
        ...canned.output,
        _revised: true
      }
    };
  }

  const t0 = Date.now();
  const revisedPrompt = `${originalPrompt}\n\nRevision request: ${revisionNotes}`;

  const gResp = await primaryEngine.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: originalPrompt },
      { role: "assistant", content: JSON.stringify(originalOutput) },
      { role: "user", content: `Please revise the output with these changes: ${revisionNotes}\n\nOutput valid JSON matching schema: ${JSON.stringify(schema)}` }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 1400
  });

  const raw = gResp.choices[0].message.content;
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch { throw new Error("Revision JSON parse failed"); }

  const tokenEst = Math.round((raw.length / 4));
  return {
    output: parsed,
    model: activeModel,
    cost_usd: tokenEst * 0.000002,
    duration_ms: Date.now() - t0
  };
}

// --- Canned response helper ---

function cannedResponse(engineName, userPrompt = "") {
  const pool = CANNED[engineName] || CANNED.authority;
  // Rotate by runCount for variety
  const idx = (runCount - 1) % pool.length;
  const canned = pool[idx];
  const delay = 420 + Math.random() * 280; // simulate ~0.5s latency

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        output: canned.generate,
        route: canned.route,
        model: "mock-llm",
        cost_usd: 0.0012,
        duration_ms: Math.round(delay)
      });
    }, delay);
  });
}
