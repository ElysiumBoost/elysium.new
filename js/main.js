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
      const fn = window.addToCart;
      if (typeof fn === "function") fn();
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
    $("memberCheckout")?.addEventListener("click", () => {
      if (typeof showToast === "function") showToast("Member checkout coming soon.");
    });
    $("cartPromoApply")?.addEventListener("click", () => {
      const input = $("cartPromoInput");
      const code = input ? input.value.trim() : "";
      if (!code) {
        if (typeof showToast === "function") showToast("Enter a promo code first.");
        return;
      }
      if (typeof showToast === "function") {
        showToast("Promo codes are validated in Discord during ticket review.");
      }
    });
    $("cartPromoInput")?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        $("cartPromoApply")?.click();
      }
    });
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

/* ── Scroll Reveal for eb-reveal elements ── */
(function initScrollReveal() {
  var els = document.querySelectorAll('.eb-reveal');
  if (!els.length) return;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('eb-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function(el) { io.observe(el); });
  } else {
    els.forEach(function(el) { el.classList.add('eb-in'); });
  }
})();

/* ── FAQ Accordion ── */
(function initFaqAccordion() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.eb-faq-btn');
    if (!btn) return;
    var row = btn.closest('.eb-faq-row');
    if (!row) return;
    var wasOpen = row.classList.contains('eb-open');
    document.querySelectorAll('.eb-faq-row.eb-open').forEach(function(r) {
      r.classList.remove('eb-open');
    });
    if (!wasOpen) row.classList.add('eb-open');
  });
})();

/* ── Featured game card navigation ── */
(function initFeaturedCards() {
  document.querySelectorAll('.eb-fcard[href^="#"]').forEach(function(card) {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      var hash = card.getAttribute('href');
      if (hash && hash.length > 1) {
        window.location.hash = hash.slice(1);
      }
    });
  });
  document.querySelectorAll('.eb-scard[href^="#"]').forEach(function(card) {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      var hash = card.getAttribute('href');
      if (hash && hash.length > 1) {
        window.location.hash = hash.slice(1);
      }
    });
  });
})();

/* ── Games rail scroll buttons ── */
(function initRailScroll() {
  var rail = document.getElementById('ebGamesRail');
  if (!rail) return;
  document.querySelectorAll('.eb-rail-nav').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var dir = btn.classList.contains('prev') ? -1 : 1;
      rail.scrollBy({ left: dir * 360, behavior: 'smooth' });
    });
  });
})();

/* ── Hero video muted autoplay ── */
(function initHeroVideo() {
  var video = document.querySelector('.eb-hero-video');
  if (!video) return;
  video.setAttribute('muted', '');
  video.muted = true;
  video.volume = 0;
  if (video.paused) {
    video.play().catch(function() {});
  }
})();

/* ── Landing nav scroll state ── */
(function initNavScroll() {
  var nav = document.getElementById('ebNav');
  if (!nav) return;
  function check() { nav.classList.toggle('eb-scrolled', window.scrollY > 40); }
  check();
  window.addEventListener('scroll', check, { passive: true });
})();

/* ── Shared nav search dropdown — class-based, auto-discovers any .eb-search-wrap ── */
(function initNavSearch() {
  var wraps = document.querySelectorAll('.eb-search-wrap');
  if (!wraps.length) return;
  // gamesHref: when on a subpage, root-relative paths back to landing's games
  var onSubpage = /\/pages\//.test(location.pathname);
  var arcHref = onSubpage ? '../../pages/games/arc-raiders.html' : 'pages/games/arc-raiders.html';
  var valHref = onSubpage ? '../../pages/games/valorant.html' : 'pages/games/valorant.html';
  var GAMES = [
    { name: 'Arc Raiders', href: arcHref },
    { name: 'Valorant', href: valHref },
    { name: 'TFT', href: '#tft' },
    { name: 'League of Legends', href: '#league-of-legends' },
    { name: 'CS2', href: '#cs2' }
  ];
  var arrowSvg = '<svg width="12" height="8" viewBox="0 0 16 10" fill="none"><path d="M0 5H14M14 5L10 1M14 5L10 9" stroke="currentColor" stroke-width="1.5"/></svg>';

  wraps.forEach(function (wrap) {
    var toggle = wrap.querySelector('.eb-search-toggle');
    var dropdown = wrap.querySelector('.eb-search-dropdown');
    var input = wrap.querySelector('.eb-search-input');
    var list = wrap.querySelector('.eb-search-list');
    if (!toggle || !dropdown || !input || !list) return;

    function render(q) {
      var filtered = q ? GAMES.filter(function (g) { return g.name.toLowerCase().indexOf(q) >= 0; }) : GAMES;
      if (filtered.length === 0) {
        list.innerHTML = '<div class="eb-search-empty">No games match "' + q + '"</div>';
        return;
      }
      list.innerHTML = filtered.map(function (g) {
        return '<a href="' + g.href + '" class="eb-search-result"><span>' + g.name + '</span><span class="arrow">' + arrowSvg + '</span></a>';
      }).join('');
    }
    function open() {
      dropdown.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      render('');
      setTimeout(function () { input.focus(); }, 30);
    }
    function close() {
      dropdown.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      input.value = '';
    }
    toggle.addEventListener('click', function () {
      dropdown.classList.contains('open') ? close() : open();
    });
    input.addEventListener('input', function () {
      render(input.value.trim().toLowerCase());
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dropdown.classList.contains('open')) close();
    });
    document.addEventListener('mousedown', function (e) {
      if (!wrap.contains(e.target)) close();
    });
    list.addEventListener('click', function () { close(); });
  });
})();

