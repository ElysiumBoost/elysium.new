function cartNeedsArcId() {
 return state.cart.some(item => item.game === "Arc Raiders");
}

function cartHasGameId(gameId) {
 return state.cart.some(item => item.gameId === gameId);
}

function cartNeedsLolId() {
 return cartHasGameId("lol");
}

function cartNeedsWowFields() {
 return cartHasGameId("wow");
}

function cartNeedsValorantId() {
 return state.cart.some(item => item.game === "Valorant");
}

function cartNeedsSteamId() {
 return state.cart.some(item => item.game === "Premier" || item.game === "Faceit");
}

function isDiscordTicketReady() {
 if (!state.cart.length) return false;
 const v = validateTicketRequirements();
 if (!v.ok) return false;
 return true;
}

function validateTicketRequirements() {
 ensureOrderPreviewId();
 if (cartNeedsValorantId()) {
 if (!String(state.orderRegion || "").trim()) {
 return { ok: false, message: ui("Please select your Valorant region before copying the ticket.") };
 }
 if (!String(state.orderPlatform || "").trim()) {
 return { ok: false, message: ui("Please select your platform for Valorant before copying the ticket.") };
 }
 }
 if (cartNeedsWowFields()) {
 if (!String(state.orderRegion || "").trim()) {
 return { ok: false, message: ui("Please select your WoW region before copying.") };
 }
 const cn = String(state.wowCharName || state.wowCharacterRealm || "").trim();
 const rm = String(state.wowRealm || "").trim();
 if (!cn || !rm) {
 return { ok: false, message: ui("Please enter your character name and realm before copying.") };
 }
 }
 if (cartNeedsSteamId() && !String(state.steamId || "").trim()) {
 return { ok: false, message: ui("Please add your Steam or FACEIT profile details before copying.") };
 }
 return { ok: true };
}
