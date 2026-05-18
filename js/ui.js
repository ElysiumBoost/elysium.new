    function calculate() {
      const service = currentService();
      if (!service) return { total: 0, valid: false, details: "", custom: false, estimated: false };
      const type = service.form;
      if (type && String(type).startsWith("valorant-")) {
        return calculateValorant(type, service);
      }
      if (type === "fast") {
        const qty = Math.max(1, num("fastQty"));
        return { total: service.fromUSD * qty, valid: true, details: `Quantity / Hours: ${qty}\nNotes: ${val("fastNote") || "None"}` };
      }
      if (type === "blueprints") {
        const groups = Object.entries(state.blueprintSelections).map(([group, set]) => [group, Array.from(set).sort()]);
        const all = groups.flatMap(([, list]) => list);
        const details = groups.map(([group, list]) => list.length ? `${displayItemName(group)}: ${displayItemList(list)}` : "").filter(Boolean).join("\n") || "No blueprints selected";
        return { total: all.length * prices.blueprint, oldTotal: all.length * 1.50, valid: all.length > 0, details };
      }
      if (type === "coins") {
        const amount = Math.max(100000, Math.min(12000000, num("coinAmount")));
        const base = amount / 100000 * prices.coins100k;
        const tier = coinTier(amount);
        const discount = tier ? base * tier.discount : 0;
        const final = base - discount;
        const pct = tier ? Math.round(tier.discount * 100) : 0;
        const rows = tier
          ? [
              ["Subtotal", displayMoney(base)],
              [`Discount (${pct}%)`, "-" + displayMoney(discount)],
              ["Final total", displayMoney(final)]
            ]
          : [];
        return {
          total: final,
          oldTotal: tier ? base : 0,
          valid: amount >= 100000,
          details: [
            `${amount.toLocaleString()} Raider Coins`,
            tier ? `Subtotal: ${moneyUSD(base)} USD` : "",
            tier ? `Discount (${pct}%): -${moneyUSD(discount)} USD` : "",
            tier ? `Final: ${moneyUSD(final)} USD` : ""
          ].filter(Boolean).join("\n"),
          arcPriceBreakdown: rows.length ? { rows } : null
        };
      }
      if (type === "seeds") {
        const amount = Math.max(100, Math.min(2000, num("seedAmount")));
        const base = amount / 100 * prices.seeds100;
        const tier = seedTier(amount);
        const discount = tier ? base * tier.discount : 0;
        const final = base - discount;
        const pct = tier ? Math.round(tier.discount * 100) : 0;
        const rows = tier
          ? [
              ["Subtotal", displayMoney(base)],
              [`Discount (${pct}%)`, "-" + displayMoney(discount)],
              ["Final total", displayMoney(final)]
            ]
          : [];
        return {
          total: final,
          oldTotal: tier ? base : 0,
          valid: amount >= 100,
          details: [
            `${amount.toLocaleString()} Assorted Seeds`,
            tier ? `Subtotal: ${moneyUSD(base)} USD` : "",
            tier ? `Bulk discount (${pct}%): -${moneyUSD(discount)} USD` : "",
            tier ? `Final: ${moneyUSD(final)} USD` : ""
          ].filter(Boolean).join("\n"),
          arcPriceBreakdown: rows.length ? { rows } : null
        };
      }
      if (type === "depositary") {
        const slots = Math.max(1, num("depositaryCustom"));
        return { total: slots * prices.depositarySlot, valid: slots >= 1, details: `Depositary Slots: ${slots}\nRate: ${moneyUSD(prices.depositarySlot)} per slot\n50 Slot Package: ${moneyUSD(50 * prices.depositarySlot)}\n280 Slot Maximum: ${moneyUSD(280 * prices.depositarySlot)}` };
      }
      if (type === "guns") {
        const line = calcWeapon("gun", true);
        const isBundle20 = line.weaponQty === 20 && line.modQty === 20 && line.modType === "premium";
        const discount = isBundle20 ? line.total * .10 : 0;
        const details = [
          `${line.weaponQty}x ${line.weapon}`,
          line.modQty > 0 ? `${line.modQty}x ${modLabel(line.modType)} (auto-matched to weapon qty)` : "",
          isBundle20 ? `20x Bundle Discount: -${moneyUSD(discount)} USD (10%)` : ""
        ].filter(Boolean).join("\n");
        return { total: line.total - discount, oldTotal: line.total, valid: line.total > 0, details };
      }
      if (type === "loadout") return calcLoadout();
      if (type === "trials") {
        const allStars = Boolean($("trialAllStars")?.checked);
        const rankUp = Boolean($("trialRankUp")?.checked);
        const selected = $("trialOption").selectedOptions[0];
        const optionLabel = selected?.dataset.label || "No Rank Up";
        const optionPrice = rankUp ? Number(selected?.dataset.price || 0) : 0;
        const basePrice = (allStars ? prices.trialsBase : 0) + (rankUp ? prices.trialsBase : 0);
        return {
          total: basePrice + optionPrice,
          valid: allStars || rankUp,
          details: `Weekly All 3 Stars: ${allStars ? "Yes" : "No"}\nRank Up Service: ${rankUp ? "Yes" : "No"}\nCurrent Rank: ${val("trialRank")}\nRank Option: ${rankUp ? optionLabel : "None"}\nRank Option Price: ${moneyUSD(optionPrice)}`
        };
      }
      if (type === "pvp") {
        const hours = Math.max(1, Math.min(6, num("pvpHours")));
        const mode = val("pvpMode") === "trio" ? "Trio" : "Duo";
        const focus = val("coachFocus") === "pve" ? "PvE Coaching" : "PvP Coaching";
        const notes = val("coachNotes").trim();
        return { total: hours * (mode === "Trio" ? 30 : 20), valid: true, details: `${focus}\nSession: ${mode}\nHours: ${hours}\nMaximum: 6 hours per ticket${notes ? `\nCoaching Notes: ${notes}` : ""}` };
      }
      if (type === "leveling") {
        const current = Math.max(1, Math.min(74, num("currentLevel")));
        const target = Math.max(1, Math.min(75, num("targetLevel")));
        const speed = Number(val("speed"));
        const total = levelCost(current, target) * speed;
        const oldTotal = oldLevelCost(current, target) * speed * 0.90;
        return {
          total,
          oldTotal: oldTotal > total ? oldTotal : 0,
          valid: target > current,
          details: `Current Level: ${current}\nTarget Level: ${target}\nSpeed: ${$("speed").selectedOptions[0].textContent}`
        };
      }
      if (type === "workshop") {
        if (val("workshopBundle") === "1") {
          const workshopTotal = prices.workshopMax;
          const scrappyTotal = 5 * prices.scrappyLevel;
          const subtotal = workshopTotal + scrappyTotal;
          const discount = subtotal * .10;
          return {
            total: subtotal - discount,
            valid: true,
            details: `Max Bundle: Workshop + Scrappy\nWorkshops: All 6 workbenches - ${moneyUSD(workshopTotal)}\nScrappy Level: 5 - ${moneyUSD(scrappyTotal)}\nBundle Discount: -${moneyUSD(discount)} USD (10%)`
          };
        }
        const mode = val("workshopMode") || "workshop";
        if (mode === "scrappy") {
          const from = Math.max(1, Math.min(5, num("scrappyFrom")));
          const to = Math.max(1, Math.min(5, num("scrappyTo")));
          const levels = Math.max(1, to - from + 1);
          return {
            total: levels * prices.scrappyLevel,
            valid: to > from,
            details: `Mode: Scrappy Leveling\nFrom Level: ${from}\nTo Level: ${to}\nSelected Levels: ${levels}\nRate: ${moneyUSD(prices.scrappyLevel)} per level`
          };
        }
        const from = Number(val("workshopFrom"));
        const to = Number(val("workshopTo"));
        const selected = Array.from(document.querySelectorAll("#orderForm [data-workshop]:checked")).map(input => input.value);
        const levels = Math.max(0, to - from);
        const levelMultiplier = levels / 2;
        const fullTotal = selected.length === workshops.length ? prices.workshopMax : selected.length * prices.workshopBench;
        const subtotal = fullTotal * levelMultiplier;
        const workshopDiscountRate = 0.25;
        const discount = subtotal * workshopDiscountRate;
        const total = subtotal - discount;
        return {
          total,
          oldTotal: subtotal > total ? subtotal : 0,
          valid: selected.length > 0 && levels > 0,
          details: `From Level: ${from}\nTo Level: ${to}\nWorkshops: ${selected.join(", ") || "None"}\nUnit Rate: ${moneyUSD(prices.workshopBench)} per workbench\nAll 6 Workbench Package: ${moneyUSD(prices.workshopMax)}\nSubtotal: ${moneyUSD(subtotal)}\nWorkshop Discount: -${moneyUSD(discount)} USD (25%)`
        };
      }
      if (type === "raid") return calcRaid();
      if (type === "expedition") {
        const selected = Array.from(document.querySelectorAll("#orderForm [data-stage]:checked")).map(input => ({ name: input.dataset.stage, price: Number(input.value) }));
        const total = selected.reduce((sum, item) => sum + item.price, 0);
        return { total, valid: selected.length > 0, details: selected.map(item => `${item.name} - ${moneyUSD(item.price)}`).join("\n") || "No expedition stages selected" };
      }
      if (type === "boss") {
        const qty = Math.max(1, num("bossQty"));
        return { total: qty * 20, valid: true, details: `${qty}x ${val("boss")}` };
      }
      const req = val("privateText").trim();
      if (!req) return { total: 0, valid: false, custom: true, details: "Custom request to be discussed in Discord" };
      const estimate = estimatePrivateOrder(req);
      const hasEstimate = estimate.total > 0;
      const detailLines = [`Request: ${req}`];
      if (hasEstimate) {
        detailLines.push("");
        detailLines.push("Estimated breakdown:");
        estimate.lines.forEach(line => detailLines.push(`- ${line}`));
        detailLines.push(`Estimated Total: ${moneyUSD(estimate.total)} USD`);
      }
      detailLines.push("");
      detailLines.push(`Note: ${PRIVATE_ESTIMATE_NOTE}`);
      return {
        total: estimate.total,
        valid: true,
        custom: !hasEstimate,
        estimated: hasEstimate,
        details: detailLines.join("\n")
      };
    }

    function calcLoadout() {
      const primary = calcWeapon("primary");
      const secondary = calcWeapon("secondary");
      const bundleSize = Math.max(0, num("loadoutBundle"));
      const bundleExtra = bundleSize ? (bundleSize * prices.augment) + (bundleSize * prices.shield) + ((bundleSize * 5) / 5 * prices.rechargerBundle) + ((bundleSize * 5) / 5 * prices.bandageBundle) : 0;
      const augmentQty = Math.max(0, num("augmentQty"));
      const shieldQty = Math.max(0, num("shieldQty"));
      const bandageBundles = Math.max(0, num("bandageQty"));
      const nadeBundles = Math.max(0, num("nadeQty"));
      const rechargerBundles = Math.max(0, num("rechargerQty"));
      const surgeBundles = Math.max(0, num("surgeRechargerQty"));
      const extrasSubtotal =
        augmentQty * prices.augment +
        shieldQty * prices.shield +
        bandageBundles * prices.bandageBundle +
        nadeBundles * prices.nadeBundle +
        rechargerBundles * prices.rechargerBundle +
        surgeBundles * prices.surgeRechargerBundle;
      const total = primary.total + secondary.total + bundleExtra + extrasSubtotal;
      const detailParts = [
        bundleSize ? `Special Bundle: ${bundleSize}x\nBundle Items: ${bundleSize}x ${primary.weapon}, ${bundleSize}x Looting Mk. 3 (Survivor) Augment, ${bundleSize}x Medium Shield, ${bundleSize * 5}x Shield Recharger, ${bundleSize * 5}x Herbal` : "",
        weaponDetail("Primary", primary),
        weaponDetail("Secondary", secondary),
        augmentQty > 0 ? `${augmentQty}x Looting Mk. 3 (Survivor) Augment` : "",
        shieldQty > 0 ? `${shieldQty}x Medium Shield` : "",
        loadoutBundleDetailLine(bandageBundles, 5, "Herbal Bandage"),
        loadoutBundleDetailLine(nadeBundles, 3, "Trigger Nade"),
        loadoutBundleDetailLine(rechargerBundles, 5, "Shield Recharger"),
        loadoutBundleDetailLine(surgeBundles, 5, "Surge Shield Recharger")
      ];
      const details = detailParts.filter(Boolean).join("\n") || "No loadout items selected";
      return { total, valid: total > 0, details };
    }

    function weaponDetail(label, line) {
      return [
        line.weaponQty > 0 ? `${label}: ${line.weaponQty}x ${line.weapon}` : "",
        line.modQty > 0 && line.modType !== "none" ? `${label} Mods: ${line.modQty}x ${modLabel(line.modType)}` : ""
      ].filter(Boolean).join("\n");
    }

    function calcRaid() {
      const packageQty = Math.max(2, Math.min(12, num("raidCount") || 2));
      const raidQty = packageQty;
      const eventOn = Boolean($("raidEventMode")?.checked);
      const team = document.querySelector("#orderForm [data-raid-team].active")?.dataset.raidTeam || "duo";
      const teamLabel = team === "trio" ? "Trio (+50%)" : "Duo";
      const teamMultiplier = team === "trio" ? 1.5 : 1;
      const raidTotal = raidQty * prices.raid * teamMultiplier;
      const eventTotal = eventOn ? raidQty * prices.event : 0;
      const total = raidTotal + eventTotal;
      const details = [
        `Team: ${teamLabel}`,
        `Raid Count: ${raidQty}`,
        `Map Preference: Any Map`,
        `Event Mode: ${eventOn ? `On (+${moneyUSD(eventTotal)} USD)` : "Off"}`,
        "Rule: only successful raids count; failed runs are retried or compensated."
      ].join("\n");
      return { total, valid: raidQty > 0, details };
    }

    function updateTotal() {
      const wrap = $("orderSummaryTotal");
      const svc = currentService();
      if (!svc) {
        if (wrap) wrap.classList.add("summary-total--idle");
        $("liveTotal").textContent = ui("Select a service to build your order.");
        $("usdHint").textContent = "";
        $("addToCart").disabled = true;
        const br = $("arcPriceBreakdown");
        if (br) {
          br.hidden = true;
          br.innerHTML = "";
        }
        const arcPrev = $("arcOrderSummaryPreview");
        if (arcPrev) {
          arcPrev.hidden = true;
          arcPrev.innerHTML = "";
        }
        return;
      }
      if (wrap) wrap.classList.remove("summary-total--idle");
      const result = calculate();
      const vForm = svc?.form && String(svc.form).startsWith("valorant-");
      const old = result.oldTotal && result.oldTotal > result.total ? `<span class="old-total">${displayMoney(result.oldTotal)}</span>` : "";
      const estTag = result.estimated ? `<span class="estimated-tag">Estimated</span>` : "";
      const customFace = result.custom && vForm ? "Custom Price" : "CUSTOM";
      $("liveTotal").innerHTML = result.custom ? customFace : old + displayMoney(result.total) + estTag;
      $("usdHint").textContent = result.custom
        ? (vForm ? "Custom Price — contact for final quote" : "Ticket value: CUSTOM")
        : (result.estimated ? "Estimated ticket value: " : "Ticket value: ") + moneyUSD(result.total) + " USD";
      const br = $("arcPriceBreakdown");
      if (br) {
        if (result.arcPriceBreakdown && result.arcPriceBreakdown.rows && result.arcPriceBreakdown.rows.length) {
          br.hidden = false;
          br.innerHTML = result.arcPriceBreakdown.rows.map(([k, v], idx, arr) => {
            const fin = idx === arr.length - 1;
            return `<div class="arc-price-breakdown__row${fin ? " arc-price-breakdown__row--final" : ""}"><span>${escapeHtml(k)}</span><span>${escapeHtml(v)}</span></div>`;
          }).join("");
        } else {
          br.hidden = true;
          br.innerHTML = "";
        }
      }
      const arcPrev = $("arcOrderSummaryPreview");
      if (arcPrev) {
        const arcSplit = document.querySelector(".order-card.is-arc-split");
        if (
          arcSplit &&
          currentGame()?.id === "arc" &&
          result.details &&
          String(result.details).trim() &&
          !result.custom &&
          !result.contactOnly
        ) {
          const lines = String(result.details).split("\n").map(s => s.trim()).filter(Boolean);
          if (lines.length) {
            arcPrev.hidden = false;
            arcPrev.innerHTML = `<div class="arc-order-preview__title">${escapeHtml(ui("Breakdown"))}</div>${lines.map(l => `<p class="arc-order-preview__line">${escapeHtml(l)}</p>`).join("")}`;
          } else {
            arcPrev.hidden = true;
            arcPrev.innerHTML = "";
          }
        } else {
          arcPrev.hidden = true;
          arcPrev.innerHTML = "";
        }
      }
      $("addToCart").disabled = !result.valid;
      $("addToCart").textContent = ui(result.contactOnly || (vForm && result.custom) ? "Contact Us" : "Add to Cart");
      const dl = $("valorantSummaryDl");
      const noteEl = $("valorantSummaryNote");
      const valRbHint = $("valRbHint");
      if (valRbHint) {
        if (result.valorantValRbError) {
          valRbHint.hidden = false;
          valRbHint.textContent = result.valorantValRbError;
        } else {
          valRbHint.hidden = true;
          valRbHint.textContent = "";
        }
      }
      if (dl && Array.isArray(result.valorantRows)) {
        dl.innerHTML = result.valorantRows.length
          ? result.valorantRows.map(({ dt, dd }) => `<div><dt>${escapeHtml(dt)}</dt><dd>${escapeHtml(String(dd))}</dd></div>`).join("")
          : "";
      }
      if (noteEl) {
        if (result.valorantNote) {
          noteEl.hidden = false;
          noteEl.textContent = result.valorantNote;
          noteEl.classList.remove("is-warn");
        } else {
          noteEl.textContent = "";
          noteEl.hidden = true;
        }
      }
      if (vForm) {
        syncValorantPathRail();
      }
      syncLoadoutQuickBundleHints();
    }

    function clearServiceForm() {
      renderDetail();
      showToast("Service form cleared.");
    }

    function addToCart() {
      const result = calculate();
      if (!result.valid) return showToast("Please customize the service first.");
      const service = currentService();
      const vForm = service?.form && String(service.form).startsWith("valorant-");
      if (result.contactOnly || (vForm && result.custom)) {
        window.open(DISCORD_URL, "_blank", "noopener");
        showToast("Opening Discord — contact ElysiumBoost with your request.");
        return;
      }
      state.clearCartConfirmUntil = 0;
      const cg = currentGame();
      const pid = playerIdForLineFromState();
      const metaDel = deliveryTypeForService(service, cg?.id);
      const etaHint = service?.start || ui("Ask support");
      const bd = buildPriceBreakdownText(result);
      const newLine = {
        id: String(Date.now() + Math.random()),
        game: cg.label,
        gameId: cg.id,
        serviceId: service.id,
        categoryId: service.category,
        title: service.cardTitle,
        details: result.details,
        total: result.total,
        oldTotal: result.oldTotal || 0,
        custom: Boolean(result.custom),
        estimated: Boolean(result.estimated),
        viewedCurrency: state.currency,
        language: "EN",
        region: state.orderRegion,
        platform: state.orderPlatform,
        playerId: pid,
        deliveryType: metaDel,
        etaHint,
        priceBreakdown: bd
      };
      const mergeIdx = state.cart.findIndex(it =>
        it.game === newLine.game &&
        it.title === newLine.title &&
        it.details === newLine.details &&
        it.custom === newLine.custom &&
        it.estimated === newLine.estimated &&
        it.viewedCurrency === newLine.viewedCurrency &&
        it.language === newLine.language &&
        it.region === newLine.region &&
        it.platform === newLine.platform &&
        (it.playerId || "") === (newLine.playerId || "")
      );
      if (mergeIdx >= 0) {
        state.cart[mergeIdx].total += newLine.total;
        state.cart[mergeIdx].oldTotal = (state.cart[mergeIdx].oldTotal || 0) + (newLine.oldTotal || 0);
        state.cart[mergeIdx].qty = (state.cart[mergeIdx].qty || 1) + 1;
      } else {
        state.cart.push(newLine);
      }
      ensureOrderPreviewId();
      persistOrderState();
      renderCart();
      updateStickyOrderChip();
      showToast(result.estimated ? "Estimated order added to cart." : "Added to cart.");
    }

    function adjustCartItem(lineId) {
      const item = state.cart.find(i => i.id === lineId);
      if (!item || !item.gameId || !item.serviceId) return;
      state.cart = state.cart.filter(i => i.id !== lineId);
      if (!state.cart.length) state.orderPreviewId = "";
      persistOrderState();
      state.game = item.gameId;
      const g = currentGame();
      state.category = item.categoryId || g?.categories[0]?.id || state.category;
      state.serviceId = item.serviceId;
      syncGameHash(item.gameId);
      renderAll();
      closeCart();
      requestAnimationFrame(() => $("detailSection")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      showToast(ui("Adjust options below, then add the line again."));
    }

    function syncClearCartButton() {
      const btn = $("clearCart");
      if (!btn) return;
      const pending = state.clearCartConfirmUntil && Date.now() < state.clearCartConfirmUntil;
      btn.textContent = pending ? ui("Confirm clear") : ui("Clear cart");
    }

    function buildDiscordNextStepsHtml() {
      return `
        <section class="order-discord-panel" aria-label="${escapeHtml(ui("Discord next steps"))}">
          <h3 class="order-discord-panel__title">${escapeHtml(ui("Discord next steps"))}</h3>
          <ol class="order-discord-panel__list">
            <li>${escapeHtml(ui("Copy your ticket text from the Order center."))}</li>
            <li>${escapeHtml(ui("Open the ELYSIUM BOOST Discord channel."))}</li>
            <li>${escapeHtml(ui("Paste the ticket and add any notes your booster or support requests."))}</li>
            <li>${escapeHtml(ui("Attach the receipt PNG if moderators ask for a visual confirmation."))}</li>
          </ol>
        </section>`;
    }

    function buildOrderChecklistHtml() {
      const row = (ok, label) => `<div class="cart-checklist-row${ok ? " is-done" : ""}"><span class="chk" aria-hidden="true">${ok ? "✓" : ""}</span><span>${escapeHtml(label)}</span></div>`;
      const total = state.cart.reduce((sum, item) => sum + (item.custom ? 0 : item.total), 0);
      const hasCustom = state.cart.some(item => item.custom);
      const rows = [];
      rows.push(row(Boolean(state.cart.length), ui("Services selected")));
      rows.push(row(Boolean(state.cart.length), ui("Quantities confirmed")));
      const idRows = [];
      if (cartNeedsArcId()) {
        idRows.push(row(Boolean(state.arcId) || state.arcIdSkipped, ui("Embark ID (Arc Raiders)")));
      }
      if (cartHasGameId("valorant")) {
        idRows.push(row(
          Boolean(String(state.riotId || "").trim() && String(state.orderRegion || "").trim() && String(state.orderPlatform || "").trim()),
          ui("Riot ID & region (Valorant)")
        ));
      }
      if (cartHasGameId("lol")) {
        idRows.push(row(
          Boolean(String(state.lolRiotId || "").trim() && String(state.lolServer || "").trim()),
          ui("Riot ID & server (League of Legends)")
        ));
      }
      if (cartNeedsSteamId()) {
        idRows.push(row(Boolean(String(state.steamId || "").trim()), ui("Steam / FACEIT profile (CS2)")));
      }
      if (cartNeedsWowFields()) {
        const cn = String(state.wowCharName || state.wowCharacterRealm || "").trim();
        const rm = String(state.wowRealm || "").trim();
        idRows.push(row(Boolean(cn && rm), ui("Character & realm (WoW)")));
      }
      if (!idRows.length) {
        idRows.push(row(true, ui("Player / account ID (not required for this order)")));
      }
      rows.push(...idRows);
      rows.push(row(Boolean(state.cart.length && (total > 0 || hasCustom)), ui("Total price ready")));
      rows.push(row(isDiscordTicketReady(), ui("Discord ticket ready")));
      return `<section class="order-checklist-card" id="orderChecklistMount" aria-label="${escapeHtml(ui("Order checklist"))}">
        <h3 class="order-checklist-card__title">${escapeHtml(ui("Order checklist"))}</h3>
        <div class="cart-checklist cart-checklist--spacious">${rows.join("")}</div>
      </section>`;
    }

    function refreshOrderChecklistIfOpen() {
      const el = $("orderChecklistMount");
      if (!el || !state.cart.length) return;
      const t = document.createElement("template");
      t.innerHTML = buildOrderChecklistHtml().trim();
      const next = t.content.firstElementChild;
      if (next) el.replaceWith(next);
    }

    function layoutOrderCheckoutStrip() {
      const strip = $("orderCheckoutStrip");
      const dock = $("cartCheckoutDock");
      const foot = $("cartDrawerFoot");
      if (!strip || !foot) return;
      if (state.cart.length && dock) dock.appendChild(strip);
      else foot.appendChild(strip);
    }

    function adjustCartLineQty(lineId, delta) {
      const item = state.cart.find(i => i.id === lineId);
      if (!item || item.custom) return;
      const q0 = Math.max(1, item.qty || 1);
      const q = Math.max(1, q0 + delta);
      if (q === q0) return;
      const unit = item.total / q0;
      const unitOld = (item.oldTotal || 0) / q0;
      item.qty = q;
      item.total = Math.round(unit * q * 10000) / 10000;
      item.oldTotal = unitOld ? Math.round(unitOld * q * 10000) / 10000 : 0;
      persistOrderState();
      renderCart();
    }

    function updateCartFootAlerts() {
      const foot = $("cartFootAlerts");
      if (!foot) return;
      if (!state.cart.length) {
        foot.innerHTML = "";
        return;
      }
      const bits = [];
      const needEmbark = cartNeedsArcId() && !state.arcId && !state.arcIdSkipped;
      if (needEmbark) {
        bits.push(`<div class="cart-inline-warn" role="status">${escapeHtml(ui("Arc Raiders orders need an Embark ID (or skip) before copying or downloading the receipt."))}</div>`);
      }
      const v = validateTicketRequirements();
      if (!v.ok && v.message) {
        bits.push(`<div class="cart-inline-warn" role="status">${escapeHtml(v.message)}</div>`);
      }
      foot.innerHTML = bits.join("");
    }

    function orderContextHeaderHtml() {
      const needVal = cartHasGameId("valorant");
      const needLol = cartHasGameId("lol");
      const needSteam = cartNeedsSteamId();
      const needWow = cartHasGameId("wow");
      const needRegion = needVal || needWow || needLol;
      const needPlatform = needVal;
      const anyField = needRegion || needPlatform || needSteam || needWow || needVal || needLol;
      let grid = "";
      if (needRegion) {
        grid += `<label class="order-context-field"><span class="order-context-k">${escapeHtml(ui("Region"))}</span>
                <select id="orderRegionSel" class="order-context-select">
                  <option value="EU">EU</option>
                  <option value="NA">NA</option>
                  <option value="TR">TR</option>
                  <option value="MENA">MENA</option>
                  <option value="Other">${escapeHtml(ui("Other"))}</option>
                </select>
              </label>`;
      }
      if (needPlatform) {
        grid += `<label class="order-context-field"><span class="order-context-k">${escapeHtml(ui("Platform"))}</span>
                <select id="orderPlatformSel" class="order-context-select">
                  <option value="PC">PC</option>
                  <option value="Xbox">Xbox</option>
                  <option value="PlayStation">PlayStation</option>
                </select>
              </label>`;
      }
      if (needVal) {
        grid += `<label class="order-context-field order-context-field--wide"><span class="order-context-k">${escapeHtml(ui("Riot ID (Valorant)"))}</span>
                <input id="orderRiotInput" class="order-context-input" type="text" autocomplete="off" placeholder="GameName#TAG">
              </label>`;
      }
      if (needLol) {
        grid += `<label class="order-context-field order-context-field--wide"><span class="order-context-k">${escapeHtml(ui("Riot ID (League)"))}</span>
                <input id="orderLolRiotInput" class="order-context-input" type="text" autocomplete="off" placeholder="Summoner#TAG">
              </label>
              <label class="order-context-field order-context-field--wide"><span class="order-context-k">${escapeHtml(ui("LoL server"))}</span>
                <input id="orderLolServerInput" class="order-context-input" type="text" autocomplete="off" placeholder="EUW, NA, EUNE…">
              </label>`;
      }
      if (needSteam) {
        grid += `<label class="order-context-field order-context-field--wide"><span class="order-context-k">${escapeHtml(ui("Steam profile or friend code"))}</span>
                <input id="orderSteamInput" class="order-context-input" type="text" inputmode="text" autocomplete="off" placeholder="Profile URL or Steam friend code">
                  </label>`;
      }
      if (needWow) {
        grid += `<label class="order-context-field order-context-field--wide"><span class="order-context-k">${escapeHtml(ui("Character name"))}</span>
                <input id="orderWowCharInput" class="order-context-input" type="text" autocomplete="off" placeholder="Character name">
              </label>
              <label class="order-context-field order-context-field--wide"><span class="order-context-k">${escapeHtml(ui("Realm"))}</span>
                <input id="orderWowRealmInput" class="order-context-input" type="text" autocomplete="off" placeholder="Realm / server">
              </label>`;
      }
      if (!anyField) {
        const hint = cartNeedsArcId()
          ? ui("Use Embark ID above for Arc Raiders. This cart has no extra account fields.")
          : ui("No extra account fields are required for this order.");
        return `<div class="order-context-panel order-context-panel--minimal" role="region"><p class="order-context-hint">${escapeHtml(hint)}</p></div>`;
      }
      return `<div class="order-context-panel" role="region" aria-labelledby="orderCtxTitle">
            <div id="orderCtxTitle" class="order-context-title">${escapeHtml(ui("Order context"))}</div>
            <div class="order-context-grid">${grid}</div>
            <p class="order-context-hint">${escapeHtml(ui("We validate required fields before you can copy your Discord ticket."))}</p>
          </div>`;
    }

    function cartReceiptAccountRows(item) {
      const gid = item.gameId;
      let rows = "";
      if (gid === "valorant") {
        rows += `<div><dt>${ui("Region")}</dt><dd>${escapeHtml(item.region || state.orderRegion || "—")}</dd></div>`;
        rows += `<div><dt>${ui("Platform")}</dt><dd>${escapeHtml(item.platform || state.orderPlatform || "—")}</dd></div>`;
        rows += `<div><dt>${ui("Riot ID")}</dt><dd>${escapeHtml((item.playerId || state.riotId || "").trim() || "—")}</dd></div>`;
      } else if (gid === "lol") {
        rows += `<div><dt>${ui("Riot ID")}</dt><dd>${escapeHtml((item.playerId || state.lolRiotId || "").trim() || "—")}</dd></div>`;
        rows += `<div><dt>${ui("Server")}</dt><dd>${escapeHtml(state.lolServer || "—")}</dd></div>`;
      } else if (gid === "premier" || gid === "faceit" || gid === "cs2") {
        rows += `<div><dt>${ui("Steam / friend code")}</dt><dd>${escapeHtml((item.playerId || state.steamId || "").trim() || "—")}</dd></div>`;
      } else if (gid === "wow") {
        rows += `<div><dt>${ui("Region")}</dt><dd>${escapeHtml(item.region || state.orderRegion || "—")}</dd></div>`;
        {
          const cn = String(state.wowCharName || "").trim() || (String(item.playerId || "").split(/\s*[—\-]\s*/)[0] || "").trim();
          const rm = String(state.wowRealm || "").trim() || (String(item.playerId || "").split(/\s*[—\-]\s*/).length > 1 ? String(item.playerId || "").split(/\s*[—\-]\s*/).slice(1).join(" — ").trim() : "") || String(state.wowCharacterRealm || "").trim();
          rows += `<div><dt>${ui("Character")}</dt><dd>${escapeHtml(cn || "—")}</dd></div>`;
          rows += `<div><dt>${ui("Realm")}</dt><dd>${escapeHtml(rm || "—")}</dd></div>`;
        }
      } else if (gid === "arc") {
        const em = state.arcId || (state.arcIdSkipped ? ui("Will type on Discord") : "—");
        rows += `<div><dt>${ui("Embark ID")}</dt><dd>${escapeHtml(em)}</dd></div>`;
      }
      return rows;
    }

    function ticketGameAccountLines(item) {
      const gid = item.gameId;
      const lines = [];
      if (gid === "arc") {
        const em = state.arcId || (state.arcIdSkipped ? "Will type on Discord" : "—");
        lines.push(`    Embark ID: ${em}`);
      }
      if (gid === "valorant") {
        lines.push(`    Riot ID: ${(item.playerId || state.riotId || "").trim() || "—"}`);
        lines.push(`    Valorant region: ${item.region || state.orderRegion || "—"}`);
        lines.push(`    Platform: ${item.platform || state.orderPlatform || "—"}`);
      }
      if (gid === "lol") {
        lines.push(`    LoL Riot ID: ${(item.playerId || state.lolRiotId || "").trim() || "—"}`);
        lines.push(`    LoL server: ${state.lolServer || "—"}`);
      }
      if (gid === "premier" || gid === "faceit" || gid === "cs2") {
        lines.push(`    Steam / friend code: ${(item.playerId || state.steamId || "").trim() || "—"}`);
      }
      if (gid === "wow") {
        lines.push(`    WoW region: ${item.region || state.orderRegion || "—"}`);
        {
          const pid = String(item.playerId || state.wowCharacterRealm || "").trim();
          const cn = String(state.wowCharName || "").trim() || (pid.split(/\s*[—\-]\s*/)[0] || "").trim();
          const rm = String(state.wowRealm || "").trim() || (pid.split(/\s*[—\-]\s*/).length > 1 ? pid.split(/\s*[—\-]\s*/).slice(1).join(" — ").trim() : "");
          lines.push(`    Character: ${cn || "—"}`);
          lines.push(`    Realm: ${rm || "—"}`);
        }
      }
      return lines;
    }

    function renderCart() {
      const lineCount = state.cart.reduce((n, item) => n + (item.qty || 1), 0);
      const cartCountEl = $("cartCount");
      if (cartCountEl) cartCountEl.textContent = String(lineCount);
      document.querySelector("#cartBackdrop .drawer")?.classList.toggle("drawer--wide", Boolean(state.cart.length));
      const clearCartEl = $("clearCart");
      if (clearCartEl) clearCartEl.disabled = !state.cart.length;
      const hasArcItems = state.cart.some(item => item.game === "Arc Raiders");
      if (!state.cart.length) {
        state.arcId = "";
        state.arcIdSkipped = false;
        state.clearCartConfirmUntil = 0;
        state.orderPreviewId = "";
        const cartBodyEl = $("cartBody");
        if (cartBodyEl) {
          cartBodyEl.innerHTML = `
          <div class="cart-empty-card">
            <div class="cart-empty-icon" aria-hidden="true">✦</div>
            <p class="cart-empty-title">${escapeHtml(ui("Your order is empty"))}</p>
            <p class="cart-empty-sub">${escapeHtml(ui("Choose a service to build your Discord ticket."))}</p>
            <button type="button" class="btn btn-premium" id="browsePopularServices">${escapeHtml(ui("Browse games"))}</button>
            <button type="button" class="btn btn-glass cart-empty-secondary" id="continueShoppingEmpty">${escapeHtml(ui("Continue browsing"))}</button>
          </div>`;
          const bp = cartBodyEl.querySelector("#browsePopularServices");
          if (bp) {
            bp.addEventListener("click", () => {
              closeCart();
              requestAnimationFrame(() => $("homeGameHead")?.scrollIntoView({ behavior: "smooth", block: "start" }));
            });
          }
          const c0 = cartBodyEl.querySelector("#continueShoppingEmpty");
          if (c0) c0.addEventListener("click", continueShopping);
        }
      } else {
        if (!hasArcItems) {
          state.arcId = "";
          state.arcIdSkipped = false;
        }
        const embarkBlock = hasArcItems
          ? `<div class="cart-embark-panel" role="region" aria-label="Embark ID">
            <div class="cart-embark-label">${escapeHtml(ui("Embark ID"))}</div>
            <p class="cart-embark-value">${state.arcId ? escapeHtml(state.arcId) : (state.arcIdSkipped ? escapeHtml(ui("Will type on Discord")) : escapeHtml(ui("Not set — add before receipt download")))}</p>
            ${!state.arcId ? `<p class="cart-embark-warn">${escapeHtml(ui("Required to copy or download a verified ticket for Arc Raiders."))}</p>` : ""}
            <button type="button" class="cart-embark-btn" id="cartEmbarkEditBtn">${escapeHtml(ui("Add or edit Embark ID"))}</button>
          </div>`
          : "";
        {
          const foot = $("cartDrawerFoot");
          const strip = $("orderCheckoutStrip");
          if (foot && strip && strip.parentElement !== foot) foot.appendChild(strip);
        }
        ensureOrderPreviewId();
        const leftCol = `
          <div class="order-center__left">
            <div class="order-meta-card order-meta-card--preview">
              <div class="order-meta-k">${escapeHtml(ui("Order preview ID"))}</div>
              <div class="order-preview-id-strong">${escapeHtml(state.orderPreviewId)}</div>
            </div>
            ${embarkBlock}
            ${orderContextHeaderHtml()}
            ${buildOrderChecklistHtml()}
            ${buildDiscordNextStepsHtml()}
            <p class="order-safety-note">${escapeHtml(ui("No cheats. No exploits. Manual service only."))}</p>
          </div>`;
        const itemBlocks = state.cart.map((item, idx) => {
          const priceLabel = item.custom
            ? (item.game === "Valorant" ? "Custom Price" : "CUSTOM")
            : (item.estimated ? `<span class="estimated-tag">Estimated</span>${displayInCurrency(item.total, item.viewedCurrency)}` : displayInCurrency(item.total, item.viewedCurrency));
          const estimateNote = item.estimated ? `<p class="cart-estimate-note">${escapeHtml(PRIVATE_ESTIMATE_NOTE)}</p>` : "";
          const qty = Math.max(1, item.qty || 1);
          const titleSafe = escapeHtml(ui(item.title));
          const perUnitHint = qty > 1 && !item.custom ? `<div class="cart-receipt-hint">${escapeHtml(ui("Shown as line total for this configuration."))}</div>` : "";
          const del = escapeHtml(item.deliveryType || ui("Manual delivery via Discord"));
          const eta = escapeHtml(item.etaHint || ui("Ask support"));
          const bdBlock = item.priceBreakdown ? `<div class="cart-receipt-section cart-receipt-section--breakdown"><div class="cart-receipt-k">${ui("Price breakdown")}</div><div class="cart-item-detail-body">${escapeHtml(item.priceBreakdown)}</div></div>` : "";
          const acctRows = cartReceiptAccountRows(item);
          const qtyDisabled = item.custom ? " disabled" : "";
          return `
            <article class="cart-item cart-item--receipt">
              <div class="cart-receipt-head">
                <span class="cart-receipt-num">#${idx + 1}</span>
                <h3 class="cart-receipt-title">${titleSafe}</h3>
              </div>
              <dl class="cart-receipt-dl">
                <div><dt>${ui("Game")}</dt><dd>${escapeHtml(ui(item.game))}</dd></div>
                <div><dt>${ui("Quantity")}</dt><dd>
                  <div class="cart-qty-control">
                    <button type="button" class="cart-qty-btn" data-cart-qty-id="${escapeHtml(item.id)}" data-cart-qty-delta="-1" aria-label="${escapeHtml(ui("Decrease quantity"))}"${qtyDisabled}>−</button>
                    <span class="cart-qty-val">${qty}</span>
                    <button type="button" class="cart-qty-btn" data-cart-qty-id="${escapeHtml(item.id)}" data-cart-qty-delta="1" aria-label="${escapeHtml(ui("Increase quantity"))}"${qtyDisabled}>+</button>
                  </div>
                </dd></div>
                <div><dt>${ui("Currency")}</dt><dd>${escapeHtml(item.viewedCurrency)}</dd></div>
                <div><dt>${ui("Line price")}</dt><dd class="cart-item-price-inline">${priceLabel}</dd></div>
                ${acctRows}
                <div class="cart-receipt-dl-row cart-receipt-dl-row--extra"><dt>${ui("Delivery type")}</dt><dd>${del}</dd></div>
                <div class="cart-receipt-dl-row cart-receipt-dl-row--extra"><dt>${ui("Est. delivery")}</dt><dd>${eta}</dd></div>
              </dl>
              <div class="cart-receipt-section">
                <div class="cart-receipt-k">${ui("Selected options")}</div>
                <div class="cart-item-detail-body">${escapeHtml(item.details)}</div>
              </div>
              ${bdBlock}
              <div class="cart-receipt-delivery"><strong>${ui("Coordination")}</strong>${escapeHtml(ui("Finalize timing, pilot/duo mode, and safety notes in Discord with support."))}</div>
              ${perUnitHint}
              ${estimateNote}
              <div class="cart-item-actions">
                <button type="button" class="btn btn-glass btn-compact" data-adjust="${item.id}">${ui("Edit line")}</button>
                <button class="btn remove" type="button" data-remove="${item.id}">${ui("Remove")}</button>
              </div>
            </article>
          `;
        }).join("");
        const rightCol = `
          <div class="order-center__right">
            <div class="order-lines-head">
              <h3 class="order-lines-title">${escapeHtml(ui("Cart items"))}</h3>
              <p class="order-lines-copy">${escapeHtml(ui("Review every line before copying your Discord ticket."))}</p>
            </div>
            <div class="order-lines-list">${itemBlocks}</div>
            <div class="cart-continue-wrap order-lines-continue"><button type="button" class="btn-continue" id="continueShoppingCart">${escapeHtml(ui("Continue shopping"))}</button></div>
            <div id="cartCheckoutDock" class="cart-checkout-dock" aria-label="${escapeHtml(ui("Checkout"))}"></div>
          </div>`;
        const cartBodyEl = $("cartBody");
        if (cartBodyEl) {
          cartBodyEl.innerHTML = `<div class="order-center">${leftCol}${rightCol}</div>`;
          cartBodyEl.querySelectorAll("[data-remove]").forEach(button =>
            button.addEventListener("click", () => {
              state.cart = state.cart.filter(item => item.id !== button.dataset.remove);
              if (!state.cart.length) state.orderPreviewId = "";
              persistOrderState();
              renderCart();
            })
          );
          cartBodyEl.querySelectorAll("[data-adjust]").forEach(button =>
            button.addEventListener("click", () => adjustCartItem(button.dataset.adjust))
          );
          cartBodyEl.querySelectorAll("[data-cart-qty-delta]").forEach(button => {
            button.addEventListener("click", () => {
              if (button.disabled) return;
              adjustCartLineQty(button.dataset.cartQtyId, Number(button.dataset.cartQtyDelta));
            });
          });
          const c1 = cartBodyEl.querySelector("#continueShoppingCart");
          if (c1) c1.addEventListener("click", continueShopping);
          const embarkBtn = cartBodyEl.querySelector("#cartEmbarkEditBtn");
          if (embarkBtn) embarkBtn.addEventListener("click", () => openArcIdModal(null));
        }
        bindOrderSummaryContext();
      }
      const total = state.cart.reduce((sum, item) => sum + (item.custom ? 0 : item.total), 0);
      const hasCustom = state.cart.some(item => item.custom);
      const sameCurrency = state.cart.length && state.cart.every(item => item.viewedCurrency === state.cart[0].viewedCurrency);
      const cartCurrency = sameCurrency ? state.cart[0].viewedCurrency : state.currency;
      const totalEl = $("cartTotal");
      if (totalEl) {
        if (state.cart.length) {
          if (lastCartMonetaryTotal !== null && lastCartMonetaryTotal !== total) {
            totalEl.classList.remove("cart-total-pulse");
            void totalEl.offsetWidth;
            totalEl.classList.add("cart-total-pulse");
            setTimeout(() => totalEl.classList.remove("cart-total-pulse"), 900);
          }
          lastCartMonetaryTotal = total;
        } else {
          lastCartMonetaryTotal = null;
        }
        totalEl.textContent = hasCustom ? displayInCurrency(total, cartCurrency) + " + CUSTOM" : displayInCurrency(total, cartCurrency);
      } else {
        if (state.cart.length) lastCartMonetaryTotal = total;
        else lastCartMonetaryTotal = null;
      }
      const cartUsdHintEl = $("cartUsdHint");
      if (cartUsdHintEl) {
        cartUsdHintEl.textContent = hasCustom
          ? "Ticket total: " + displayInCurrency(total, cartCurrency) + " + CUSTOM"
          : "Ticket total: " + displayInCurrency(total, cartCurrency);
      }
      updateCartFootAlerts();
      syncClearCartButton();
      applyDrawerCompactClass();
      syncCompactToggleLabel();
      persistOrderState();
      updateStickyOrderChip();
      layoutOrderCheckoutStrip();
    }

    function clearCart() {
      if (!state.cart.length) return showToast("Cart is already empty.");
      const now = Date.now();
      if (state.clearCartConfirmUntil && now < state.clearCartConfirmUntil) {
        state.clearCartConfirmUntil = 0;
        state.cart = [];
        state.orderPreviewId = "";
        renderCart();
        const cs = $("copyStatus");
        if (cs) cs.textContent = "Cart cleared.";
        showToast("Cart cleared.");
        return;
      }
      state.clearCartConfirmUntil = now + 4500;
      syncClearCartButton();
      showToast(ui("Tap Confirm clear to empty your cart."), 2400);
      setTimeout(() => {
        if (Date.now() >= state.clearCartConfirmUntil) {
          state.clearCartConfirmUntil = 0;
          syncClearCartButton();
        }
      }, 4550);
    }

    function escapeHtml(text) {
      return String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    }

    function openCart() {
      renderCart();
      const backdrop = $("cartBackdrop");
      if (!backdrop) return;
      backdrop.classList.add("active");
      backdrop.setAttribute("aria-hidden", "false");
      document.body.classList.add("cart-open");
    }

    function closeCart() {
      const backdrop = $("cartBackdrop");
      if (!backdrop) return;
      backdrop.classList.remove("active");
      backdrop.setAttribute("aria-hidden", "true");
      document.body.classList.remove("cart-open");
    }

    function continueShopping() {
      closeCart();
      if (state.game) {
        $("serviceContent")?.classList.remove("hidden");
        $("serviceContent")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        $("homeGameGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    function getArcIdLine() {
      if (!cartNeedsArcId()) return "";
      const label = "Embark ID";
      if (state.arcId) return `${label}: ${state.arcId}`;
      if (state.arcIdSkipped) return `${label}: Will type it on Discord`;
      return "";
    }

    function updateArcIdModalText() {
      $("arcIdTitle").textContent = "Embark ID";
      $("arcIdCopy").textContent = "Add your in-game ID before copying or opening the Discord ticket.";
      $("arcIdLabel").textContent = "Embark ID";
      $("arcIdInput").placeholder = "Name#0000";
      $("arcIdDone").setAttribute("aria-label", "Done");
      $("arcIdSkip").setAttribute("aria-label", "Will type it on Discord");
    }

    function openArcIdModal(action) {
      state.pendingArcAction = action;
      updateArcIdModalText();
      $("arcIdInput").value = state.arcId || "";
      $("arcIdModal").classList.add("active");
      $("arcIdModal").setAttribute("aria-hidden", "false");
      setTimeout(() => $("arcIdInput").focus(), 30);
    }

    function closeArcIdModal() {
      $("arcIdModal").classList.remove("active");
      $("arcIdModal").setAttribute("aria-hidden", "true");
    }

    function proceedAfterArcId() {
      const action = state.pendingArcAction;
      state.pendingArcAction = null;
      closeArcIdModal();
      if (typeof action === "function") action();
    }

    function ensureArcId(action) {
      if (!cartNeedsArcId() || state.arcId || state.arcIdSkipped) {
        action();
        return;
      }
      openArcIdModal(action);
    }

    function ticketText() {
      ensureOrderPreviewId();
      const total = state.cart.reduce((sum, item) => sum + (item.custom ? 0 : item.total), 0);
      const hasCustom = state.cart.some(item => item.custom);
      const hasEstimate = state.cart.some(item => item.estimated);
      const rule = "────────────────────────────────";
      const lines = [
        rule,
        "ELYSIUM BOOST — ORDER RECEIPT (DISCORD)",
        rule,
        "",
        "Order preview ID: " + state.orderPreviewId,
        "Game-specific account fields are listed per line item below.",
        "",
        "Discord channel",
        DISCORD_URL,
        "",
        "LINE ITEMS",
        ""
      ];
      state.cart.forEach((item, index) => {
        const qty = Math.max(1, item.qty || 1);
        const priceLine = item.custom
          ? (item.game === "Valorant" ? "Custom Price" : "CUSTOM")
          : (item.estimated ? `Estimated ${displayInCurrency(item.total, item.viewedCurrency)}` : displayInCurrency(item.total, item.viewedCurrency));
        lines.push(`[${index + 1}] ${item.game} — ${item.title}`);
        lines.push(`    Quantity: ${qty}`);
        lines.push(`    Currency: ${item.viewedCurrency}`);
        ticketGameAccountLines(item).forEach(line => lines.push(line));
        lines.push(`    Delivery: ${item.deliveryType || "Manual delivery via Discord"}`);
        lines.push(`    Est. delivery: ${item.etaHint || "Ask support"}`);
        if (item.priceBreakdown) {
          lines.push("    Price detail:");
          item.priceBreakdown.split("\n").forEach(row => {
            const t = row.trim();
            if (t) lines.push(`      • ${t}`);
          });
        }
        lines.push(`    Line price: ${priceLine}`);
        lines.push("    Options / details:");
        item.details.split("\n").forEach(line => {
          const t = line.trim();
          if (t) lines.push(`      • ${t}`);
        });
        lines.push("");
      });
      const currency = state.cart[0]?.viewedCurrency || state.currency;
      const totalLabel = hasEstimate ? "ESTIMATED ORDER TOTAL" : "ORDER TOTAL";
      const totalText = hasCustom ? displayInCurrency(total, currency) + " + CUSTOM" : displayInCurrency(total, currency);
      lines.push(rule);
      lines.push(`${totalLabel}: ${totalText}`);
      lines.push(`Currency: ${currency}`);
      lines.push(rule);
      lines.push("");
      lines.push("NOTES");
      if (hasEstimate) lines.push(`• ${PRIVATE_ESTIMATE_NOTE}`);
      lines.push("• Please confirm availability, ETA, and final instructions in Discord.");
      lines.push("");
      lines.push("Thank you — ELYSIUM BOOST");
      return lines.join("\n");
    }

    async function copyOrder(openDiscordAfter) {
      if (!state.cart.length) {
        const cs = $("copyStatus");
        if (cs) cs.textContent = ui("Add an item before copying.");
        return;
      }
      const v = validateTicketRequirements();
      if (!v.ok) {
        const cs = $("copyStatus");
        if (cs) cs.textContent = v.message;
        showToast(v.message, 3800, true);
        return;
      }
      const flag = Boolean(openDiscordAfter);
      ensureArcId(() => copyOrderNow(flag));
    }

    function orderReceiptBlockedMessage() {
      if (!state.cart.length) return ui("Add items to your cart first.");
      const v = validateTicketRequirements();
      if (!v.ok) return v.message;
      if (cartNeedsArcId() && !String(state.arcId || "").trim() && !state.arcIdSkipped) {
        return ui("Please add or skip your Embark ID for Arc Raiders before downloading the receipt.");
      }
      return "";
    }

    function receiptFilenameFromPreviewId() {
      ensureOrderPreviewId();
      const raw = String(state.orderPreviewId || "EB-ORDER").replace(/[^\w-]+/g, "");
      return `elysium-order-${raw || "preview"}.png`;
    }

    function wrapReceiptLines(ctx, text, maxWidth) {
      const lines = [];
      const paragraphs = String(text || "").split("\n");
      for (let pi = 0; pi < paragraphs.length; pi++) {
        const para = paragraphs[pi];
        const words = para.split(/\s+/).filter(Boolean);
        let cur = "";
        for (const w of words) {
          const test = cur ? `${cur} ${w}` : w;
          if (ctx.measureText(test).width > maxWidth && cur) {
            lines.push(cur);
            cur = w;
          } else cur = test;
        }
        if (cur) lines.push(cur);
        if (pi < paragraphs.length - 1 && lines.length) lines.push("");
      }
      return lines.length ? lines : [""];
    }

    async function drawPremiumOrderReceiptCanvas() {
      await document.fonts.ready.catch(() => {});
      const W = 680;
      const pad = 34;
      const inner = W - pad * 2;
      const scale = 2;
      const m = document.createElement("canvas").getContext("2d");
      m.font = "500 15px Rajdhani, Inter, system-ui, sans-serif";

      let y = pad;
      const blocks = [];

      function addHeading(t) {
        blocks.push({ t: "h", text: t });
      }
      function addMuted(t) {
        blocks.push({ t: "m", text: t });
      }
      function addBody(t) {
        blocks.push({ t: "b", text: t });
      }

      addHeading("ELYSIUM BOOST · ORDER RECEIPT");
      addMuted(`Order preview ID: ${state.orderPreviewId}`);
      addMuted(`Generated: ${new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`);

      state.cart.forEach((item, index) => {
        const qty = Math.max(1, item.qty || 1);
        addHeading(`Line ${index + 1}: ${item.title}`);
        addBody(`Game: ${item.game}`);
        addBody(`Quantity: ${qty}`);
        addBody(`Currency: ${item.viewedCurrency}`);
        addBody(`Region: ${item.region || state.orderRegion || "—"}`);
        addBody(`Platform: ${item.platform || state.orderPlatform || "—"}`);
        ticketGameAccountLines(item).forEach(raw => addBody(raw.trim()));
        addBody(`Delivery method: ${item.deliveryType || "Manual delivery via Discord"}`);
        addBody(`Estimated delivery: ${item.etaHint || "Ask support"}`);
        addBody("Selected options:");
        addBody(item.details || "—");
        if (item.priceBreakdown) {
          addBody("Price breakdown:");
          addBody(item.priceBreakdown);
        }
        const priceLine = item.custom
          ? (item.game === "Valorant" ? "Custom Price" : "CUSTOM")
          : (item.estimated ? `Estimated ${displayInCurrency(item.total, item.viewedCurrency)}` : displayInCurrency(item.total, item.viewedCurrency));
        addBody(`Line total: ${priceLine}`);
        blocks.push({ t: "sp", text: "" });
      });

      const total = state.cart.reduce((sum, item) => sum + (item.custom ? 0 : item.total), 0);
      const hasCustom = state.cart.some(item => item.custom);
      const hasEstimate = state.cart.some(item => item.estimated);
      const sameCurrency = state.cart.length && state.cart.every(item => item.viewedCurrency === state.cart[0].viewedCurrency);
      const cartCurrency = sameCurrency ? state.cart[0].viewedCurrency : state.currency;
      const totalText = hasCustom ? displayInCurrency(total, cartCurrency) + " + CUSTOM" : displayInCurrency(total, cartCurrency);
      addHeading(hasEstimate ? "ESTIMATED ORDER TOTAL" : "ORDER TOTAL");
      addBody(`${totalText} · ${cartCurrency}`);
      addBody(`USD reference: ${hasCustom ? moneyUSD(total) + " + CUSTOM" : moneyUSD(total)} USD`);
      addBody("Safety: No cheats. No exploits. Manual service only.");
      addMuted("ELYSIUM BOOST · Premium manual game services");

      function measure() {
        let h = pad;
        for (const bl of blocks) {
          m.font = bl.t === "h" ? "700 17px Rajdhani, Inter, system-ui, sans-serif" : bl.t === "m" ? "600 12px Rajdhani, Inter, system-ui, sans-serif" : "500 15px Rajdhani, Inter, system-ui, sans-serif";
          const lh = bl.t === "h" ? 22 : bl.t === "m" ? 17 : 20;
          if (bl.t === "sp") {
            h += 10;
            continue;
          }
          const lines = wrapReceiptLines(m, bl.text, inner);
          h += lines.length * lh + 10;
        }
        return h + pad;
      }

      const H = Math.max(720, measure());
      const canvas = document.createElement("canvas");
      canvas.width = W * scale;
      canvas.height = H * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);
      ctx.textBaseline = "top";
      ctx.fillStyle = "#070510";
      ctx.fillRect(0, 0, W, H);
      const bar = ctx.createLinearGradient(0, 0, W, 0);
      bar.addColorStop(0, "#5b21b6");
      bar.addColorStop(0.5, "#fbbf24");
      bar.addColorStop(1, "#9d174d");
      ctx.fillStyle = bar;
      ctx.fillRect(0, 0, W, 5);

      y = pad;
      for (const bl of blocks) {
        if (bl.t === "sp") {
          y += 10;
          continue;
        }
        const isH = bl.t === "h";
        const isM = bl.t === "m";
        const size = isH ? 17 : isM ? 12 : 15;
        const weight = isH ? "700" : isM ? "600" : "500";
        ctx.font = `${weight} ${size}px Rajdhani, Inter, system-ui, sans-serif`;
        const lh = isH ? 22 : isM ? 17 : 20;
        const color = isH ? "#e9d5ff" : isM ? "rgba(167, 139, 250, 0.85)" : "#e8ecff";
        ctx.fillStyle = color;
        const lines = wrapReceiptLines(ctx, bl.text, inner);
        for (const ln of lines) {
          if (ln === "") {
            y += lh * 0.35;
            continue;
          }
          ctx.fillText(ln, pad, y);
          y += lh;
        }
        y += 10;
      }

      return canvas;
    }

    function fallbackExecCopy(text, ok, fail) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const done = document.execCommand("copy");
        ta.remove();
        if (done) ok();
        else fail();
      } catch (e) {
        fail();
      }
    }

    function openCopySuccessModal() {
      $("copySuccessModal")?.classList.add("active");
      $("copySuccessModal")?.setAttribute("aria-hidden", "false");
    }

    function closeCopySuccessModal() {
      $("copySuccessModal")?.classList.remove("active");
      $("copySuccessModal")?.setAttribute("aria-hidden", "true");
    }

    function copyTicketTextToClipboard(openDiscordAfter) {
      const text = ticketText();
      const statusEl = $("copyStatus");
      const ok = () => {
        if (statusEl) statusEl.textContent = ui("Ticket copied successfully. Open Discord and paste it into your order ticket.");
        showToast(ui("Ticket copied."), 2600, false);
        if (openDiscordAfter && typeof DISCORD_URL === "string") window.open(DISCORD_URL, "_blank", "noopener");
        openCopySuccessModal();
      };
      const fail = () => {
        if (statusEl) statusEl.textContent = ui("Copy failed. Try Download Receipt Image or copy the ticket manually.");
        showToast(ui("Copy failed."), 3200, true);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok).catch(() => fallbackExecCopy(text, ok, fail));
        return;
      }
      fallbackExecCopy(text, ok, fail);
    }

    function copyOrderNow(openDiscordAfter) {
      copyTicketTextToClipboard(Boolean(openDiscordAfter));
    }

    async function downloadOrderReceipt() {
      const statusEl = $("copyStatus");
      const gate = orderReceiptBlockedMessage();
      if (gate) {
        if (statusEl) statusEl.textContent = gate;
        showToast(gate, 3400, true);
        return;
      }
      if (statusEl) statusEl.textContent = ui("Generating receipt image...");
      try {
        const canvas = await drawPremiumOrderReceiptCanvas();
        downloadCanvasAsPng(canvas, receiptFilenameFromPreviewId());
        if (statusEl) statusEl.textContent = ui("Receipt downloaded. Attach it to your Discord ticket if asked.");
        showToast(ui("Receipt downloaded."), 2600, false);
        try {
          if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
            const blob = await canvasToBlob(canvas, "image/png");
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            if (statusEl) statusEl.textContent = ui("Receipt downloaded and copied — paste the image into Discord if needed.");
          }
        } catch (_) {}
      } catch (e) {
        if (statusEl) statusEl.textContent = ui("Could not generate receipt. Try again or copy the text ticket.");
        showToast(ui("Receipt generation failed."), 3200, true);
      }
    }

    function canvasToBlob(canvas, type) {
      return new Promise((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Canvas export failed")), type);
      });
    }

    function downloadCanvasAsPng(canvas, filename) {
      const link = document.createElement("a");
      link.download = filename || `elysium-order-receipt-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    function openDiscordTicket() {
      if (!state.cart.length) {
        const csOd = $("copyStatus");
        if (csOd) csOd.textContent = "Add an item before opening Discord.";
        return;
      }
      ensureArcId(() => window.open(DISCORD_URL, "_blank", "noopener"));
    }

    function showToast(message, ms = 2200, isError = false) {
      const el = $("toast");
      el.textContent = message;
      el.classList.toggle("toast--error", Boolean(isError));
      el.classList.add("active");
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => {
        el.classList.remove("active");
        el.classList.remove("toast--error");
      }, ms);
    }

    function searchEntries(query) {
      const entries = [];
      const pushGameServices = game => {
        if (!game || !game.services) return;
        game.services.forEach(service => {
          const category = game.categories?.find(cat => cat.id === service.category)?.label || service.category;
          const haystack = [service.title, service.cardTitle, service.short, service.intro, service.category, category, service.form, game.label].join(" ").toLowerCase();
          if (haystack.includes(query)) {
            entries.push({
              type: "service",
              gameId: game.id,
              serviceId: service.id,
              categoryId: service.category,
              title: service.cardTitle,
              meta: `${game.label} / ${category} / ${service.cardTitle}`
            });
          }
        });
      };
      pushGameServices(games.find(g => g.id === "arc"));
      pushGameServices(games.find(g => g.id === "valorant"));
      pushGameServices(games.find(g => g.id === "wow"));
      pushGameServices(games.find(g => g.id === "lol"));
      pushGameServices(games.find(g => g.id === "social"));
      const pushCategoryHits = game => {
        if (!game || !game.categories?.length) return;
        game.categories.forEach(cat => {
          const lab = ui(cat.label).toLowerCase();
          if (cat.id.toLowerCase().includes(query) || lab.includes(query)) {
            entries.push({
              type: "category",
              gameId: game.id,
              categoryId: cat.id,
              title: ui(cat.label),
              meta: `${game.label} / ${ui(cat.label)}`
            });
          }
        });
      };
      pushCategoryHits(games.find(g => g.id === "valorant"));
      pushCategoryHits(games.find(g => g.id === "wow"));
      Object.entries(blueprintGroups).forEach(([tab, names]) => {
        const matches = names.filter(name => name.toLowerCase().includes(query) || trName(name).toLowerCase().includes(query));
        if (matches.length) {
          entries.push({
            type: "blueprint",
            serviceId: "blueprints",
            categoryId: "blueprints",
            bpTab: tab,
            bpQuery: query,
            title: tab,
            meta: `Blueprints / ${matches.slice(0, 3).join(", ")}${matches.length > 3 ? "..." : ""}`
          });
        }
      });
      return entries.slice(0, 10);
    }

    function openSearchResult(entry) {
      state.game = entry.gameId || "arc";
      state.category = entry.categoryId;
      if (entry.type === "category") {
        const g = games.find(x => x.id === state.game);
        state.serviceId = g?.services.find(s => s.category === state.category)?.id ?? null;
      } else {
        state.serviceId = entry.serviceId;
      }
      if (entry.type === "blueprint") state.pendingBlueprintSearch = { tab: entry.bpTab, query: entry.bpQuery };
      $("siteSearchResults").classList.remove("active");
      syncGameHash(state.game);
      renderAll();
      ($("detailLeftHead") || $("detailSection")).scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function renderSiteSearchResults(entries, query) {
      const box = $("siteSearchResults");
      if (!query) {
        box.classList.remove("active");
        box.innerHTML = "";
        return;
      }
      if (!entries.length) {
        box.innerHTML = `<div class="search-empty-card" role="status"><strong>No matching services found.</strong><span>Try another keyword or open a custom order.</span></div>`;
        box.classList.add("active");
        return;
      }
      box.innerHTML = entries.map((entry, index) => `
        <button class="search-result-btn" type="button" data-search-index="${index}">
          <strong>${escapeHtml(entry.title)}</strong>
          <span>${escapeHtml(entry.meta)}</span>
        </button>
      `).join("");
      box.classList.add("active");
      box.querySelectorAll("[data-search-index]").forEach(button => {
        button.addEventListener("click", () => openSearchResult(entries[Number(button.dataset.searchIndex)]));
      });
    }

    function runSiteSearch() {
      const query = val("siteSearch").trim().toLowerCase();
      if (!query) return;
      const entries = searchEntries(query);
      if (entries.length === 1) return openSearchResult(entries[0]);
      renderSiteSearchResults(entries, query);
    }
