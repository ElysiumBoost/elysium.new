#!/usr/bin/env python3
"""Split index.html into css/styles.css and js/*.js (config, products, cart, ui)."""
from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")

style_m = re.search(r"<style>\s*\n", HTML)
style_end = HTML.find("</style>", style_m.end() if style_m else 0)
if style_m is None or style_end < 0:
    raise SystemExit("Could not find <style> block")

css = HTML[style_m.end() : style_end].rstrip() + "\n"
(ROOT / "css" / "styles.css").write_text(css, encoding="utf-8")

script_m = re.search(r"<script>\s*\n", HTML)
script_end = HTML.rfind("</script>")
if script_m is None or script_end < 0 or script_end <= script_m.start():
    raise SystemExit("Could not find <script> block")

inner = HTML[script_m.end() : script_end]
lines = inner.splitlines()


def find_idx(prefix: str) -> int:
    for i, ln in enumerate(lines):
        if ln.startswith(prefix):
            return i
    raise SystemExit(f"marker not found: {prefix!r}")


def closing_brace_from(start: int) -> int:
    b = 0
    started = False
    for t in range(start, len(lines)):
        for ch in lines[t]:
            if ch == "{":
                b += 1
                started = True
            elif ch == "}":
                b -= 1
        if started and b == 0 and t > start:
            return t
    raise SystemExit(f"no closing brace from line {start}")


i_discord = find_idx("    const DISCORD_URL")
j = find_idx("    const valorantTrustBlock = {")
k = closing_brace_from(j)
config = "\n".join(lines[i_discord : k + 1]) + "\n"

i_vgs = find_idx("    function valorantGameService(")
vg_end = closing_brace_from(i_vgs)
valorant_gs = lines[i_vgs : vg_end + 1]

i_fast = find_idx("    function fastService(")
i_ai = find_idx("    function arcIntro(")
ai_end = closing_brace_from(i_ai)
factories = lines[i_fast : ai_end + 1]

i_state = find_idx("    const state = {")
i_calc = find_idx("    function calculate() {")

catalog_middle = lines[vg_end + 1 : i_fast]
products = "\n".join(factories + [""] + valorant_gs + [""] + catalog_middle) + "\n"

cart = "\n".join(lines[i_state:i_calc]) + "\n"
ui = "\n".join(lines[i_calc:]) + "\n"

(ROOT / "js" / "config.js").write_text(config, encoding="utf-8")
(ROOT / "js" / "products.js").write_text(products, encoding="utf-8")
(ROOT / "js" / "cart.js").write_text(cart, encoding="utf-8")
(ROOT / "js" / "ui.js").write_text(ui, encoding="utf-8")

print("Wrote css/styles.css, js/config.js, js/products.js, js/cart.js, js/ui.js")
