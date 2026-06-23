/* ── Auction Scraper Console: app.js ───────────────────────────────────── */

const API = 'https://api.michaelwegter.com/demos/auction-scraper';

// ── State ─────────────────────────────────────────────────────────────────

let allLots = [];
let currentJobId = null;
let currentEventSource = null;
let isRunning = false;
let inspectorLot = null;
let inspectorTab = 'normalized';  // 'normalized' | 'raw_json_ld'
let lightboxImages = [];
let lightboxIdx = 0;
let telemetryOpen = false;
let logLines = 0;

const sourceState = {
  leland_little:    { state: 'idle', lots: 0, meta: '' },
  heritage_auctions:{ state: 'idle', lots: 0, meta: '' },
  bonhams:          { state: 'idle', lots: 0, meta: '' },
};

// ── DOM refs ──────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);
const btnRun        = $('btn-run');
const btnExport     = $('btn-export');
const btnViewAll    = $('btn-view-all');
const lotsGrid      = $('lots-grid');
const filterSource  = $('filter-source');
const filterHasImg  = $('filter-has-image');
const filterEstMax  = $('filter-est-max');
const estMaxLabel   = $('est-max-label');
const sortSelect    = $('sort-select');
const statusTotal   = $('status-total');
const telemetryLog  = $('telemetry-log');
const telemetryCount= $('telemetry-count');
const inspectorOverlay = $('inspector-overlay');
const inspectorTitle   = $('inspector-title');
const inspectorBody    = $('inspector-body');
const lightbox      = $('lightbox');
const lbImg         = $('lb-img');
const lbCaption     = $('lb-caption');
const lbCounter     = $('lb-counter');
const lbPrev        = $('lb-prev');
const lbNext        = $('lb-next');
const datasetBar    = $('dataset-bar');
const datasetSummary= $('dataset-summary');
const toast         = $('toast');

// ── Currency formatter ────────────────────────────────────────────────────

const CURRENCY_SYMBOLS = { USD: '$', GBP: '£', EUR: '€' };
function fmtEstimate(lot) {
  if (!lot.estimate_low && !lot.estimate_high) return 'Est. N/A';
  const sym = CURRENCY_SYMBOLS[lot.currency] || '$';
  const fmt = n => sym + n.toLocaleString();
  if (lot.estimate_low && lot.estimate_high)
    return `${fmt(lot.estimate_low)} to ${fmt(lot.estimate_high)}`;
  if (lot.estimate_low) return `${fmt(lot.estimate_low)}+`;
  return `Up to ${fmt(lot.estimate_high)}`;
}

function fmtDate(d) {
  if (!d) return '';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  } catch { return d; }
}

function fmtTs(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
  } catch { return iso; }
}

// ── Source state management ───────────────────────────────────────────────

function setSourceState(slug, state, meta = '') {
  sourceState[slug].state = state;
  if (meta) sourceState[slug].meta = meta;
  const el = document.querySelector(`.source-status[data-source="${slug}"]`);
  if (!el) return;
  el.setAttribute('data-state', state);
  const badge = el.querySelector('.source-status-badge');
  const metaEl = el.querySelector('.source-status-meta');
  const labels = { idle: 'Idle', running: 'Running', done: 'Done', flagged: 'Flagged', error: 'Error' };
  if (badge) badge.textContent = labels[state] || state;
  if (metaEl) metaEl.textContent = meta;
}

function incSourceLots(slug) {
  sourceState[slug].lots++;
  const el = document.querySelector(`.source-status[data-source="${slug}"]`);
  if (!el) return;
  const metaEl = el.querySelector('.source-status-meta');
  if (metaEl) metaEl.textContent = `${sourceState[slug].lots} lots`;
}

function resetSourceStates() {
  for (const slug of Object.keys(sourceState)) {
    sourceState[slug].state = 'idle';
    sourceState[slug].lots = 0;
    sourceState[slug].meta = '';
    setSourceState(slug, 'idle', '');
  }
}

// ── Telemetry log ─────────────────────────────────────────────────────────

function addLogLine(html, special = false) {
  const div = document.createElement('div');
  div.className = special ? 'log-line log-special' : 'log-line';
  div.innerHTML = html;
  telemetryLog.appendChild(div);
  telemetryLog.scrollTop = telemetryLog.scrollHeight;
  logLines++;
  if (telemetryCount) telemetryCount.textContent = logLines;
}

