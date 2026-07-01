// app.js  -  main controller
// Orchestrates: init, engine dispatch, status state machine, event bus, UI routing

import { initDB, saveRun, saveOutput, getOutput, updateOutputStatus, logEvent, uuid } from "./db.js";
import { initLLMRouter, isMockMode, getActiveModel } from "./llm-router.js";
import { pushOutput } from "./mock-integrations.js";

import { runAuthorityEngine, reviseAuthorityEngine } from "./engines/authority.js";
import { runNewsletterEngine, reviseNewsletterEngine } from "./engines/newsletter.js";
import { runKnowledgeEngine, reviseKnowledgeEngine } from "./engines/knowledge.js";

import { initOutputQueue, renderOutputQueue } from "./ui/output-queue.js";
import { renderIntelBrief } from "./ui/intel-brief.js";
import { updateIntelBar, initWorkspaceModal, updateUsageStats, appendRunLog, setModelIndicator } from "./ui/shell.js";

// --- State ---
let activeEngine  = "authority";
let activeOutputId = null;  // output currently shown in center workspace
let runCounter    = 0;
let revisionTargetId = null; // output being revised

// --- Init ---

async function init() {
  await initDB();

  // Render static panels
  renderIntelBrief(document.getElementById("intel-brief"));
  await updateIntelBar();
  await updateUsageStats();

  // Output queue  -  clicking a queue card loads it into workspace
  initOutputQueue(async (outputId) => {
    await loadOutputIntoWorkspace(outputId);
  });
  await renderOutputQueue();

  // Engine tabs + rail nav
  initNavigation();

  // Prompt chips
  initPromptChips();

  // Run buttons
  document.getElementById("authority-run-btn").addEventListener("click", () => triggerRun("authority"));
  document.getElementById("newsletter-run-btn").addEventListener("click", () => triggerRun("newsletter"));
  document.getElementById("knowledge-run-btn").addEventListener("click", () => triggerRun("knowledge"));

  // Revision modal
  initRevisionModal();

  // Workspace modal
  initWorkspaceModal(async (ws) => {
    await updateIntelBar();
  });

  // History rail button  -  scroll run log into view
  document.getElementById("history-rail-btn").addEventListener("click", () => {
    document.querySelector(".bottom-bar").scrollIntoView({ behavior: "smooth" });
  });

  // Init LLM router (shows overlay)
  await initLLMRouter((progress, text, type) => {
    updateModelOverlay(progress, text, type);
  });

  // Dismiss overlay when ready
  hideModelOverlay();
  setModelIndicator(
    isMockMode() ? "Mock mode  -  WebGPU not available" : `${getActiveModel()} ready`,
    isMockMode() ? "mock" : "ready"
  );
  await updateUsageStats();
}

// --- Model Overlay ---

function updateModelOverlay(progress, text, type) {
  const pct = Math.round(progress * 100);
  const fill = document.getElementById("model-progress");
  const statusText = document.getElementById("model-status-text");
  const hintText = document.getElementById("model-hint-text");

  if (fill) fill.style.width = pct + "%";
  if (statusText) statusText.textContent = text;

  if (type === "mock") {
    if (hintText) hintText.textContent = "Running with pre-built AI responses  -  full workflow available";
  }
}

function hideModelOverlay() {
  const overlay = document.getElementById("model-overlay");
  if (overlay) {
    overlay.style.transition = "opacity 0.4s ease";
    overlay.style.opacity = "0";
    setTimeout(() => overlay.classList.add("hidden"), 400);
  }
}

// --- Navigation ---

function initNavigation() {
  // Rail buttons
  document.querySelectorAll(".rail-btn[data-engine]").forEach(btn => {
    btn.addEventListener("click", () => switchEngine(btn.dataset.engine));
  });

  // Engine tabs
  document.querySelectorAll(".engine-tab[data-engine]").forEach(btn => {
    btn.addEventListener("click", () => switchEngine(btn.dataset.engine));
  });
}

