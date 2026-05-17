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

TRUST_BANNER = """        <div class="trust-bar" aria-label="Trust and guarantees">
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

TRUST_CARDS = """        <div class="trust-bar" aria-label="Trust and guarantees">
          <article class="trust-card">
            <div class="trust-card__icon" aria-hidden="true">
              <svg class="trust-card__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"/><path d="M12 22V12"/><path d="m3 7 9 5 9-5"/></svg>
            </div>
            <div class="trust-card__body">
              <h3 class="trust-card__title">Manual Delivery</h3>
              <p class="trust-card__micro">Handled by real boosters</p>
            </div>
          </article>
          <article class="trust-card">
            <div class="trust-card__icon" aria-hidden="true">
              <svg class="trust-card__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
            </div>
            <div class="trust-card__body">
              <h3 class="trust-card__title">No Cheats</h3>
              <p class="trust-card__micro">Legit service only</p>
            </div>
          </article>
          <article class="trust-card">
            <div class="trust-card__icon" aria-hidden="true">
              <svg class="trust-card__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="10" x="5" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div class="trust-card__body">
              <h3 class="trust-card__title">Safe Process</h3>
              <p class="trust-card__micro">Account-safe workflow</p>
            </div>
          </article>
          <article class="trust-card">
            <div class="trust-card__icon" aria-hidden="true">
              <svg class="trust-card__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.42 8.42 0 0 1-.35 2.4 8.5 8.5 0 0 1-7.65 5.67 8.38 8.38 0 0 1-3.8-.9L3 20.5l2.45-6.05A8.37 8.37 0 0 1 4.5 10.7a8.5 8.5 0 0 1 12.65-3.97A8.43 8.43 0 0 1 21 11.5Z"/></svg>
            </div>
            <div class="trust-card__body">
              <h3 class="trust-card__title">Fast Support</h3>
              <p class="trust-card__micro">Discord assistance</p>
            </div>
          </article>
          <article class="trust-card">
            <div class="trust-card__icon" aria-hidden="true">
              <svg class="trust-card__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div class="trust-card__body">
              <h3 class="trust-card__title">Verified Boosters</h3>
              <p class="trust-card__micro">Trusted expert team</p>
            </div>
          </article>
          <article class="trust-card">
            <div class="trust-card__icon" aria-hidden="true">
              <svg class="trust-card__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <div class="trust-card__body">
              <h3 class="trust-card__title">Completion Guarantee</h3>
              <p class="trust-card__micro">Finished as promised</p>
            </div>
          </article>
        </div>"""

if 'class="trust-card"' in html:
    pass
elif TRUST_OLD in html:
    html = html.replace(TRUST_OLD, TRUST_CARDS, 1)
elif TRUST_BANNER in html:
    html = html.replace(TRUST_BANNER, TRUST_CARDS, 1)
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