function logEvent(evt) {
  const ts = fmtTs(evt.ts || new Date().toISOString());
  const srcClass = `log-source-${evt.source}`;
  const srcName = {
    leland_little: 'leland_little   ',
    heritage_auctions: 'heritage_auctions',
    bonhams:           'bonhams          ',
  }[evt.source] || evt.source;

  addLogLine(
    `<span class="log-ts">${ts}</span>` +
    `<span class="log-source ${srcClass}">${srcName}</span>` +
    `<span class="log-msg">${escHtml(evt.message || '')}</span>`
  );
}

function logRateLimit(evt) {
  const ts = fmtTs(evt.ts);
  const srcClass = `log-source-${evt.source}`;
  addLogLine(
    `<span class="log-ts">${ts}</span>` +
    `<span class="log-source ${srcClass}">${evt.source}</span>` +
    `<span class="log-msg">rate_limit_pause: GET ${escHtml(shortUrl(evt.url))} ` +
    `→ ${evt.delay_s}s delay (req #${evt.request_count})</span>`
  );
}

function logRetry(evt) {
  const ts = fmtTs(evt.ts);
  const srcClass = `log-source-${evt.source}`;
  addLogLine(
    `<span class="log-ts">${ts}</span>` +
    `<span class="log-source ${srcClass}">${evt.source}</span>` +
    `<span class="log-msg warning">retry ${evt.attempt}/${evt.max_attempts}: backoff ${evt.delay_s}s, ${escHtml(evt.reason)}</span>`
  );
}

function logFlagged(evt) {
  const ts = fmtTs(evt.ts);
  const srcClass = `log-source-${evt.source}`;
  addLogLine(
    `<span class="log-ts">${ts}</span>` +
    `<span class="log-source ${srcClass}">${evt.source}</span>` +
    `<span class="log-msg warning">⚠ flagged_for_api: ${escHtml(evt.reason.split('.')[0])}.</span>`,
    true
  );
}

function logSourceDone(evt) {
  const ts = fmtTs(evt.ts);
  const srcClass = `log-source-${evt.source}`;
  const note = evt.note ? ` (${evt.note})` : '';
  addLogLine(
    `<span class="log-ts">${ts}</span>` +
    `<span class="log-source ${srcClass}">${evt.source}</span>` +
    `<span class="log-msg">✓ source_done: ${evt.lot_count} lots${note}</span>`
  );
}

function shortUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return u.hostname + u.pathname.slice(0, 40);
  } catch { return url.slice(0, 50); }
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Card rendering ────────────────────────────────────────────────────────

const SOURCE_LABELS = {
  leland_little:    'Leland Little',
  heritage_auctions:'Heritage',
  bonhams:          'Bonhams',
};

function proxyImg(url) {
  if (!url) return '';
  return `${API}/image?url=${encodeURIComponent(url)}`;
}

