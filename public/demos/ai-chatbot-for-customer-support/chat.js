// Main chat orchestrator: RAG -> LLM -> stream -> cite
import { retrieve, buildSystemPrompt, loadCorpus } from "./rag.js";
import { initModel, generate, getTier, isReady } from "./model-loader.js";
import { lookupOrder, extractOrderQuery } from "./order-api.js";
import { buildEscalationCard, attachEscalationFormHandler, buildTicketConfirmCard, getETStatus } from "./escalation.js";
import { logEvent } from "./analytics.js";

const SESSION_ID = "sess_" + Date.now();
let modelReady = false;
let currentPanel = null; // reference to widget panel DOM

// Suggested starter questions
const SUGGESTIONS = [
  "Where is my order?",
  "How do I return an item?",
  "What are your shipping rates?",
  "How do I talk to a human?",
  "What payment methods do you accept?"
];

// Escalation triggers
const ESCALATION_PATTERNS = /\b(human|agent|representative|person|speak to someone|escalate|complaint|manager|supervisor|help desk|zendesk|ticket)\b/i;

export async function initChat(panelEl) {
  currentPanel = panelEl;
  logEvent("session_start", { sessionId: SESSION_ID });

  await loadCorpus();

  const feed = panelEl.querySelector(".chat-feed");
  const input = panelEl.querySelector(".chat-input");
  const sendBtn = panelEl.querySelector(".chat-send");
  const progressBar = panelEl.querySelector(".model-progress-bar");
  const progressText = panelEl.querySelector(".model-progress-text");
  const tierBadge = panelEl.querySelector(".tier-badge");
  const loadingBanner = panelEl.querySelector(".loading-banner");
  const suggestionsEl = panelEl.querySelector(".chat-suggestions");

  // Render suggestions
  if (suggestionsEl) {
    suggestionsEl.innerHTML = SUGGESTIONS.map(s =>
      `<button class="suggestion-chip">${s}</button>`
    ).join("");
    suggestionsEl.querySelectorAll(".suggestion-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        if (!modelReady) return;
        input.value = btn.textContent;
        handleSend();
        suggestionsEl.style.display = "none";
      });
    });
  }

  // Model load progress
  await initModel((pct, text, tierHint) => {
    if (progressBar) {
      progressBar.style.width = (pct * 100).toFixed(0) + "%";
    }
    if (progressText) progressText.textContent = text;
    if (tierBadge && tierHint) {
      tierBadge.textContent = tierHint === "webgpu" ? "WebGPU Accelerated" :
                              tierHint === "wasm" ? "Running on WASM" : "Template Mode";
      tierBadge.className = "tier-badge tier-" + tierHint;
    }
    if (pct >= 1 && !modelReady) {
      // Guard: the progress callback fires pct>=1 more than once (WebLLM reports
      // 1.0 repeatedly, plus the final explicit call). Greet + enable exactly once.
      modelReady = true;
      input.disabled = false;
      sendBtn.disabled = false;
      if (loadingBanner) loadingBanner.style.display = "none";
      appendBotMessage(feed, "Hi! I'm SupportAI, your customer support assistant. I can help with orders, shipping, returns, and more. What can I help you with today?");
    }
  });

  // Send handlers
  sendBtn.addEventListener("click", handleSend);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Human escalation button
  const humanBtn = panelEl.querySelector(".human-btn");
  if (humanBtn) {
    humanBtn.addEventListener("click", () => {
      if (!modelReady) return;
      triggerEscalation(feed);
    });
  }

  async function handleSend() {
    const text = input.value.trim();
    if (!text || !modelReady) return;
    input.value = "";
    input.style.height = "auto";
    if (suggestionsEl) suggestionsEl.style.display = "none";

    appendUserMessage(feed, text);
    logEvent("message_sent", { sessionId: SESSION_ID, text: text.slice(0, 80) });

    // Escalation intent
    if (ESCALATION_PATTERNS.test(text)) {
      triggerEscalation(feed);
      return;
    }

    showTyping(feed);

    try {
      // Order lookup
      let orderContext = null;
      const orderQuery = extractOrderQuery(text);
      if (orderQuery) {
        const orderResult = await lookupOrder(orderQuery);
        if (orderResult) {
          orderContext = orderResult;
          logEvent("order_lookup", { sessionId: SESSION_ID, query: orderQuery });
        }
      }

      // RAG retrieval
      const topChunks = await retrieve(text, 3);
      const systemPrompt = buildSystemPrompt(topChunks, orderContext);
      const currentTier = getTier();

      let reply = "";

      if (currentTier === "template") {
        // Tier 3: return top-1 FAQ answer verbatim or escalate
        if (topChunks.length > 0 && topChunks[0].score > 0.05) {
          reply = topChunks[0].entry.a;
        } else {
          reply = "I'm not sure I have an answer for that. Would you like me to connect you with a human agent?";
        }
      } else {
        reply = await generate(systemPrompt, text);
        // If LLM returns empty/garbage, fall back to top-1
        if (!reply || reply.trim().length < 5) {
          if (topChunks.length > 0 && topChunks[0].score > 0.05) {
            reply = topChunks[0].entry.a;
          } else {
            reply = "I'm not sure about that. Would you like to speak with a human agent?";
          }
        }
      }

      hideTyping(feed);

      // If LLM says it doesn't know + low confidence, offer escalation
      const lowConfidence = topChunks.length === 0 || topChunks[0].score < 0.08;
      const llmUnsure = /not sure|don't know|cannot help|can't help|connect you|human agent/i.test(reply);
      if (lowConfidence || llmUnsure) {
        appendBotMessage(feed, reply);
        appendEscalationSuggestion(feed);
      } else {
        appendBotMessage(feed, reply, topChunks[0]);
      }

      logEvent("bot_responded", { sessionId: SESSION_ID, tier: currentTier, confidence: topChunks[0]?.score?.toFixed(2) });
    } catch (err) {
      hideTyping(feed);
      console.error("Chat error:", err);
      appendBotMessage(feed, "Sorry, I ran into an issue. Would you like me to connect you with a support agent?");
      appendEscalationSuggestion(feed);
    }
  }
}

