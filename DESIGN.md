# ElysiumBoost Design System

Extracted from the current implemented site (`index.html`, `pages/games/arc-raiders.html`, `pages/games/valorant.html`, and all `css/*.css`). This document is the visual source of truth. Do not invent tokens, fonts, radii, or shadows that are not listed here. When in doubt, reuse the referenced components verbatim.

This file pairs with `CLAUDE.md` (project memory and rules). Read both before any UI work.

---

## 1. Brand Feel

ElysiumBoost is a premium dark/gold gaming boost service. The visual register is:

- Dark premium gaming.
- Gold/amber luxury accents on warm-tinted near-black surfaces.
- Cinematic, sharp, architectural panels.
- Clean, expensive, trustworthy. Manual service, no cheats, fast support.
- Mono uppercase labels for metadata. Display uppercase headings.
- Travelling-line gold comet as the iconic interactive signature.
- Never generic SaaS. Never generic ecommerce. Never washed out. Never bright neutral white.

The site is brand register: design IS the product.

---

## 2. Real CSS Variables / Tokens

Defined in `css/global.css:17-47`. Do not introduce new color or font variables without checking these first.

### Backgrounds (warm-tinted, never pure black)
```
--bg        #0a0805
--bg-2      #100b07
--bg-3      #18110a
--bg-card   #120c08
```

### Gold ramp + glows
```
--gold        #c9a84c
--gold-bright #e5c26b
--gold-deep   #8a7224
--gold-glow   rgba(201, 168, 76, 0.42)
--gold-soft   rgba(201, 168, 76, 0.14)
--amber       #d97757
--amber-glow  rgba(217, 119, 87, 0.32)
```

### Text ramp (warm cream, never pure white)
```
--text       #efe6cf
--text-soft  rgba(239, 230, 207, 0.72)
--text-dim   rgba(239, 230, 207, 0.48)
--text-faint rgba(239, 230, 207, 0.28)
```

### Lines (two flavors only)
```
--line       rgba(201, 168, 76, 0.18)   structural panel edges (gold-tinted)
--line-soft  rgba(239, 230, 207, 0.08)  internal dividers, soft separators (warm-cream)
```

### Page-local accents (use only on their own page)
```
--arc-rust       #d4571b
--arc-rust-glow  rgba(212, 87, 27, 0.32)
--val-red        #ff4655          (Valorant only, css/valorant.css:12)
--val-red-soft   rgba(255, 70, 85, 0.14)
--val-red-glow   rgba(255, 70, 85, 0.35)
```

### Type stack
```
--f-display  "Space Grotesk", "Rajdhani", "Plus Jakarta Sans", system-ui, sans-serif
--f-body     "Space Grotesk", "Plus Jakarta Sans", system-ui, sans-serif
--f-mono     "JetBrains Mono", ui-monospace, monospace
```

`Space Grotesk` is loaded via Google Fonts at the top of `css/global.css`. `JetBrains Mono` is loaded elsewhere in the page.

---

## 3. Typography Rules

The site uses two voices: **mono for labels/keys/metadata**, **display for values/headings/buttons**. Body font is reserved for paragraphs.

