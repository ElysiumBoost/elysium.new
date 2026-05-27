# Elysium Boost — Project Memory

## What This Is

Professional gaming boost service website.

- Live site: elysiumboost.com
- Repository: ElysiumBoost/ElysiumBoost
- Brand style: dark premium gaming, gold/amber luxury, clean high-conversion service pages
- Current focus: finish frontend migration and stabilize migrated pages before backend/auth work

---

## Current Project Phase

The project is currently in **frontend migration and polish**.

Do not start backend, Supabase, login, dashboard, admin panel, pricing backend, or LoL work until the migrated frontend pages are stable.

Current real status:

| Page | Status |
|------|--------|
| `index.html` | Migrated, needs polish/audit |
| `pages/games/arc-raiders.html` | Migrated, needs visual/code fixes |
| `pages/games/valorant.html` | Design done, migration pending |
| `pages/login.html` | Not started |
| `pages/dashboard.html` | Not started |
| `pages/admin.html` | Not started |
| `pages/games/lol.html` | Not started |

Recommended work order:

1. Stabilize shared files and project rules.
2. Add/use project skills for audit, migration, visual fixes, asset cleanup, and predeploy checks.
3. Finish `pages/games/valorant.html` migration.
4. Audit landing + Arc Raiders + Valorant together.
5. Fix Arc Raiders visual/code issues in small isolated passes.
6. Fix Valorant visual/code issues in small isolated passes.
7. Only then start backend/auth/admin/Supabase work.

---

## Tech Stack

- Vanilla HTML5 / CSS3 / JavaScript
- No React
- No Vue
- No bundlers
- No framework-specific file generation
- Plain static files only
- Google Fonts:
  - Rajdhani for headings/display
  - Plus Jakarta Sans for body
  - JetBrains Mono for mono/technical text
- Backend/auth: TBD, not set up yet
- Supabase may be used later, but do not assume it exists yet

---

## File Structure

Never invent new paths. Check the repo before creating any file.

```text
/
├── index.html
├── CLAUDE.md
├── AGENTS.md
├── SETUP.md
├── CNAME
├── pages/
│   ├── login.html
│   ├── dashboard.html
│   ├── admin.html
│   └── games/
│       ├── arc-raiders.html
│       ├── valorant.html
│       └── lol.html
├── css/
│   ├── global.css          ← CSS variables + reset only
│   ├── components.css      ← shared buttons, cards, nav, footer
│   ├── animations.css      ← keyframes, transitions, reveal animations
│   ├── arc-raiders.css     ← Arc Raiders page-specific styles only
│   └── valorant.css        ← Valorant page-specific styles only
├── js/
│   ├── main.js             ← shared JS only
│   ├── animations.js       ← scroll reveals, IntersectionObserver
│   ├── arc-raiders.js      ← Arc Raiders page-specific JS only
│   └── valorant.js         ← Valorant page-specific JS only
└── assets/
    ├── images/             ← shared WebP images
    ├── icons/              ← shared PNG icons with transparency
    ├── videos/             ← MP4 video files only when needed
    ├── arc-raiders/
    │   ├── icons/          ← station sidebar icons
    │   └── images/         ← station art panels
    └── valorant/
        └── icons/          ← rank icons, e.g. iron-1.png, gold-2.png
```

---

## File Organization Rules

Always enforce these rules:

- No inline styles.
- No duplicate CSS.
- Shared styles go in `global.css` or `components.css`.
- Page-specific CSS must stay in that page's CSS file.
- Do not place page-specific styles in `global.css` or `components.css`.
- Do not create a new file until checking whether it already exists.
- Every `<img>` must have an `alt` attribute.
- Non-hero images must use `loading="lazy"`.
- JS files must be loaded with `defer` before `</body>`.
- No production `console.log`.
- All images should be WebP unless they are transparent icons.
- Icons should be PNG with transparency.
- Each page-specific JS file should stay around 300 lines max; split only if genuinely needed.
- IDs are for JS hooks only.
- Classes are for styling.