function appendUserMessage(feed, text) {
  const div = document.createElement("div");
  div.className = "message user";
  div.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
  feed.appendChild(div);
  scrollFeed(feed);
}

function appendBotMessage(feed, text, sourceChunk = null) {
  const div = document.createElement("div");
  div.className = "message bot";
  const rendered = renderMarkdown(text);
  let inner = `<div class="avatar-wrap"><div class="bot-avatar">S</div></div><div class="bubble">${rendered}`;
  if (sourceChunk && sourceChunk.score > 0.3) {
    inner += `<div class="source-cite">Source: ${sourceChunk.entry.category}</div>`;
  }
  inner += `</div>`;
  div.innerHTML = inner;
  feed.appendChild(div);
  scrollFeed(feed);
}

function appendEscalationSuggestion(feed) {
  const div = document.createElement("div");
  div.className = "message bot";
  div.innerHTML = `<div class="avatar-wrap"><div class="bot-avatar">S</div></div><div class="bubble esc-suggestion">
    <p style="margin:0 0 8px">Want to talk to a human agent?</p>
    <button class="esc-inline-btn" onclick="this.closest('.chat-feed') && window.__triggerEscalation && window.__triggerEscalation()">Connect me with support</button>
  </div>`;
  feed.appendChild(div);
  scrollFeed(feed);
}

export function triggerEscalation(feed) {
  // Remove any existing escalation card
  document.getElementById("esc-card")?.closest(".message")?.remove();

  logEvent("escalation_triggered", { sessionId: SESSION_ID });

  const div = document.createElement("div");
  div.className = "message bot";
  div.innerHTML = `<div class="avatar-wrap"><div class="bot-avatar">S</div></div><div class="bubble" style="padding:0;overflow:hidden">${buildEscalationCard(SESSION_ID)}</div>`;
  feed.appendChild(div);
  scrollFeed(feed);

  attachEscalationFormHandler(SESSION_ID, (ticketId, data) => {
    // Replace escalation card with ticket confirmation
    const escBubble = document.getElementById("esc-card")?.closest(".bubble");
    if (escBubble) {
      escBubble.innerHTML = buildTicketConfirmCard(ticketId, data.name);
    }
    scrollFeed(feed);
  });
}

function showTyping(feed) {
  const el = document.createElement("div");
  el.className = "message bot";
  el.id = "typing-indicator";
  el.innerHTML = `<div class="avatar-wrap"><div class="bot-avatar">S</div></div>
    <div class="bubble typing-bubble">
      <div class="typing-indicator"><span></span><span></span><span></span></div>
    </div>`;
  feed.appendChild(el);
  scrollFeed(feed);
}

function hideTyping(feed) {
  document.getElementById("typing-indicator")?.remove();
}

function scrollFeed(feed) {
  feed.scrollTop = feed.scrollHeight;
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderMarkdown(text) {
  // Bold: **text** -> <strong>text</strong>
  // Code: `text` -> <code>text</code>
  // Newlines -> <br>
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

// Expose for inline button handler
window.__triggerEscalation = () => {
  const feed = document.querySelector(".chat-feed");
  if (feed) triggerEscalation(feed);
};
