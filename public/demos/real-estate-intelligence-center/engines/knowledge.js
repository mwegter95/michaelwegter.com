// Knowledge Engine Lite  -  strict prompt chain
// Output: { title, content (markdown), tags[], format }

import { runLLM, reviseLLM } from "../llm-router.js";
import { getWorkspace } from "../db.js";

const OUTPUT_SCHEMA = {
  title:   "string  -  concise document title",
  content: "string  -  structured markdown knowledge base entry",
  tags:    ["string"],
  format:  "markdown"
};

async function buildSystemPrompt(category, workspace) {
  const ctx = workspace
    ? `${workspace.business_context} Location: ${workspace.location}. Niche: ${workspace.niche}.`
    : "Real estate investor in the US.";

  const categoryGuides = {
    process:    "Process document: step-by-step with numbered steps, input requirements, decision gates, and tags",
    playbook:   "Playbook: strategic guide with sections for context, approach, execution steps, and common pitfalls",
    faq:        "FAQ document: question-and-answer format with practical answers drawn from real experience",
    definition: "Definition: clear explanation of the term with context, usage examples, and related concepts"
  };

  return `You are a knowledge base writer for a real estate investment company.

Business context: ${ctx}

Document type: ${categoryGuides[category] || categoryGuides.process}

Rules:
- Use ## and ### headers for structure
- Use **bold** for key terms and step titles
- No em dashes (use commas or periods instead)
- No generic filler. Every sentence should be specific and actionable
- Include 3-6 relevant tags (lowercase, kebab-case)
- Tags should reference: skill (objection-handling, negotiation), deal-type (fix-and-flip, wholesale), and topic (cold-calls, ARV, MAO)
- Output ONLY valid JSON

Output schema: ${JSON.stringify(OUTPUT_SCHEMA)}`;
}

export async function runKnowledgeEngine(userInput, category = "process") {
  const workspace = await getWorkspace();
  const systemPrompt = await buildSystemPrompt(category, workspace);

  const result = await runLLM(
    "knowledge",
    systemPrompt,
    userInput,
    OUTPUT_SCHEMA
  );

  // JS validation
  const output = result.output;
  const valid = (
    typeof output.title === "string" && output.title.trim().length > 3 &&
    typeof output.content === "string" && output.content.trim().length > 50 &&
    Array.isArray(output.tags)
  );

  if (!valid) {
    throw new Error("Knowledge engine output failed schema validation");
  }

  return {
    ...result,
    engine: "knowledge",
    category,
    input: userInput
  };
}

export async function reviseKnowledgeEngine(userInput, category, originalOutput, revisionNotes) {
  const workspace = await getWorkspace();
  const systemPrompt = await buildSystemPrompt(category, workspace);

  const result = await reviseLLM(
    "knowledge",
    systemPrompt,
    userInput,
    originalOutput,
    revisionNotes,
    OUTPUT_SCHEMA
  );

  return {
    ...result,
    engine: "knowledge",
    category,
    input: userInput
  };
}
