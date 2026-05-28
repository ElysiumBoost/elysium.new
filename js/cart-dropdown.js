/* ══════════════════════════════════════════════════════════════
   cart-dropdown.js — shared subpage cart V2 bootstrap

   Wires the premium cart V2 dropdown (open/close/render) on pages
   that do NOT load the full landing JS stack (cart.js / ui.js /
   main.js / state.js / products.js).

   Reads cart state from localStorage (key elyOrderStateV1 — same
   key js/storage.js uses on landing) so a user who added items on
   the landing page sees those items in the subpage cart dropdown.

   Subpages don't have the full Discord ticket flow available, so
   CHECKOUT navigates back to /index.html where copyOrder() lives.

   Loaded on: pages/games/arc-raiders.html, pages/games/valorant.html.
   NOT loaded on index.html (which uses the full landing JS stack).
   ══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var STORAGE_KEY = "elyOrderStateV1";
  var LANDING_HREF = "/index.html";
  var CURRENCY_SYMBOLS = { USD: "$", EUR: "€", GBP: "£", TRY: "₺" };

  function $(id) { return document.getElementById(id); }

  function readState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { cart: [], currency: "USD" };
      var j = JSON.parse(raw);
      return {
        cart: Array.isArray(j.cart) ? j.cart : [],
        currency: j.currency || "USD"
      };
    } catch (e) {
      return { cart: [], currency: "USD" };
    }
  }

  function fmt(value, currency) {
    var sym = CURRENCY_SYMBOLS[currency] || "$";
    return sym + Number(value || 0).toFixed(2);
  }

  function showToast(msg) {
    var t = document.querySelector(".eb-toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "eb-toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(function () { t.classList.add("is-show"); });
    clearTimeout(t._hide);
    t._hide = setTimeout(function () { t.classList.remove("is-show"); }, 2400);
  }

  function render() {
    var s = readState();
    var cart = s.cart;
    var currency = s.currency;
    var strip = $("orderCheckoutStrip");
    if (!strip) return;

    var lineCount = cart.reduce(function (n, item) {
      return n + (item && item.qty ? item.qty : 1);
    }, 0);
    var total = cart.reduce(function (sum, item) {
      return sum + ((item && !item.custom && item.total) ? item.total : 0);
    }, 0);
    var hasCustom = cart.some(function (item) { return item && item.custom; });

    // Wide drawer when cart has items (mirrors landing behavior)
    var drawerEl = document.querySelector("#cartBackdrop .drawer");
    if (drawerEl) drawerEl.classList.toggle("drawer--wide", cart.length > 0);

    // Empty-state class on the strip (CSS hides rows/total/promo when empty)
    strip.classList.toggle("is-empty", cart.length === 0);

    // Nav badge count
    var dot = $("cartCount");
    if (dot) {
      dot.textContent = String(lineCount);
      if (dot.hasAttribute("hidden")) {
        if (lineCount > 0) dot.removeAttribute("hidden");
      } else if (lineCount === 0) {
        // Match landing pattern: keep visible at 0 (cart V2 dot is always shown)
      }
    }

    // Summary rows
    var itemsEl = $("cartItemsCount");
    if (itemsEl) itemsEl.textContent = String(lineCount);
    var subEl = $("cartSubtotalAmt");
    if (subEl) {
      subEl.textContent = hasCustom
        ? fmt(total, currency) + " + CUSTOM"
        : fmt(total, currency);
    }
    var taxEl = $("cartTaxAmt");
    if (taxEl && !taxEl.dataset.locked) taxEl.textContent = "—";
    var discountEl = $("cartDiscountAmt");
    if (discountEl && !discountEl.dataset.locked) discountEl.textContent = "—";

    // Final payment
    var totalEl = $("cartTotal");
    if (totalEl) {
      totalEl.textContent = hasCustom
        ? fmt(total, currency) + " + CUSTOM"
        : fmt(total, currency);
    }

    // Disable checkout when empty
    var copyEl = $("copyOrder");
    if (copyEl) copyEl.disabled = cart.length === 0;

    // Body content (empty tile vs items-present tile)
    var body = $("cartBody");
    if (!body) return;
    if (cart.length === 0) {
      body.innerHTML =
        '<div class="cart-empty-card eb-cart-empty">' +
          '<p class="eb-cart-empty-label">Cart empty</p>' +
          '<p class="eb-cart-empty-sub">Pick a service to start your order.</p>' +
          '<button type="button" class="eb-cart-empty-browse" id="cartEmptyBrowse">Browse games</button>' +
        '</div>';
      var browse = $("cartEmptyBrowse");
      if (browse) browse.addEventListener("click", function () {
        location.href = LANDING_HREF;
      });
    } else {
      var label = lineCount + " item" + (lineCount === 1 ? "" : "s") + " in cart";
      body.innerHTML =
        '<div class="cart-empty-card eb-cart-empty">' +
          '<p class="eb-cart-empty-label">' + label + '</p>' +
          '<p class="eb-cart-empty-sub">Open the landing cart to review items and finalize via Discord.</p>' +
          '<button type="button" class="eb-cart-empty-browse" id="cartGoLanding">Open cart on landing</button>' +
        '</div>';
      var go = $("cartGoLanding");
      if (go) go.addEventListener("click", function () {
        location.href = LANDING_HREF;
      });
    }
  }

  function openCart() {
    var bd = $("cartBackdrop");
    if (!bd) return;
    render();
    bd.classList.add("active");
    bd.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");
  }

  function closeCart() {
    var bd = $("cartBackdrop");
    if (!bd) return;
    bd.classList.remove("active");
    bd.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
  }

  function init() {
    // Open / close wiring
    var openBtn = $("cartOpen");
    if (openBtn) openBtn.addEventListener("click", openCart);

    var closeBtn = $("cartClose");
    if (closeBtn) closeBtn.addEventListener("click", closeCart);

    var bd = $("cartBackdrop");
    if (bd) {
      bd.addEventListener("click", function (event) {
        if (event.target === bd) closeCart();
      });
    }
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        var b = $("cartBackdrop");
        if (b && b.classList.contains("active")) closeCart();
      }
    });

    // Promo + Member toasts (match landing behavior)
    var memberBtn = $("memberCheckout");
    if (memberBtn) memberBtn.addEventListener("click", function () {
      showToast("Member checkout coming soon.");
    });

    var promoApply = $("cartPromoApply");
    if (promoApply) promoApply.addEventListener("click", function () {
      var input = $("cartPromoInput");
      var code = input ? input.value.trim() : "";
      if (!code) { showToast("Enter a promo code first."); return; }
      showToast("Promo codes are validated in Discord during ticket review.");
    });

    var promoInput = $("cartPromoInput");
    if (promoInput) promoInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        var apply = $("cartPromoApply");
        if (apply) apply.click();
      }
    });

    // CHECKOUT: navigate to landing where the full Discord ticket flow lives
    var copyEl = $("copyOrder");
    if (copyEl) copyEl.addEventListener("click", function () {
      if (copyEl.disabled) return;
      location.href = LANDING_HREF;
    });

    // Download receipt: deferred to landing
    var dlBtn = $("downloadOrderReceipt");
    if (dlBtn) dlBtn.addEventListener("click", function (event) {
      event.preventDefault();
      showToast("Open the landing cart to download your receipt.");
    });

    // Clear cart: deferred to landing (subpage doesn't own the full state mutation)
    var clearBtn = $("clearCart");
    if (clearBtn) clearBtn.addEventListener("click", function () {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          var j = JSON.parse(raw);
          j.cart = [];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(j));
        }
      } catch (e) {}
      render();
      showToast("Cart cleared.");
    });

    // Initial render (so badge count + summary reflect persisted state)
    render();

    // Keep cart in sync when the storage changes in another tab
    window.addEventListener("storage", function (event) {
      if (event.key === STORAGE_KEY) render();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