/* ══════════════════════════════════════════════════════════════
   ARC RAIDERS — Hub Map Controller
   ══════════════════════════════════════════════════════════════ */
(function initArcHub() {
  var hubView = document.getElementById('arcHubView');
  var hubMap = document.getElementById('arcHubMap');
  var sidebar = document.getElementById('arcSidebar');
  var sidebarOverlay = document.getElementById('arcSidebarOverlay');
  var sidebarBtn = document.getElementById('arcSidebarBtn');
  var sidebarClose = document.getElementById('arcSidebarClose');
  var scrollHint = document.getElementById('arcScrollHint');
  var backBtn = document.getElementById('arcBackBtn');
  if (!hubView) return;

  var CATEGORY_MAP = {
    'loadouts': 'loadouts',
    'guns': 'guns',
    'blueprints': 'blueprints',
    'leveling': 'leveling',
    'workshop': 'workshop',
    'materials': 'materials',
    'depositary': 'depositary',
    'bosses': 'bosses',
    'coins': 'coins',
    'trials': 'trials',
    'raids': 'raids',
    'expeditions': 'expeditions',
    'coaching': 'coaching',
    'custom': 'custom',
    'seeds': 'seeds'
  };

  var SERVICE_META = {
    'loadouts':     { name: 'Custom Loadout',     image: 'assets/custom-loadout.webp',   art: 'Fully kitted loadouts assembled and shipped to your Stash. Pick the weapons, mods, gear and consumables.', tags: ['Loadout','Weapons','Gear'], color: '#e08a2c' },
    'guns':         { name: 'All Weapons',         image: 'assets/all-weapons.webp',      art: 'Every weapon in the catalogue, any tier, any mods. Sold individually or in stacks.', tags: ['Weapons','Mods'], color: '#c98a2c' },
    'blueprints':   { name: 'Blueprints',          image: 'assets/blueprints.webp',       art: 'Unlock recipes for the gear you want to craft instead of grind.', tags: ['Blueprints'], color: '#7faedc' },
    'leveling':     { name: 'Leveling',            image: 'assets/leveling.webp',         art: 'Account leveling, contract progress, season-pass tiers — all done manually.', tags: ['Leveling','XP'], color: '#e5c26b' },
    'workshop':     { name: 'Workshop & Scrappy',  image: 'assets/workshop.webp',         art: 'Bench upgrades, recycled parts, scrappy contracts cleared on demand.', tags: ['Workshop','Scrap'], color: '#d4571b' },
    'materials':    { name: 'All Materials',       image: 'assets/all-materials.webp',    art: 'Stack-priced raw materials shipped straight to your Stash.', tags: ['Materials','Resources'], color: '#a3acb1' },
    'depositary':   { name: 'Depositary',          image: 'assets/depositary.webp',       art: 'Stash expansions, secure transfers, asset migration between characters.', tags: ['Storage'], color: '#b794d6' },
    'bosses':       { name: 'Boss & Puzzle',       image: 'assets/boss-puzzle.webp',      art: 'Lockout bosses cleared, puzzles solved, achievements unlocked.', tags: ['Boss','Puzzle'], color: '#c75059' },
    'coins':        { name: 'Raider Coins',        image: 'assets/raider-coins.webp',     art: 'Bulk Raider Coins delivered through verified trade routes.', tags: ['Currency'], color: '#e5c26b' },
    'trials':       { name: 'Trials Boost',        image: 'assets/trials-boost.webp',     art: 'Weekly trial completions, perfect runs, ranked trial placements.', tags: ['Trials'], color: '#ff8a3d' },
    'raids':        { name: 'Raid Bundles',        image: 'assets/raids.webp',            art: 'Endgame raid clears with verified Immortal-tier squad leaders.', tags: ['Raids','Squad'], color: '#ff4655' },
    'expeditions':  { name: 'Expedition Boost',    image: 'assets/expedition-boost.webp', art: 'Full expedition runs — sites swept, loot extracted, you keep everything.', tags: ['Expedition'], color: '#4ec6e8' },
    'coaching':     { name: 'Hourly Coaching',     image: 'assets/raid-coaching.webp',    art: '1-on-1 raid coaching with a pro: VOD review, route planning, mechanics.', tags: ['Coaching'], color: '#9b6cff' },
    'custom':       { name: 'Custom Orders',       image: 'assets/custom-orders.webp',    art: 'Off-menu requests handled by our concierge desk in Discord.', tags: ['Custom'], color: '#e08a2c' },
    'seeds':        { name: 'Assorted Seeds',      image: 'assets/assorted-seeds.webp',   art: 'Curated seed bundles for vault runs, drop chases, and rare encounters.', tags: ['Seeds','Drops'], color: '#4ea568' }
  };

  var artPanel = document.getElementById('arcArtPanel');
  var artImage = document.getElementById('arcArtImage');
  var artName  = document.getElementById('arcArtName');
  var artDesc  = document.getElementById('arcArtDesc');
  var artTags  = document.getElementById('arcArtTags');

  function updateArtPanel() {
    if (!artPanel) return;
    var hash = window.location.hash.replace(/^#\/?/, '');
    var slug = hash.replace('arc-raiders/', '');
    var meta = SERVICE_META[slug];
    if (!meta) return;
    artPanel.style.setProperty('--svc-color', meta.color);
    artImage.src = meta.image;
    artImage.alt = meta.name;
    artName.textContent = meta.name;
    artDesc.textContent = meta.art;
    artTags.innerHTML = '';
    meta.tags.forEach(function(t) {
      var span = document.createElement('span');
      span.className = 'arc-art-tag';
      span.textContent = t;
      artTags.appendChild(span);
    });
  }

  function isArcGame() {
    var hash = window.location.hash.replace(/^#\/?/, '');
    return hash === 'arc-raiders' || hash.indexOf('arc-raiders/') === 0;
  }

  function isHubMode() {
    var hash = window.location.hash.replace(/^#\/?/, '');
    return hash === 'arc-raiders';
  }

  function syncHubState() {
    var isArc = isArcGame();
    var isHub = isHubMode();

    if (isArc && isHub) {
      document.body.classList.add('arc-hub-active');
      hubView.style.display = '';
    } else if (isArc && !isHub) {
      document.body.classList.remove('arc-hub-active');
      hubView.style.display = '';
      updateArtPanel();
    } else {
      document.body.classList.remove('arc-hub-active');
      hubView.style.display = 'none';
    }
  }

  function navigateToService(categorySlug) {
    closeSidebar();
    window.location.hash = 'arc-raiders/' + categorySlug;
  }

  function navigateToHub() {
    closeSidebar();
    window.location.hash = 'arc-raiders';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Sidebar ---
  function openSidebar() {
    sidebar.classList.add('on');
    sidebarOverlay.classList.add('on');
    sidebar.setAttribute('aria-hidden', 'false');
  }

  function closeSidebar() {
    sidebar.classList.remove('on');
    sidebarOverlay.classList.remove('on');
    sidebar.setAttribute('aria-hidden', 'true');
  }

  if (sidebarBtn) sidebarBtn.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('on')) {
      closeSidebar();
    }
  });

  // --- Hotspot + sidebar item + mobile button clicks ---
  function bindServiceButtons(container) {
    container.querySelectorAll('[data-category]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var cat = btn.getAttribute('data-category');
        if (CATEGORY_MAP[cat]) {
          navigateToService(cat);
        }
      });
    });
  }

  bindServiceButtons(hubMap);
  bindServiceButtons(document.getElementById('arcHubMobile'));
  bindServiceButtons(sidebar);

  // --- Back to map ---
  if (backBtn) {
    backBtn.addEventListener('click', function(e) {
      e.preventDefault();
      navigateToHub();
    });
  }

  // --- Scroll hint fade ---
  function onScroll() {
    if (scrollHint) {
      if (window.scrollY > 40) {
        scrollHint.classList.add('hidden');
      } else {
        scrollHint.classList.remove('hidden');
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Travelling glow cycle on hotspots ---
  var hotspots = hubMap.querySelectorAll('.arc-hot');
  var glowState = { mode: 'idle', hoveredId: null, activeEl: null, timer: null };

  function clearGlow() {
    if (glowState.timer) { clearTimeout(glowState.timer); glowState.timer = null; }
  }

  function setGlow(el) {
    if (glowState.activeEl) glowState.activeEl.classList.remove('glow');
    glowState.activeEl = el;
    if (el) el.classList.add('glow');
  }

  function cycleGlow() {
    if (glowState.mode !== 'idle') return;
    var candidates = [];
    hotspots.forEach(function(h) {
      if (h !== glowState.activeEl) candidates.push(h);
    });
    if (candidates.length === 0) return;
    var next = candidates[Math.floor(Math.random() * candidates.length)];
    setGlow(next);
    var hold = 3000 + Math.random() * 2000;
    glowState.timer = setTimeout(function() {
      setGlow(null);
      glowState.timer = setTimeout(cycleGlow, 400);
    }, hold);
  }

  hotspots.forEach(function(h) {
    h.addEventListener('mouseenter', function() {
      clearGlow();
      glowState.mode = 'hovering';
      glowState.hoveredId = h;
      setGlow(h);
    });
    h.addEventListener('mouseleave', function() {
      if (glowState.hoveredId !== h) return;
      glowState.hoveredId = null;
      glowState.mode = 'paused';
      setGlow(null);
      glowState.timer = setTimeout(function() {
        glowState.mode = 'idle';
        cycleGlow();
      }, 1000);
    });
  });

  cycleGlow();

  // --- Listen for hash changes ---
  window.addEventListener('hashchange', syncHubState);
  syncHubState();
})();