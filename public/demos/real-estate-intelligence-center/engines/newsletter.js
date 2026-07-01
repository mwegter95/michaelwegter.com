// Newsletter Engine  -  strict prompt chain
// Output: { body, subject_lines[3], preview_text, word_count }

import { runLLM, reviseLLM } from "../llm-router.js";
import { getWorkspace } from "../db.js";

const OUTPUT_SCHEMA = {
  body:          "string  -  full newsletter body in markdown",
  subject_lines: ["string", "string", "string"],
  preview_text:  "string  -  short preview / preheader text",
  word_count:    "number"
};

async function buildSystemPrompt(workspace) {
  const ctx = workspace
    ? `${workspace.business_context} Location: ${workspace.location}. Tone: ${workspace.tone}.`
    : "Real estate investor in the US. Authoritative, direct tone.";

  return `You are a newsletter ghostwriter for a real estate investor audience.

Business context: ${ctx}

Rules:
- Target length: 200-400 words in the body
- Use markdown headers (##, ###) and bold (**) for structure
- No em dashes (use commas or periods instead)
- No filler or generic advice. Reference specific tactics, numbers, and Austin market context
- Provide exactly 3 distinct subject line options (each under 60 characters)
- Preview text: 90-120 characters, teases the insight, no "In this week's..."
- Write in first person
- Output ONLY valid JSON

Output schema: ${JSON.stringify(OUTPUT_SCHEMA)}`;
}

export async function runNewsletterEngine(userInput) {
  const workspace = await getWorkspace();
  const systemPrompt = await buildSystemPrompt(workspace);

  const result = await runLLM(
    "newsletter",
    systemPrompt,
    userInput,
    OUTPUT_SCHEMA
  );

  // JS validation
  const output = result.output;
  const valid = (
    typeof output.body === "string" && output.body.trim().length > 50 &&
    Array.isArray(output.subject_lines) && output.subject_lines.length >= 2 &&
    typeof output.preview_text === "string"
  );

  if (!valid) {
    throw new Error("Newsletter engine output failed schema validation");
  }

  return {
    ...result,
    engine: "newsletter",
    input: userInput
  };
}

export async function reviseNewsletterEngine(userInput, originalOutput, revisionNotes) {
  const workspace = await getWorkspace();
  const systemPrompt = await buildSystemPrompt(workspace);

  const result = await reviseLLM(
    "newsletter",
    systemPrompt,
    userInput,
    originalOutput,
    revisionNotes,
    OUTPUT_SCHEMA
  );

  return {
    ...result,
    engine: "newsletter",
    input: userInput
  };
}
