// data.js
// Deterministic 100k-row ledger dataset generator + CSV helper.
// Built lazily on first dashboard visit to avoid blocking first paint.
// Exposed on window.ReconData.

(function () {
  "use strict";

  // mulberry32 seeded PRNG for reproducible data.
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const ACCOUNTS = ["11", "21100001", "22100001", "24320000", "71100000", "62200000", "31100000"];
  const DESCS = [
    "Faturacao cliente",
    "Rendimento prestacao servicos",
    "IVA liquidado 23%",
    "Compra mercadorias",
    "Pagamento fornecedor",
    "Custo com pessoal",
    "Servicos bancarios",
  ];
  const JOURNALS = ["VD", "CP", "CG", "BO"];

  let CACHE = null;

  // Generate ~100k rows synchronously on first request (deferred by caller).
  function getDataset(target) {
    if (CACHE) return CACHE;
    const n = target || 100000;
    const rand = mulberry32(0x5a17);
    const rows = new Array(n);
    for (let i = 0; i < n; i++) {
      const isDebit = rand() < 0.5;
      const amount = +(50 + rand() * 9950).toFixed(2);
      const month = 1 + Math.floor(rand() * 12);
      const day = 1 + Math.floor(rand() * 27);
      rows[i] = {
        id: i + 1,
        txId: "2023-" + String(i + 1).padStart(6, "0"),
        journal: JOURNALS[Math.floor(rand() * JOURNALS.length)],
        accountId: ACCOUNTS[Math.floor(rand() * ACCOUNTS.length)],
        description: DESCS[Math.floor(rand() * DESCS.length)],
        period: month,
        date: "2023-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0"),
        debit: isDebit ? amount : 0,
        credit: isDebit ? 0 : amount,
        flagged: rand() < 0.012, // ~1.2% seeded anomalies for the trend chart
      };
    }
    CACHE = rows;
    return rows;
  }

  // Server-side-STYLE page slice. Mimics an API returning one page at a time.
  function getPage(rows, page, pageSize, sortKey, sortDir) {
    let view = rows;
    if (sortKey) {
      view = rows.slice().sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === "desc" ? -cmp : cmp;
      });
    }
    const startIdx = (page - 1) * pageSize;
    return {
      rows: view.slice(startIdx, startIdx + pageSize),
      total: rows.length,
      totalPages: Math.ceil(rows.length / pageSize),
      page: page,
    };
  }

  // Anomalies per period for the trend chart.
  function anomaliesByPeriod(rows) {
    const buckets = new Array(12).fill(0);
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].flagged) buckets[rows[i].period - 1]++;
    }
    return buckets;
  }

  function toCSV(rows) {
    const cols = ["id", "txId", "journal", "accountId", "description", "period", "date", "debit", "credit", "flagged"];
    const head = cols.join(",");
    const lines = rows.map((r) =>
      cols
        .map((c) => {
          const v = r[c];
          const s = String(v == null ? "" : v);
          return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        })
        .join(",")
    );
    return head + "\n" + lines.join("\n");
  }

  function downloadCSV(filename, rows) {
    const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  window.ReconData = {
    getDataset: getDataset,
    getPage: getPage,
    anomaliesByPeriod: anomaliesByPeriod,
    toCSV: toCSV,
    downloadCSV: downloadCSV,
  };
})();