| Pattern | Recipe | Real selector |
|---|---|---|
| Eyebrow label | `var(--f-mono) 10-11px / letter-spacing 0.32em / uppercase / color var(--gold)`, with `::before` 5-6px rotated-45 gold square marker | `.eb-label` (global.css:97), `.arc-info-eyebrow` (arc-raiders.css:82), `.val-summary-block-label` (valorant.css:415), `.eb-cart-block-label` (styles.css cart V2) |
| Section heading | `var(--f-display) 600-700 / clamp(36px, 4vw, 52px) / 0.005em / uppercase / color var(--text)` | `.eb-h2` (global.css:119), `.val-step-title` (valorant.css:156), `.arc-title` (arc-raiders.css:145) |
| Hero h1 | `var(--f-display) 700 / clamp(56px, 8vw, 120px) / line-height 1.0 / -0.005em / uppercase`. Optional outlined variant on landing only via `body.tw-title-outlined`. | `.eb-h1` (global.css:108) |
| Small metadata row | `var(--f-mono) 10-11px / 0.24-0.32em / uppercase / color var(--text-dim)` with optional 6px dot or 5px rotated square | `.arc-meta-row` (arc-raiders.css:158), `.val-hero-meta` (valorant.css:59), `.eb-cart-row .eb-cart-k` |
| Display value (price, total, big number) | `var(--f-display) 700 / 26-40px / color var(--gold-bright) / font-variant-numeric: tabular-nums`. Cents at half size in `var(--gold)`. | `.val-total .v` (valorant.css:510 = 40px), `.eb-cart-total-v` (32px), `.arc-info-stats .num` (26px), `.val-reviews-head .big` (28px) |
| Body paragraph | `var(--f-body) 16px / line-height 1.7 / color var(--text-soft) / max-width 56ch` | `.eb-body` (global.css:128) |
| Button label | `var(--f-display) 600-700 / 12-14px / 0.20-0.28em / uppercase / white-space nowrap` | `.eb-btn` (global.css:144), `.val-tab` (valorant.css:98), `.eb-cart-checkout` |

**Rules**
- Mono for keys, labels, eyebrows, badges, chips, metadata, timer counters.
- Display for values, headings, buttons, item names, totals.
- Body only for paragraph copy. Never for summary keys.
- Cap body line length at ~56ch (`.eb-body` enforces this).
- Use letter-spacing aggressively for uppercase labels (0.24-0.32em). Tighter on hero h1 (-0.005em).
- The landing hero outlined-text variant is landing-only. Other pages reuse `.eb-h2` scale.

---

## 4. Shape / Radius / Border Rules

The site is **sharp and architectural**. Two-tier border, narrow radii.

### Radii (only these values appear)
| Radius | Use | Example |
|---|---|---|
| `0` | Maps, hero containers, fullscreen panels | `.arc-hub--fullscreen` |
| `2px` | Sharp inner panels, summary rows, promo wraps, HUD chips, val-summary internals | `.val-summary-mode button`, `.val-summary-addon`, `.eb-cart-rows`, `.eb-cart-promo`, `.arc-hub-hud` |
| `3px` | Primary panels and buttons, cart trigger, search input, val-tab, val-rank, val-summary outer | `.eb-cart`, `.val-tab`, `.val-rank`, `.val-summary`, `.drawer.eb-cart-panel` |
| `4px` | Site primary buttons | `.eb-btn`, `.eb-btn-primary` |
| `5px` | Cart trace ring (sits 2px outside the 3px cart button) | `.eb-cart > .arc-hot-trace` |
| `50%` | Avatars, dots, marker dots | `.val-avatar`, `.eb-cart-dot` |
| `999px` | Reserved: glass sign-in capsule, floating toast | `.eb-signin`, `.eb-toast` |

**Anything 8-18px belongs to legacy code and is being phased out.** Do not introduce new 8-18px radii.

### Borders (two flavors only)
```
1px solid var(--line)       structural panel edges (gold-tinted, "outer")
1px solid var(--line-soft)  internal dividers, ghost panels (warm-cream, "inner")
```

### The left-accent stripe (canonical row affordance)
```css
border-left: 3px solid transparent;          /* default */
border-left-color: var(--gold);              /* on hover/active */
```

Used everywhere a row should "select": `.val-summary-mode button`, `.val-summary-addon`, `.arc-sidebar-item`, `.eb-cart-empty`, `.eb-cart-member`.

### Spacing
- Sections: `padding: 110px 0;` (mobile `72px`) via `.eb-section` (global.css:93).
- Container: `max-width: 1360px; padding: 0 48px;` via `.eb-container` (mobile `24px`).
- Panel internal padding: 16-28px depending on density.
- Use line separators and section rhythm. Avoid wrapping content in large empty boxes.

---

## 5. Shadow / Glow Rules

