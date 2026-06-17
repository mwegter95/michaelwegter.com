// Admin panel: KB editor + analytics dashboard + session viewer
import { getCorpus, updateCorpusEntry, addCorpusEntry, deleteCorpusEntry } from "./rag.js";
import { getStats, getEvents, clearEvents } from "./analytics.js";
import { logEvent } from "./analytics.js";

const ADMIN_PASS = "admin123"; // demo password
let authenticated = false;

export function initAdmin() {
  const loginForm = document.getElementById("admin-login-form");
  const dashboard = document.getElementById("admin-dashboard");
  const loginSection = document.getElementById("admin-login-section");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const pass = document.getElementById("admin-pass").value;
      if (pass === ADMIN_PASS) {
        authenticated = true;
        loginSection.style.display = "none";
        dashboard.style.display = "block";
        renderDashboard();
        renderKBEditor();
        renderSessionViewer();
      } else {
        document.getElementById("admin-login-error").textContent = "Incorrect password. Try: admin123";
      }
    });
  }

  // Tab navigation
  document.querySelectorAll(".admin-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".admin-tab-panel").forEach(p => p.style.display = "none");
      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.style.display = "block";
    });
  });
}

function renderDashboard() {
  const stats = getStats();
  const el = document.getElementById("tab-analytics");
  if (!el) return;

  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.totalMessages}</div>
        <div class="stat-label">Total Messages</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.deflectionRate}%</div>
        <div class="stat-label">Deflection Rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.escalationsTriggered}</div>
        <div class="stat-label">Escalations</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.orderLookups}</div>
        <div class="stat-label">Order Lookups</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.avgMsgsPerSession}</div>
        <div class="stat-label">Avg Msgs / Session</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.escalationsSubmitted}</div>
        <div class="stat-label">Tickets Submitted</div>
      </div>
    </div>
    <div class="admin-section">
      <h3 class="admin-section-title">Top Customer Queries</h3>
      ${stats.topQueries.length > 0
        ? `<table class="admin-table">
            <thead><tr><th>Query</th><th>Count</th></tr></thead>
            <tbody>${stats.topQueries.map(q => `
              <tr><td>${escHtml(q.text)}</td><td>${q.count}</td></tr>
            `).join("")}</tbody>
          </table>`
        : `<p class="admin-empty">No queries yet. Start chatting to see data here.</p>`}
    </div>
    <div class="admin-section">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3 class="admin-section-title">Recent Events</h3>
        <button class="admin-btn-danger" id="clear-events-btn">Clear Events</button>
      </div>
      <div class="events-list">
        ${stats.recentEvents.length > 0
          ? stats.recentEvents.map(e => `
            <div class="event-row">
              <span class="event-type event-${e.type}">${e.type}</span>
              <span class="event-ts">${new Date(e.ts).toLocaleTimeString()}</span>
            </div>`).join("")
          : `<p class="admin-empty">No events recorded yet.</p>`}
      </div>
    </div>`;

  document.getElementById("clear-events-btn")?.addEventListener("click", () => {
    if (confirm("Clear all analytics events?")) {
      clearEvents();
      renderDashboard();
    }
  });
}

function renderKBEditor() {
  const corpus = getCorpus();
  const el = document.getElementById("tab-kb");
  if (!el) return;

  el.innerHTML = `
    <div class="admin-section">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 class="admin-section-title" style="margin:0">Knowledge Base (${corpus.length} entries)</h3>
        <button class="admin-btn-primary" id="add-entry-btn">+ Add Entry</button>
      </div>
      <div id="kb-entries">
        ${corpus.map((entry, i) => renderKBEntry(entry, i)).join("")}
      </div>
    </div>
    <div class="admin-section" id="kb-add-form" style="display:none">
      <h3 class="admin-section-title">Add New Entry</h3>
      <form id="new-entry-form">
        <div class="form-group">
          <label>Category</label>
          <select name="category" class="admin-input">
            <option>Orders</option><option>Shipping</option><option>Returns</option>
            <option>Payments</option><option>Issues</option><option>Promotions</option><option>Support</option>
          </select>
        </div>
        <div class="form-group">
          <label>Question</label>
          <input name="q" type="text" class="admin-input" placeholder="Customer question..." required />
        </div>
        <div class="form-group">
          <label>Answer</label>
          <textarea name="a" class="admin-input" rows="3" placeholder="Answer..." required></textarea>
        </div>
        <div style="display:flex;gap:8px">
          <button type="submit" class="admin-btn-primary">Save Entry</button>
          <button type="button" class="admin-btn-secondary" id="cancel-add">Cancel</button>
        </div>
      </form>
    </div>`;

  document.getElementById("add-entry-btn")?.addEventListener("click", () => {
    document.getElementById("kb-add-form").style.display = "block";
  });
  document.getElementById("cancel-add")?.addEventListener("click", () => {
    document.getElementById("kb-add-form").style.display = "none";
  });
  document.getElementById("new-entry-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    addCorpusEntry(data);
    logEvent("kb_edited", { action: "add", q: data.q.slice(0, 40) });
    renderKBEditor();
  });

  // Edit/delete handlers
  el.querySelectorAll(".kb-delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx);
      if (confirm("Delete this entry?")) {
        deleteCorpusEntry(idx);
        logEvent("kb_edited", { action: "delete", idx });
        renderKBEditor();
      }
    });
  });

  el.querySelectorAll(".kb-edit-form").forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const idx = parseInt(form.dataset.idx);
      const data = Object.fromEntries(new FormData(form));
      updateCorpusEntry(idx, data);
      logEvent("kb_edited", { action: "update", idx });
      renderKBEditor();
    });
    // Toggle expand
    form.previousElementSibling?.querySelector(".kb-toggle")?.addEventListener("click", () => {
      form.style.display = form.style.display === "none" ? "block" : "none";
    });
  });
}

function renderKBEntry(entry, i) {
  return `
