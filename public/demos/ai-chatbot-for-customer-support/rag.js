// RAG retrieval: cosine similarity over knowledge-base.json
// Supports both embedding-based (WASM) and keyword-fallback retrieval

let corpus = [];
let corpusVecs = []; // Float32 arrays, parallel to corpus
let embedFn = null; // set by model-loader once embedPipe is ready

export async function loadCorpus() {
  corpus = await fetch("./knowledge-base.json").then(r => r.json());
}

// Called by model-loader once embedPipe is ready
export function setEmbedFn(fn) {
  embedFn = fn;
}

// Pre-embed the entire corpus (called once after model loads)
export async function preEmbedCorpus(onProgress) {
  if (!embedFn) return;
  corpusVecs = [];
  for (let i = 0; i < corpus.length; i++) {
    const vec = await embedFn(corpus[i].q + " " + corpus[i].a);
    corpusVecs.push(vec);
    if (onProgress) onProgress(i + 1, corpus.length);
  }
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

// Embedding-based retrieval
async function retrieveEmbedding(queryText, topK = 3) {
  const qVec = await embedFn(queryText);
  return corpusVecs
    .map((vec, i) => ({ entry: corpus[i], score: cosine(qVec, vec) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// Keyword fallback (used before embeddings warm up, or in Tier 3 template mode).
// Drop stopwords so matching keys on meaningful terms, and score by how much of
// the customer's intent the entry covers (fraction of query terms matched) — a
// far better relevance signal than dividing by the entry's length.
const STOPWORDS = new Set(
  "a an the is are was were be been being to of for and or but in on at it its this that these those i me my we our you your he she they them do does did can could would should will what when where why which who how with from as by about if then so just please".split(" ")
);
function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t && !STOPWORDS.has(t));
}
function retrieveKeyword(queryText, topK = 3) {
  const qTokens = [...new Set(tokenize(queryText))];
  if (!qTokens.length) return corpus.slice(0, topK).map((entry) => ({ entry, score: 0 }));
  return corpus
    .map(entry => {
      const eTokens = new Set(tokenize(entry.q + " " + entry.a));
      const hits = qTokens.filter(t => eTokens.has(t)).length;
      const score = hits / qTokens.length; // fraction of the query's meaningful words covered (0..1)
      return { entry, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export async function retrieve(queryText, topK = 3) {
  if (embedFn && corpusVecs.length === corpus.length && corpus.length > 0) {
    return retrieveEmbedding(queryText, topK);
  }
  return retrieveKeyword(queryText, topK);
}

export function buildSystemPrompt(topChunks, orderContext = null) {
  const kb = topChunks
    .map((c, i) => `[${i + 1}] Q: ${c.entry.q}\n    A: ${c.entry.a}`)
    .join("\n");

  let prompt = `You are SupportAI, the customer-support assistant for a US-based online retail store. You handle questions about orders, shipping, returns, payments, and accounts.

HOW TO ANSWER
- Ground every answer in the KNOWLEDGE BASE and ORDER INFO below — treat them as the only source of truth for policies, prices, timeframes, and steps. Never invent or guess a policy, price, date, or order detail.
- First work out what the customer actually needs, then answer that directly. Lead with the answer; add only the detail that helps.
- Be specific: quote the exact figures and timeframes from the context (e.g. "within 30 days", "$5.99 standard shipping"), not vague paraphrases.
- If the needed answer is not in the context, say so in one honest sentence and offer to connect them with a human agent — do not fill space with generic advice.
- Use a short numbered list only for multi-step tasks (e.g. starting a return). Otherwise keep it to 1–3 sentences.
- Tone: warm, clear, professional US retail support. If the customer is frustrated, briefly acknowledge it first. No emojis, no headings, and don't repeat the customer's question back to them.

KNOWLEDGE BASE (most relevant first; use the entries that fit the question and ignore the rest):
${kb || "(no relevant articles were found for this question)"}`;

  if (orderContext) {
    prompt += `\n\nORDER INFO (verified account data — use these exact details when answering about this order):\n${orderContext}`;
  }

  prompt += `\n\nIf the request is outside support (approving refunds, changing account data you can't verify, or anything not covered above), briefly explain you can't do that here and offer a human agent.`;

  return prompt;
}

export function getCorpus() {
  return corpus;
}

export function updateCorpusEntry(index, updated) {
  if (index >= 0 && index < corpus.length) {
    corpus[index] = { ...corpus[index], ...updated };
    corpusVecs[index] = null; // invalidate embedding
  }
}

export function addCorpusEntry(entry) {
  corpus.push(entry);
  corpusVecs.push(null);
}

export function deleteCorpusEntry(index) {
  corpus.splice(index, 1);
  corpusVecs.splice(index, 1);
}
