# AGENTS.md — ElysiumBoost Project Instructions

This document is the standing brief for any AI coding agent (Cursor, Codex, Claude, etc.) working on the ElysiumBoost website. Read it fully before editing anything. It encodes the brand, the rules, and the parts of the codebase that must not be broken.

If anything here conflicts with a one‑off user request, follow the user — but call out the conflict before you make the change.

---

## 1. What ElysiumBoost is

ElysiumBoost is a **premium gaming boosting and item delivery website**. The site is a Discord‑ticket order desk: customers browse services, customize an order, add it to a cart, copy a clean ticket, open Discord, and paste it for a booster to fulfill.

The entire site currently ships as a single static `index.html` plus an `assets/` folder. There is no build system, no framework, no bundler. Treat it as a hand‑authored static site.

### Project layout

```text
/
├── AGENTS.md            ← this file
├── index.html           ← entire site: HTML + inline CSS + inline JS
└── assets/              ← images, thumbnails, hero backgrounds, audio loop
```

### Key regions inside `index.html`

| Region | Approximate lines | What lives there |
| --- | --- | --- |
| `<style>` | 11 – 2296 | All site CSS, including responsive breakpoints at `1080px` and `720px`. |
| `<body>` markup | 2298 – 2458 | Topbar, category bar, hero, home grid, service grid, detail panel, cart drawer, Embark‑ID modal, toast. |
| `<script>` | 2460 – 4615 | Catalog data, render functions, pricing engine, cart logic, Discord ticket flow, audio control. |

When you reference code, cite specific line ranges. Don't say "in the JS"; say "`addToCart()` at `index.html:4251–4268`".

---

## 2. Brand style — non‑negotiable

ElysiumBoost is **dark, premium, magical, fantasy / Valhalla‑inspired, elite, and trustworthy**. Every visual decision must serve that brief.

### Palette

Use the existing CSS custom properties at the top of `<style>`. Do not invent new color tokens unless you also add them as `--name` on `:root`.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#05030d` | Page background, deep void black‑navy. |
| `--panel` / `--panel-2` / `--panel-3` | violet‑navy tints | Card and panel fills. |
| `--purple` | `#7a4dff` | Primary violet. |
| `--purple-2` | `#9b68ff` | Violet glow / hover. |
| `--gold` | `#ffd166` | Premium accent — prices, primary CTAs, "deal" pills. |
| `--cyan` | `#bffcff` | Cool secondary accent only. Use sparingly. |
| `--danger` / crimson | `#ff5f7d` and a deeper `#c8324a` if added | "Hell‑style" accents only on hot tags, the live dot, and the red "skip" action in the Embark‑ID modal. |
| `--text` | `#f7f5ff` | Body text. |
| `--muted` | `#b7b0df` | Secondary text. |

**Rules of the palette:**

- Dark purple, black, navy form the base. Violet glow is the signature.
- Gold is the premium highlight. Use it for the price text, the primary "Add to Cart" / "Copy Discord Ticket" buttons, and the deal/sale chip.
- Crimson is a controlled accent. Never a primary surface, never a button background larger than a small chip, never a card border on a default state. Use it for the "HOT" ribbon, the live order pulse dot, and the destructive/skip action in the Embark‑ID modal.
- Lime / electric green is **not** an ElysiumBoost color. If you see it in a card border, button gradient, or active state, replace it with gold or violet.
- Cyan is a cool counterpoint only. Don't use cyan on prices, CTAs, or category cards.

### Typography

- Display font: `Rajdhani` (loaded from Google Fonts) — used for titles, prices, category labels, card headings. Uppercase, wide tracking (`letter-spacing` 0.03em–0.08em).
- Body font: `Inter` — used for paragraphs, descriptions, form labels.
- Never introduce a third typeface.

### Surfaces & light

- Cards: dark violet‑navy gradient fill, 1px soft violet border (`--line`), inset 1px white highlight on top, large soft shadow (`0 18px 54px rgba(0,0,0,.26)`).
- Hover state: lift `translateY(-1px)` to `-3px`, brighten border to `--line-strong` (violet), optional gold or violet glow `box-shadow`.
- Glow is acceptable as a soft `box-shadow` or `radial-gradient` overlay. Avoid hard neon outlines.
- Background image treatment: every hero / game card background must read as moody and magical. Apply a `linear-gradient(rgba(5,3,13,.6), rgba(5,3,13,.88))` overlay so text is always legible.

