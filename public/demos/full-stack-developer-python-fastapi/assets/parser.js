// parser.js
// Format detector + streaming-parse model for the Compliance Reconciliation Console.
// Pure functions, no framework dependency. Exposed on window.ReconParser.

(function () {
  "use strict";

  // Known SAF-T xmlns -> parser profile. Routing is driven by the namespace URN,
  // exactly as a production detector would do from the first bytes of the stream.
  const SCHEMA_REGISTRY = {
    "urn:OECD:StandardAuditFile-Tax:PT_1.04_01": {
      country: "Portugal",
      variant: "SAF-T PT",
      version: "1.04_01",
      parser: "saft-pt-v104",
      label: "SAF-T PT 1.04_01 (Financial, full)",
    },
    "urn:OECD:StandardAuditFile-Tax:PT_1.03_01": {
      country: "Portugal",
      variant: "SAF-T PT",
      version: "1.03_01",
      parser: "saft-pt-v103",
      label: "SAF-T PT 1.03_01 (Financial, legacy)",
    },
    "urn:StandardAuditFile-Taxation-Financial:NO": {
      country: "Norway",
      variant: "SAF-T NO",
      version: "1.10",
      parser: "saft-no-financial",
      label: "SAF-T NO Financial 1.10",
    },
  };

  // DETECTOR: read ONLY the first ~2KB and pull document type, schema version,
  // period and accounting basis from the opening tags. Mirrors a streaming read
  // that never loads the full document to identify it.
  function detectFormat(xmlText) {
    const head = xmlText.slice(0, 2048);

    const xmlnsMatch = head.match(/xmlns\s*=\s*"([^"]+)"/);
    const xmlns = xmlnsMatch ? xmlnsMatch[1] : null;

    const profile =
      (xmlns && SCHEMA_REGISTRY[xmlns]) || {
        country: "Unknown",
        variant: "Unrecognized",
        version: "?",
        parser: "generic-xml-fallback",
        label: "Unrecognized namespace (fallback parser)",
      };

    const pick = (tag) => {
      const m = head.match(new RegExp("<" + tag + ">([^<]*)</" + tag + ">"));
      return m ? m[1].trim() : null;
    };

    const basisCode = pick("TaxAccountingBasis");
    const basisLabel =
      basisCode === "F"
        ? "F (invoicing only)"
        : basisCode === "C"
        ? "C (full accounting)"
        : basisCode || "n/a";

    return {
      xmlns: xmlns,
      docType: "AuditFile",
      country: profile.country,
      variant: profile.variant,
      schemaVersion: pick("AuditFileVersion") || profile.version,
      parser: profile.parser,
      parserLabel: profile.label,
      fiscalYear: pick("FiscalYear"),
      startDate: pick("StartDate"),
      endDate: pick("EndDate"),
      accountingBasis: basisLabel,
      company: pick("CompanyName"),
      bytesInspected: Math.min(2048, xmlText.length),
    };
  }

  // PARSE: turn the fixture into normalized records the rules engine consumes.
  // Uses DOMParser (instant on a ~25KB fixture); the streaming behavior at scale
  // is modeled separately in buildMemoryModel().
  function parseDocument(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");
    if (doc.querySelector("parsererror")) {
      throw new Error("XML parse error");
    }

    const text = (el, tag) => {
      const n = el ? el.querySelector(tag) : null;
      return n ? n.textContent.trim() : null;
    };
    const num = (el, tag) => {
      const v = text(el, tag);
      return v == null ? null : parseFloat(v);
    };

    const header = doc.querySelector("Header");
    const startDate = text(header, "StartDate");
    const endDate = text(header, "EndDate");

    // Master files
    const accounts = Array.from(doc.querySelectorAll("GeneralLedgerAccounts > Account")).map(
      (a) => text(a, "AccountID")
    );
    const customers = Array.from(doc.querySelectorAll("Customers > Customer")).map((c) =>
      text(c, "CustomerID")
    );

    // GL header totals
    const gle = doc.querySelector("GeneralLedgerEntries");
    const headerTotalDebit = num(gle, "TotalDebit");
    const headerTotalCredit = num(gle, "TotalCredit");

    // Transactions + lines (flattened for the dashboard table + R02/R06/R10)
    const transactions = [];
    let sumLineDebit = 0;
    let sumLineCredit = 0;
    Array.from(doc.querySelectorAll("Journal > Transaction")).forEach((tx) => {
      const txId = text(tx, "TransactionID");
      const period = num(tx, "Period");
      const date = text(tx, "GLPostingDate") || text(tx, "TransactionDate");
      Array.from(tx.querySelectorAll("Line")).forEach((ln) => {
        const debit = num(ln, "DebitAmount") || 0;
        const credit = num(ln, "CreditAmount") || 0;
        sumLineDebit += debit;
        sumLineCredit += credit;
        transactions.push({
          txId: txId,
          accountId: text(ln, "AccountID"),
          description: text(ln, "Description"),
          period: period,
          date: date,
          debit: debit,
          credit: credit,
        });
      });
    });

    // Invoices (R03/R04/R05/R07/R09)
    const invoices = Array.from(doc.querySelectorAll("SalesInvoices > Invoice")).map((inv) => ({
      invoiceNo: text(inv, "InvoiceNo"),
      invoiceType: text(inv, "InvoiceType"),
      invoiceDate: text(inv, "InvoiceDate"),
      period: num(inv, "Period"),
      customerId: text(inv, "CustomerID"),
      netTotal: num(inv, "NetTotal"),
      taxPayable: num(inv, "TaxPayable"),
      grossTotal: num(inv, "GrossTotal"),
    }));

    return {
      startDate: startDate,
      endDate: endDate,
      accounts: accounts,
      customers: customers,
      headerTotalDebit: headerTotalDebit,
      headerTotalCredit: headerTotalCredit,
      sumLineDebit: +sumLineDebit.toFixed(2),
      sumLineCredit: +sumLineCredit.toFixed(2),
      transactions: transactions,
      invoices: invoices,
      recordCount: transactions.length + invoices.length,
    };
  }

  // MEMORY MODEL: builds the two synthetic curves used by the streaming chart.
  // This visualizes the bounded-memory iterparse ALGORITHM (elem.clear() plus
  // ancestor pruning), it does not measure real heap. Honest by design.
  //
  // streaming: peak stays bounded near a baseline regardless of record count.
  // naive:     full-DOM load climbs linearly and never releases.
  //
  // We scale the record axis up to a projected 500MB-equivalent file to make the
  // production story tangible.
  function buildMemoryModel(actualRecords, projectedRecords) {
    const BASELINE_MB = 11; // resident parser + single element window
    const PER_RECORD_NAIVE_MB = 0.04; // ~40KB retained per element in a full DOM
    const WINDOW = 50; // elements held in flight by the streaming parser

    const steps = 60;
    const streaming = [];
    const naive = [];
    for (let i = 0; i <= steps; i++) {
      const recs = Math.round((projectedRecords * i) / steps);
      const inFlight = Math.min(WINDOW, recs);
      streaming.push({
        records: recs,
        mb: +(BASELINE_MB + inFlight * 0.03 + Math.sin(i / 4) * 0.4).toFixed(2),
      });
      naive.push({
        records: recs,
        mb: +(BASELINE_MB + recs * PER_RECORD_NAIVE_MB).toFixed(2),
      });
    }

    const projectedNaiveMB = +(BASELINE_MB + projectedRecords * PER_RECORD_NAIVE_MB).toFixed(0);
    const projectedStreamMB = +(BASELINE_MB + WINDOW * 0.03).toFixed(0);

    return {
      streaming: streaming,
      naive: naive,
      actualRecords: actualRecords,
      projectedRecords: projectedRecords,
      projectedNaiveMB: projectedNaiveMB,
      projectedStreamMB: projectedStreamMB,
      // Optional real-heap overlay (Chrome-only, non-standard). Null elsewhere.
      realHeapMB:
        window.performance && window.performance.memory
          ? +(window.performance.memory.usedJSHeapSize / 1048576).toFixed(1)
          : null,
    };
  }

  window.ReconParser = {
    detectFormat: detectFormat,
    parseDocument: parseDocument,
    buildMemoryModel: buildMemoryModel,
  };
})();
