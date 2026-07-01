// Pending Review queue  -  right panel, top section
// Shows all outputs with status needs-review or revised
// Click → loads that output into the center workspace for action

import { getPendingOutputs, getAllOutputs } from "../db.js";

let _onSelectOutput = null;

export function initOutputQueue(onSelectOutput) {
  _onSelectOutput = onSelectOutput;
}

export async function renderOutputQueue() {
  const container = document.getElementById("output-queue");
  const badge = document.getElementById("queue-count");
  if (!container) return;

  const pending = await getPendingOutputs();

  badge.textContent = pending.length;
  if (pending.length > 0) {
    badge.style.background = "rgba(245,158,11,0.2)";
    badge.style.color = "var(--status-warn)";
    badge.style.borderColor = "rgba(245,158,11,0.35)";
  } else {
    badge.style.background = "";
    badge.style.color = "";
    badge.style.borderColor = "";
  }

  if (pending.length === 0) {
    container.innerHTML = '<p class="empty-state">No outputs pending review</p>';
    return;
  }

  container.innerHTML = "";

  // Show newest first
  const sorted = [...pending].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  sorted.forEach(output => {
    const card = document.createElement("div");
    card.className = "queue-card";
    card.dataset.outputId = output.id;

    const engineLabel = { authority: "Authority", newsletter: "Newsletter", knowledge: "Knowledge" }[output.engine] || output.engine;
    const title = getOutputTitle(output);
    const timeStr = formatRelTime(output.created_at);
    const statusClass = `status-${output.status}`;

    card.innerHTML = `
      <div class="queue-card-top">
        <span class="queue-engine">${engineLabel}</span>
        <span class="status-chip ${statusClass}">${formatStatus(output.status)}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-top:3px">
        <span class="queue-title">${title}</span>
      </div>
      <div style="margin-top:4px">
        <span class="queue-time">${timeStr}</span>
      </div>
    `;

    card.addEventListener("click", () => {
      if (_onSelectOutput) _onSelectOutput(output.id);
    });

    container.appendChild(card);
  });
}

function getOutputTitle(output) {
  const c = output.content || {};
  if (c.title) return escHtml(c.title);
  if (c.subject_lines && c.subject_lines[0]) return escHtml(c.subject_lines[0]);
  if (c.content) return escHtml((c.content || "").slice(0, 45)) + "...";
  return `${output.engine} output`;
}

function formatStatus(s) {
  return { "needs-review": "Needs Review", "revised": "Revised" }[s] || s;
}

function formatRelTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

function escHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
