# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Elysium Boost — professional gaming boost service website.
- Live: elysiumboost.com · Repo: ElysiumBoost/ElysiumBoost
- Brand: dark premium gaming, gold/amber luxury, high-conversion service pages.
- Stack: **vanilla HTML5/CSS3/JS only**. No React/Vue, no bundler, no modules. Plain static files served as-is.
- Backend: **Supabase is live** (auth, DB, storage, realtime) loaded via CDN. Deploy target is GitHub Pages.

## Commands

```bash
npm start      # live-server on http://127.0.0.1:3000 (also `npm run preview`)
```
No build, lint, or test setup exists — it's a static site. Verify changes by loading pages in the browser.

## Architecture

The landing page (`index.html`) is a **single-page configurator**. JS files are plain `<script defer>` tags sharing **one global scope** — there are no imports/exports, so functions and globals (`state`, `games`, `rates`, `window.addToCart`) are called across files. **Load order is fixed and matters** (set in `index.html`):

```
config.js → currency.js → products.js → state.js → storage.js →
validation.js → cart.js → ui.js → animations.js → main.js → order-center-upgrade.js
then (after body): supabase UMD CDN → auth.js → rank-discount.js → chat-widget.js
```

Core globals and their roles:
- `config.js` — `rates`, currency conversion, Valorant copy/rank/price tables, placeholder SVG.
- `products.js` — the games/services **catalog** (`games`, `prices`, coin/seed tiers, Arc intros/highlights, service factories). Games: Arc Raiders, Valorant, CS2, League of Legends, WoW, TFT.
- `state.js` — the single mutable `state` object (selected game/category/service, cart, currency, per-game id fields, blueprint selections).
- `storage.js` — localStorage persistence under key `elyOrderStateV1`; restore/sanitize/migrate logic (e.g. premier/faceit→cs2 remap, `applyNavRecoveryOnce` one-time repair).
- `cart.js` / `ui.js` — render the configurator, cart drawer, totals.
- `main.js` — event wiring + boot (`restoreOrderState → sanitize → cleanStaleCart → renderAll`) + landing widgets (Discord counter, hero video, FAQ, nav search, **Arc hub map controller** `initArcHub`).
- `auth.js` — Supabase client, OAuth + email auth, nav auth UI. Loaded on every page.

**Routing is hash-based.** `#<gameId>` selects a game. Arc Raiders uses `#arc-raiders` (hub map) and `#arc-raiders/<service>` (service view). `state` is source of truth, mirrored to the URL hash.

**Subpages** (`pages/games/arc-raiders.html`, `valorant.html`, plus `dashboard.html`, `booster.html`, `chat.html`) are self-contained: each loads its own page JS + shared `currency.js`, `cart-dropdown.js`, `auth.js`, `chat-widget.js`. They use `../../` root-relative paths back to landing assets.

**Cache busting:** shared scripts on `index.html` carry `?v=v5-fix1` query strings — bump these when changing cached JS that must invalidate.

## Backend (Supabase)

Client + config live in `js/auth.js` (project URL + **publishable** anon key are intentionally client-side). `rank-discount.js`, `booster.js`, `dashboard.js`, `chat.js`, `chat-widget.js` reuse the client.

- **Tables:** `profiles`, `orders`, `messages`, `support_requests`, `tips`.
- **Storage bucket:** `booster-proofs` (proof uploads, signed URLs ~1h TTL).
- **RPC:** `pick_order(p_order_id, p_booster_id)`.
- **OAuth:** Google, Apple, Discord + email/password; redirect to `https://elysiumboost.com`.
- **Realtime:** message subscriptions in `chat.js` / `chat-widget.js`.

Rules: never expose private/service keys (only the publishable anon key belongs client-side). Security must rely on Supabase RLS, not frontend checks. Use Context7 for Supabase API questions.

## External Endpoints

- Discord invite `https://discord.gg/elysiumgg` (config.js + all pages).
- Discord widget API `https://discord.com/api/guilds/1499767937974669363/widget.json` — live member count, polled 30s (main.js).
- CDNs: Google Fonts, Tabler Icons webfont `@3.31.0`, Supabase JS `@2`.
- Game card backgrounds hardcoded to `https://elysiumboost.com/assets/backgrounds/*` in `cart.js`.