function switchEngine(engine) {
  activeEngine = engine;

  // Rail
  document.querySelectorAll(".rail-btn[data-engine]").forEach(b => b.classList.toggle("active", b.dataset.engine === engine));

  // Tabs
  document.querySelectorAll(".engine-tab[data-engine]").forEach(b => b.classList.toggle("active", b.dataset.engine === engine));

  // Forms
  document.querySelectorAll(".engine-form").forEach(f => f.classList.remove("active"));
  const form = document.getElementById(`${engine}-form`);
  if (form) form.classList.add("active");

  // Clear output area when switching engines
  clearOutputArea();
  activeOutputId = null;
}

// --- Prompt Chips ---

function initPromptChips() {
  document.querySelectorAll(".chip[data-engine]").forEach(chip => {
    chip.addEventListener("click", () => {
      const engine = chip.dataset.engine;
      const fill   = chip.dataset.fill;

      switchEngine(engine);

      // Pre-fill the input
      const inputIds = { authority: "authority-input", newsletter: "newsletter-input", knowledge: "knowledge-input" };
      const inputEl = document.getElementById(inputIds[engine]);
      if (inputEl) {
        inputEl.value = fill;
        inputEl.focus();
      }
    });
  });
}

// --- Engine Run ---

async function triggerRun(engine) {
  let input, platform, category;

  if (engine === "authority") {
    input    = document.getElementById("authority-input").value.trim();
    platform = document.getElementById("authority-platform").value;
  } else if (engine === "newsletter") {
    input = document.getElementById("newsletter-input").value.trim();
  } else if (engine === "knowledge") {
    input    = document.getElementById("knowledge-input").value.trim();
    category = document.getElementById("knowledge-category").value;
  }

  if (!input) {
    highlightEmpty(engine);
    return;
  }

  runCounter++;
  const runId    = uuid();
  const outputId = uuid();

  disableRunBtn(engine, true);
  showRunningState(engine, input, platform);

  await logEvent(runId, "run_start", { engine, input });

  try {
    let result;
    if (engine === "authority") {
      result = await runAuthorityEngine(input, platform);
    } else if (engine === "newsletter") {
      result = await runNewsletterEngine(input);
    } else if (engine === "knowledge") {
      result = await runKnowledgeEngine(input, category);
    }

    // Persist run + output
    const run = {
      id: runId,
      engine,
      input,
      model: result.model,
      output_id: outputId,
      cost_usd: result.cost_usd,
      duration_ms: result.duration_ms,
      timestamp: new Date().toISOString(),
      workspace_id: "ws_default"
    };

    const output = {
      id: outputId,
      run_id: runId,
      engine,
      content: result.output,
      status: "needs-review",
      revision_notes: null,
      destination: null,
      platform: platform || null,
      category: category || null,
      input,
      created_at: new Date().toISOString(),
      approved_at: null,
      pushed_at: null
    };

    await saveRun(run);
    await saveOutput(output);
    await logEvent(runId, "run_complete", { outputId, cost: result.cost_usd });

    // Update UI
    activeOutputId = outputId;
    renderOutputCard(output, result);

    appendRunLog({
      runNum: runCounter,
      engine,
      model: result.model,
      cost_usd: result.cost_usd,
      status: "needs-review",
      duration_ms: result.duration_ms
    });

    await renderOutputQueue();
    await updateUsageStats();

  } catch (err) {
    console.error("Engine run failed:", err);
    await logEvent(runId, "error", { message: err.message });
    showErrorCard(engine, err.message);
  }

  disableRunBtn(engine, false);
}

function highlightEmpty(engine) {
  const ids = { authority: "authority-input", newsletter: "newsletter-input", knowledge: "knowledge-input" };
  const el = document.getElementById(ids[engine]);
  if (!el) return;
  el.style.borderColor = "var(--status-err)";
  el.focus();
  setTimeout(() => { el.style.borderColor = ""; }, 2000);
}

function disableRunBtn(engine, disabled) {
  const btn = document.getElementById(`${engine}-run-btn`);
  if (btn) btn.disabled = disabled;
}

function clearOutputArea() {
  const area = document.getElementById("output-area");
  if (area) area.innerHTML = "";
}

