// Zameen smoke tests — run with: node test.js
// Every canonical figure used in the mockups, slides and copy is asserted here.
var assert = require("assert");
var data = require("./data.js");
var L = require("./logic.js");

var TODAY = "2026-11-06"; // pinned demo "today", same as app.js
var safe = data.PLOTS[0];
var risky = data.PLOTS[1];
var caution = data.PLOTS[2];
var n = 0;

function eq(a, b, msg) { assert.strictEqual(a, b, msg); n++; }
function ok(v, msg) { assert.ok(v, msg); n++; }
function deep(a, b, msg) { assert.deepStrictEqual(a, b, msg); n++; }

// 1. SAFE lookup: ZM-2026-214, DHA Phase 5, Block C, Plot 214, 1 Kanal, Lahore.
eq(L.lookupPlot(data.PLOTS, "ZM-2026-214"), safe, "lookup finds the safe plot by id");
eq(L.lookupPlot(data.PLOTS, "zm-2026-214"), safe, "lookup is case-insensitive");
eq(L.lookupPlot(data.PLOTS, "  ZM-2026-214  "), safe, "lookup ignores surrounding spaces");
eq(safe.verdict, "safe", "Plot 214 verdict is safe");
eq(L.verdictSummary(safe).title, "SAFE TO PROCEED", "safe verdict title");
eq(safe.fardIssued, "12 Oct 2026", "fard issued 12 Oct 2026");
eq(safe.previousOwners, 2, "owner chain has 2 previous owners");
eq(safe.noc, "valid", "society NOC valid");
eq(safe.stayOrder, false, "no stay order");
eq(safe.mortgage, false, "no bank mortgage");
eq(safe.asking, 28500000, "asking price Rs 2.85 crore in PKR");
eq(safe.askingLabel, "Rs 2.85 crore", "asking label");
eq(safe.checks.length, 5, "safe plot lists 5 checks");
ok(safe.checks.every(function (c) { return c.ok; }), "every check on the safe plot passes");
deep(L.redFlagsFor(safe), [], "safe plot has no fraud flags");

// 2. HIGH RISK lookup: ZM-2026-077, Bahria Town Phase 8, Plot 77, 10 Marla, Rawalpindi.
eq(L.lookupPlot(data.PLOTS, "ZM-2026-077"), risky, "lookup finds the high-risk plot by id");
eq(risky.verdict, "high-risk", "Plot 77 verdict is high-risk");
eq(L.verdictSummary(risky).title, "HIGH RISK — DO NOT PAY TOKEN", "high-risk verdict title");
eq(risky.noc, "expired 2024", "NOC expired 2024");
eq(risky.asking, 9500000, "asking price Rs 95 lakh in PKR");
eq(risky.askingLabel, "Rs 95 lakh", "asking label");
eq(risky.flags.length, 3, "high-risk plot carries 3 flags");
ok(risky.flags[0].indexOf("TWICE") !== -1, "first flag is the double-sold file");
ok(risky.flags.some(function (f) { return f.indexOf("500,000") !== -1; }),
   "one flag is the Rs 500,000 token pressure");
eq(L.redFlagsFor(risky).length, 3, "redFlagsFor returns the 3 flags");

// 3. CAUTION lookup: ZM-2026-310, Askari 11, Plot 310, 7 Marla, Rawalpindi.
eq(L.lookupPlot(data.PLOTS, "ZM-2026-310"), caution, "lookup finds the caution plot by id");
eq(caution.verdict, "caution", "Plot 310 verdict is caution");
eq(L.verdictSummary(caution).title, "PROCEED WITH CAUTION", "caution verdict title");
eq(caution.fardIssued, "14 Mar 2023", "caution plot fard is from 14 Mar 2023");

// 4. Not found: unknown, empty and blank file numbers.
eq(L.lookupPlot(data.PLOTS, "ZM-2026-999"), null, "unknown file number returns null");
eq(L.lookupPlot(data.PLOTS, ""), null, "empty file number returns null");
eq(L.lookupPlot(data.PLOTS, "   "), null, "blank file number returns null");
eq(L.lookupPlot(data.PLOTS, null), null, "null file number returns null");

// 5. Cost maths: 10 Marla, DC rate Rs 45 lakh -> 45,000 + 45,000 + 90,000 = 1,80,000.
var c = L.costBreakdown(4500000, data.RATES);
eq(c.stampDuty, 45000, "stamp duty 1% of Rs 45 lakh is Rs 45,000");
eq(c.registration, 45000, "registration 1% of Rs 45 lakh is Rs 45,000");
eq(c.cvt, 90000, "CVT 2% of Rs 45 lakh is Rs 90,000");
eq(c.total, 180000, "total official cost is Rs 1,80,000");
eq(c.stampDuty + c.registration + c.cvt, c.total, "parts sum to the total");
eq(data.COST_EXAMPLE.stampDuty, 45000, "canonical stamp duty matches");
eq(data.COST_EXAMPLE.registration, 45000, "canonical registration matches");
eq(data.COST_EXAMPLE.cvt, 90000, "canonical CVT matches");
eq(data.COST_EXAMPLE.total, 180000, "canonical total matches");
var c2 = L.costBreakdown(10000000, data.RATES);
eq(c2.total, 400000, "Rs 1 crore DC rate costs Rs 4,00,000 in total");
deep(L.costBreakdown(0, data.RATES),
     { stampDuty: 0, registration: 0, cvt: 0, total: 0 }, "zero DC rate costs zero");

