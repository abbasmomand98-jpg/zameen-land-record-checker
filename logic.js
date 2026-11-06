// Zameen — pure logic, no DOM here, so it can be unit-tested in Node.
// Dates are handled in UTC so results never shift with the viewer's timezone.
(function (root) {
  function parseDate(iso) {
    var parts = iso.split("-").map(Number);
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  }

  function iso(date) {
    function p(n) { return (n < 10 ? "0" : "") + n; }
    return date.getUTCFullYear() + "-" + p(date.getUTCMonth() + 1) + "-" + p(date.getUTCDate());
  }

  function fmt(date) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return date.getUTCDate() + " " + months[date.getUTCMonth()] + " " + date.getUTCFullYear();
  }

  function daysBetween(fromIso, toIso) {
    var msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((parseDate(toIso) - parseDate(fromIso)) / msPerDay);
  }

  // Pakistani / Indian digit grouping: 180000 -> "1,80,000",
  // 28500000 -> "2,85,00,000". Last three digits group together, then
  // groups of two — the way lakh and crore figures are written in Pakistan.
  function formatPKR(n) {
    var s = String(Math.round(n));
    if (s.length <= 3) return s;
    var last3 = s.slice(-3);
    var rest = s.slice(0, -3);
    var groups = [];
    while (rest.length > 2) {
      groups.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest) groups.unshift(rest);
    return groups.join(",") + "," + last3;
  }

  // File-number lookup: case-insensitive, ignores surrounding spaces.
  function normalizeFileId(id) {
    return String(id || "").trim().toUpperCase();
  }

  function lookupPlot(plots, id) {
    var want = normalizeFileId(id);
    if (!want) return null;
    for (var i = 0; i < plots.length; i++) {
      if (normalizeFileId(plots[i].id) === want) return plots[i];
    }
    return null;
  }

  // Verdict presentation for a plot: title + plain-language advice.
  function verdictSummary(plot) {
    if (plot.verdict === "safe") {
      return { verdict: "safe", title: "SAFE TO PROCEED",
               advice: "All checks passed. Still confirm at the registry office before paying any token." };
    }
    if (plot.verdict === "high-risk") {
      return { verdict: "high-risk", title: "HIGH RISK — DO NOT PAY TOKEN",
               advice: "Do not pay any token. Walk away or verify the file independently at the society office and the registry." };
    }
    return { verdict: "caution", title: "PROCEED WITH CAUTION",
             advice: "Get a fresh fard and confirm the old settlement deed before paying any token." };
  }

  // Fraud flags attached to a plot (empty array when the plot is clean).
  function redFlagsFor(plot) {
    return (plot && plot.flags) ? plot.flags.slice() : [];
  }

  // Transfer-cost maths from a DC rate: stamp duty 1%, registration 1%,
  // CVT 2%. Returns { stampDuty, registration, cvt, total } in PKR.
  function costBreakdown(dcRate, rates) {
    var stamp = Math.round(dcRate * rates.stampDuty);
    var reg = Math.round(dcRate * rates.registration);
    var cvt = Math.round(dcRate * rates.cvt);
    return { stampDuty: stamp, registration: reg, cvt: cvt,
             total: stamp + reg + cvt };
  }

  // Fee-overcharge flagger: what an agent/patwari demanded vs the official
  // fard fee. Overcharge is never negative — a fee at or below the official
  // fee is not flagged.
  function feeOvercharge(demanded, officialFee) {
    var over = Math.max(0, demanded - officialFee);
    return { demanded: demanded, official: officialFee,
             overcharge: over, flagged: over > 0 };
  }

  // Filter societies by city and/or risk-only (expired NOC or any flag);
  // alphabetical by name.
  function filterSocieties(societies, city, riskOnly) {
    return societies
      .filter(function (s) {
        var cityOk = city === "All" || s.city === city;
        var riskOk = !riskOnly || s.noc !== "valid" || (s.flags && s.flags.length > 0);
        return cityOk && riskOk;
      })
      .sort(function (a, b) { return a.name < b.name ? -1 : 1; });
  }

  // Document checklist: pure toggle — returns a new array, never mutates.
  function toggleChecklist(doneIds, id) {
    var next = doneIds.slice();
    var i = next.indexOf(id);
    if (i === -1) next.push(id);
    else next.splice(i, 1);
    return next;
  }

  function checklistProgress(doneIds, docs) {
    return { done: doneIds.length, total: docs.length };
  }

  var api = { parseDate: parseDate, iso: iso, fmt: fmt,
              daysBetween: daysBetween, formatPKR: formatPKR,
              normalizeFileId: normalizeFileId, lookupPlot: lookupPlot,
              verdictSummary: verdictSummary, redFlagsFor: redFlagsFor,
              costBreakdown: costBreakdown, feeOvercharge: feeOvercharge,
              filterSocieties: filterSocieties,
              toggleChecklist: toggleChecklist,
              checklistProgress: checklistProgress };
  if (typeof module !== "undefined") { module.exports = api; }
  else { root.ZameenLogic = api; }
})(typeof window !== "undefined" ? window : globalThis);
