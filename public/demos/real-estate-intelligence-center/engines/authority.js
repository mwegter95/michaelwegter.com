// Authority Engine  -  3-step strict prompt chain
// Step 1: Route (classifier) → Step 2: Generate → Step 3: JS validate
// Output schema: { content, word_count, hashtags, cta }

import { runLLM, reviseLLM, getActiveModel } from "../llm-router.js";
import { getWorkspace } from "../db.js";

const OUTPUT_SCHEMA = {
  content:    "string  -  the post body text",
  word_count: "number",
  hashtags:   ["string"],
  cta:        "string  -  call to action"
};

async function buildSystemPrompt(platform, workspace) {
  const ctx = workspace
    ? `${workspace.business_context} Location: ${workspace.location}. Tone: ${workspace.tone}.`
    : "Real estate investor in the US. Authoritative, direct tone.";

  const platformGuides = {
    linkedin: "LinkedIn (professional network). Target: 80-150 words. No fluffy intros. Lead with a specific insight, data point, or contrarian take. Use short paragraphs and line breaks for readability.",
    twitter:  "X / Twitter. Target: 40-70 words. One punchy idea. Hook in first line. Data or specific numbers where possible.",
    general:  "General social content. Target: 100-200 words. Professional but accessible tone."
  };

  return `You are a ghostwriter for a real estate investor building founder authority on ${platformGuides[platform] || platformGuides.general}

Business context: ${ctx}

Rules:
- No em dashes (use commas or periods instead)
- No filler phrases like "In today's market" or "As a seasoned investor"
- Reference real specifics: Austin market, cold calls, ARV, deal numbers
- Write in first person, direct voice
- Output ONLY valid JSON

Output schema: ${JSON.stringify(OUTPUT_SCHEMA)}`;
}

export async function runAuthorityEngine(userInput, platform = "linkedin") {
  const workspace = await getWorkspace();
  const systemPrompt = await buildSystemPrompt(platform, workspace);

  const result = await runLLM(
    "authority",
    systemPrompt,
    userInput,
    OUTPUT_SCHEMA
  );

  // Step 3: JS validation
  const output = result.output;
  const valid = (
    typeof output.content === "string" && output.content.trim().length > 20 &&
    Array.isArray(output.hashtags) &&
    typeof output.word_count === "number"
  );

  if (!valid) {
    throw new Error("Authority engine output failed schema validation");
  }

  return {
    ...result,
    engine: "authority",
    platform,
    input: userInput
  };
}

export async function reviseAuthorityEngine(userInput, platform, originalOutput, revisionNotes) {
  const workspace = await getWorkspace();
  const systemPrompt = await buildSystemPrompt(platform, workspace);

  const result = await reviseLLM(
    "authority",
    systemPrompt,
    userInput,
    originalOutput,
    revisionNotes,
    OUTPUT_SCHEMA
  );

  return {
    ...result,
    engine: "authority",
    platform,
    input: userInput
  };
}