// 6. Fee-overcharge flagger: Rs 60,000 demanded vs Rs 500 official.
var f = L.feeOvercharge(60000, data.RATES.officialFardFee);
eq(f.overcharge, 59500, "overcharge is Rs 59,500");
eq(f.flagged, true, "Rs 60,000 demanded is flagged");
eq(data.COST_EXAMPLE.overcharge, 59500, "canonical overcharge matches");
eq(data.RATES.officialFardFee, 500, "official fard fee is Rs 500");
var f2 = L.feeOvercharge(500, data.RATES.officialFardFee);
eq(f2.overcharge, 0, "exact official fee has no overcharge");
eq(f2.flagged, false, "exact official fee is not flagged");
var f3 = L.feeOvercharge(400, data.RATES.officialFardFee);
eq(f3.overcharge, 0, "a fee below official never goes negative");
eq(f3.flagged, false, "a fee below official is not flagged");

// 7. Pakistani digit grouping.
eq(L.formatPKR(180000), "1,80,000", "Rs 1,80,000 groups as lakh-style");
eq(L.formatPKR(45000), "45,000", "Rs 45,000");
eq(L.formatPKR(90000), "90,000", "Rs 90,000");
eq(L.formatPKR(59500), "59,500", "Rs 59,500");
eq(L.formatPKR(28500000), "2,85,00,000", "Rs 2.85 crore groups as crore-style");
eq(L.formatPKR(9500000), "95,00,000", "Rs 95 lakh");
eq(L.formatPKR(500), "500", "Rs 500 needs no separator");
eq(L.formatPKR(6200000), "62,00,000", "Rs 62 lakh");

// 8. Society filter: city + risk-only.
var lahore = L.filterSocieties(data.SOCIETIES, "Lahore", false);
eq(lahore.length, 2, "Lahore has 2 sample societies");
ok(lahore.every(function (s) { return s.noc === "valid"; }), "both Lahore societies are clear");
eq(L.filterSocieties(data.SOCIETIES, "Rawalpindi", false).length, 2, "Rawalpindi has 2 societies");
var riskyOnly = L.filterSocieties(data.SOCIETIES, "All", true);
eq(riskyOnly.length, 2, "risk-only filter returns exactly the 2 flagged societies");
eq(riskyOnly[0].name, "Bahria Town Phase 8", "risk-only list starts with Bahria Town Phase 8");
eq(L.filterSocieties(data.SOCIETIES, "All", false).length, 8, "all cities list 8 societies");
eq(L.filterSocieties(data.SOCIETIES, "Karachi", false).length, 1, "Karachi has 1 society");
eq(L.filterSocieties(data.SOCIETIES, "Peshawar", true).length, 0, "Peshawar has no flagged society");

// 9. Checklist toggle is pure and progress counts.
var start = ["fard", "noc"];
var added = L.toggleChecklist(start, "cnic");
deep(added, ["fard", "noc", "cnic"], "toggle adds a missing document");
deep(start, ["fard", "noc"], "toggle never mutates the original list");
deep(L.toggleChecklist(start, "fard"), ["noc"], "toggle removes a collected document");
deep(L.checklistProgress(["fard", "noc"], data.CHECKLIST), { done: 2, total: 6 },
     "progress is 2 of 6 documents");
deep(L.checklistProgress([], data.CHECKLIST), { done: 0, total: 6 }, "progress starts at 0 of 6");
eq(data.CHECKLIST.length, 6, "checklist has 6 documents");

// 10. Dates: the safe plot's fard is 25 days old on demo "today".
eq(L.daysBetween("2026-10-12", TODAY), 25, "fard issued 12 Oct 2026 is 25 days old on 6 Nov 2026");
eq(L.fmt(L.parseDate("2026-10-12")), "12 Oct 2026", "fard date formats as 12 Oct 2026");
eq(L.fmt(L.parseDate(TODAY)), "6 Nov 2026", "demo today formats as 6 Nov 2026");

// 11. Red-flag spotter content.
eq(data.REDFLAGS.length, 8, "spotter lists 8 red flags");
ok(data.REDFLAGS.some(function (r) { return r.flag === "File sold twice"; }),
   "spotter includes the double-sold flag");
ok(data.REDFLAGS.every(function (r) { return r.example.length > 10; }),
   "every red flag carries a concrete example");

console.log("\n" + n + " assertions passed.");
