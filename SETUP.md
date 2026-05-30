# Elysium Boost — Developer Setup Guide
Complete step-by-step for Claude Code setup and project onboarding.

---

## What You're Building
Gaming boost service website — elysiumboost.com
- Multi-page dark-themed site (vanilla HTML/CSS/JS)
- Game pages: Arc Raiders, Valorant, LoL
- User login + dashboard (Supabase Auth)
- Admin panel (price management, promo codes)
- Promo code system (Supabase)

---

## Step 1 — Prerequisites

Make sure you have:
- Node.js 18+ → `node -v`
- Claude Code installed → `claude --version`
- Git installed and GitHub account connected
- Access to the ElysiumBoost/ElysiumBoost private repo

---

## Step 2 — Clone and Open

```bash
git clone https://github.com/ElysiumBoost/elysium.new.git
cd elysium.new
claude
```

Claude Code opens. Do not type anything yet.

---

## Step 3 — Install Skills

Run these commands inside Claude Code one by one:

```
/plugin marketplace add anthropics/skills
```
```
/plugin install example-skills@anthropic-agent-skills
```
```
/plugin install superpowers@obra
```

This installs:
- `frontend-design` — avoids generic AI aesthetics, forces real design decisions
- `canvas-design` — generate icons, textures, banners as PNG/WebP
- `webapp-testing` — Playwright-based automated testing after every migration
- `superpowers` — plan → execute pipeline for complex multi-step tasks (admin panel, auth)

---

## Step 4 — Add MCP Servers

MCPs give Claude access to external tools and live data. These two are critical for this project.

### Context7 (Supabase docs — prevents hallucinated APIs)
```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp
```
Usage: just write `use context7` at the start of any Supabase-related prompt. Claude will pull live Supabase docs instead of guessing.

### Tavily (web search for reference sites and UI research)
```bash
# Get free API key at tavily.com first
claude mcp add tavily-search npx -- -y tavily-mcp@0.1.4
```
Set environment variable:
```bash
export TAVILY_API_KEY=tvly-your-key-here
```

---

## Step 5 — Place the CLAUDE.md

Put the `CLAUDE.md` file in the root of the repo (same level as `index.html`).
Claude Code reads this automatically at the start of every session.

Verify it's being read by running this first prompt:

```
Read CLAUDE.md fully. Then run:
ls -la && find . -name "*.html" -o -name "*.css" -o -name "*.js" | head -40
Show me the current file structure. Do not create or edit anything yet.
```

---

## Step 6 — Set Up Custom Commands

```bash
mkdir -p .claude/commands
```

Then paste this prompt into Claude Code:

```
Create these four files exactly as written:

FILE: .claude/commands/migrate.md
Trigger: when receiving a Claude Design offline HTML export file
Steps: extract content from bundler wrapper → separate CSS into css/[name].css → separate JS into js/[name].js → find all base64 data URLs and save as real files under assets/ → convert to WebP → apply Known Fixes from CLAUDE.md → output to pages/games/[name].html → show extraction summary → wait for approval before committing.

FILE: .claude/commands/audit.md  
Trigger: when asked to audit or review the codebase
Steps: find duplicate CSS rules → find hardcoded hex colors not using CSS variables → find inline styles → find missing alt attributes → find console.log statements → find scripts without defer → report all findings grouped by file → ask before fixing anything.

FILE: .claude/commands/newpage.md
Trigger: when asked to create a new game page
Steps: read CLAUDE.md design system → copy structure from most complete existing game page → never hardcode prices → add page to nav on all existing HTML files → show full diff before committing.

FILE: .claude/commands/predeploy.md
Trigger: when asked to run pre-deploy checks
Steps: verify all images are WebP with loading=lazy (except hero) → verify no console.log → verify no inline styles → verify no hardcoded prices → verify Supabase keys are only in supabase.js → verify all pages have title + meta description + og:image → report pass/fail per item → do not deploy until all pass.
```

---

## Step 7 — First Real Task (Arc Raiders Migration)

The Arc Raiders page was designed in Claude Design and exported as a large .html file.

Upload the file `Arc_Raiders__Offline_.html` to the repo or pass it directly, then use this prompt:

