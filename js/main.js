    const $ =
      typeof window.$ === "function"
        ? window.$
        : function elyDomId(id) {
            return document.getElementById(id);
          };
    const MUSIC_PREF_KEY = "elyBoostMusicPrefV1";
    const bgMusic = $("bgMusic");
    const audioToggle = $("audioToggle");
    const audioVolume = $("audioVolume");

    function readMusicPref() {
      try {
        const raw = localStorage.getItem(MUSIC_PREF_KEY);
        if (!raw) return { vol: 0 };
        const j = JSON.parse(raw);
        return { vol: Math.max(0, Math.min(100, Number(j.vol) || 0)) };
      } catch (e) {
        return { vol: 0 };
      }
    }

    function writeMusicPref() {
      if (!audioVolume) return;
      try {
        localStorage.setItem(MUSIC_PREF_KEY, JSON.stringify({ vol: Number(audioVolume.value) || 0 }));
      } catch (e) {}
    }

    function updateAudioButton() {
      if (!audioToggle || !bgMusic) return;
      const off = bgMusic.paused || bgMusic.muted;
      audioToggle.innerHTML = off ? "&#9835;" : "II";
      audioToggle.setAttribute("aria-label", off ? ui("Play music") : ui("Pause music"));
    }

    if (bgMusic && audioToggle && audioVolume) {
      (function initMusicPrefs() {
        const p = readMusicPref();
        audioVolume.value = String(p.vol);
        bgMusic.volume = p.vol / 100;
      })();
      bgMusic.muted = true;
      bgMusic.pause();

      audioToggle.addEventListener("click", event => {
        event.stopPropagation();
        if (bgMusic.paused) {
          let v = Number(audioVolume.value);
          if (v <= 0) {
            v = 45;
            audioVolume.value = String(v);
          }
          bgMusic.volume = v / 100;
          bgMusic.muted = false;
          bgMusic.play().then(updateAudioButton).catch(updateAudioButton);
        } else {
          bgMusic.pause();
          updateAudioButton();
        }
        writeMusicPref();
      });
      audioVolume.addEventListener("input", () => {
        const v = Number(audioVolume.value);
        bgMusic.volume = v / 100;
        bgMusic.muted = v <= 0;
        if (v <= 0) bgMusic.pause();
        updateAudioButton();
        writeMusicPref();
      });
    }

    const currencyEl = $("currency");
    if (currencyEl) {
      currencyEl.addEventListener("change", () => {
        state.currency = currencyEl.value;
        const label = state.currency === "USD" ? "USD" : state.currency === "EUR" ? "EUR" : state.currency === "GBP" ? "GBP" : state.currency === "TRY" ? "TRY" : state.currency;
        showToast(`Currency updated to ${label}`, 1800, false);
        if (state.game) {
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

    $("addToCart")?.addEventListener("click", addToCart);
    $("clearService")?.addEventListener("click", clearServiceForm);
    $("cartOpen")?.addEventListener("click", openCart);
    $("cartClose")?.addEventListener("click", closeCart);
    $("copyOrder")?.addEventListener("click", copyOrder);
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
    $("openDiscord")?.addEventListener("click", event => {
      event.preventDefault();
      openDiscordTicket();
    });
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
    if (siteSearchBtn) siteSearchBtn.addEventListener("click", runSiteSearch);
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
      if (!sr.contains(event.target) && event.target !== ss && event.target !== ssb) {
        sr.classList.remove("active");
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
      }
    });

    updateAudioButton();
    restoreOrderState();
    cleanStaleCart();
    persistOrderState();
    restoreGameFromHash();
    if (state.game) syncGameHash(state.game);
    window.addEventListener("hashchange", () => {
      closeGameMenu();
      const id = parseGameHash();
      if (id && games.some(g => g.id === id)) {
        if (state.game !== id) {
          const game = games.find(g => g.id === id);
          state.game = id;
          state.category = game.categories[0]?.id || "services";
          state.serviceId = null;
          renderAll();
        }
      } else if (!id) {
        if (state.game) {
          state.game = null;
          state.category = null;
          state.serviceId = null;
          renderAll();
        }
      }
    });
    renderAll();