Three genuine recipes appear in the codebase. Reuse these. Do not invent new shadow stacks.

### A) Gold-halo premium panel (panels with weight)
```css
box-shadow:
  0 32px 80px -28px rgba(0, 0, 0, 0.7),
  0 0 60px -20px var(--gold-glow);
```
Used on `.val-summary` (valorant.css:386) and `.drawer.eb-cart-panel` (cart V2).

### B) Inset gold-glow button hover
```css
box-shadow:
  0 0 32px -8px var(--gold-glow),
  inset 0 0 32px -16px var(--gold-glow);
```
Used on `.eb-btn:hover` (global.css:158).

### C) Soft drop on cards
```css
box-shadow:
  0 32px 80px -24px rgba(0, 0, 0, 0.7),
  0 0 0 1px rgba(229, 194, 107, 0.06) inset;
```
Used on `.arc-hub` (arc-raiders.css:181).

### D) Primary CTA depth (gold)
```css
box-shadow:
  0 1px 0 rgba(255, 220, 150, 0.45) inset,
  0 12px 28px -12px var(--gold-glow);
```
Used on `.eb-btn-primary` (global.css:165).

**Rules**
- Long-throw shadows only (-20 to -28px y-offset, 60-80px blur). No flat `0 4px 12px` SaaS shadows.
- Gold glow halo is reserved for: large panels (val-summary, cart V2) and primary CTAs.
- One halo per element. Never stack two halos on the same surface.
- Hover should add brightness or a subtle ring, not crank up new shadows.

---

## 6. Iconic Site Signatures

These signatures must appear on any new component that wants to feel native to the site. Do not invent alternatives.

### A) Travelling-line trace (`.arc-hot-trace`)
Defined in `css/components.css:678` with the supporting `@property --arc-trace-angle` declared in `css/global.css:10`.

```
position: absolute; inset: 0;
padding: 1.5px;
background: conic-gradient(from var(--arc-trace-angle, 0deg), ...gold ramp...);
mask-composite: exclude;
animation: arc-trace-spin 2.7s linear infinite;
filter: drop-shadow(0 0 4px rgba(201, 168, 76, 0.55));
```

- 2.7s on hotspot pills (`.arc-hot`).
- 4.5s on slower controls (cart, nav search, val-summary).
- Always declare `@property --arc-trace-angle` on any page that uses it. Without `@property`, the angle does not animate.
- Use on: cart trigger, hotspot pills, val-summary when it has items, nav search input when open, val-summary-mode/addon when active.
- Do not use on tiny static controls (5x5 chips, single icons). It looks cramped.
- The cart-trigger trace sits 2px outside the 3px button (`inset: -3px; padding: 2px; border-radius: 5px;` per `components.css:177`) so the comet shows against the page background, not the box edge.

### B) Diamond marker block label
Every block label uses a `::before` 5-6px gold square rotated 45 degrees:

```css
::before {
  content: "";
  width: 5px; height: 5px;
  background: var(--gold);
  transform: rotate(45deg);
}
```

Used in: `.eb-label`, `.arc-info-eyebrow`, `.val-summary-block-label`, `.eb-cart-block-label`, `.eb-cart-empty-label`, `.arc-info-stats .sep`.

### C) Left-accent row
The 3px transparent-to-gold left border, paired with sharp 2px radius and an inset dark background, is the canonical "selectable row" pattern.

```css
padding: 11px 12px 11px 14px;
background: rgba(0, 0, 0, 0.22);
border: 1px solid var(--line-soft);
border-left: 3px solid transparent;
border-radius: 2px;
```
Hover/active: `border-color: var(--gold); border-left-color: var(--gold); background: rgba(201, 168, 76, 0.08);`

Used in: `.val-summary-mode button`, `.val-summary-addon`, `.arc-sidebar-item` (via background fill), `.eb-cart-empty`, `.eb-cart-member`.