```
Use the migrate command.

File: Arc_Raiders__Offline_.html (Claude Design export, ~17MB)

After migration apply these specific fixes:
- Add mix-blend-mode: screen to .arc-sidebar-icon img
- Single backdrop-filter layer only — remove any stacked blur
- All station icons reference real files from assets/arc-raiders/icons/

Output: pages/games/arc-raiders.html + css/arc-raiders.css + js/arc-raiders.js
Show me the extraction summary before writing any files.
Do not commit until I say so.
```

---

## Step 8 — Admin Panel + Auth + Promo Codes Setup

Once the game pages are done, tackle the backend features in this order:

### 8a — Supabase Configuration
```
use context7

Set up Supabase client in js/supabase.js.
Config object at the top of the file with URL and anon key.
Export: supabaseClient, fetchPrices(), validatePromoCode(), signIn(), signOut(), getSession()
Never put keys in any HTML file.
Show the file before saving.
```

### 8b — Login Page
```
use context7

Create pages/login.html following CLAUDE.md design system.
Features:
- Email + password login form
- Magic link option
- Error state handling (wrong password, user not found)
- Redirect to pages/dashboard.html on success
- "Forgot password" flow via Supabase
Use existing card and button component styles from components.css.
Show full HTML before committing.
```

### 8c — Promo Code System
```
use context7

Add promo code functionality to the order flow.
Supabase table: promo_codes (columns: code, discount_percent, valid_until, max_uses, current_uses)

1. Add input field to all order panels (arc-raiders, valorant) with "Apply" button
2. On apply: fetch from Supabase, validate (not expired, uses remaining), apply discount
3. Show discount amount visually in order summary
4. Never expose discount logic in frontend JS — validate server-side via Supabase RPC
Show diff for each file before committing.
```

### 8d — Admin Panel
```
use context7

Create pages/admin.html — protected by Supabase Auth.
Sections:
1. Price Management — read/update boost_prices table (edit inline, save button per row)
2. Promo Code Manager — create new codes, set discount %, expiry, max uses; list active codes; deactivate button per code
3. Order Overview — read orders table, filter by game/status, mark as complete

Auth guard: check session on page load → redirect to pages/login.html if not authenticated
Admin check: verify user has admin role in Supabase user metadata
Show full file structure before writing anything.
```

---

## Step 9 — Page Priority Order

Work in this sequence:

| Priority | Page | Task |
|----------|------|------|
| 1 | pages/games/arc-raiders.html | Claude Design migration |
| 2 | pages/games/valorant.html | Complete placement tab + migration |
| 3 | index.html | Hero section + feature sections |
| 4 | pages/login.html | Supabase Auth |
| 5 | pages/admin.html | Admin panel |
| 6 | pages/pricing.html | Supabase pricing fetch |
| 7 | pages/games/lol.html | New page |
| 8 | pages/dashboard.html | User order history |

---

## How to Work Efficiently With Claude Code

**DO:**
- One task per prompt — "fix this" OR "build this", never both
- Always write `show diff before committing` or `do not commit until I say so`
- Start Supabase prompts with `use context7`
- Reference files by exact path: `css/global.css`, not "the CSS file"
- After any CSS change, run `/audit` to check for duplicates

**DON'T:**
- Never say "make it look better" without specifying what and where
- Never let Claude commit without reviewing the diff first
- Never create new CSS variables without checking global.css first
- Never combine multiple large changes in one prompt

---

## Git Commit Format
Every completed task ends with:
```bash
git add -A && git commit -m "[type]: [what changed]" && git push origin main
git log --oneline -3
```
Types: `feat` `fix` `style` `refactor` `chore`

Examples:
- `feat: add arc raiders station configurator`
- `fix: apply mix-blend-mode screen to sidebar icons`
- `style: update order panel card border to match design system`
- `chore: migrate arc raiders from claude design export`

---

## If Something Breaks

1. Run `/audit` first — catches 80% of CSS/HTML issues
2. For Supabase errors: start prompt with `use context7` and paste the exact error
3. For visual issues: take a screenshot and paste it into Claude Code with "fix this"
4. To roll back: `git log --oneline -5` → `git revert [commit-hash]`

---

## Useful References
- Supabase docs: https://supabase.com/docs (or use context7 inside Claude Code)
- Design reference: existing pages in the repo
- Skill docs: https://github.com/anthropics/skills
- Community skills: https://github.com/travisvn/awesome-claude-skills