### Motion

- Hover transitions: `.18s–.22s ease`. No bouncy springs.
- Animations like `tagFloat` and `softPulse` already exist — reuse them instead of inventing new keyframes.
- Never auto‑rotate carousels faster than 4 seconds per step. The existing `categoryMotion` auto‑scroll is the upper bound.

### Avoid

- Cheap template look (gradient buttons everywhere, stock icons, generic stock photos).
- Too much red. Crimson is a spice, not a sauce.
- Stretched images, letterboxed images, or `object-fit: contain` on product thumbs.
- Broken or missing asset paths.
- Unnecessary full rewrites.
- Removing or rewriting the cart/order/Discord pipeline.

---

## 3. Product card rules

Two card shapes exist. They are emitted by `cardMarkup(service, popular)` at `index.html:3303–3331`. Do not fork them into new variants — extend these.

### `.service-card` (vertical, used in the main grid)

- Min height `302px`; flexible width inside `.service-grid` (4 columns desktop, 2 at `≤1080px`, 1 at `≤720px`).
- Layout, top to bottom: thumbnail (aspect `340/270`, full width) → title → short description → footer with price (left) and CTA button (right).
- Title: Rajdhani uppercase, 23px, `letter-spacing: .04em`.
- Description: Inter, 14px, `color: var(--muted)`.
- Price: gold (`--gold`), Rajdhani, 26px, with optional `<del>` for the old price using the existing strike‑through styling.
- CTA: label is `"Details"`. Becomes `active` (violet gradient) when its service is the currently selected one.
- Hover: card lifts, border brightens to violet, thumbnail image scales `1.035` via the existing rule.

### `.popular-card` (horizontal, used in the "Popular Orders" strip)

- Min height `184px`. Grid head: 116px thumbnail (`grid-row: 1 / span 2`) + main column.
- Title: Rajdhani uppercase, 21px.
- Price: same gold treatment as `.service-card`, sits below the description.
- CTA: label is `"Customize"`. Right‑aligned at the bottom of the main column.

### Common card rules

- Always emit cards via `cardMarkup()`. Never write per‑card inline HTML in a render function.
- Every card must show: thumbnail, title, short blurb, price (or `CUSTOM` for private orders), one CTA.
- Every card thumbnail must come from the `serviceImages` lookup at `index.html:3105–3121` via `categoryArtwork(categoryId, label)`. If you add a new category, add its thumb file in `assets/` and a key in `serviceImages` in the same commit.
- Sale / deal indicators come from `serviceSaleBadge(service)` and `servicePrice(service)`. If a service has `oldUSD`, the old price is shown with the diagonal strike. Don't recompute discount badges in markup.
- Card top edge uses `::before` with a violet → gold → violet gradient (1 line of CSS). Never put green in that gradient.
- Never put more than one ribbon per card. Ribbons are positioned with `.cat-ribbon` and use the `hot / price-drop / recommended / new` tones at `index.html:475–514`.

---

## 4. Image fitting rules

Get this wrong and the site looks cheap immediately.

- **All product / category / game thumbnails use `object-fit: cover` with `object-position: center center`** inside a fixed‑aspect frame. The frame is the `.service-thumb` wrapper (`index.html:431–452`). Never set `object-fit: contain` on a thumbnail.
- The thumb container holds the aspect ratio. Cards must not control image sizing directly; they size `.category-thumb`, which sizes `.service-thumb`, which sizes the `<img>`.
- Hero backgrounds use `background-size: cover` with `var(--hero-position, center center)`. If a specific hero image needs a different focal point, set `heroPosition` on its entry in `games[]` (e.g. `"center 58%"` for Valorant), never inline on the markup.
- The page‑wide body background image (`body::before`) is the only image allowed to use `background-size: contain` — it's the watermark crest behind the whole page. Don't repurpose it.
- File formats:
  - All thumbs and backgrounds: **`.webp`**. The one legacy `.png` (`assorted-seeds.png`) should be converted to webp when convenient.
  - Logo / mark: `.webp` round at 42×42 in the topbar.
  - Audio: a single `.mp3` loop (`elysium-loop.mp3`). Don't add more.