function showRunningState(engine, input, platform) {
  const area = document.getElementById("output-area");
  if (!area) return;

  const label = { authority: "Authority Engine", newsletter: "Newsletter Engine", knowledge: "Knowledge Engine" }[engine] || engine;
  area.innerHTML = `
    <div class="output-card">
      <div class="output-card-header">
        <span class="output-card-title">${label}</span>
        <span class="status-chip status-running">Running</span>
      </div>
      <div class="output-card-body">
        <div class="running-indicator">
          <div class="spinner"></div>
          <span>Generating output...</span>
        </div>
      </div>
    </div>
  `;
}

function showErrorCard(engine, message) {
  const area = document.getElementById("output-area");
  if (!area) return;
  area.innerHTML = `
    <div class="output-card">
      <div class="output-card-header">
        <span class="output-card-title">Generation failed</span>
        <span class="status-chip status-error">Error</span>
      </div>
      <div class="output-card-body">
        <div class="error-card">
          <p>${escHtml(message)}</p>
        </div>
      </div>
      <div class="output-actions">
        <button class="run-btn" onclick="location.reload()" style="font-size:12px;padding:6px 14px">Re-run</button>
      </div>
    </div>
  `;
}

// --- Output Card Rendering ---

function renderOutputCard(output, result) {
  const area = document.getElementById("output-area");
  if (!area) return;
  area.innerHTML = buildOutputCardHTML(output);
  wireOutputCardActions(output.id, output);
}

function buildOutputCardHTML(output) {
  const c = output.content;
  const engine = output.engine;
  const statusChipCls = `status-${output.status}`;
  const statusLabel = formatStatusLabel(output.status);

  let bodyHTML = "";

  if (engine === "authority") {
    const hashtags = (c.hashtags || []).map(h => `<span class="hashtag">${escHtml(h)}</span>`).join(" ");
    bodyHTML = `
      <div class="authority-content">${escHtml(c.content || "")}</div>
      <div class="authority-hashtags">${hashtags}</div>
      ${c.cta ? `<div class="authority-cta">${escHtml(c.cta)}</div>` : ""}
    `;
  } else if (engine === "newsletter") {
    const subjectOpts = (c.subject_lines || []).map((s, i) => `
      <label class="subject-line-opt${i === 0 ? " selected" : ""}" data-idx="${i}">
        <input type="radio" name="subject_${output.id}" value="${i}" ${i === 0 ? "checked" : ""}>
        <span class="subject-line-text">${escHtml(s)}</span>
      </label>
    `).join("");
    bodyHTML = `
      <div class="newsletter-body">${escHtml(c.body || "")}</div>
      <div class="subject-lines-label">Subject Line (select one to approve)</div>
      <div class="subject-lines">${subjectOpts}</div>
      <div class="preview-text-label">Preview Text</div>
      <input type="text" class="preview-text-field" id="preview_${output.id}" value="${escHtml(c.preview_text || "")}">
    `;
  } else if (engine === "knowledge") {
    const tags = (c.tags || []).map(t => `<span class="kb-tag">${escHtml(t)}</span>`).join("");
    const destSelected = output.destination || "";
    bodyHTML = `
      <div class="kb-title">${escHtml(c.title || "")}</div>
      <div class="kb-tags">${tags}</div>
      <div class="kb-content">${escHtml(c.content || "")}</div>
      <div class="destination-picker">
        <button class="dest-btn${destSelected === "gdrive" ? " selected" : ""}" data-dest="gdrive" data-output-id="${output.id}">
          📁 Google Drive
        </button>
        <button class="dest-btn${destSelected === "github" ? " selected" : ""}" data-dest="github" data-output-id="${output.id}">
          🐙 GitHub Repo
        </button>
      </div>
    `;
  }

  const pushLabel = engine === "authority"
    ? `Push to ${output.platform === "twitter" ? "X" : "LinkedIn"}`
    : engine === "newsletter"
    ? "Schedule / Push"
    : "Save to Destination";

  const isPushable = output.status === "approved";
  const isPushed   = output.status === "pushed";

  return `
    <div class="output-card" data-output-id="${output.id}">
      <div class="output-card-header">
        <span class="output-card-title">${getCardTitle(output)}</span>
        <span class="output-card-meta">${output.engine} | ${formatTime(output.created_at)}</span>
        <span class="status-chip ${statusChipCls}" id="status-chip-${output.id}">${statusLabel}</span>
      </div>
      <div class="output-card-body" id="output-body-${output.id}">
        ${bodyHTML}
        <div id="receipt-area-${output.id}"></div>
      </div>
      <div class="output-actions" id="output-actions-${output.id}">
        ${!isPushed ? `<button class="btn-request-edits" data-output-id="${output.id}">✏ Request Edits</button>` : ""}
        ${!isPushed && output.status !== "approved" ? `<button class="btn-approve" data-output-id="${output.id}">✓ Approve</button>` : ""}
        <span class="actions-spacer"></span>
        ${!isPushed ? `
          <span class="push-hint" id="push-hint-${output.id}" style="${isPushable ? "display:none" : ""}">Approve output first</span>
          <button class="btn-push" data-output-id="${output.id}" ${isPushable ? "" : "disabled"} title="${isPushable ? "" : "Approve output first"}">${pushLabel}</button>
        ` : `<span class="status-chip status-pushed">Pushed</span>`}
      </div>
    </div>
  `;
}