## File Organization

```
index.html, 404.html, reset-password.html, CNAME
pages/  → login? dashboard, booster, chat, terms, privacy, reset-password, games/{arc-raiders,valorant}.html
css/    → global (vars+reset), components (buttons/cards/nav/footer), animations, layout-system,
          styles, cart, dashboard, booster, chat, order-center, arc-raiders, valorant
js/     → see architecture above
assets/ → images/ icons/ videos/ + arc-raiders/{icons,images} + valorant/icons
```

Rules:
- No inline styles. No duplicate CSS. Shared styles → `global.css`/`components.css`; page-specific styles stay in that page's CSS file.
- Check for an existing file before creating one. Never invent new paths.
- Every `<img>` has `alt`; non-hero images use `loading="lazy"`. Scripts load with `defer`.
- No production `console.log`. IDs = JS hooks; classes = styling.
- Images WebP; transparent icons PNG; videos MP4. **No audio** (never restore `elysium-loop.mp3`).
- Don't hardcode prices in HTML — pricing lives in `config.js`/`products.js`.

## Design System (don't change without approval)

Use existing tokens from `css/global.css`. Key values:
```
--bg #0a0805  --bg-2 #100b07  --bg-card #120c08
--gold #c9a84c  --gold-bright #e5c26b  --gold-deep #8a7224
--amber #d97757  --arc-rust #d4571b
--text #efe6cf  --text-soft/dim/faint  --line / --line-soft
--f-display Rajdhani · --f-body "Plus Jakarta Sans" · --f-mono JetBrains Mono
```
- Cards: `var(--bg-2)` + `1px solid var(--line-soft)`. Buttons: `.eb-btn` (outline) / `.eb-btn-primary` (gold).
- **Single blur layer only** — never stack `backdrop-filter`. Keep it premium, calm, dark; avoid generic gradients/glow spam.

## Animation

- Keyframes → `css/animations.css`. Scroll reveals → `js/animations.js` via IntersectionObserver.
- Respect `prefers-reduced-motion`. No shake/vibration unless explicitly requested.

**Travelling line effect** — preserve when touching affected components. Requires `@property --arc-trace-angle` declared *before* the animation (if the line goes static, this declaration is missing). Child: `position:absolute; inset:0; padding:~1.5px`, conic-gradient comet tail, mask-composite to exclude center, `arc-trace-spin` (~2.7s normal, ~4.5s for cart panels/CTAs).

## Known Fixes (apply when relevant)

1. Arc sidebar icon transparency: `.arc-sidebar-icon img { mix-blend-mode: screen; }`.
2. Valorant rank icons with baked dark bg: apply `mix-blend-mode: screen` carefully.
3. Never re-add `orderpanelbg.webp` (removed permanently).
4. No stacked `backdrop-filter` on Arc Raiders.
5. Video backgrounds: always `muted autoplay loop playsinline`.

## Fixed Catalog Names (don't rename without approval)

- **Arc stations:** Custom Loadout, All Weapons, Blueprints, Leveling, Workshop & Scrappy, All Materials, Depositary, Boss & Puzzle, Raider Coins, Trials Boost, Raid Bundles, Expedition Boost, Hourly Coaching, Custom Orders, Assorted Seeds.
- **Valorant tabs:** Rank Boosting, Placements, Ranked Wins, Account Leveling, Battle Pass, Coaching.

## Working Rules

- **One prompt = one task.** Don't combine migration + polish, or fixes across two games, or audit + auto-fix.
- Flow: inspect → report → show plan → show diff → wait for approval → commit only if approved.
- **Never commit or push without explicit approval.** Surgical edits only; never rewrite a whole file unasked.
- Make the minimal change. Don't re-read files already read this session. Don't add libraries without approval.
- Commit format: `[type]: [description]` where type ∈ feat|fix|style|refactor|chore.
- Be concise reporting: group by file, show exact paths, separate critical bugs from polish. Don't say "fixed" unless it was, or "tests passed" unless they ran.

## Project Skills

Under `.claude/skills/`: `audit`, `predeploy`, `visual-fix`, `migrate-page`, `asset-cleanup`. Use them for those workflows instead of inlining long procedures here.
