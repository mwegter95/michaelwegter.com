// 3-tier LLM chain: WebGPU (WebLLM) -> WASM (Transformers.js) -> template-RAG
// Tier 1: WebLLM (WebGPU only) — progressive enhancement
// Tier 2: Transformers.js WASM — primary tested path
// Tier 3: template-RAG fallback (return top-1 FAQ answer verbatim)

import { setEmbedFn, preEmbedCorpus } from "./rag.js";

let tier = "loading";
let chatPipe = null;
let embedPipe = null;
let webllmEngine = null;

export function getTier() { return tier; }

async function detectTier() {
  if (navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) return "webgpu";
    } catch {}
  }
  return "wasm";
}

export async function initModel(onProgress) {
  const detected = await detectTier();

  if (detected === "webgpu") {
    try {
      onProgress(0.02, "Loading WebLLM (WebGPU accelerated)...", "webgpu");
      const { CreateMLCEngine } = await import("https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.84/+esm");
      webllmEngine = await CreateMLCEngine("Llama-3.2-1B-Instruct-q4f16_1-MLC", {
        initProgressCallback: (p) => onProgress(p.progress, p.text, "webgpu")
      });
      tier = "webgpu";

      // Also load embedding pipeline for RAG (WASM is fine for embeddings)
      const { pipeline } = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0/+esm");
      embedPipe = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", { dtype: "fp32", device: "wasm" });
      setEmbedFn(async (text) => {
        const out = await embedPipe(text, { pooling: "mean", normalize: true });
        return Array.from(out.data);
      });
      await preEmbedCorpus();
      onProgress(1, "WebGPU model ready", "webgpu");
      return;
    } catch (err) {
      console.warn("WebGPU init failed, falling back to WASM:", err);
    }
  }

  // WASM path
  try {
    onProgress(0.02, "Loading AI model (WASM)... first load ~30-60s, cached after", "wasm");
    const { pipeline } = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0/+esm");

    chatPipe = await pipeline(
      "text-generation",
      "onnx-community/Qwen2.5-0.5B-Instruct",
      {
        dtype: "q4",
        device: "wasm",
        progress_callback: (info) => {
          if (info.status === "progress" && info.total) {
            const pct = info.loaded / info.total;
            onProgress(pct * 0.7, `Downloading model: ${info.file || ""}`, "wasm");
          } else if (info.status === "ready") {
            onProgress(0.75, "Model loaded, initializing embeddings...", "wasm");
          }
        }
      }
    );

    onProgress(0.78, "Loading embedding model...", "wasm");
    embedPipe = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      dtype: "fp32",
      device: "wasm"
    });

    setEmbedFn(async (text) => {
      const out = await embedPipe(text, { pooling: "mean", normalize: true });
      return Array.from(out.data);
    });

    onProgress(0.9, "Pre-computing knowledge base embeddings...", "wasm");
    await preEmbedCorpus();

    tier = "wasm";
    onProgress(1, "WASM model ready", "wasm");
  } catch (err) {
    console.warn("WASM init failed, falling back to template-RAG:", err);
    tier = "template";
    onProgress(1, "Template mode active", "template");
  }
}

export async function generate(systemPrompt, userMsg) {
  if (tier === "webgpu" && webllmEngine) {
    const reply = await webllmEngine.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMsg }
      ],
      stream: false,
      max_tokens: 256
    });
    return reply.choices[0].message.content;
  }

  if (tier === "wasm" && chatPipe) {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMsg }
    ];
    const out = await chatPipe(messages, { max_new_tokens: 256, do_sample: false });
    // Handle both output formats
    const generated = out[0].generated_text;
    if (Array.isArray(generated)) {
      return generated.at(-1)?.content ?? generated[generated.length - 1]?.content ?? "";
    }
    // String output: strip the prompt
    return typeof generated === "string"
      ? generated.slice(generated.lastIndexOf("[/INST]") > -1 ? generated.lastIndexOf("[/INST]") + 7 : 0).trim()
      : "";
  }

  // Tier 3 / template-RAG: return empty string; chat.js will use top-1 FAQ answer
  return "";
}

export function isReady() {
  return tier === "webgpu" || tier === "wasm" || tier === "template";
}
