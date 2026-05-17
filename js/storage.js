const ORDER_STATE_KEY = "elyOrderStateV1";
const NAV_RECOVERY_KEY = "elyRecoveryNavFixV1";

/** Used by cart total pulse in renderCart; must be a single shared binding. */
var lastCartMonetaryTotal = null;

function gameSlugForPreview(gameLabel) {
  const g = String(gameLabel || "");
  if (g.includes("Arc")) return "AR";
  if (g.includes("Valorant")) return "VAL";
  if (g.includes("Premier")) return "CS2";
  if (g.includes("Faceit")) return "FCT";
  if (g.includes("League")) return "LOL";
  if (g.includes("Warcraft") || g.includes("WoW")) return "WOW";
  if (g.includes("Boost")) return "BST";
  return "EB";
}

function ensureOrderPreviewId() {
  if (!state.cart.length) {
    state.orderPreviewId = "";
    return;
  }
  if (state.orderPreviewId) return;
  const first = state.cart[0];
  const code = gameSlugForPreview(first.game);
  state.orderPreviewId = "EB-" + code + "-" + String(1000 + Math.floor(Math.random() * 9000)).slice(-4);
}

function cleanStaleCart() {
  state.cart = state.cart.filter(item => {
    let g = games.find(x => x.id === item.gameId);
    if (!g && item.game) g = games.find(x => x.label === item.game);
    if (!g) return false;
    if (!item.serviceId) return true;
    return g.services.some(s => s.id === item.serviceId);
  });
  if (!state.cart.length) state.orderPreviewId = "";
}

function sanitizeNavigationState() {
  try {
    if (state.game != null && !games.some(g => g.id === state.game)) {
      state.game = null;
      state.category = null;
      state.serviceId = null;
      return;
    }
    if (!state.game) return;
    const g = games.find(x => x.id === state.game);
    if (!g) {
      state.game = null;
      state.category = null;
      state.serviceId = null;
      return;
    }
    const catList = g.categories || [];
    const catIds = new Set(catList.map(c => c.id));
    if (state.category == null || !catIds.has(state.category)) {
      state.category = catList[0]?.id || "services";
    }
    const inCat = s => s.category === state.category;
    if (state.serviceId == null || !g.services.some(s => s.id === state.serviceId && inCat(s))) {
      state.serviceId = g.services.find(s => s.category === state.category)?.id ?? null;
    }
  } catch (e) {}
}

/** One-time: patch persisted navigation fields so old builds cannot brick renderAll. */
function applyNavRecoveryOnce() {
  try {
    if (localStorage.getItem(NAV_RECOVERY_KEY) === "1") return;
    localStorage.setItem(NAV_RECOVERY_KEY, "1");
    const raw = localStorage.getItem(ORDER_STATE_KEY);
    if (!raw) return;
    const j = JSON.parse(raw);
    let dirty = false;
    if (j.game != null) {
      if (!games.some(g => g.id === j.game)) {
        j.game = null;
        j.category = null;
        j.serviceId = null;
        dirty = true;
      } else {
        const g = games.find(x => x.id === j.game);
        const catList = g.categories || [];
        const catIds = new Set(catList.map(c => c.id));
        if (j.category != null && !catIds.has(j.category)) {
          j.category = catList[0]?.id ?? null;
          dirty = true;
        }
        const effectiveCat = j.category ?? catList[0]?.id;
        if (j.serviceId != null && !g.services.some(s => s.id === j.serviceId && s.category === effectiveCat)) {
          j.serviceId = g.services.find(s => s.category === effectiveCat)?.id ?? null;
          dirty = true;
        }
      }
    }
    if (dirty) localStorage.setItem(ORDER_STATE_KEY, JSON.stringify(j));
  } catch (e) {}
}

function persistOrderState() {
  try {
    localStorage.setItem(ORDER_STATE_KEY, JSON.stringify({
      cart: state.cart,
      currency: state.currency,
      orderPreviewId: state.orderPreviewId,
      arcId: state.arcId,
      arcIdSkipped: state.arcIdSkipped,
      orderRegion: state.orderRegion,
      orderPlatform: state.orderPlatform,
      riotId: state.riotId,
      steamId: state.steamId,
      lolRiotId: state.lolRiotId,
      lolServer: state.lolServer,
      wowCharacterRealm: state.wowCharacterRealm,
      wowCharName: state.wowCharName,
      wowRealm: state.wowRealm,
      game: state.game,
      category: state.category,
      serviceId: state.serviceId,
      cartDrawerCompact: Boolean(state.cartDrawerCompact)
    }));
  } catch (e) {}
}

function restoreOrderState() {
  try {
    const raw = localStorage.getItem(ORDER_STATE_KEY);
    if (!raw) return;
    const j = JSON.parse(raw);
    if (Array.isArray(j.cart)) state.cart = j.cart;
    if (j.currency && rates[j.currency]) {
      state.currency = j.currency;
      const sel = $("currency");
      if (sel) sel.value = state.currency;
    }
    if (typeof j.orderPreviewId === "string") state.orderPreviewId = j.orderPreviewId;
    if (typeof j.arcId === "string") state.arcId = j.arcId;
    if (typeof j.arcIdSkipped === "boolean") state.arcIdSkipped = j.arcIdSkipped;
    if (typeof j.orderRegion === "string") state.orderRegion = j.orderRegion;
    if (typeof j.orderPlatform === "string") state.orderPlatform = j.orderPlatform;
    if (typeof j.riotId === "string") state.riotId = j.riotId;
    if (typeof j.steamId === "string") state.steamId = j.steamId;
    if (typeof j.lolRiotId === "string") state.lolRiotId = j.lolRiotId;
    if (typeof j.lolServer === "string") state.lolServer = j.lolServer;
    if (typeof j.wowCharacterRealm === "string") state.wowCharacterRealm = j.wowCharacterRealm;
    if (typeof j.wowCharName === "string") state.wowCharName = j.wowCharName;
    if (typeof j.wowRealm === "string") state.wowRealm = j.wowRealm;
    if (!state.wowCharName && state.wowCharacterRealm && !state.wowRealm) {
      const parts = String(state.wowCharacterRealm).split(/\s*[—\-]\s*/);
      if (parts.length >= 2) {
        state.wowCharName = parts[0].trim();
        state.wowRealm = parts.slice(1).join(" — ").trim();
      } else {
        state.wowCharName = state.wowCharacterRealm.trim();
      }
    }
    if (typeof j.cartDrawerCompact === "boolean") state.cartDrawerCompact = j.cartDrawerCompact;
    const hashGame = parseGameHash();
    if (!hashGame && j.game && games.some(g => g.id === j.game)) {
      state.game = j.game;
      state.category = j.category;
      state.serviceId = j.serviceId;
    }
  } catch (e) {}
}