---

## Design System — Do Not Change Without Approval

Use existing variables from `css/global.css`. Do not invent new color variables without first checking existing variables.

Current design tokens:

```css
--bg:            #0a0805;
--bg-2:          #100b07;
--bg-3:          #18110a;
--bg-card:       #120c08;
--gold:          #c9a84c;
--gold-bright:   #e5c26b;
--gold-deep:     #8a7224;
--gold-glow:     rgba(201, 168, 76, 0.42);
--gold-soft:     rgba(201, 168, 76, 0.14);
--amber:         #d97757;
--amber-glow:    rgba(217, 119, 87, 0.32);
--text:          #efe6cf;
--text-soft:     rgba(239, 230, 207, 0.72);
--text-dim:      rgba(239, 230, 207, 0.48);
--text-faint:    rgba(239, 230, 207, 0.28);
--line:          rgba(201, 168, 76, 0.18);
--line-soft:     rgba(239, 230, 207, 0.08);
--arc-rust:      #d4571b;
--arc-rust-glow: rgba(212, 87, 27, 0.32);
--f-display:     "Rajdhani", "Plus Jakarta Sans", system-ui, sans-serif;
--f-body:        "Plus Jakarta Sans", system-ui, sans-serif;
--f-mono:        "JetBrains Mono", ui-monospace, monospace;
```

Component expectations:

- Cards: `background: var(--bg-2)` with `border: 1px solid var(--line-soft)`.
- Buttons:
  - `.eb-btn` for outline/secondary buttons
  - `.eb-btn-primary` for gold primary buttons
- Do not stack `backdrop-filter`; use a single blur layer only.
- Keep the visual language premium, calm, dark, polished, and not noisy.
- Avoid generic AI-looking gradients, random glow spam, and mismatched colors.

---

## Animation Rules

- All keyframes belong in `css/animations.css`.
- Scroll-triggered reveals belong in `js/animations.js`.
- Use IntersectionObserver for reveal animations.
- Respect reduced motion.
- Do not add vibration/shake effects unless explicitly requested.
- Animations should feel calm, luxury, and controlled.

Reduced motion pattern:

```css
@media (prefers-reduced-motion: no-preference) {
  /* animations here */
}
```

---

## Travelling Line Effect

Always preserve the travelling line implementation when touching affected components.

Required rules:

```css
@property --arc-trace-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
```

Implementation expectations:

- Child element: `position: absolute`
- Use `inset: 0`
- Use approximately `padding: 1.5px`
- Use a conic-gradient gold comet tail
- Use mask/mask-composite to exclude the center
- Animation: `arc-trace-spin`
- Normal speed: around `2.7s`
- Slow speed: around `4.5s` for cart panels and CTA buttons

Known issue to avoid:

- If the line becomes static, first check whether `@property --arc-trace-angle` exists and is loaded before the animation.

---

## Known Fixes — Always Apply When Relevant

1. Arc Raiders icon transparency:
   ```css
   .arc-sidebar-icon img {
     mix-blend-mode: screen;
   }
   ```

2. Do not re-add `orderpanelbg.webp`. It was removed permanently.

3. Arc Raiders must not have stacked `backdrop-filter` layers. Use a single blur layer only.

4. Travelling line static fix:
   - Always declare `@property --arc-trace-angle`.

5. Video backgrounds:
   - Always include `muted autoplay loop playsinline`.

6. Valorant rank icon transparency:
   - If rank icons show dark baked backgrounds, apply `mix-blend-mode: screen` carefully.

7. No site audio:
   - Do not add or restore `elysium-loop.mp3`.
   - No autoplay music.
   - No background audio.

---

## Current Pending Fixes

Do not fix all of these at once. Handle one isolated task per prompt.

### Global / Shared

