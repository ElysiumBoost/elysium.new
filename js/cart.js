    function deliveryTypeForService(service, gameId) {
      if (!service) return "Manual delivery via Discord";
      const f = service.form;
      if (f && String(f).startsWith("valorant-")) return "Manual â€” piloted or duo (confirm in Discord)";
      if (f === "pvp" || f === "coaching") return "Coaching â€” Discord assisted";
      if (f === "raid" || f === "expedition") return "In-session / manual delivery";
      if (f === "fast") return "Manual queue / Discord assisted";
      return "Manual delivery via Discord";
    }

    function buildPriceBreakdownText(result) {
      if (result.arcPriceBreakdown && result.arcPriceBreakdown.rows && result.arcPriceBreakdown.rows.length) {
        return result.arcPriceBreakdown.rows.map(r => r[0] + ": " + r[1]).join("\n");
      }
      if (result.oldTotal && result.oldTotal > (result.total || 0)) {
        return ["Base: " + moneyUSD(result.oldTotal), "After adjustments: " + moneyUSD(result.total)].join("\n");
      }
      return result.total != null ? "Line total: " + moneyUSD(result.total) : "";
    }

    function playerIdForLineFromState() {
      const gid = currentGame()?.id;
      if (gid === "valorant") return state.riotId.trim();
      if (gid === "lol") return state.lolRiotId.trim();
      if (gid === "cs2" || gid === "premier" || gid === "faceit") return state.steamId.trim();
      if (gid === "wow") return [state.wowCharName, state.wowRealm].filter(Boolean).join(" â€” ") || state.wowCharacterRealm.trim();
      return "";
    }

    function updateStickyOrderChip() {
      const el = document.getElementById("stickyOrderChip");
      if (!el) return;
      if (!state.cart.length) {
        el.hidden = true;
        return;
      }
      el.hidden = false;
      const lines = state.cart.reduce((n, item) => n + (item.qty || 1), 0);
      const total = state.cart.reduce((sum, item) => sum + (item.custom ? 0 : item.total), 0);
      const hasCustom = state.cart.some(item => item.custom);
      const cur = state.cart[0]?.viewedCurrency || state.currency;
      const totalStr = hasCustom ? displayInCurrency(total, cur) + " + CUSTOM" : displayInCurrency(total, cur);
      const label = el.querySelector(".ely-sticky-order__text");
      if (label) label.textContent = ui("Order") + ": " + lines + " " + ui("items") + " â€” " + totalStr;
    }

    function bindOrderSummaryContext() {
      const bumpCartContextUi = () => {
        try {
          if (typeof refreshOrderChecklistIfOpen === "function") refreshOrderChecklistIfOpen();
          if (typeof updateCartFootAlerts === "function") updateCartFootAlerts();
        } catch (e) {}
      };
      const r = $("orderRegionSel");
      const p = $("orderPlatformSel");
      const ri = $("orderRiotInput");
      const st = $("orderSteamInput");
      const lr = $("orderLolRiotInput");
      const ls = $("orderLolServerInput");
      const wc = $("orderWowCharInput");
      const wrm = $("orderWowRealmInput");
      if (r) {
        r.value = state.orderRegion;
        r.onchange = () => {
          state.orderRegion = r.value;
          state.cart.forEach(item => { item.region = state.orderRegion; });
          persistOrderState();
          updateStickyOrderChip();
          bumpCartContextUi();
        };
      }
      if (p) {
        p.value = state.orderPlatform;
        p.onchange = () => {
          state.orderPlatform = p.value;
          state.cart.forEach(item => { item.platform = state.orderPlatform; });
          persistOrderState();
          updateStickyOrderChip();
          bumpCartContextUi();
        };
      }
      if (ri) {
        ri.value = state.riotId;
        ri.oninput = () => {
          state.riotId = ri.value;
          state.cart.forEach(item => {
            if (item.game === "Valorant") item.playerId = state.riotId.trim();
          });
          persistOrderState();
          bumpCartContextUi();
        };
      }
      if (st) {
        st.value = state.steamId;
        st.oninput = () => {
          state.steamId = st.value;
          state.cart.forEach(item => {
            if (
              item.gameId === "cs2" ||
              item.gameId === "premier" ||
              item.gameId === "faceit" ||
              item.game === "Premier" ||
              item.game === "Faceit" ||
              item.game === "Counter-Strike 2"
            ) {
              item.playerId = state.steamId.trim();
            }
          });
          persistOrderState();
          bumpCartContextUi();
        };
      }
      if (lr) {
        lr.value = state.lolRiotId;
        lr.oninput = () => {
          state.lolRiotId = lr.value;
          state.cart.forEach(item => {
            if (item.gameId === "lol") item.playerId = state.lolRiotId.trim();
          });
          persistOrderState();
          bumpCartContextUi();
        };
      }
      if (ls) {
        ls.value = state.lolServer;
        ls.oninput = () => {
          state.lolServer = ls.value;
          persistOrderState();
          bumpCartContextUi();
        };
      }
      if (wc || wrm) {
        const syncWowCartPlayerIds = () => {
          const combined = [state.wowCharName, state.wowRealm].map(s => String(s || "").trim()).filter(Boolean).join(" â€” ");
          state.wowCharacterRealm = combined;
          state.cart.forEach(item => {
            if (item.gameId === "wow") item.playerId = combined;
          });
        };
        let cn = state.wowCharName || "";
        let rm = state.wowRealm || "";
        if (!cn && !rm && state.wowCharacterRealm) {
          const parts = String(state.wowCharacterRealm).split(/\s*[â€”\-]\s*/);
          if (parts.length >= 2) {
            cn = parts[0].trim();
            rm = parts.slice(1).join(" â€” ").trim();
          } else {
            cn = state.wowCharacterRealm.trim();
          }
        }
        if (wc) {
          wc.value = cn;
          wc.oninput = () => {
            state.wowCharName = wc.value;
            syncWowCartPlayerIds();
            persistOrderState();
            bumpCartContextUi();
          };
        }
        if (wrm) {
          wrm.value = rm;
          wrm.oninput = () => {
            state.wowRealm = wrm.value;
            syncWowCartPlayerIds();
            persistOrderState();
            bumpCartContextUi();
          };
        }
      }
    }

    function syncCompactToggleLabel() {
      const btn = $("cartCompactToggle");
      if (!btn) return;
      btn.textContent = state.cartDrawerCompact ? ui("Full layout") : ui("Simpler layout");
      btn.setAttribute("aria-pressed", state.cartDrawerCompact ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        state.cartDrawerCompact ? ui("Switch to full order layout") : ui("Switch to simpler cart layout")
      );
    }

    function applyDrawerCompactClass() {
      document.querySelector(".drawer")?.classList.toggle("drawer--cart-compact", Boolean(state.cartDrawerCompact));
    }

    function restoreGameFromHash() {
      const id = parseGameHash();
      if (!id || !games.some(g => g.id === id)) return;
      const game = games.find(g => g.id === id);
      state.game = id;
      state.category = game.categories[0]?.id || "services";
      state.serviceId = game.services.find(service => service.category === state.category)?.id ?? null;
    }

    const $ = id => document.getElementById(id);
    const val = id => $(id)?.value || "";
    const num = id => Number(val(id) || 0);

    function resolveSiteUrl(relPath) {
      if (relPath == null || relPath === "") return relPath;
      const s = String(relPath).trim();
      if (/^(https?:|data:|\/\/)/i.test(s)) return s;
      try {
        return new URL(s, document.baseURI).href;
      } catch (e) {
        return s;
      }
    }

    function elyValorantThumbFallback(img) {
      elyImagePlaceholder(img);
    }

    function elyHomeCardFallback(img) {
      const fb = img.getAttribute("data-home-card-fb");
      if (fb && !img.dataset.homeCardFbTried) {
        img.dataset.homeCardFbTried = "1";
        img.src = fb;
        return;
      }
      elyImagePlaceholder(img);
    }

    function currentGame() { return games.find(game => game.id === state.game); }
    function currentService() {
      const game = currentGame();
      if (!game || !state.serviceId) return null;
      return game.services.find(service => service.id === state.serviceId) || null;
    }
    function moneyUSD(value) { return "$" + Number(value || 0).toFixed(2); }

    function displayMoney(value) {
      const currency = rates[state.currency];
      return currency.symbol + (Number(value || 0) * currency.rate).toFixed(2);
    }

    function displayInCurrency(value, currencyCode = state.currency) {
      const currency = rates[currencyCode] || rates.USD;
      return currency.symbol + (Number(value || 0) * currency.rate).toFixed(2);
    }

    function trName(name) { return name; }
    function ui(text) { return text; }
    function translateOrder(text) { return text; }
    function displayItemName(name) { return name; }
    function displayItemList(list) { return list.join(", "); }

    function comparePrice(value, service) {
      if (!value) return 0;
      if (service?.noDiscount) return 0;
      return service?.oldUSD || value * 1.3;
    }

    function servicePrice(service) {
      if (!service) return "";
      if (service.valorantCustomPrice || service.form === "valorant-radiant") return "Custom Price";
      if (service.form && String(service.form).startsWith("valorant-") && service.valorantFromEur != null) {
        return displayMoney(valorantEurToStoredTotal(service.valorantFromEur));
      }
      if (service.form === "private") return "CUSTOM";
      if (service.form === "loadout") return "CUSTOM";
      if (service.form === "leveling") return "CUSTOM";
      const old = comparePrice(service.fromUSD, service);
      const oldPrice = old ? `<del>${displayMoney(old)}</del>` : "";
      return oldPrice + displayMoney(service.fromUSD) + service.suffix;
    }

    function serviceSaleBadge(service) {
      if (!service || ["private", "loadout", "leveling"].includes(service.form) || !service.fromUSD || service.noDiscount) return "";
      const old = comparePrice(service.fromUSD, service);
      if (!old) return "";
      const percent = service.oldUSD ? Math.round((1 - service.fromUSD / service.oldUSD) * 100) : 30;
      return `<span class="price-old">${displayMoney(old)}</span> ${displayMoney(service.fromUSD)} ${service.suffix || ""} - ${percent}% off`;
    }

    function renderAll() {
      updateStaticText();
      renderGames();
      renderHero();
      renderHome();
      if (!state.game) {
        $("categoryBar").classList.add("hidden");
        $("serviceContent").classList.add("hidden");
        const cs = $("categoryScroll");
        if (cs) cs.innerHTML = "";
        renderCart();
        syncBodyGameContext();
        updateTotal();
        return;
      }
      $("serviceContent").classList.remove("hidden");
      renderCategories();
      renderPopular();
      renderServices();
      renderDetail();
      renderCart();
      syncBodyGameContext();
    }

    function applyHashRouteToState() {
      const id = parseGameHash();
      if (!id) {
        if (state.game != null || state.category != null || state.serviceId != null) {
          state.game = null;
          state.category = null;
          state.serviceId = null;
          renderAll();
        }
        return;
      }
      if (!games.some(g => g.id === id)) return;
      const game = games.find(g => g.id === id);
      state.game = id;
      state.category = game.categories[0]?.id || "services";
      state.serviceId = game.services.find(service => service.category === state.category)?.id ?? null;
      sanitizeNavigationState();
      renderAll();
    }

    function syncBodyGameContext() {
      if (state.game) document.body.dataset.elyGame = state.game;
      else delete document.body.dataset.elyGame;
    }

    function updateStaticText() {
      $("siteSearch").placeholder = ui("Search services");
      $("siteSearchBtn").setAttribute("aria-label", ui("Search"));
      $("siteSearchBtn").setAttribute("title", ui("Search"));
      $("cartOpen").setAttribute("aria-label", ui("Open order summary"));
      $("cartOpen").setAttribute("title", ui("Order summary"));
      $("gameMenuBtn").setAttribute("aria-label", ui("Games menu"));
      $("gameMenuBtn").setAttribute("title", ui("Games"));
      const gl = $("gameMenuBtn")?.querySelector(".game-menu-btn-label");
      if (gl) gl.textContent = ui("Games");
      $("clearService").textContent = ui("Clear");
      $("addToCart").textContent = ui("Add to Cart");
      const copyBtn = $("copyOrder");
      if (copyBtn) copyBtn.textContent = ui("Copy Order & Open Discord");
      const dlR = $("downloadOrderReceipt");
      if (dlR) dlR.textContent = ui("Download Receipt Image");
      const vNote = $("cartVerifyNote");
      if (vNote) vNote.textContent = ui("Attach the receipt image only if support asks.");
      syncCompactToggleLabel();
      const discA = document.querySelector('a[href*="1499796035382415462"]');
      if (discA) discA.textContent = ui("Open Discord");
      const drawerH = document.querySelector(".drawer-head h2");
      if (drawerH) drawerH.textContent = ui("Order center");
      const ctl = $("cartTotalLabel");
      if (ctl) ctl.textContent = ui("Final total");
    }

    function closeGameMenu() {
      const btn = $("gameMenuBtn");
      const panel = $("gameMenuPanel");
      if (!btn || !panel) return;
      panel.classList.remove("is-open");
      panel.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", "false");
    }

    function openGameMenu() {
      const btn = $("gameMenuBtn");
      const panel = $("gameMenuPanel");
      if (!btn || !panel) return;
      panel.removeAttribute("hidden");
      panel.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    }

    function gameMenuLabel(game) {
      if (game.id === "circle") return ui("Boost+");
      if (game.id === "social") return ui("Social");
      return ui(game.label);
    }

    function setupGameMenuListeners() {
      if (setupGameMenuListeners.done) return;
      const wrap = $("gameTabs");
      const btn = $("gameMenuBtn");
      const panel = $("gameMenuPanel");
      if (!wrap || !btn || !panel) return;
      setupGameMenuListeners.done = true;
      btn.addEventListener("click", event => {
        event.stopPropagation();
        if (panel.classList.contains("is-open")) closeGameMenu();
        else openGameMenu();
      });
      panel.addEventListener("click", event => {
        const row = event.target.closest("[data-game-menu-id]");
        if (!row) return;
        event.stopPropagation();
        selectGame(row.dataset.gameMenuId);
      });
      document.addEventListener("click", event => {
        if (!wrap.contains(event.target)) closeGameMenu();
      });
    }

    function selectGame(id) {
      if (!games.some(g => g.id === id)) {
        showToast("That game is not available.");
        return;
      }
      const slug = GAME_HASH_SLUGS[id];
      if (!slug) {
        showToast("That game is not available.");
        return;
      }
      closeGameMenu();
      const frag = "#" + slug;
      if (location.hash === frag) {
        const game = games.find(g => g.id === id);
        state.game = id;
        state.category = game.categories[0]?.id || "services";
        state.serviceId = game.services.find(service => service.category === state.category)?.id ?? null;
        sanitizeNavigationState();
        renderAll();
      } else {
        location.hash = slug;
      }
      requestAnimationFrame(() => {
        const target = $("serviceHead") || $("serviceContent");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    function renderGames() {
      closeGameMenu();
      const rank = gid => {
        const i = GAME_DROPDOWN_ORDER.indexOf(gid);
        return i === -1 ? 99 : i;
      };
      const panel = $("gameMenuPanel");
      if (!panel) return;
      panel.innerHTML = games
        .filter(game => GAME_DROPDOWN_ORDER.includes(game.id))
        .sort((a, b) => rank(a.id) - rank(b.id))
        .map(game => {
          const active = game.id === state.game ? " is-active" : "";
          return `<button type="button" class="game-menu-item${active}" role="menuitem" data-game-menu-id="${game.id}">${escapeHtml(gameMenuLabel(game))}</button>`;
        })
        .join("");
      setupGameMenuListeners();
      const gmb = $("gameMenuBtn");
      if (gmb) gmb.classList.toggle("has-active-game", Boolean(state.game));
    }

    function renderHome() {
      $("homeContent").classList.toggle("hidden", Boolean(state.game));
      const g = id => games.find(x => x.id === id);

      const homeBlurb = game => {
        const id = game.id;
        const map = {
          arc: "Manual boosting for Arc — coins, blueprints, weapons, trials, raids. Discord-confirmed handoffs.",
          valorant: "Rank paths, placements, wins, and coaching. Live pricing in your currency.",
          lol: "Wins, duo queue, and coaching — compact orders with Discord confirmation.",
          tft: "Teamfight Tactics services and offers will be available here soon.",
          wow: "Mythic+, raids, arena, and more. Hub expands as listings go live.",
          cs2: "Premier and FACEIT queues in one hub. CS2 listings open soon.",
          circle: "Boost+ teammate sessions are on the way. Full ordering opens after listings go live.",
          social: "Companion and social services — clear requests in Discord."
        };
        return map[id] || (game.copy && game.copy.split(".")[0] + ".") || "";
      };

      const gameAria = label => `${ui("View")} ${ui(label)} ${ui("services")}`;
      const homeCardSrc = game => (game.homeCardImage || game.heroBg);

      const renderHomeSingleCard = game => {
        const media = `<img class="home-game-media" src="${escapeHtml(homeCardSrc(game))}" alt="${escapeHtml(ui(game.label))}" loading="eager" data-home-card-fb="${escapeHtml(game.heroBg)}" onerror="elyHomeCardFallback(this)">`;
        return `
        <button class="home-game-card" type="button" data-home-game="${game.id}" aria-label="${escapeHtml(gameAria(game.label))}">
          ${media}
          <h2>${ui(game.label)}</h2>
          <p class="home-game-blurb">${escapeHtml(ui(homeBlurb(game)))}</p>
          <span class="home-game-hint" aria-hidden="true">${ui("View services")}</span>
        </button>`;
      };

      const chunks = [];
      ["arc", "valorant", "lol", "tft", "wow", "cs2", "circle", "social"].forEach(id => {
        const game = g(id);
        if (game) chunks.push(renderHomeSingleCard(game));
      });

      $("homeGameGrid").innerHTML = chunks.join("");

      const ab = $("homeAboutBlock");
      if (ab) {
        ab.innerHTML = `
        <article class="info-card info-card--compact">
          <h3>${ui("About ELYSIUM BOOST")}</h3>
          <p>${ui("ELYSIUM BOOST provides premium manual game services with verified boosters, clean Discord-ticket order flow and fast support. Every order is handled with safety, clarity and professional delivery standards.")}</p>
        </article>
        <article class="info-card info-card--compact">
          <h3>${ui("Transparent pricing")}</h3>
          <p>${ui("Browse in your currency. Your cart, ticket, and receipt use the same currency so totals always match.")}</p>
        </article>`;
      }
    }
    const serviceImages = {
      blueprints: "assets/thumb-blueprints.webp",
      guns: "assets/thumb-guns.webp",
      loadouts: "assets/thumb-loadouts.webp",
      coins: "assets/thumb-coins.webp",
      seeds: "assets/thumb-seeds.webp",
      depositary: "assets/thumb-depository.webp",
      trials: "assets/thumb-trials.webp",
      raids: "assets/thumb-raids.webp",
      coaching: "assets/thumb-coaching.webp",
      leveling: "assets/thumb-leveling.webp",
      workshop: "assets/thumb-workshop.webp",
      bosses: "assets/thumb-boss.webp",
      expeditions: "assets/thumb-expedition.webp",
      custom: "assets/thumb-private-order.webp",
      services: "assets/thumb-private-order.webp",
      "rank-boosting": "assets/valorant-rank-boosting.webp",
      "placement-matches": "assets/valorant-placement-matches.webp",
      "radiant-boost": "assets/valorant-radiant-boost.webp",
      "ranked-wins": "assets/valorant-ranked-wins.webp",
      "unrated-games": "assets/valorant-unrated-games.webp",
      "account-leveling": "assets/valorant-account-leveling.webp",
      "battle-pass": "assets/valorant-battle-pass.webp",
      "mythic-plus": "assets/thumb-private-order.webp",
      "raid-calendar": "assets/thumb-raids.webp",
      arena: "assets/thumb-private-order.webp",
      "gear-boost": "assets/thumb-loadouts.webp",
      "gold-trade": "assets/thumb-coins.webp",
      delves: "assets/thumb-private-order.webp",
      dungeons: "assets/thumb-private-order.webp",
      "request-a-service": "assets/thumb-private-order.webp",
      "timewalking-mage-tower": "assets/thumb-private-order.webp",
      mounts: "assets/thumb-private-order.webp"
    };

    function categoryArtwork(id, label = "", thumbOverride) {
      const game = currentGame();
      let valThumb = "";
      if (game && game.id === "valorant") {
        const cat = valorantCategories.find(c => c.id === id);
        if (cat && (cat.thumb || cat.image)) valThumb = cat.thumb || cat.image;
      }
      const override = thumbOverride != null && String(thumbOverride).trim() !== "" ? String(thumbOverride).trim() : "";
      const src = override || valThumb || serviceImages[id] || serviceImages.custom;
      const isVal = game && game.id === "valorant";
      const errFn = isVal ? ` onerror="elyValorantThumbFallback(this)"` : ` onerror="elyImagePlaceholder(this)"`;
      return `<div class="service-thumb"><img src="${escapeHtml(src)}" alt="${escapeHtml(label)}" loading="eager"${errFn}></div>`;
    }
    function selectCategory(categoryId) {
      pauseCategoryAuto(3500);
      const game = currentGame();
      state.category = categoryId;
      state.serviceId = game.services.find(service => service.category === state.category)?.id ?? null;
      renderCategories();
      renderPopular();
      renderServices();
      renderDetail();
      requestAnimationFrame(() => {
        const target = $("detailLeftHead") || $("serviceHead");
        if (target && game?.categories?.length) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    function renderCategories() {
      const game = currentGame();
      $("categoryBar").classList.toggle("hidden", game.categories.length === 0);
      $("categoryBar").classList.toggle("circle-mode", game.id === "circle");
      $("categoryBar").classList.toggle("neon-game-cats", game.id === "wow");
      $("categoryBar").classList.toggle("tft-cats", game.id === "tft");
      if (game.id === "wow") {
        const catSvg = wowCategorySvg;
        $("categoryScroll").innerHTML = game.categories.map(cat => {
          const svg = catSvg(cat.icon);
          const rib = cat.badge ? `<span class="cat-ribbon ${cat.badgeTone || cat.badgeType || "hot"} cat-ribbon--val">${escapeHtml(cat.badge)}</span>` : "";
          const featured = cat.featured ? " cat-btn--featured" : "";
          return `<button class="cat-btn cat-btn--val${featured} ${cat.id === state.category ? "active" : ""}" type="button" data-cat="${cat.id}">
            <span class="cat-val-ring">${rib}<span class="cat-val-svg-wrap">${svg}</span></span>
            <span class="cat-label">${ui(cat.label)}</span>
          </button>`;
        }).join("");
      } else {
        $("categoryScroll").innerHTML = game.categories.map(cat => {
          const thumbOpt = cat.thumb || cat.image || cat.bg;
          const micro =
            game.id === "arc"
              ? ""
              : cat.microBadge
                ? `<span class="cat-micro">${escapeHtml(ui(cat.microBadge))}</span>`
                : "";
          return `
        <button class="cat-btn ${cat.id === state.category ? "active" : ""}" type="button" data-cat="${cat.id}" ${cat.bg ? `style="--cat-bg:url('${escapeHtml(resolveSiteUrl(cat.bg))}')"` : ""}>
          ${cat.badge ? `<span class="cat-ribbon ${cat.badgeTone || cat.badgeType || "hot"}">${escapeHtml(cat.badge)}</span>` : ""}
          ${categoryArtwork(cat.id, ui(cat.label), thumbOpt)}
          <span class="cat-label">${ui(cat.label)}</span>
          ${micro}
        </button>`;
        }).join("");
      }
      document.querySelectorAll("[data-cat]").forEach(button => button.addEventListener("click", event => {
        if (categoryMotion.didDrag || categoryMotion.skipClick) {
          event.preventDefault();
          categoryMotion.skipClick = false;
          return;
        }
        selectCategory(button.dataset.cat);
      }));
      bindCategoryArrows();
      setupCategoryMotion();
    }

    function renderHero() {
      const game = currentGame();
      const hero = $("hero");
      const sub = $("heroSubtitle");
      const lead = $("heroCopy");
      const kicker = $("heroKicker");
      const row = $("heroCtaRow");
      if (game) {
        hero.classList.remove("is-home");
        hero.style.setProperty("--hero-bg", `url("${resolveSiteUrl(game.heroBg)}")`);
        if (kicker) kicker.style.display = "";
        if (sub) sub.style.display = "none";
        if (lead) lead.style.display = "";
        $("heroKicker").textContent = ui(game.kicker);
        $("heroTitle").textContent = ui(game.title);
        $("heroCopy").textContent = ui(game.copy);
        if (row) row.style.display = "none";
      } else {
        hero.classList.add("is-home");
        hero.style.removeProperty("--hero-bg");
        hero.style.removeProperty("--hero-position");
        if (kicker) kicker.style.display = "";
        if (sub) sub.style.display = "";
        if (lead) lead.style.display = "";
        if (row) {
          row.style.display = "";
          row.style.justifyContent = "center";
        }
        $("heroTitle").textContent = ui("Premium Game Boosting");
        $("heroCopy").textContent = "";
      }
    }

    function renderPopular() {
      const game = currentGame();
      if (!game) return;
      $("popularHead")?.classList.add("is-hidden");
      $("popularGrid")?.classList.add("is-hidden");
      if ($("popularGrid")) $("popularGrid").innerHTML = "";
    }

    function renderServices() {
      const game = currentGame();
      const category = game.categories.find(cat => cat.id === state.category);
      const list = game.categories.length ? game.services.filter(service => service.category === state.category) : game.services;
      $("serviceTitle").textContent = category ? ui(category.label) : ui(game.label) + " " + ui("Services");
      $("serviceCopy").textContent = game.id === "arc" ? ui("Premium marketplace for loot, currencies, and raid services â€” open a card to quote and cart.") : ui("Select a service and adjust the order panel below.");
      const isEmpty = list.length === 0;
      $("serviceHead").classList.toggle("is-hidden", list.length <= 1 && !isEmpty);
      $("serviceGrid").classList.toggle("is-hidden", list.length <= 1 && !isEmpty);
      $("serviceGrid").innerHTML = isEmpty
        ? `<p class="intro service-empty">${ui("No services available yet.")}</p>`
        : list.map(service => cardMarkup(service, false)).join("");
      bindServiceButtons();
    }

    function bindCategoryArrows() {
      const scroller = $("categoryScroll");
      const clampScroll = left => Math.max(0, Math.min(Math.max(0, scroller.scrollWidth - scroller.clientWidth), left));
      const stepSize = () => {
        const first = scroller.querySelector(".cat-btn");
        if (!first) return 0;
        const styles = getComputedStyle(scroller);
        const gap = parseFloat(styles.columnGap || styles.gap || "12") || 12;
        return first.offsetWidth + gap;
      };
      const move = direction => {
        pauseCategoryAuto(6000);
        const step = stepSize();
        if (!step) return;
        const pageStep = step * 3;
        const currentPage = Math.round(scroller.scrollLeft / pageStep);
        scroller.scrollTo({ left: clampScroll((currentPage + direction) * pageStep), behavior: "smooth" });
      };
      $("catPrev").onclick = () => move(-1);
      $("catNext").onclick = () => move(1);
    }

    const categoryMotion = {
      bound: false,
      paused: false,
      pauseUntil: 0,
      dragging: false,
      didDrag: false,
      skipClick: false,
      startX: 0,
      startY: 0,
      startLeft: 0,
      targetCat: "",
      direction: 1,
      raf: 0,
      pointerId: null,
      indicatorHideTimer: null,
      dragThresholdPx: 8
    };

    function suppressNextCategoryStripClick(scroller) {
      const kill = e => {
        if (!e.target.closest?.("#categoryScroll")) return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      };
      scroller.addEventListener("click", kill, { capture: true, once: true });
    }

    function updateCategoryDragIndicator() {
      const scroller = $("categoryScroll");
      const thumb = $("categoryDragIndicatorThumb");
      if (!scroller || !thumb) return;
      const denom = scroller.scrollWidth || 1;
      const vis = scroller.clientWidth;
      const thumbWpct = Math.max(10, Math.min(100, (vis / denom) * 100));
      const maxScroll = Math.max(0, scroller.scrollWidth - vis);
      const ratio = maxScroll <= 0 ? 0 : scroller.scrollLeft / maxScroll;
      const travel = Math.max(0, 100 - thumbWpct);
      thumb.style.width = thumbWpct + "%";
      thumb.style.marginLeft = ratio * travel + "%";
    }

    function showCategoryDragIndicator() {
      const el = $("categoryDragIndicator");
      if (!el) return;
      if (categoryMotion.indicatorHideTimer) {
        clearTimeout(categoryMotion.indicatorHideTimer);
        categoryMotion.indicatorHideTimer = null;
      }
      el.classList.add("is-active");
      updateCategoryDragIndicator();
    }

    function scheduleHideCategoryDragIndicator() {
      const el = $("categoryDragIndicator");
      if (!el) return;
      if (categoryMotion.indicatorHideTimer) clearTimeout(categoryMotion.indicatorHideTimer);
      categoryMotion.indicatorHideTimer = setTimeout(() => {
        categoryMotion.indicatorHideTimer = null;
        el.classList.remove("is-active");
      }, 900);
    }

    function pauseCategoryAuto(ms = 4000) {
      categoryMotion.pauseUntil = Date.now() + ms;
    }

    function setupCategoryMotion() {
      const scroller = $("categoryScroll");
      if (!categoryMotion.bound) {
        categoryMotion.bound = true;
        scroller.addEventListener("mouseenter", () => { categoryMotion.paused = true; });
        scroller.addEventListener("mouseleave", () => { categoryMotion.paused = false; });
        scroller.addEventListener("wheel", () => pauseCategoryAuto(7000), { passive: true });
        scroller.addEventListener("scroll", () => {
          if ($("categoryDragIndicator")?.classList.contains("is-active")) updateCategoryDragIndicator();
        }, { passive: true });
        scroller.addEventListener("pointerdown", event => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          categoryMotion.dragging = true;
          categoryMotion.didDrag = false;
          categoryMotion.startX = event.clientX;
          categoryMotion.startY = event.clientY;
          categoryMotion.startLeft = scroller.scrollLeft;
          categoryMotion.targetCat = event.target.closest("[data-cat]")?.dataset.cat || "";
          categoryMotion.pointerId = event.pointerId;
          scroller.classList.add("dragging");
          pauseCategoryAuto(8000);
          try {
            scroller.setPointerCapture(event.pointerId);
          } catch (e) {}
        });
        scroller.addEventListener("pointermove", event => {
          if (!categoryMotion.dragging) return;
          const dx = event.clientX - categoryMotion.startX;
          const dy = event.clientY - categoryMotion.startY;
          if (Math.hypot(dx, dy) > categoryMotion.dragThresholdPx) {
            categoryMotion.didDrag = true;
            showCategoryDragIndicator();
          }
          if (categoryMotion.didDrag) {
            scroller.scrollLeft = categoryMotion.startLeft - dx;
            updateCategoryDragIndicator();
          }
        });
        const stopDrag = event => {
          const wasDrag = categoryMotion.didDrag;
          const shouldSelect = !categoryMotion.didDrag && categoryMotion.targetCat;
          categoryMotion.dragging = false;
          scroller.classList.remove("dragging");
          if (categoryMotion.pointerId != null) {
            try {
              if (scroller.hasPointerCapture?.(categoryMotion.pointerId)) scroller.releasePointerCapture(categoryMotion.pointerId);
            } catch (e) {}
            categoryMotion.pointerId = null;
          }
          pauseCategoryAuto(6000);
          if (wasDrag) {
            suppressNextCategoryStripClick(scroller);
            updateCategoryDragIndicator();
            scheduleHideCategoryDragIndicator();
          } else if ($("categoryDragIndicator")?.classList.contains("is-active")) {
            scheduleHideCategoryDragIndicator();
          }
          if (shouldSelect) {
            categoryMotion.skipClick = true;
            selectCategory(categoryMotion.targetCat);
          }
          categoryMotion.targetCat = "";
          setTimeout(() => { categoryMotion.didDrag = false; }, 0);
        };
        scroller.addEventListener("pointerup", stopDrag);
        scroller.addEventListener("pointercancel", stopDrag);
      }
      if (!categoryMotion.raf) {
        const tick = () => {
          const maxLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
          const canMove = maxLeft > 12 && !categoryMotion.paused && !categoryMotion.dragging && Date.now() > categoryMotion.pauseUntil && state.game;
          if (canMove) {
            if (scroller.scrollLeft >= maxLeft - 1) categoryMotion.direction = -1;
            if (scroller.scrollLeft <= 1) categoryMotion.direction = 1;
            scroller.scrollLeft += categoryMotion.direction * .28;
          }
          categoryMotion.raf = requestAnimationFrame(tick);
        };
        categoryMotion.raf = requestAnimationFrame(tick);
      }
    }

    function premiumCardBullets() {
      return `<ul class="service-card__bullets"><li>${ui("Manual delivery â€” Discord ticket & verified booster")}</li><li>${ui("Your currency on the ticket and in cart")}</li><li>${ui("No cheats â€” safety-first process")}</li></ul>`;
    }

    function buildDetailSpecs(service) {
      let pkg = "";
      const vg = currentGame()?.id === "valorant";
      const vf = service.form && String(service.form).startsWith("valorant-");
      if (vg && vf) {
        const cat = typeof valorantCategoryContent !== "undefined" ? valorantCategoryContent[service.category] : null;
        if (cat && cat.highlights && cat.highlights.length) {
          pkg = cat.highlights.slice(0, 4).map(h => ui(h)).join(" Â· ");
        }
      }
      if (!pkg) {
        const intro = ui(service.intro || "").trim();
        pkg = intro.length > 12 ? intro.slice(0, 200) + (intro.length > 200 ? "â€¦" : "") : ui("Full delivery as configured in the order panel â€” tailored options you select below.");
      }
      return `
        <h4 class="detail-specs__k">${ui("Package includes")}</h4>
        <p>${escapeHtml(pkg)}</p>
        <h4 class="detail-specs__k">${ui("Delivery method")}</h4>
        <p>${escapeHtml(ui("Manual coordination through Discord after you paste your ticket â€” booster assigned by support."))}</p>
        <h4 class="detail-specs__k">${ui("Safety & guarantee")}</h4>
        <p>${escapeHtml(ui("Verified boosters, transparent ticket text, and completion terms confirmed in Discord before play."))}</p>
      `;
    }

    function cardMarkup(service, popular) {
      const serviceVisual = categoryArtwork(service.category || "custom", service.cardTitle);
      const priceBlock = `${(service.valorantCustomPrice || service.form === "valorant-radiant") ? "" : "<small>From</small>"}${servicePrice(service)}`;
      if (popular) {
        return `
          <article class="popular-card">
            <span class="popular-badge">${ui("Best seller")}</span>
            <div class="popular-card__inner">
              <div class="popular-card__media"><span class="category-thumb">${serviceVisual}</span></div>
              <div class="popular-card__body">
                <h3>${ui(service.cardTitle)}</h3>
                <p>${ui(service.short)}</p>
                ${premiumCardBullets()}
                <div class="price">${priceBlock}</div>
                <button class="service-btn btn-premium ${state.serviceId === service.id ? "active" : ""}" type="button" data-service="${service.id}">${ui("View Details")}</button>
              </div>
            </div>
          </article>
        `;
      }
      return `
        <article class="service-card">
          <div class="service-card__media"><span class="category-thumb">${serviceVisual}</span></div>
          <div class="service-card__body">
            <h3>${ui(service.cardTitle)}</h3>
            <p>${ui(service.short)}</p>
            ${premiumCardBullets()}
            <footer>
              <div class="price">${priceBlock}</div>
              <button class="service-btn btn-glass ${state.serviceId === service.id ? "active" : ""}" type="button" data-service="${service.id}">${ui("Details")}</button>
            </footer>
          </div>
        </article>
      `;
    }

    function bindServiceButtons() {
      document.querySelectorAll("[data-service]").forEach(button => button.addEventListener("click", () => {
        state.serviceId = button.dataset.service;
        const service = currentService();
        if (service) state.category = service.category;
        renderCategories();
        renderPopular();
        renderServices();
        renderDetail();
        ($("detailLeftHead") || $("detailSection")).scrollIntoView({ behavior: "smooth", block: "start" });
      }));
    }

    function renderDetail() {
      const service = currentService();
      state.bpTab = "Gun Blueprints";
      state.blueprintSelections = {
        "Gun Blueprints": new Set(),
        "Backpack Blueprints": new Set(),
        "Quick Use Blueprints": new Set(),
        "Gun Part Blueprints": new Set()
      };
      if (!service) {
        const cg = currentGame();
        const thumbCat = "services";
        const thumbName = cg ? ui(cg.label) : ui("Services");
        $("detailIcon").innerHTML = categoryArtwork(thumbCat, thumbName);
        const comingSoonGame =
          cg && window.ELY_COMING_SOON_GAME_IDS instanceof Set && window.ELY_COMING_SOON_GAME_IDS.has(cg.id);
        $("detailTitle").textContent = ui(comingSoonGame ? "Coming soon" : "No services available yet.");
        $("detailIntro").textContent = cg ? ui(cg.copy || "") : "";
        $("detailDeal").innerHTML = "";
        $("detailSteps").innerHTML = "";
        $("orderForm").innerHTML = "";
        const dft0 = $("detailFeatureThumb");
        const ds0 = $("detailSpecs");
        if (dft0) {
          dft0.innerHTML = "";
          dft0.setAttribute("aria-hidden", "true");
        }
        if (ds0) {
          ds0.innerHTML = "";
          ds0.hidden = true;
        }
        const hl0 = $("detailHighlights");
        const vt0 = $("detailValorantTrust");
        if (hl0) { hl0.hidden = true; hl0.innerHTML = ""; }
        if (vt0) { vt0.hidden = true; vt0.innerHTML = ""; }
        renderOrderFeed();
        teardownValorantOrderChrome();
        syncValorantOrderFormMount(null);
        updateTotal();
        return;
      }
      const dft = $("detailFeatureThumb");
      const ds = $("detailSpecs");
      if (dft) {
        dft.innerHTML = categoryArtwork(service.category || "custom", service.cardTitle);
        dft.setAttribute("aria-hidden", "false");
      }
      if (ds) {
        ds.innerHTML = buildDetailSpecs(service);
        ds.hidden = false;
      }
      $("detailIcon").innerHTML = categoryArtwork(service.category || "custom", service.cardTitle);
      $("detailTitle").textContent = ui(service.title);
      $("detailIntro").textContent = ui(service.intro);
      $("detailDeal").innerHTML = serviceSaleBadge(service);
      const hl = $("detailHighlights");
      const vtr = $("detailValorantTrust");
      const vg = currentGame()?.id === "valorant";
      const vForm = service.form && String(service.form).startsWith("valorant-");
      if (hl && vtr) {
        if (vg && vForm) {
          const cat = valorantCategoryContent[service.category];
          if (cat && cat.highlights && cat.highlights.length) {
            hl.hidden = false;
            hl.innerHTML = `<h4>${escapeHtml(ui("Highlights"))}</h4><ul>${cat.highlights.map(h => `<li>${escapeHtml(ui(h))}</li>`).join("")}</ul>`;
            vtr.hidden = false;
            vtr.innerHTML = `<h4>${escapeHtml(ui(valorantTrustBlock.title))}</h4><p>${escapeHtml(ui(valorantTrustBlock.intro))}</p><ul>${valorantTrustBlock.points.map(p => `<li>${escapeHtml(ui(p))}</li>`).join("")}</ul>`;
          } else {
            hl.hidden = true;
            hl.innerHTML = "";
            vtr.hidden = true;
            vtr.innerHTML = "";
          }
        } else {
          hl.hidden = true;
          hl.innerHTML = "";
          vtr.hidden = true;
          vtr.innerHTML = "";
        }
      }
      const vgSteps = vg;
      $("detailSteps").innerHTML = vgSteps ? "" : detailSteps(service.form).map(step => `
        <div class="detail-step"><strong>${ui(step.title)}</strong><span>${ui(step.copy)}</span></div>
      `).join("");
      renderOrderFeed();
      $("orderForm").innerHTML = buildForm(service.form);
      syncValorantOrderFormMount(service);
      setupValorantOrderChrome();
      wireForm(service.form);
      updateTotal();
    }

    function detailSteps(type) {
      const shared = {
        blueprints: [
          { title: "Pick Items", copy: "Select each blueprint group from the tabs and tick the exact items you want." },
          { title: "Add Order", copy: "The cart keeps every selected item separated by category for clean review." },
          { title: "Discord Ticket", copy: "Copy the summary and paste it into your ticket so boosters can confirm delivery." }
        ],
        coins: [
          { title: "Set Amount", copy: "Drag the coin slider from 100k to 10M and watch the total update instantly." },
          { title: "Review USD", copy: "You can browse locally, while boosters receive a clean USD ticket value." },
          { title: "Confirm", copy: "Paste the order into Discord and boosters will confirm delivery instructions." }
        ],
        depositary: [
          { title: "Choose Slots", copy: "Select safe storage capacity from 5 to 50 inventory slots." },
          { title: "Secure Items", copy: "Boosters confirm the handoff plan and keep the ticket list clean." },
          { title: "Return Order", copy: "After confirmation, items are returned using the Discord ticket instructions." }
        ],
        trials: [
          { title: "Choose Service", copy: "Select Weekly All 3 Star Trials, rank-up service, or both together." },
          { title: "Set Rank", copy: "Pick your current rank so the correct rank-up options and prices unlock." },
          { title: "Send Ticket", copy: "Add to cart and copy the Discord ticket for boosters confirmation." }
        ],
        loadout: [
          { title: "Build Loadout", copy: "Choose a weapon, mods, gear, quick-use bundles, or a 10x/20x special bundle." },
          { title: "Check Total", copy: "Weapons and mod quantities are priced separately to avoid bundle mistakes." },
          { title: "Deliver Notes", copy: "Your ticket lists every item line by line for Discord delivery." }
        ],
        raid: [
          { title: "Choose Count", copy: "Pick a 2x to 12x raid package and enable Event Mode only if needed." },
          { title: "Event Option", copy: "Event Mode adds a fixed per-raid event fee when toggled on." },
          { title: "Successful Runs", copy: "Only completed raids count. Failed attempts are retried or compensated by boosters." }
        ],
        pvp: [
          { title: "Pick Focus", copy: "Choose PvP for combat improvement or PvE for routes, loot safety, and raid planning." },
          { title: "Set Session", copy: "Choose Duo or Trio and book up to 6 hours per ticket." },
          { title: "Confirm Goals", copy: "Boosters confirm schedule, platform, and exact coaching goals in Discord." }
        ],
        leveling: [
          { title: "Account Access", copy: "Leveling requires Steam or Xbox account access; otherwise boosters cannot log in." },
          { title: "VPN Location", copy: "For account protection, boosters can use the customer's preferred VPN location." },
          { title: "Final Total", copy: "Current level, target level, and speed are calculated privately before ticket confirmation." }
        ],
        boss: [
          { title: "Pick Target", copy: "Choose Queen, Matriarch, or Harvester Puzzle in the order panel." },
          { title: "Set Quantity", copy: "Add the amount you need and boosters will confirm availability." },
          { title: "Ticket Notes", copy: "The copied ticket keeps the boss or puzzle target clear for delivery." }
        ]
      };
      const valorantSteps = {
        "valorant-rank-boost": [
          { title: "Rank Path", copy: "Select your current rank and a higher desired rank; ElysiumBoost sums each transition in EUR with live conversion to your currency." },
          { title: "Mode & Extras", copy: "Choose Solo or Duo and optional paid extras. Server is captured for reference and does not change the price." },
          { title: "Review & Cart", copy: "Confirm the order summary, then add the line to your cart with the final total." }
        ],
        "valorant-placement": [
          { title: "Placement Setup", copy: "Choose last known rank, number of placement games (1â€“5), and Solo or Duo." },
          { title: "Extras", copy: "Optional paid extras stack as a percentage on the EUR base before currency display." },
          { title: "Review & Cart", copy: "Check the summary and add the placement package to your cart." }
        ],
        "valorant-radiant": [
          { title: "Radiant Request", copy: "Pick the Radiant service style that fits your account goals." },
          { title: "Custom Quote", copy: "Pricing is manual and depends on RR, schedule, and server â€” totals show as Custom Price." },
          { title: "Contact", copy: "Use Contact Us to reach ElysiumBoost on Discord with your request details." }
        ],
        "valorant-ranked-wins": [
          { title: "Wins Package", copy: "Select your rank and number of wins (1â€“10). Radiant wins are quoted as Custom Price." },
          { title: "Mode & Extras", copy: "Toggle Duo or Solo and stack trusted extras as needed." },
          { title: "Review & Cart", copy: "Add the configured wins line to your cart when the total looks right." }
        ],
        "valorant-unrated": [
          { title: "Package", copy: "Pick a casual unrated package for activity or requirements â€” no ranked pressure." },
          { title: "Mode & Extras", copy: "Solo or Duo and optional extras apply on top of the package EUR base." },
          { title: "Review & Cart", copy: "Confirm the summary and add unrated games to your cart." }
        ],
        "valorant-leveling": [
          { title: "Level Package", copy: "Choose a ready-made level range package priced in EUR." },
          { title: "Mode & Extras", copy: "Optional extras apply on the package base; server is informational." },
          { title: "Review & Cart", copy: "Add the leveling package to your cart with one click." }
        ],
        "valorant-battlepass": [
          { title: "Progress Tier", copy: "Select how much Battle Pass progress you want completed manually." },
          { title: "Express", copy: "Express Battle Pass notes faster completion priority in your summary." },
          { title: "Review & Cart", copy: "Add the Battle Pass package to your cart when ready." }
        ],
        "valorant-coaching": [
          { title: "Session Length", copy: "Choose 1â€“10 coaching hours (stepper); focus options such as VOD review are free and listed in your summary." },
          { title: "Focus", copy: "Tick any combination of free focus options â€” they never change the hourly price." },
          { title: "Review & Cart", copy: "Add coaching to your cart with your selected duration and notes." }
        ]
      };
      if (valorantSteps[type]) return valorantSteps[type];
      return shared[type] || [
        { title: "Customize", copy: "Select the service options and quantities in the order panel." },
        { title: "Add To Cart", copy: "Review the total and add the configured service to your cart." },
        { title: "Copy Ticket", copy: "Paste the clean order summary into Discord for boosters confirmation." }
      ];
    }

    function recentOrderType(order) {
      return order?.type || "item";
    }

    function pickRecentOrders() {
      const picked = [];
      const used = new Set();
      let previousType = recentOrderLastBatch.length ? recentOrderType(recentOrderLastBatch[recentOrderLastBatch.length - 1]) : "";
      for (let slot = 0; slot < 3; slot += 1) {
        let candidates = recentOrders.filter(order => !used.has(order.label) && order.type !== previousType);
        if (!candidates.length) candidates = recentOrders.filter(order => !used.has(order.label));
        const choice = candidates[Math.floor(Math.random() * candidates.length)] || recentOrders[Math.floor(Math.random() * recentOrders.length)];
        picked.push(choice);
        used.add(choice.label);
        previousType = choice.type;
      }
      recentOrderLastBatch = picked;
      return picked;
    }

    function pickSingleRecentOrder(slotIndex) {
      const blocked = new Set();
      for (let i = 0; i < 3; i += 1) {
        if (i !== slotIndex && recentOrderLastBatch[i]) blocked.add(recentOrderLastBatch[i].label);
      }
      const cur = recentOrderLastBatch[slotIndex];
      let candidates = recentOrders.filter(o => !blocked.has(o.label));
      if (cur) {
        const alt = candidates.filter(o => o.label !== cur.label);
        if (alt.length) candidates = alt;
      }
      if (!candidates.length) candidates = recentOrders.filter(o => !blocked.has(o.label));
      if (!candidates.length) candidates = recentOrders.slice();
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    function renderOrderFeedSlot(slotIndex) {
      const feed = $("orderFeed");
      if (!feed) return;
      const game = currentGame();
      if (!game || game.id !== "arc") return;
      const cards = feed.querySelectorAll(".order-feed-card");
      if (cards.length !== 3 || slotIndex < 0 || slotIndex > 2) {
        renderOrderFeed();
        return;
      }
      const newOrder = pickSingleRecentOrder(slotIndex);
      recentOrderLastBatch[slotIndex] = newOrder;
      const card = cards[slotIndex];
      card.classList.add("is-changing");
      window.setTimeout(() => {
        card.dataset.feedService = newOrder.service;
        card.dataset.feedCategory = newOrder.category;
        card.setAttribute("aria-label", "Open " + newOrder.label);
        const strong = card.querySelector("strong");
        if (strong) strong.textContent = newOrder.label;
        card.classList.remove("is-changing");
      }, 360);
    }

    function bindOrderFeedClicks() {
      const feed = $("orderFeed");
      if (!feed || feed.dataset.feedDelegated === "1") return;
      feed.dataset.feedDelegated = "1";
      feed.addEventListener("click", event => {
        const card = event.target.closest(".order-feed-card[data-feed-service]");
        if (!card) return;
        openRecentOrder(card.dataset.feedService, card.dataset.feedCategory);
      });
    }

    function openRecentOrder(serviceId, categoryId) {
      const arc = games.find(game => game.id === "arc");
      if (!arc) return;
      const service = arc.services.find(s => s.id === serviceId);
      if (!service) return;
      state.game = "arc";
      state.category = categoryId || service.category;
      state.serviceId = service.id;
      syncGameHash("arc");
      renderAll();
      requestAnimationFrame(() => {
        $("detailSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    function renderOrderFeed() {
      const feed = $("orderFeed");
      if (!feed) return;
      const game = currentGame();
      if (!game || game.id !== "arc") {
        feed.innerHTML = "";
        return;
      }
      const entries = pickRecentOrders();
      const html = entries.map(order => `
        <button class="order-feed-card" type="button" data-feed-service="${escapeHtml(order.service)}" data-feed-category="${escapeHtml(order.category)}" aria-label="Open ${escapeHtml(order.label)}">
          <small><span class="live-dot" aria-hidden="true"></span>Raider Just Ordered!</small>
          <strong>${escapeHtml(order.label)}</strong>
        </button>
      `).join("");
      feed.innerHTML = html;
      bindOrderFeedClicks();
    }

    function startOrderFeed() {
      recentOrderTimers.forEach(id => window.clearInterval(id));
      recentOrderTimers = ORDER_FEED_SLOT_MS.map((ms, slot) => window.setInterval(() => {
        renderOrderFeedSlot(slot);
      }, ms));
    }

    function qtyField(id, label, value = 0, min = 0, max = null, hideLabel = false) {
      const maxAttr = max != null ? ` max="${max}"` : "";
      const lab = hideLabel
        ? `<label class="sr-only" for="${id}">${escapeHtml(String(label))}</label>`
        : `<label for="${id}">${label}</label>`;
      return `<div class="qty-field">${lab}<div class="qty-stepper" data-qty-wrap>
        <button type="button" class="qty-step qty-step--minus" data-qty-for="${id}" data-qty-step="-1" aria-label="Decrease quantity"><span class="qty-step-glyph" aria-hidden="true">âˆ’</span></button>
        <input id="${id}" class="qty-stepper-input" type="number" inputmode="numeric" min="${min}"${maxAttr} value="${value}">
        <button type="button" class="qty-step qty-step--plus" data-qty-for="${id}" data-qty-step="1" aria-label="Increase quantity"><span class="qty-step-glyph" aria-hidden="true">+</span></button>
      </div></div>`;
    }

    function loadoutBundleQtyField(id, bundleLabel, perBundle, value = 0, min = 0, max = null) {
      const maxAttr = max != null ? ` max="${max}"` : "";
      return `<div class="qty-field qty-field--bundle" data-bundle-for="${id}">
        <label for="${id}">${bundleLabel}</label>
        <div class="qty-stepper qty-stepper--bundle" data-qty-wrap>
          <button type="button" class="qty-step qty-step--minus" data-qty-for="${id}" data-qty-step="-1" aria-label="Decrease bundle quantity"><span class="qty-step-glyph" aria-hidden="true">âˆ’</span></button>
          <input id="${id}" class="qty-stepper-input" type="number" inputmode="numeric" min="${min}"${maxAttr} value="${value}">
          <button type="button" class="qty-step qty-step--plus" data-qty-for="${id}" data-qty-step="1" aria-label="Increase bundle quantity"><span class="qty-step-glyph" aria-hidden="true">+</span></button>
        </div>
        <div class="bundle-final-line is-empty" id="${id}BundleTotal" aria-live="polite"></div>
      </div>`;
    }

    function wireQtySteppers(root) {
      if (!root || !root.querySelectorAll) return;
      root.querySelectorAll(".qty-step[data-qty-for]").forEach(btn => {
        btn.addEventListener("click", e => {
          e.preventDefault();
          const id = btn.dataset.qtyFor;
          const inp = document.getElementById(id);
          if (!inp || inp.disabled) return;
          const delta = Number(btn.dataset.qtyStep);
          if (!delta) return;
          const min = inp.min !== "" && inp.min != null ? Number(inp.min) : 0;
          const max = inp.max !== "" && inp.max != null ? Number(inp.max) : null;
          let v = Math.round(Number(inp.value || 0)) + delta;
          if (Number.isFinite(min)) v = Math.max(min, v);
          if (max != null && Number.isFinite(max)) v = Math.min(max, v);
          inp.value = String(v);
          inp.dispatchEvent(new Event("input", { bubbles: true }));
        });
      });
    }

    function syncLoadoutQuickBundleHints() {
      [
        { id: "bandageQty", per: 5, name: "Herbal Bandage" },
        { id: "nadeQty", per: 3, name: "Trigger Nade" },
        { id: "rechargerQty", per: 5, name: "Shield Recharger" },
        { id: "surgeRechargerQty", per: 5, name: "Surge Shield Recharger" }
      ].forEach(({ id, per, name }) => {
        const el = $(id + "BundleTotal");
        if (!el) return;
        const b = Math.max(0, num(id));
        if (b) {
          el.textContent = `${(b * per).toLocaleString()} ${name}`;
          el.classList.remove("is-empty");
        } else {
          el.textContent = "";
          el.classList.add("is-empty");
        }
      });
    }

    function loadoutBundleDetailLine(bundleQty, per, displayName) {
      const b = Math.max(0, bundleQty);
      if (!b) return "";
      const items = b * per;
      return `${items.toLocaleString()} ${displayName}`;
    }

    function weaponOptions(includeNone = true) {
      return weapons.filter(weapon => includeNone || weapon !== "No Weapon").map(weapon => `<option value="${weapon}">${displayItemName(weapon)}</option>`).join("");
    }

    function modTierOptionsHtml() {
      return `<option value="none">${ui("No Mods")}</option><option value="blue">${ui("Blue Mods - +$0.05 each")}</option><option value="premium">${ui("Legendary / Epic Mods - +$0.10 each")}</option>`;
    }

    function elyToggleRow(inputAttrs, labelInnerHtml, checked = false) {
      const c = checked ? " checked" : "";
      return `<label class="check-row ely-toggle-row"><input type="checkbox" class="ely-toggle-input"${c} ${inputAttrs}><span class="ely-toggle-ui" aria-hidden="true"><span class="ely-toggle-track"><span class="ely-toggle-thumb"></span></span></span><span class="ely-toggle-label">${labelInnerHtml}</span></label>`;
    }

    function valorantRankOptionsHtml(ranks, selected) {
      return ranks.map(r => `<option value="${escapeHtml(r)}"${r === selected ? " selected" : ""}>${escapeHtml(r)}</option>`).join("");
    }

    function valorantServerSelectHtml(omitLabel = false) {
      const sel = `<select id="valServer">${valorantServers.map(s => `<option value="${escapeHtml(s)}"${s === "EU" ? " selected" : ""}>${escapeHtml(s)}</option>`).join("")}</select>`;
      if (omitLabel) return `<div class="valorant-server-field">${sel}</div>`;
      return `<div><label for="valServer">Server</label>${sel}</div>`;
    }

    function valorantModeHtml() {
      return `
        <input type="hidden" id="valMode" value="solo">
        <div class="field-block valorant-panel-tight"><h4>Mode</h4>
          <div class="raid-toggle-grid valorant-mode-pills valorant-mode-pills--with-duo-hint">
            <button class="raid-pill active" type="button" data-val-mode="solo"><strong>Solo</strong></button>
            <div class="valorant-mode-duo-wrap">
              <span class="valorant-duo-extra-hint">+15% extra</span>
              <button class="raid-pill" type="button" data-val-mode="duo"><strong>Duo</strong></button>
            </div>
          </div>
        </div>`;
    }

    function valorantExtrasHtml(includePaid, includeFree) {
      let html = `<div class="field-block valorant-panel-tight"><h4>Extras</h4><div class="valorant-extras-grid checks valorant-extras-toggle">`;
      if (includePaid) {
        valorantExtrasPaid.forEach(ex => {
          html += elyToggleRow(`data-val-extra-pct="${ex.pct}" data-val-extra-label="${escapeHtml(ex.label)}"`, `${escapeHtml(ex.label)} (+${Math.round(ex.pct * 100)}%)`, false);
        });
      }
      if (includeFree) {
        valorantExtrasFree.forEach(ex => {
          html += elyToggleRow(`data-val-extra-free="1" data-val-extra-label="${escapeHtml(ex.label)}"`, `${escapeHtml(ex.label)} â€” FREE`, false);
        });
      }
      html += `</div></div>`;
      return html;
    }

    function valorantConfiguratorCompactHeader() {
      const game = currentGame();
      const svc = currentService();
      if (!game || game.id !== "valorant" || !svc?.category || !String(svc.form || "").startsWith("valorant-")) return "";
      return `
        <header class="valorant-cfg-compact-head">
          <span class="valorant-cfg-eyebrow">${escapeHtml(ui("Valorant"))}</span>
          <strong class="valorant-cfg-name">${escapeHtml(ui(svc.cardTitle))}</strong>
        </header>`;
    }

    function valorantOrderChromeCustomizeInner(type) {
      if (type === "valorant-rank-boost") return `${valorantModeHtml()}${valorantExtrasHtml(true, true)}`;
      if (type === "valorant-placement") return `${valorantModeHtml()}${valorantExtrasHtml(true, true)}`;
      if (type === "valorant-radiant") return valorantModeHtml();
      if (type === "valorant-ranked-wins") return `${valorantModeHtml()}${valorantExtrasHtml(true, true)}`;
      if (type === "valorant-unrated") return `${valorantModeHtml()}${valorantExtrasHtml(true, true)}`;
      if (type === "valorant-leveling") return `${valorantModeHtml()}${valorantExtrasHtml(true, true)}`;
      if (type === "valorant-battlepass") return `${valorantModeHtml()}${valorantExtrasHtml(true, true)}`;
      if (type === "valorant-coaching") return "";
      return "";
    }

    function valorantRRSelectHtml() {
      const opts = ["0â€“20 RR", "21â€“40 RR", "41â€“60 RR", "61â€“80 RR", "81â€“100 RR"];
      return `<div><label for="valRbRR">${ui("Current RR")}</label><select id="valRbRR">${opts.map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("")}</select></div>`;
    }

    function valorantRankTierAssetRel(rankLabel) {
      if (rankLabel == null || rankLabel === "" || rankLabel === "â€”") return "";
      const norm = String(rankLabel).trim().toLowerCase();
      if (norm === "unranked" || norm === "radiant") return "";
      if (norm.startsWith("iron")) return "assets/rank-iron.png";
      if (norm.startsWith("bronze")) return "assets/rank-bronze.png";
      if (norm.startsWith("silver")) return "assets/rank-silver.png";
      if (norm.startsWith("gold")) return "assets/rank-gold.png";
      if (norm.startsWith("platinum")) return "assets/rank-platinum.png";
      if (norm.startsWith("diamond")) return "assets/rank-diamond.png";
      if (norm.startsWith("ascendant")) return "assets/rank-ascendant.png";
      if (norm.startsWith("immortal")) return "assets/rank-immortal.png";
      return "";
    }

    function valorantRankTierImageUrl(rankLabel) {
      const rel = valorantRankTierAssetRel(rankLabel);
      return rel ? resolveSiteUrl(rel) : "";
    }

    function valorantRadiantBoostTierImageUrl() {
      return resolveSiteUrl("assets/rank-immortal.png");
    }

    function valorantPathChip(kicker, value, tierImageUrl) {
      const k = kicker
        ? `<span class="valorant-path-kicker">${escapeHtml(kicker)}</span>`
        : "";
      const visual = tierImageUrl
        ? `<div class="valorant-path-rank-visual"><img class="valorant-path-rank-img" src="${escapeHtml(tierImageUrl)}" alt="${escapeHtml(value)}" decoding="async" loading="lazy" /></div>`
        : "";
      return `<div class="valorant-path-chip">${k}${visual}<span class="valorant-path-rank">${escapeHtml(value)}</span></div>`;
    }

    function syncValorantRankFieldThumbnails() {
      const svc = currentService();
      const type = svc?.form;
      const apply = (imgId, rankVal) => {
        const img = $(imgId);
        if (!img) return;
        const url = valorantRankTierImageUrl(rankVal || "");
        const shell = img.closest(".valorant-rank-thumb-shell");
        if (!url) {
          img.removeAttribute("src");
          img.alt = "";
          shell?.classList.add("is-empty");
          return;
        }
        img.src = url;
        img.alt = String(rankVal || "");
        shell?.classList.remove("is-empty");
      };
      if (type === "valorant-rank-boost") {
        apply("valRbCurrentTierImg", val("valRbCurrent"));
        apply("valRbDesiredTierImg", val("valRbDesired"));
      } else if (type === "valorant-placement") {
        apply("valPmRankTierImg", val("valPmRank"));
      } else if (type === "valorant-radiant") {
        const img = $("valRadOptionTierImg");
        if (!img) return;
        const shell = img.closest(".valorant-rank-thumb-shell");
        const url = valorantRadiantBoostTierImageUrl();
        img.src = url;
        img.alt = ui("Immortal");
        shell?.classList.remove("is-empty");
      }
    }

    function syncValorantPathRail() {
      const rail = $("valorantPathRail");
      if (!rail) return;
      const svc = currentService();
      const type = svc?.form;
      if (!type || !String(type).startsWith("valorant-")) return;
      let left = "";
      let right = "";
      let leftK = "";
      let rightK = "";
      let leftTierImg = "";
      let rightTierImg = "";
      if (type === "valorant-rank-boost") {
        left = val("valRbCurrent") || "â€”";
        right = val("valRbDesired") || "â€”";
        leftK = ui("Current");
        rightK = ui("Desired");
        leftTierImg = valorantRankTierImageUrl(left);
        rightTierImg = valorantRankTierImageUrl(right);
      } else if (type === "valorant-placement") {
        const rank = val("valPmRank") || "â€”";
        const games = Math.max(1, Math.min(5, Math.round(num("valPmGames") || 5)));
        left = rank;
        right = `${games} ${ui("games")}`;
        leftK = ui("Rank");
        rightK = ui("Games");
        leftTierImg = valorantRankTierImageUrl(left);
      } else if (type === "valorant-radiant") {
        left = val("valRadOption") || "â€”";
        right = "";
        leftK = ui("Service");
        leftTierImg = valorantRadiantBoostTierImageUrl();
      } else if (type === "valorant-ranked-wins") {
        const rank = val("valRwRank") || "â€”";
        const wins = Math.max(1, Math.min(10, Math.round(num("valRwWins") || 3)));
        left = rank;
        right = `${wins} ${ui("wins")}`;
        leftK = ui("Rank");
        rightK = ui("Wins");
      } else if (type === "valorant-unrated") {
        const id = val("valUnratedPkg") || "u5";
        const pack = valorantUnratedPackages.find(p => p.id === id) || valorantUnratedPackages[0];
        left = pack.label;
        right = displayMoney(valorantEurToStoredTotal(pack.eur));
        leftK = ui("Package");
        rightK = ui("Price");
      } else if (type === "valorant-leveling") {
        const id = val("valLevelPkg") || "l1";
        const pack = valorantLevelPackages.find(p => p.id === id) || valorantLevelPackages[0];
        left = pack.label;
        right = displayMoney(valorantEurToStoredTotal(pack.eur));
        leftK = ui("Package");
        rightK = ui("Price");
      } else if (type === "valorant-battlepass") {
        const id = val("valBpPkg") || "bp-small";
        const pack = valorantBattlePassPackages.find(p => p.id === id) || valorantBattlePassPackages[0];
        left = pack.label;
        right = displayMoney(valorantEurToStoredTotal(pack.eur));
        leftK = ui("Package");
        rightK = ui("Price");
      } else if (type === "valorant-coaching") {
        const hours = Math.max(1, Math.min(10, Math.round(num("valCoachHours") || 1)));
        left = `${hours} ${hours === 1 ? ui("hour") : ui("hours")}`;
        right = "";
        leftK = ui("Session");
      }
      const arrow = right === ""
        ? ""
        : `<span class="valorant-path-arrow" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12h12m-4-5l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
      const inner = right === ""
        ? `<div class="valorant-path-inner valorant-path-inner--single">${valorantPathChip(leftK, left, leftTierImg)}</div>`
        : `<div class="valorant-path-inner">${valorantPathChip(leftK, left, leftTierImg)}${arrow}${valorantPathChip(rightK, right, rightTierImg)}</div>`;
      rail.innerHTML = inner;
      syncValorantRankFieldThumbnails();
    }

    function syncValorantOrderFormMount(service) {
      const section = $("detailSection");
      const mount = $("valorantConfiguratorMount");
      const form = $("orderForm");
      const body = $("orderCardBody");
      const sum = $("orderSummaryTotal");
      if (!section || !mount || !form || !body || !sum) return;
      const game = currentGame();
      const isValorantForm = Boolean(
        service &&
        game?.id === "valorant" &&
        String(service.form || "").startsWith("valorant-")
      );
      const isArcConfigurator = Boolean(service && game?.id === "arc");
      const isTftForm = Boolean(service && game?.id === "tft");
      const split = isValorantForm || isArcConfigurator || isTftForm;
      const card = document.querySelector(".order-card");
      section.classList.toggle("detail--valorant-layout", split);
      if (card) {
        if (!split) {
          card.classList.remove("is-valorant", "is-arc-split", "is-tft-split");
        } else {
          card.classList.toggle("is-valorant", isValorantForm);
          card.classList.toggle("is-arc-split", isArcConfigurator && !isValorantForm);
          card.classList.toggle("is-tft-split", isTftForm && !isValorantForm && !isArcConfigurator);
        }
      }
      if (split) {
        mount.hidden = false;
        mount.appendChild(form);
      } else {
        mount.hidden = true;
        body.insertBefore(form, sum);
      }
    }

    function teardownValorantOrderChrome() {
      document.querySelector(".order-card")?.classList.remove("is-valorant", "is-tft-split");
      document.querySelectorAll("[data-valorant-order-chrome]").forEach(n => n.remove());
    }

    function setupValorantOrderChrome() {
      const game = currentGame();
      const svc = currentService();
      const card = document.querySelector(".order-card");
      const summary = $("orderSummaryTotal") || document.querySelector(".order-card .summary-total");
      if (!card || !summary) return;
      teardownValorantOrderChrome();
      if (game?.id !== "valorant" || !svc?.form?.startsWith?.("valorant-")) return;
      card.classList.add("is-valorant");
      const wrap = document.createElement("div");
      wrap.dataset.valorantOrderChrome = "";
      wrap.className = "valorant-order-chrome";
      const customize = valorantOrderChromeCustomizeInner(svc.form);
      const rankTierRail = svc.form === "valorant-rank-boost" || svc.form === "valorant-placement" || svc.form === "valorant-radiant";
      const pathRailExtra = `${rankTierRail ? " valorant-path-rail--rank-tier-icons" : ""}${svc.form === "valorant-rank-boost" ? " valorant-path-rail--rank-boost" : ""}`;
      wrap.innerHTML = `
        <div id="valorantPathRail" class="valorant-path-rail${pathRailExtra}" aria-live="polite"></div>
        ${customize ? `<section class="valorant-customize-surface" aria-label="${escapeHtml(ui("Customize"))}"><h4 class="valorant-block-kicker">${escapeHtml(ui("Customize"))}</h4>${customize}</section>` : ""}
        <p class="valorant-mini-promo">${escapeHtml(ui("Manual completion Â· VPN-safe routing Â· Discord confirmation on every order."))}</p>
        <div class="valorant-summary-panel valorant-summary-panel--sticky">
          <h4 class="valorant-summary-title">${escapeHtml(ui("Breakdown"))}</h4>
          <div class="valorant-summary-dl" id="valorantSummaryDl"></div>
          <p class="valorant-summary-note" id="valorantSummaryNote" hidden></p>
        </div>
        <hr class="valorant-price-divider" aria-hidden="true">
        <ul class="valorant-right-trust-foot">
          <li>${escapeHtml(ui("Secure"))}</li>
          <li>${escapeHtml(ui("Private"))}</li>
          <li>${escapeHtml(ui("Pro boosters"))}</li>
        </ul>
      `;
      summary.insertBefore(wrap, summary.firstChild);
    }

    function buildForm(type) {
      if (type === "fast") {
        return `<div class="field-grid">${qtyField("fastQty", "Quantity / Hours", 1, 1)}<div><label for="fastNote">Order Notes</label><input id="fastNote" placeholder="Rank, server, role, schedule"></div></div>`;
      }
      if (type === "blueprints") {
        return `
          <div><label>${ui("Select Blueprints")}</label><div class="tabs" id="bpTabs"></div></div>
          <div class="bp-search-row"><div class="search-box"><label for="bpSearch">${ui("Search Blueprints")}</label><input id="bpSearch" type="search" placeholder="${ui("Type blueprint name...")}"></div><button class="btn" id="bpSelectAll" type="button">${ui("Select All")}</button></div>
          <div id="bpContent"></div>
        `;
      }
      if (type === "coins") {
        const tierButtons = coinTiers.map(tier => `<button class="raid-pill" type="button" data-coin-deal="${tier.amount}"><strong>${tier.label}<small>Popular deal, ${Math.round(tier.discount * 100)}% off</small></strong><span>${moneyUSD(tier.amount / 100000 * prices.coins100k * (1 - tier.discount))}</span></button>`).join("");
        const coinMarksHtml = coinTiers.map(tier => {
          const left = rangeTierMarkerPct(tier.amount, COIN_SLIDER_MIN, COIN_SLIDER_MAX);
          const pct = Math.round(tier.discount * 100);
          return `<span class="coin-slider-mark" data-tier-amount="${tier.amount}" style="--m-left:${left}%"><span class="coin-slider-mark__tick"></span><span class="coin-slider-mark__label">${pct}%</span></span>`;
        }).join("");
        return `
          <div class="coin-panel">
            <input id="coinDeal" type="hidden" value="">
            <div class="coin-readout">
              <div class="coin-readout-main">
                <label for="coinAmount">${ui("Raider Coins")}</label>
                <div class="coin-amount-row">
                  <span id="coinLabel" class="coin-amount-value">100,000</span>
                  <span class="discounted-tag" id="coinDiscountTag">${ui("Discounted")}</span>
                </div>
              </div>
              <span class="coin-readout-limits">${ui("100k minimum")} Â· ${ui("12M maximum")}</span>
            </div>
            <div class="coin-range-wrap">
              <input id="coinAmount" class="coin-range-input" type="range" min="${COIN_SLIDER_MIN}" max="${COIN_SLIDER_MAX}" step="100000" value="100000">
              <div class="coin-slider-ticks" aria-hidden="true">${coinMarksHtml}</div>
            </div>
            <div class="coin-discount-guidance" id="coinDiscountGuidance" role="status" aria-live="polite"></div>
            <div class="coin-quick-grid coin-quick-grid--four">${tierButtons}</div>
            <div class="badge" style="justify-self:start">${ui("Price updates every 100k")}</div>
          </div>
        `;
      }
      if (type === "seeds") {
        const seedButtons = seedTiers.map(tier => `<button class="raid-pill" type="button" data-seed-deal="${tier.amount}"><strong>${tier.label}<small>Bulk deal, ${Math.round(tier.discount * 100)}% off</small></strong><span>${moneyUSD(tier.amount / 100 * prices.seeds100 * (1 - tier.discount))}</span></button>`).join("");
        const seedMarksHtml = seedTiers.map(tier => {
          const left = rangeTierMarkerPct(tier.amount, SEED_SLIDER_MIN, SEED_SLIDER_MAX);
          const pct = Math.round(tier.discount * 100);
          return `<span class="coin-slider-mark" data-seed-tier-amount="${tier.amount}" style="--m-left:${left}%"><span class="coin-slider-mark__tick"></span><span class="coin-slider-mark__label">${pct}%</span></span>`;
        }).join("");
        return `
          <div class="coin-panel">
            <input id="seedDeal" type="hidden" value="">
            <div class="coin-readout">
              <div class="coin-readout-main">
                <label for="seedAmount">${ui("Assorted Seeds")}</label>
                <div class="coin-amount-row">
                  <span id="seedLabel" class="coin-amount-value">100</span>
                  <span class="discounted-tag" id="seedDiscountTag">${ui("Discounted")}</span>
                </div>
              </div>
              <span class="coin-readout-limits">${ui("100 minimum")} Â· ${ui("2,000 maximum")}</span>
            </div>
            <div class="coin-range-wrap">
              <input id="seedAmount" class="coin-range-input" type="range" min="${SEED_SLIDER_MIN}" max="${SEED_SLIDER_MAX}" step="100" value="100">
              <div class="coin-slider-ticks" aria-hidden="true">${seedMarksHtml}</div>
            </div>
            <div class="coin-discount-guidance" id="seedDiscountGuidance" role="status" aria-live="polite"></div>
            <div class="coin-quick-grid">${seedButtons}</div>
            <div class="badge" style="justify-self:start">100 seeds = ${moneyUSD(prices.seeds100)}</div>
          </div>
        `;
      }
      if (type === "depositary") {
        const sliderMin = 20;
        const sliderMax = 280;
        return `
          <div class="coin-panel">
            <div class="coin-readout">
              <div><label for="depositarySlots">Storage Slots</label><strong id="slotLabel">60 Slots</strong></div>
              <span>Drag the slider or enter a custom amount<br>20 minimum &middot; 280 maximum</span>
            </div>
            <div class="depositary-grid">
              <div class="depositary-custom-row">
                <label for="depositaryCustom">Custom</label>
                <div class="qty-stepper qty-stepper--wide" data-qty-wrap>
                  <button type="button" class="qty-step qty-step--minus" data-qty-for="depositaryCustom" data-qty-step="-1" aria-label="Decrease slots"><span class="qty-step-glyph" aria-hidden="true">âˆ’</span></button>
                  <input id="depositaryCustom" class="qty-stepper-input" type="number" min="1" max="999" step="1" value="60">
                  <button type="button" class="qty-step qty-step--plus" data-qty-for="depositaryCustom" data-qty-step="1" aria-label="Increase slots"><span class="qty-step-glyph" aria-hidden="true">+</span></button>
                </div>
              </div>
              <div class="depositary-slider-row">
                <label for="depositarySlots">Quick Slider</label>
                <input id="depositarySlots" type="range" min="${sliderMin}" max="${sliderMax}" step="5" value="60">
              </div>
            </div>
            <div class="badge" style="justify-self:start">1 slot = ${moneyUSD(prices.depositarySlot)}</div>
          </div>
        `;
      }
      if (type === "guns") {
        const bundleUnit = weaponBasePriceUsd("Anvil") + prices.augment + prices.shield + prices.rechargerBundle + prices.bandageBundle;
        return `<div class="field-grid loadout-weapon-grid"><div class="ely-form-cell"><label for="gunWeapon">${ui("Weapon")}</label><select id="gunWeapon">${weaponOptions(false)}</select></div><div class="ely-form-cell ely-form-cell--arc-mods" data-arc-mod-cell="gun"><label for="gunModType">${ui("Mods")}</label><select id="gunModType">${modTierOptionsHtml()}</select></div>${qtyField("gunQty", ui("Quantity"), 1, 1)}</div><p class="loadout-mod-hint" data-arc-mod-hint="gun" role="note">${ui("Mod quantity automatically matches weapon quantity.")}</p><div class="guns-bundle-wrap" id="gunsBundleWrap"><button class="btn" id="bundle20" type="button" style="width:100%;margin-top:10px">20x Weapon + Legendary / Epic Mods (-10%)</button></div>`;
      }
      if (type === "loadout") {
        const bundleUnit = weaponBasePriceUsd("Anvil") + prices.augment + prices.shield + prices.rechargerBundle + prices.bandageBundle;
        return `
          <input id="loadoutBundle" type="hidden" value="0">
          <div class="field-block">
            <h4>Special Bundle</h4>
            <div class="bundle-grid">
              <button class="raid-pill" type="button" data-loadout-bundle="10"><strong>10x Bundle<small>10 weapon, 10 Looting Mk. 3 (Survivor) Augment, 10 Medium Shield, 50 Shield Recharger, 50 Herbal</small></strong><span>${moneyUSD(10 * bundleUnit)}</span></button>
              <button class="raid-pill" type="button" data-loadout-bundle="20"><strong>20x Bundle<small>20 weapon, 20 Looting Mk. 3 (Survivor) Augment, 20 Medium Shield, 100 Shield Recharger, 100 Herbal</small></strong><span>${moneyUSD(20 * bundleUnit)}</span></button>
            </div>
          </div>
          ${weaponBlock("Primary Weapon", "primary")}
          ${weaponBlock("Secondary Weapon", "secondary")}
          <div class="field-block"><h4>Gear</h4><div class="field-grid equal-grid">${qtyField("augmentQty", "Looting Mk. 3 (Survivor) Augment Qty")}${qtyField("shieldQty", "Medium Shield Qty")}</div></div>
          <div class="field-block"><h4>Quick Use Bundles</h4><div class="field-grid equal-grid equal-grid--bundles">${loadoutBundleQtyField("bandageQty", "5x Herbal Bandage", 5)}${loadoutBundleQtyField("nadeQty", "3x Trigger Nade", 3)}${loadoutBundleQtyField("rechargerQty", "5x Shield Recharger", 5)}${loadoutBundleQtyField("surgeRechargerQty", "5x Surge Shield Recharger", 5)}</div></div>
        `;
      }
        if (type === "trials") {
        return `
          <div class="checks">
            ${elyToggleRow('id="trialAllStars"', `Weekly All 3 Star Trials - ${moneyUSD(prices.trialsBase)}`, true)}
            ${elyToggleRow('id="trialRankUp"', `Rank Up Service Base - ${moneyUSD(prices.trialsBase)}`, false)}
          </div>
          <div class="field-grid">
            <div><label for="trialRank">Current Rank</label><select id="trialRank">${ranks.map(rank => `<option value="${rank}">${rank}</option>`).join("")}</select></div>
            <div><label for="trialOption">Rank Option</label><select id="trialOption"></select></div>
          </div>
        `;
      }
      if (type === "pvp") {
        return `
          <input id="coachFocus" type="hidden" value="pvp">
          <input id="pvpMode" type="hidden" value="duo">
          <div class="field-block">
            <h4>Coaching Focus</h4>
            <div class="raid-toggle-grid">
              <button class="raid-pill active" type="button" data-coach-focus="pvp"><strong>PvP Coaching<small>Fights, angles, pressure, extraction decisions</small></strong></button>
              <button class="raid-pill" type="button" data-coach-focus="pve"><strong>PvE Coaching<small>Routes, loot safety, raid planning</small></strong></button>
            </div>
          </div>
          <div class="field-block">
            <h4>Session Type</h4>
            <div class="raid-toggle-grid">
              <button class="raid-pill active" type="button" data-coach-team="duo"><strong>Duo<small>${moneyUSD(20)} / hour</small></strong></button>
              <button class="raid-pill" type="button" data-coach-team="trio"><strong>Trio<small>${moneyUSD(30)} / hour</small></strong></button>
            </div>
          </div>
          <div class="qty-field"><label for="pvpHours">Hours</label><div class="qty-stepper" data-qty-wrap>
            <button type="button" class="qty-step qty-step--minus" data-qty-for="pvpHours" data-qty-step="-1" aria-label="Decrease hours"><span class="qty-step-glyph" aria-hidden="true">âˆ’</span></button>
            <input id="pvpHours" class="qty-stepper-input" type="number" min="1" max="6" value="1">
            <button type="button" class="qty-step qty-step--plus" data-qty-for="pvpHours" data-qty-step="1" aria-label="Increase hours"><span class="qty-step-glyph" aria-hidden="true">+</span></button>
          </div></div>
          <div><label for="coachNotes">Coaching Notes</label><textarea id="coachNotes" placeholder="Tell us what kind of PvP/PvE experience you want, weak points, goals, schedule, or preferred focus."></textarea></div>
          <p class="raid-panel-note">Maximum 6 hours per coaching ticket. Boosters confirm schedule, platform, and exact coaching goals in Discord.</p>
        `;
      }
      if (type === "leveling") {
        return `<div class="field-grid">${qtyField("currentLevel", "Current Level", 1, 1, 74)}${qtyField("targetLevel", "Target Level", 25, 2, 75)}</div><div><label for="speed">Speed</label><select id="speed"><option value="1">Standard</option><option value="1.10">Express (+10%)</option><option value="1.25">Super Express (+25%)</option></select></div>`;
      }
      if (type === "workshop") {
        return `
          <input id="workshopMode" type="hidden" value="workshop">
          <input id="workshopBundle" type="hidden" value="0">
          <div class="tabs" id="workshopModeTabs">
            <button class="tab-btn active" type="button" data-workshop-mode="workshop">Workshop</button>
            <button class="tab-btn" type="button" data-workshop-mode="scrappy">Scrappy</button>
          </div>
          <div class="field-block">
            <h4>Max Bundle</h4>
            <button class="raid-pill" id="maxWorkshopScrappy" type="button">
              <strong>Max Workshop + Scrappy<small>All 6 workbenches + Scrappy Level 5, 10% off</small></strong>
              <span>${moneyUSD((prices.workshopMax + 5 * prices.scrappyLevel) * .90)}</span>
            </button>
          </div>
          <div class="field-block" data-workshop-panel="workshop">
            <h4>Workshop Leveling</h4>
            <div class="level-range" id="workshopRange">
              <div class="level-range-head">
                <div class="level-range-chip"><span>From</span><strong id="workshopFromLabel">1</strong><small>Level</small></div>
                <div class="level-range-chip"><span>To</span><strong id="workshopToLabel">3</strong><small>Level</small></div>
              </div>
              <div class="dual-range" id="workshopDualRange" style="--range-left:0%;--range-right:0%">
                <div class="dual-range-track"></div>
                <div class="dual-range-fill"></div>
                <input id="workshopFrom" type="range" min="1" max="3" step="1" value="1" aria-label="Workshop from level">
                <input id="workshopTo" type="range" min="1" max="3" step="1" value="3" aria-label="Workshop target level">
              </div>
              <div class="range-ticks range-ticks--anchored range-ticks--workshop"><span style="left:0%"><i></i>1</span><span style="left:50%"><i></i>2</span><span style="left:100%"><i></i>3</span></div>
            </div>
            <div style="margin-top:10px"><label>Workshop</label><div class="checks">${workshops.map(name => elyToggleRow(`type="checkbox" value="${escapeHtml(name)}" data-workshop="${escapeHtml(name)}"`, `${escapeHtml(name)} - ${moneyUSD(prices.workshopBench)}`, false)).join("")}</div></div>
            <p class="raid-panel-note">Each full 1 to 3 workbench upgrade is ${moneyUSD(prices.workshopBench)}. Partial level steps are calculated from the selected range.</p>
          </div>
          <div class="field-block is-hidden" data-workshop-panel="scrappy">
            <h4>Scrappy Leveling</h4>
            <div class="level-range" id="scrappyRange">
              <div class="level-range-head">
                <div class="level-range-chip"><span>From</span><strong id="scrappyFromLabel">1</strong><small>Level</small></div>
                <div class="level-range-chip"><span>To</span><strong id="scrappyToLabel">5</strong><small>Level</small></div>
              </div>
              <div class="dual-range" id="scrappyDualRange" style="--range-left:0%;--range-right:0%">
                <div class="dual-range-track"></div>
                <div class="dual-range-fill"></div>
                <input id="scrappyFrom" type="range" min="1" max="5" step="1" value="1" aria-label="Scrappy from level">
                <input id="scrappyTo" type="range" min="1" max="5" step="1" value="5" aria-label="Scrappy target level">
              </div>
              <div class="range-ticks five">${[1,2,3,4,5].map(level => `<span>${level}</span>`).join("")}</div>
              <p class="raid-panel-note">Scrappy is ${moneyUSD(prices.scrappyLevel)} per selected level range.</p>
            </div>
          </div>
        `;
      }
      if (type === "raid") {
        const raidPackageButtons = [2,4,6,8,10,12].map(count => `<button class="raid-pill ${count === 2 ? "active" : ""}" type="button" data-raid-package="${count}"><strong>${count}x Raid<small>Successful raids only</small></strong><span>${moneyUSD(count * prices.raid)}</span></button>`).join("");
        return `
          <div class="field-block">
            <h4>Raid Team</h4>
            <div class="raid-toggle-grid">
              <button class="raid-pill active" type="button" data-raid-team="duo"><strong>Duo<small>Standard price</small></strong></button>
              <button class="raid-pill" type="button" data-raid-team="trio"><strong>Trio<small>Two boosters</small></strong><span>+50%</span></button>
            </div>
          </div>
          <div class="field-block">
            <div class="field-block-head"><h4>Raid Amount</h4></div>
            <label class="event-switch event-mode-card is-block ely-event-mode" style="--event-bg:url('assets/event-mod.webp')"><input id="raidEventMode" type="checkbox" class="ely-toggle-input"><span class="ely-toggle-ui" aria-hidden="true"><span class="ely-toggle-track"><span class="ely-toggle-thumb"></span></span></span><span class="ely-event-mode-label">Event Mode</span></label>
            <input id="raidCount" type="hidden" value="2">
            <div class="quick-raid-grid">${raidPackageButtons}</div>
            <p class="raid-panel-note">Event Mode adds ${moneyUSD(prices.event)} per selected raid when enabled.</p>
          </div>
        `;
      }
      if (type === "expedition") {
        return `<div><label>Expedition Stages</label><div class="checks">${stages.map(([name, price]) => elyToggleRow(`type="checkbox" value="${price}" data-stage="${escapeHtml(name)}"`, `${escapeHtml(name)} - ${moneyUSD(price)}`, false)).join("")}</div></div>`;
      }
      if (type === "boss") {
        return `
          <input id="boss" type="hidden" value="Kill Queen">
          <div class="field-block">
            <h4>Boss & Puzzle</h4>
            <div class="raid-toggle-grid">
              <button class="raid-pill active" type="button" data-boss="Kill Queen"><strong>Queen Kill<small>${moneyUSD(20)}</small></strong></button>
              <button class="raid-pill" type="button" data-boss="Kill Matriarch"><strong>Matriarch Kill<small>${moneyUSD(20)}</small></strong></button>
            </div>
            <div style="margin-top:8px">
              <button class="raid-pill" type="button" data-boss="Harvester Puzzle" style="width:100%"><strong>Harvester Puzzle<small>${moneyUSD(20)}</small></strong></button>
            </div>
          </div>
          ${qtyField("bossQty", "Quantity", 1, 1)}
        `;
      }
      if (type === "tft-rank-up") {
        const rankOpts = TFT_RANKS.map((r, i) => `<option value="${escapeHtml(r)}"${i === 1 ? " selected" : ""}>${escapeHtml(r)}</option>`).join("");
        const desRankOpts = TFT_RANKS.map((r, i) => `<option value="${escapeHtml(r)}"${i === 4 ? " selected" : ""}>${escapeHtml(r)}</option>`).join("");
        const divOpts = TFT_DIVISIONS.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("");
        const srvOpts = valorantServers.map(s => `<option value="${escapeHtml(s)}"${s === "EU" ? " selected" : ""}>${escapeHtml(s)}</option>`).join("");
        return `
        <div class="valorant-configurator tft-rank-up-form">
          <div class="valorant-rank-tier-grid">
            <div class="field-block field-block--tight valorant-rank-field">
              <label for="tftCurrentRank">Current Rank</label>
              <select id="tftCurrentRank">${rankOpts}</select>
              <span id="tftCurrentDivWrap" class="tft-div-wrap">
                <label for="tftCurrentDiv">Division</label>
                <select id="tftCurrentDiv">${divOpts}</select>
              </span>
            </div>
            <div class="field-block field-block--tight valorant-rank-field">
              <label for="tftDesiredRank">Desired Rank</label>
              <select id="tftDesiredRank">${desRankOpts}</select>
              <span id="tftDesiredDivWrap" class="tft-div-wrap">
                <label for="tftDesiredDiv">Division</label>
                <select id="tftDesiredDiv">${divOpts}</select>
              </span>
            </div>
          </div>
          <div class="field-block field-block--tight">
            <label for="tftServer">Server</label>
            <select id="tftServer">${srvOpts}</select>
          </div>
          <div class="field-block field-block--tight tft-addon-row">
            ${elyToggleRow('id="tftGamerGirl"', 'Gamer Girl <span class="tft-addon-chip">+$6</span>', false)}
          </div>
          <p class="valorant-rb-hint" id="tftRankHint" hidden></p>
        </div>`;
      }
      if (type === "valorant-rank-boost") {
        const desiredRanks = [...VALORANT_RANKS.slice(1), "Radiant"];
        return `
        <div class="valorant-configurator valorant-rank-boost">
          ${valorantConfiguratorCompactHeader()}
          <h4 class="valorant-flow-kicker">${escapeHtml(ui("Configure your rank"))}</h4>
          <div class="valorant-rank-select-panel">
            <div class="valorant-rank-tier-grid">
              <div class="field-block field-block--tight valorant-rank-field">
                <label for="valRbCurrent">${ui("Current Rank")}</label>
                <div class="valorant-rank-pick">
                  <div class="valorant-rank-thumb-shell is-empty" aria-hidden="true">
                    <img id="valRbCurrentTierImg" class="valorant-rank-tier-img" alt="" decoding="async" loading="eager" />
                  </div>
                  <select id="valRbCurrent">${valorantRankOptionsHtml(VALORANT_RANKS, "Silver III")}</select>
                </div>
              </div>
              <div class="field-block field-block--tight valorant-rank-field">
                <label for="valRbDesired">${ui("Desired Rank")}</label>
                <div class="valorant-rank-pick">
                  <div class="valorant-rank-thumb-shell is-empty" aria-hidden="true">
                    <img id="valRbDesiredTierImg" class="valorant-rank-tier-img" alt="" decoding="async" loading="lazy" />
                  </div>
                  <select id="valRbDesired">${valorantRankOptionsHtml(desiredRanks, "Gold I")}</select>
                </div>
              </div>
            </div>
            <div class="field-block field-block--tight">
              <div class="field-grid field-grid--rr">${valorantRRSelectHtml()}</div>
            </div>
            <p class="valorant-rb-hint" id="valRbHint" hidden></p>
            <div class="field-block field-block--tight">${valorantServerSelectHtml()}</div>
          </div>
        </div>`;
      }
      if (type === "valorant-placement") {
        const rankKeys = Object.keys(valorantPlacementRankEur);
        return `
        <div class="valorant-configurator valorant-configurator--placement-panels">
          ${valorantConfiguratorCompactHeader()}
          <div class="valorant-pm-grid">
            <div class="valorant-panel-card valorant-panel-card--pm-rank">
              <h4 class="valorant-panel-card__title">${escapeHtml(ui("Last Known Rank"))}</h4>
              <div class="valorant-rank-pick valorant-rank-pick--panel">
                <div class="valorant-rank-thumb-shell is-empty" aria-hidden="true">
                  <img id="valPmRankTierImg" class="valorant-rank-tier-img" alt="" decoding="async" loading="lazy" />
                </div>
                <select id="valPmRank">${rankKeys.map(k => `<option value="${escapeHtml(k)}"${k === "Gold" ? " selected" : ""}>${escapeHtml(k)}</option>`).join("")}</select>
              </div>
            </div>
            <div class="valorant-panel-card valorant-panel-card--pm-meta">
              <h4 class="valorant-panel-card__title">${escapeHtml(ui("Server"))}</h4>
              ${valorantServerSelectHtml(true)}
              <h4 class="valorant-panel-card__title valorant-panel-card__title--sub">${escapeHtml(ui("Number of Games"))}</h4>
              ${qtyField("valPmGames", ui("Number of Games"), 5, 1, 5, true)}
            </div>
          </div>
        </div>`;
      }
      if (type === "valorant-radiant") {
        const opts = ["Immortal III â†’ Radiant", "Radiant Push", "Radiant Duo", "Radiant Maintenance"];
        return `
        <div class="valorant-configurator">
          ${valorantConfiguratorCompactHeader()}
          <div class="valorant-cfg-stack valorant-cfg-stack--selects">
            <div class="field-block field-block--tight">
              <label for="valRadOption">${ui("Service")}</label>
              <div class="valorant-rank-pick">
                <div class="valorant-rank-thumb-shell is-empty" aria-hidden="true">
                  <img id="valRadOptionTierImg" class="valorant-rank-tier-img" alt="" decoding="async" loading="lazy" />
                </div>
                <select id="valRadOption">${opts.map((o, i) => `<option value="${escapeHtml(o)}"${i === 0 ? " selected" : ""}>${escapeHtml(o)}</option>`).join("")}</select>
              </div>
              <p class="valorant-micro-note">${escapeHtml(ui("Custom quote â€” final price confirmed in Discord."))}</p>
            </div>
            <div class="field-block field-block--tight">${valorantServerSelectHtml()}</div>
          </div>
        </div>`;
      }
      if (type === "valorant-ranked-wins") {
        const rwRanks = [...VALORANT_RANKS, "Radiant"];
        return `
        <div class="valorant-configurator valorant-configurator--placement-panels">
          ${valorantConfiguratorCompactHeader()}
          <div class="valorant-pm-grid">
            <div class="valorant-panel-card valorant-panel-card--rw-rank">
              <h4 class="valorant-panel-card__title">${escapeHtml(ui("Current Rank"))}</h4>
              <div class="valorant-rw-rank-select">
                <label class="sr-only" for="valRwRank">${escapeHtml(ui("Current Rank"))}</label>
                <select id="valRwRank">${valorantRankOptionsHtml(rwRanks, "Gold I")}</select>
              </div>
            </div>
            <div class="valorant-panel-card valorant-panel-card--pm-meta">
              <h4 class="valorant-panel-card__title">${escapeHtml(ui("Server"))}</h4>
              ${valorantServerSelectHtml(true)}
              <h4 class="valorant-panel-card__title valorant-panel-card__title--sub">${escapeHtml(ui("Number of Wins"))}</h4>
              ${qtyField("valRwWins", ui("Number of Wins"), 3, 1, 10, true)}
            </div>
          </div>
        </div>`;
      }
      if (type === "valorant-unrated") {
        const pills = valorantUnratedPackages.map(p =>
          `<button type="button" class="raid-pill${p.id === "u5" ? " active" : ""}" data-val-unrated="${escapeHtml(p.id)}"><strong>${escapeHtml(p.label)}</strong><span>${displayMoney(valorantEurToStoredTotal(p.eur))}</span></button>`).join("");
        return `
        <input type="hidden" id="valUnratedPkg" value="u5">
        <div class="valorant-configurator">
          ${valorantConfiguratorCompactHeader()}
          <div class="valorant-cfg-stack valorant-cfg-stack--selects">
            <div class="field-block field-block--tight"><h4 class="valorant-inline-kicker">${ui("Package")}</h4><div class="quick-raid-grid valorant-pill-grid">${pills}</div></div>
            <div class="field-block field-block--tight">${valorantServerSelectHtml()}</div>
          </div>
        </div>`;
      }
      if (type === "valorant-leveling") {
        const lvlIntro = (typeof valorantCategoryContent !== "undefined" && valorantCategoryContent["account-leveling"])
          ? String(valorantCategoryContent["account-leveling"].short || "").trim()
          : "";
        return `
        <input type="hidden" id="valLevelPkg" value="l1">
        <div class="valorant-configurator valorant-configurator--leveling-panels">
          ${valorantConfiguratorCompactHeader()}
          ${lvlIntro ? `<p class="valorant-leveling-lead">${escapeHtml(lvlIntro)}</p>` : ""}
          <div class="valorant-panel-card valorant-panel-card--leveling">
            <div class="field-grid valorant-leveling-grid">
              <div class="ely-form-cell">
                <label for="valLevelFrom">${ui("Current Level")}</label>
                <select id="valLevelFrom">
                  <option value="1" selected>1</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </select>
              </div>
              <div class="ely-form-cell">
                <label for="valLevelTo">${ui("Target Level")}</label>
                <select id="valLevelTo">
                  <option value="20" selected>20</option>
                </select>
              </div>
            </div>
            <div class="ely-form-cell valorant-leveling-speed">
              <label for="valLevelSpeed">${ui("Speed")}</label>
              <select id="valLevelSpeed">
                <option value="standard">${ui("Standard")}</option>
              </select>
            </div>
          </div>
          <div class="field-block field-block--tight valorant-leveling-server">${valorantServerSelectHtml()}</div>
        </div>`;
      }
      if (type === "valorant-battlepass") {
        const pills = valorantBattlePassPackages.map(p =>
          `<button type="button" class="raid-pill${p.id === "bp-small" ? " active" : ""}" data-val-bp="${escapeHtml(p.id)}"><strong>${escapeHtml(p.label)}</strong><span>${displayMoney(valorantEurToStoredTotal(p.eur))}</span></button>`).join("");
        return `
        <input type="hidden" id="valBpPkg" value="bp-small">
        <div class="valorant-configurator">
          ${valorantConfiguratorCompactHeader()}
          <div class="valorant-cfg-stack valorant-cfg-stack--selects">
            <div class="field-block field-block--tight"><h4 class="valorant-inline-kicker">${ui("Battle Pass")}</h4><div class="quick-raid-grid valorant-pill-grid">${pills}</div></div>
            <div class="field-block field-block--tight">${valorantServerSelectHtml()}</div>
          </div>
        </div>`;
      }
      if (type === "valorant-coaching") {
        const coachIntro = (typeof valorantCategoryContent !== "undefined" && valorantCategoryContent.coaching)
          ? String(valorantCategoryContent.coaching.short || "").trim()
          : "";
        return `
        <div class="valorant-configurator valorant-configurator--coaching-panels">
          ${valorantConfiguratorCompactHeader()}
          ${coachIntro ? `<p class="valorant-leveling-lead">${escapeHtml(coachIntro)}</p>` : ""}
          <div class="valorant-panel-card valorant-panel-card--coaching">
            ${qtyField("valCoachHours", ui("Hours"), 1, 1, 10)}
            ${valorantModeHtml()}
            <h4 class="valorant-panel-card__title valorant-panel-card__title--sub">${escapeHtml(ui("Focus"))}</h4>
            <div class="checks valorant-extras-grid valorant-coach-focus">
              ${elyToggleRow('id="valCoachVod"', ui("VOD Review"), false)}
              ${elyToggleRow('id="valCoachAim"', ui("Aim Training"), false)}
              ${elyToggleRow('id="valCoachPlan"', ui("Rank Improvement Plan"), false)}
            </div>
          </div>
          <div class="field-block field-block--tight valorant-leveling-server">${valorantServerSelectHtml()}</div>
        </div>`;
      }
      return `<div><label for="privateText">Custom Request</label><textarea id="privateText" placeholder="Describe the exact service, quantity, timing, and notes."></textarea></div><div class="badge">Price: CUSTOM</div>`;
    }

    function syncArcWeaponModUi() {
      const form = $("orderForm");
      if (!form) return;
      const svc = currentService();
      const t = svc?.form;
      if (t === "guns") {
        const allow = weaponAllowsArcMods(val("gunWeapon"));
        const cell = form.querySelector('[data-arc-mod-cell="gun"]');
        const hint = form.querySelector('[data-arc-mod-hint="gun"]');
        const bundle = $("gunsBundleWrap");
        const modSel = $("gunModType");
        if (!allow && modSel) modSel.value = "none";
        if (cell) cell.style.display = allow ? "" : "none";
        if (hint) hint.style.display = allow ? "" : "none";
        if (bundle) bundle.style.display = allow ? "" : "none";
      }
      if (t === "loadout") {
        ["primary", "secondary"].forEach(prefix => {
          const allow = weaponAllowsArcMods(val(prefix + "Weapon"));
          const cell = form.querySelector(`[data-arc-mod-cell="${prefix}"]`);
          const hint = form.querySelector(`[data-arc-mod-hint="${prefix}"]`);
          const modSel = $(prefix + "ModType");
          if (!allow && modSel) modSel.value = "none";
          if (cell) cell.style.display = allow ? "" : "none";
          if (hint) hint.style.display = allow ? "" : "none";
        });
      }
    }

    function weaponBlock(title, prefix) {
      return `<div class="field-block"><h4>${escapeHtml(title)}</h4><div class="field-grid loadout-weapon-grid"><div class="ely-form-cell"><label for="${prefix}Weapon">${ui("Weapon")}</label><select id="${prefix}Weapon">${weaponOptions(true)}</select></div><div class="ely-form-cell ely-form-cell--arc-mods" data-arc-mod-cell="${prefix}"><label for="${prefix}ModType">${ui("Mods")}</label><select id="${prefix}ModType">${modTierOptionsHtml()}</select></div>${qtyField(prefix + "WeaponQty", ui("Quantity"))}</div><p class="loadout-mod-hint" data-arc-mod-hint="${prefix}" role="note">${ui("Mod quantity automatically matches weapon quantity.")}</p></div>`;
    }

    function wireValorantForm(type) {
      document.querySelectorAll("#detailSection [data-val-mode]").forEach(btn => {
        btn.addEventListener("click", () => {
          const modeInput = $("valMode");
          if (modeInput) modeInput.value = btn.dataset.valMode;
          document.querySelectorAll("#detailSection [data-val-mode]").forEach(b => b.classList.toggle("active", b === btn));
          updateTotal();
        });
      });
      const bindPills = (selector, hiddenId, getVal) => {
        document.querySelectorAll(selector).forEach(btn => {
          btn.addEventListener("click", () => {
            const hid = $(hiddenId);
            if (hid) hid.value = getVal(btn);
            document.querySelectorAll(selector).forEach(b => b.classList.toggle("active", b === btn));
            updateTotal();
          });
        });
      };
      if (type === "valorant-unrated") bindPills("#detailSection [data-val-unrated]", "valUnratedPkg", b => b.dataset.valUnrated || "");
      if (type === "valorant-leveling") {
        const syncLevelPkg = () => {
          const from = Number(val("valLevelFrom") || 1);
          const map = { 1: "l1", 5: "l5", 10: "l10", 15: "l15" };
          const hid = $("valLevelPkg");
          if (hid) hid.value = map[from] || "l1";
          updateTotal();
        };
        const applyPkgToFrom = () => {
          const id = val("valLevelPkg") || "l1";
          const rev = { l1: "1", l5: "5", l10: "10", l15: "15" };
          const el = $("valLevelFrom");
          if (el) el.value = rev[id] || "1";
        };
        applyPkgToFrom();
        $("valLevelFrom")?.addEventListener("change", syncLevelPkg);
      }
      if (type === "valorant-battlepass") bindPills("#detailSection [data-val-bp]", "valBpPkg", b => b.dataset.valBp || "");
      if (type === "valorant-coaching") {
        $("valCoachHours")?.addEventListener("input", () => {
          const el = $("valCoachHours");
          if (!el) return;
          el.value = String(Math.max(1, Math.min(10, Math.round(Number(el.value || 1)))));
        });
      }
    }

    function wireTFTRankUpForm() {
      const noDiv = new Set(["Master","Grandmaster","Challenger"]);
      function syncDivVisibility() {
        const curRank = val("tftCurrentRank") || "";
        const desRank = val("tftDesiredRank") || "";
        const curWrap = $("tftCurrentDivWrap");
        const desWrap = $("tftDesiredDivWrap");
        if (curWrap) curWrap.classList.toggle("tft-div-wrap--hidden", noDiv.has(curRank));
        if (desWrap) desWrap.classList.toggle("tft-div-wrap--hidden", noDiv.has(desRank));
        updateTotal();
      }
      $("tftCurrentRank")?.addEventListener("change", syncDivVisibility);
      $("tftDesiredRank")?.addEventListener("change", syncDivVisibility);
      syncDivVisibility();
    }

    function wireForm(type) {
      if (type && String(type).startsWith("valorant-")) wireValorantForm(type);
      if (type === "tft-rank-up") wireTFTRankUpForm();
      if (type === "blueprints") wireBlueprints();
      if (type === "loadout") {
        const bundleInput = $("loadoutBundle");
        const bundleButtons = Array.from(document.querySelectorAll("#orderForm [data-loadout-bundle]"));
        const clearBundle = () => {
          bundleInput.value = "0";
          bundleButtons.forEach(button => button.classList.remove("active"));
        };
        bundleButtons.forEach(button => button.addEventListener("click", () => {
          const count = Number(button.dataset.loadoutBundle);
          bundleInput.value = String(count);
          bundleButtons.forEach(item => item.classList.toggle("active", item === button));
          if ($("primaryWeapon").value === "No Weapon") $("primaryWeapon").value = "Anvil";
          $("primaryWeaponQty").value = count;
          updateTotal();
        }));
        ["primaryWeapon", "primaryWeaponQty", "primaryModType", "secondaryWeapon", "secondaryWeaponQty", "secondaryModType", "augmentQty", "shieldQty", "bandageQty", "nadeQty", "rechargerQty", "surgeRechargerQty"].forEach(id => {
          $(id)?.addEventListener("input", event => {
            if (event.target.id !== "primaryWeapon") clearBundle();
          });
          $(id)?.addEventListener("change", event => {
            if (event.target.id !== "primaryWeapon") clearBundle();
          });
        });
      }
      if (type === "workshop") {
        const from = $("workshopFrom");
        const to = $("workshopTo");
        const bundleInput = $("workshopBundle");
        const bundleButton = $("maxWorkshopScrappy");
        const modeInput = $("workshopMode");
        const modeButtons = Array.from(document.querySelectorAll("#orderForm [data-workshop-mode]"));
        const panels = Array.from(document.querySelectorAll("#orderForm [data-workshop-panel]"));
        const workshopChecks = Array.from(document.querySelectorAll("#orderForm [data-workshop]"));
        const workshopRange = $("workshopDualRange");
        const scrappyFrom = $("scrappyFrom");
        const scrappyTo = $("scrappyTo");
        const scrappyRange = $("scrappyDualRange");
        const clearWorkshopBundle = () => {
          bundleInput.value = "0";
          bundleButton.classList.remove("active");
        };
        const syncWorkshopMode = mode => {
          modeInput.value = mode;
          modeButtons.forEach(button => button.classList.toggle("active", button.dataset.workshopMode === mode));
          panels.forEach(panel => panel.classList.toggle("is-hidden", panel.dataset.workshopPanel !== mode));
        };
        const syncWorkshopLevels = changed => {
          let start = Number(from.value);
          let end = Number(to.value);
          if (start >= end) {
            if (changed === "from") {
              end = Math.min(3, start + 1);
              to.value = String(end);
              if (start >= end) {
                start = Math.max(1, end - 1);
                from.value = String(start);
              }
            } else {
              start = Math.max(1, end - 1);
              from.value = String(start);
            }
          }
          $("workshopFromLabel").textContent = start;
          $("workshopToLabel").textContent = end;
          workshopRange.style.setProperty("--range-left", `${((start - 1) / 2) * 100}%`);
          workshopRange.style.setProperty("--range-right", `${100 - ((end - 1) / 2) * 100}%`);
        };
        const syncScrappyRange = changed => {
          let start = Number(scrappyFrom.value);
          let end = Number(scrappyTo.value);
          if (start >= end) {
            if (changed === "from") {
              end = Math.min(5, start + 1);
              scrappyTo.value = String(end);
              if (start >= end) {
                start = Math.max(1, end - 1);
                scrappyFrom.value = String(start);
              }
            } else {
              start = Math.max(1, end - 1);
              scrappyFrom.value = String(start);
            }
          }
          $("scrappyFromLabel").textContent = start;
          $("scrappyToLabel").textContent = end;
          scrappyRange.style.setProperty("--range-left", `${((start - 1) / 4) * 100}%`);
          scrappyRange.style.setProperty("--range-right", `${100 - ((end - 1) / 4) * 100}%`);
        };
        modeButtons.forEach(button => button.addEventListener("click", () => {
          clearWorkshopBundle();
          syncWorkshopMode(button.dataset.workshopMode);
          updateTotal();
        }));
        from.addEventListener("input", () => {
          clearWorkshopBundle();
          syncWorkshopLevels("from");
          updateTotal();
        });
        to.addEventListener("input", () => {
          clearWorkshopBundle();
          syncWorkshopLevels("to");
          updateTotal();
        });
        scrappyFrom.addEventListener("input", () => {
          clearWorkshopBundle();
          syncScrappyRange("from");
          updateTotal();
        });
        scrappyTo.addEventListener("input", () => {
          clearWorkshopBundle();
          syncScrappyRange("to");
          updateTotal();
        });
        workshopChecks.forEach(input => input.addEventListener("change", clearWorkshopBundle));
        bundleButton.addEventListener("click", () => {
          from.value = "1";
          to.value = "3";
          workshopChecks.forEach(input => { input.checked = true; });
          scrappyFrom.value = "1";
          scrappyTo.value = "5";
          bundleInput.value = "1";
          bundleButton.classList.add("active");
          syncWorkshopMode("workshop");
          syncWorkshopLevels("to");
          syncScrappyRange("to");
          updateTotal();
        });
        syncWorkshopMode(modeInput.value);
        syncWorkshopLevels("to");
        syncScrappyRange("to");
      }
      if (type === "coins") {
        const dealButtons = Array.from(document.querySelectorAll("#orderForm [data-coin-deal]"));
        const syncCoin = () => {
          const amount = Number(val("coinAmount"));
          const tier = coinTier(amount);
          $("coinDeal").value = tier ? String(amount) : "";
          dealButtons.forEach(button => button.classList.toggle("active", Number(button.dataset.coinDeal) === amount));
          $("coinDiscountTag").classList.toggle("active", Boolean(tier));
          const next = nextCoinTier(amount);
          const guide = $("coinDiscountGuidance");
          if (guide) {
            let msg = "";
            if (tier) {
              const pct = Math.round(tier.discount * 100);
              msg = `Discount unlocked: ${pct}% OFF`;
              if (next) msg += ` Â· Next: ${Math.round(next.discount * 100)}% OFF at ${next.amount.toLocaleString()} coins`;
              else msg += " Â· Highest tier on slider.";
            } else if (next) {
              const need = next.amount - amount;
              msg = `Add ${need.toLocaleString()} more coins for ${Math.round(next.discount * 100)}% OFF (tier at ${next.amount.toLocaleString()})`;
            } else {
              msg = "Slide past a deal threshold on the track for bundled savings.";
            }
            guide.textContent = msg;
            guide.classList.toggle("is-unlocked", Boolean(tier));
          }
          document.querySelectorAll("#orderForm .coin-slider-mark[data-tier-amount]").forEach(el => {
            const ta = Number(el.dataset.tierAmount);
            const applied = coinTier(amount);
            el.classList.toggle("is-active", Boolean(applied) && applied.amount === ta);
          });
          $("coinLabel").textContent = amount.toLocaleString();
          updateTotal();
        };
        $("coinAmount").addEventListener("input", syncCoin);
        dealButtons.forEach(button => button.addEventListener("click", () => {
          $("coinAmount").value = button.dataset.coinDeal;
          syncCoin();
        }));
        syncCoin();
      }
      if (type === "seeds") {
        const dealButtons = Array.from(document.querySelectorAll("#orderForm [data-seed-deal]"));
        const syncSeeds = () => {
          const amount = Number(val("seedAmount"));
          const tier = seedTier(amount);
          $("seedDeal").value = tier ? String(amount) : "";
          dealButtons.forEach(button => button.classList.toggle("active", Number(button.dataset.seedDeal) === amount));
          $("seedDiscountTag").classList.toggle("active", Boolean(tier));
          const next = nextSeedTier(amount);
          const guide = $("seedDiscountGuidance");
          if (guide) {
            let msg = "";
            if (tier) {
              const pct = Math.round(tier.discount * 100);
              msg = `Bulk discount unlocked: ${pct}% OFF`;
              if (next) msg += ` Â· Next: ${Math.round(next.discount * 100)}% OFF at ${next.amount.toLocaleString()} seeds`;
              else msg += " Â· Highest tier on slider.";
            } else if (next) {
              const need = next.amount - amount;
              msg = `Add ${need.toLocaleString()} more seeds for ${Math.round(next.discount * 100)}% OFF (tier at ${next.amount.toLocaleString()})`;
            } else {
              msg = "Slide past a bulk threshold on the track for extra savings.";
            }
            guide.textContent = msg;
            guide.classList.toggle("is-unlocked", Boolean(tier));
          }
          document.querySelectorAll("#orderForm .coin-slider-mark[data-seed-tier-amount]").forEach(el => {
            const ta = Number(el.dataset.seedTierAmount);
            const applied = seedTier(amount);
            el.classList.toggle("is-active", Boolean(applied) && applied.amount === ta);
          });
          $("seedLabel").textContent = amount.toLocaleString();
          updateTotal();
        };
        $("seedAmount").addEventListener("input", syncSeeds);
        dealButtons.forEach(button => button.addEventListener("click", () => {
          $("seedAmount").value = button.dataset.seedDeal;
          syncSeeds();
        }));
        syncSeeds();
      }
      if (type === "depositary") {
        const syncSlots = source => {
          let slots = Math.max(1, Math.min(999, Math.round(Number(val(source) || 1))));
          if (source === "depositarySlots") $("depositaryCustom").value = slots;
          if (source === "depositaryCustom") $("depositarySlots").value = Math.max(20, Math.min(280, Math.round(slots / 20) * 20));
          $("slotLabel").textContent = slots + " Slots";
          updateTotal();
        };
        $("depositarySlots").addEventListener("input", () => syncSlots("depositarySlots"));
        $("depositaryCustom").addEventListener("input", () => syncSlots("depositaryCustom"));
        syncSlots("depositaryCustom");
      }
      if (type === "guns") $("bundle20")?.addEventListener("click", () => {
        $("gunQty").value = 20;
        if ($("gunModType")) $("gunModType").value = "premium";
        $("bundle20")?.classList.add("active");
        updateTotal();
      });
      if (type === "trials") {
        updateTrialOptions();
        $("trialRank").addEventListener("change", () => {
          updateTrialOptions();
          updateTotal();
        });
        $("trialRankUp").addEventListener("change", () => {
          updateTrialOptions();
          updateTotal();
        });
      }
      if (type === "pvp") {
        document.querySelectorAll("#orderForm [data-coach-focus]").forEach(button => button.addEventListener("click", () => {
          $("coachFocus").value = button.dataset.coachFocus;
          document.querySelectorAll("#orderForm [data-coach-focus]").forEach(item => item.classList.toggle("active", item === button));
          updateTotal();
        }));
        document.querySelectorAll("#orderForm [data-coach-team]").forEach(button => button.addEventListener("click", () => {
          $("pvpMode").value = button.dataset.coachTeam;
          document.querySelectorAll("#orderForm [data-coach-team]").forEach(item => item.classList.toggle("active", item === button));
          updateTotal();
        }));
        $("pvpHours").addEventListener("input", () => {
          $("pvpHours").value = Math.max(1, Math.min(6, Math.round(Number($("pvpHours").value || 1))));
          updateTotal();
        });
      }
      if (type === "boss") {
        document.querySelectorAll("#orderForm [data-boss]").forEach(button => button.addEventListener("click", () => {
          $("boss").value = button.dataset.boss;
          document.querySelectorAll("#orderForm [data-boss]").forEach(item => item.classList.toggle("active", item === button));
          updateTotal();
        }));
      }
      if (type === "raid") wireRaidForm();
      const bindRoot = $("detailSection") || $("orderCardBody") || $("orderForm");
      bindRoot.querySelectorAll("input, select, textarea").forEach(input => {
        input.addEventListener("input", updateTotal);
        input.addEventListener("change", updateTotal);
      });
      wireQtySteppers(bindRoot);
      if (type === "guns" || type === "loadout") {
        const bumpArcMods = () => {
          syncArcWeaponModUi();
          updateTotal();
        };
        $("gunWeapon")?.addEventListener("change", bumpArcMods);
        $("primaryWeapon")?.addEventListener("change", bumpArcMods);
        $("secondaryWeapon")?.addEventListener("change", bumpArcMods);
        syncArcWeaponModUi();
      }
    }

    function wireRaidForm() {
      const raidInput = $("raidCount");
      const eventInput = $("raidEventMode");
      const packageButtons = Array.from(document.querySelectorAll("#orderForm [data-raid-package]"));
      const teamButtons = Array.from(document.querySelectorAll("#orderForm [data-raid-team]"));

      const clampRaidCount = () => {
        const next = Math.max(2, Math.min(12, Math.round(Number(raidInput.value || 2))));
        raidInput.value = next;
        return next;
      };

      const syncRaidPanel = () => {
        const count = clampRaidCount();
        packageButtons.forEach(button => button.classList.toggle("active", Number(button.dataset.raidPackage) === count));
      };

      packageButtons.forEach(button => button.addEventListener("click", () => {
        raidInput.value = button.dataset.raidPackage;
        syncRaidPanel();
        updateTotal();
      }));
      teamButtons.forEach(button => button.addEventListener("click", () => {
        teamButtons.forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        updateTotal();
      }));

      eventInput.addEventListener("change", updateTotal);
      syncRaidPanel();
    }

    function wireBlueprints() {
      const tabs = Object.keys(blueprintGroups);
      $("bpTabs").innerHTML = tabs.map(tab => `<button class="tab-btn ${tab === state.bpTab ? "active" : ""}" type="button" data-bp="${tab}">${displayItemName(tab)}</button>`).join("");

      const setBlueprintTab = tab => {
        if (!blueprintGroups[tab]) return;
        state.bpTab = tab;
        document.querySelectorAll("[data-bp]").forEach(item => item.classList.toggle("active", item.dataset.bp === tab));
      };

      const matchesBlueprintQuery = (name, query) => {
        if (!query) return true;
        return name.toLowerCase().includes(query) || trName(name).toLowerCase().includes(query);
      };

      function draw() {
        const query = val("bpSearch").trim().toLowerCase();
        if (query) {
          const matchingTab = tabs.find(tab => blueprintGroups[tab].some(name => matchesBlueprintQuery(name, query)));
          if (matchingTab && matchingTab !== state.bpTab) setBlueprintTab(matchingTab);
        }
        const selected = state.blueprintSelections[state.bpTab];
        const list = blueprintGroups[state.bpTab].filter(name => matchesBlueprintQuery(name, query));
        $("bpContent").innerHTML = `<div class="scroll-list">${list.map(name => elyToggleRow(`type="checkbox" value="${escapeHtml(name)}"`, escapeHtml(displayItemName(name)), selected.has(name))).join("") || `<div class="empty">${ui("No blueprint found.")}</div>`}</div>`;
        $("bpContent").querySelectorAll("input").forEach(input => input.addEventListener("change", () => {
          input.checked ? selected.add(input.value) : selected.delete(input.value);
          updateTotal();
        }));
      }

      $("bpSelectAll").addEventListener("click", () => {
        const query = val("bpSearch").trim().toLowerCase();
        const selected = state.blueprintSelections[state.bpTab];
        blueprintGroups[state.bpTab]
          .filter(name => matchesBlueprintQuery(name, query))
          .forEach(name => selected.add(name));
        draw();
        updateTotal();
      });

      document.querySelectorAll("[data-bp]").forEach(button => button.addEventListener("click", () => {
        setBlueprintTab(button.dataset.bp);
        draw();
        updateTotal();
      }));
      $("bpSearch").addEventListener("input", draw);
      if (state.pendingBlueprintSearch) {
        setBlueprintTab(state.pendingBlueprintSearch.tab);
        $("bpSearch").value = state.pendingBlueprintSearch.query;
        state.pendingBlueprintSearch = null;
      }
      draw();
    }

    function updateTrialOptions() {
      const rank = val("trialRank");
      const options = trialOptions(rank);
      $("trialOption").innerHTML = options.map(option => `<option value="${option.value}" data-label="${option.label}" data-price="${option.price}">${option.label} (${moneyUSD(option.price)})</option>`).join("");
      $("trialOption").disabled = !$("trialRankUp")?.checked;
    }

    function trialOptions(rank) {
      if (rank === "Hotshot") return [{ value: "secure", label: "Rank Secure", price: 15 }];
      if (rank === "Daredevil III") return [{ value: "none", label: "No Rank Up", price: 0 }, { value: "plus1", label: "+1 Rank Up", price: 15 }];
      if (rank === "Daredevil II") return [{ value: "none", label: "No Rank Up", price: 0 }, { value: "plus1", label: "+1 Rank Up", price: 5 }, { value: "plus2", label: "+2 Rank Up", price: 15 }];
      return [{ value: "none", label: "No Rank Up", price: 0 }, { value: "plus1", label: "+1 Rank Up", price: 5 }, { value: "plus2", label: "+2 Rank Up", price: 10 }, { value: "plus3", label: "+3 Rank Up", price: 15 }];
    }

    function modPrice(type) {
      if (type === "blue") return prices.blueMod;
      if (type === "premium") return prices.premiumMod;
      return 0;
    }

    function modLabel(type) {
      if (type === "blue") return "Blue Mods";
      if (type === "premium") return "Legendary / Epic Mods";
      return "No Mods";
    }

    function calcWeapon(prefix, simple = false) {
      const weapon = val(simple ? "gunWeapon" : prefix + "Weapon");
      const weaponQty = Math.max(0, num(simple ? "gunQty" : prefix + "WeaponQty"));
      let modType = val(simple ? "gunModType" : prefix + "ModType");
      const finalWeaponQty = weapon === "No Weapon" ? 0 : weaponQty;
      if (!weaponAllowsArcMods(weapon)) modType = "none";
      const modQty = modType === "none" ? 0 : finalWeaponQty;
      const base = weaponBasePriceUsd(weapon);
      return {
        weapon,
        weaponQty: finalWeaponQty,
        modType,
        modQty,
        total: finalWeaponQty * base + modQty * modPrice(modType)
      };
    }

    const PRIVATE_ESTIMATE_NOTE = "This is only an estimated price. Final price may change after staff review.";

    function parseNumber(text) {
      if (!text) return 0;
      let value = String(text).toLowerCase().replace(/[,_\s]/g, "");
      let multiplier = 1;
      if (value.endsWith("kk")) { multiplier = 1_000_000; value = value.slice(0, -2); }
      else if (value.endsWith("k")) { multiplier = 1_000; value = value.slice(0, -1); }
      else if (value.endsWith("m")) { multiplier = 1_000_000; value = value.slice(0, -1); }
      const n = parseFloat(value);
      return isNaN(n) ? 0 : n * multiplier;
    }

    function estimatePrivateOrder(text) {
      const result = { total: 0, lines: [] };
      if (!text) return result;
      const lower = " " + String(text).toLowerCase().replace(/\s+/g, " ") + " ";
      const tryMatch = (regex, handler) => {
        let match;
        regex.lastIndex = 0;
        while ((match = regex.exec(lower)) !== null) handler(match);
      };

      tryMatch(/(\d[\d,_.]*\s*[km]{1,2})\s*(?:raider\s*)?coins?\b/g, m => {
        const amount = parseNumber(m[1]);
        if (amount < 1000) return;
        const cost = (amount / 100000) * prices.coins100k;
        result.total += cost;
        result.lines.push(`${amount.toLocaleString()} Raider Coins â‰ˆ ${moneyUSD(cost)}`);
      });

      tryMatch(/(\d[\d,_.]*)\s*(?:assorted\s*)?seeds?\b/g, m => {
        const amount = parseNumber(m[1]);
        if (amount < 50) return;
        const cost = (amount / 100) * prices.seeds100;
        result.total += cost;
        result.lines.push(`${amount.toLocaleString()} Assorted Seeds â‰ˆ ${moneyUSD(cost)}`);
      });

      tryMatch(/(\d+)\s*x?\s*blueprints?\b/g, m => {
        const qty = parseInt(m[1], 10);
        if (!qty) return;
        const cost = qty * prices.blueprint;
        result.total += cost;
        result.lines.push(`${qty}x Blueprints â‰ˆ ${moneyUSD(cost)}`);
      });

      tryMatch(/(\d+)\s*x?\s*(?:weapons?|guns?)\b/g, m => {
        const qty = parseInt(m[1], 10);
        if (!qty) return;
        const cost = qty * 0.45;
        result.total += cost;
        result.lines.push(`${qty}x Weapons â‰ˆ ${moneyUSD(cost)}`);
      });

      tryMatch(/(\d+)\s*x?\s*(?:legendary|epic|premium)\s*mods?\b/g, m => {
        const qty = parseInt(m[1], 10);
        if (!qty) return;
        const cost = qty * prices.premiumMod;
        result.total += cost;
        result.lines.push(`${qty}x Legendary / Epic Mods â‰ˆ ${moneyUSD(cost)}`);
      });

      tryMatch(/(\d+)\s*x?\s*blue\s*mods?\b/g, m => {
        const qty = parseInt(m[1], 10);
        if (!qty) return;
        const cost = qty * prices.blueMod;
        result.total += cost;
        result.lines.push(`${qty}x Blue Mods â‰ˆ ${moneyUSD(cost)}`);
      });

      tryMatch(/(\d+)\s*x?\s*(?:raids?|raid\s*runs?)\b/g, m => {
        const qty = parseInt(m[1], 10);
        if (!qty) return;
        const cost = qty * prices.raid;
        result.total += cost;
        result.lines.push(`${qty}x Raids â‰ˆ ${moneyUSD(cost)}`);
      });

      tryMatch(/(\d+)\s*x?\s*(?:trials?|trial\s*runs?)\b/g, m => {
        const qty = parseInt(m[1], 10);
        if (!qty) return;
        const cost = qty * prices.trialsBase;
        result.total += cost;
        result.lines.push(`${qty}x Trials â‰ˆ ${moneyUSD(cost)}`);
      });

      tryMatch(/(\d+)\s*(?:slots?|depository|depositary)\b/g, m => {
        const qty = parseInt(m[1], 10);
        if (!qty) return;
        const cost = qty * prices.depositarySlot;
        result.total += cost;
        result.lines.push(`${qty} Depositary Slots â‰ˆ ${moneyUSD(cost)}`);
      });

      tryMatch(/(\d+)\s*x?\s*workshop\s*(?:benches?|workbenches?|levels?)?\b/g, m => {
        const qty = parseInt(m[1], 10);
        if (!qty) return;
        const cost = qty * prices.workshopBench;
        result.total += cost;
        result.lines.push(`${qty}x Workshop Benches â‰ˆ ${moneyUSD(cost)}`);
      });

      tryMatch(/scrappy\s*(?:level\s*)?(\d+)\s*(?:to|->|â€“|â€”)\s*(\d+)/g, m => {
        const from = parseInt(m[1], 10);
        const to = parseInt(m[2], 10);
        if (to <= from) return;
        const cost = Math.max(0, to - from) * prices.scrappyLevel;
        result.total += cost;
        result.lines.push(`Scrappy ${from} to ${to} â‰ˆ ${moneyUSD(cost)}`);
      });

      tryMatch(/(?:level|lvl)\s*(\d+)\s*(?:to|->|â€“|â€”)\s*(\d+)/g, m => {
        const from = parseInt(m[1], 10);
        const to = parseInt(m[2], 10);
        if (to <= from) return;
        const cost = levelCost(from, to);
        result.total += cost;
        result.lines.push(`Leveling ${from} to ${Math.min(75, to)} â‰ˆ ${moneyUSD(cost)}`);
      });

      tryMatch(/(\d+)\s*x?\s*(?:queen|matriarch|harvester|boss)\b/g, m => {
        const qty = parseInt(m[1], 10);
        if (!qty) return;
        const cost = qty * 20;
        result.total += cost;
        result.lines.push(`${qty}x Boss/Puzzle â‰ˆ ${moneyUSD(cost)}`);
      });

      tryMatch(/(\d+)\s*x?\s*(?:coaching|coach)\b/g, m => {
        const qty = parseInt(m[1], 10);
        if (!qty) return;
        const cost = qty * 20;
        result.total += cost;
        result.lines.push(`${qty}x Coaching Hours â‰ˆ ${moneyUSD(cost)}`);
      });

      result.total = Math.round(result.total * 100) / 100;
      return result;
    }

    function levelCost(current, target) {
      const cap = Math.min(target, 75);
      if (cap <= current) return 0;
      return Math.max(0, Math.min(cap, 25) - current) * 2 +
        Math.max(0, Math.min(cap, 50) - Math.max(current, 25)) * 2.5 +
        Math.max(0, cap - Math.max(current, 50)) * 3;
    }

    function oldLevelCost(current, target) {
      const cap = Math.min(target, 75);
      if (cap <= current) return 0;
      return Math.max(0, Math.min(cap, 25) - current) * 2 +
        Math.max(0, Math.min(cap, 50) - Math.max(current, 25)) * 2.5 +
        Math.max(0, cap - Math.max(current, 50)) * 3.5;
    }

    function calculateTFTRankUp(service) {
      const noDiv = new Set(["Master","Grandmaster","Challenger"]);
      const curRank = val("tftCurrentRank") || "Bronze";
      const desRank = val("tftDesiredRank") || "Gold";
      const curDiv = noDiv.has(curRank) ? null : (val("tftCurrentDiv") || "IV");
      const desDiv = noDiv.has(desRank) ? null : (val("tftDesiredDiv") || "IV");
      const server = val("tftServer") || "EU";
      const gamerGirl = Boolean($("tftGamerGirl")?.checked);
      const curIdx = TFT_RANK_STEPS.findIndex(function(s) { return s.rank === curRank && s.div === curDiv; });
      const desIdx = TFT_RANK_STEPS.findIndex(function(s) { return s.rank === desRank && s.div === desDiv; });
      if (curIdx < 0 || desIdx < 0) {
        return { total: 0, valid: false, details: "", custom: false, tftRankError: "Invalid rank selection." };
      }
      if (desIdx <= curIdx) {
        return { total: 0, valid: false, details: "", custom: false, tftRankError: "Desired rank must be higher than current rank." };
      }
      let base = 0;
      for (let i = curIdx; i < desIdx; i++) base += tftStepCost(TFT_RANK_STEPS[i].rank);
      const total = base + (gamerGirl ? 6 : 0);
      const curLabel = curDiv ? curRank + " " + curDiv : curRank;
      const desLabel = desDiv ? desRank + " " + desDiv : desRank;
      const details = [
        "Game: Teamfight Tactics",
        "Service: TFT Rank Up",
        "Current Rank: " + curLabel,
        "Desired Rank: " + desLabel,
        "Server: " + server,
        "Gamer Girl: " + (gamerGirl ? "Yes" : "No"),
        "Total: $" + total + " USD"
      ].join("\n");
      return { total: total, valid: true, custom: false, details: details, tftRankError: "" };
    }

    function valorantRankBoostSegmentEur(cur, des) {
      const ci = VALORANT_RANKS.indexOf(cur);
      if (ci < 0) return { error: "Invalid current rank.", custom: false, baseEur: 0 };
      if (des === "Radiant") return { error: "", custom: true, baseEur: 0 };
      const di = VALORANT_RANKS.indexOf(des);
      if (di < 0) return { error: "Invalid desired rank.", custom: false, baseEur: 0 };
      if (di <= ci) return { error: "Please select a higher desired rank.", custom: false, baseEur: 0 };
      let sum = 0;
      for (let i = ci; i < di; i += 1) {
        sum += VALORANT_RANK_SEGMENT_EUR[i];
      }
      return { error: "", custom: false, baseEur: sum };
    }

    function valorantExtrasBundle() {
      let pct = 0;
      const paid = [];
      const free = [];
      const root = $("detailSection") || $("orderCardBody") || $("orderForm");
      if (!root) return { pct: 0, paid, free };
      root.querySelectorAll("[data-val-extra-pct]").forEach(input => {
        if (input.type === "checkbox" && input.checked) {
          pct += Number(input.dataset.valExtraPct || 0);
          paid.push(String(input.dataset.valExtraLabel || ""));
        }
      });
      root.querySelectorAll("[data-val-extra-free]").forEach(input => {
        if (input.type === "checkbox" && input.checked) {
          free.push(String(input.dataset.valExtraLabel || ""));
        }
      });
      return { pct, paid, free };
    }

    function valorantCoachFocusLabels() {
      const labels = [];
      if ($("valCoachVod")?.checked) labels.push("VOD Review");
      if ($("valCoachAim")?.checked) labels.push("Aim Training");
      if ($("valCoachPlan")?.checked) labels.push("Rank Improvement Plan");
      return labels;
    }

    function calculateValorant(type, service) {
      const server = val("valServer") || "EU";
      const modeLabel = (val("valMode") || "solo") === "duo" ? "Duo" : "Solo";
      const catTitle = valorantCategoryContent[service.category]?.title || service.cardTitle;
      let ex = valorantExtrasBundle();
      if (type === "valorant-coaching") {
        ex = { pct: 0, paid: [], free: valorantCoachFocusLabels() };
      }
      const rows = [];
      const addRow = (dt, dd) => rows.push({ dt, dd });
      const detailLines = [];
      const dPush = (a, b) => detailLines.push(`${a}: ${b}`);

      addRow("Game", "Valorant");
      addRow("Service Category", catTitle);
      addRow("Server", server + " (info)");
      addRow("Mode", modeLabel);

      if (type === "valorant-radiant") {
        const opt = val("valRadOption");
        addRow("Selected Options", opt);
        addRow("Paid Extras", "None");
        addRow("Free Extras", "None");
        addRow("Base Price", "Custom Price");
        addRow("Extras Price", "â€”");
        addRow("Discount", "â€”");
        addRow("Total Price", "Custom Price");
        dPush("Game", "Valorant");
        dPush("Service Category", catTitle);
        dPush("Selected Options", opt);
        dPush("Server", server + " (informational)");
        dPush("Mode", modeLabel);
        dPush("Paid Extras", "None");
        dPush("Free Extras", "None");
        dPush("Base Price", "Custom Price");
        dPush("Extras Price", "â€”");
        dPush("Discount", "â€”");
        dPush("Total Price", "Custom Price");
        return {
          total: 0,
          valid: true,
          custom: true,
          contactOnly: true,
          estimated: false,
          details: detailLines.join("\n"),
          valorantRows: rows,
          valorantNote: "",
          valorantError: ""
        };
      }

      let baseEur = 0;
      let selectedSummary = "";
      let bpNote = "";

      if (type === "valorant-rank-boost") {
        const cur = val("valRbCurrent");
        const des = val("valRbDesired");
        const rb = valorantRankBoostSegmentEur(cur, des);
        if (rb.error) {
          return {
            total: 0,
            valid: false,
            custom: false,
            estimated: false,
            details: "",
            valorantRows: [
              { dt: "Game", dd: "Valorant" },
              { dt: "Service Category", dd: catTitle },
              { dt: "Note", dd: rb.error }
            ],
            valorantNote: "",
            valorantError: rb.error,
            valorantValRbError: rb.error
          };
        }
        if (rb.custom) {
          const rr = val("valRbRR") || "â€”";
          addRow("Current Rank", cur);
          addRow("Desired Rank", des);
          addRow("Current RR", rr);
          addRow("Selected Options", cur + " â†’ " + des);
          addRow("Paid Extras", ex.paid.join(", ") || "None");
          addRow("Free Extras", ex.free.join(", ") || "None");
          addRow("Base Price", "Custom Price");
          addRow("Extras Price", "â€”");
          addRow("Discount", "â€”");
          addRow("Total Price", "Custom Price");
          dPush("Game", "Valorant");
          dPush("Service Category", catTitle);
          dPush("Current Rank", cur);
          dPush("Desired Rank", des);
          dPush("Current RR", rr);
          dPush("Server", server + " (informational)");
          dPush("Mode", modeLabel);
          dPush("Paid Extras", ex.paid.join(", ") || "None");
          dPush("Free Extras", ex.free.join(", ") || "None");
          dPush("Base Price", "Custom Price");
          dPush("Extras Price", "â€”");
          dPush("Discount", "â€”");
          dPush("Total Price", "Custom Price");
          return {
            total: 0,
            valid: true,
            custom: true,
            contactOnly: true,
            estimated: false,
            details: detailLines.join("\n"),
            valorantRows: rows,
            valorantNote: "",
            valorantError: ""
          };
        }
        baseEur = rb.baseEur;
        selectedSummary = `${cur} â†’ ${des}`;
        const rr = val("valRbRR") || "â€”";
        addRow("Current Rank", cur);
        addRow("Desired Rank", des);
        addRow("Current RR", rr);
        addRow("Selected Options", selectedSummary);
      } else if (type === "valorant-placement") {
        const rank = val("valPmRank");
        const games = Math.max(1, Math.min(5, Math.round(num("valPmGames") || 5)));
        const per = valorantPlacementRankEur[rank];
        if (per == null) {
          return {
            total: 0,
            valid: false,
            custom: false,
            estimated: false,
            details: "",
            valorantRows: [{ dt: "Game", dd: "Valorant" }, { dt: "Note", dd: "Select a valid rank." }],
            valorantNote: "",
            valorantError: "Select a valid rank."
          };
        }
        baseEur = per * games;
        selectedSummary = `${rank} Ã— ${games} games`;
        addRow("Last Known Rank", rank);
        addRow("Games", String(games));
        addRow("Selected Options", selectedSummary);
      } else if (type === "valorant-ranked-wins") {
        const rank = val("valRwRank");
        const wins = Math.max(1, Math.min(10, Math.round(num("valRwWins") || 3)));
        if (rank === "Radiant") {
          addRow("Current Rank", rank);
          addRow("Wins", String(wins));
          addRow("Selected Options", `${rank} â€” ${wins} wins`);
          addRow("Paid Extras", ex.paid.join(", ") || "None");
          addRow("Free Extras", ex.free.join(", ") || "None");
          addRow("Base Price", "Custom Price");
          addRow("Extras Price", "â€”");
          addRow("Discount", "â€”");
          addRow("Total Price", "Custom Price");
          dPush("Game", "Valorant");
          dPush("Service Category", catTitle);
          dPush("Current Rank", rank);
          dPush("Wins", String(wins));
          dPush("Server", server + " (informational)");
          dPush("Mode", modeLabel);
          dPush("Paid Extras", ex.paid.join(", ") || "None");
          dPush("Free Extras", ex.free.join(", ") || "None");
          dPush("Base Price", "Custom Price");
          dPush("Extras Price", "â€”");
          dPush("Discount", "â€”");
          dPush("Total Price", "Custom Price");
          return {
            total: 0,
            valid: true,
            custom: true,
            contactOnly: true,
            estimated: false,
            details: detailLines.join("\n"),
            valorantRows: rows,
            valorantNote: "",
            valorantError: ""
          };
        }
        const per = valorantRankedWinEur[rank];
        if (per == null) {
          return {
            total: 0,
            valid: false,
            custom: false,
            estimated: false,
            details: "",
            valorantRows: [{ dt: "Game", dd: "Valorant" }, { dt: "Note", dd: "Invalid rank." }],
            valorantNote: "",
            valorantError: "Invalid rank."
          };
        }
        baseEur = per * wins;
        selectedSummary = `${rank} â€” ${wins} wins`;
        addRow("Current Rank", rank);
        addRow("Wins", String(wins));
        addRow("Selected Options", selectedSummary);
      } else if (type === "valorant-unrated") {
        const id = val("valUnratedPkg") || "u5";
        const pack = valorantUnratedPackages.find(p => p.id === id) || valorantUnratedPackages[0];
        baseEur = pack.eur;
        selectedSummary = pack.label;
        addRow("Package", pack.label);
        addRow("Selected Options", pack.label);
      } else if (type === "valorant-leveling") {
        const id = val("valLevelPkg") || "l1";
        const pack = valorantLevelPackages.find(p => p.id === id) || valorantLevelPackages[0];
        baseEur = pack.eur;
        selectedSummary = pack.label;
        addRow("Package", pack.label);
        addRow("Selected Options", pack.label);
      } else if (type === "valorant-battlepass") {
        const id = val("valBpPkg") || "bp-small";
        const pack = valorantBattlePassPackages.find(p => p.id === id) || valorantBattlePassPackages[0];
        baseEur = pack.eur;
        selectedSummary = pack.label;
        addRow("Package", pack.label);
        addRow("Selected Options", pack.label);
        if (pack.id === "bp-express") bpNote = "Faster completion priority included.";
      } else if (type === "valorant-coaching") {
        const hours = Math.max(1, Math.min(10, Math.round(num("valCoachHours") || 1)));
        baseEur = hours * valorantCoachingHourlyEur;
        selectedSummary = `${hours} ${hours === 1 ? ui("hour") : ui("hours")}`;
        addRow("Hours", String(hours));
        addRow("Selected Options", selectedSummary);
        addRow("Focus (free)", ex.free.join(", ") || "None");
      }

      const duoEligible = type !== "valorant-radiant";
      const duoMult = duoEligible && (val("valMode") || "solo") === "duo" ? 1.15 : 1;
      const baseAfterDuo = baseEur * duoMult;
      const afterEur = baseAfterDuo * (1 + ex.pct);
      const extrasEur = Math.max(0, afterEur - baseAfterDuo);
      const stored = valorantEurToStoredTotal(afterEur);
      const total = Math.round(stored * 100) / 100;

      addRow("Paid Extras", ex.paid.length ? `${ex.paid.join(", ")} (+${Math.round(ex.pct * 100)}%)` : "None");
      addRow("Free Extras", ex.free.length ? ex.free.join(", ") : "None");
      addRow("Base Price", displayMoney(valorantEurToStoredTotal(baseEur)));
      if (duoMult > 1) addRow("Duo (+15%)", displayMoney(valorantEurToStoredTotal(baseEur * (duoMult - 1))));
      addRow("Extras Price", extrasEur > 0 ? displayMoney(valorantEurToStoredTotal(extrasEur)) : displayMoney(0));
      addRow("Discount", "â€”");
      addRow("Total Price", displayMoney(stored));

      dPush("Game", "Valorant");
      dPush("Service Category", catTitle);
      if (type === "valorant-rank-boost") dPush("Current RR", val("valRbRR") || "â€”");
      dPush("Selected Options", selectedSummary);
      dPush("Server", server + " (informational)");
      dPush("Mode", modeLabel);
      dPush("Paid Extras", ex.paid.join(", ") || "None");
      dPush("Free Extras", ex.free.join(", ") || "None");
      dPush("Base Price", displayMoney(valorantEurToStoredTotal(baseEur)));
      if (duoMult > 1) dPush("Duo (+15%)", displayMoney(valorantEurToStoredTotal(baseEur * (duoMult - 1))));
      dPush("Extras Price", extrasEur > 0 ? displayMoney(valorantEurToStoredTotal(extrasEur)) : displayMoney(0));
      dPush("Discount", "â€”");
      dPush("Total Price", displayMoney(stored));

      return {
        total,
        valid: true,
        custom: false,
        contactOnly: false,
        estimated: false,
        details: detailLines.join("\n"),
        valorantRows: rows,
        valorantNote: bpNote,
        valorantError: ""
      };
    }