- Sizing budget:
  - Hero backgrounds may be up to ~500 KB (the 4K webps already in `assets/`).
  - Thumbnails should be under ~150 KB. If a new thumb is heavier, re‑encode it.
- Loading:
  - Hero, currently selected category, brand mark, and visible cards above the fold: `loading="eager"`.
  - Cards below the fold and category strip items not currently scrolled into view: `loading="lazy"`.
- Never stretch. If an image's natural aspect ratio doesn't match the frame, cover‑crop it and adjust `object-position`. Don't squash with `width:100%; height:100%` without `object-fit: cover`.
- Alt text: every `<img>` must have an `alt` attribute. Use the user‑facing label (e.g. service `cardTitle`), not the filename. `escapeHtml()` is available for safety.

---

## 5. Cart / order flow — DO NOT BREAK

The cart and ticket pipeline is the heart of the business. **Preserve its existing logic byte‑for‑byte unless the user explicitly asks you to change it.**

### The pipeline (must stay this exact shape)

```text
Browse products  →  Add to cart  →  Copy Discord Ticket  →  Open Discord  →  Paste order
```

### Functions and elements that are load‑bearing

Touch these only with extreme care, and only if the user explicitly approves:

| Concern | Location | Notes |
| --- | --- | --- |
| Cart state | `state.cart` at `index.html:2722–2740` | Array of cart items. Shape: `{ id, game, title, details, total, oldTotal, custom, viewedCurrency, language }`. Do not rename fields. |
| Add to cart | `addToCart()` at `index.html:4251–4268` | Reads `calculate()`, pushes into `state.cart`, calls `renderCart()`, fires toast. |
| Render cart | `renderCart()` at `index.html:4270–4296` | Drives `#cartCount`, `#cartTotal`, `#cartUsdHint`, the drawer body, and per‑item remove buttons. |
| Clear / open / close | `clearCart()`, `openCart()`, `closeCart()` at `index.html:4298–4321` | Toggle `.cart-open` body class. |
| Pricing engine | `calculate()` + helpers at `index.html:4034–4244` | Returns `{ total, oldTotal, details, valid, custom }`. The detail string is what gets pasted into Discord. |
| Currency conversion | `rates` at `index.html:2463–2468`, `displayMoney()` / `displayInCurrency()` at `index.html:2751–2759` | Customers see local currency; the ticket carries that same currency in the receipt. |

### Cart UI rules

- The drawer is a single right‑side panel (`.drawer` inside `.cart-backdrop`). It opens by adding `.active` to the backdrop and `.cart-open` to `<body>`. Keep this pattern.
- Each cart item shows title, game, multi‑line details, and a price. The Remove button is the only per‑item control. Don't add quantity steppers without user approval — quantities are encoded inside the service form, not the cart row.
- "Copy Discord Ticket" must be the primary CTA in the drawer footer (gold gradient when re‑skinned). "Open Discord" is secondary. "Clear Cart" and "Leave Feedback" are tertiary.

---

## 6. Discord ticket flow

The site exists to produce a clean, pasteable Discord ticket. Don't break the format unless asked.

### Constants

- `DISCORD_URL` is defined once at `index.html:2461`. If a second Discord channel link is needed (e.g. feedback), declare it as a sibling constant — never repeat raw `discord.com/...` URLs in markup.
- Current ticket channel: `https://discord.com/channels/1499767937974669363/1499796035382415462`.

### Ticket text shape

Produced by `ticketText()` at `index.html:4376–4395`. Each ticket is plain text with this layout:

```text
ELYSIUM BOOST - ORDER TICKET
Discord Ticket: <DISCORD_URL>

ORDER ITEMS:
1. <Game> - <Service Title>
   - <detail line 1>
   - <detail line 2>
   ...
   Price: <currency-formatted total or CUSTOM>
   Currency: <viewedCurrency>

2. ...

TOTAL: <currency-formatted sum, with " + CUSTOM" suffix if any item is custom>
[Embark ID: <id>]            ← Arc Raiders carts only

Customer note: Please confirm availability, ETA, and final instructions in Discord.
```