### D) Gold halo panel
Recipe A from section 5. The combination of warm dark gradient background + `--line` border + long-throw black drop + 60px gold glow halo signals "premium summary panel." Reserve for the highest-tier surfaces: val-summary, cart V2 dropdown, future high-stakes panels.

### E) Eyebrow + title head pattern
A small mono eyebrow stacked above the display title. Repeated across pages.

```html
<div class="head-title">
  <span class="eyebrow">Order</span>
  <h2>Order Summary</h2>
</div>
```

```css
.eyebrow { font: var(--f-mono) / 10px / letter-spacing 0.32em / uppercase / color var(--gold); }
h2       { font: var(--f-display) / 14-17px / letter-spacing 0.14em / uppercase / color var(--text); }
```

Live in: `.eb-cart-head`, `.val-step-head`, `.arc-info` head, `.val-hero` head.

---

## 7. Source-of-Truth Components (reuse these by file:line)

When building anything new, copy the language of these existing components. Do not start from external references.

| Component | File | Class |
|---|---|---|
| Valorant summary panel | `css/valorant.css:380` | `.val-summary` (head, scroll body, foot. Long-throw shadow + gold halo. The reference for any summary surface.) |
| Valorant summary block label | `css/valorant.css:415` | `.val-summary-block-label` (diamond marker + mono 10px 0.32em gold) |
| Valorant mode toggle row | `css/valorant.css:427` | `.val-summary-mode button` (left-accent, sharp 2px, display name + mono desc + corner pill) |
| Valorant add-on row | `css/valorant.css:456` | `.val-summary-addon` (3-col grid: checkbox + name/desc + badge. Left-accent. Sharp 2px.) |
| Valorant total | `css/valorant.css:505` | `.val-total .v` (40px display gold-bright with `.cents` at 20px in `--gold`) |
| Valorant primary CTA | `css/valorant.css:515` | `.val-cta` (full-width, 16px padding, letter-spacing 0.28em, mono 14px uppercase) |
| Valorant trust strip | `css/valorant.css:516` | `.val-trust` (mono 9px 0.24em uppercase text-dim with 1px vertical separators) |
| Valorant route panel | `css/valorant.css:525` | `.val-route` (sharp 3px panel with dark inset bg + two rank tiles + center arrow) |
| Valorant tab strip | `css/valorant.css:98` | `.val-tab` / `.val-tab.active` (red underline on active, gold border) |
| Valorant rank tile | `css/valorant.css:177` | `.val-rank` (sharp 3px, radial-gradient tier color, red bottom accent on active) |
| Valorant step card | `css/valorant.css:143` | `.val-step` (28px padding, eyebrow + title + sub head pattern) |
| Arc Raiders hub map | `css/arc-raiders.css:173` | `.arc-hub` (vignette + scan lines + corner HUD + frame brackets) |
| Arc Raiders hotspot pill | `css/arc-raiders.css:267` | `.arc-hot` (dot + line + pill + travelling-line trace on hover/active) |
| Arc Raiders HUD chip | `css/arc-raiders.css:224` | `.arc-hub-hud` / `.arc-hub-hud-r` (sharp 2px, mono 10px 0.28em, optional pulsing dot) |
| Arc Raiders sidebar | `css/arc-raiders.css:421` | `.arc-sidebar` (280px slide-in, mono section labels, gold-soft hover fill + left border) |
| Arc Raiders sidebar row | `css/arc-raiders.css:471` | `.arc-sidebar-item` (32px icon frame + display 13px 0.16em uppercase name + arrow chevron) |
| Nav shell | `css/components.css:10` | `.eb-nav` (3-col grid, backdrop-filter blur, gold-tinted gradient base) |
| Nav cart button | `css/components.css:89` | `.eb-cart` (38x38 sharp 3px, trace at inset:-3px) |
| Nav cart dot | `css/components.css:99` | `.eb-cart-dot` (16x16 gold circle, mono 9px count, dark text) |
| Nav search | `css/components.css:184` | `.eb-search-toggle` + `.eb-search-dropdown` (sharp 3px backdrop-blur dropdown) |
| Nav currency | `css/components.css:138` | `select.eb-currency` (transparent, sharp 3px, mono 10-11px) |
| Sign-in glass capsule | `css/components.css:286` | `.eb-signin` (999px pill with 3 drifting brand-tinted blobs behind blur + outside-right `.eb-signin-sub` "LOGIN" link) |
| Cart V2 dropdown | `css/styles.css` (post-`/* EB CART V2 */`) | `.drawer.eb-cart-panel`, `.eb-cart-head`, `.eb-cart-foot`, `.eb-cart-summary`, `.eb-cart-total`, `.eb-cart-promo`, `.eb-cart-actions`, `.eb-cart-trust`, `.eb-cart-receipt`, `.cart-empty-card.eb-cart-empty` |
| Primary CTA (gold) | `css/global.css:162` | `.eb-btn-primary` (gold gradient + inset highlight + gold-glow drop) |
| Secondary CTA (outline) | `css/global.css:144` | `.eb-btn` (transparent + line border + inset gold-glow on hover) |
| Shield card | `css/components.css:471` | `.val-shield-card` (28px padding, 44px gold-bordered mark, mono body) |
| Features grid | `css/components.css:504` | `.eb-features` (2-col, gold top-border per item, numbered) |
| Reviews rail | `css/components.css:547` | `.val-review` (gold avatar, verified pill, mono meta with gold separator) |
| FAQ accordion | `css/components.css:624` | `.eb-faq-row` (gold accent on open, rotating plus icon) |
| Footer | `css/components.css:414` | `.eb-footer` (3-col, gold border-top, mono base bar) |
| Travelling-line trace | `css/components.css:678` | `.arc-hot-trace` (with `@property --arc-trace-angle` from global.css:10) |
| Landing hero | `css/styles.css:11948` | `.eb-hero` (full-bleed video + tint + fade + vignette + haze + scroll hint) |