<div class="kb-entry">
  <div class="kb-entry-header">
    <span class="kb-category-badge">${escHtml(entry.category)}</span>
    <span class="kb-question">${escHtml(entry.q)}</span>
    <div class="kb-actions">
      <button class="kb-toggle admin-btn-ghost" data-idx="${i}">Edit</button>
      <button class="kb-delete-btn admin-btn-ghost admin-btn-danger-ghost" data-idx="${i}">Delete</button>
    </div>
  </div>
  <form class="kb-edit-form" data-idx="${i}" style="display:none">
    <div class="form-group">
      <label>Category</label>
      <select name="category" class="admin-input">
        ${["Orders","Shipping","Returns","Payments","Issues","Promotions","Support"].map(c =>
          `<option${c === entry.category ? " selected" : ""}>${c}</option>`
        ).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Question</label>
      <input name="q" type="text" class="admin-input" value="${escHtml(entry.q)}" required />
    </div>
    <div class="form-group">
      <label>Answer</label>
      <textarea name="a" class="admin-input" rows="3" required>${escHtml(entry.a)}</textarea>
    </div>
    <button type="submit" class="admin-btn-primary" style="margin-top:8px">Save Changes</button>
  </form>
</div>`;
}

function renderSessionViewer() {
  const el = document.getElementById("tab-sessions");
  if (!el) return;
  const events = getEvents();

  // Group by session
  const sessions = {};
  events.forEach(e => {
    const sid = e.sessionId || "unknown";
    if (!sessions[sid]) sessions[sid] = [];
    sessions[sid].push(e);
  });

  if (Object.keys(sessions).length === 0) {
    el.innerHTML = `<p class="admin-empty">No session data yet. Interact with the chatbot first.</p>`;
    return;
  }

  el.innerHTML = Object.entries(sessions).map(([sid, evts]) => `
    <div class="session-card">
      <div class="session-header">
        <span class="session-id">${escHtml(sid)}</span>
        <span class="session-count">${evts.length} events</span>
      </div>
      <div class="session-events">
        ${evts.map(e => `
          <div class="event-row">
            <span class="event-type event-${e.type}">${e.type}</span>
            <span class="event-ts">${new Date(e.ts).toLocaleTimeString()}</span>
            ${e.text ? `<span class="event-text">${escHtml(e.text.slice(0,40))}</span>` : ""}
          </div>`).join("")}
      </div>
    </div>`).join("");
}

// Refresh dashboard periodically while open
setInterval(() => {
  if (authenticated) {
    const activeTab = document.querySelector(".admin-tab-btn.active");
    if (activeTab?.dataset.tab === "tab-analytics") renderDashboard();
    else if (activeTab?.dataset.tab === "tab-sessions") renderSessionViewer();
  }
}, 5000);

function escHtml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
