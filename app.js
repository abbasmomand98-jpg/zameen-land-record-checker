// Zameen — page wiring. All rules live in logic.js; this file only renders.
// "Today" is pinned to 2026-11-06 so the sample figures (fard issued
// 12 Oct 2026, Rs 1,80,000 official cost, Rs 59,500 overcharge) stay stable
// no matter when you open it.
(function () {
  var L = window.ZameenLogic;
  var TODAY = "2026-11-06";
  var STORE_KEY = "zameen-checklist-done";

  function el(id) { return document.getElementById(id); }
  function rs(n) { return "Rs " + L.formatPKR(n); }

  function loadDone() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function saveDone(d) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch (e) {}
  }
  var doneIds = loadDone();

  // ---- Plot / file-number lookup ----
  function renderVerdict(plot) {
    var box = el("verify-result");
    if (!plot) {
      box.innerHTML = '<div class="alert notfound"><strong>File number not found</strong>' +
        "<p>No sample plot matches that file number. Try ZM-2026-214 (safe), " +
        "ZM-2026-077 (high risk) or ZM-2026-310 (caution).</p></div>";
      return;
    }
    var v = L.verdictSummary(plot);
    var cls = v.verdict === "safe" ? "ok" : (v.verdict === "high-risk" ? "risk" : "warn");
    var html = '<div class="alert ' + cls + '"><strong>' + v.title + "</strong>" +
      "<p>" + plot.society + (plot.block ? ", " + plot.block : "") + ", " + plot.plot +
      " · " + plot.size + " · " + plot.city + " · Asking " + plot.askingLabel + "</p>" +
      "<p>Checked " + L.fmt(L.parseDate(TODAY)) + ". " + v.advice + "</p></div>";
    html += '<ul class="checks">';
    plot.checks.forEach(function (c) {
      html += '<li class="' + (c.ok ? "ok" : "bad") + '">' +
        (c.ok ? "✓ " : "⚠ ") + "<strong>" + c.label + "</strong> — " + c.detail + "</li>";
    });
    html += "</ul>";
    box.innerHTML = html;
  }

  function doVerify() {
    renderVerdict(L.lookupPlot(PLOTS, el("file-input").value));
  }
  el("verify-btn").addEventListener("click", doVerify);
  el("file-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") doVerify();
  });
  // Show the safe example on load so the page never opens empty.
  el("file-input").value = "ZM-2026-214";
  renderVerdict(L.lookupPlot(PLOTS, "ZM-2026-214"));

  // ---- Society search + city filter ----
  function renderSocieties() {
    var q = el("society-search").value.trim().toLowerCase();
    var city = el("society-city").value;
    var riskOnly = el("society-risk").checked;
    var rows = L.filterSocieties(SOCIETIES, city, riskOnly)
      .filter(function (s) { return !q || s.name.toLowerCase().indexOf(q) !== -1; });
    var box = el("society-list");
    box.innerHTML = "";
    if (!rows.length) {
      box.innerHTML = "<p>No sample societies match that filter yet.</p>";
      el("society-summary").textContent = "";
      return;
    }
    rows.forEach(function (s) {
      var div = document.createElement("div");
      var risky = s.noc !== "valid" || s.flags.length > 0;
      div.className = "society" + (risky ? " risk" : " safe");
      div.innerHTML = "<h3>" + s.name + "</h3>" +
        "<p>" + s.city + " · NOC " + (s.noc === "valid" ? "valid" : "expired " + s.noc.replace("expired ", "")) + "</p>" +
        (s.flags.length
          ? '<p class="flags">⚠ ' + s.flags.join(" · ") + "</p>"
          : '<p class="flags ok">No flags on record</p>');
      box.appendChild(div);
    });
    var riskyCount = rows.filter(function (s) { return s.noc !== "valid" || s.flags.length > 0; }).length;
    el("society-summary").textContent = rows.length + " societ" +
      (rows.length === 1 ? "y" : "ies") + " listed" +
      (riskyCount ? " — " + riskyCount + " with fraud flags." : " — all clear.");
  }
  ["All"].concat(CITIES).forEach(function (city) {
    var opt = document.createElement("option");
    opt.value = city; opt.textContent = city;
    el("society-city").appendChild(opt);
  });
  el("society-search").addEventListener("input", renderSocieties);
  el("society-city").addEventListener("change", renderSocieties);
  el("society-risk").addEventListener("change", renderSocieties);
  renderSocieties();

  // ---- True-cost calculator + fee flagger ----
  function renderCost() {
    var dc = parseInt(el("dc-rate").value, 10);
    if (isNaN(dc) || dc < 0) dc = 0;
    var c = L.costBreakdown(dc, RATES);
    el("cost-result").innerHTML =
      "<p>Stamp duty · 1% — <strong>" + rs(c.stampDuty) + "</strong></p>" +
      "<p>Registration · 1% — <strong>" + rs(c.registration) + "</strong></p>" +
      "<p>CVT · 2% — <strong>" + rs(c.cvt) + "</strong></p>" +
      '<p class="total">Total official cost — <strong>' + rs(c.total) + "</strong></p>" +
      "<p>On the sample 10-marla plot (DC rate Rs 45 lakh) that is " +
      rs(COST_EXAMPLE.stampDuty) + " + " + rs(COST_EXAMPLE.registration) +
      " + " + rs(COST_EXAMPLE.cvt) + " = <strong>" + rs(COST_EXAMPLE.total) + "</strong>.</p>";
    var demanded = parseInt(el("fee-demanded").value, 10);
    if (isNaN(demanded) || demanded < 0) demanded = 0;
    var f = L.feeOvercharge(demanded, RATES.officialFardFee);
    el("fee-result").innerHTML = f.flagged
      ? '<div class="alert risk"><strong>⚠ OVERCHARGE ' + rs(f.overcharge) + "</strong>" +
        "<p>Demanded " + rs(f.demanded) + " for a fard that officially costs " +
        rs(f.official) + ". Pay only the official fee.</p></div>"
      : '<div class="alert ok"><strong>✓ Fee looks official</strong>' +
        "<p>Demanded " + rs(f.demanded) + " — at or below the official fard fee of " +
        rs(f.official) + ".</p></div>";
  }
  el("dc-rate").addEventListener("input", renderCost);
  el("fee-demanded").addEventListener("input", renderCost);
  renderCost();

  // ---- Document checklist (persisted in localStorage) ----
  function renderChecklist() {
    var list = el("checklist");
    list.innerHTML = "";
    CHECKLIST.forEach(function (doc) {
      var li = document.createElement("li");
      var done = doneIds.indexOf(doc.id) !== -1;
      li.className = done ? "done" : "";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = done;
      cb.setAttribute("aria-label", doc.label);
      cb.addEventListener("change", function () {
        doneIds = L.toggleChecklist(doneIds, doc.id);
        saveDone(doneIds);
        renderChecklist();
      });
      var span = document.createElement("span");
      span.textContent = doc.label;
      li.appendChild(cb);
      li.appendChild(span);
      list.appendChild(li);
    });
    var p = L.checklistProgress(doneIds, CHECKLIST);
    el("checklist-progress").textContent = p.done + " of " + p.total + " documents collected.";
  }
  renderChecklist();

  // ---- Fraud red-flag spotter ----
  var rf = el("red-flags");
  REDFLAGS.forEach(function (r) {
    var li = document.createElement("li");
    li.innerHTML = "<strong>⚠ " + r.flag + "</strong> — " + r.example;
    rf.appendChild(li);
  });

  el("reset-demo").addEventListener("click", function () {
    doneIds = [];
    saveDone(doneIds);
    el("file-input").value = "ZM-2026-214";
    el("society-search").value = "";
    el("society-city").value = "All";
    el("society-risk").checked = false;
    el("dc-rate").value = String(COST_EXAMPLE.dcRate);
    el("fee-demanded").value = String(COST_EXAMPLE.feeDemanded);
    renderVerdict(L.lookupPlot(PLOTS, "ZM-2026-214"));
    renderSocieties();
    renderCost();
    renderChecklist();
  });
})();