### Copy flow

- `copyOrder()` → `ensureArcId()` → `copyOrderNow()` (Clipboard API with `execCommand('copy')` fallback) → status text in `#copyStatus`.
- The Arc Raiders Embark‑ID modal must be shown before copying or opening Discord whenever the cart contains an Arc Raiders item and the user has neither set an ID nor explicitly skipped. Logic lives in `cartNeedsArcId()`, `ensureArcId()`, and `openArcIdModal()` at `index.html:4323–4374`. Don't bypass this modal.
- After copying, do not auto‑open Discord. The user clicks "Open Discord" themselves — this is a deliberate two‑step so the customer can verify the clipboard.

### Adding new languages

- Translations live in `itemTr` (`index.html:2761–2845`), `uiTr` (`2847–2927`), and `orderTr` (`2929–2955`).
- All strings must be saved as proper UTF‑8 (e.g. Turkish `ç`, `ı`, `ö`, `ş`, `ü`, `Ç`, `İ`, `Ş`, `Ö`). Never paste Latin‑1‑mangled bytes (`Ã§`, `Ä±`, `Ã¶`, `ÅŸ`). If you see mojibake, fix it; don't extend it.
- The language switch is `state.language` (`EN` or `TR`). `ui()`, `trName()`, and `translateOrder()` are the only access points; render code must go through them.

---

## 7. Arc Raiders service style

Arc Raiders is the flagship game. It sets the tone for every other game added later.

### Catalog shape

Arc services are built with `arcService(id, category, title, cardTitle, icon, fromUSD, suffix, short, start, form, oldUSD)` at `index.html:2694–2700`. The Arc game entry is at `index.html:2637–2680`.

Categories (in display order, with their badges):

| Category id | Label | Badge |
| --- | --- | --- |
| `blueprints` | All Blueprints | HOT |
| `guns` | All Guns | PRICE DROP |
| `loadouts` | Custom Loadout | — |
| `coins` | Raider Coins | PRICE DROP |
| `seeds` | Assorted Seeds | NEW |
| `depositary` | Depositary Service | — |
| `trials` | Trials | RECOMMENDED |
| `raids` | All Raids | — |
| `coaching` | Coaching | — |
| `leveling` | Leveling | — |
| `workshop` | Workshop & Scrappy | RECOMMENDED |
| `bosses` | Boss & Puzzle | — |
| `expeditions` | Expedition Boost | HOT |
| `custom` | Private Order | — |

### Arc‑specific rules

- Every Arc service must have `oldUSD` filled in when a discount is intended. The strike‑through old price is rendered automatically by `servicePrice()`.
- The Arc "Popular Orders" strip rotates between `trials`, `guns`, `blueprints`, `coins` (see `games.arc.popular`), excluding whichever category is currently open.
- Detail panel intros come from `arcIntro(id)` at `index.html:2702–2720`. Keep the tone confident, brief, and oriented around "what the booster will do for you".
- The Embark‑ID modal (`#arcIdModal`) is mandatory for Arc carts. Its copy is translated in `updateArcIdModalText()` at `index.html:4335–4345`.
- Live order feed (`#orderFeed`) under the detail intro pulls from `recentOrders` at `index.html:2470–2496`. Keep it Arc‑themed and plausible. Don't add fake testimonials or invented player names.
- Visual signature for Arc: violet base, gold ribbons on HOT / RECOMMENDED categories, the deep amber thumbnail tint that already exists via `.cat-btn::before`. Don't tint Arc thumbnails green or pink.

### Adding a new Arc service

1. Add the thumb webp to `assets/` (≤150 KB, `cover`‑safe composition).
2. Add the key + path to `serviceImages` at `index.html:3105–3121`.
3. Add the category entry (if new) to `games.arc.categories`.
4. Add the service entry with `arcService(...)` to `games.arc.services`.
5. Add an intro line in `arcIntro()`.
6. If it changes pricing rules, extend `calculate()` — never add a parallel pricing function.