---

## 8. What Makes the UI Look Premium

1. Sharp 2-4px radii. Architectural panel edges, not soft SaaS pillows.
2. Mono uppercase labels with 0.24-0.32em letter-spacing. Never body-font lowercase keys.
3. Display values 26-40px in `var(--gold-bright)` for totals and big numbers.
4. Warm-tinted dark backgrounds (`#0a0805`, `#100b07`). Never pure black.
5. Warm cream text (`#efe6cf`). Never pure white.
6. Two-tier border system: `--line` (gold) outside, `--line-soft` (cream) inside.
7. Gold-halo shadow (`0 0 60px -20px var(--gold-glow)`) on premium panels.
8. Diamond marker prefix on every block label.
9. Left-accent stripe row pattern for selectable lists.
10. Travelling-line gold comet wrapping interactive frames at hover or active.
11. Eyebrow + title head pattern instead of a single oversized h2.
12. Long-throw shadows (`-20 to -28px y-offset, 60-80px blur`).
13. Compact, tightly-tracked uppercase buttons with `var(--f-display)` 600-700.
14. Tabular-nums on prices so they line up.
15. Single intentional glass surface per page (nav + sign-in only).

---

## 9. What Makes the UI Look Cheap / Anti-Patterns

These break the visual register. The audit and visual-fix skills should call them out on sight.

1. `border-radius: 8-18px` on panels, rows, buttons. Reads Stripe, Shopify, generic SaaS.
2. Pure `#000` or pure `#fff` anywhere.
3. Body-font lowercase keys ("Total items", "Subtotal" in body sans-serif). The site uses mono uppercase keys.
4. Filled green or blue checkout buttons. The site uses `.eb-btn-primary` gold gradient.
5. Generic drop shadows like `0 4px 12px rgba(0,0,0,0.1)`. Washed and small.
6. Glow spam on every element. Halos are reserved for panels and totals.
7. Random radial-gradient overlays on heroes. The hero uses scoped haze + vignette + corner HUD.
8. Stacked `backdrop-filter: blur()` on multiple layers. CLAUDE.md bans this. Nav and sign-in are the only intentional glass.
9. Circle icon + centered SaaS sub-copy empty cards. The site uses sharp tile + diamond label + body sub.
10. Em dashes in headings and copy. Banned by CLAUDE.md and impeccable. Use commas, colons, semicolons, periods, or parentheses.
11. Untokened colors (raw hex not mapped to `--gold*`, `--amber*`, `--arc-rust*`, `--val-red*`, `--text*`, `--bg*`).
12. Full-height drawers as default. The site cart is a dropdown anchored under the nav cart button. Full-height is mobile-only.
13. Floating outer halos around tiny buttons. Looks like glow spam.
14. Duplicated travelling-line traces in the same composition.
15. Bouncing/elastic motion. The site uses ease-out exponential curves only.
16. Inline styles. Banned by CLAUDE.md.

