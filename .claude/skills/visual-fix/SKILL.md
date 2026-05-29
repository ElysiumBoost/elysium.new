---
name: elysium-visual-fix
description: Fix a specific visual/UI issue on a page without redesigning surrounding elements. Follows inspect-report-plan-diff-approve workflow.
---

# Elysium Visual Fix

Fix one isolated visual issue per invocation. Do not redesign surrounding elements.

## Rules

- One visual fix per task. Do not bundle multiple fixes.
- Do not change elements outside the reported issue.
- Do not introduce new design patterns, colors, or variables.
- Use existing variables from `css/global.css`.
- Do not add inline styles.
- Do not stack `backdrop-filter` layers.
- Keep the visual language premium, calm, dark, polished.
- Preserve travelling line implementation if touching affected components.

## Workflow

1. **Read HTML** — Read the full target page HTML. Locate the broken component by its ID or class.
2. **Read CSS** — Read the page-specific CSS file in full. Find every rule targeting that ID/class.
3. **Read JS** — Read the page-specific JS file in full. Find any logic that toggles, shows, hides, or mutates the component.
4. **Identify** — State the exact element (ID or class), the file, and the line(s) where the breakage lives.
5. **Show current code** — Quote the broken code block as-is, with file:line references.
6. **Show proposed fix as diff** — Present the change in unified diff format (`-` old, `+` new). No prose substitutes for a diff.
7. **Wait for approval** — Do not apply anything until the user explicitly approves.
8. **Apply** — Make the change only after approval. Touch only the lines shown in the diff.
9. **Do not commit** — Leave committing to the user.

## Read Order (always this sequence)

```
1. pages/games/<page>.html      ← find component markup and IDs/classes
2. css/<page>.css               ← find all CSS rules for that component
3. js/<page>.js                 ← find show/hide logic, event listeners, class toggles
4. css/global.css               ← confirm correct variable names before writing any CSS
5. css/components.css           ← check if component inherits shared styles
```

Do not skip steps. Do not read files out of order.

## Known Fixes to Apply When Relevant

- Arc sidebar icon transparency: `mix-blend-mode: screen`
- No `orderpanelbg.webp` references
- No stacked `backdrop-filter`
- Travelling line needs `@property --arc-trace-angle`
- Videos need `muted autoplay loop playsinline`
- Valorant rank icon dark backgrounds: `mix-blend-mode: screen`

## What Not to Do

- Do not redesign cards, layout, or sections.
- Do not change fonts or typography scale.
- Do not add animations unless the fix specifically requires it.
- Do not move CSS between files (e.g., page CSS into global).
- Do not combine visual fixes with migration or backend work.
- Do not change any selector not directly involved in the broken component.
