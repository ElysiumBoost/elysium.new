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
      try {
        localStorage.setItem(MUSIC_PREF_KEY, JSON.stringify({ vol: Number(audioVolume.value) || 0 }));
      } catch (e) {}
    }

    (function initMusicPrefs() {
      const p = readMusicPref();
      audioVolume.value = String(p.vol);
      bgMusic.volume = p.vol / 100;
    })();
    bgMusic.muted = true;
    bgMusic.pause();

    function updateAudioButton() {
      const off = bgMusic.paused || bgMusic.muted;
      audioToggle.innerHTML = off ? "&#9835;" : "II";
      audioToggle.setAttribute("aria-label", off ? ui("Play music") : ui("Pause music"));
    }

    $("currency").addEventListener("change", () => {
      state.currency = $("currency").value;
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
    $("brandHome").addEventListener("click", event => {
      event.preventDefault();
      state.game = null;
      state.category = null;
      state.serviceId = null;
      syncGameHash(null);
      renderAll();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
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
    $("addToCart").addEventListener("click", addToCart);
    $("clearService").addEventListener("click", clearServiceForm);
    $("cartOpen").addEventListener("click", openCart);
    $("cartClose").addEventListener("click", closeCart);
    $("copyOrder").addEventListener("click", copyOrder);
    $("downloadOrderReceipt")?.addEventListener("click", e => { e.preventDefault(); downloadOrderReceipt(); });
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
      if (event.target === $("legalModal")) {
        $("legalModal")?.classList.remove("active");
        $("legalModal")?.setAttribute("aria-hidden", "true");
      }
    });
    $("copySuccessClose")?.addEventListener("click", () => closeCopySuccessModal());
    $("copySuccessReceipt")?.addEventListener("click", () => downloadOrderReceipt());
    $("copySuccessModal")?.addEventListener("click", event => {
      if (event.target === $("copySuccessModal")) closeCopySuccessModal();
    });
    $("clearCart").addEventListener("click", clearCart);
    $("openDiscord").addEventListener("click", event => {
      event.preventDefault();
      openDiscordTicket();
    });
    $("arcIdDone").addEventListener("click", () => {
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
    $("arcIdSkip").addEventListener("click", () => {
      state.arcId = "";
      state.arcIdSkipped = true;
      proceedAfterArcId();
      if (state.cart.length) renderCart();
    });
    $("arcIdModal").addEventListener("click", event => {
      if (event.target === $("arcIdModal")) closeArcIdModal();
    });
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
    $("siteSearchBtn").addEventListener("click", runSiteSearch);
    $("siteSearch").addEventListener("input", () => {
      const query = val("siteSearch").trim().toLowerCase();
      renderSiteSearchResults(query ? searchEntries(query) : [], query);
    });
    $("siteSearch").addEventListener("keydown", event => {
      if (event.key === "Enter") runSiteSearch();
    });
    $("cartBackdrop").addEventListener("click", event => { if (event.target === $("cartBackdrop")) closeCart(); });
    document.addEventListener("click", event => {
      if (!$("siteSearchResults").contains(event.target) && event.target !== $("siteSearch") && event.target !== $("siteSearchBtn")) {
        $("siteSearchResults").classList.remove("active");
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
        $("siteSearchResults").classList.remove("active");
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
          state.serviceId = game.services.find(service => service.category === state.category)?.id ?? null;
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
    startOrderFeed();