### How to avoid cheap/generic UI
- Open the source-of-truth component table (section 7). Find the closest existing component. Copy its CSS pattern.
- Check the radius. If it is not 0, 2, 3, 4, or 5px, rewrite.
- Check the label font. If it is not mono uppercase 0.24-0.32em, rewrite.
- Check the value font. If it is not display 700 with `var(--gold-bright)` on totals, rewrite.
- Check colors against the variable list (section 2). If a hex value is not in the list, replace with the closest token.
- Check the shadow. If it is not one of the four recipes in section 5, rewrite.
- Run the impeccable AI-slop test: if the component could be guessed as "SaaS dashboard" or "ecommerce cart" from category alone, rework the structure (not just the colors).
- Reuse the diamond marker + left-accent stripe + eyebrow+title head signatures wherever they fit.
- If you are about to write your fourth `box-shadow` on one element, stop. Use one recipe.
- If you cannot make the component feel native by reusing existing patterns, the brief is wrong, not the design system.

---

## 10. Cart Design Rules

The cart must feel native to ElysiumBoost. Reference: cart V2 dropdown in `css/styles.css` (post-`/* EB CART V2 */` block).

### Use white cart references only for information hierarchy
Acceptable from white references: summary title, item count, subtotal, taxes/discount, final payment, promo input, checkout buttons.

Never copy white/light visual style. The visual style comes from `.val-summary` + `.arc-sidebar-item` + `.eb-cart` + cart V2.

### Hard requirements
- Compact dropdown anchored under the nav cart button. Not a full-height drawer.
- `max-height: min(78svh, 640px)`. `width: min(420px, 100%)` (480px when items present).
- Dark/gold warm-tinted gradient background. Border `1px solid var(--line)`. Radius `3px`.
- Gold-halo shadow (recipe A from section 5).
- Header: eyebrow ("Order") + h2 ("Order Summary") + sharp clear-cart pill + 28x28 sharp 2px close.
- Summary rows: enclosed in `1px solid var(--line-soft)` + `2px radius` + `rgba(0,0,0,0.22)` inset. Mono 10px 0.24em keys. Display 13px values. Muted `--text-dim` for placeholder rows (taxes, discount).
- Final payment: display 32px `var(--gold-bright)` with tabular-nums. Separated by `border-top: 1px solid var(--line-soft)`.
- Promo: sharp 2px wrap, transparent input with mono 10px 0.18em placeholder, gold outlined `APPLY` pill (mono 10px 0.24em uppercase). Hidden when cart is empty.
- CHECKOUT: full-width `.eb-btn-primary` with letter-spacing 0.28em. Disabled and grayscale when empty.
- MEMBER CHECKOUT: `.val-summary-mode button` language (transparent, sharp 2px, left-accent stripe on hover).
- Trust strip: `.val-trust` pattern (`MANUAL · NO CHEATS · DISCORD CONFIRMED` in mono 9px 0.24em uppercase with 1px vertical separators).
- Empty cart tile: sharp 2px, `border-left: 3px solid var(--gold)`, dark inset bg, diamond + mono "CART EMPTY" label, single body sub, single "BROWSE GAMES" button in val-summary-mode language.
- Preserve all element IDs: `cartItemsCount`, `cartSubtotalAmt`, `cartTaxAmt`, `cartDiscountAmt`, `cartTotal`, `cartPromoInput`, `cartPromoApply`, `copyOrder`, `memberCheckout`, `cartFootAlerts`, `downloadOrderReceipt`, `cartBackdrop`, `cartBody`, `cartDrawerFoot`, `orderCheckoutStrip`, `clearCart`, `cartClose`.
- Preserve all cart logic: state, math, currency display, qty/remove/edit, copyOrder + Discord flow, receipt download, clear cart, persist, sticky chip.