- Logo: increase image size to 52px.
- Logo: remove outer circle.
- Apply logo fix consistently on all pages.
- Hero-to-section transition: smooth fade, no hard line.
- Section 2 background: replace static image with looping muted video if the asset exists and performance is acceptable.
- Login/signup button and modal: add to nav on all pages later.
- Remove `elysium-loop.mp3` if present.

### Arc Raiders

- Sidebar icon transparency: apply/fix `mix-blend-mode: screen`.
- Add all station icons as real files under `assets/arc-raiders/icons/`.
- Add all station art images under `assets/arc-raiders/images/`.
- Verify no stacked blur/backdrop-filter layers.
- Verify all station data maps to real assets.
- Audit layout responsiveness.

### Valorant

- Finish page migration.
- Battle Pass: fix right panel height.
- Battle Pass: fix Privacy Settings toggles.
- Coaching checkout panel: fix travelling line.
- Placements right panel: rank icons must update dynamically.
- Ranked Wins right panel: rank icons must update dynamically.
- Verify tabs:
  - Rank Boosting
  - Placements
  - Ranked Wins
  - Account Leveling
  - Battle Pass
  - Coaching

---

## Arc Raiders Stations

Use this station list consistently:

- Custom Loadout
- All Weapons
- Blueprints
- Leveling
- Workshop & Scrappy
- All Materials
- Depositary
- Boss & Puzzle
- Raider Coins
- Trials Boost
- Raid Bundles
- Expedition Boost
- Hourly Coaching
- Custom Orders
- Assorted Seeds

Do not rename stations without approval.

---

## Valorant Tabs

Use this tab list consistently:

- Rank Boosting
- Placements
- Ranked Wins
- Account Leveling
- Battle Pass
- Coaching

Do not rename tabs without approval.

---

## Prices

- All prices are subject to change before launch.
- Do not hardcode prices directly in HTML.
- Current temporary frontend pricing may live in JS variables or a config object.
- Later backend pricing should be centralized when auth/admin/pricing work begins.
- Do not start Supabase pricing work until the frontend migration is stable.

---

## Backend/Auth Rules

Backend/auth is not active yet.

Do not create or modify Supabase files unless the task explicitly starts the backend phase.

When backend work begins later:

- Use Context7 for Supabase-related prompts.
- Keep Supabase URL and anon key in one JS config file only.
- Never put keys in HTML.
- Never expose private keys.
- Admin access must be protected.
- Promo code validation should not rely only on frontend logic.

Until then, do not add fake Supabase code or placeholder auth logic unless explicitly requested.

---

## Claude Design HTML Migration Rules

Use these only when migrating an exported Claude Design page.

Expected migration steps:

1. Extract actual page content from the offline HTML/export wrapper.
2. Move CSS into the correct page CSS file.
3. Move JS into the correct page JS file.
4. Convert embedded/base64 assets into real files under `assets/`.
5. Convert images to WebP where appropriate.
6. Keep transparent icons as PNG.
7. Apply relevant Known Fixes.
8. Link CSS and JS correctly from the page.
9. Show extraction summary and diff before committing.
10. Do not commit until explicit approval.

For Valorant migration:

- Output page: `pages/games/valorant.html`
- CSS: `css/valorant.css`
- JS: `js/valorant.js`
- Rank icons: `assets/valorant/icons/`
- Do not modify Arc Raiders during the Valorant migration task.

---

## Task Boundaries

One prompt = one task.

Do not combine:

- Migration + visual polish
- Visual polish + backend
- Arc fixes + Valorant fixes
- Asset cleanup + redesign
- Audit + auto-fix
- Supabase setup + admin panel
- Login + dashboard + promo codes

Always prefer:

1. Inspect
2. Report
3. Show plan
4. Show diff
5. Wait for approval
6. Then commit only if approved

---

## Before Every Task

Run or check:

