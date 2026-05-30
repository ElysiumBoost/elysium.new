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
  var PLACEMENT_TIERS = TIERS.concat([
    { id: "radiant", name: "Radiant", color: "#fff5b3", glyph: "R", icon: "../../assets/valorant/icons/rank-radiant.png" }
  ]);
  var COACHING_FOCI = [
    { id: "vod", name: "VOD Review", desc: "Coach reviews your demos and pulls timestamped notes on positioning, util, and decision points." },
    { id: "live", name: "Live Coaching", desc: "Voice + screen-share session. Coach watches you queue and corrects in real time between rounds." },
    { id: "copilot", name: "Co-Pilot Coaching", desc: "Coach duos with you, live-callouts on every round, plus a debrief at the end of each match." }
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
    { q: "How does Valorant boosting work?", a: "Configure your current and target rank, pick add-ons, then complete checkout via our secure on-site checkout. A verified Immortal+ booster signs into your account (or queues with you in Duo mode) and plays manually until your target is hit." },
    { q: "Is boosting safe with Vanguard?", a: "Every booster is manual-only, on residential IPs, and follows our Vanguard-safe checklist: no shared sessions, no overlap with your active hours unless requested, no third-party tooling. 10,000+ Riot orders, zero bans." },
    { q: "Can I play with the booster?", a: "Yes. Pro Duo mode queues a verified Immortal+ booster on your team. You play your own account the entire time." },
    { q: "How long does a boost take?", a: "Most divisions complete in 12–36 hours. Diamond and above run 2–5 days. Express Priority cuts your wait to start by 80%." },
    { q: "Can I request specific agents?", a: "Absolutely — the Specific Agents add-on is free. Lock in your main pool or ban agents you'd never touch." },
    { q: "Will my friends notice?", a: "Turn on Appear Offline (free add-on) and your status stays dark for the duration. Boosters won't accept or send invites." },
    { q: "What if the booster loses a match?", a: "We work in division targets, not match counts. You only pay for the result. If a booster trends below our 75% winrate floor, we swap them out the same day." },
    { q: "Can I watch the boost live?", a: "Add Stream Games and you get a private link plus saved VODs of every match." },
    { q: "Refunds and pausing?", a: "Pause any time from your dashboard. Refunds are pro-rated against progress. Full refund if no work has started. Money-back guarantee if we miss our ETA by 48+ hours." },
    { q: "Are your boosters really Immortal/Radiant?", a: "Every Valorant booster is verified Immortal 3 or above. Most hold Radiant on their main. We screenshot-verify each season." }
  ];

  var state = {
    tab: "rank",
    current: { tier: "gold", div: 1 },
    target: { tier: "diamond", div: 1 },
    rrPerWin: "41-60", currentRR: "50",
    server: "Europe", platform: "PC",
    mode: "solo", addons: ["offline"],
    pl: { tier: "gold", div: 1, server: "North America", platform: "PC", games: 5, mode: "solo", addons: { stream: false, offline: false, agents: false, express: true } },
    rw: { tier: "gold", div: 1, rrPerWin: 22, wins: 5, server: "North America", platform: "PC", mode: "solo", addons: { stream: false, offline: false, agents: false, undercover: false, express: true } },
    lv: { current: 1, desired: 20, server: "North America", platform: "PC", addons: { priority: false, agents: false, schedule: false, offline: false } },
    bp: { current: 1, desired: 55, server: "North America", platform: "PC", addons: { priority: false, agents: false, schedule: false, offline: false } },
    co: { hours: 1, focus: "vod", server: "North America", platform: "PC" }
  };

  var PLACEMENT_PRICES = {
    'fresh':      [3.24,  6.48,  9.72,  12.96,  16.20],
    'iron':       [1.78,  3.56,  5.34,   7.12,   8.90],
    'bronze':     [2.03,  4.06,  6.09,   8.12,  10.15],
    'silver':     [2.43,  4.86,  7.29,   9.72,  12.15],
    'gold':       [2.84,  5.68,  8.52,  11.36,  14.20],
    'platinum':   [3.24,  6.48,  9.72,  12.96,  16.20],
    'diamond':    [4.25,  8.50, 12.75,  17.00,  21.25],
    'ascendant':  [6.08, 12.16, 18.24,  24.32,  30.40],
    'immortal-1': [8.91, 17.82, 26.73,  35.64,  44.55],
    'immortal-2': [12.96, 25.92, 38.88, 51.84,  64.80],
    'immortal-3': [17.82, 35.64, 53.46, 71.28,  89.10],
    'radiant':    [32.40, 64.80, 97.20, 129.60, 162.00]
  };

  function calcPlacementsPrice(s) {
    var key = s.tier === 'immortal' ? 'immortal-' + (s.div + 1) : s.tier;
    var prices = PLACEMENT_PRICES[key] || PLACEMENT_PRICES['gold'];
    var price = prices[Math.min(s.games - 1, 4)];
    if (s.mode === "duo") price *= 1.30;
    if (s.platform !== "PC") price *= 1.08;
    if (["Korea", "Middle East", "Latin America"].indexOf(s.server) >= 0) price *= 1.06;
    var mult = 1;
    if (s.addons.stream) mult += 0.20;
    if (s.addons.express) mult += 0.20;
    return Math.round(price * 100) / 100;
  }
  function placementsETA(games, addons) {
    var base = Math.max(0, Math.ceil(games / 5));
    var lo = addons.express ? Math.max(0, base - 1) : base;
    return [lo, lo + 1];
  }
  var RANKED_WINS_PRICES = {
    'iron-1': 2.48, 'iron-2': 2.48, 'iron-3': 2.48,
    'bronze-1': 2.48, 'bronze-2': 2.48, 'bronze-3': 2.48,
    'silver-1': 2.97, 'silver-2': 3.06, 'silver-3': 3.15,
    'gold-1': 3.60, 'gold-2': 4.05, 'gold-3': 4.95,
    'platinum-1': 5.40, 'platinum-2': 6.30, 'platinum-3': 7.20,
    'diamond-1': 8.55, 'diamond-2': 10.80, 'diamond-3': 12.60,
    'ascendant-1': 18.00, 'ascendant-2': 23.40, 'ascendant-3': 28.80,
    'immortal-1': 36.00, 'immortal-2': 52.92, 'immortal-3': 57.33,
    'radiant-1': 57.33
  };
  function calcWinsPrice(s) {
    var key = s.tier + '-' + (s.div + 1);
    var perWin = RANKED_WINS_PRICES[key] || 2.48;
    var price = perWin * s.wins;
    if (s.mode === "duo") price *= 1.30;
    if (s.platform !== "PC") price *= 1.08;
    if (["Korea", "Middle East", "Latin America"].indexOf(s.server) >= 0) price *= 1.06;
    var mult = 1;
    if (s.addons.stream) mult += 0.20;
    if (s.addons.undercover) mult += 0.10;
    if (s.addons.express) mult += 0.20;
    return Math.round(price * mult * 100) / 100;
  }
  function winsETA(wins, addons) {
    var base = Math.max(1, Math.ceil(wins / 4));
    var lo = addons.express ? Math.max(1, base - 1) : base;
    return [lo, lo + 1];
  }
  function calcLevelPrice(s, perLevel) {
    var levels = Math.max(0, s.desired - s.current);
    var price = perLevel * levels;
    if (s.platform !== "PC") price *= 1.08;
    if (["Korea", "Middle East", "Latin America"].indexOf(s.server) >= 0) price *= 1.06;
    var mult = 1;
    if (s.addons.priority) mult += 0.20;
    if (s.addons.agents) mult += 0.10;
    return Math.round(price * mult * 100) / 100;
  }
  function levelETA(levels, addons, perDay) {
    var base = Math.max(1, Math.ceil(levels / perDay));
    var lo = addons.priority ? Math.max(1, base - 1) : base;
    return [lo, lo + 1];
  }

  function $(id) { return document.getElementById(id); }
  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  /* ════════════════════════════════════════════════════════════════
     PHASE 1 — VALORANT FREEZE FIX (root cause)
     ----------------------------------------------------------------
     Symptom: page becomes unresponsive when toggling add-ons / using
     controls.

     Root cause (three compounding issues, NOT an infinite loop):
       1. Cross-tab handler bleed. bindTabEvents() assigns onclick +
          onchange + oninput on #valConfigMount, but bindConfigEvents()
          (rank tab) only reassigned onclick — leaving a previous tab's
          onchange/oninput closures live on the same element after a
          tab switch.
       2. Synchronous render storm. Every control re-ran a full
          innerHTML rebuild of the configurator + summary (8–9 <img>
          rank tiles + route images, no intrinsic size) synchronously
          on the main thread. Rapid clicks queued many blocking
          re-layouts back to back.
       3. No coalescing/debounce on change/input-driven recalcs.

     Fix (JS only, zero layout change):
       - scheduleRender(): coalesce click-driven re-renders into one
         requestAnimationFrame tick (instant feel, no storm).
       - debounce(): 250ms throttle for input/select/range-driven
         price recalculations.
       - bindConfigEvents() now clears onchange/oninput so a stale tab
         handler can never fire on the rank tab.
     ════════════════════════════════════════════════════════════════ */
  function debounce(fn, ms) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms || 250);
    };
  }
  var _rafPending = false, _rafFn = null;
  function scheduleRender(fn) {
    _rafFn = fn;
    if (_rafPending) return;
    _rafPending = true;
    requestAnimationFrame(function () {
      _rafPending = false;
      var f = _rafFn; _rafFn = null;
      if (typeof f === "function") f();
    });
  }

  function rankIndex(tier, divIdx) {
    var t = TIERS.findIndex(function (x) { return x.id === tier; });
    return t * 3 + divIdx;
  }

  var RANK_BOOST_PRICES = {
    'iron-1':     {'iron-2':4,'iron-3':8,'bronze-1':13,'bronze-2':18,'bronze-3':24,'silver-1':31,'silver-2':39,'silver-3':48,'gold-1':58,'gold-2':68,'gold-3':79,'platinum-1':91,'platinum-2':104,'platinum-3':119,'diamond-1':139,'diamond-2':164,'diamond-3':197,'ascendant-1':236,'ascendant-2':281,'ascendant-3':336,'immortal-1':401,'immortal-2':491,'immortal-3':611},
    'iron-2':     {'iron-3':4,'bronze-1':9,'bronze-2':14,'bronze-3':20,'silver-1':27,'silver-2':35,'silver-3':44,'gold-1':54,'gold-2':64,'gold-3':75,'platinum-1':87,'platinum-2':100,'platinum-3':115,'diamond-1':135,'diamond-2':160,'diamond-3':193,'ascendant-1':232,'ascendant-2':277,'ascendant-3':332,'immortal-1':397,'immortal-2':487,'immortal-3':607},
    'iron-3':     {'bronze-1':5,'bronze-2':10,'bronze-3':16,'silver-1':23,'silver-2':31,'silver-3':40,'gold-1':50,'gold-2':60,'gold-3':71,'platinum-1':83,'platinum-2':96,'platinum-3':111,'diamond-1':131,'diamond-2':156,'diamond-3':189,'ascendant-1':228,'ascendant-2':273,'ascendant-3':328,'immortal-1':393,'immortal-2':483,'immortal-3':603},
    'bronze-1':   {'bronze-2':5,'bronze-3':11,'silver-1':18,'silver-2':26,'silver-3':35,'gold-1':45,'gold-2':55,'gold-3':66,'platinum-1':78,'platinum-2':91,'platinum-3':106,'diamond-1':126,'diamond-2':151,'diamond-3':184,'ascendant-1':223,'ascendant-2':268,'ascendant-3':323,'immortal-1':388,'immortal-2':478,'immortal-3':598},
    'bronze-2':   {'bronze-3':6,'silver-1':13,'silver-2':21,'silver-3':30,'gold-1':40,'gold-2':50,'gold-3':61,'platinum-1':73,'platinum-2':86,'platinum-3':101,'diamond-1':121,'diamond-2':146,'diamond-3':179,'ascendant-1':218,'ascendant-2':263,'ascendant-3':318,'immortal-1':383,'immortal-2':473,'immortal-3':593},
    'bronze-3':   {'silver-1':7,'silver-2':15,'silver-3':24,'gold-1':34,'gold-2':44,'gold-3':55,'platinum-1':67,'platinum-2':80,'platinum-3':95,'diamond-1':115,'diamond-2':140,'diamond-3':173,'ascendant-1':212,'ascendant-2':257,'ascendant-3':312,'immortal-1':377,'immortal-2':467,'immortal-3':587},
    'silver-1':   {'silver-2':8,'silver-3':17,'gold-1':27,'gold-2':37,'gold-3':48,'platinum-1':60,'platinum-2':73,'platinum-3':88,'diamond-1':108,'diamond-2':133,'diamond-3':166,'ascendant-1':205,'ascendant-2':250,'ascendant-3':305,'immortal-1':370,'immortal-2':460,'immortal-3':580},
    'silver-2':   {'silver-3':9,'gold-1':19,'gold-2':29,'gold-3':40,'platinum-1':52,'platinum-2':65,'platinum-3':80,'diamond-1':100,'diamond-2':125,'diamond-3':158,'ascendant-1':197,'ascendant-2':242,'ascendant-3':297,'immortal-1':362,'immortal-2':452,'immortal-3':572},
    'silver-3':   {'gold-1':10,'gold-2':20,'gold-3':31,'platinum-1':43,'platinum-2':56,'platinum-3':71,'diamond-1':91,'diamond-2':116,'diamond-3':149,'ascendant-1':188,'ascendant-2':233,'ascendant-3':288,'immortal-1':353,'immortal-2':443,'immortal-3':563},
    'gold-1':     {'gold-2':10,'gold-3':21,'platinum-1':33,'platinum-2':46,'platinum-3':61,'diamond-1':81,'diamond-2':106,'diamond-3':139,'ascendant-1':178,'ascendant-2':223,'ascendant-3':278,'immortal-1':343,'immortal-2':433,'immortal-3':553},
    'gold-2':     {'gold-3':11,'platinum-1':23,'platinum-2':36,'platinum-3':51,'diamond-1':71,'diamond-2':96,'diamond-3':129,'ascendant-1':168,'ascendant-2':213,'ascendant-3':268,'immortal-1':333,'immortal-2':423,'immortal-3':543},
    'gold-3':     {'platinum-1':12,'platinum-2':25,'platinum-3':40,'diamond-1':60,'diamond-2':85,'diamond-3':118,'ascendant-1':157,'ascendant-2':202,'ascendant-3':257,'immortal-1':322,'immortal-2':412,'immortal-3':532},
    'platinum-1': {'platinum-2':13,'platinum-3':28,'diamond-1':48,'diamond-2':73,'diamond-3':106,'ascendant-1':145,'ascendant-2':190,'ascendant-3':245,'immortal-1':310,'immortal-2':400,'immortal-3':520},
    'platinum-2': {'platinum-3':15,'diamond-1':35,'diamond-2':60,'diamond-3':93,'ascendant-1':132,'ascendant-2':177,'ascendant-3':232,'immortal-1':297,'immortal-2':387,'immortal-3':507},
    'platinum-3': {'diamond-1':20,'diamond-2':45,'diamond-3':78,'ascendant-1':117,'ascendant-2':162,'ascendant-3':217,'immortal-1':282,'immortal-2':372,'immortal-3':492},
    'diamond-1':  {'diamond-2':25,'diamond-3':58,'ascendant-1':97,'ascendant-2':142,'ascendant-3':197,'immortal-1':262,'immortal-2':352,'immortal-3':472},
    'diamond-2':  {'diamond-3':33,'ascendant-1':72,'ascendant-2':117,'ascendant-3':172,'immortal-1':237,'immortal-2':327,'immortal-3':447},
    'diamond-3':  {'ascendant-1':39,'ascendant-2':84,'ascendant-3':139,'immortal-1':204,'immortal-2':294,'immortal-3':414},
    'ascendant-1':{'ascendant-2':45,'ascendant-3':100,'immortal-1':165,'immortal-2':255,'immortal-3':375},
    'ascendant-2':{'ascendant-3':55,'immortal-1':120,'immortal-2':210,'immortal-3':330},
    'ascendant-3':{'immortal-1':65,'immortal-2':155,'immortal-3':275},
    'immortal-1': {'immortal-2':90,'immortal-3':210},
    'immortal-2': {'immortal-3':120}
  };

  function calculatePrice(s) {
    var fromKey = s.current.tier + '-' + (s.current.div + 1);
    var toKey   = s.target.tier  + '-' + (s.target.div  + 1);
    var row = RANK_BOOST_PRICES[fromKey];
    var price = (row && row[toKey]) || 0;
    if (price <= 0) return 0;
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
    // Prices are computed/stored in USD; display in the selected currency
    // via the shared currency module (falls back to USD if absent).
    var cur = window.elysiumCurrency || { rate: 1, symbol: "$" };
    var v = p * (cur.rate || 1);
    var d = Math.floor(v);
    var c = String(Math.round((v - d) * 100)).padStart(2, "0");
    return (cur.symbol || "$") + d + '<span class="cents">.' + c + "</span>";
  }

  function rankTilesHtml(tiers, activeId, prefix) {
    return tiers.map(function (t) {
      var cls = t.id === activeId ? "val-rank active" : "val-rank";
      var img = t.icon ? '<img src="' + esc(t.icon) + '" alt="" loading="lazy">' : '<span class="glyph">' + esc(t.glyph) + "</span>";
      return '<button type="button" class="' + cls + '" data-' + prefix + '="' + esc(t.id) + '" aria-label="' + esc(t.name) + '" aria-pressed="' + (t.id === activeId) + '">' +
        '<div class="val-rank-icon" style="--tier-color:' + t.color + '">' + img + "</div></button>";
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
  function shieldSvg() {
    return '<svg width="16" height="16" viewBox="0 0 22 22" fill="none"><path d="M11 2L3 5v6c0 5 3.5 7.8 8 9 4.5-1.2 8-4 8-9V5l-8-3z" stroke="currentColor" stroke-width="1.4"/></svg>';
  }
  function selectHtml(options, value, name) {
    return '<div class="val-select-wrap"><select class="val-select" data-select-' + name + ' aria-label="' + esc(name) + '">' +
      options.map(function (o) { return '<option value="' + esc(o) + '"' + (o === value ? " selected" : "") + '>' + esc(o) + "</option>"; }).join("") +
    "</select></div>";
  }
  function dropdownsHtml(server, platform, serverName, platformName) {
    return '<div class="val-dropdowns"><div class="val-field"><span class="val-field-label">Server</span>' +
      selectHtml(SERVERS, server, serverName || "server") + '</div><div class="val-field"><span class="val-field-label">Platform</span>' +
      selectHtml(PLATFORMS, platform, platformName || "platform") + "</div></div>";
  }
  function sliderHtml(value, min, max, name, pct) {
    return '<div class="val-slider" style="--val:' + pct + '%"><div class="val-slider-track" aria-hidden="true"><div class="val-slider-fill" style="width:' + pct + '%"></div></div>' +
      '<input type="range" min="' + min + '" max="' + max + '" step="1" value="' + value + '" data-slider-' + name + ' aria-label="' + esc(name) + '"></div>';
  }
  function stepperHtml(value, min, max, name) {
    return '<div class="val-stepper" role="group" aria-label="' + esc(name) + '">' +
      '<button type="button" data-step-' + name + '="-1"' + (value <= min ? " disabled" : "") + ' aria-label="Decrease">−</button>' +
      '<input type="number" min="' + min + '" max="' + max + '" value="' + value + '" data-stepper-' + name + ' aria-label="' + esc(name) + '">' +
      '<button type="button" data-step-' + name + '="1"' + (value >= max ? " disabled" : "") + ' aria-label="Increase">+</button></div>';
  }
  function toggleRowHtml(key, label, badge, badgeCls, on, tip) {
    return '<div class="val-toggle-row ' + (on ? "active" : "") + '" data-toggle="' + esc(key) + '">' +
      '<div class="val-toggle-info"><span class="nm">' + esc(label) + '</span>' +
      (tip ? '<span class="val-toggle-desc">' + esc(tip) + '</span>' : '') +
      '</div>' +
      '<span class="badge ' + (badgeCls || "") + '">' + esc(badge) + "</span>" +
      '<button type="button" class="val-switch ' + (on ? "on" : "") + '" data-switch="' + esc(key) + '" aria-pressed="' + on + '" aria-label="' + esc(label) + '"><span class="knob"></span></button></div>';
  }
  function summaryHeadLg() {
    return '<div class="val-summary-head-lg"><div class="row"><span class="micro">Checkout</span>' +
      '<span class="val-online" aria-live="polite"><span class="live" aria-hidden="true"></span>21 online now</span></div>' +
      '<h3 class="ttl">Secure order summary</h3></div>';
  }
  function summaryFootHtml(etaLo, etaHi, price, ctaLabel) {
    return '<div class="val-summary-foot">' +
      '<div class="val-total"><span class="k">Total</span><span class="v">' + formatPrice(price) + "</span></div>" +
      '<button type="button" class="eb-btn eb-btn-primary val-cta val-cta-shield">' + shieldSvg() + " " + esc(ctaLabel) + ' <span class="arrow">' + arrowSvg() + "</span></button>" +
      '<div class="val-trust"><span>Fast Checkout</span><span class="sep"></span><span>Verified Pros</span><span class="sep"></span><span>Money-Back</span></div></div>';
  }
  function tabFaqsHtml(faqs) {
    return faqs.map(function (f, i) {
      return '<div class="eb-faq-row"><button class="eb-faq-btn" type="button"><span class="eb-faq-n">Q.' + String(i + 1).padStart(2, "0") +
        '</span><span class="eb-faq-q">' + esc(f.q) + '</span><span class="eb-faq-plus">+</span></button>' +
        '<div class="eb-faq-panel"><div class="eb-faq-a"><span></span><p>' + esc(f.a) + "</p><span></span></div></div></div>";
    }).join("");
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
    // Kill any onchange/oninput left over from a previously-rendered tab
    // (rank tab has no <select>/range controls). Prevents cross-tab bleed.
    mount.onchange = null;
    mount.oninput = null;
    mount.onclick = function (e) {
      var btn = e.target.closest("[data-current-tier]");
      if (btn) { state.current.tier = btn.dataset.currentTier; scheduleRender(renderRankConfig); return; }
      btn = e.target.closest("[data-target-tier]");
      if (btn) { state.target.tier = btn.dataset.targetTier; scheduleRender(renderRankConfig); return; }
      btn = e.target.closest("[data-seg-current-div]");
      if (btn) { state.current.div = parseInt(btn.dataset.segCurrentDiv); scheduleRender(renderRankConfig); return; }
      btn = e.target.closest("[data-seg-target-div]");
      if (btn) { state.target.div = parseInt(btn.dataset.segTargetDiv); scheduleRender(renderRankConfig); return; }
      btn = e.target.closest("[data-seg-rr]");
      if (btn) { state.rrPerWin = RR_RANGES[parseInt(btn.dataset.segRr)]; scheduleRender(renderRankConfig); return; }
      btn = e.target.closest("[data-chip-server]");
      if (btn) { state.server = btn.dataset.chipServer; scheduleRender(renderRankConfig); return; }
      btn = e.target.closest("[data-chip-platform]");
      if (btn) { state.platform = btn.dataset.chipPlatform; scheduleRender(renderRankConfig); return; }
      btn = e.target.closest("[data-mode]");
      if (btn) { state.mode = btn.dataset.mode; scheduleRender(renderRankConfig); return; }
      btn = e.target.closest(".val-cta");
      if (btn && !btn.disabled) { addRankToCart(); return; }
      btn = e.target.closest("[data-addon]");
      if (btn) {
        var id = btn.dataset.addon;
        var idx = state.addons.indexOf(id);
        if (idx >= 0) state.addons.splice(idx, 1); else state.addons.push(id);
        scheduleRender(renderRankConfig);
        return;
      }
    };
    var rrInput = $("valCurrentRR");
    if (rrInput) rrInput.addEventListener("input", debounce(function () { state.currentRR = rrInput.value; }, 250));
  }

  function renderPlacements() {
    var s = state.pl;
    var tier = PLACEMENT_TIERS.find(function (t) { return t.id === s.tier; });
    var hasDivs = s.tier !== "radiant";
    var price = calcPlacementsPrice(s);
    var eta = placementsETA(s.games, s.addons);
    var sliderPct = ((s.games - 1) / 4) * 100;
    var iconSrc = s.tier === "radiant" ? "../../assets/valorant/icons/rank-radiant.png" : "../../assets/valorant/icons/rank-" + s.tier + "-" + (s.div + 1) + ".png";
    var FAQS_PL = [
      { q: "What happens if a draw is played?", a: "Draws don't count against your placement series. The booster re-queues until the contracted number of completed games is hit." },
      { q: "Placements Guarantee", a: "If a booster trends below our 75% winrate floor during your placement matches, we swap them out the same day at no cost." }
    ];
    $("valConfigMount").innerHTML =
      '<div class="val-config"><div class="val-builder">' +
        '<div class="val-step"><div class="val-step-head"><span class="val-step-num">Step 01 — Starting Point</span><h3 class="val-step-title">Season End Rank</h3><span class="val-step-sub">Select the end season rank</span></div>' +
          '<div class="val-ranks val-ranks-9">' + rankTilesHtml(PLACEMENT_TIERS, s.tier, "pl-tier") + '</div>' +
          '<div class="val-row"><span class="val-row-label">Division</span>' + (hasDivs ? segHtml(DIVISIONS, s.div, "pl-div") : '<span class="val-step-sub">Radiant has no divisions</span>') + '</div>' +
          dropdownsHtml(s.server, s.platform, "pl-server", "pl-platform") +
        '</div>' +
        '<div class="val-step"><div class="val-step-head"><span class="val-step-num">Step 02 — Matches</span><h3 class="val-step-title">Number of Games</h3><span class="val-step-sub">Select the number of games</span></div>' +
          '<div class="val-games-wrap"><div class="val-games-display"><span class="val-games-num">' + s.games + '</span><span class="val-games-unit">Placement matches<span class="v">' + s.games + (s.games === 1 ? " game" : " consecutive games") + '</span></span></div>' +
          sliderHtml(s.games, 1, 5, "pl-games", sliderPct) +
          '<div class="val-slider-ticks" aria-hidden="true" style="grid-template-columns:repeat(5,1fr)">' + [1,2,3,4,5].map(function(n) { return '<span class="' + (n === s.games ? "active" : "") + '">' + n + "</span>"; }).join("") + '</div></div>' +
        '</div>' +
        tabFaqsHtml(FAQS_PL) +
      '</div>' +
      '<div class="val-summary-wrap"><aside class="val-summary has-items" aria-label="Order summary"><span class="arc-hot-trace" aria-hidden="true"></span>' +
        summaryHeadLg() +
        '<div class="val-summary-scroll">' +
          '<div class="val-current-sel"><div class="val-rank-icon" style="--tier-color:' + tier.color + '"><img src="' + iconSrc + '" alt=""></div><div><span class="lbl">Your order</span><span class="v">' + s.games + ' Placement matches<br><span class="tier">' + esc(tier.name) + (hasDivs ? " " + DIVISIONS[s.div] : "") + '</span></span></div></div>' +
          '<div class="val-summary-block-label">Boosting Mode</div>' + summaryModeHtml(s.mode) +
          '<div class="val-summary-block-label">Add-ons</div><div class="val-summary-addons-scroll">' +
            toggleRowHtml("stream", "Stream games", "+20%", "", s.addons.stream, "Your assigned booster will record/live stream all the games.") +
            '<div class="val-subhead">Privacy settings</div>' +
            toggleRowHtml("offline", "Appear Offline", "Free", "free", s.addons.offline, "Your account status stays invisible to friends.") +
            toggleRowHtml("agents", "Specific agents", "Free", "free", s.addons.agents, "Lock in the agents the booster is allowed to play.") +
            toggleRowHtml("express", "Express priority", "+20%", "", s.addons.express, "Skip the queue — your booster starts within the hour.") +
          '</div>' +
        '</div>' +
        summaryFootHtml(eta[0], eta[1], price, "Rank Up") +
      '</aside></div></div>';
    bindTabEvents("pl");
  }

  function renderWins() {
    var s = state.rw;
    var tier = PLACEMENT_TIERS.find(function (t) { return t.id === s.tier; });
    var hasDivs = s.tier !== "radiant";
    var price = calcWinsPrice(s);
    var eta = winsETA(s.wins, s.addons);
    var sliderPct = ((s.wins - 1) / 9) * 100;
    var iconSrc = s.tier === "radiant" ? "../../assets/valorant/icons/rank-radiant.png" : "../../assets/valorant/icons/rank-" + s.tier + "-" + (s.div + 1) + ".png";
    var FAQS_RW = [
      { q: "Why is my RR Gain relevant?", a: "RR per win determines how many matches the booster needs. Higher gains mean fewer games — pricing scales with that effort." },
      { q: "What happens if a game is lost?", a: "Ranked Wins is a wins-delivered contract: a loss doesn't count against the number you ordered. You only pay for wins." }
    ];
    $("valConfigMount").innerHTML =
      '<div class="val-config"><div class="val-builder">' +
        '<div class="val-step"><div class="val-step-head"><span class="val-step-num">Step 01 — Starting Point</span><h3 class="val-step-title">Current Rank</h3><span class="val-step-sub">Select your current rank and division</span></div>' +
          '<div class="val-ranks">' + rankTilesHtml(PLACEMENT_TIERS, s.tier, "rw-tier") + '</div>' +
          (hasDivs ? '<div class="val-row"><span class="val-row-label">Division</span>' + segHtml(DIVISIONS, s.div, "rw-div") + '</div>' : '') +
          '<div class="val-row"><span class="val-row-label">RR per Win</span>' + stepperHtml(s.rrPerWin, 10, 40, "rw-rr") + '</div>' +
        '</div>' +
        '<div class="val-step"><div class="val-step-head"><span class="val-step-num">Step 02 — Goal</span><h3 class="val-step-title">Number of Wins</h3><span class="val-step-sub">Select the number of wins</span></div>' +
          '<div class="val-games-wrap"><div class="val-games-display"><span class="val-games-num">' + s.wins + '</span><span class="val-games-unit">Wins to deliver<span class="v">~ ' + Math.ceil(s.wins / Math.max(1, s.rrPerWin / 30)) + ' games projected</span></span></div>' +
          sliderHtml(s.wins, 1, 10, "rw-wins", sliderPct) +
          '<div class="val-slider-ticks" aria-hidden="true">' + [1,2,3,4,5,6,7,8,9,10].map(function(n) { return '<span class="' + (n === s.wins ? "active" : "") + '">' + n + "</span>"; }).join("") + '</div></div>' +
          dropdownsHtml(s.server, s.platform, "rw-server", "rw-platform") +
        '</div>' +
        tabFaqsHtml(FAQS_RW) +
      '</div>' +
      '<div class="val-summary-wrap"><aside class="val-summary has-items" aria-label="Order summary"><span class="arc-hot-trace" aria-hidden="true"></span>' +
        summaryHeadLg() +
        '<div class="val-summary-scroll">' +
          '<div class="val-current-sel"><div class="val-rank-icon" style="--tier-color:' + tier.color + '"><img src="' + iconSrc + '" alt=""></div><div><span class="lbl">Your order</span><span class="v">' + s.wins + (s.wins === 1 ? " win" : " wins") + ' in<br><span class="tier">' + esc(tier.name) + (hasDivs ? " " + DIVISIONS[s.div] : "") + '</span></span></div></div>' +
          '<div class="val-summary-block-label">Boosting Mode</div>' + summaryModeHtml(s.mode) +
          '<div class="val-summary-block-label">Add-ons</div><div class="val-summary-addons-scroll">' +
            toggleRowHtml("stream", "Stream games", "+20%", "", s.addons.stream, "Your assigned booster will record/live stream all the games.") +
            '<div class="val-subhead">Privacy settings</div>' +
            toggleRowHtml("offline", "Appear Offline", "Free", "free", s.addons.offline, "Account stays invisible to friends.") +
            toggleRowHtml("agents", "Specific agents", "Free", "free", s.addons.agents, "Lock in the agents the booster plays.") +
            toggleRowHtml("undercover", "Undercover Winrate", "Recommended", "recommended", s.addons.undercover, "Booster caps winrate ~65% — looks natural.") +
            toggleRowHtml("express", "Express priority", "Recommended", "recommended", s.addons.express, "Skip the queue — starts within the hour.") +
          '</div>' +
        '</div>' +
        summaryFootHtml(eta[0], eta[1], price, "Rank Up") +
      '</aside></div></div>';
    bindTabEvents("rw");
  }

  function renderLeveling() {
    var s = state.lv;
    var levels = Math.max(0, s.desired - s.current);
    var price = calcLevelPrice(s, 12.74);
    var eta = levelETA(levels, s.addons, 25);
    var curPct = ((s.current - 1) / 499) * 100;
    var desPct = ((s.desired - 1) / 499) * 100;
    var FAQS_LV = [
      { q: "Why level a Valorant account?", a: "Some skins unlock by account level, and ranked requires Level 20. Manual leveling gets your account ranked-ready without botting." },
      { q: "How fast does leveling progress?", a: "Roughly 25 levels per day. Priority Start cuts kickoff wait so the booster begins within the hour." }
    ];
    $("valConfigMount").innerHTML =
      '<div class="val-config val-config--natural"><div class="val-builder">' +
        '<div class="val-step"><div class="val-step-head"><span class="val-step-num">Step 01 — Level Range</span><h3 class="val-step-title">Account Leveling</h3><span class="val-step-sub">$12.74 per level · 1–500 range</span></div>' +
          '<div class="val-bp-sliders">' +
            '<div class="val-games-wrap"><div class="val-games-display"><span class="val-games-num">' + s.current + '</span><span class="val-games-unit">From level</span></div>' +
            sliderHtml(s.current, 1, 500, "lv-current", curPct) + '</div>' +
            '<div class="val-games-wrap"><div class="val-games-display"><span class="val-games-num">' + s.desired + '</span><span class="val-games-unit">To level<span class="v">' + levels + (levels === 1 ? " level" : " levels") + ' to gain</span></span></div>' +
            sliderHtml(s.desired, 1, 500, "lv-desired", desPct) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="val-step"><div class="val-step-head"><span class="val-step-num">Step 02 — Region</span><h3 class="val-step-title">Server &amp; Platform</h3></div>' +
          dropdownsHtml(s.server, s.platform, "lv-server", "lv-platform") +
        '</div>' +
        tabFaqsHtml(FAQS_LV) +
      '</div>' +
      '<div class="val-summary-wrap"><aside class="val-summary has-items" aria-label="Order summary"><span class="arc-hot-trace" aria-hidden="true"></span>' +
        summaryHeadLg() +
        '<div class="val-summary-scroll">' +
          '<div class="val-current-sel"><div><span class="lbl">Your order</span><span class="v">Level ' + s.current + ' → ' + s.desired + ' · ' + levels + ' levels<br><span class="tier">' + esc(s.server) + ' · ' + esc(s.platform) + '</span></span></div></div>' +
          '<div class="val-summary-block-label">Add-ons</div><div class="val-summary-addons-scroll">' +
            toggleRowHtml("priority", "Priority Start", "+20%", "", s.addons.priority, "Skip the queue — starts within the hour.") +
            toggleRowHtml("agents", "Agent Preference", "+10%", "", s.addons.agents, "Lock in the agents the booster plays while leveling.") +
            '<div class="val-subhead">Privacy settings</div>' +
            toggleRowHtml("schedule", "Schedule Preference", "Free", "free", s.addons.schedule, "Pick the hours the booster can play.") +
            toggleRowHtml("offline", "Appear Offline", "Free", "free", s.addons.offline, "Account stays invisible to friends.") +
          '</div>' +
        '</div>' +
        summaryFootHtml(eta[0], eta[1], price, "Rank Up") +
      '</aside></div></div>';
    bindTabEvents("lv");
  }

  function renderBattlePass() {
    var s = state.bp;
    var levels = Math.max(0, s.desired - s.current);
    var price = calcLevelPrice(s, 7.22);
    var eta = levelETA(levels, s.addons, 8);
    var curPct = ((s.current - 1) / 54) * 100;
    var desPct = ((s.desired - 1) / 54) * 100;
    var FAQS_BP = [
      { q: "Will I get all the act-specific skins?", a: "Yes — every level reward, gun buddy, spray, and Tier 50 skin lands in your inventory exactly as if you'd played it yourself." },
      { q: "How fast does Battle Pass leveling progress?", a: "Roughly 8 BP tiers per day at a sustainable pace. Priority Start cuts kickoff wait." }
    ];
    $("valConfigMount").innerHTML =
      '<div class="val-config"><div class="val-builder">' +
        '<div class="val-step"><div class="val-step-head"><span class="val-step-num">Step 01 — Battle Pass</span><h3 class="val-step-title">Battle Pass Levels</h3><span class="val-step-sub">Complete your Battle Pass faster</span></div>' +
          '<div class="val-bp-sliders">' +
            '<div class="val-games-wrap"><div class="val-games-display"><span class="val-games-num">' + s.current + '</span><span class="val-games-unit">Current level<span class="v">$7.22 per level</span></span></div>' +
            sliderHtml(s.current, 1, 55, "bp-current", curPct) + '</div>' +
            '<div class="val-games-wrap"><div class="val-games-display"><span class="val-games-num">' + s.desired + '</span><span class="val-games-unit">Desired level<span class="v">' + levels + (levels === 1 ? " tier" : " tiers") + ' to gain</span></span></div>' +
            sliderHtml(s.desired, 1, 55, "bp-desired", desPct) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="val-step"><div class="val-step-head"><span class="val-step-num">Step 02 — Region</span><h3 class="val-step-title">Server &amp; Platform</h3></div>' +
          dropdownsHtml(s.server, s.platform, "bp-server", "bp-platform") +
        '</div>' +
      '</div>' +
      '<div class="val-summary-wrap"><aside class="val-summary has-items" aria-label="Order summary"><span class="arc-hot-trace" aria-hidden="true"></span>' +
        summaryHeadLg() +
        '<div class="val-summary-scroll">' +
          '<div class="val-current-sel"><div><span class="lbl">Your order</span><span class="v">BP Tier ' + s.current + ' → ' + s.desired + ' · ' + levels + ' tiers<br><span class="tier">' + esc(s.server) + ' · ' + esc(s.platform) + '</span></span></div></div>' +
          '<div class="val-summary-block-label">Active extras</div><div class="val-summary-addons-scroll">' +
            toggleRowHtml("priority", "Priority Start", "+20%", "", s.addons.priority, "Skip the queue — starts within the hour.") +
            toggleRowHtml("agents", "Agent Preference", "+10%", "", s.addons.agents, "Lock in agents during pass progression.") +
            '<div class="val-subhead">Privacy settings</div>' +
            toggleRowHtml("schedule", "Schedule Preference", "Free", "free", s.addons.schedule, "Pick the hours the booster can play.") +
            toggleRowHtml("offline", "Appear Offline", "Free", "free", s.addons.offline, "Account stays invisible to friends.") +
          '</div>' +
        '</div>' +
        summaryFootHtml(eta[0], eta[1], price, "Rank Up") +
      '</aside></div></div>' +
      tabFaqsHtml(FAQS_BP);
    bindTabEvents("bp");
  }

  function renderCoaching() {
    var s = state.co;
    var price = Math.round(16.99 * s.hours * 100) / 100;
    var focusObj = COACHING_FOCI.find(function (f) { return f.id === s.focus; });
    var FAQS_CO = [
      { q: "How are coaches verified?", a: "Every coach has held Radiant or pro-level for two acts running and submits screenshots each season." },
      { q: "What do I need to prepare?", a: "For VOD Review: send 1–2 demos. For Live and Co-Pilot: just have Discord ready. The coach drops a prep checklist in your ticket." }
    ];
    $("valConfigMount").innerHTML =
      '<div class="val-config val-config--natural"><div class="val-builder">' +
        '<div class="val-step"><div class="val-step-head"><span class="val-step-num">Step 01 — Session</span><h3 class="val-step-title">Coaching</h3><span class="val-step-sub">Personalized sessions for aim, positioning, agents, and game sense</span></div>' +
          '<div class="val-row"><span class="val-row-label">Hours</span>' + stepperHtml(s.hours, 1, 4, "co-hours") + '</div>' +
          '<div class="val-summary-block-label" style="margin-top:22px">Focus</div>' +
          '<div class="val-summary-mode" style="grid-template-columns:1fr">' +
            COACHING_FOCI.map(function (f) {
              return '<button type="button" class="' + (s.focus === f.id ? "active" : "") + '" data-co-focus="' + f.id + '" aria-pressed="' + (s.focus === f.id) + '">' +
                '<span class="pill">$16.99 / hr</span><span class="val-summary-mode-name">' + esc(f.name) + '</span><span class="val-summary-mode-desc">' + esc(f.desc) + '</span></button>';
            }).join("") +
          '</div>' +
          dropdownsHtml(s.server, s.platform, "co-server", "co-platform") +
        '</div>' +
        tabFaqsHtml(FAQS_CO) +
      '</div>' +
      '<div class="val-summary-wrap"><aside class="val-summary has-items" aria-label="Order summary"><span class="arc-hot-trace" aria-hidden="true"></span>' +
        summaryHeadLg() +
        '<div class="val-summary-scroll">' +
          '<div class="val-current-sel"><div><span class="lbl">Your session</span><span class="v">' + s.hours + (s.hours === 1 ? " hour" : " hours") + ' of ' + esc(focusObj.name) + '<br><span class="tier">' + esc(s.server) + ' · ' + esc(s.platform) + '</span></span></div></div>' +
          '<div class="val-summary-block-label">Session</div>' +
          '<div class="val-toggle-row active" style="pointer-events:none"><span class="nm">' + esc(focusObj.name) + '</span><span class="badge free">' + s.hours + ' hr</span></div>' +
          '<div class="val-toggle-row active" style="pointer-events:none"><span class="nm">Platform</span><span class="badge">' + esc(s.platform) + '</span></div>' +
        '</div>' +
        '<div class="val-summary-foot">' +
          '<div class="val-eta"><span class="k">Rate</span><span class="v">$16.99 / hr</span></div>' +
          '<div class="val-total"><span class="k">Total</span><span class="v">' + formatPrice(price) + '</span></div>' +
          '<button type="button" class="eb-btn eb-btn-primary val-cta val-cta-shield">' + shieldSvg() + ' Book Session <span class="arrow">' + arrowSvg() + '</span></button>' +
          '<div class="val-trust"><span>Fast Checkout</span><span class="sep"></span><span>Verified Pros</span><span class="sep"></span><span>Money-Back</span></div></div>' +
      '</aside></div></div>';
    bindTabEvents("co");
  }

  function bindTabEvents(tab) {
    var mount = $("valConfigMount");
    var render = { pl: renderPlacements, rw: renderWins, lv: renderLeveling, bp: renderBattlePass, co: renderCoaching }[tab];
    // 250ms debounce for input/select/range-driven price recalcs.
    var deferredRender = debounce(function () { scheduleRender(render); }, 250);
    mount.onclick = function (e) {
      var btn;
      btn = e.target.closest(".eb-faq-btn");
      if (btn) { var row = btn.closest(".eb-faq-row"); if (row) { row.classList.toggle("eb-open"); } return; }
      btn = e.target.closest(".val-cta");
      if (btn && !btn.disabled) { addTabToCart(tab); return; }
      if (tab === "rank") return;
      var s = state[tab];
      btn = e.target.closest("[data-" + tab + "-tier]");
      if (btn) { s.tier = btn.getAttribute("data-" + tab + "-tier"); scheduleRender(render); return; }
      btn = e.target.closest("[data-seg-" + tab + "-div]");
      if (btn) { s.div = parseInt(btn.getAttribute("data-seg-" + tab + "-div")); scheduleRender(render); return; }
      btn = e.target.closest("[data-mode]");
      if (btn) { s.mode = btn.dataset.mode; scheduleRender(render); return; }
      btn = e.target.closest("[data-switch]");
      if (btn) { var key = btn.dataset["switch"]; s.addons[key] = !s.addons[key]; scheduleRender(render); return; }
      btn = e.target.closest("[data-toggle]");
      if (btn && !e.target.closest("[data-switch]")) { var tkey = btn.dataset.toggle; s.addons[tkey] = !s.addons[tkey]; scheduleRender(render); return; }
      btn = e.target.closest("[data-co-focus]");
      if (btn) { s.focus = btn.dataset.coFocus; scheduleRender(render); return; }
      btn = e.target.closest("[data-step-rw-rr]");
      if (btn) { s.rrPerWin = Math.min(40, Math.max(10, s.rrPerWin + parseInt(btn.getAttribute("data-step-rw-rr")))); scheduleRender(render); return; }
      btn = e.target.closest("[data-step-co-hours]");
      if (btn) { s.hours = Math.min(4, Math.max(1, s.hours + parseInt(btn.getAttribute("data-step-co-hours")))); scheduleRender(render); return; }
    };
    mount.onchange = function (e) {
      var el = e.target;
      if (el.matches("input[type=range]")) { deferredRender(); }
      else if (el.matches("[data-select-pl-server]")) { state.pl.server = el.value; deferredRender(); }
      else if (el.matches("[data-select-pl-platform]")) { state.pl.platform = el.value; deferredRender(); }
      else if (el.matches("[data-select-rw-server]")) { state.rw.server = el.value; deferredRender(); }
      else if (el.matches("[data-select-rw-platform]")) { state.rw.platform = el.value; deferredRender(); }
      else if (el.matches("[data-select-lv-server]")) { state.lv.server = el.value; deferredRender(); }
      else if (el.matches("[data-select-lv-platform]")) { state.lv.platform = el.value; deferredRender(); }
      else if (el.matches("[data-select-bp-server]")) { state.bp.server = el.value; deferredRender(); }
      else if (el.matches("[data-select-bp-platform]")) { state.bp.platform = el.value; deferredRender(); }
      else if (el.matches("[data-select-co-server]")) { state.co.server = el.value; deferredRender(); }
      else if (el.matches("[data-select-co-platform]")) { state.co.platform = el.value; deferredRender(); }
      else if (el.matches("[data-stepper-rw-rr]")) { state.rw.rrPerWin = Math.min(40, Math.max(10, parseInt(el.value) || 22)); deferredRender(); }
      else if (el.matches("[data-stepper-co-hours]")) { state.co.hours = Math.min(4, Math.max(1, parseInt(el.value) || 1)); deferredRender(); }
    };
    mount.oninput = function (e) {
      var el = e.target;
      if (!el.matches("input[type=range]")) return;
      var slider = el.closest(".val-slider");
      if (slider) {
        var min = parseInt(el.min), max = parseInt(el.max), val = parseInt(el.value);
        var pct = ((val - min) / (max - min)) * 100;
        slider.style.setProperty("--val", pct + "%");
        var fill = slider.querySelector(".val-slider-fill");
        if (fill) fill.style.width = pct + "%";
      }
      var v = parseInt(el.value);
      if (el.matches("[data-slider-pl-games]")) { state.pl.games = v; }
      else if (el.matches("[data-slider-rw-wins]")) { state.rw.wins = v; }
      else if (el.matches("[data-slider-lv-current]")) { state.lv.current = v; if (state.lv.desired <= v) state.lv.desired = Math.min(500, v + 1); }
      else if (el.matches("[data-slider-lv-desired]")) { state.lv.desired = Math.max(state.lv.current + 1, v); }
      else if (el.matches("[data-slider-bp-current]")) { state.bp.current = v; if (state.bp.desired <= v) state.bp.desired = Math.min(55, v + 1); }
      else if (el.matches("[data-slider-bp-desired]")) { state.bp.desired = Math.max(state.bp.current + 1, v); }
      var wrap = el.closest(".val-games-wrap");
      if (wrap) {
        var numEl = wrap.querySelector(".val-games-num");
        if (numEl) numEl.textContent = el.matches("[data-slider-lv-desired]") ? state.lv.desired :
                                        el.matches("[data-slider-bp-desired]") ? state.bp.desired : v;
      }
    };
  }

  /* ════════════════════════════════════════════════════════════════
     PHASE 2 — CART INTEGRATION
     The 6-tab configurator already existed and computes prices, but its
     CTA buttons (.val-cta) were never wired to anything. cart.js is not
     loaded on this page, so we persist into the shared cart store
     (localStorage 'elyOrderStateV1') — the same contract Arc Raiders
     uses — and update the nav cart badge.
     ════════════════════════════════════════════════════════════════ */
  var STORE_KEY = "elyOrderStateV1";

  function currentCurrency() {
    var sel = $("valCurrency");
    return sel ? sel.value : "USD";
  }

  function makeEntry(name, category, priceUsd, details) {
    return {
      id: "val-" + Date.now(),
      gameId: "valorant",
      game: "Valorant",
      name: "Valorant — " + name,
      category: category,
      qty: 1,
      total: Math.round(priceUsd * 100) / 100,
      custom: false,
      details: details,
      viewedCurrency: currentCurrency(),
      addedAt: Date.now()
    };
  }

  function pushCartEntry(entry) {
    var store;
    try { store = JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch (e) { store = {}; }
    if (!Array.isArray(store.cart)) store.cart = [];
    store.cart.push(entry);
    store.currency = entry.viewedCurrency;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {}
    syncNavBadge();
    valToast("Added to cart");
  }

  function addRankToCart() {
    var ci = rankIndex(state.current.tier, state.current.div);
    var ti = rankIndex(state.target.tier, state.target.div);
    if (ti <= ci) { valToast("Pick a higher target rank first"); return; }
    var price = calculatePrice(state);
    if (price <= 0) { valToast("Select a valid rank range"); return; }
    var ct = TIERS.find(function (t) { return t.id === state.current.tier; });
    var tt = TIERS.find(function (t) { return t.id === state.target.tier; });
    var details = [
      ct.name + " " + DIVISIONS[state.current.div] + " → " + tt.name + " " + DIVISIONS[state.target.div],
      "Mode: " + (state.mode === "duo" ? "Pro Duo" : "Solo"),
      "RR/Win: " + state.rrPerWin + " · " + state.server + " · " + state.platform,
      state.addons.length ? "Add-ons: " + state.addons.join(", ") : "No add-ons"
    ].join("\n");
    pushCartEntry(makeEntry("Rank Boost", "Rank Boosting", price, details));
  }

  function addTabToCart(tab) {
    if (tab === "rank") { addRankToCart(); return; }
    var s = state[tab];
    if (tab === "pl") {
      var tp = PLACEMENT_TIERS.find(function (x) { return x.id === s.tier; });
      pushCartEntry(makeEntry("Placements", "Placements", calcPlacementsPrice(s),
        s.games + " placement games · " + tp.name + (s.tier !== "radiant" ? " " + DIVISIONS[s.div] : "") +
        "\nMode: " + (s.mode === "duo" ? "Pro Duo" : "Solo") + " · " + s.server + " · " + s.platform));
    } else if (tab === "rw") {
      var tw = PLACEMENT_TIERS.find(function (x) { return x.id === s.tier; });
      pushCartEntry(makeEntry("Ranked Wins", "Ranked Wins", calcWinsPrice(s),
        s.wins + " wins · " + tw.name + (s.tier !== "radiant" ? " " + DIVISIONS[s.div] : "") +
        "\nMode: " + (s.mode === "duo" ? "Pro Duo" : "Solo") + " · " + s.server + " · " + s.platform));
    } else if (tab === "lv") {
      var lvls = Math.max(0, s.desired - s.current);
      if (lvls <= 0) { valToast("Target level must be higher"); return; }
      pushCartEntry(makeEntry("Account Leveling", "Account Leveling", calcLevelPrice(s, 12.74),
        "Level " + s.current + " → " + s.desired + " (" + lvls + " levels)\n" + s.server + " · " + s.platform));
    } else if (tab === "bp") {
      var tiers = Math.max(0, s.desired - s.current);
      if (tiers <= 0) { valToast("Target tier must be higher"); return; }
      pushCartEntry(makeEntry("Battle Pass", "Battle Pass", calcLevelPrice(s, 7.22),
        "BP Tier " + s.current + " → " + s.desired + " (" + tiers + " tiers)\n" + s.server + " · " + s.platform));
    } else if (tab === "co") {
      var f = COACHING_FOCI.find(function (x) { return x.id === s.focus; });
      pushCartEntry(makeEntry("Coaching", "Coaching", Math.round(16.99 * s.hours * 100) / 100,
        s.hours + (s.hours === 1 ? " hour · " : " hours · ") + f.name + "\n" + s.server + " · " + s.platform));
    }
  }

  function syncNavBadge() {
    var dot = $("cartCount");
    if (!dot) return;
    var count = 0;
    try {
      var store = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      if (Array.isArray(store.cart)) count = store.cart.reduce(function (n, it) { return n + (it && it.qty ? it.qty : 1); }, 0);
    } catch (e) {}
    dot.textContent = count > 99 ? "99+" : String(count);
  }

  function valToast(msg) {
    var t = document.querySelector(".eb-toast");
    if (!t) { t = document.createElement("div"); t.className = "eb-toast"; document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(function () { t.classList.add("is-show"); });
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove("is-show"); }, 2400);
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
      case "placements": renderPlacements(); break;
      case "wins": renderWins(); break;
      case "leveling": renderLeveling(); break;
      case "battlepass": renderBattlePass(); break;
      case "coaching": renderCoaching(); break;
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

    // Carousel wheel scroll — capped so vertical wheel maps to a slow,
    // controlled horizontal scroll instead of flinging the rail.
    if (!rail.dataset.wheelBound) {
      rail.dataset.wheelBound = "1";
      rail.addEventListener("wheel", function (e) {
        var max = rail.scrollWidth - rail.clientWidth;
        if (max <= 0) return;
        var raw = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (!raw) return;
        var atStart = rail.scrollLeft <= 0;
        var atEnd = rail.scrollLeft >= max - 1;
        if ((raw < 0 && atStart) || (raw > 0 && atEnd)) return; // let the page scroll at the edges
        e.preventDefault();
        var capped = Math.min(Math.abs(raw), 80) * (raw < 0 ? -1 : 1);
        rail.scrollLeft += capped * 0.3;
      }, { passive: false });
    }
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
    var nav = $("ebNav");
    if (!nav) return;
    function check() { nav.classList.toggle("eb-scrolled", window.scrollY > 40); }
    check();
    window.addEventListener("scroll", check, { passive: true });
  }

  function initTabs() {
    if (initTabs._done) return;
    initTabs._done = true;
    document.querySelectorAll(".val-tab[data-tab]").forEach(function (tab) {
      tab.addEventListener("click", function () { switchTab(tab.dataset.tab); });
    });
  }

  function rerenderCurrent() {
    switch (state.tab) {
      case "rank": renderRankConfig(); break;
      case "placements": renderPlacements(); break;
      case "wins": renderWins(); break;
      case "leveling": renderLeveling(); break;
      case "battlepass": renderBattlePass(); break;
      case "coaching": renderCoaching(); break;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavScroll();
    initScrollReveal();
    initTabs();
    renderRankConfig();
    renderReviews();
    renderFaqs();
    syncNavBadge();
    // Re-render the active configurator when the shared currency changes
    // so live totals reflect the selected currency.
    window.addEventListener("eb:currencychange", function () { scheduleRender(rerenderCurrent); });
  });
})();