### Banned
- Full-height drawer geometry.
- Rounded 10-16px radii anywhere in the panel.
- Soft body-font keys.
- Filled green/blue CHECKOUT.
- Generic empty-state with circular SaaS icon.
- Stacked backdrop-filter.

---

## 11. Nav Design Rules

Reference: `css/components.css` lines 10-409. Shared across `index.html`, `pages/games/arc-raiders.html`, `pages/games/valorant.html`.

- Layout: `.eb-nav` is `position: fixed`, `display: grid; grid-template-columns: 1fr auto 1fr`, padded 10px x 48px, single intentional backdrop-blur layer.
- Scrolled state: `.eb-nav.eb-scrolled` tightens padding and adds the `--line` border-bottom.
- Logo: 52x52 bare image, no circle frame (overridden in `.eb-nav .eb-logo-mark`). Wordmark: name 19px display 0.22em, tag 10px mono 0.32em gold. Both right-aligned against the logo box.
- Nav links: mono 11px 0.24em uppercase text-soft, gold-bright on hover with animated underline.
- Currency: `select.eb-currency` transparent with sharp 3px `--line-soft` border.
- Cart trigger `.eb-cart`: 38x38, sharp 3px, with travelling-line trace at `inset: -3px` outside the border.
- Search: toggle button + 360px sharp 3px dropdown with backdrop-blur. Travelling-line trace appears on the input when open.
- Sign-in `.eb-signin`: 999px glass capsule with three drifting blobs (gold, amber, ember). Outside-right `.eb-signin-sub` "LOGIN" text-link in mono 10px 0.32em gold.
- Toast `.eb-toast`: floating pill at bottom-center, mono 12px 0.2em uppercase gold-bright on dark blur.

### Preserve across nav changes
- Search behavior (toggle + dropdown).
- Cart behavior (open/close, click-outside, count badge).
- Currency change (state.currency wire-up).
- Routing (no link target changes).
- Mobile collapse: at `max-width: 1100px` `.eb-links`, `.eb-currency`, `.eb-search-wrap` hide.

### Banned
- Re-adding the circle logo frame.
- Adding a second backdrop-blur layer.
- Improvised cart traces. Use `.eb-cart > .arc-hot-trace` recipe verbatim.
- New nav buttons that do not match `.eb-btn`, `.eb-signin`, or sharp-3px-icon-button vocabulary.

---

## 12. Arc Raiders Design Rules

Reference: `css/arc-raiders.css`. The Arc Raiders page is one of the strongest design surfaces on the site.

### Preserve
- Dark Speranza atmosphere: vignette + scan lines + corner HUD chips + frame brackets on `.arc-hub`.
- Hotspot pills (`.arc-hot`) with dot + line + label + travelling-line trace on hover/active.
- Sidebar (`.arc-sidebar`) 280px slide-in with mono section labels and 32x32 icon frames.
- Sidebar item icon transparency: `mix-blend-mode: screen` (CLAUDE.md known fix, applied at `components.css:710`).
- Order flow stability. Do not touch product/pricing logic during visual fixes.

### Banned
- Remigrating the Arc Raiders page.
- Stacked backdrop-filter on the hub or sidebar.
- Brightening or washing out the Speranza atmosphere.
- Re-adding `orderpanelbg.webp` (CLAUDE.md ban).
- Adding new bright accent colors. Stay within `--gold*`, `--arc-rust*`, `--text*`.

