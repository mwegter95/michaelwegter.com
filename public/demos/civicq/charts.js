/* charts.js — coded data visualizations for CivicQ (no chart library, no
   images, no third-party embeds). Two real charts:
   1. renderScoringChart()  — six-dimension weighted scoring chart (SVG)
   2. renderFundsChart()    — $75,000 funds breakdown (SVG + labeled legend)
   Both expose a visually-hidden data table fallback for screen readers and
   are keyboard operable (each row/segment is a focusable, activatable group). */

(function (global) {
  "use strict";

  var SCORING_DIMENSIONS = [
    { name: "Source Verification", weight: 25, color: "var(--chart-1)", note: "Every record must trace to a primary government or official source document before it is published." },
    { name: "Vote Record Accuracy", weight: 20, color: "var(--chart-2)", note: "Roll-call votes are cross-checked against the official legislative record, not secondhand summaries." },
    { name: "Bill Activity Completeness", weight: 18, color: "var(--chart-3)", note: "Tracks a bill through every stage, introduction, committee, floor action, and outcome, with no stages skipped." },
    { name: "Statement Sourcing", weight: 15, color: "var(--chart-4)", note: "Public statements are quoted and dated from an original recording, transcript, or press release." },
    { name: "Update Timeliness", weight: 12, color: "var(--chart-5)", note: "Measures how quickly a record reflects a real-world change, such as a new vote or bill status." },
    { name: "Methodology Transparency", weight: 10, color: "var(--chart-6)", note: "The scoring rules themselves are published in full, including this weighting, with no hidden criteria." }
  ];

  var FUNDS_BREAKDOWN = [
    { label: "Platform Engineering & Data Pipeline", amount: 30000, color: "var(--chart-1)" },
    { label: "Source Verification & Fact-Checking Staff", amount: 18000, color: "var(--chart-2)" },
    { label: "Hosting, Security & Compliance", amount: 10000, color: "var(--chart-3)" },
    { label: "Design & Accessibility Audit", amount: 8000, color: "var(--chart-4)" },
    { label: "Outreach & Organization Partnerships", amount: 6000, color: "var(--chart-5)" },
    { label: "Contingency Reserve", amount: 3000, color: "var(--chart-6)" }
  ];
  var FUNDS_TOTAL = FUNDS_BREAKDOWN.reduce(function (s, d) { return s + d.amount; }, 0); // 75000

  function fmtUSD(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function prefersReducedMotion() {
    return global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // ── Scoring chart ────────────────────────────────────────────────────────
  function renderScoringChart(mountEl, opts) {
    opts = opts || {};
    var dims = opts.dimensions || SCORING_DIMENSIONS;
    var trackW = 560;
    var rowH = 54;
    var labelColW = 0; // labels sit above each bar, not in a fixed left column
    var width = 760;
    var height = dims.length * rowH + 10;
    var maxWeight = Math.max.apply(null, dims.map(function (d) { return d.weight; }));

    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    svg.setAttribute("class", "scoring-svg");
    svg.setAttribute("role", "group");
    svg.setAttribute("aria-label", "Six-dimension weighted scoring chart");

    var reduced = prefersReducedMotion();

    dims.forEach(function (d, i) {
      var y = i * rowH;
      var barW = (d.weight / maxWeight) * trackW;
      var g = document.createElementNS(svgNS, "g");
      g.setAttribute("class", "score-row");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", d.name + ", weighted " + d.weight + " percent. " + d.note);
      g.setAttribute("data-index", i);

      var label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", 0);
      label.setAttribute("y", y + 16);
      label.setAttribute("class", "score-label");
      label.textContent = d.name;
      g.appendChild(label);

      var value = document.createElementNS(svgNS, "text");
      value.setAttribute("x", width);
      value.setAttribute("y", y + 16);
      value.setAttribute("text-anchor", "end");
      value.setAttribute("class", "score-value tabular");
      value.textContent = d.weight + "%";
      g.appendChild(value);

      var track = document.createElementNS(svgNS, "rect");
      track.setAttribute("x", 0);
      track.setAttribute("y", y + 26);
      track.setAttribute("width", trackW);
      track.setAttribute("height", 16);
      track.setAttribute("rx", 8);
      track.setAttribute("class", "bar-track");
      g.appendChild(track);

      var fill = document.createElementNS(svgNS, "rect");
      fill.setAttribute("x", 0);
      fill.setAttribute("y", y + 26);
      fill.setAttribute("height", 16);
      fill.setAttribute("rx", 8);
      fill.setAttribute("class", "bar-fill");
      fill.setAttribute("fill", d.color);
      fill.setAttribute("width", reduced ? barW : 0);
      g.appendChild(fill);

      svg.appendChild(g);

      // animate draw-in once visible, unless reduced motion is requested
      if (!reduced) {
        g.__targetWidth = barW;
      }
    });

    mountEl.innerHTML = "";
    mountEl.appendChild(svg);

    // tooltip + activation
    var tooltip = mountEl.parentElement.querySelector("[data-chart-tooltip]");
    function describe(i) {
      var d = dims[i];
      if (!tooltip) return;
      tooltip.innerHTML = "<strong>" + d.name + " — " + d.weight + "%</strong><br>" + d.note;
    }
    svg.querySelectorAll(".score-row").forEach(function (row, i) {
      row.addEventListener("pointerenter", function () { describe(i); row.classList.add("is-active"); });
      row.addEventListener("focus", function () { describe(i); row.classList.add("is-active"); });
      row.addEventListener("pointerleave", function () { row.classList.remove("is-active"); });
      row.addEventListener("blur", function () { row.classList.remove("is-active"); });
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); describe(i); }
      });
      row.addEventListener("click", function () { describe(i); });
    });

    // visually-hidden data table fallback for screen readers
    var fallback = mountEl.parentElement.querySelector("[data-chart-fallback]");
    if (fallback) {
      var rows = dims.map(function (d) {
        return "<tr><th scope=\"row\">" + d.name + "</th><td>" + d.weight + "%</td><td>" + d.note + "</td></tr>";
      }).join("");
      fallback.innerHTML =
        "<table><caption class=\"sr-only\">Six-dimension scoring weights, full data</caption>" +
        "<thead><tr><th scope=\"col\">Dimension</th><th scope=\"col\">Weight</th><th scope=\"col\">What it measures</th></tr></thead>" +
        "<tbody>" + rows + "</tbody></table>";
    }

    return svg;
  }

  function animateScoringChart(svg) {
    if (prefersReducedMotion()) return;
    var fills = svg.querySelectorAll(".bar-fill");
    var rows = svg.querySelectorAll(".score-row");
    fills.forEach(function (fill, i) {
      var target = rows[i] && rows[i].__targetWidth;
      if (target == null) return;
      requestAnimationFrame(function () {
        fill.style.transition = "width 0.9s cubic-bezier(.2,.8,.2,1) " + (i * 70) + "ms";
        fill.setAttribute("width", target);
      });
    });
  }

  // ── Funds breakdown chart ────────────────────────────────────────────────
  function renderFundsChart(barEl, legendEl, fallbackEl) {
    var segments = FUNDS_BREAKDOWN;
    barEl.innerHTML = "";
    barEl.setAttribute("role", "img");
    barEl.setAttribute(
      "aria-label",
      "Funds breakdown bar. Total " + fmtUSD(FUNDS_TOTAL) + ". " +
      segments.map(function (s) { return s.label + ": " + fmtUSD(s.amount); }).join(", ")
    );

    segments.forEach(function (s) {
      var pct = (s.amount / FUNDS_TOTAL) * 100;
      var seg = document.createElement("span");
      seg.className = "funds-bar-seg";
      seg.style.width = pct + "%";
      seg.style.background = s.color;
      barEl.appendChild(seg);
    });

    if (legendEl) {
      legendEl.innerHTML = segments.map(function (s) {
        var pct = ((s.amount / FUNDS_TOTAL) * 100).toFixed(1);
        return (
          "<div class=\"funds-legend-item\">" +
          "<span class=\"funds-swatch\" style=\"background:" + s.color + "\" aria-hidden=\"true\"></span>" +
          "<span><strong class=\"tabular\">" + fmtUSD(s.amount) + "</strong> " + s.label +
          " <span class=\"pct tabular\">(" + pct + "%)</span></span>" +
          "</div>"
        );
      }).join("");
    }

    if (fallbackEl) {
      var rows = segments.map(function (s) {
        var pct = ((s.amount / FUNDS_TOTAL) * 100).toFixed(1);
        return "<tr><th scope=\"row\">" + s.label + "</th><td>" + fmtUSD(s.amount) + "</td><td>" + pct + "%</td></tr>";
      }).join("");
      fallbackEl.innerHTML =
        "<table><caption class=\"sr-only\">$75,000 funds breakdown, full data</caption>" +
        "<thead><tr><th scope=\"col\">Category</th><th scope=\"col\">Amount</th><th scope=\"col\">Percent</th></tr></thead>" +
        "<tbody>" + rows + "<tr><th scope=\"row\">Total</th><td>" + fmtUSD(FUNDS_TOTAL) + "</td><td>100%</td></tr></tbody></table>";
    }
  }

  global.CivicQCharts = {
    SCORING_DIMENSIONS: SCORING_DIMENSIONS,
    FUNDS_BREAKDOWN: FUNDS_BREAKDOWN,
    FUNDS_TOTAL: FUNDS_TOTAL,
    fmtUSD: fmtUSD,
    renderScoringChart: renderScoringChart,
    animateScoringChart: animateScoringChart,
    renderFundsChart: renderFundsChart
  };
})(window);
