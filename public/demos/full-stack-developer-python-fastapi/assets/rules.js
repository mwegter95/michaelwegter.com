// rules.js
// Reconciliation rules engine. 10 named rules over a parsed SAF-T document.
// Each rule returns { status, count, detail, offenders } where offenders is the
// drill-down row set. Thresholds are configurable from the UI and can flip a
// warn into a fail. Exposed on window.ReconRules.

(function () {
  "use strict";

  const PASS = "pass";
  const WARN = "warn";
  const FAIL = "fail";

  const abs = Math.abs;

  // Each rule: { id, name, checks, threshold:{label,unit,min,max,step,default}, run(doc, t) }
  // run() receives the parsed doc and the current threshold value t.
  const RULES = [
    {
      id: "R01",
      name: "Debit / Credit Balance",
      checks: "GeneralLedgerEntries TotalDebit equals TotalCredit",
      threshold: { label: "Rounding tolerance", unit: "EUR", min: 0, max: 1, step: 0.01, default: 0.01 },
      run(doc, t) {
        const delta = abs((doc.headerTotalDebit || 0) - (doc.headerTotalCredit || 0));
        const status = delta === 0 ? PASS : delta <= t ? WARN : FAIL;
        return {
          status: status,
          count: delta === 0 ? 0 : 1,
          detail: "Header debit " + fmt(doc.headerTotalDebit) + " vs credit " + fmt(doc.headerTotalCredit) + " (delta " + fmt(delta) + ").",
          offenders: delta === 0 ? [] : [{ field: "TotalDebit", value: fmt(doc.headerTotalDebit), expected: fmt(doc.headerTotalCredit), delta: fmt(delta) }],
        };
      },
    },
    {
      id: "R02",
      name: "Control Total vs Sum of Lines",
      checks: "Header totals match the summed transaction lines",
      threshold: { label: "Tolerance", unit: "EUR", min: 0, max: 5, step: 0.01, default: 0.01 },
      run(doc, t) {
        const dDelta = abs((doc.headerTotalDebit || 0) - doc.sumLineDebit);
        const cDelta = abs((doc.headerTotalCredit || 0) - doc.sumLineCredit);
        const worst = Math.max(dDelta, cDelta);
        const status = worst <= t ? PASS : worst <= t * 100 ? WARN : FAIL;
        return {
          status: status,
          count: worst <= t ? 0 : 1,
          detail: "Computed line debit " + fmt(doc.sumLineDebit) + " / credit " + fmt(doc.sumLineCredit) + " vs header.",
          offenders:
            worst <= t
              ? []
              : [
                  { field: "DebitTotal", value: fmt(doc.sumLineDebit), expected: fmt(doc.headerTotalDebit), delta: fmt(dDelta) },
                  { field: "CreditTotal", value: fmt(doc.sumLineCredit), expected: fmt(doc.headerTotalCredit), delta: fmt(cDelta) },
                ],
        };
      },
    },
    {
      id: "R03",
      name: "VAT Totals Reconciliation",
      checks: "Sum of invoice TaxPayable matches VAT ledger postings (acct 2432*)",
      threshold: { label: "Fail above", unit: "EUR", min: 1, max: 50, step: 1, default: 10 },
      run(doc, t) {
        const invoiceVat = doc.invoices.reduce((s, i) => s + (i.taxPayable || 0), 0);
        const ledgerVat = doc.transactions
          .filter((tx) => (tx.accountId || "").startsWith("2432"))
          .reduce((s, tx) => s + (tx.credit || 0), 0);
        const delta = abs(invoiceVat - ledgerVat);
        const status = delta <= 1 ? PASS : delta <= t ? WARN : FAIL;
        return {
          status: status,
          count: delta <= 1 ? 0 : 1,
          detail: "Invoice VAT " + fmt(invoiceVat) + " vs ledger VAT " + fmt(ledgerVat) + " (delta " + fmt(delta) + ").",
          offenders:
            delta <= 1
              ? []
              : [{ field: "VAT reconciliation", value: "invoices " + fmt(invoiceVat), expected: "ledger " + fmt(ledgerVat), delta: fmt(delta) }],
        };
      },
    },
    {
      id: "R04",
      name: "Invoice Sequence Gaps",
      checks: "InvoiceNo values are sequential within each series",
      threshold: { label: "Max allowed gap", unit: "nums", min: 0, max: 5, step: 1, default: 1 },
      run(doc, t) {
        const offenders = [];
        const bySeries = {};
        doc.invoices.forEach((inv) => {
          const m = (inv.invoiceNo || "").match(/^(\D*\d+\/)(\d+)$/);
          if (!m) return;
          const series = inv.invoiceType + " " + m[1];
          (bySeries[series] = bySeries[series] || []).push({ n: parseInt(m[2], 10), no: inv.invoiceNo });
        });
        Object.keys(bySeries).forEach((series) => {
          const nums = bySeries[series].sort((a, b) => a.n - b.n);
          for (let i = 1; i < nums.length; i++) {
            const gap = nums[i].n - nums[i - 1].n - 1;
            if (gap > 0) {
              offenders.push({ field: series, value: nums[i - 1].no + " -> " + nums[i].no, expected: "consecutive", delta: gap + " missing" });
            }
          }
        });
        const maxGap = offenders.reduce((m, o) => Math.max(m, parseInt(o.delta, 10) || 0), 0);
        const status = offenders.length === 0 ? PASS : maxGap <= t ? WARN : FAIL;
        return { status: status, count: offenders.length, detail: offenders.length + " sequence break(s) found.", offenders: offenders };
      },
    },
    {
      id: "R05",
      name: "Duplicate Invoice Numbers",
      checks: "InvoiceNo unique within each InvoiceType series",
      threshold: { label: "Duplicates allowed", unit: "count", min: 0, max: 3, step: 1, default: 0 },
      run(doc, t) {
        const seen = {};
        const offenders = [];
        doc.invoices.forEach((inv) => {
          const key = inv.invoiceType + "|" + inv.invoiceNo;
          if (seen[key]) offenders.push({ field: inv.invoiceType, value: inv.invoiceNo, expected: "unique", delta: "duplicate" });
          seen[key] = true;
        });
        const status = offenders.length <= t ? (offenders.length === 0 ? PASS : WARN) : FAIL;
        return { status: status, count: offenders.length, detail: offenders.length + " duplicate invoice number(s).", offenders: offenders };
      },
    },
    {
      id: "R06",
      name: "Period Boundary Check",
      checks: "Document dates fall within Header StartDate..EndDate",
      threshold: { label: "Out-of-period allowed", unit: "count", min: 0, max: 5, step: 1, default: 0 },
      run(doc, t) {
        const start = doc.startDate, end = doc.endDate;
        const offenders = [];
        doc.invoices.forEach((inv) => {
          if (inv.invoiceDate && (inv.invoiceDate < start || inv.invoiceDate > end)) {
            offenders.push({ field: inv.invoiceNo, value: inv.invoiceDate, expected: start + ".." + end, delta: "out of period" });
          }
        });
        const status = offenders.length <= t ? (offenders.length === 0 ? PASS : WARN) : FAIL;
        return { status: status, count: offenders.length, detail: offenders.length + " out-of-period document(s).", offenders: offenders };
      },
    },
    {
      id: "R07",
      name: "DocumentTotals Cross-Check",
      checks: "GrossTotal equals NetTotal plus TaxPayable per invoice",
      threshold: { label: "Tolerance", unit: "EUR", min: 0, max: 2, step: 0.01, default: 0.01 },
      run(doc, t) {
        const offenders = [];
        doc.invoices.forEach((inv) => {
          const expected = (inv.netTotal || 0) + (inv.taxPayable || 0);
          const delta = abs((inv.grossTotal || 0) - expected);
          if (delta > t) {
            offenders.push({ field: inv.invoiceNo, value: "gross " + fmt(inv.grossTotal), expected: "net+tax " + fmt(expected), delta: fmt(delta) });
          }
        });
        const status = offenders.length === 0 ? PASS : FAIL;
        return { status: status, count: offenders.length, detail: offenders.length + " invoice total mismatch(es).", offenders: offenders };
      },
    },
    {
      id: "R08",
      name: "Cancelled Invoice Linkage",
      checks: "Each credit note (NC) references a valid originating invoice",
      threshold: { label: "Missing refs allowed", unit: "count", min: 0, max: 5, step: 1, default: 0 },
      run(doc, t) {
        const offenders = doc.invoices
          .filter((i) => i.invoiceType === "NC" && !i.references)
          .map((i) => ({ field: i.invoiceNo, value: "no <References>", expected: "linked original", delta: "missing" }));
        const status = offenders.length <= t ? (offenders.length === 0 ? PASS : WARN) : FAIL;
        return { status: status, count: offenders.length, detail: offenders.length === 0 ? "No credit notes present or all linked." : offenders.length + " unlinked credit note(s).", offenders: offenders };
      },
    },
    {
      id: "R09",
      name: "Customer ID Integrity",
      checks: "Every invoice CustomerID exists in MasterFiles.Customers",
      threshold: { label: "Orphans allowed", unit: "count", min: 0, max: 3, step: 1, default: 0 },
      run(doc, t) {
        const known = new Set(doc.customers);
        const offenders = doc.invoices
          .filter((i) => i.customerId && !known.has(i.customerId))
          .map((i) => ({ field: i.invoiceNo, value: i.customerId, expected: "in MasterFiles", delta: "orphan" }));
        const status = offenders.length <= t ? (offenders.length === 0 ? PASS : WARN) : FAIL;
        return { status: status, count: offenders.length, detail: offenders.length + " orphan CustomerID reference(s).", offenders: offenders };
      },
    },
    {
      id: "R10",
      name: "Ledger Account Completeness",
      checks: "Every Line AccountID exists in MasterFiles.GeneralLedgerAccounts",
      threshold: { label: "Escalate to fail above", unit: "count", min: 1, max: 10, step: 1, default: 5 },
      run(doc, t) {
        const known = new Set(doc.accounts);
        const missing = {};
        doc.transactions.forEach((tx) => {
          if (tx.accountId && !known.has(tx.accountId)) missing[tx.accountId] = (missing[tx.accountId] || 0) + 1;
        });
        const offenders = Object.keys(missing).map((a) => ({ field: a, value: missing[a] + " line(s)", expected: "in chart of accounts", delta: "missing" }));
        const status = offenders.length === 0 ? PASS : offenders.length <= t ? WARN : FAIL;
        return { status: status, count: offenders.length, detail: offenders.length + " unknown ledger account(s).", offenders: offenders };
      },
    },
  ];

  function fmt(n) {
    if (n == null || isNaN(n)) return "n/a";
    return Number(n).toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function defaultThresholds() {
    const t = {};
    RULES.forEach((r) => (t[r.id] = r.threshold.default));
    return t;
  }

  function evaluate(doc, thresholds) {
    const th = thresholds || defaultThresholds();
    return RULES.map((r) => {
      const res = r.run(doc, th[r.id]);
      return {
        id: r.id,
        name: r.name,
        checks: r.checks,
        threshold: r.threshold,
        thresholdValue: th[r.id],
        status: res.status,
        count: res.count,
        detail: res.detail,
        offenders: res.offenders,
      };
    });
  }

  window.ReconRules = {
    RULES: RULES,
    evaluate: evaluate,
    defaultThresholds: defaultThresholds,
    PASS: PASS,
    WARN: WARN,
    FAIL: FAIL,
  };
})();
