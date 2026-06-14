// app.js
// React (UMD) + htm root for the Compliance Reconciliation Console.
// Depends on window.React, window.ReactDOM, window.htm, and the ReconParser /
// ReconRules / ReconData modules loaded before this file.

(function () {
  "use strict";

  const { useState, useEffect, useRef, useMemo } = React;
  const html = htm.bind(React.createElement);

  const SAMPLES = [
    {
      key: "clean",
      label: "saft-pt-clean.xml",
      note: "Clean financial file. All 10 rules pass.",
      path: "./assets/samples/saft-pt-clean.xml",
    },
    {
      key: "anomalies",
      label: "saft-pt-anomalies.xml",
      note: "Seeded with 4 real failures (R03, R04, R07, R09).",
      path: "./assets/samples/saft-pt-anomalies.xml",
    },
  ];

  const PROJECTED_RECORDS = 250000; // ~500MB SAF-T equivalent at ~2KB/element

  function statusColor(s) {
    return s === "fail" ? "var(--parrot-red)" : s === "warn" ? "var(--mustard)" : "var(--parrot-green)";
  }

  // ---- Memory chart (two synthetic polylines over SVG) -------------------
  function MemoryChart({ model, progress }) {
    if (!model) return null;
    const W = 600, H = 200, padL = 44, padB = 26, padT = 12, padR = 12;
    const maxMB = model.projectedNaiveMB;
    const maxRec = model.projectedRecords;
    const x = (r) => padL + (r / maxRec) * (W - padL - padR);
    const y = (mb) => H - padB - (mb / maxMB) * (H - padB - padT);

    const cut = Math.max(2, Math.round((model.streaming.length - 1) * progress));
    const line = (pts) =>
      pts.slice(0, cut + 1).map((p) => x(p.records) + "," + y(p.mb)).join(" ");

    const yTicks = [0, Math.round(maxMB / 2), maxMB];
    return html`
      <svg class="mem-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Memory stability chart">
        ${yTicks.map(
          (t) => html`
            <g key=${"y" + t}>
              <line x1=${padL} y1=${y(t)} x2=${W - padR} y2=${y(t)} class="grid" />
              <text x=${padL - 8} y=${y(t) + 4} class="axis-label" text-anchor="end">${t}</text>
            </g>
          `
        )}
        <text x=${padL - 8} y=${padT - 2} class="axis-label" text-anchor="end">MB</text>
        <polyline class="line-naive" points=${line(model.naive)} />
        <polyline class="line-stream" points=${line(model.streaming)} />
        <text x=${W - padR} y=${y(model.naive[cut].mb) - 6} class="axis-label end naive" text-anchor="end">naive DOM</text>
        <text x=${W - padR} y=${y(model.streaming[cut].mb) - 6} class="axis-label end stream" text-anchor="end">iterparse</text>
        <text x=${(W + padL) / 2} y=${H - 4} class="axis-label" text-anchor="middle">records processed (projected to 500MB-equivalent)</text>
      </svg>
    `;
  }

  // ---- Rule card with threshold control + drill-down ---------------------
  function RuleCard({ rule, open, onToggle }) {
    const th = rule.threshold;
    const showDrill = (rule.status === "fail" || rule.status === "warn") && rule.offenders.length > 0;
    return html`
      <div class=${"rule-card status-" + rule.status}>
        <button class="rule-head" onClick=${onToggle} aria-expanded=${open}>
          <span class="rule-id">${rule.id}</span>
          <span class="rule-name">${rule.name}</span>
          <span class=${"rule-badge badge-" + rule.status}>${rule.status.toUpperCase()}</span>
          ${rule.count > 0 && html`<span class="rule-count">${rule.count} rec</span>`}
          ${showDrill && html`<span class="drill-caret">${open ? "−" : "+"}</span>`}
        </button>
        <p class="rule-checks">${rule.checks}</p>
        <p class="rule-detail">${rule.detail}</p>
        <div class="rule-thresh">
          <label>
            <span class="thresh-label">${th.label}</span>
            <input
              type="range"
              min=${th.min}
              max=${th.max}
              step=${th.step}
              value=${rule.thresholdValue}
              onInput=${(e) => rule.onThreshold(rule.id, parseFloat(e.target.value))}
            />
            <span class="thresh-val">${rule.thresholdValue} ${th.unit}</span>
          </label>
        </div>
        ${open && showDrill && html`
          <div class="drill">
            <p class="drill-title">Offending source records</p>
            <table class="drill-table">
              <thead><tr><th>Locator</th><th>Found</th><th>Expected</th><th>Delta</th></tr></thead>
              <tbody>
                ${rule.offenders.map(
                  (o, i) => html`<tr key=${i}><td>${o.field}</td><td>${o.value}</td><td>${o.expected}</td><td class="delta">${o.delta}</td></tr>`
                )}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  // ---- Dashboard (tiles, trend chart, paginated 100k table, CSV) ---------
  function Dashboard({ summary }) {
    const [ds, setDs] = useState(null);
    const [page, setPage] = useState(1);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState("asc");
    const pageSize = 50;

    useEffect(() => {
      // Defer 100k generation to keep first paint snappy.
      const id = setTimeout(() => setDs(window.ReconData.getDataset(100000)), 0);
      return () => clearTimeout(id);
    }, []);

    const pageData = useMemo(
      () => (ds ? window.ReconData.getPage(ds, page, pageSize, sortKey, sortDir) : null),
      [ds, page, sortKey, sortDir]
    );
    const trend = useMemo(() => (ds ? window.ReconData.anomaliesByPeriod(ds) : null), [ds]);

    if (!ds || !pageData) {
      return html`<div class="panel"><p class="loading">Generating 100,000-row ledger dataset...</p></div>`;
    }

    const maxTrend = Math.max(...trend, 1);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const sortBy = (k) => {
      if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
      else { setSortKey(k); setSortDir("asc"); }
      setPage(1);
    };

    return html`
      <div class="dash">
        <div class="tiles">
          ${summary.tiles.map(
            (t, i) => html`
              <div class="tile" key=${i} style=${{ borderTopColor: t.color }}>
                <p class="tile-val" style=${{ color: t.color }}>${t.value}</p>
                <p class="tile-label">${t.label}</p>
              </div>
            `
          )}
        </div>

        <div class="panel">
          <p class="eyebrow">Anomalies by fiscal period (generated dataset)</p>
          <div class="trend">
            ${trend.map(
              (v, i) => html`
                <div class="trend-col" key=${i} title=${months[i] + ": " + v + " flagged"}>
                  <div class="trend-bar" style=${{ height: (v / maxTrend) * 100 + "%" }}></div>
                  <span class="trend-x">${months[i]}</span>
                </div>
              `
            )}
          </div>
        </div>

        <div class="panel">
          <div class="table-head">
            <div>
              <p class="eyebrow">General ledger transactions</p>
              <p class="table-sub">Simulating server-side pagination over ${pageData.total.toLocaleString()} rows. Page ${pageData.page} of ${pageData.totalPages.toLocaleString()}.</p>
            </div>
            <button class="btn-export" onClick=${() => window.ReconData.downloadCSV("ledger-page-" + page + ".csv", pageData.rows)}>Export view (CSV)</button>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                ${["id", "txId", "journal", "accountId", "description", "period", "debit", "credit"].map(
                  (c) => html`<th key=${c} onClick=${() => sortBy(c)} class="sortable">${c}${sortKey === c ? (sortDir === "asc" ? " ▲" : " ▼") : ""}</th>`
                )}
              </tr>
            </thead>
            <tbody>
              ${pageData.rows.map(
                (r) => html`
                  <tr key=${r.id} class=${r.flagged ? "row-flag" : ""}>
                    <td>${r.id}</td><td>${r.txId}</td><td>${r.journal}</td><td>${r.accountId}</td>
                    <td>${r.description}</td><td>${r.period}</td>
                    <td class="num">${r.debit ? r.debit.toFixed(2) : ""}</td>
                    <td class="num">${r.credit ? r.credit.toFixed(2) : ""}</td>
                  </tr>
                `
              )}
            </tbody>
          </table>
          <div class="pager">
            <button disabled=${page <= 1} onClick=${() => setPage(1)}>First</button>
            <button disabled=${page <= 1} onClick=${() => setPage(page - 1)}>Prev</button>
            <span class="pager-info">Page ${page.toLocaleString()} / ${pageData.totalPages.toLocaleString()}</span>
            <button disabled=${page >= pageData.totalPages} onClick=${() => setPage(page + 1)}>Next</button>
            <button disabled=${page >= pageData.totalPages} onClick=${() => setPage(pageData.totalPages)}>Last</button>
          </div>
        </div>
      </div>
    `;
  }

  // ---- Root --------------------------------------------------------------
  function App() {
    const [sampleKey, setSampleKey] = useState("anomalies");
    const [detection, setDetection] = useState(null);
    const [doc, setDoc] = useState(null);
    const [memModel, setMemModel] = useState(null);
    const [progress, setProgress] = useState(0);
    const [parsing, setParsing] = useState(false);
    const [thresholds, setThresholds] = useState(() => window.ReconRules.defaultThresholds());
    const [openRule, setOpenRule] = useState(null);
    const [tab, setTab] = useState("rules");
    const rafRef = useRef(null);

    async function runFile(key) {
      const sample = SAMPLES.find((s) => s.key === key);
      setSampleKey(key);
      setDoc(null);
      setMemModel(null);
      setOpenRule(null);
      setProgress(0);
      setParsing(true);

      const xmlText = await fetch(sample.path).then((r) => r.text());

      // Supporting feature b: detect from first ~2KB before full parse.
      const det = window.ReconParser.detectFormat(xmlText);
      setDetection(det);

      const parsed = window.ReconParser.parseDocument(xmlText);
      const model = window.ReconParser.buildMemoryModel(parsed.recordCount, PROJECTED_RECORDS);

      // Animate the streaming parse readout.
      const start = performance.now();
      const DURATION = 2200;
      cancelAnimationFrame(rafRef.current);
      const step = (now) => {
        const p = Math.min(1, (now - start) / DURATION);
        setProgress(p);
        if (p < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          setParsing(false);
          setDoc(parsed);
          setMemModel(model);
        }
      };
      setMemModel(model);
      rafRef.current = requestAnimationFrame(step);
    }

    useEffect(() => {
      runFile("anomalies");
      return () => cancelAnimationFrame(rafRef.current);
      // eslint-disable-next-line
    }, []);

    const rules = useMemo(() => {
      if (!doc) return [];
      return window.ReconRules.evaluate(doc, thresholds).map((r) => ({ ...r, onThreshold: onThreshold }));
      // eslint-disable-next-line
    }, [doc, thresholds]);

    function onThreshold(id, val) {
      setThresholds((t) => ({ ...t, [id]: val }));
    }

    const counts = useMemo(() => {
      const c = { pass: 0, warn: 0, fail: 0 };
      rules.forEach((r) => (c[r.status] += 1));
      return c;
    }, [rules]);

    const recordsParsed = Math.round((doc ? doc.recordCount : memModel ? memModel.projectedRecords : 0));
    const liveRecords = memModel ? Math.round(memModel.projectedRecords * progress) : 0;

    const summary = {
      tiles: [
        { label: "Documents parsed", value: doc ? doc.invoices.length + doc.transactions.length : "...", color: "var(--cyan-vivid)" },
        { label: "Source rows", value: doc ? (100000).toLocaleString() + "+" : "...", color: "var(--sky-blue)" },
        { label: "Rules passed", value: counts.pass, color: "var(--parrot-green)" },
        { label: "Warnings", value: counts.warn, color: "var(--mustard)" },
        { label: "Failures", value: counts.fail, color: "var(--parrot-red)" },
      ],
    };

    return html`
      <main class="app">
        <header class="masthead">
          <p class="eyebrow">Compliance SaaS / Reconciliation Engine</p>
          <h1>Compliance Reconciliation Console</h1>
          <p class="lede">Pick a fiscal XML file. The console detects its schema, runs a memory-stable streaming parse, then evaluates 10 reconciliation rules with adjustable thresholds and click-through to the offending source records. The dashboard paginates a 100,000-row ledger the way a real API would.</p>
        </header>

        <section class="filebar panel">
          <div class="file-pick">
            <p class="eyebrow">Sample fiscal files</p>
            <div class="file-buttons">
              ${SAMPLES.map(
                (s) => html`
                  <button
                    key=${s.key}
                    class=${"file-btn" + (sampleKey === s.key ? " active" : "")}
                    onClick=${() => runFile(s.key)}>
                    <span class="file-name">${s.label}</span>
                    <span class="file-note">${s.note}</span>
                  </button>
                `
              )}
            </div>
          </div>
          ${detection && html`
            <div class="detect">
              <p class="eyebrow">Format detector (read first ${detection.bytesInspected} bytes)</p>
              <div class="detect-grid">
                <div><span class="dk">Document</span><span class="dv">${detection.docType}</span></div>
                <div><span class="dk">Variant</span><span class="dv">${detection.variant} (${detection.country})</span></div>
                <div><span class="dk">Schema</span><span class="dv">${detection.schemaVersion}</span></div>
                <div><span class="dk">Period</span><span class="dv">${detection.startDate} to ${detection.endDate}</span></div>
                <div><span class="dk">Basis</span><span class="dv">${detection.accountingBasis}</span></div>
                <div><span class="dk">Routed to</span><span class="dv route">${detection.parser}</span></div>
              </div>
            </div>
          `}
        </section>

        <section class="panel stream-panel">
          <div class="stream-head">
            <div>
              <p class="eyebrow">Streaming parse / memory stability</p>
              <p class="stream-sub">Bounded-memory iterparse (elem.clear plus ancestor pruning) vs naive full-DOM load.</p>
            </div>
            <div class="stream-readout">
              <div class="ro"><span class="ro-val" style=${{ color: "var(--parrot-green)" }}>${memModel ? memModel.projectedStreamMB : 0} MB</span><span class="ro-label">streaming peak</span></div>
              <div class="ro"><span class="ro-val" style=${{ color: "var(--parrot-red)" }}>${memModel ? memModel.projectedNaiveMB.toLocaleString() : 0} MB</span><span class="ro-label">naive peak</span></div>
              <div class="ro"><span class="ro-val">${liveRecords.toLocaleString()}</span><span class="ro-label">records ${parsing ? "in flight" : "projected"}</span></div>
            </div>
          </div>
          <${MemoryChart} model=${memModel} progress=${progress} />
          <p class="stream-disclaimer">Honest note: this visualizes the bounded-memory iterparse algorithm and projects it to a 500MB-equivalent file (${PROJECTED_RECORDS.toLocaleString()} elements). The browser parses the small shipped fixture; the production pipeline runs lxml.iterparse server-side. ${memModel && memModel.realHeapMB ? "Live JS heap: " + memModel.realHeapMB + " MB." : ""}</p>
        </section>

        <nav class="tabs">
          <button class=${"tab" + (tab === "rules" ? " active" : "")} onClick=${() => setTab("rules")}>Reconciliation rules</button>
          <button class=${"tab" + (tab === "dash" ? " active" : "")} onClick=${() => setTab("dash")}>Analytical dashboard</button>
        </nav>

        ${tab === "rules" && html`
          <section class="rules-grid">
            ${parsing && !doc && html`<p class="loading">Streaming parse in progress...</p>`}
            ${rules.map(
              (r) => html`<${RuleCard} key=${r.id} rule=${r} open=${openRule === r.id} onToggle=${() => setOpenRule(openRule === r.id ? null : r.id)} />`
            )}
          </section>
        `}

        ${tab === "dash" && html`<${Dashboard} summary=${summary} />`}

        <footer class="foot">
          <p>Demo for michaelwegter.com. Frontend-only, real logic on sample SAF-T PT fixtures. The 500MB story is modeled, not literally parsed in-tab.</p>
        </footer>
      </main>
    `;
  }

  ReactDOM.createRoot(document.getElementById("root")).render(html`<${App} />`);
})();