---

## 8. Engineering rules for agents

These are absolute. Break them and you'll break the site for paying customers.

### Inspect before editing

1. Read this file (`AGENTS.md`) before your first edit.
2. Read `index.html` end‑to‑end, or at minimum read the regions you intend to touch and the cart/ticket pipeline (`addToCart`, `calculate`, `ticketText`, `copyOrderNow`, `openDiscordTicket`).
3. List the existing assets in `assets/` before referencing or adding new ones.
4. If you intend to change a load‑bearing function from §5 or §6, restate the change in plain English and wait for the user to confirm.

### Do not break existing code

- Never delete the cart, the Discord ticket text, the Embark‑ID modal, the currency conversion, or the language switcher.
- Never rename DOM ids that JavaScript references (`gameTabs`, `categoryScroll`, `hero`, `homeContent`, `serviceContent`, `popularGrid`, `serviceGrid`, `detailSection`, `orderForm`, `liveTotal`, `usdHint`, `addToCart`, `cartOpen`, `cartClose`, `cartBackdrop`, `cartBody`, `cartTotal`, `cartUsdHint`, `copyOrder`, `clearCart`, `openDiscord`, `arcIdModal`, `arcIdInput`, `arcIdDone`, `arcIdSkip`, `toast`, `bgMusic`, `audioToggle`, `audioVolume`, `siteSearch`, `siteSearchBtn`, `siteSearchResults`, `currency`, `language`, `brandHome`).
- Never rename keys inside the `games[]` catalog (`id`, `label`, `tabIcon`, `heroBg`, `heroPosition`, `kicker`, `title`, `copy`, `categories`, `popular`, `services`) or inside service entries (`id`, `category`, `title`, `cardTitle`, `icon`, `fromUSD`, `oldUSD`, `suffix`, `short`, `intro`, `start`, `form`).
- Never rename cart item fields (`id`, `game`, `title`, `details`, `total`, `oldTotal`, `custom`, `viewedCurrency`, `language`).
- Never replace `navigator.clipboard.writeText` without keeping the `execCommand('copy')` fallback inside `copyOrderNow()`.
- Never remove the `<meta charset="utf-8">` declaration.
- Never introduce a build step, framework, bundler, or external runtime dependency without the user explicitly asking. The site stays static.
- Never add tracking, analytics, or third‑party scripts without explicit approval.

### Prefer small, surgical edits

- Edit existing CSS rules instead of duplicating them lower in the file.
- Extend existing render functions instead of writing parallel ones.
- Reuse existing CSS variables, helper functions (`$`, `val`, `num`, `slug`, `escapeHtml`, `ui`, `displayMoney`), and component classes.
- When fixing layout, prefer changing variables and the offending rule over rewriting whole selectors.
- One concept per commit. Don't bundle a Turkish‑translation fix with a topbar redesign.

### Always explain edited files after changes

At the end of every editing turn, produce a short report that includes:

1. **Files touched** — list each file you modified or created.
2. **What changed in each file** — for `index.html`, group by region (e.g. "CSS: `.service-card` recolored; JS: `renderHome()` gating updated; markup: none"). Cite line ranges using `index.html:start–end`.
3. **Why** — one sentence per change tying it back to the user's request or to a rule in this document.
4. **Risk / regressions to watch** — anything that could affect the cart, ticket, currency, or language switch.
5. **Follow‑ups** — anything you noticed but did not fix in this turn.

Keep the report tight. The user is reviewing a lot of work in a short window; don't pad it.

### Git hygiene

- Work on a feature branch named `cursor/<short-description>-<suffix>`. Never push to `main` directly.
- One logical change per commit, with a descriptive message in the imperative mood ("Recolor service cards to violet/gold").
- Push the branch and open a draft PR for any non‑trivial change.

---

## 9. Quick checklist (paste into your scratchpad before editing)

