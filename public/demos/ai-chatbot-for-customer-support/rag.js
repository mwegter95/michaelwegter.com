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

// Keyword fallback (pre-embed warm-up or Tier 3)
function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
}
function retrieveKeyword(queryText, topK = 3) {
  const qTokens = new Set(tokenize(queryText));
  return corpus
    .map(entry => {
      const eTokens = tokenize(entry.q + " " + entry.a);
      const matches = eTokens.filter(t => qTokens.has(t)).length;
      const score = matches / Math.max(eTokens.length, 1);
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
  const context = topChunks.map(c => `Q: ${c.entry.q}\nA: ${c.entry.a}`).join("\n\n");
  let prompt = `You are SupportAI, a helpful US customer support assistant for an online retail store.
Answer ONLY using the context below. If the answer is not in the context, say you're not sure and offer to connect the user with a human agent.
Be friendly, concise, and professional. Keep responses under 3 sentences unless the customer needs step-by-step instructions.
US retail customer service tone.

KNOWLEDGE BASE:
${context}`;

  if (orderContext) {
    prompt += `\n\nORDER INFO:\n${orderContext}`;
  }
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