function wireOutputCardActions(outputId, output) {
  const area = document.getElementById("output-area");
  if (!area) return;

  // Request Edits
  area.querySelectorAll(`.btn-request-edits[data-output-id="${outputId}"]`).forEach(btn => {
    btn.addEventListener("click", () => openRevisionModal(outputId));
  });

  // Approve
  area.querySelectorAll(`.btn-approve[data-output-id="${outputId}"]`).forEach(btn => {
    btn.addEventListener("click", () => approveOutput(outputId));
  });

  // Push / Save
  area.querySelectorAll(`.btn-push[data-output-id="${outputId}"]`).forEach(btn => {
    btn.addEventListener("click", () => pushApprovedOutput(outputId, output));
  });

  // Destination picker (Knowledge)
  area.querySelectorAll(`.dest-btn[data-output-id="${outputId}"]`).forEach(btn => {
    btn.addEventListener("click", async () => {
      area.querySelectorAll(`.dest-btn[data-output-id="${outputId}"]`).forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      await updateOutputStatus(outputId, output.status, { destination: btn.dataset.dest });
    });
  });

  // Subject line radio
  area.querySelectorAll(`input[name="subject_${outputId}"]`).forEach(radio => {
    radio.addEventListener("change", () => {
      area.querySelectorAll(`.subject-line-opt`).forEach(opt => opt.classList.remove("selected"));
      const label = radio.closest(".subject-line-opt");
      if (label) label.classList.add("selected");
    });
  });
}

async function approveOutput(outputId) {
  await updateOutputStatus(outputId, "approved");
  await logEvent(null, "approved", { outputId });

  // Update chip
  updateStatusChip(outputId, "approved");

  // Show push button, hide hint
  const actions = document.getElementById(`output-actions-${outputId}`);
  if (actions) {
    const pushBtn = actions.querySelector(`.btn-push[data-output-id="${outputId}"]`);
    const hint    = document.getElementById(`push-hint-${outputId}`);
    const approveBtn = actions.querySelector(`.btn-approve[data-output-id="${outputId}"]`);

    if (pushBtn)  { pushBtn.disabled = false; pushBtn.removeAttribute("title"); }
    if (hint)     hint.style.display = "none";
    if (approveBtn) approveBtn.remove();
  }

  appendRunLog({ runNum: runCounter, engine: activeEngine, model: getActiveModel(), cost_usd: 0, status: "approved", duration_ms: 0 });
  await renderOutputQueue();
}

