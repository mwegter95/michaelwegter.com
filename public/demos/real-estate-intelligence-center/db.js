// IndexedDB layer  -  database: "pathwaize-ic", version 1
// Stores: runs, outputs, logs, workspace

const DB_NAME = "pathwaize-ic";
const DB_VER  = 1;

let db = null;

export async function initDB() {
  if (db) return db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);

    req.onupgradeneeded = (e) => {
      const d = e.target.result;

      if (!d.objectStoreNames.contains("runs")) {
        d.createObjectStore("runs", { keyPath: "id" });
      }
      if (!d.objectStoreNames.contains("outputs")) {
        const os = d.createObjectStore("outputs", { keyPath: "id" });
        os.createIndex("run_id", "run_id");
        os.createIndex("engine", "engine");
        os.createIndex("status", "status");
      }
      if (!d.objectStoreNames.contains("logs")) {
        const ls = d.createObjectStore("logs", { keyPath: "id" });
        ls.createIndex("run_id", "run_id");
      }
      if (!d.objectStoreNames.contains("workspace")) {
        d.createObjectStore("workspace", { keyPath: "id" });
      }
    };

    req.onsuccess = async (e) => {
      db = e.target.result;
      await seedWorkspace();
      resolve(db);
    };
    req.onerror = () => reject(req.error);
  });
}

// --- Workspace ---

const DEFAULT_WORKSPACE = {
  id: "ws_default",
  name: "Austin Fix & Flip Operations",
  business_context: "Austin-based fix-and-flip investor. Primary lead source: cold calls. Typical deal size: $280K-$420K ARV. Average hold: 90 days. Team: 2 acquisitions, 1 project manager.",
  niche: "Fix-and-flip residential, single-family",
  location: "Austin, TX",
  tone: "Direct, authoritative, no fluff"
};

async function seedWorkspace() {
  const existing = await getWorkspace();
  if (!existing) {
    await put("workspace", DEFAULT_WORKSPACE);
  }
}

export async function getWorkspace() {
  return get("workspace", "ws_default");
}

export async function saveWorkspace(ws) {
  return put("workspace", { ...ws, id: "ws_default" });
}

// --- Runs ---

export async function saveRun(run) {
  return put("runs", run);
}

export async function getAllRuns() {
  return getAll("runs");
}

// --- Outputs ---

export async function saveOutput(output) {
  return put("outputs", output);
}

export async function getOutput(id) {
  return get("outputs", id);
}

export async function updateOutputStatus(id, status, extra = {}) {
  const output = await get("outputs", id);
  if (!output) return;
  const updated = { ...output, status, ...extra };
  if (status === "approved") updated.approved_at = new Date().toISOString();
  if (status === "pushed") updated.pushed_at = new Date().toISOString();
  return put("outputs", updated);
}

export async function getPendingOutputs() {
  const all = await getAll("outputs");
  return all.filter(o => o.status === "needs-review" || o.status === "revised");
}

export async function getAllOutputs() {
  return getAll("outputs");
}

// --- Logs ---

export async function logEvent(runId, event, detail = {}) {
  return put("logs", {
    id: uuid(),
    run_id: runId,
    event,
    detail,
    timestamp: new Date().toISOString()
  });
}

// --- Usage stats ---

export async function getUsageStats() {
  const runs = await getAllRuns();
  const stats = { total: 0, authority: 0, newsletter: 0, knowledge: 0, count: runs.length };
  for (const r of runs) {
    stats.total += r.cost_usd || 0;
    if (r.engine === "authority") stats.authority += r.cost_usd || 0;
    if (r.engine === "newsletter") stats.newsletter += r.cost_usd || 0;
    if (r.engine === "knowledge") stats.knowledge += r.cost_usd || 0;
  }
  return stats;
}

// --- Helpers ---

function get(store, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror  = () => reject(req.error);
  });
}

function getAll(store) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror  = () => reject(req.error);
  });
}

function put(store, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const req = tx.objectStore(store).put(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror  = () => reject(req.error);
  });
}

export function uuid() {
  return crypto.randomUUID ? crypto.randomUUID()
    : "xxxx-xxxx-4xxx-yxxx".replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
      });
}