```bash
find . -name "*.html" -o -name "*.css" -o -name "*.js" | head -40
```

Also:

1. Read `css/global.css` before touching colors, fonts, resets, or variables.
2. Read `css/components.css` before creating buttons, cards, nav, or footer styles.
3. Check the target page-specific CSS before adding new rules.
4. Check the target page-specific JS before adding new logic.
5. Never create a duplicate file.
6. Never commit without showing the diff first.

---

## Code Quality Rules

HTML:

- Semantic structure where possible.
- Every image has `alt`.
- Non-hero images use `loading="lazy"`.
- Scripts use `defer`.
- No inline styles.
- No hardcoded prices in HTML.
- Title and meta description should exist on every page.
- Keep nav/footer consistent.

CSS:

- Use existing variables.
- No hardcoded hex in page files unless unavoidable and approved.
- No duplicate selectors.
- No page-specific CSS in shared files.
- No global overrides for one-page problems.
- No stacked backdrop blur.
- Avoid excessive glow/noise.

JavaScript:

- No production `console.log`.
- Keep functions small and readable.
- Keep shared logic in `main.js`.
- Keep page logic in page-specific JS.
- Avoid global variable pollution.
- Do not add libraries unless explicitly approved.
- Do not invent backend APIs.

Assets:

- Shared images go in `assets/images/`.
- Shared icons go in `assets/icons/`.
- Arc-specific icons/images go under `assets/arc-raiders/`.
- Valorant-specific icons go under `assets/valorant/icons/`.
- WebP for normal images.
- PNG for transparent icons.
- MP4 for videos.
- No audio.

---

## Git Workflow

Do not commit without approval.

When approved, use:

```bash
git add -A
git commit -m "[type]: [description]"
git push origin main
git log --oneline -3
```

Allowed commit types:

- `feat`
- `fix`
- `style`
- `refactor`
- `chore`

Examples:

```bash
git commit -m "chore: add project skills"
git commit -m "fix: apply arc raiders sidebar icon transparency"
git commit -m "style: smooth landing hero section transition"
git commit -m "feat: migrate valorant page"
```

---

## Recommended Skills To Use

Project skills should live under:

```text
.claude/skills/
```

Recommended project skills:

```text
.claude/skills/audit/SKILL.md
.claude/skills/predeploy/SKILL.md
.claude/skills/visual-fix/SKILL.md
.claude/skills/migrate-page/SKILL.md
.claude/skills/asset-cleanup/SKILL.md
```

Purpose:

- `audit`: report duplicate CSS, inline styles, hardcoded colors, missing alt, bad scripts, console logs.
- `predeploy`: final launch checklist.
- `visual-fix`: screenshot-based UI fix workflow without random redesign.
- `migrate-page`: Claude Design export to clean static page workflow.
- `asset-cleanup`: image conversion, broken asset paths, unused assets, icon transparency.

Do not put long audit/migration procedures directly into this file. Keep this file as permanent project memory and put repeatable workflows into skills.

---

## How To Communicate During Work

When reporting back:

- Be concise.
- Group findings by file.
- Separate critical bugs from polish.
- Show exact paths changed.
- Show diff before committing.
- Do not say “fixed” unless the change was actually made.
- Do not claim tests passed unless tests were actually run.

---

## Safety Rules For This Repo

Never:

- Expose secrets or private keys.
- Add backend keys to HTML.
- Add external trackers without approval.
- Add audio.
- Add unrelated frameworks.
- Rewrite the entire site unless explicitly asked.
- Make broad visual redesigns during bug-fix tasks.
- Delete large folders without showing the diff and getting approval.

---

## Primary Goal Right Now

Finish a clean, stable, premium frontend migration:

1. Landing page stable.
2. Arc Raiders page stable.
3. Valorant page migrated and stable.
4. Shared design system clean.
5. Assets organized.
6. No obvious production blockers.
7. Then proceed to backend/auth/admin/pricing later.