- [ ] I read `AGENTS.md` and the regions of `index.html` I'm about to change.
- [ ] My change does not rename a DOM id, a `games[]` key, or a cart item field.
- [ ] My change does not modify `addToCart`, `calculate`, `ticketText`, `copyOrderNow`, `openDiscordTicket`, `ensureArcId`, or the `state.cart` shape — or, if it does, the user explicitly approved it.
- [ ] My colors stay inside the dark‑purple / violet‑glow / gold / controlled‑crimson palette. No lime green.
- [ ] My new images are `.webp`, `cover`‑safe, under ~150 KB for thumbnails, and registered in `serviceImages` if they're category art.
- [ ] My new translated strings are saved as real UTF‑8, not Latin‑1 mojibake.
- [ ] I prepared a short post‑edit report listing files touched, line ranges, reasons, and risks.

# AGENTS.md — ELYSIUM BOOST · Claude Code Talimat Dosyası

Bu dosyayı okuyan her AI agent veya Claude Code oturumu
aşağıdaki kuralları eksiksiz uygular. Sormadan bilir.

---

## 1. PROJE KİMLİĞİ

**Site:** https://elysiumboost.com
**Repo:** GitHub Pages — vanilla HTML/CSS/JS SPA
**Branch:** main → otomatik deploy
**Teknoloji:** Sıfır framework. Webpack yok, build yok, npm sadece araç için.
**Deploy:** git push main → GitHub Pages canlıya alır

---

## 2. DOSYA YAPISI

```
/
├── index.html              ← TEK HTML DOSYASI. Tüm sayfa burada.
├── css/
│   ├── styles.css          ← ANA CSS. Değişkenler + tüm komponentler.
│   ├── order-center.css    ← Sepet drawer UX iyileştirmeleri
│   └── layout-system.css   ← Grid breakpoint overrides
├── js/
│   └── cart.js             ← TÜM UYGULAMA MANTIĞI. SPA engine burada.
├── assets/
│   ├── backgrounds/        ← Hero ve game card görselleri (.webp)
│   ├── thumb-*.webp        ← Servis kategori thumbnails
│   ├── rank-*.png          ← Valorant rank görselleri
│   └── assetselysiumlogo-transparent.webp ← Ana logo
├── tools/                  ← Yardımcı scriptler (siteye dokunmaz)
├── AGENTS.md               ← Bu dosya
└── CNAME                   ← elysiumboost.com
```

---

## 3. TASARIM SİSTEMİ — DEĞİŞTİRME, KULLAN

### Renk Değişkenleri (styles.css :root)
```css
--ely-bg: #0a0808              /* Zemin — koyu kırmızı-siyah */
--ely-gold: #d4af6e            /* Ana aksanı — altın */
--ely-bronze: #b8855a          /* İkincil aksanı — bronz */
--ely-gold-soft: rgba(212,175,110,0.35)
--ely-border: rgba(212,175,110,0.22)
--ely-border-strong: rgba(212,175,110,0.48)
--ely-text: #f3ead9            /* Ana metin — krem */
--ely-muted: #a89e8c           /* Soluk metin */
--ely-panel: rgba(18,15,20,0.65)   /* Glass panel */
--ely-panel-strong: rgba(18,15,20,0.82)
--ely-shadow: rgba(0,0,0,0.38)
--danger: #f43f5e
--crimson: #e11d48
```

### Tipografi
```css
--font: Inter, system-ui, sans-serif      /* Body metin */
--display: Rajdhani, Inter, sans-serif    /* Başlıklar, butonlar, nav */
```

**Kural:** Başlıklar, butonlar, nav linkleri, badge'ler → `font-family: var(--display)`
Body paragraflar, açıklamalar → `font-family: var(--font)`
Rajdhani her zaman UPPERCASE + letter-spacing ile kullanılır.

### Buton Hiyerarşisi
```css
.btn-premium   /* Altın gradient → ana CTA */
.btn-glass     /* Glassmorphism → ikincil */
.btn-green     /* Bronz-crimson gradient → satın al */
.btn           /* Base buton */
```