### Open
- Hotspot positions still need final visual alignment against the reference screenshot (see CLAUDE.md pending fixes).

---

## 13. Valorant Design Rules

Reference: `css/valorant.css`. The configurator + summary panel are the canonical reference for any cart, summary, or configurator surface on the site.

### Preserve
- Dark tactical red/gold style: `--val-red` reserved for Valorant page accents (active tab underline, rank active marker, hero h1 underline).
- Functional configurator: tabs (`.val-tab`), rank tiles (`.val-rank`), summary panel (`.val-summary`), summary mode/addon rows, route visual.
- Performance: add-on clicks and tab clicks must not freeze the page. Use `mount.onclick = fn` property assignment, not stacked `addEventListener` (see CLAUDE.md known fix for the previous freeze bug).
- Summary panel halo shadow + foot tint pattern. This is the gold standard.

### Banned
- Touching configurator logic during pure design tasks unless the task explicitly says so.
- Sacrificing performance for visual polish.
- New visual effects on the summary panel that would compete with the gold halo.

### Open
- Battle Pass right-panel height (CLAUDE.md pending fix).
- Battle Pass Privacy Settings toggles (CLAUDE.md pending fix).
- Coaching checkout panel travelling-line (CLAUDE.md pending fix).
- Placements + Ranked Wins right-panel rank icons must update dynamically (CLAUDE.md pending fix).

---

## 14. Feature Workflow

For every new UI/design feature or fix:

1. **Read first.** Open `CLAUDE.md` (project rules) and `DESIGN.md` (this file) before anything else.
2. **Use impeccable + visual-fix thinking.** Inspect, report, plan, diff, approve, apply. One isolated change per prompt.
3. **Inspect existing components first.** Find the closest source-of-truth component in section 7. Read its CSS. Match its vocabulary.
4. **One scoped task per prompt.** Do not bundle migration + polish + backend. Do not touch unrelated pages during a component fix.
5. **Plan before editing.** Identify the exact files, classes, and lines to change. Explain what stays.
6. **Test before commit.** Use the live preview to verify empty + items states, hover, focus, mobile, console errors. The test plan from the cart V2 round is the template.
7. **Commit locally only.** Use the commit message format `type: short description` (CLAUDE.md). Show diff before staging.
8. **Never push.** No `git push` until final redesign approval. The current working branch is `redesign-migration`.

### Guardrails (CLAUDE.md plus this file)
- No inline styles.
- No new color variables. Reuse section 2.
- No new radii outside 0/2/3/4/5/50%/999px.
- Page-specific CSS stays in page CSS files. Shared CSS in `components.css` or `global.css`.
- Every `<img>` has `alt`. Non-hero images use `loading="lazy"`.
- JS files load with `defer`.
- No production `console.log`.
- No backend, auth, Supabase, or payment logic during design tasks.

---

## 15. Current Publish Blockers

These are the known issues that must be resolved before pushing live. They override new feature work.

1. **Valorant freeze / unresponsiveness.** Clicking add-ons or controls can stack click handlers and freeze the page. Root cause noted in CLAUDE.md (use `mount.onclick = fn`, not repeated `addEventListener`). Verify no regression on every Valorant touch.
2. **Arc Raiders hotspot alignment.** Hotspot `left/top` percentages still need final visual alignment against the Speranza reference screenshot.
3. **Final nav/footer/logo QA.** Confirm logo + wordmark + sign-in + cart + currency + search render identically across `index.html`, `pages/games/arc-raiders.html`, `pages/games/valorant.html`.
4. **Responsive QA.** Landing, Arc Raiders, and Valorant must hold up at 1100px, 900px, 720px, 480px breakpoints. Validate hero typography, cart dropdown (mobile becomes full-width with 74px top padding), configurator stack collapse.
5. **Visual polish per page.** After functional blockers, walk each page top-to-bottom with the visual-fix skill in scoped passes.

Until these clear, do not start backend, auth, admin, Supabase, pricing engine, or LoL page work.