async function pushApprovedOutput(outputId, output) {
  const outputData = await getOutput(outputId);
  if (!outputData || outputData.status !== "approved") return;

  const pushBtn = document.querySelector(`.btn-push[data-output-id="${outputId}"]`);
  if (pushBtn) { pushBtn.disabled = true; pushBtn.textContent = "Pushing..."; }

  try {
    let destination = outputData.destination;
    let contentStr = "";
    let title = "";

    if (output.engine === "authority" || outputData.engine === "authority") {
      destination = destination || (outputData.platform === "twitter" ? "twitter" : "linkedin");
      contentStr = outputData.content.content || "";
      title = "Authority Post";
    } else if (output.engine === "newsletter" || outputData.engine === "newsletter") {
      destination = "linkedin"; // Newsletter push to LinkedIn draft
      contentStr = outputData.content.body || "";
      title = outputData.content.subject_lines?.[0] || "Newsletter";
    } else {
      // Knowledge
      contentStr = outputData.content.content || "";
      title = outputData.content.title || "KB Entry";
      if (!destination) destination = "gdrive"; // default if no picker selection
    }

    const receipt = await pushOutput(destination, contentStr, title);

    await updateOutputStatus(outputId, "pushed");
    await logEvent(null, "push_attempt", { outputId, destination, receipt });

    // Update chip and show receipt
    updateStatusChip(outputId, "pushed");
    showReceipt(outputId, receipt);

    if (pushBtn) { pushBtn.textContent = "Pushed"; pushBtn.disabled = true; }

    appendRunLog({ runNum: runCounter, engine: activeEngine, model: getActiveModel(), cost_usd: 0, status: "pushed", duration_ms: 0 });
    await renderOutputQueue();

  } catch (err) {
    console.error("Push failed:", err);
    if (pushBtn) { pushBtn.disabled = false; pushBtn.textContent = "Retry Push"; }
  }
}

function showReceipt(outputId, receipt) {
  const area = document.getElementById(`receipt-area-${outputId}`);
  if (!area) return;

  const rows = Object.entries(receipt)
    .filter(([k]) => !["icon", "timestamp"].includes(k))
    .map(([k, v]) => {
      const isUrl = typeof v === "string" && v.startsWith("http");
      const valHtml = isUrl
        ? `<a href="${escHtml(v)}" class="receipt-val receipt-link" target="_blank" rel="noopener">${escHtml(v)}</a>`
        : `<span class="receipt-val">${escHtml(String(v))}</span>`;
      return `<div class="receipt-row"><span class="receipt-key">${escHtml(k)}</span>${valHtml}</div>`;
    }).join("");

  area.innerHTML = `
    <div class="receipt-card">
      <h4>${receipt.icon || "✓"} Pushed to ${escHtml(receipt.platform || "destination")}</h4>
      ${rows}
    </div>
  `;
}

function updateStatusChip(outputId, status) {
  const chip = document.getElementById(`status-chip-${outputId}`);
  if (!chip) return;
  chip.className = `status-chip status-${status}`;
  chip.textContent = formatStatusLabel(status);
}

// --- Load output from queue into workspace ---

async function loadOutputIntoWorkspace(outputId) {
  const output = await getOutput(outputId);
  if (!output) return;

  // Switch to correct engine tab
  switchEngine(output.engine);
  activeOutputId = outputId;

  // Pre-fill input
  const inputIds = { authority: "authority-input", newsletter: "newsletter-input", knowledge: "knowledge-input" };
  const inputEl = document.getElementById(inputIds[output.engine]);
  if (inputEl && output.input) inputEl.value = output.input;

  // Render the card
  const area = document.getElementById("output-area");
  if (area) {
    area.innerHTML = buildOutputCardHTML(output);
    wireOutputCardActions(output.id, output);
  }
}

// --- Revision Modal ---

function initRevisionModal() {
  const modal  = document.getElementById("revision-modal");
  const closeBtn = document.getElementById("close-revision-modal");
  const cancelBtn = document.getElementById("cancel-revision-modal");
  const submitBtn = document.getElementById("submit-revision-btn");

  closeBtn  && closeBtn.addEventListener("click",  closeRevisionModal);
  cancelBtn && cancelBtn.addEventListener("click", closeRevisionModal);
  modal     && modal.addEventListener("click", (e) => { if (e.target === modal) closeRevisionModal(); });

  submitBtn && submitBtn.addEventListener("click", async () => {
    const notes = document.getElementById("revision-notes").value.trim();
    if (!notes || !revisionTargetId) return;
    closeRevisionModal();
    await runRevision(revisionTargetId, notes);
  });
}

