/* Rental Cash Flow & Cap Rate Calculator
 * Vanilla JS. No dependencies. Every keystroke recomputes.
 * Formulas per research.md (verbatim). Educational tool only. Not investment advice.
 */
(function () {
  'use strict';

  /* ---------- element refs ---------- */
  var ids = [
    'purchasePrice', 'downPct', 'interestRate', 'loanTerm', 'monthlyRent', 'numUnits',
    'taxes', 'insurance', 'vacancy', 'mgmt', 'repairs', 'capex', 'hoa', 'closing'
  ];
  var el = {};
  ids.forEach(function (id) { el[id] = document.getElementById(id); });

  var out = {
    cashflowMonthly: document.getElementById('cashflowMonthly'),
    cashflowAnnual: document.getElementById('cashflowAnnual'),
    capRate: document.getElementById('capRate'),
    capRateNote: document.getElementById('capRateNote'),
    cocReturn: document.getElementById('cocReturn'),
    cocNote: document.getElementById('cocNote'),
    noi: document.getElementById('noi'),
    mCashflow: document.getElementById('m-cashflow'),
    mCoc: document.getElementById('m-coc'),
    verdict: document.getElementById('verdict'),
    verdictChip: document.getElementById('verdictChip'),
    verdictDot: document.getElementById('verdictDot'),
    verdictLabel: document.getElementById('verdictLabel'),
    verdictNote: document.getElementById('verdictNote'),
    segOpex: document.getElementById('segOpex'),
    segDebt: document.getElementById('segDebt'),
    segCash: document.getElementById('segCash'),
    legOpex: document.getElementById('legOpex'),
    legDebt: document.getElementById('legDebt'),
    legCash: document.getElementById('legCash'),
    legGross: document.getElementById('legGross'),
    rentSlider: document.getElementById('rentSlider'),
    sliderRent: document.getElementById('sliderRent'),
    sliderCash: document.getElementById('sliderCash'),
    breakevenHint: document.getElementById('breakevenHint'),
    rule1Chip: document.getElementById('rule1Chip'),
    rule1Body: document.getElementById('rule1Body'),
    rule50Chip: document.getElementById('rule50Chip'),
    rule50Body: document.getElementById('rule50Body'),
    cashNeeded: document.getElementById('cashNeeded')
  };

  /* ---------- helpers ---------- */
  function num(node) {
    if (!node) return 0;
    var v = parseFloat(node.value);
    return isFinite(v) ? v : 0;
  }
  function usd(n) {
    var sign = n < 0 ? '-' : '';
    var abs = Math.abs(Math.round(n));
    return sign + '$' + abs.toLocaleString('en-US');
  }
  function pct(n) {
    if (!isFinite(n)) return 'N/A';
    return n.toFixed(1) + '%';
  }

  /* ---------- core engine ---------- */
  /* Computes all metrics from a set of inputs. monthlyRentOverride lets the
     sensitivity slider sweep rent without mutating the input field. */
  function compute(inputs, monthlyRentOverride) {
    var purchasePrice = inputs.purchasePrice;
    var downPct = inputs.downPct / 100;
    var rateAnnual = inputs.interestRate / 100;
    var termYears = inputs.loanTerm;
    var units = inputs.numUnits > 0 ? inputs.numUnits : 1;
    var monthlyRent = (monthlyRentOverride != null) ? monthlyRentOverride : inputs.monthlyRent;
    var vacancyRate = inputs.vacancy / 100;
    var mgmtRate = inputs.mgmt / 100;
    var repairsRate = inputs.repairs / 100;
    var capexRate = inputs.capex / 100;
    var hoa = inputs.hoa;
    var closingRate = inputs.closing / 100;

    // Income (GSI / EGI)
    var gsiMonthly = monthlyRent * units;
    var gsiAnnual = gsiMonthly * 12;
    var egi = gsiAnnual * (1 - vacancyRate);

    // Operating expenses (mgmt is % of EGI; repairs/capex are % of GSI)
    var mgmtFee = egi * mgmtRate;
    var repairs = gsiAnnual * repairsRate;
    var capex = gsiAnnual * capexRate;
    var totalOpex = inputs.taxes + inputs.insurance + mgmtFee + repairs + capex + hoa;

    // NOI
    var noi = egi - totalOpex;

    // Cap rate (guard divide-by-zero on purchase price)
    var capRate = purchasePrice > 0 ? (noi / purchasePrice) * 100 : 0;

    // Mortgage P&I
    var loanPrincipal = purchasePrice * (1 - downPct);
    var r = rateAnnual / 12;
    var n = termYears * 12;
    var monthlyPI = 0;
    if (n > 0) {
      if (r === 0) {
        monthlyPI = loanPrincipal / n;
      } else {
        var factor = Math.pow(1 + r, n);
        monthlyPI = loanPrincipal * (r * factor) / (factor - 1);
      }
    }
    var annualDebtService = monthlyPI * 12;

    // Cash flow
    var annualCashFlow = noi - annualDebtService;
    var monthlyCashFlow = annualCashFlow / 12;

    // Cash to close & cash-on-cash
    var downPayment = purchasePrice * downPct;
    var closingCosts = purchasePrice * closingRate;
    var totalCashInvested = downPayment + closingCosts;
    var coc = totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : 0;

    return {
      gsiAnnual: gsiAnnual,
      egi: egi,
      totalOpex: totalOpex,
      noi: noi,
      capRate: capRate,
      monthlyPI: monthlyPI,
      annualDebtService: annualDebtService,
      annualCashFlow: annualCashFlow,
      monthlyCashFlow: monthlyCashFlow,
      cashFlowPerDoor: monthlyCashFlow / units,
      downPayment: downPayment,
      closingCosts: closingCosts,
      totalCashInvested: totalCashInvested,
      coc: coc,
      units: units,
      purchasePrice: purchasePrice,
      monthlyRent: monthlyRent
    };
  }

  function readInputs() {
    return {
      purchasePrice: num(el.purchasePrice),
      downPct: num(el.downPct),
      interestRate: num(el.interestRate),
      loanTerm: num(el.loanTerm),
      monthlyRent: num(el.monthlyRent),
      numUnits: num(el.numUnits),
      taxes: num(el.taxes),
      insurance: num(el.insurance),
      vacancy: num(el.vacancy),
      mgmt: num(el.mgmt),
      repairs: num(el.repairs),
      capex: num(el.capex),
      hoa: num(el.hoa),
      closing: num(el.closing)
    };
  }

  /* ---------- verdict heuristics (research §4) ---------- */
  function metricClass(metric, value) {
    if (metric === 'cap') {
      if (value >= 7) return ['Strong', 'green'];
      if (value >= 5) return ['Acceptable', 'mustard'];
      if (value >= 4) return ['Thin', 'cyan'];
      return ['Weak', 'red'];
    }
    if (metric === 'coc') {
      if (value >= 8) return ['Strong', 'green'];
      if (value >= 5) return ['Acceptable', 'mustard'];
      if (value >= 1) return ['Thin', 'cyan'];
      return ['Weak / Avoid', 'red'];
    }
    if (metric === 'cashPerDoor') {
      if (value >= 300) return ['Strong', 'green'];
      if (value >= 100) return ['Acceptable', 'mustard'];
      if (value >= 0) return ['Thin', 'cyan'];
      return ['Negative', 'red'];
    }
    return ['', 'muted'];
  }

  function overallVerdict(m) {
    var perDoor = m.cashFlowPerDoor;
    if (m.capRate >= 6 && m.coc >= 6 && perDoor >= 200) {
      return ['Strong Deal', 'green', 'Cap rate, cash-on-cash, and per-door cash flow all clear the strong thresholds. Still verify the assumptions on a real listing.'];
    }
    if (m.capRate >= 4.5 && m.coc >= 3 && perDoor >= 0) {
      return ['Acceptable Deal', 'mustard', 'The fundamentals hold up. Returns are workable rather than exceptional, so the margin for error is modest.'];
    }
    if (m.monthlyCashFlow >= 0) {
      return ['Thin Deal', 'cyan', 'It cash flows, but the cap rate or cash-on-cash is below a comfortable margin. A small rent or rate change could flip it.'];
    }
    return ['Negative Cash Flow', 'red', 'At these inputs the property loses money each month. Try a lower price, more rent, or a larger down payment to see what closes the gap.'];
  }

  var COLOR_CLASSES = ['green', 'mustard', 'cyan', 'red', 'muted'];

  function setColor(node, color, prefix) {
    COLOR_CLASSES.forEach(function (c) { node.classList.remove(prefix + c); });
    node.classList.add(prefix + color);
  }

  /* ---------- breakeven rent (for sensitivity hint) ---------- */
  /* Cash flow is linear in rent, so solve from two sample points. */
  function breakevenRent(inputs) {
    var a = compute(inputs, 1000);
    var b = compute(inputs, 3000);
    var slope = (b.monthlyCashFlow - a.monthlyCashFlow) / (3000 - 1000);
    if (slope === 0) return null;
    // monthlyCashFlow(rent) = a.monthlyCashFlow + slope * (rent - 1000)
    var rent = 1000 + (0 - a.monthlyCashFlow) / slope;
    return rent;
  }

  /* ---------- render ---------- */
  function render() {
    var inputs = readInputs();
    var m = compute(inputs);

    // Metrics
    out.cashflowMonthly.textContent = usd(m.monthlyCashFlow) + '/mo';
    out.cashflowMonthly.classList.toggle('pos', m.monthlyCashFlow >= 0);
    out.cashflowMonthly.classList.toggle('neg', m.monthlyCashFlow < 0);
    out.cashflowAnnual.textContent = usd(m.annualCashFlow) + ' / yr';

    out.capRate.textContent = pct(m.capRate);
    var capV = metricClass('cap', m.capRate);
    out.capRateNote.textContent = capV[0];

    out.cocReturn.textContent = pct(m.coc);
    out.cocReturn.classList.toggle('pos', m.coc >= 0);
    out.cocReturn.classList.toggle('neg', m.coc < 0);
    var cocV = metricClass('coc', m.coc);
    out.cocNote.textContent = cocV[0];

    out.noi.textContent = usd(m.noi);

    // Verdict
    var v = overallVerdict(m);
    out.verdictLabel.textContent = v[0];
    out.verdictNote.textContent = v[2];
    setColor(out.verdictChip, v[1], 'v-');
    setColor(out.verdictDot, v[1], 'v-');
    setColor(out.verdict, v[1], 'b-');

    // Breakdown bar (proportions of gross income)
    var gross = m.gsiAnnual > 0 ? m.gsiAnnual : 1;
    var opexPct = Math.max(0, Math.min(100, (m.totalOpex / gross) * 100));
    var debtPct = Math.max(0, Math.min(100, (m.annualDebtService / gross) * 100));
    var cashPct = Math.max(0, Math.min(100, (Math.abs(m.annualCashFlow) / gross) * 100));
    // keep total <= 100 for the positive case; for negative cash flow the bar
    // shows opex + debt filling (and possibly overflowing into the negative).
    out.segOpex.style.width = opexPct + '%';
    out.segDebt.style.width = debtPct + '%';
    if (m.annualCashFlow >= 0) {
      out.segCash.style.width = cashPct + '%';
      out.segCash.classList.add('seg-cash-pos');
      out.segCash.classList.remove('seg-cash-neg');
      out.segCash.title = 'Cash flow';
    } else {
      // negative: show a red sliver representing the shortfall, capped
      out.segCash.style.width = Math.min(cashPct, 100 - Math.min(100, opexPct + debtPct)) + '%';
      out.segCash.classList.remove('seg-cash-pos');
      out.segCash.classList.add('seg-cash-neg');
      out.segCash.title = 'Cash flow shortfall';
    }

    out.legOpex.textContent = usd(m.totalOpex);
    out.legDebt.textContent = usd(m.annualDebtService);
    out.legCash.textContent = usd(m.annualCashFlow);
    out.legGross.textContent = usd(m.gsiAnnual);

    // Cash to close
    out.cashNeeded.innerHTML = 'Total cash to close: <b>' + usd(m.totalCashInvested) +
      '</b> &nbsp;(' + usd(m.downPayment) + ' down + ' + usd(m.closingCosts) +
      ' closing). Monthly P&amp;I: <b>' + usd(m.monthlyPI) + '</b>.';

    // 1% rule
    var onePctTarget = m.purchasePrice * 0.01;
    var passes1 = m.monthlyRent >= onePctTarget;
    out.rule1Chip.textContent = passes1 ? 'Passes 1%' : 'Fails 1%';
    out.rule1Chip.classList.toggle('pass', passes1);
    out.rule1Chip.classList.toggle('fail', !passes1);
    var ratio = m.purchasePrice > 0 ? (m.monthlyRent / m.purchasePrice) * 100 : 0;
    out.rule1Body.textContent = 'Rent is ' + ratio.toFixed(2) + '% of price (target ' +
      usd(onePctTarget) + '/mo). A quick screen only; it ignores every expense.';

    // 50% rule
    var noi50 = m.gsiAnnual * 0.50;
    var cf50 = noi50 - m.annualDebtService;
    var divergence = noi50 !== 0 ? Math.abs(m.noi - noi50) / noi50 : 0;
    var warn50 = divergence > 0.25;
    out.rule50Chip.textContent = warn50 ? '50% rule: check' : '50% rule: in line';
    out.rule50Chip.classList.toggle('warn', warn50);
    out.rule50Body.textContent = 'The 50%-rule estimate puts cash flow near ' +
      usd(cf50 / 12) + '/mo. Your detailed NOI ' +
      (warn50 ? 'diverges over 25% from it, so double-check the expense inputs.'
              : 'lines up with it.');

    // Sensitivity slider sync + readout
    syncSlider(inputs);
  }

  /* ---------- sensitivity slider ---------- */
  function syncSlider(inputs) {
    // keep slider centered on current rent if user has not grabbed it
    if (document.activeElement !== out.rentSlider) {
      out.rentSlider.value = String(inputs.monthlyRent);
    }
    updateSliderReadout(inputs);
  }

  function updateSliderReadout(inputs) {
    var rent = parseFloat(out.rentSlider.value) || 0;
    var m = compute(inputs, rent);
    out.sliderRent.textContent = usd(rent);
    out.sliderCash.textContent = usd(m.monthlyCashFlow);
    out.sliderCash.classList.toggle('pos', m.monthlyCashFlow >= 0);
    out.sliderCash.classList.toggle('neg', m.monthlyCashFlow < 0);

    var be = breakevenRent(inputs);
    if (be != null && isFinite(be) && be > 0) {
      out.breakevenHint.textContent = 'Break-even rent (cash flow = $0) is about ' +
        usd(be) + '/mo at the current price and financing.';
    } else {
      out.breakevenHint.textContent = '';
    }
  }

  /* ---------- wiring ---------- */
  ids.forEach(function (id) {
    if (el[id]) el[id].addEventListener('input', render);
  });
  out.rentSlider.addEventListener('input', function () {
    updateSliderReadout(readInputs());
  });

  // initial paint
  render();
})();
