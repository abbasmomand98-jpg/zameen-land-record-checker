# Zameen — Land Record & Plot Fraud Checker (UX Concept)

Buying a plot in Pakistan is a fraud minefield — fake files, double-sold
plots, housing societies selling without a valid NOC, and patwaris charging
"fees" for a fard that officially costs a few hundred rupees. Families lose
lakhs of life savings on one bad plot. Zameen is a concept app that checks a
plot before any token is paid: enter the file number and see the fard, the
owner chain, the society NOC, stay orders and mortgages in plain language —
plus the true transfer cost, a flag on any fee overcharge, and a document
checklist to collect before paying.

Live demo: https://abbasmomand98-jpg.github.io/zameen-land-record-checker/

## How it works

1. **Verify a plot.** Type a file number — try ZM-2026-214, ZM-2026-077 or
   ZM-2026-310. Plot 214 (DHA Phase 5, Block C, 1 Kanal, Lahore, asking
   Rs 2.85 crore) comes back SAFE TO PROCEED: fard issued 12 Oct 2026, owner
   chain clean across 2 previous owners, society NOC valid, no stay order,
   no bank mortgage. Plot 77 (Bahria Town Phase 8, 10 Marla, Rawalpindi,
   asking Rs 95 lakh) comes back HIGH RISK — DO NOT PAY TOKEN: the file was
   sold twice, the NOC expired in 2024, and the agent pushed a Rs 500,000
   token before any checks. Plot 310 (Askari 11, 7 Marla) is a CAUTION: the
   fard is from 14 Mar 2023, so get a fresh one first.
2. **Check the society.** Search societies and filter by city
   (Lahore, Rawalpindi, Islamabad, Karachi, Peshawar) or flagged-only.
   Bahria Town Phase 8 shows NOC expired 2024 with two fraud flags; DHA
   Lahore, Askari 11 and the rest show a valid NOC and no flags.
3. **Calculate the true cost.** Enter a DC rate and the app breaks down the
   official transfer cost: stamp duty 1%, registration 1%, CVT 2%. On the
   sample 10-marla plot (DC rate Rs 45 lakh) that is Rs 45,000 + Rs 45,000 +
   Rs 90,000 = Rs 1,80,000 — so nothing is hidden until the registry office.
4. **Flag the fee trap.** Enter the fee an agent or patwari demanded and the
   app compares it with the official fard fee of Rs 500. A demand of
   Rs 60,000 is flagged as a Rs 59,500 overcharge — pay only the official fee.
5. **Collect the documents.** A six-item checklist (fresh fard, society NOC
   copy, seller CNIC, previous registry deed, bank NOC, registry
   appointment) is saved on this device (localStorage) — nothing leaves the
   browser, and "Reset demo data" clears it.
6. **Learn the red flags.** Eight ways a plot deal goes wrong, each with a
   concrete sample example — from a file sold twice to a hidden bank
   mortgage and a stay order on the plot.

## What you can learn from this project

- **Pakistani number formatting without a library.** `logic.js` formats
  amounts the way Pakistan writes them — Rs 1,80,000, Rs 2,85,00,000 —
  with a small grouping function (last three digits together, then groups
  of two). The same pattern works for any app that shows lakh and crore
  figures.
- **Separating logic from rendering.** Every rule (plot lookup, verdict,
  cost maths, fee flagger, society filter, checklist toggle) lives in
  `logic.js` with no DOM code, so `test.js` can run it in Node and prove
  the figures before the page ever loads. `app.js` only renders what the
  logic returns.
- **State that survives a refresh.** localStorage stores one small JSON
  array (the checked document ids). Loading merges it over the sample
  data, so the demo feels real without a backend or an account.
- **Designing with honest sample data.** The demo pins "today" to
  6 Nov 2026 in `app.js` so the headline figures (fard 12 Oct 2026,
  Rs 1,80,000 official cost, Rs 59,500 overcharge) stay identical in the
  demo, the mockups, the case study and the copy — a small decision that
  keeps a whole project consistent.

## Sample-data honesty note

Zameen is an unofficial UX concept, not a legal or land-record service. All
data is sample: no real plots, file numbers, societies or people. The rates
(stamp duty 1%, registration 1%, CVT 2%, official fard fee Rs 500) are
simplified sample figures — real rates vary by province and by year, so
always confirm a plot at the registry office and with the society before
paying anything. Ahmed, 38, of Rawalpindi is an illustrative proto-persona —
a design hypothesis, not an interviewed participant.

## Try it yourself

Fork this repo, change the sample plots in `data.js`, and the verdicts, the
society list, the cost calculator and the red-flag spotter all follow
automatically. The pattern adapts to any local problem that has a record to
verify, a hidden cost to expose and a fee to question — try it for vehicle
transfers, rental agreements, or shop licences in your own city.

---

Zameen is an unofficial UX concept by Muhammad Abbas Khan.
Available for new projects: abbasmomand98@gmail.com
