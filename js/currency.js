/* ════════════════════════════════════════════════════════════════
   currency.js — shared currency module (Elysium Boost)

   Single source of truth for FX rates + symbols. Persists the user's
   choice across pages (localStorage 'eb_currency'), exposes
   window.elysiumCurrency { code, rate, symbol }, converts any static
   [data-usd-price] elements, and emits 'eb:currencychange' so page
   configurators (e.g. valorant.js) can recompute. Defensive by design:
   it only enhances. Existing per-page .eb-currency change handlers keep
   working untouched.
   ════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var RATES   = { USD: 1, EUR: 0.92, GBP: 0.79, TRY: 32.5 };
  var SYMBOLS = { USD: "$", EUR: "€", GBP: "£", TRY: "₺" };
  var KEY = "eb_currency";

  function readStored() {
    try { var c = localStorage.getItem(KEY); return RATES[c] ? c : "USD"; } catch (e) { return "USD"; }
  }

  var current = readStored();

  function getRate(code)   { return RATES[code || current] || 1; }
  function getSymbol(code) { return SYMBOLS[code || current] || "$"; }

  function publish() {
    window.elysiumCurrency = { code: current, rate: getRate(), symbol: getSymbol() };
  }
  publish();

  function convertStatic(root) {
    var rate = getRate(), sym = getSymbol();
    (root || document).querySelectorAll("[data-usd-price]").forEach(function (el) {
      var usd = parseFloat(el.getAttribute("data-usd-price"));
      if (isNaN(usd)) return;
      el.textContent = sym + (usd * rate).toFixed(2);
    });
  }

  // Public: switch currency, persist, sync selectors, notify listeners.
  function applyCurrency(code) {
    if (!RATES[code]) return;
    current = code;
    try { localStorage.setItem(KEY, code); } catch (e) {}
    publish();
    convertStatic();
    document.querySelectorAll("select.eb-currency").forEach(function (sel) {
      if (sel.value !== code) sel.value = code;
    });
    window.dispatchEvent(new CustomEvent("eb:currencychange", { detail: window.elysiumCurrency }));
  }

  function init() {
    // Restore the persisted choice into every selector BEFORE page modules
    // first render, so they read the right currency. No synthetic change is
    // fired here, to avoid surprising existing handlers; page modules read
    // window.elysiumCurrency / the selector value at render time.
    document.querySelectorAll("select.eb-currency").forEach(function (sel) {
      if (RATES[current]) sel.value = current;
      sel.addEventListener("change", function () { applyCurrency(sel.value); });
    });
    convertStatic();
  }

  window.EBCurrency = {
    applyCurrency: applyCurrency,
    getRate: getRate,
    getSymbol: getSymbol,
    convert: convertStatic,
    RATES: RATES,
    SYMBOLS: SYMBOLS
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
