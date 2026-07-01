// Shell UI  -  persistent intelligence bar, usage stats, run history bar, workspace modal

import { getWorkspace, saveWorkspace, getUsageStats, getAllRuns } from "../db.js";
import { getActiveModel } from "../llm-router.js";

// --- Persistent Intelligence Bar ---

export async function updateIntelBar() {
  const ws = await getWorkspace();
  const ctx = document.getElementById("intel-bar-context");
  const header = document.getElementById("workspace-name-header");
  if (!ws) return;

  const parts = [ws.location, ws.niche, `Tone: ${ws.tone}`].filter(Boolean);
  if (ctx) ctx.textContent = parts.join(" | ");
  if (header) header.textContent = ws.name;
}

// --- Workspace Modal ---

export function initWorkspaceModal(onSave) {
  const modal = document.getElementById("workspace-modal");
  const openBtns = [
    document.getElementById("edit-workspace-btn"),
    document.getElementById("workspace-rail-btn")
  ];
  const closeBtns = [
    document.getElementById("close-workspace-modal"),
    document.getElementById("cancel-workspace-modal")
  ];
  const saveBtn = document.getElementById("save-workspace-btn");

  openBtns.forEach(btn => btn && btn.addEventListener("click", () => openWorkspaceModal()));
  closeBtns.forEach(btn => btn && btn.addEventListener("click", () => closeWorkspaceModal()));

  modal && modal.addEventListener("click", (e) => {
    if (e.target === modal) closeWorkspaceModal();
  });

  saveBtn && saveBtn.addEventListener("click", async () => {
    const ws = {
      id: "ws_default",
      name: document.getElementById("ws-name").value.trim(),
      business_context: document.getElementById("ws-context").value.trim(),
      niche: document.getElementById("ws-niche").value.trim(),
      location: document.getElementById("ws-location").value.trim(),
      tone: document.getElementById("ws-tone").value.trim()
    };
    await saveWorkspace(ws);
    await updateIntelBar();
    closeWorkspaceModal();
    if (onSave) onSave(ws);
  });
}

async function openWorkspaceModal() {
  const ws = await getWorkspace();
  if (ws) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
    set("ws-name", ws.name);
    set("ws-context", ws.business_context);
    set("ws-niche", ws.niche);
    set("ws-location", ws.location);
    set("ws-tone", ws.tone);
  }
  const modal = document.getElementById("workspace-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeWorkspaceModal() {
  const modal = document.getElementById("workspace-modal");
  if (modal) modal.classList.add("hidden");
}

// --- Usage Stats (bottom bar) ---

export async function updateUsageStats() {
  const stats = await getUsageStats();
  const fmt = (n) => "$" + n.toFixed(4);

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("stat-runs",  `Runs: ${stats.count}`);
  set("stat-total", `Total: ${fmt(stats.total)}`);
  set("stat-auth",  `Auth: ${fmt(stats.authority)}`);
  set("stat-nl",    `NL: ${fmt(stats.newsletter)}`);
  set("stat-kb",    `KB: ${fmt(stats.knowledge)}`);
  set("stat-model", `Model: ${getActiveModel()}`);
}

// --- Run History Log (bottom bar) ---

let _runLogCache = [];

export function appendRunLog(entry) {
  // entry: { runNum, engine, model, cost_usd, status, duration_ms }
  _runLogCache.unshift(entry);
  if (_runLogCache.length > 20) _runLogCache.pop();
  renderRunLog();
}

function renderRunLog() {
  const container = document.getElementById("run-log-entries");
  if (!container) return;

  if (_runLogCache.length === 0) {
    container.innerHTML = '<span class="log-empty">No runs yet</span>';
    return;
  }

  container.innerHTML = _runLogCache.map((e, i) => {
    const statusCls = e.status === "approved" ? "log-status-ok"
      : e.status === "pushed" ? "log-status-ok"
      : e.status === "error" ? "log-status-err"
      : "log-status-warn";

    return `<span class="log-entry">Run #${String(e.runNum).padStart(3,"0")} | ${e.engine} | ${e.model} | $${(e.cost_usd||0).toFixed(4)} | <span class="${statusCls}">${e.status}</span> | ${(e.duration_ms/1000).toFixed(1)}s</span>`;
  }).join("");
}

// --- Model Status Indicator ---

export function setModelIndicator(text, type) {
  const el = document.getElementById("model-indicator");
  if (!el) return;
  const icons = { ready: "🟢", mock: "🟡", loading: "🔵", error: "🔴" };
  el.textContent = `${icons[type] || "⚪"} ${text}`;
}