function openRevisionModal(outputId) {
  revisionTargetId = outputId;
  const modal = document.getElementById("revision-modal");
  const notes = document.getElementById("revision-notes");
  if (notes) notes.value = "";
  if (modal) modal.classList.remove("hidden");
}

function closeRevisionModal() {
  const modal = document.getElementById("revision-modal");
  if (modal) modal.classList.add("hidden");
  revisionTargetId = null;
}

async function runRevision(outputId, revisionNotes) {
  const output = await getOutput(outputId);
  if (!output) return;

  runCounter++;
  const newRunId  = uuid();
  const newOutId  = uuid();

  disableRunBtn(output.engine, true);
  updateStatusChip(outputId, "running");

  // Show running in card body
  const bodyEl = document.getElementById(`output-body-${outputId}`);
  const origBodyHTML = bodyEl ? bodyEl.innerHTML : "";
  if (bodyEl) bodyEl.innerHTML = `<div class="running-indicator"><div class="spinner"></div><span>Revising with your feedback...</span></div>`;

  await logEvent(newRunId, "run_start", { engine: output.engine, input: output.input, revision: revisionNotes });

  try {
    let result;
    if (output.engine === "authority") {
      result = await reviseAuthorityEngine(output.input, output.platform, output.content, revisionNotes);
    } else if (output.engine === "newsletter") {
      result = await reviseNewsletterEngine(output.input, output.content, revisionNotes);
    } else {
      result = await reviseKnowledgeEngine(output.input, output.category, output.content, revisionNotes);
    }

    const newRun = {
      id: newRunId,
      engine: output.engine,
      input: output.input,
      model: result.model,
      output_id: newOutId,
      cost_usd: result.cost_usd,
      duration_ms: result.duration_ms,
      timestamp: new Date().toISOString(),
      workspace_id: "ws_default"
    };

    const newOutput = {
      ...output,
      id: newOutId,
      run_id: newRunId,
      content: result.output,
      status: "revised",
      revision_notes: revisionNotes,
      created_at: new Date().toISOString(),
      approved_at: null,
      pushed_at: null
    };

    await saveRun(newRun);
    await saveOutput(newOutput);
    await logEvent(newRunId, "run_complete", { outputId: newOutId });

    // Re-render with revised output
    activeOutputId = newOutId;
    const area = document.getElementById("output-area");
    if (area) {
      area.innerHTML = buildOutputCardHTML(newOutput);
      wireOutputCardActions(newOutput.id, newOutput);
    }

    appendRunLog({ runNum: runCounter, engine: output.engine, model: result.model, cost_usd: result.cost_usd, status: "revised", duration_ms: result.duration_ms });
    await renderOutputQueue();
    await updateUsageStats();

  } catch (err) {
    console.error("Revision failed:", err);
    if (bodyEl) bodyEl.innerHTML = origBodyHTML;
    updateStatusChip(outputId, "needs-review");
  }

  disableRunBtn(output.engine, false);
}

// --- Helpers ---

function getCardTitle(output) {
  const c = output.content;
  if (output.engine === "authority") return `Authority  -  ${output.platform || "LinkedIn"} Post`;
  if (output.engine === "newsletter") return c.subject_lines?.[0] ? escHtml(c.subject_lines[0]) : "Newsletter Draft";
  if (output.engine === "knowledge")  return c.title ? escHtml(c.title) : "KB Entry";
  return "Output";
}

function formatStatusLabel(s) {
  return {
    idle:           "Idle",
    running:        "Running",
    "needs-review": "Needs Review",
    revised:        "Revised",
    approved:       "Approved",
    pushed:         "Pushed",
    error:          "Error"
  }[s] || s;
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// --- Boot ---
init().catch(err => {
  console.error("Pathwaize IC init failed:", err);
  const overlay = document.getElementById("model-overlay");
  const statusText = document.getElementById("model-status-text");
  if (statusText) statusText.textContent = "Initialization error  -  refresh to retry";
});
