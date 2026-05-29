---
name: elysium-audit
description: Audit HTML/CSS/JS files for code quality violations per CLAUDE.md rules. Reports issues grouped by file without auto-fixing.
---

# Elysium Audit

Run a read-only code quality audit on the specified page(s). Report findings only — do not auto-fix.

## Scope

Audit one or more of: `index.html`, `pages/games/arc-raiders.html`, `pages/games/valorant.html`, and their associated CSS/JS files.

## What to Check

### HTML
- Inline styles (`style="..."` attributes)
- Images missing `alt` attribute
- Non-hero images missing `loading="lazy"`
- Scripts missing `defer`
- Hardcoded prices in HTML
- Missing `<title>` or `<meta name="description">`
- Inconsistent nav/footer across pages
- Order panel / cart panel HTML structure — check if markup exists, is visible, and is wired to the correct IDs

### CSS
- Hardcoded hex/rgb values not using `global.css` variables
- Duplicate selectors within the same file
- Page-specific styles placed in `global.css` or `components.css`
- Stacked `backdrop-filter` layers
- Missing `@property --arc-trace-angle` when travelling line is used
- Order panel / cart panel CSS — check if display/visibility rules could be causing panel to be invisible or off-screen

### JavaScript
- `console.log` statements
- Page-specific logic in `main.js` or shared logic in page JS
- Global variable pollution (non-const top-level declarations)
- Page JS files exceeding ~300 lines
- `arc-raiders.js`: check for `orderPanel`, `cartPanel`, or equivalent panel open/close functions
- `arc-raiders.js`: check for event listeners on weapon/gear selectors (click, change, input)
- Missing or broken event wiring between UI controls and panel state

### Assets
- Broken `src` paths (referenced files that don't exist on disk)
- Non-WebP images that should be WebP
- Non-PNG icons that need transparency
- Audio files present (none should exist)
- References to `orderpanelbg.webp` (removed permanently)

## Workflow

1. Run `find . -name "*.html" -o -name "*.css" -o -name "*.js" | head -40` to confirm all files in scope.
2. Read each file in scope fully.
3. In `arc-raiders.js`, search for: `orderPanel`, `cartPanel`, panel open/close functions, and event listeners on selectors.
4. In `arc-raiders.css`, search for: panel selectors, `display: none`, `visibility`, `opacity: 0`, `transform: translate`, `z-index`.
5. In `pages/games/arc-raiders.html`, search for: order panel markup, cart panel markup, panel IDs/classes.
6. Cross-reference HTML IDs/classes against JS selectors and CSS rules — flag any mismatches.
7. Check every item in each section above.
8. Report findings grouped by file.
9. Do not modify any files.
10. Do not commit.

## Output Format

```
## Audit Results — [page name]

### CRITICAL (panel missing/invisible, broken paths, missing markup)
- [file:line] description

### MODERATE (logic broken, missing event listeners, mismatched IDs)
- [file:line] description

### MINOR (style, missing lazy, missing alt on decorative images)
- [file:line] description

### Clean
- [rule] — no issues found
```

Use `file:line` references for every finding. If a line range is more accurate, use `file:line-line`.
