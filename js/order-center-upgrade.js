(function () {
 "use strict";

 const COMING_SOON_GAMES =
  window.ELY_COMING_SOON_GAME_IDS instanceof Set ? window.ELY_COMING_SOON_GAME_IDS : new Set(["circle", "wow", "cs2"]);
 window.ELY_COMING_SOON_GAME_IDS = COMING_SOON_GAMES;

 function captureOrderFormSnapshot() {
 const root = document.getElementById("orderForm");
 if (!root) return null;
 const snap = {};
 root.querySelectorAll("input, select, textarea").forEach(el => {
 if (!el.id) return;
 if (el.type === "checkbox" || el.type === "radio") snap[el.id] = el.checked ? "1" : "";
 else snap[el.id] = String(el.value);
 });
 try {
 if (root.querySelector("#bpTabs") && typeof state !== "undefined" && state.blueprintSelections) {
 snap.__blueprints = JSON.stringify(
 Object.fromEntries(Object.entries(state.blueprintSelections).map(([k, v]) => [k, Array.from(v)]))
 );
 }
 } catch (e) {}
 return snap;
 }

 function applyOrderFormSnapshot(snap) {
 if (!snap || typeof snap !== "object") return;
 requestAnimationFrame(() => {
 const bpJson = snap.__blueprints;
 delete snap.__blueprints;
 const root = document.getElementById("orderForm");
 if (!root) return;
 Object.keys(snap).forEach(id => {
 const el = document.getElementById(id);
 if (!el) return;
 const v = snap[id];
 if (el.type === "checkbox" || el.type === "radio") el.checked = v === "1";
 else el.value = v;
 });
 if (bpJson && typeof state !== "undefined") {
 try {
 const obj = JSON.parse(bpJson);
 Object.keys(state.blueprintSelections).forEach(k => state.blueprintSelections[k].clear());
 Object.entries(obj).forEach(([k, arr]) => {
 if (!state.blueprintSelections[k]) state.blueprintSelections[k] = new Set();
 (arr || []).forEach(x => state.blueprintSelections[k].add(x));
 });
 } catch (e) {}
 }
 root.querySelectorAll("input, select, textarea").forEach(el => {
 el.dispatchEvent(new Event("input", { bubbles: true }));
 el.dispatchEvent(new Event("change", { bubbles: true }));
 });
 if (typeof updateTotal === "function") updateTotal();
 });
 }

 function ticketGameAccountLinesPatched(item) {
 const gid = item.gameId;
 const lines = [];
 if (gid === "arc") {
 const em = String(state.arcId || "").trim();
 if (em) lines.push(`Embark ID: ${em}`);
 }
 if (gid === "valorant") {
 const rid = String(item.playerId || state.riotId || "").trim();
 if (rid) lines.push(`Riot ID: ${rid}`);
 lines.push(`Valorant region: ${item.region || state.orderRegion || "—"}`);
 lines.push(`Platform: ${item.platform || state.orderPlatform || "—"}`);
 }
 if (gid === "lol") {
 const rid = String(item.playerId || state.lolRiotId || "").trim();
 if (rid) lines.push(`LoL Riot ID: ${rid}`);
 }
 if (gid === "premier" || gid === "faceit" || gid === "cs2") {
 lines.push(`Steam / friend code: ${(item.playerId || state.steamId || "").trim() || "—"}`);
 }
 if (gid === "wow") {
 lines.push(`WoW region: ${item.region || state.orderRegion || "—"}`);
 {
 const pid = String(item.playerId || state.wowCharacterRealm || "").trim();
 const cn = String(state.wowCharName || "").trim() || (pid.split(/\s*[—\-]\s*/)[0] || "").trim();
 const rm =
 String(state.wowRealm || "").trim() ||
 (pid.split(/\s*[—\-]\s*/).length > 1 ? pid.split(/\s*[—\-]\s*/).slice(1).join(" — ").trim() : "");
 lines.push(`Character: ${cn || "—"}`);
 lines.push(`Realm: ${rm || "—"}`);
 }
 }
 return lines;
 }

 function cartReceiptAccountRowsPatched(item) {
 const gid = item.gameId;
 const row = (k, v) =>
 `<div><dt>${escapeHtml(ui(k))}</dt><dd>${v}</dd></div>`;
 let inner = "";
 if (gid === "valorant") {
 inner += row("Region", escapeHtml(item.region || state.orderRegion || "—"));
 inner += row("Platform", escapeHtml(item.platform || state.orderPlatform || "—"));
 const rid = String(item.playerId || state.riotId || "").trim();
 if (rid) inner += row("Riot ID", escapeHtml(rid));
 } else if (gid === "lol") {
 const rid = String(item.playerId || state.lolRiotId || "").trim();
 if (rid) inner += row("Riot ID", escapeHtml(rid));
 } else if (gid === "premier" || gid === "faceit" || gid === "cs2") {
 inner += row(
 "Steam / friend code",
 escapeHtml((item.playerId || state.steamId || "").trim() || "—")
 );
 } else if (gid === "wow") {
 inner += row("Region", escapeHtml(item.region || state.orderRegion || "—"));
 {
 const cn =
 String(state.wowCharName || "").trim() || (String(item.playerId || "").split(/\s*[—\-]\s*/)[0] || "").trim();
 const rm =
 String(state.wowRealm || "").trim() ||
 (String(item.playerId || "").split(/\s*[—\-]\s*/).length > 1
 ? String(item.playerId || "")
 .split(/\s*[—\-]\s*/)
 .slice(1)
 .join(" — ")
 .trim()
 : "") ||
 String(state.wowCharacterRealm || "").trim();
 inner += row("Character", escapeHtml(cn || "—"));
 inner += row("Realm", escapeHtml(rm || "—"));
 }
 } else if (gid === "arc") {
 const em = String(state.arcId || "").trim();
 if (em) inner += row("Embark ID", escapeHtml(em));
 }
 if (!inner) return "";
 return `<dl class="cart-receipt-dl">${inner}</dl>`;
 }

 function orderContextHeaderHtmlSlim() {
 const needVal = cartHasGameId("valorant");
 const needLol = cartHasGameId("lol");
 const needSteam = cartNeedsSteamId();
 const needWow = cartHasGameId("wow");
 const needRegion = needVal || needWow || needLol;
 const needPlatform = needVal;
 if (!needRegion && !needPlatform && !needSteam && !needWow) return "";

 const regionOpts = ["EU", "NA", "TR", "MENA", "Other"];
 const platOpts = ["PC", "Xbox", "PlayStation"];

 let grid = "";
 if (needRegion) {
 grid += `<div class="order-context-field"><span class="order-context-k">${escapeHtml(ui("Region"))}</span>`;
 grid += `<select id="orderRegionSel" class="order-context-select" aria-label="${escapeHtml(ui("Region"))}">`;
 regionOpts.forEach(opt => {
 grid += `<option value="${escapeHtml(opt)}">${escapeHtml(ui(opt))}</option>`;
 });
 grid += `</select></div>`;
 }
 if (needPlatform) {
 grid += `<div class="order-context-field"><span class="order-context-k">${escapeHtml(ui("Platform"))}</span>`;
 grid += `<select id="orderPlatformSel" class="order-context-select" aria-label="${escapeHtml(ui("Platform"))}">`;
 platOpts.forEach(opt => {
 grid += `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`;
 });
 grid += `</select></div>`;
 }
 if (needSteam) {
 grid += `<div class="order-context-field order-context-field--wide"><span class="order-context-k">${escapeHtml(
 ui("Steam profile or friend code")
 )}</span>`;
 grid += `<input id="orderSteamInput" class="order-context-input" type="text" autocomplete="off" /></div>`;
 }
 if (needWow) {
 grid += `<div class="order-context-field"><span class="order-context-k">${escapeHtml(ui("Character name"))}</span>`;
 grid += `<input id="orderWowCharInput" class="order-context-input" type="text" autocomplete="off" /></div>`;
 grid += `<div class="order-context-field"><span class="order-context-k">${escapeHtml(ui("Realm"))}</span>`;
 grid += `<input id="orderWowRealmInput" class="order-context-input" type="text" autocomplete="off" /></div>`;
 }

 return `
<section class="order-context-panel order-context-panel--minimal">
 <h3 class="order-context-title">${escapeHtml(ui("Ticket routing"))}</h3>
 <div class="order-context-grid">${grid}</div>
 <p class="order-context-hint">${escapeHtml(
 ui("Region and platform route your ticket. Optional account IDs are below when applicable.")
 )}</p>
</section>`;
 }

 function buildOptionalIdsHtml() {
 const needArc = cartHasGameId("arc");
 const needVal = cartHasGameId("valorant");
 const needLol = cartHasGameId("lol");
 const chunks = [];
 if (needArc) {
 chunks.push(`<div class="ely-opt-field">
<label class="ely-opt-label" for="elyEmbarkOpt">${escapeHtml(ui("Embark ID"))}</label>
<input class="ely-opt-input" id="elyEmbarkOpt" type="text" autocomplete="off" placeholder="${escapeHtml(
 ui("Enter Embark ID optional")
 )}" value="${escapeHtml(state.arcId || "")}">
</div>`);
 }
 if (needVal) {
 chunks.push(`<div class="ely-opt-field">
<label class="ely-opt-label" for="elyValorantRiotOpt">${escapeHtml(ui("Riot ID"))}</label>
<input class="ely-opt-input" id="elyValorantRiotOpt" type="text" autocomplete="off" placeholder="${escapeHtml(
 ui("Enter Riot ID optional")
 )}" value="${escapeHtml(state.riotId || "")}">
</div>`);
 }
 if (needLol) {
 chunks.push(`<div class="ely-opt-field">
<label class="ely-opt-label" for="elyLolRiotOpt">${escapeHtml(ui("Riot ID"))}</label>
<input class="ely-opt-input" id="elyLolRiotOpt" type="text" autocomplete="off" placeholder="${escapeHtml(
 ui("Enter Riot ID optional")
 )}" value="${escapeHtml(state.lolRiotId || "")}">
</div>`);
 }
 if (!chunks.length) return "";
 return `<div class="ely-optional-ids-card" role="region" aria-label="${escapeHtml(ui("Optional account details"))}">${chunks.join(
 ""
 )}</div>`;
 }

 function bindOptionalIdInputs() {
 const eEmb = document.getElementById("elyEmbarkOpt");
 if (eEmb) {
 eEmb.oninput = () => {
 state.arcId = eEmb.value;
 state.arcIdSkipped = false;
 if (typeof persistOrderState === "function") persistOrderState();
 if (typeof updateCartFootAlerts === "function") updateCartFootAlerts();
 };
 }
 const eVal = document.getElementById("elyValorantRiotOpt");
 if (eVal) {
 eVal.oninput = () => {
 state.riotId = eVal.value;
 state.cart.forEach(it => {
 if (it.game === "Valorant") it.playerId = state.riotId.trim();
 });
 if (typeof persistOrderState === "function") persistOrderState();
 if (typeof updateCartFootAlerts === "function") updateCartFootAlerts();
 };
 }
 const eLol = document.getElementById("elyLolRiotOpt");
 if (eLol) {
 eLol.oninput = () => {
 state.lolRiotId = eLol.value;
 state.cart.forEach(it => {
 if (it.gameId === "lol") it.playerId = state.lolRiotId.trim();
 });
 if (typeof persistOrderState === "function") persistOrderState();
 if (typeof updateCartFootAlerts === "function") updateCartFootAlerts();
 };
 }
 }

 function stripVerboseCartChrome() {
 document.querySelectorAll(".order-checklist-card").forEach(el => el.remove());
 document.querySelectorAll(".order-discord-panel").forEach(el => el.remove());
 document.querySelectorAll(".cart-embark-panel").forEach(el => el.remove());
 document.querySelectorAll(".order-safety-note").forEach(el => el.remove());
 document.getElementById("cartCompactToggle")?.remove();
 const oc = document.querySelector(".order-center");
 if (oc) oc.classList.add("order-center--streamlined");
 }

 function mountOptionalIdsPanel() {
 const cartBody = document.getElementById("cartBody");
 if (!cartBody || !state.cart.length) return;
 let mount = document.getElementById("elyOptionalIdsMount");
 if (!mount) {
 mount = document.createElement("div");
 mount.id = "elyOptionalIdsMount";
 mount.className = "ely-optional-ids";
 const oc = cartBody.querySelector(".order-center") || cartBody;
 const left = oc.querySelector(".order-center__left");
 const preview =
 left?.querySelector(".order-meta-card--preview") || left?.querySelector(".order-meta-card");
 if (left && preview) preview.insertAdjacentElement("afterend", mount);
 else oc.insertBefore(mount, oc.firstChild);
 }
 mount.innerHTML = buildOptionalIdsHtml();
 bindOptionalIdInputs();
 }

 function repositionClearCartHead() {
 const clearBtn = document.getElementById("clearCart");
 const headRight = document.querySelector(".drawer-head-right");
 if (clearBtn && headRight && !headRight.contains(clearBtn)) {
 clearBtn.classList.remove("btn-clear-cart-muted");
 clearBtn.classList.add("btn", "btn-glass", "btn-clear-cart-head");
 headRight.insertBefore(clearBtn, headRight.firstChild);
 }
 const tert = document.querySelector(".order-actions-tertiary");
 if (tert && !tert.querySelector("button")) tert.innerHTML = "";
 }

 function decorateComingSoonHomeCards() {
 COMING_SOON_GAMES.forEach(id => {
 document.querySelectorAll(`[data-home-game="${id}"]`).forEach(card => {
 card.classList.add("coming-soon");
 if (!card.querySelector(".home-coming-soon-badge")) {
 const badge = document.createElement("span");
 badge.className = "home-coming-soon-badge";
 badge.textContent = ui("Coming soon");
 card.appendChild(badge);
 }
 });
 });
 }

 function decorateComingSoonGameMenu() {
 const panel = document.getElementById("gameMenuPanel");
 if (!panel) return;
 COMING_SOON_GAMES.forEach(id => {
 panel.querySelectorAll(`[data-game-menu-id="${id}"]`).forEach(row => {
 row.classList.add("is-coming-soon");
 });
 });
 }

 state.cartDrawerCompact = false;

 window.buildOrderChecklistHtml = () => "";
 window.buildDiscordNextStepsHtml = () => "";
 window.orderContextHeaderHtml = orderContextHeaderHtmlSlim;

 window.ensureArcId = function (action) {
 if (typeof action === "function") action();
 };

 window.ticketGameAccountLines = ticketGameAccountLinesPatched;
 window.cartReceiptAccountRows = cartReceiptAccountRowsPatched;

 window.orderReceiptBlockedMessage = function () {
 if (!state.cart.length) return ui("Add items to your cart first.");
 const v = validateTicketRequirements();
 if (!v.ok) return v.message;
 return "";
 };

 window.updateCartFootAlerts = function () {
 const foot = document.getElementById("cartFootAlerts");
 if (!foot) return;
 if (!state.cart.length) {
 foot.innerHTML = "";
 return;
 }
 const bits = [];
 const v = validateTicketRequirements();
 if (!v.ok && v.message) {
 bits.push(`<div class="cart-inline-warn" role="status">${escapeHtml(v.message)}</div>`);
 }
 foot.innerHTML = bits.join("");
 };

 window.applyDrawerCompactClass = function () {
 document.querySelector(".drawer")?.classList.remove("drawer--cart-compact");
 };

 window.syncCompactToggleLabel = function () {};

 window.refreshOrderChecklistIfOpen = function () {};

 const nativeSelectGame = window.selectGame;
 if (typeof nativeSelectGame === "function") {
 window.selectGame = function (id) {
 if (COMING_SOON_GAMES.has(id)) {
 showToast(ui("Coming soon — ordering is not available for this title yet."));
 return;
 }
 const pending = state.editingCartLineId;
 if (pending && id) {
 const line = state.cart.find(i => i.id === pending);
 if (line && line.gameId !== id) state.editingCartLineId = null;
 }
 return nativeSelectGame.apply(this, arguments);
 };
 }

 const nativeSearchEntries = window.searchEntries;
 if (typeof nativeSearchEntries === "function") {
 window.searchEntries = function (query) {
 const list = nativeSearchEntries.call(this, query);
 return list.filter(e => !e.gameId || !COMING_SOON_GAMES.has(e.gameId));
 };
 }

 const nativeOpenSearchResult = window.openSearchResult;
 if (typeof nativeOpenSearchResult === "function") {
 window.openSearchResult = function (entry) {
 if (entry && entry.gameId && COMING_SOON_GAMES.has(entry.gameId)) {
 showToast(ui("Coming soon — ordering is not available for this title yet."));
 return;
 }
 return nativeOpenSearchResult.apply(this, arguments);
 };
 }

 const nativeClearCart = window.clearCart;
 if (typeof nativeClearCart === "function") {
 window.clearCart = function () {
 state.editingCartLineId = null;
 return nativeClearCart.apply(this, arguments);
 };
 }

 window.adjustCartItem = function (lineId) {
 const item = state.cart.find(i => i.id === lineId);
 if (!item || !item.gameId || !item.serviceId) return;
 state.editingCartLineId = lineId;
 state.game = item.gameId;
 if (item.gameId === "valorant") state.riotId = item.playerId || state.riotId || "";
 if (item.gameId === "lol") state.lolRiotId = item.playerId || state.lolRiotId || "";
 const g = typeof currentGame === "function" ? currentGame() : null;
 state.category = item.categoryId || g?.categories[0]?.id || state.category;
 state.serviceId = item.serviceId;
 syncGameHash(item.gameId);
 renderAll();
 closeCart();
 requestAnimationFrame(() => {
 applyOrderFormSnapshot(item.formSnapshot);
 document.getElementById("detailSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
 });
 showToast(ui("Adjust options, then tap Add to Cart to update this line."));
 };

 window.addToCart = function () {
 const cgEarly = typeof currentGame === "function" ? currentGame() : null;
 if (cgEarly && COMING_SOON_GAMES.has(cgEarly.id)) {
 showToast(ui("Coming soon — ordering is not available for this title yet."));
 return;
 }
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
 const snap = captureOrderFormSnapshot();
 const preserveId = state.editingCartLineId;
 const newLine = {
 id: preserveId || String(Date.now() + Math.random()),
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
 priceBreakdown: bd,
 formSnapshot: snap
 };
 if (preserveId) {
 const idx = state.cart.findIndex(x => x.id === preserveId);
 if (idx >= 0) state.cart[idx] = newLine;
 else state.cart.push(newLine);
 state.editingCartLineId = null;
 ensureOrderPreviewId();
 persistOrderState();
 renderCart();
 updateStickyOrderChip();
 if (typeof openCart === "function") openCart();
 showToast(ui("Cart line updated."));
 return;
 }
 const mergeIdx = state.cart.findIndex(
 it =>
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
 if (typeof openCart === "function") openCart();
 showToast(result.estimated ? "Estimated order added to cart." : "Added to cart.");
 };

 const origRenderCart = window.renderCart;
 window.renderCart = function () {
 origRenderCart.apply(this, arguments);
 try {
 stripVerboseCartChrome();
 mountOptionalIdsPanel();
 repositionClearCartHead();
 } catch (e) {}
 };

 const origRenderAll = window.renderAll;
 window.renderAll = function () {
 origRenderAll.apply(this, arguments);
 if (!state.game) state.editingCartLineId = null;
 requestAnimationFrame(() => {
 decorateComingSoonHomeCards();
 decorateComingSoonGameMenu();
 });
 };

 document.addEventListener("DOMContentLoaded", () => {
 state.cartDrawerCompact = false;
 document.getElementById("cartCompactToggle")?.remove();
 });

 requestAnimationFrame(() => {
 decorateComingSoonHomeCards();
 decorateComingSoonGameMenu();
 if (typeof renderCart === "function") renderCart();
 });
})();
