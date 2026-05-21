    const currencyEl = $("currency");
    if (currencyEl) {
      currencyEl.addEventListener("change", () => {
        state.currency = currencyEl.value;
        const label = state.currency === "USD" ? "USD" : state.currency === "EUR" ? "EUR" : state.currency === "GBP" ? "GBP" : state.currency === "TRY" ? "TRY" : state.currency;
        showToast(`Currency updated to ${label}`, 1800, false);
        if (state.game) {
          renderPopular();
          renderServices();
          updateTotal();
        } else {
          renderHome();
        }
        renderCart();
        persistOrderState();
      });
    }

    const brandHomeEl = $("brandHome");
    if (brandHomeEl) {
      brandHomeEl.addEventListener("click", event => {
        event.preventDefault();
        state.game = null;
        state.category = null;
        state.serviceId = null;
        syncGameHash(null);
        renderAll();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    const heroCta = $("heroCta");
    if (heroCta) {
      heroCta.addEventListener("click", () => {
        if (state.game) {
          $("serviceHead")?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          $("homeGameHead")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
    $("heroHowWorks")?.addEventListener("click", () => {
      $("howItWorksTitle")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    $("addToCart")?.addEventListener("click", () => {
      const strip = $("elyConfirmStrip");
      if (strip) {
        strip.hidden = false;
        strip.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        const fn = window.addToCart;
        if (typeof fn === "function") fn();
      }
    });
    $("elyConfirmYes")?.addEventListener("click", () => {
      const fn = window.addToCart;
      if (typeof fn === "function") fn();
      const strip = $("elyConfirmStrip");
      if (strip) strip.hidden = true;
    });
    $("elyConfirmNo")?.addEventListener("click", () => {
      const strip = $("elyConfirmStrip");
      if (strip) strip.hidden = true;
    });
    $("clearService")?.addEventListener("click", clearServiceForm);
    $("cartOpen")?.addEventListener("click", openCart);
    $("cartClose")?.addEventListener("click", closeCart);
    $("cartCompactToggle")?.addEventListener("click", () => {
      state.cartDrawerCompact = !state.cartDrawerCompact;
      if (typeof applyDrawerCompactClass === "function") applyDrawerCompactClass();
      if (typeof syncCompactToggleLabel === "function") syncCompactToggleLabel();
      if (typeof persistOrderState === "function") persistOrderState();
    });
    $("copyOrder")?.addEventListener("click", () => copyOrder(true));
    $("downloadOrderReceipt")?.addEventListener("click", e => {
      e.preventDefault();
      if (typeof downloadOrderReceipt === "function") downloadOrderReceipt();
    });
    $("stickyOrderOpen")?.addEventListener("click", () => openCart());
    $("footerLegalBtn")?.addEventListener("click", () => {
      $("legalModal")?.classList.add("active");
      $("legalModal")?.setAttribute("aria-hidden", "false");
    });
    $("legalModalClose")?.addEventListener("click", () => {
      $("legalModal")?.classList.remove("active");
      $("legalModal")?.setAttribute("aria-hidden", "true");
    });
    $("legalModal")?.addEventListener("click", event => {
      const lm = $("legalModal");
      if (lm && event.target === lm) {
        lm.classList.remove("active");
        lm.setAttribute("aria-hidden", "true");
      }
    });
    $("copySuccessClose")?.addEventListener("click", () => closeCopySuccessModal());
    $("copySuccessReceipt")?.addEventListener("click", () => {
      if (typeof downloadOrderReceipt === "function") downloadOrderReceipt();
    });
    $("copySuccessModal")?.addEventListener("click", event => {
      const m = $("copySuccessModal");
      if (m && event.target === m) closeCopySuccessModal();
    });
    $("clearCart")?.addEventListener("click", clearCart);
    $("arcIdDone")?.addEventListener("click", () => {
      const id = val("arcIdInput").trim();
      if (!id) {
        showToast("Enter ID or use the red option.");
        return;
      }
      state.arcId = id;
      state.arcIdSkipped = false;
      proceedAfterArcId();
      if (state.cart.length) renderCart();
    });
    $("arcIdSkip")?.addEventListener("click", () => {
      state.arcId = "";
      state.arcIdSkipped = true;
      proceedAfterArcId();
      if (state.cart.length) renderCart();
    });
    $("arcIdModal")?.addEventListener("click", event => {
      const am = $("arcIdModal");
      if (am && event.target === am) closeArcIdModal();
    });

    const siteSearchBtn = $("siteSearchBtn");
    if (siteSearchBtn) siteSearchBtn.addEventListener("click", () => {
      const search = $("siteSearch");
      const actions = siteSearchBtn.closest(".actions");
      const isMobile = window.matchMedia?.("(max-width: 720px)")?.matches;
      if (isMobile && actions && search && !actions.classList.contains("search-open")) {
        actions.classList.add("search-open");
        search.focus();
        return;
      }
      runSiteSearch();
    });
    const siteSearch = $("siteSearch");
    if (siteSearch) {
      siteSearch.addEventListener("input", () => {
        const query = val("siteSearch").trim().toLowerCase();
        renderSiteSearchResults(query ? searchEntries(query) : [], query);
      });
      siteSearch.addEventListener("keydown", event => {
        if (event.key === "Enter") runSiteSearch();
      });
    }

    const cartBackdrop = $("cartBackdrop");
    if (cartBackdrop) {
      cartBackdrop.addEventListener("click", event => {
        if (event.target === cartBackdrop) closeCart();
      });
    }

    document.addEventListener("click", event => {
      const sr = $("siteSearchResults");
      const ss = $("siteSearch");
      const ssb = $("siteSearchBtn");
      if (!sr || !ss || !ssb) return;
      if (!sr.contains(event.target) && event.target !== ss && !ssb.contains(event.target)) {
        sr.classList.remove("active");
        ssb.closest(".actions")?.classList.remove("search-open");
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeGameMenu();
        closeCart();
        closeArcIdModal();
        closeCopySuccessModal();
        $("legalModal")?.classList.remove("active");
        $("legalModal")?.setAttribute("aria-hidden", "true");
        $("siteSearchResults")?.classList.remove("active");
        $("siteSearchBtn")?.closest(".actions")?.classList.remove("search-open");
      }
    });

    applyNavRecoveryOnce();
    restoreOrderState();
    restoreGameFromHash();
    sanitizeNavigationState();
    cleanStaleCart();
    persistOrderState();
    sanitizeNavigationState();
    if (state.game) syncGameHash(state.game);
    window.addEventListener("hashchange", () => {
      closeGameMenu();
      applyHashRouteToState();
    });

    window.selectGame = selectGame;
    if (!window.__elyHomeGameDelegated) {
      window.__elyHomeGameDelegated = true;
      document.addEventListener("click", event => {
        const card = event.target.closest("[data-home-game]");
        if (!card) return;
        const home = document.getElementById("homeContent");
        if (!home || home.classList.contains("hidden")) return;
        const id = card.getAttribute("data-home-game");
        if (!id || typeof games === "undefined" || !games.some(g => g.id === id)) return;
        const go = window.selectGame;
        if (typeof go !== "function") return;
        go(id);
      });
    }

    renderAll();

    // Discord live presence counter
    (function initDiscordCounter() {
      const GUILD_ID = "1499767937974669363";
      const WIDGET_URL = "https://discord.com/api/guilds/" + GUILD_ID + "/widget.json";
      const FALLBACK = "100+";
      const INTERVAL_MS = 30000;

      function updateCounter(value) {
        document.querySelectorAll(".ely-trust-counter__number").forEach(el => {
          if (el.dataset.suffix === "+") {
            const label = el.closest(".ely-trust-counter")?.querySelector(".ely-trust-counter__label");
            if (label && label.textContent.trim() === "Discord Members") {
              el.textContent = value;
            }
          }
        });
      }

      function fetchPresence() {
        fetch(WIDGET_URL)
          .then(r => r.ok ? r.json() : Promise.reject())
          .then(data => {
            const count = data && typeof data.presence_count === "number"
              ? data.presence_count + "+"
              : FALLBACK;
            updateCounter(count);
          })
          .catch(() => updateCounter(FALLBACK));
      }

      fetchPresence();
      setInterval(fetchPresence, INTERVAL_MS);
    })();

    (function initMobileNav() {
      const navHome     = document.getElementById("mobileNavHome");
      const navServices = document.getElementById("mobileNavServices");
      const navCart     = document.getElementById("mobileNavCart");
      const navBadge    = document.getElementById("mobileNavCartBadge");
      const gameMenuBtn = document.getElementById("gameMenuBtn");
      const cartOpenBtn = document.getElementById("cartOpen");
      const brandHome   = document.getElementById("brandHome");

      if (!navHome || !navServices || !navCart) return;

      function syncActiveState() {
        const hash = location.hash;
        navHome.classList.toggle("is-active", !hash || hash === "#");
        navServices.classList.toggle("is-active", Boolean(hash && hash !== "#"));
      }

      function syncCartBadge() {
        const count = document.getElementById("cartCount");
        if (!count || !navBadge) return;
        const n = parseInt(count.textContent || "0", 10);
        navBadge.textContent = n > 9 ? "9+" : String(n);
        navBadge.dataset.count = String(n);
      }

      navHome.addEventListener("click", (e) => {
        e.preventDefault();
        if (brandHome) brandHome.click();
        syncActiveState();
      });

      navServices.addEventListener("click", () => {
        if (gameMenuBtn) gameMenuBtn.click();
      });

      navCart.addEventListener("click", () => {
        if (cartOpenBtn) cartOpenBtn.click();
      });

      window.addEventListener("hashchange", syncActiveState);

      const cartCountEl = document.getElementById("cartCount");
      if (cartCountEl) {
        new MutationObserver(syncCartBadge)
          .observe(cartCountEl, { childList: true, characterData: true, subtree: true });
      }

      syncActiveState();
      syncCartBadge();
    })();