function renderCard(lot) {
  const card = document.createElement('div');
  card.className = 'lot-card';
  card.dataset.source = lot.source;
  card.dataset.hasImage = lot.images && lot.images.length > 0 ? '1' : '0';
  card.dataset.estLow = lot.estimate_low || 0;
  card.dataset.lotId = lot.lot_number || '';

  const hasImg = lot.images && lot.images.length > 0;
  const imgSrc = hasImg ? proxyImg(lot.images[0]) : '';
  const lotIdx = allLots.length - 1;

  const thumbHtml = hasImg
    ? `<img src="${escHtml(imgSrc)}" alt="${escHtml(lot.title)}" loading="lazy"
            onerror="this.parentElement.innerHTML='<div class=\\'thumb-placeholder\\'>🏺</div>'">`
    : `<div class="thumb-placeholder">🏺</div>`;

  const estimateHtml = (lot.estimate_low || lot.estimate_high)
    ? `<div>
         <div class="lot-estimate-label">Estimate</div>
         <div class="lot-estimate">${escHtml(fmtEstimate(lot))}</div>
       </div>`
    : `<div class="lot-estimate" style="color:var(--text-muted);font-size:12px">Est. N/A</div>`;

  const flaggedNote = lot.scraper_notes && lot.scraper_notes.includes('seeded')
    ? `<div class="flagged-note">⚠ Seeded data, site flagged for API</div>`
    : '';

  card.innerHTML = `
    <div class="lot-card-thumb" data-lot-idx="${lotIdx}" data-lot-source="${escHtml(lot.source)}">
      ${thumbHtml}
      <div class="thumb-overlay"><span>🔍</span></div>
    </div>
    <div class="lot-card-body">
      <div class="lot-card-header">
        <span class="lot-source-badge badge-${escHtml(lot.source)}">${escHtml(SOURCE_LABELS[lot.source] || lot.source)}</span>
        ${lot.lot_number ? `<span class="lot-number">Lot ${escHtml(lot.lot_number)}</span>` : ''}
      </div>
      <div class="lot-title">${escHtml(lot.title)}</div>
      ${estimateHtml}
      ${flaggedNote}
      <div class="lot-meta">
        <div class="lot-sale-date">
          ${lot.sale_date ? `📅 ${escHtml(fmtDate(lot.sale_date))}` : ''}
        </div>
        <div class="lot-actions">
          <button class="btn-json" data-lot-idx="${lotIdx}" title="View JSON">{ }</button>
        </div>
      </div>
    </div>
  `;

  // Thumbnail click → lightbox
  const thumb = card.querySelector('.lot-card-thumb');
  thumb.addEventListener('click', () => {
    if (hasImg) openLightbox(lot.images.map(proxyImg), lot.title, 0);
  });

  // JSON button
  card.querySelector('.btn-json').addEventListener('click', () => {
    openInspector(lot);
  });

  return card;
}

function appendLot(lot) {
  // Remove empty-state placeholder
  const placeholder = lotsGrid.querySelector('.lots-empty');
  if (placeholder) placeholder.remove();

  allLots.push(lot);
  const card = renderCard(lot);

  // Apply current filters
  if (!passesFilter(lot)) card.style.display = 'none';
  lotsGrid.appendChild(card);

  incSourceLots(lot.source);
  updateStatusTotal();
}

function updateStatusTotal() {
  const visible = lotsGrid.querySelectorAll('.lot-card:not([style*="display: none"])').length;
  if (statusTotal) statusTotal.textContent = `${visible} of ${allLots.length} lots`;
}

// ── Filters ───────────────────────────────────────────────────────────────

function passesFilter(lot) {
  const src = filterSource ? filterSource.value : 'all';
  if (src !== 'all' && lot.source !== src) return false;

  if (filterHasImg && filterHasImg.checked) {
    if (!lot.images || lot.images.length === 0) return false;
  }

  const maxEst = filterEstMax ? parseInt(filterEstMax.value) : Infinity;
  if (maxEst < 500000) {
    const estLow = lot.estimate_low || 0;
    if (estLow > maxEst) return false;
  }

  return true;
}