### Yeni Komponent Yazarken
- `var(--ely-*)` değişkenlerini kullan, hardcode renk yazma
- Arka plan: `var(--ely-panel)` + `backdrop-filter: blur(10px)`
- Border: `1px solid var(--ely-border)`
- Border radius: `var(--radius)` (= 8px) veya 10px, 12px
- Hover: `border-color: var(--ely-border-strong)` + subtle gold glow
- Yeni CSS değişkeni EKLEME — mevcutları kullan

---

## 4. UYGULAMA MİMARİSİ — ANLAMADAN DOKUNMA

### SPA Routing (cart.js)
```
URL hash → parseGameHash() → applyHashRouteToState()
         → renderAll() → tüm UI güncellenir
```

**Hash formatı:** `#game-slug/category-id`
- `#arc-raiders` → Arc Raiders, ilk kategori
- `#arc-raiders/coins` → Arc Raiders + Coins kategorisi
- `#valorant/rank-boosting` → Valorant + Rank Boosting

**GAME_HASH_SLUGS:** game ID → hash slug mapping
**selectGame(id):** oyun değiştirir, hash yazar
**selectCategory(id):** kategori değiştirir, hash'e /category ekler (replaceState)

### State Objesi
```javascript
state = {
  game: "arc",          // aktif oyun ID
  category: "coins",    // aktif kategori ID
  serviceId: "...",     // aktif servis ID
  cart: [],             // sepet ürünleri
  currency: "USD",      // aktif para birimi
  // + daha fazlası
}
```

### Render Akışı
```
renderAll()
  ├── renderGames()      → Services dropdown menüsü
  ├── renderHero()       → Hero section içeriği
  ├── renderHome()       → Ana sayfa game kartları
  ├── renderCategories() → Kategori şeridi
  ├── renderServices()   → Servis grid kartları
  ├── renderDetail()     → Sağ panel (form + fiyat)
  └── renderCart()       → Sepet drawer
```

### Oyunlar
| ID | Hash Slug | Durum |
|---|---|---|
| arc | arc-raiders | Aktif — birincil oyun |
| valorant | valorant | Aktif |
| lol | league-of-legends | Aktif |
| tft | tft | Aktif |
| wow | world-of-warcraft | Aktif |
| cs2 | cs2 | Aktif |
| social | social | Aktif |

---

## 5. DOKUNMA KURALLARI

### ❌ ASLA DOKUNMA
```
cart.js içindeki fiyat hesaplama fonksiyonları
  → calculateTotal(), updateTotal(), displayMoney()

cart.js içindeki form builder
  → buildForm(), wireForm()

Valorant rank sistemi
  → valorantEurToStoredTotal(), syncValorantPathRail()

Blueprint seçici
  → renderBlueprintTabs(), bpContent

Tüm prices objesi
  → prices.raid, prices.coins100k vb.

games array ve services array
  → oyun/servis verileri

Discord ticket sistemi
  → buildTicketText(), copyOrder

cart.js'in genel yapısı — fonksiyon sırası, scope, IIFE wrapper
```

### ✅ GÜVENLİ DOKUNMA ALANLARI
```
index.html → yeni section, yeni HTML blok ekleme
styles.css → yeni class ekleme (mevcut class değiştirme dikkatli)
order-center.css → sepet UX iyileştirmeleri
Görsel asset ekleme/değiştirme
Metin içerikleri (review metinleri, FAQ, about vb.)
cart.js sonuna yeni bağımsız fonksiyon ekleme (IIFE içinde değil)
```

---

## 6. CSS YAZIM KURALLARI

```css
/* YENİ KOMPONENT ŞABLONU */
.ely-[komponent-adi] {
  /* Temel layout */
  display: flex;
  
  /* Spacing — px iç, rem dış */
  padding: 14px 16px;
  margin-bottom: 1.5rem;
  
  /* Görünüm — daima değişken kullan */
  background: var(--ely-panel);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--ely-border);
  border-radius: 12px;
  
  /* Tipografi */
  font-family: var(--display);
  color: var(--ely-text);
  
  /* Transition */
  transition: border-color .2s ease, box-shadow .2s ease;
}

.ely-[komponent-adi]:hover {
  border-color: var(--ely-border-strong);
  box-shadow: 0 0 20px rgba(212, 175, 110, .1);
}
```

