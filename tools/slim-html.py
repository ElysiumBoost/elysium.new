#!/usr/bin/env python3
"""Replace inline CSS/JS in index.html with external assets; fix OG + trust copy."""
from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
html = (ROOT / "index.html").read_text(encoding="utf-8")

html = re.sub(
    r'<meta property="og:image" content="[^"]*">',
    '  <meta property="og:image" content="https://elysiumboost.github.io/ElysiumBoost/assets/elysium-preview.webp">',
    html,
    count=1,
)

TRUST_OLD = """        <div class="trust-bar" aria-label="Trust and guarantees">
          <div class="trust-item">
            <span class="trust-item__ic" aria-hidden="true">&#128666;</span>
            <div class="trust-item__text"><strong>Manual delivery</strong><span>No cheats. No exploits. Manual service only.</span></div>
          </div>
          <div class="trust-item">
            <span class="trust-item__ic" aria-hidden="true">&#9876;</span>
            <div class="trust-item__text"><strong>No cheats</strong><span>Clean play reputation matters to us.</span></div>
          </div>
          <div class="trust-item">
            <span class="trust-item__ic" aria-hidden="true">&#128274;</span>
            <div class="trust-item__text"><strong>Safe process</strong><span>Clear steps and Discord confirmation.</span></div>
          </div>
          <div class="trust-item">
            <span class="trust-item__ic" aria-hidden="true">&#9832;</span>
            <div class="trust-item__text"><strong>Fast Discord support</strong><span>Ticket-first workflow for quick replies.</span></div>
          </div>
          <div class="trust-item">
            <span class="trust-item__ic" aria-hidden="true">&#9733;</span>
            <div class="trust-item__text"><strong>Verified boosters</strong><span>Vetted pros on premium requests.</span></div>
          </div>
          <div class="trust-item">
            <span class="trust-item__ic" aria-hidden="true">&#9989;</span>
            <div class="trust-item__text"><strong>Completion guarantee</strong><span>Finish or fair resolution as agreed in Discord.</span></div>
          </div>
          <div class="trust-item">
            <span class="trust-item__ic" aria-hidden="true">&#128196;</span>
            <div class="trust-item__text"><strong>Secure order confirmation</strong><span>Receipt-style ticket + optional receipt image.</span></div>
          </div>
        </div>"""

TRUST_IMG = """        <div class="trust-bar" aria-label="Trust and guarantees">
          <div class="trust-badge">
            <img class="trust-badge__img" src="assets/manual-delivery.webp" alt="Manual Delivery" loading="eager" decoding="async">
          </div>
          <div class="trust-badge">
            <img class="trust-badge__img" src="assets/no-cheats.webp" alt="No Cheats" loading="eager" decoding="async">
          </div>
          <div class="trust-badge">
            <img class="trust-badge__img" src="assets/safe-process.webp" alt="Safe Process" loading="eager" decoding="async">
          </div>
          <div class="trust-badge">
            <img class="trust-badge__img" src="assets/fast-support.webp" alt="Fast Support" loading="eager" decoding="async">
          </div>
          <div class="trust-badge">
            <img class="trust-badge__img" src="assets/verified-boosters.webp" alt="Verified Boosters" loading="eager" decoding="async">
          </div>
          <div class="trust-badge">
            <img class="trust-badge__img" src="assets/completion-guarantee.webp" alt="Completion Guarantee" loading="eager" decoding="async">
          </div>
        </div>"""

if "trust-badge__img" in html:
    pass
elif TRUST_OLD in html:
    html = html.replace(TRUST_OLD, TRUST_IMG, 1)
elif TRUST_NEW in html:
    html = html.replace(TRUST_NEW, TRUST_IMG, 1)
else:
    raise SystemExit("trust-bar block not found for replacement")

RATING_OLD = """                  <div class="rating">
                    <span>Excellent</span>
                    <span class="stars"><span>*</span><span>*</span><span>*</span><span>*</span><span>*</span></span>
                    <span>Discord order support</span>
                  </div>"""

RATING_NEW = """                  <div class="rating rating--premium">
                    <span class="rating-score" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                    <span class="rating-text">4.9/5 Discord Support</span>
                  </div>"""

if RATING_OLD not in html:
    raise SystemExit("rating block not found")
html = html.replace(RATING_OLD, RATING_NEW, 1)

SUMMARY_OLD = """              <div class="summary-total" id="orderSummaryTotal">
                <div class="arc-order-preview" id="arcOrderSummaryPreview" hidden></div>
                <small>Total</small>
                <span id="liveTotal">$0.00</span>
                <div class="arc-price-breakdown" id="arcPriceBreakdown" hidden></div>
                <em id="usdHint">Ticket value: $0.00 USD</em>"""

SUMMARY_NEW = """              <div class="summary-total summary-total--idle" id="orderSummaryTotal">
                <div class="arc-order-preview" id="arcOrderSummaryPreview" hidden></div>
                <small class="summary-total-label">Total</small>
                <span id="liveTotal" class="live-total-text"></span>
                <div class="arc-price-breakdown" id="arcPriceBreakdown" hidden></div>
                <em id="usdHint" class="usd-hint-text"></em>"""

if SUMMARY_OLD not in html:
    raise SystemExit("summary-total block not found")
html = html.replace(SUMMARY_OLD, SUMMARY_NEW, 1)

si = html.find("<style>")
se = html.find("</style>", si) + len("</style>")
if si < 0 or se < len("</style>"):
    raise SystemExit("style block missing")

head_css = html[:si] + "  <link rel=\"stylesheet\" href=\"css/styles.css\">\n"
mid = html[se:]

smi = mid.find("<script>")
smx = mid.rfind("</script>") + len("</script>")
if smi < 0 or smx <= smi:
    raise SystemExit("script block missing in body")

scripts = (
    "  <script src=\"js/config.js\"></script>\n"
    "  <script src=\"js/products.js\"></script>\n"
    "  <script src=\"js/state.js\"></script>\n"
    "  <script src=\"js/storage.js\"></script>\n"
    "  <script src=\"js/validation.js\"></script>\n"
    "  <script src=\"js/cart.js\"></script>\n"
    "  <script src=\"js/ui.js\"></script>\n"
    "  <script src=\"js/main.js\"></script>\n"
)

out = head_css + mid[:smi] + scripts + mid[smx:]
(ROOT / "index.html").write_text(out, encoding="utf-8")
print("Slimmed index.html with external CSS/JS")