function applyFilters() {
  const cards = lotsGrid.querySelectorAll('.lot-card');
  let visible = 0;
  cards.forEach((card, i) => {
    const lot = allLots[i];
    if (!lot) return;
    const show = passesFilter(lot);
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  if (statusTotal) statusTotal.textContent = `${visible} of ${allLots.length} lots`;
}

function applySort() {
  const sortBy = sortSelect ? sortSelect.value : 'default';
  if (sortBy === 'default' || allLots.length === 0) return;

  const cards = Array.from(lotsGrid.querySelectorAll('.lot-card'));
  const sorted = [...cards].sort((a, b) => {
    const la = allLots[Array.from(lotsGrid.children).indexOf(a)];
    const lb = allLots[Array.from(lotsGrid.children).indexOf(b)];
    if (!la || !lb) return 0;
    if (sortBy === 'date') {
      return (la.sale_date || '').localeCompare(lb.sale_date || '');
    }
    if (sortBy === 'estimate_low') {
      return (la.estimate_low || 0) - (lb.estimate_low || 0);
    }
    if (sortBy === 'estimate_high') {
      return (lb.estimate_high || 0) - (la.estimate_high || 0);
    }
    if (sortBy === 'source') {
      return (la.source || '').localeCompare(lb.source || '');
    }
    return 0;
  });
  sorted.forEach(c => lotsGrid.appendChild(c));
}

// ── JSON Inspector ────────────────────────────────────────────────────────

function syntaxHighlight(json) {
  const str = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
  return str.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    match => {
      let cls = 'json-num';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'json-key' : 'json-str';
      } else if (/true|false/.test(match)) {
        cls = 'json-bool';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

function openInspector(lot) {
  inspectorLot = lot;
  inspectorTab = 'normalized';
  if (inspectorTitle) inspectorTitle.textContent = lot.title;

  // Show/hide raw JSON-LD tab (Heritage only)
  const rawTab = document.querySelector('.inspector-tab[data-tab="raw_json_ld"]');
  if (rawTab) rawTab.style.display = lot.raw_json_ld ? '' : 'none';

  renderInspectorContent();
  if (inspectorOverlay) {
    inspectorOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function renderInspectorContent() {
  if (!inspectorLot) return;

  // Update tab active state
  document.querySelectorAll('.inspector-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === inspectorTab);
  });

  let data;
  if (inspectorTab === 'raw_json_ld') {
    data = inspectorLot.raw_json_ld || {};
  } else {
    // Normalized view: exclude raw_json_ld to keep it clean
    const { raw_json_ld, ...clean } = inspectorLot;
    data = clean;
  }

  if (inspectorBody) {
    inspectorBody.innerHTML = `<div class="json-view">${syntaxHighlight(data)}</div>`;
  }
}

function closeInspector() {
  if (inspectorOverlay) inspectorOverlay.classList.remove('open');
  document.body.style.overflow = '';
  inspectorLot = null;
}

// ── Lightbox ──────────────────────────────────────────────────────────────

function openLightbox(images, caption, startIdx = 0) {
  lightboxImages = images;
  lightboxIdx = startIdx;
  showLbImage();
  if (lbCaption) lbCaption.textContent = caption;
  if (lightbox) lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showLbImage() {
  if (!lightboxImages.length) return;
  const src = lightboxImages[lightboxIdx];
  if (lbImg) {
    lbImg.src = src;
    lbImg.onerror = () => { lbImg.alt = 'Image unavailable'; };
  }
  if (lbCounter) lbCounter.textContent = `${lightboxIdx + 1} / ${lightboxImages.length}`;
  if (lbPrev) lbPrev.disabled = lightboxIdx === 0;
  if (lbNext) lbNext.disabled = lightboxIdx === lightboxImages.length - 1;
}

function closeLightbox() {
  if (lightbox) lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Toast ─────────────────────────────────────────────────────────────────

let _toastTimer = null;
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── Export ────────────────────────────────────────────────────────────────

function exportLots() {
  const visibleLots = allLots.filter(passesFilter);
  if (!visibleLots.length) { showToast('No lots to export.'); return; }
  const json = JSON.stringify(visibleLots, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `auction-lots-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Exported ${visibleLots.length} lots.`);
}

// ── SSE / scrape runner ───────────────────────────────────────────────────

async function runScraper() {
  if (isRunning) return;

  // Gather selected sources
  const sources = [];
  document.querySelectorAll('.source-cb:checked').forEach(cb => sources.push(cb.value));
  if (!sources.length) { showToast('Select at least one source.'); return; }

  // Reset UI
  allLots = [];
  lotsGrid.innerHTML = `
    <div class="lots-empty">
      <div class="empty-icon">⏳</div>
      <p>Scraping in progress…</p>
      <small>Lot cards will appear here as each source is processed.</small>
    </div>`;
  telemetryLog.innerHTML = '';
  logLines = 0;
  if (telemetryCount) telemetryCount.textContent = '0';
  resetSourceStates();
  if (datasetBar) datasetBar.classList.remove('visible');
  updateStatusTotal();

  isRunning = true;
  btnRun.classList.add('running');
  btnRun.disabled = true;
  if (btnExport) btnExport.disabled = true;

  // Open telemetry log automatically
  if (!telemetryOpen) toggleTelemetry();

  try {
    // POST /scrape
    const r = await fetch(`${API}/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sources }),
    });
    if (!r.ok) throw new Error(`POST /scrape ${r.status}`);
    const { job_id } = await r.json();
    currentJobId = job_id;

    // SSE
    await listenSSE(job_id);
  } catch (err) {
    showToast(`Error: ${err.message}`);
    console.error('[auction-scraper]', err);
  } finally {
    isRunning = false;
    btnRun.classList.remove('running');
    btnRun.disabled = false;
  }
}

function listenSSE(jobId) {
  return new Promise((resolve, reject) => {
    const es = new EventSource(`${API}/stream/${jobId}`);
    currentEventSource = es;

    function finish() {
      es.close();
      currentEventSource = null;
      finalizeScrape();
      resolve();
    }

    es.onerror = (e) => {
      // If lots were already received, treat as soft finish
      if (allLots.length > 0) { finish(); }
      else { es.close(); reject(new Error('SSE connection error')); }
    };

    es.addEventListener('source_start', e => {
      const d = JSON.parse(e.data);
      setSourceState(d.source, 'running', d.tool);
      addLogLine(
        `<span class="log-ts">${fmtTs(d.ts)}</span>` +
        `<span class="log-source log-source-${d.source}">${d.source}</span>` +
        `<span class="log-msg">▶ source_start: tool: ${escHtml(d.tool)}</span>`
      );
    });

    es.addEventListener('lot', e => {
      const lot = JSON.parse(e.data);
      appendLot(lot);
    });

    es.addEventListener('log', e => {
      const d = JSON.parse(e.data);
      const lvl = d.level || 'info';
      const ts = fmtTs(d.ts);
      addLogLine(
        `<span class="log-ts">${ts}</span>` +
        `<span class="log-source log-source-${d.source}">${d.source}</span>` +
        `<span class="log-msg ${lvl === 'warning' || lvl === 'error' ? lvl : ''}">${escHtml(d.message)}</span>`
      );
    });

    es.addEventListener('rate_limit_pause', e => {
      const d = JSON.parse(e.data);
      logRateLimit(d);
    });

    es.addEventListener('retry', e => {
      const d = JSON.parse(e.data);
      logRetry(d);
    });

    es.addEventListener('flagged_for_api', e => {
      const d = JSON.parse(e.data);
      setSourceState(d.source, 'flagged', 'Flagged: API needed');
      logFlagged(d);
    });

    es.addEventListener('source_done', e => {
      const d = JSON.parse(e.data);
      if (sourceState[d.source].state !== 'flagged') {
        setSourceState(d.source, 'done', `${d.lot_count} lots`);
      } else {
        // Keep flagged badge but update meta
        const el = document.querySelector(`.source-status[data-source="${d.source}"] .source-status-meta`);
        if (el) el.textContent = `${d.lot_count} lots (seeded)`;
      }
      logSourceDone(d);
    });

    es.addEventListener('job_done', e => {
      const d = JSON.parse(e.data);
      addLogLine(
        `<span class="log-ts">${fmtTs(d.ts)}</span>` +
        `<span class="log-source" style="color:#8C8780">system</span>` +
        `<span class="log-msg">✓ job_done: ${d.total_lots} total lots in ${d.elapsed_s}s</span>`
      );
      finish();
    });

    es.addEventListener('done', () => finish());
    es.addEventListener('error_event', e => {
      const d = JSON.parse(e.data);
      addLogLine(
        `<span class="log-msg error">${escHtml(d.message || 'Unknown error')}</span>`
      );
      finish();
    });

    // Safety timeout: 3 min
    setTimeout(() => {
      if (es.readyState !== EventSource.CLOSED) finish();
    }, 180000);
  });
}

function finalizeScrape() {
  // Mark any still-running sources as done
  for (const [slug, s] of Object.entries(sourceState)) {
    if (s.state === 'running') setSourceState(slug, 'done', `${s.lots} lots`);
  }

  if (btnExport) btnExport.disabled = false;

  if (allLots.length > 0) {
    if (datasetBar) datasetBar.classList.add('visible');
    const srcCounts = {};
    allLots.forEach(l => { srcCounts[l.source] = (srcCounts[l.source] || 0) + 1; });
    const parts = Object.entries(srcCounts).map(([s, n]) =>
      `${n} from ${SOURCE_LABELS[s] || s}`
    ).join(', ');
    if (datasetSummary) datasetSummary.innerHTML =
      `<strong>${allLots.length} lots</strong> collected, ${parts}`;

    // Remove placeholder if still there
    const ph = lotsGrid.querySelector('.lots-empty');
    if (ph) ph.remove();
  } else {
    lotsGrid.innerHTML = `
      <div class="lots-empty">
        <div class="empty-icon">🔍</div>
        <p>No lots returned.</p>
        <small>Check the telemetry log for details.</small>
      </div>`;
  }

  applySort();
  updateStatusTotal();
}

// ── Telemetry toggle ──────────────────────────────────────────────────────

function toggleTelemetry() {
  telemetryOpen = !telemetryOpen;
  if (telemetryLog) telemetryLog.classList.toggle('open', telemetryOpen);
  const toggle = document.querySelector('.telemetry-toggle');
  if (toggle) toggle.textContent = telemetryOpen ? '▲ Hide' : '▼ Show';
}

// ── Event listeners ───────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Run button
  if (btnRun) btnRun.addEventListener('click', runScraper);

  // Export
  if (btnExport) btnExport.addEventListener('click', exportLots);

  // View Dataset (all lots JSON)
  if (btnViewAll) btnViewAll.addEventListener('click', () => {
    if (!allLots.length) return;
    const fakeAll = { lots: allLots, total: allLots.length, exported_at: new Date().toISOString() };
    openInspector({ title: 'Full Dataset', ...fakeAll, raw_json_ld: null });
  });

  // Filter / sort changes
  if (filterSource) filterSource.addEventListener('change', applyFilters);
  if (filterHasImg) filterHasImg.addEventListener('change', applyFilters);
  if (filterEstMax) {
    filterEstMax.addEventListener('input', () => {
      const v = parseInt(filterEstMax.value);
      if (estMaxLabel) {
        estMaxLabel.textContent = v >= 500000 ? 'Any' : '$' + v.toLocaleString();
      }
      applyFilters();
    });
  }
  if (sortSelect) sortSelect.addEventListener('change', applySort);

  // Inspector close
  const btnCloseInspector = $('btn-close-inspector');
  if (btnCloseInspector) btnCloseInspector.addEventListener('click', closeInspector);
  if (inspectorOverlay) {
    inspectorOverlay.addEventListener('click', e => {
      if (e.target === inspectorOverlay) closeInspector();
    });
  }

  // Inspector tabs
  document.querySelectorAll('.inspector-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      inspectorTab = tab.dataset.tab;
      renderInspectorContent();
    });
  });

  // Inspector copy
  const btnCopy = $('btn-copy-json');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      if (!inspectorLot) return;
      const data = inspectorTab === 'raw_json_ld'
        ? inspectorLot.raw_json_ld
        : (({ raw_json_ld, ...rest }) => rest)(inspectorLot);
      navigator.clipboard.writeText(JSON.stringify(data, null, 2))
        .then(() => showToast('Copied to clipboard!'));
    });
  }

  // Lightbox
  const btnCloseLb = $('btn-close-lb');
  if (btnCloseLb) btnCloseLb.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  if (lbPrev) lbPrev.addEventListener('click', () => {
    if (lightboxIdx > 0) { lightboxIdx--; showLbImage(); }
  });
  if (lbNext) lbNext.addEventListener('click', () => {
    if (lightboxIdx < lightboxImages.length - 1) { lightboxIdx++; showLbImage(); }
  });

  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (lightbox && lightbox.classList.contains('open')) closeLightbox();
      else if (inspectorOverlay && inspectorOverlay.classList.contains('open')) closeInspector();
    }
    if (lightbox && lightbox.classList.contains('open')) {
      if (e.key === 'ArrowLeft' && lightboxIdx > 0) { lightboxIdx--; showLbImage(); }
      if (e.key === 'ArrowRight' && lightboxIdx < lightboxImages.length - 1) { lightboxIdx++; showLbImage(); }
    }
  });

  // Telemetry toggle
  const telemetryHeader = document.querySelector('.telemetry-header');
  if (telemetryHeader) telemetryHeader.addEventListener('click', toggleTelemetry);

  // Filter est-max init label
  if (filterEstMax && estMaxLabel) {
    estMaxLabel.textContent = 'Any';
  }
});