**Prefix kuralı:** Tüm yeni class'lar `ely-` ile başlar.
Mevcut class'lara (`.btn`, `.cat-btn`, `.service-card` vb.) dokunmadan önce sor.

---

## 7. GERÇEK VERİLER

```
Tamamlanan sipariş sayısı: 2,000+
Discord üye sayısı: 100+
Discord rating: 4.9/5
Trustpilot URL: https://www.trustpilot.com/review/elysiumboost.com
Discord URL: https://discord.gg/elysiumgg
```

Review kartlarında gerçek veriler kullanılır.
Asla "Lorem ipsum" veya tamamen uydurma içerik ekleme.

---

## 8. TAMAMLANAN İŞLER (dokunma)

- [x] Temel SPA mimarisi ve routing
- [x] Çoklu oyun sistemi (arc, valorant, lol, tft, wow, cs2)
- [x] Hash sub-routing: `#game/category`
- [x] Valorant rank path hesaplayıcı (EUR bazlı)
- [x] Arc Raiders: blueprint, coin, seed, raid, loadout, boss sistemleri
- [x] Çoklu döviz (USD, EUR, GBP, TRY)
- [x] Kategori drag-scroll + auto-scroll
- [x] 2-kolon sticky order card layout
- [x] Discord ticket + receipt sistemi
- [x] Responsive breakpoints (1080px, 720px, 520px)

---

## 9. AÇIK GÖREVLER (Phase 1)

### 9.1 Sosyal Kanıt Sayaçları
- [ ] Hero section'a animated counter ekle (2000+, 100+, 4.9★)
- [ ] IntersectionObserver ile tetikle
- [ ] CSS: `.ely-trust-counters` glass panel

### 9.2 Review Kartları
- [ ] 3 anonim article → gerçekçi kart
- [ ] Avatar (initials) + isim + oyun + tarih + yıldız + Verified badge
- [ ] CSS: `.ely-review-card`, `.ely-review-avatar`

### 9.3 Trustpilot Bağlantısı
- [ ] `home-review-score` span → yeşil pill link
- [ ] Trustpilot logosu + dış link ikonu

### 9.4 Footer Yenileme
- [ ] Brand + istatistikler + trust badge'ler + Discord butonu
- [ ] `© 2025 Elysium Boost` alt satır

### 9.5 Hero Sosyal Kanıt Bandı
- [ ] CTA altına küçük sosyal kanıt satırı
- [ ] Trustpilot link + order sayısı + Discord üyesi

---

## 10. TEST PROTOKOLÜ

Her değişiklikten sonra şunları kontrol et:

```
[ ] Ana sayfa yükleniyor (konsol hatası yok)
[ ] Services dropdown açılıyor
[ ] Oyun seçimi çalışıyor (arc, valorant, lol)
[ ] Kategori geçişi URL'i güncelliyor (#arc-raiders/coins)
[ ] Bu URL yeniden yüklendiğinde aynı kategori açılıyor
[ ] Fiyat hesaplayıcı çalışıyor
[ ] Sepete ekle çalışıyor
[ ] Ticket kopyalama çalışıyor
[ ] Döviz değişimi çalışıyor
[ ] Mobil görünüm bozulmadı (720px altı)
```

---

## 11. HATA DURUMUNDA

Bir şey beklenmedik davranıyorsa:
1. Önce `cart.js`'e bak — büyük ihtimal orada
2. `renderAll()` çağrıldı mı kontrol et
3. State güncel mi kontrol et
4. Console'da `state` yaz, anlık durumu gör
5. Hash'i elle değiştir, routing çalışıyor mu test et

Eğer fiyatlar yanlış görünüyorsa: `prices` objesine veya
`calculateTotal()` fonksiyonuna dokunmadan önce kullanıcıya sor.

---

## 12. COMMIT MESAJI FORMATI

```
feat: sosyal kanıt sayaçları eklendi
fix: valorant kategori hash routing düzeltildi
style: review kartları gerçekçi hale getirildi
refactor: footer yeniden yapılandırıldı
```

---

*Son güncelleme: Phase 1 başlangıcı*
*Bu dosyayı her büyük değişiklikten sonra güncelle.*
