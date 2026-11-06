// Zameen — Land Record & Plot Fraud Checker (UX Concept).
// IMPORTANT: every plot, file number, society and figure below is SAMPLE
// data invented for this UX concept demo. No real plot, file number, or
// person appears anywhere. Zameen is an unofficial concept, not a legal or
// land-record service: always confirm a plot at the registry office and
// with the society before paying anything.

// Canonical sample plots — the same figures appear in the mockups, the case
// study slides and the copy pack.
var PLOTS = [
  {
    id: "ZM-2026-214",
    society: "DHA Phase 5", block: "Block C", plot: "Plot 214",
    size: "1 Kanal", city: "Lahore",
    asking: 28500000, askingLabel: "Rs 2.85 crore",
    fardIssued: "12 Oct 2026", previousOwners: 2,
    noc: "valid", stayOrder: false, mortgage: false,
    verdict: "safe",
    checks: [
      { label: "Fard-e-Malkiat", detail: "Issued 12 Oct 2026 — matches the seller", ok: true },
      { label: "Owner chain", detail: "Clean — 2 previous owners, no dispute", ok: true },
      { label: "Society NOC", detail: "Valid — DHA Lahore, in date", ok: true },
      { label: "Stay order", detail: "None on record", ok: true },
      { label: "Bank mortgage", detail: "None — plot is clear", ok: true }
    ],
    flags: []
  },
  {
    id: "ZM-2026-077",
    society: "Bahria Town Phase 8", block: "", plot: "Plot 77",
    size: "10 Marla", city: "Rawalpindi",
    asking: 9500000, askingLabel: "Rs 95 lakh",
    fardIssued: null, previousOwners: null,
    noc: "expired 2024", stayOrder: false, mortgage: null,
    verdict: "high-risk",
    checks: [
      { label: "File sold TWICE", detail: "Two buyers hold the same file number", ok: false },
      { label: "Society NOC", detail: "Expired 2024 — not renewed", ok: false },
      { label: "Token pressure", detail: "Agent pushed Rs 500,000 before checks", ok: false }
    ],
    flags: [
      "File sold TWICE — two buyers hold the same file number",
      "Society NOC expired 2024 — not renewed",
      "Agent pushed a Rs 500,000 token before any checks"
    ]
  },
  {
    id: "ZM-2026-310",
    society: "Askari 11", block: "Sector C", plot: "Plot 310",
    size: "7 Marla", city: "Rawalpindi",
    asking: 6200000, askingLabel: "Rs 62 lakh",
    fardIssued: "14 Mar 2023", previousOwners: 1,
    noc: "valid", stayOrder: false, mortgage: false,
    verdict: "caution",
    checks: [
      { label: "Fard-e-Malkiat", detail: "Issued 14 Mar 2023 — old, get a fresh one", ok: false },
      { label: "Owner chain", detail: "1 previous owner; old dispute settled 2025", ok: true },
      { label: "Society NOC", detail: "Valid — Askari 11, in date", ok: true },
      { label: "Stay order", detail: "None on record", ok: true },
      { label: "Bank mortgage", detail: "None — plot is clear", ok: true }
    ],
    flags: [
      "Fard is from 14 Mar 2023 — get a fresh fard before paying",
      "One old ownership dispute was settled in 2025 — confirm the settlement deed"
    ]
  }
];

// Housing societies (sample listings). "noc" is "valid" or "expired YYYY".
var SOCIETIES = [
  { name: "DHA Lahore", city: "Lahore", noc: "valid", flags: [] },
  { name: "Lake City", city: "Lahore", noc: "valid", flags: [] },
  { name: "Bahria Town Phase 8", city: "Rawalpindi", noc: "expired 2024",
    flags: ["Double-sold files reported", "NOC expired 2024"] },
  { name: "Askari 11", city: "Rawalpindi", noc: "valid", flags: [] },
  { name: "Gulberg Greens", city: "Islamabad", noc: "valid", flags: [] },
  { name: "CDA Sector I-14", city: "Islamabad", noc: "expired 2023",
    flags: ["NOC expired 2023"] },
  { name: "Bahria Town Karachi", city: "Karachi", noc: "valid", flags: [] },
  { name: "Hayatabad Phase 2", city: "Peshawar", noc: "valid", flags: [] }
];

// Transfer-cost rates (sample, Punjab-style): stamp duty 1%, registration
// 1%, CVT 2% of the DC rate. The official fard fee is Rs 500.
var RATES = {
  stampDuty: 0.01,
  registration: 0.01,
  cvt: 0.02,
  officialFardFee: 500
};

// The canonical cost example: 10 Marla plot, DC rate Rs 45 lakh.
var COST_EXAMPLE = {
  size: "10 Marla", dcRate: 4500000, dcRateLabel: "Rs 45 lakh",
  stampDuty: 45000, registration: 45000, cvt: 90000, total: 180000,
  feeDemanded: 60000, overcharge: 59500
};

// Fraud red flags every buyer should know — each with a sample example.
var REDFLAGS = [
  { flag: "File sold twice", example: "Plot 77, Bahria Town Phase 8 — two buyers hold the same file number." },
  { flag: "Society NOC expired", example: "Bahria Town Phase 8 — NOC expired 2024, not renewed." },
  { flag: "Token pressure before checks", example: "Agent pushed a Rs 500,000 token before any verification." },
  { flag: "Fard older than 6 months", example: "Plot 310, Askari 11 — fard from 14 Mar 2023. Get a fresh one." },
  { flag: "Seller cannot show the original fard", example: "Only a photocopy, or 'the file is with the agent'." },
  { flag: "Price far below the market", example: "A Rs 95 lakh plot offered at Rs 60 lakh to rush a token." },
  { flag: "Hidden bank mortgage", example: "Plot mortgaged to a bank — the NOC from the bank is missing." },
  { flag: "Stay order on the plot", example: "A court stay order means the plot cannot legally transfer." }
];

// Documents to collect before paying any token.
var CHECKLIST = [
  { id: "fard", label: "Fard-e-Malkiat (fresh, under 6 months old)" },
  { id: "noc", label: "Society NOC copy — in date" },
  { id: "cnic", label: "Seller CNIC copy" },
  { id: "deed", label: "Previous registry / transfer deed" },
  { id: "bank-noc", label: "Bank NOC — no mortgage on the plot" },
  { id: "registry", label: "Registry appointment booked" }
];

var CITIES = ["Lahore", "Rawalpindi", "Islamabad", "Karachi", "Peshawar"];

if (typeof module !== "undefined") {
  module.exports = { PLOTS: PLOTS, SOCIETIES: SOCIETIES, RATES: RATES,
    COST_EXAMPLE: COST_EXAMPLE, REDFLAGS: REDFLAGS, CHECKLIST: CHECKLIST,
    CITIES: CITIES };
}
