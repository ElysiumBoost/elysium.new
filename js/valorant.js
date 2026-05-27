(function () {
  "use strict";

  var TIERS = [
    { id: "iron", name: "Iron", color: "#5a5e63", glyph: "I", icon: "../../assets/valorant/icons/rank-iron.png" },
    { id: "bronze", name: "Bronze", color: "#8a5a3a", glyph: "B", icon: "../../assets/valorant/icons/rank-bronze.png" },
    { id: "silver", name: "Silver", color: "#a3acb1", glyph: "S", icon: "../../assets/valorant/icons/rank-silver.png" },
    { id: "gold", name: "Gold", color: "#d6a847", glyph: "G", icon: "../../assets/valorant/icons/rank-gold.png" },
    { id: "platinum", name: "Platinum", color: "#4dc3b5", glyph: "P", icon: "../../assets/valorant/icons/rank-platinum.png" },
    { id: "diamond", name: "Diamond", color: "#b794d6", glyph: "D", icon: "../../assets/valorant/icons/rank-diamond.png" },
    { id: "ascendant", name: "Ascendant", color: "#4ea568", glyph: "A", icon: "../../assets/valorant/icons/rank-ascendant.png" },
    { id: "immortal", name: "Immortal", color: "#c75059", glyph: "M", icon: "../../assets/valorant/icons/rank-immortal.png" }
  ];
  var DIVISIONS = ["I", "II", "III"];
  var RR_RANGES = ["21-40", "41-60", "61-80", "81-100"];
  var SERVERS = ["Europe", "North America", "Middle East", "Brazil", "Korea", "SEA / OCE", "Latin America"];
  var PLATFORMS = ["PC", "PlayStation", "Xbox"];
  var ADDONS = [
    { id: "stream", label: "Stream Games", desc: "Booster streams every match live.", pctMod: 0.20, badge: "+20%" },
    { id: "bonus", label: "+1 Bonus Win", desc: "One extra win in your desired division.", flat: 8, badge: "+$8" },
    { id: "offline", label: "Appear Offline", desc: "Account invisible to friends during the boost.", free: true, badge: "Free" },
    { id: "agents", label: "Specific Agents", desc: "Lock which agents the booster plays.", free: true, badge: "Free" },
    { id: "undercover", label: "Undercover Winrate", desc: "Booster caps winrate ~65%.", pctMod: 0.10, badge: "+10%" },
    { id: "express", label: "Express Priority", desc: "Jump the queue, starts within the hour.", pctMod: 0.20, badge: "+20%" }
  ];
  var REVIEWS = [
    { initials: "L.K", user: "lurik#0042", quote: "Booster played like I would on my best day. Smooth climb, no flags. Discord channel was active at 3am my time.", from: "Gold III", to: "Immortal I", days: 4 },
    { initials: "M.R", user: "mythosrev", quote: "Everything confirmed in the ticket before they touched my account. No upsells. Just the climb I paid for.", from: "Diamond II", to: "Ascendant II", days: 3 },
    { initials: "A.O", user: "avalon", quote: "Picked Specific Agents and they kept my main pool. Replays look like my normal games.", from: "Plat I", to: "Diamond II", days: 2 },
    { initials: "N.V", user: "nyx_void", quote: "Stream Games add-on was worth it — caught two clips I clipped for my friends. Pro level mechanics.", from: "Silver II", to: "Plat III", days: 5 },
    { initials: "C.S", user: "cipher.shy", quote: "Third time on Elysium. The team already knows my name when I open a ticket. Same quality every season.", from: "Asc III", to: "Immortal II", days: 4 },
    { initials: "D.H", user: "dunehollow", quote: "Asked for Undercover Winrate and the booster respected it. No 12-game streaks. Looked natural.", from: "Gold I", to: "Diamond III", days: 6 }
  ];
  var FAQS = [
    { q: "How does Valorant boosting work?", a: "Configure your current and target rank, pick add-ons, then confirm the order in Discord. A verified Immortal+ booster signs into your account (or queues with you in Duo mode) and plays manually until your target is hit." },
    { q: "Is boosting safe with Vanguard?", a: "Every booster is manual-only, on residential IPs, and follows our Vanguard-safe checklist: no shared sessions, no overlap with your active hours unless requested, no third-party tooling. 10,000+ Riot orders, zero bans." },
    { q: "Can I play with the booster?", a: "Yes. Pro Duo mode queues a verified Immortal+ booster on your team. You play your own account the entire time." },
    { q: "How long does a boost take?", a: "Most divisions complete in 12–36 hours. Diamond and above run 2–5 days. Express Priority cuts your wait to start by 80%." },
    { q: "Can I request specific agents?", a: "Absolutely — the Specific Agents add-on is free. Lock in your main pool or ban agents you'd never touch." },
    { q: "Will my friends notice?", a: "Turn on Appear Offline (free add-on) and your status stays dark for the duration. Boosters won't accept or send invites." },
    { q: "What if the booster loses a match?", a: "We work in division targets, not match counts. You only pay for the result. If a booster trends below our 75% winrate floor, we swap them out the same day." },
    { q: "Can I watch the boost live?", a: "Add Stream Games and you get a private link plus saved VODs of every match." },
    { q: "Refunds and pausing?", a: "Pause any time from your Discord ticket. Refunds are pro-rated against progress. Full refund if no work has started. Money-back guarantee if we miss our ETA by 48+ hours." },
    { q: "Are your boosters really Immortal/Radiant?", a: "Every Valorant booster is verified Immortal 3 or above. Most hold Radiant on their main. We screenshot-verify each season." }
  ];

  var state = {
    tab: "rank",
    current: { tier: "gold", div: 1 },
    target: { tier: "diamond", div: 1 },
    rrPerWin: "41-60", currentRR: "50",
    server: "Europe", platform: "PC",
    mode: "solo", addons: ["offline"]
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  function rankIndex(tier, divIdx) {
    var t = TIERS.findIndex(function (x) { return x.id === tier; });
    return t * 3 + divIdx;
  }

  function calculatePrice(s) {
    var dist = rankIndex(s.target.tier, s.target.div) - rankIndex(s.current.tier, s.current.div);
    if (dist <= 0) return 0;
    var base = 8.5;
    var price = dist * base;
    var ti = TIERS.findIndex(function (x) { return x.id === s.target.tier; });
    if (ti >= 5) price *= 1 + (ti - 4) * 0.22;
    if (s.mode === "duo") price *= 1.35;
    var rrMul = [1.30, 1.12, 1.0, 0.92][RR_RANGES.indexOf(s.rrPerWin)] || 1;
    price *= rrMul;
    if (s.platform !== "PC") price *= 1.08;
    if (["Korea", "Middle East", "Latin America"].indexOf(s.server) >= 0) price *= 1.06;
    var multAdd = 1, flatAdd = 0;
    s.addons.forEach(function (id) {
      var a = ADDONS.find(function (x) { return x.id === id; });
      if (!a) return;
      if (a.pctMod) multAdd += a.pctMod;
      if (a.flat) flatAdd += a.flat;
    });
    return Math.round((price * multAdd + flatAdd) * 100) / 100;
  }

  function estimateDays(s) {
    var dist = Math.max(1, rankIndex(s.target.tier, s.target.div) - rankIndex(s.current.tier, s.current.div));
    var base = Math.ceil(dist * 0.4);
    var rrMul = [1.4, 1.15, 1.0, 0.9][RR_RANGES.indexOf(s.rrPerWin)] || 1;
    var dMul = s.mode === "duo" ? 1.25 : 1;
    var xMul = s.addons.indexOf("express") >= 0 ? 0.55 : 1;
    var lo = Math.max(1, Math.round(base * rrMul * dMul * xMul));
    var hi = Math.max(lo + 1, Math.round(lo * 1.6));
    return [lo, hi];
  }

  function formatPrice(p) {
    var d = Math.floor(p);
    var c = String(Math.round((p - d) * 100)).padStart(2, "0");
    return "$" + d + '<span class="cents">.' + c + "</span>";
  }

  function rankTilesHtml(tiers, activeId, prefix) {
    return tiers.map(function (t) {
      var cls = t.id === activeId ? "val-rank active" : "val-rank";
      var img = t.icon ? '<img src="' + esc(t.icon) + '" alt="" loading="lazy">' : '<span class="glyph">' + esc(t.glyph) + "</span>";
      return '<button type="button" class="' + cls + '" data-' + prefix + '="' + esc(t.id) + '" aria-label="' + esc(t.name) + '" aria-pressed="' + (t.id === activeId) + '">' +
        '<div class="val-rank-icon" style="--tier-color:' + t.color + '">' + img + "</div>" +
        '<span class="val-rank-name">' + esc(t.name) + "</span></button>";
    }).join("");
  }

  function segHtml(options, activeIdx, name) {
    return '<div class="val-seg" role="group" aria-label="' + esc(name) + '">' +
      options.map(function (opt, i) {
        return '<button type="button" class="' + (i === activeIdx ? "active" : "") + '" data-seg-' + name + '="' + i + '">' + esc(opt) + "</button>";
      }).join("") + "</div>";
  }

  function chipsHtml(options, active, name) {
    return '<div class="val-chips" role="radiogroup" aria-label="' + esc(name) + '">' +
      options.map(function (s) {
        return '<button type="button" role="radio" aria-checked="' + (s === active) + '" class="val-chip ' + (s === active ? "active" : "") + '" data-chip-' + name + '="' + esc(s) + '">' + esc(s) + "</button>";
      }).join("") + "</div>";
  }

  function summaryAddonsHtml(activeAddons) {
    return '<div class="val-summary-addons">' + ADDONS.map(function (a) {
      var on = activeAddons.indexOf(a.id) >= 0;
      return '<button type="button" class="val-summary-addon ' + (on ? "active" : "") + '" data-addon="' + esc(a.id) + '" aria-pressed="' + on + '">' +
        '<span class="checkbox" aria-hidden="true"></span>' +
        "<div><span class=\"val-summary-addon-name\">" + esc(a.label) + '</span><span class="val-summary-addon-desc">' + esc(a.desc) + "</span></div>" +
        '<span class="val-summary-addon-badge ' + (a.free ? "free" : "") + '">' + esc(a.badge) + "</span></button>";
    }).join("") + "</div>";
  }

  function summaryModeHtml(mode) {
    return '<div class="val-summary-mode">' +
      '<button type="button" class="' + (mode === "solo" ? "active" : "") + '" data-mode="solo" aria-pressed="' + (mode === "solo") + '">' +
        '<span class="val-summary-mode-name">Solo</span><span class="val-summary-mode-desc">Pro plays on your account</span></button>' +
      '<button type="button" class="' + (mode === "duo" ? "active" : "") + '" data-mode="duo" aria-pressed="' + (mode === "duo") + '">' +
        '<span class="pill">With Pro</span><span class="val-summary-mode-name">Pro Duo</span><span class="val-summary-mode-desc">Queue together</span></button>' +
    "</div>";
  }

  function arrowSvg() {
    return '<svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M0 5H14M14 5L10 1M14 5L10 9" stroke="currentColor" stroke-width="1.5"/></svg>';
  }

  function renderRankConfig() {
    var mount = $("valConfigMount");
    var ci = rankIndex(state.current.tier, state.current.div);
    var ti = rankIndex(state.target.tier, state.target.div);
    var invalid = ti <= ci;
    var price = calculatePrice(state);
    var eta = estimateDays(state);
    var ct = TIERS.find(function (t) { return t.id === state.current.tier; });
    var tt = TIERS.find(function (t) { return t.id === state.target.tier; });

    mount.innerHTML =
      '<div class="val-config">' +
        '<div class="val-builder">' +
          '<div class="val-step"><div class="val-step-head"><span class="val-step-num">Step 01</span><h3 class="val-step-title">Current Rank</h3><span class="val-step-sub">Where you\'re climbing from</span></div>' +
            '<div class="val-ranks">' + rankTilesHtml(TIERS, state.current.tier, "current-tier") + "</div>" +
            '<div class="val-row"><span class="val-row-label">Division</span>' + segHtml(DIVISIONS, state.current.div, "current-div") + "</div>" +
            '<div class="val-row"><span class="val-row-label">RR per Win</span>' + segHtml(RR_RANGES, RR_RANGES.indexOf(state.rrPerWin), "rr") + "</div>" +
            '<div class="val-row"><span class="val-row-label">Current RR</span><div class="val-rr-input"><input type="number" min="0" max="100" value="' + esc(state.currentRR) + '" id="valCurrentRR" aria-label="Current RR"><span class="val-tip" title="Your progress inside the current division (0–100)">i</span></div></div>' +
          "</div>" +
          '<div class="val-step"><div class="val-step-head"><span class="val-step-num">Step 02</span><h3 class="val-step-title">Desired Rank</h3><span class="val-step-sub">Where you want to land</span></div>' +
            '<div class="val-ranks">' + rankTilesHtml(TIERS, state.target.tier, "target-tier") + "</div>" +
            '<div class="val-row"><span class="val-row-label">Division</span>' + segHtml(DIVISIONS, state.target.div, "target-div") + "</div>" +
            (invalid ? '<div class="val-warn" role="alert">⚠ Target rank must be higher than your current rank.</div>' : "") +
            '<div class="val-substep"><div class="val-substep-head"><span class="val-substep-label">Server</span><span class="val-substep-sub">Region you queue in</span></div>' + chipsHtml(SERVERS, state.server, "server") + "</div>" +
            '<div class="val-substep"><div class="val-substep-head"><span class="val-substep-label">Platform</span><span class="val-substep-sub">Where you play</span></div>' + chipsHtml(PLATFORMS, state.platform, "platform") + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="val-summary-wrap"><aside class="val-summary' + (invalid ? "" : " has-items") + '" aria-label="Order summary">' +
          '<span class="arc-hot-trace" aria-hidden="true"></span>' +
          '<div class="val-summary-head"><span class="label">Secure Order Summary</span><span class="lock"><svg width="10" height="11" viewBox="0 0 10 11" fill="none"><rect x="1.5" y="4.5" width="7" height="5.5" stroke="currentColor" stroke-width="1.1"/><path d="M3 4.5V3a2 2 0 014 0v1.5" stroke="currentColor" stroke-width="1.1"/></svg> Locked-in</span></div>' +
          '<div class="val-summary-scroll">' +
            '<div class="val-route"><div class="val-route-side"><span class="role">From</span><div class="val-rank-icon" style="--tier-color:' + ct.color + '"><img src="../../assets/valorant/icons/rank-' + ct.id + '-' + (state.current.div + 1) + '.png" alt=""></div><span class="name">' + esc(ct.name) + "<br>" + DIVISIONS[state.current.div] + '</span></div><div class="val-route-arrow">' + arrowSvg() + '</div><div class="val-route-side"><span class="role">To</span><div class="val-rank-icon" style="--tier-color:' + tt.color + '"><img src="../../assets/valorant/icons/rank-' + tt.id + '-' + (state.target.div + 1) + '.png" alt=""></div><span class="name">' + esc(tt.name) + "<br>" + DIVISIONS[state.target.div] + "</span></div></div>" +
            '<div class="val-summary-block-label">Boosting Mode</div>' + summaryModeHtml(state.mode) +
            '<div class="val-summary-block-label">Add-ons</div>' + summaryAddonsHtml(state.addons) +
          "</div>" +
          '<div class="val-summary-foot">' +
            '<div class="val-eta"><span class="k">Estimated</span><span class="v">~ ' + eta[0] + "–" + eta[1] + ' days</span></div>' +
            '<div class="val-total"><span class="k">Total</span><span class="v">' + formatPrice(price) + "</span></div>" +
            '<button type="button" class="eb-btn eb-btn-primary val-cta"' + (invalid ? ' disabled' : "") + '>Rank Up <span class="arrow">' + arrowSvg() + "</span></button>" +
            '<div class="val-trust"><span>Fast Checkout</span><span class="sep"></span><span>Verified Pros</span><span class="sep"></span><span>Money-Back</span></div>' +
          "</div>" +
        "</aside></div>" +
      "</div>";

    bindConfigEvents();
  }

  function bindConfigEvents() {
    var mount = $("valConfigMount");
    mount.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-current-tier]");
      if (btn) { state.current.tier = btn.dataset.currentTier; renderRankConfig(); return; }
      btn = e.target.closest("[data-target-tier]");
      if (btn) { state.target.tier = btn.dataset.targetTier; renderRankConfig(); return; }
      btn = e.target.closest("[data-seg-current-div]");
      if (btn) { state.current.div = parseInt(btn.dataset.segCurrentDiv); renderRankConfig(); return; }
      btn = e.target.closest("[data-seg-target-div]");
      if (btn) { state.target.div = parseInt(btn.dataset.segTargetDiv); renderRankConfig(); return; }
      btn = e.target.closest("[data-seg-rr]");
      if (btn) { state.rrPerWin = RR_RANGES[parseInt(btn.dataset.segRr)]; renderRankConfig(); return; }
      btn = e.target.closest("[data-chip-server]");
      if (btn) { state.server = btn.dataset.chipServer; renderRankConfig(); return; }
      btn = e.target.closest("[data-chip-platform]");
      if (btn) { state.platform = btn.dataset.chipPlatform; renderRankConfig(); return; }
      btn = e.target.closest("[data-mode]");
      if (btn) { state.mode = btn.dataset.mode; renderRankConfig(); return; }
      btn = e.target.closest("[data-addon]");
      if (btn) {
        var id = btn.dataset.addon;
        var idx = state.addons.indexOf(id);
        if (idx >= 0) state.addons.splice(idx, 1); else state.addons.push(id);
        renderRankConfig();
        return;
      }
    });
    var rrInput = $("valCurrentRR");
    if (rrInput) rrInput.addEventListener("input", function () { state.currentRR = rrInput.value; });
  }

  function renderComingSoon(label) {
    var mount = $("valConfigMount");
    mount.innerHTML =
      '<div class="val-coming">' +
        '<span class="val-coming-eyebrow">' + esc(label) + "</span>" +
        '<h2 class="val-coming-title">Coming Soon</h2>' +
        '<p class="val-coming-sub">This service is being configured. Join our Discord for early access and updates.</p>' +
      "</div>";
  }

  function switchTab(tabId) {
    state.tab = tabId;
    document.querySelectorAll(".val-tab").forEach(function (t) {
      var active = t.dataset.tab === tabId;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", active);
    });
    switch (tabId) {
      case "rank": renderRankConfig(); break;
      case "placements": renderComingSoon("Placements"); break;
      case "wins": renderComingSoon("Ranked Wins"); break;
      case "leveling": renderComingSoon("Account Leveling"); break;
      case "battlepass": renderComingSoon("Battle Pass"); break;
      case "coaching": renderComingSoon("Coaching"); break;
    }
    var section = $("valConfigSection");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderReviews() {
    var rail = $("valReviewsRail");
    if (!rail) return;
    rail.innerHTML = REVIEWS.map(function (r) {
      return '<article class="val-review">' +
        '<div class="val-review-head"><span class="val-avatar">' + esc(r.initials) + '</span>' +
        '<span class="val-review-user">' + esc(r.user) + '</span>' +
        '<span class="val-verified">✓ Verified</span></div>' +
        '<div class="val-review-stars">★★★★★</div>' +
        '<p class="val-review-quote">"' + esc(r.quote) + '"</p>' +
        '<div class="val-review-meta"><span class="game">VALORANT</span> · ' + esc(r.from) + " → " + esc(r.to) + " · " + r.days + " days</div>" +
      "</article>";
    }).join("");
  }

  function renderFaqs() {
    var list = $("valFaqList");
    if (!list) return;
    list.innerHTML = FAQS.map(function (f, i) {
      var num = String(i + 1).padStart(2, "0");
      return '<div class="eb-faq-row' + (i === 0 ? " eb-open" : "") + '">' +
        '<button class="eb-faq-btn" type="button"><span class="eb-faq-n">Q.' + num + '</span><span class="eb-faq-q">' + esc(f.q) + '</span><span class="eb-faq-plus">+</span></button>' +
        '<div class="eb-faq-panel"><div class="eb-faq-a"><span></span><p>' + esc(f.a) + "</p><span></span></div></div></div>";
    }).join("");
    list.addEventListener("click", function (e) {
      var btn = e.target.closest(".eb-faq-btn");
      if (!btn) return;
      var row = btn.closest(".eb-faq-row");
      if (!row) return;
      var isOpen = row.classList.contains("eb-open");
      list.querySelectorAll(".eb-faq-row.eb-open").forEach(function (r) { r.classList.remove("eb-open"); });
      if (!isOpen) row.classList.add("eb-open");
    });
  }

  function initScrollReveal() {
    var els = document.querySelectorAll(".eb-reveal");
    if (!els.length) return;
    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { els.forEach(function (el) { el.classList.add("eb-in"); }); return; }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("eb-in"); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { observer.observe(el); });
  }

  function initNavScroll() {
    var nav = $("valNav");
    if (!nav) return;
    function check() { nav.classList.toggle("eb-scrolled", window.scrollY > 40); }
    check();
    window.addEventListener("scroll", check, { passive: true });
  }

  function initTabs() {
    document.querySelectorAll(".val-tab[data-tab]").forEach(function (tab) {
      tab.addEventListener("click", function () { switchTab(tab.dataset.tab); });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavScroll();
    initScrollReveal();
    initTabs();
    renderRankConfig();
    renderReviews();
    renderFaqs();
  });
})();
