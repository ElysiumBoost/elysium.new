/* ══════════════════════════════════════════════════════════════
   ARC RAIDERS — Standalone Game Page JS
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     DATA
     ──────────────────────────────────────────────────────────── */
  var SERVICES = [
    { id: 'custom-loadout', name: 'Custom Loadout', color: '#e08a2c', glyph: 'L', tags: ['Loadout', 'Weapons', 'Gear'], image: '../../assets/arc-raiders/images/custom-loadout.webp', art: 'Fully kitted loadouts assembled and shipped to your Stash. Pick the weapons, mods, gear and consumables; delivery is instant.' },
    { id: 'all-weapons', name: 'All Weapons', color: '#c98a2c', glyph: 'W', image: '../../assets/arc-raiders/images/all-weapons.webp', tags: ['Weapons', 'Mods'], art: 'Every weapon in the catalogue, any tier, any mods. Sold individually or in stacks.' },
    { id: 'blueprints', name: 'Blueprints', color: '#7faedc', glyph: 'B', image: '../../assets/arc-raiders/images/blueprints.webp', tags: ['Blueprints'], art: 'Unlock recipes for the gear you want to craft instead of grind.' },
    { id: 'leveling', name: 'Leveling', color: '#e5c26b', glyph: '↑', tags: ['Leveling', 'XP'], image: '../../assets/arc-raiders/images/leveling.webp', art: 'Account leveling, contract progress, season-pass tiers — all done manually.' },
    { id: 'workshop', name: 'Workshop & Scrappy', color: '#d4571b', glyph: '⚙', tags: ['Workshop', 'Scrap'], image: '../../assets/arc-raiders/images/workshop.webp', art: 'Bench upgrades, recycled parts, scrappy contracts cleared on demand.' },
    { id: 'materials', name: 'All Materials', color: '#a3acb1', glyph: 'M', tags: ['Materials', 'Resources'], image: '../../assets/arc-raiders/images/all-materials.webp', art: 'Stack-priced raw materials shipped straight to your Stash.' },
    { id: 'depositary', name: 'Depositary', color: '#b794d6', glyph: 'D', tags: ['Storage'], image: '../../assets/arc-raiders/images/depositary.webp', art: 'Stash expansions, secure transfers, asset migration between characters.' },
    { id: 'boss-puzzle', name: 'Boss & Puzzle', color: '#c75059', glyph: '✦', tags: ['Boss', 'Puzzle'], image: '../../assets/arc-raiders/images/boss-puzzle.webp', art: 'Lockout bosses cleared, puzzles solved, achievements unlocked.' },
    { id: 'raider-coins', name: 'Raider Coins', color: '#e5c26b', glyph: '¤', tags: ['Currency'], image: '../../assets/arc-raiders/images/raider-coins.webp', art: 'Bulk Raider Coins delivered through verified trade routes.' },
    { id: 'trials-boost', name: 'Trials Boost', color: '#ff8a3d', glyph: 'T', tags: ['Trials'], image: '../../assets/arc-raiders/images/trials-boost.webp', art: 'Weekly trial completions, perfect runs, ranked trial placements.' },
    { id: 'raids', name: 'Raid Bundles', color: '#ff4655', glyph: 'R', tags: ['Raids', 'Squad'], image: '../../assets/arc-raiders/images/raids.webp', art: 'Endgame raid clears with verified Immortal-tier squad leaders.' },
    { id: 'expedition-boost', name: 'Expedition Boost', color: '#4ec6e8', glyph: 'E', tags: ['Expedition'], image: '../../assets/arc-raiders/images/expedition-boost.webp', art: 'Full expedition runs — sites swept, loot extracted, you keep everything.' },
    { id: 'raid-coaching', name: 'Hourly Coaching', color: '#9b6cff', glyph: 'C', tags: ['Coaching'], image: '../../assets/arc-raiders/images/raid-coaching.webp', art: '1-on-1 raid coaching with a pro: VOD review, route planning, mechanics.' },
    { id: 'custom-orders', name: 'Custom Orders', color: '#e08a2c', glyph: 'O', tags: ['Custom'], image: '../../assets/arc-raiders/images/custom-orders.webp', art: 'Off-menu requests handled by our concierge desk in Discord.' },
    { id: 'assorted-seeds', name: 'Assorted Seeds', color: '#4ea568', glyph: 'S', tags: ['Seeds', 'Drops'], image: '../../assets/arc-raiders/images/assorted-seeds.webp', art: 'Curated seed bundles for vault runs, drop chases, and rare encounters.' }
  ];

  var WEAPONS = [
    'Anvil', 'Aphelion', 'Bettina', 'Bobcat', 'Burletta', 'Canto', 'Dolabra', 'Equalizer',
    'Hullcracker', 'Il Toro', 'Jupiter', 'Osprey', 'Rascal', 'Renegade', 'Tempest', 'Torrente', 'Venator', 'Vulcano'
  ];

  var MOD_KITS = ['Standard', 'Extended Mag', 'Suppressor', 'Holographic', 'Tac Light + Grip'];

  var QUICK_USE = [
    { id: 'qu-bandage', name: 'Herbal Bandage', pack: 'Pack of 5', mul: 5, per: 35, color: '#4ea568' },
    { id: 'qu-sterilized', name: 'Sterilized Bandage', pack: 'Pack of 3', mul: 3, per: 55, color: '#7ec48f' },
    { id: 'qu-shield', name: 'Shield Recharger', pack: 'Pack of 5', mul: 5, per: 45, color: '#7faedc' },
    { id: 'qu-surge', name: 'Surge Shield Recharger', pack: 'Pack of 5', mul: 5, per: 70, color: '#b794d6' },
    { id: 'qu-nade', name: 'Trigger Nade', pack: 'Pack of 3', mul: 3, per: 60, color: '#ff8a3d' },
    { id: 'qu-snap', name: 'Snap Hook', pack: 'Pack of 1', mul: 1, per: 25, color: '#c98a2c' }
  ];

  var BUNDLES = [
    { id: 'b-10', title: '10x Bundle', n: 10, color: '#c9a84c',
      items: ['10 Primary weapon', '10 Looting Mk.3', '10 Medium Shield', '50 Shield Recharger', '50 Herbal Bandage'],
      price: 1200,
      asLineItems: function () {
        return [
          { id: 'p-pri', name: 'Primary Weapon', qty: 10, price: 850, color: '#e08a2c' },
          { id: 'p-loot', name: 'Looting Mk.3', qty: 10, price: 180, color: '#4ec6e8' },
          { id: 'p-shield', name: 'Medium Shield', qty: 10, price: 150, color: '#7faedc' },
          { id: 'p-rech', name: 'Shield Recharger', qty: 50, price: 20, color: '#7faedc' },
          { id: 'p-bandage', name: 'Herbal Bandage', qty: 50, price: 16, color: '#4ea568' }
        ];
      }
    },
    { id: 'b-20', title: '20x Bundle', n: 20, color: '#e5c26b', best: true,
      items: ['20 Primary weapon', '20 Looting Mk.3', '20 Medium Shield', '100 Shield Recharger', '100 Herbal Bandage'],
      price: 2200,
      asLineItems: function () {
        return [
          { id: 'p-pri', name: 'Primary Weapon', qty: 20, price: 1500, color: '#e08a2c' },
          { id: 'p-loot', name: 'Looting Mk.3', qty: 20, price: 320, color: '#4ec6e8' },
          { id: 'p-shield', name: 'Medium Shield', qty: 20, price: 280, color: '#7faedc' },
          { id: 'p-rech', name: 'Shield Recharger', qty: 100, price: 36, color: '#7faedc' },
          { id: 'p-bandage', name: 'Herbal Bandage', qty: 100, price: 28, color: '#4ea568' }
        ];
      }
    }
  ];

  var BACKPACK_BLUEPRINTS = [
    'Combat Mk.3 (Flanking)', 'Tactical Mk.3 (Defensive)', 'Looting Mk.3 (Survivor)',
    'Combat Mk.3 (Aggressive)', 'Tactical Mk.3 (Healing)', 'Looting Mk.3 (Safekeeper)',
    'Tactical Mk.3 (Revival)', 'Tactical Mk.3 (Smoke)'
  ];

  var QUICK_USE_BLUEPRINTS = [
    'Barricade Kit', 'Explosive Mine', 'Defibrillator', 'White Flag', 'Crash Mat',
    'Powered Descender', 'Vita Shot', 'Vita Spray', 'Wolfpack', 'Snap Hook',
    'Smoke Grenade', 'Showstopper', 'Lure Grenade', 'Deadline', 'Seeker Grenade',
    'Trailblazer', 'Gas Mine', 'Pulse Mine', 'Fireworks Box', 'Blue Light Stick',
    'Green Light Stick', 'Yellow Light Stick', 'Red Light Stick', 'Remote Raider Flare',
    'Surge Coil', 'Tagging Grenade', 'Jolt Mine', 'Blaze Grenade', 'Trigger Nade'
  ];

  var GUNPART_BLUEPRINTS = [
    { name: 'Angled Grip', tiers: ['II', 'III'] },
    { name: 'Compensator', tiers: ['II', 'III'] },
    { name: 'Extended Light Mag', tiers: ['II', 'III'] },
    { name: 'Extended Medium Mag', tiers: ['II', 'III'] },
    { name: 'Extended Shotgun Mag', tiers: ['II', 'III'] },
    { name: 'Muzzle Brake', tiers: ['II', 'III'] },
    { name: 'Shotgun Choke', tiers: ['II', 'III'] },
    { name: 'Stable Stock', tiers: ['II', 'III'] },
    { name: 'Silencer', tiers: ['I', 'II'] },
    { name: 'Extended Barrel' },
    { name: 'Lightweight Stock' },
    { name: 'Padded Stock' },
    { name: 'Light Gun Parts' },
    { name: 'Medium Gun Parts' },
    { name: 'Heavy Gun Parts' },
    { name: 'Complex Gun Parts' },
    { name: 'Shotgun Silencer' },
    { name: 'Vertical Grip III' }
  ];

  var BP_TABS = [
    { id: 'gun', label: 'Gun Blueprints', items: WEAPONS.map(function (n) { return { name: n }; }), price: 180, sub: 'Gun Blueprint', color: '#c9a84c', enabled: true },
    { id: 'backpack', label: 'Backpack Blueprints', items: BACKPACK_BLUEPRINTS.map(function (n) { return { name: n }; }), price: 140, sub: 'Backpack Blueprint', color: '#7faedc', enabled: true },
    { id: 'quick', label: 'Quick Use Blueprints', items: QUICK_USE_BLUEPRINTS.map(function (n) { return { name: n }; }), price: 60, sub: 'Quick Use Blueprint', color: '#4ea568', enabled: true },
    { id: 'gunpart', label: 'Gun Part Blueprints', items: GUNPART_BLUEPRINTS, price: 90, sub: 'Gun Part Blueprint', color: '#e08a2c', enabled: true }
  ];

  var MATERIALS_CATS = [
    { id: 'uncommon', label: 'Uncommon', color: '#c9a84c', items: [
      { name: 'Battery', price: 375 }, { name: 'Canister', price: 375 }, { name: 'Crude Explosives', price: 375 },
      { name: 'Duct Tape', price: 375 }, { name: 'Durable Cloth', price: 375 }, { name: 'Electrical Components', price: 375 },
      { name: 'Great Mullein', price: 375 }, { name: 'Magnet', price: 375 }, { name: 'Mechanical Components', price: 375 },
      { name: 'Mushroom', price: 375 }, { name: 'Oil', price: 375 }, { name: 'Simple Gun Parts', price: 375 },
      { name: 'Steel Spring', price: 375 }, { name: 'Wires', price: 375 }, { name: 'Apricot', price: 375 },
      { name: 'Arc Alloy', price: 375 }, { name: 'Lemon', price: 375 }, { name: 'Olives', price: 375 },
      { name: 'Prickly Pear', price: 375 }, { name: 'Snitch Scanner', price: 375 }, { name: 'Tick Pod', price: 375 }
    ]},
    { id: 'rare', label: 'Rare', color: '#7faedc', items: [
      { name: 'Advanced Electrical Components', price: 625 }, { name: 'Advanced Mechanical Components', price: 625 },
      { name: 'Antiseptic', price: 625 }, { name: 'Explosive Compound', price: 625 },
      { name: 'Heavy Gun Parts', price: 625 }, { name: 'Light Gun Parts', price: 625 },
      { name: 'Medium Gun Parts', price: 625 }, { name: 'Mod Components', price: 625 },
      { name: 'Processor', price: 625 }, { name: 'Rusted Gear', price: 625 },
      { name: 'Rusted Tools', price: 625 }, { name: 'Rope', price: 625 },
      { name: 'Sensors', price: 625 }, { name: 'Speaker Component', price: 625 },
      { name: 'Synthesized Fuel', price: 625 }, { name: 'Syringe', price: 625 },
      { name: 'Voltage Converter', price: 625 }, { name: 'Arc Circuitry', price: 625 },
      { name: 'Arc Motion Core', price: 625 }, { name: 'Cracked Bioscanner', price: 625 },
      { name: 'Damaged Heatsink', price: 625 }, { name: 'Dog Collar', price: 625 },
      { name: 'Fried Motherboard', price: 625 }, { name: 'Industrial Battery', price: 625 },
      { name: 'Laboratory Reagents', price: 625 }, { name: 'Motor', price: 625 },
      { name: 'Power Cable', price: 625 }, { name: 'Rusted Shut Medical Kit', price: 625 },
      { name: 'Sentinel Firing Core', price: 625 }, { name: 'Surveyor Vault', price: 625 },
      { name: 'Toaster', price: 625 }, { name: 'Wasp Drive', price: 625 },
      { name: 'Comet Igniter', price: 2500 }, { name: 'Firefly Burner', price: 2500 },
      { name: 'Arc Synthetic Resin', price: 2125 }
    ]},
    { id: 'epic', label: 'Epic', color: '#b794d6', items: [
      { name: 'Complex Gun Parts', price: 750 }, { name: 'Bastion Cell', price: 750 },
      { name: 'Bombardier Cell', price: 750 }, { name: 'Leaper Pulse Unit', price: 1625 },
      { name: 'Exodus Module', price: 750 }, { name: 'Power Rod', price: 750 },
      { name: 'Magnetic Accelerator', price: 750 }, { name: 'Rocketeer Driver', price: 750 },
      { name: 'Vaporizer Regulator', price: 4666 }, { name: 'Assessor Matrix', price: 3334 }
    ]},
    { id: 'legendary', label: 'Legendary', color: '#d97757', items: [
      { name: 'Matriarch Reactor', price: 8750 }, { name: 'Queen Reactor', price: 8750 }
    ]}
  ];

  var TRIALS_RANKS = [
    'Rookie I', 'Rookie II', 'Rookie III',
    'Tryhard I', 'Tryhard II', 'Tryhard III',
    'Wildcard I', 'Wildcard II', 'Wildcard III',
    'Daredevil I', 'Daredevil II', 'Daredevil III',
    'Hotshot'
  ];

  var ARC_REVIEWS = [
    { initials: 'L.K', user: 'lurik#0042', country: 'GB', flagColors: ['#012169', '#fff', '#c8102e'], quote: 'Ordered a 20× bundle on a Tuesday night, items hit my Stash before I could grab a coffee. Delivery was clean, no flags.', from: 'Speranza Lv. 18', to: 'Lv. 32', days: 1 },
    { initials: 'M.R', user: 'mythosrev', country: 'DE', flagColors: ['#000', '#dd0000', '#ffce00'], quote: 'Asked for a custom loadout with my exact mod kit. Ticket confirmed every spec before they touched the workshop. No surprises.', from: 'Raid Tier II', to: 'Tier IV', days: 2 },
    { initials: 'A.O', user: 'avalon', country: 'FR', flagColors: ['#002395', '#fff', '#ed2939'], quote: 'Runner handled the Boss & Puzzle clear in two sessions. Got VOD links so I could review the routes after.', from: '3 puzzles open', to: 'All clear', days: 1 },
    { initials: 'N.V', user: 'nyx_void', country: 'BR', flagColors: ['#009b3a', '#fedf00', '#009b3a'], quote: 'Bought a Raider Coins stack — priced fairly, delivered fast, support double-checked the route before transfer.', from: '4k coins', to: '50k coins', days: 1 },
    { initials: 'C.S', user: 'cipher.shy', country: 'US', flagColors: ['#b22234', '#fff', '#3c3b6e'], quote: 'Third order on Elysium for Arc Raiders. Same concierge desk every time. They remember my loadout preferences.', from: 'Lv. 40', to: 'Lv. 60', days: 3 },
    { initials: 'D.H', user: 'dunehollow', country: 'JP', flagColors: ['#fff', '#bc002d', '#fff'], quote: 'Took the Expedition Boost, came back to a Stash full of extracted loot. Nothing felt rushed, nothing felt scripted.', from: '0 expeditions', to: '5 sites swept', days: 2 }
  ];

  var ARC_FAQS = [
    { q: 'How does Arc Raiders boosting work?', a: 'Pick a station on the map, configure your order in the middle column, copy the cart summary into our Discord ticket. A verified runner picks up the order, executes it manually in-game (or queues alongside you for coaching/raid services), and delivers items directly to your Stash. You get live updates inside the ticket the whole way.' },
    { q: 'How is delivery handled — will it affect my account?', a: 'Delivery happens through the in-game trade and Stash systems, on residential IPs from your region, manually — the same way two friends would hand off loot. No exploits, no shared sessions. The runner signs out the moment your goods are in your Stash.' },
    { q: 'Can I choose which runner completes my order?', a: 'If you’ve worked with one of our runners before and want them again, drop their handle in your ticket and we’ll route the order to them. Otherwise, our concierge desk pairs your order with the runner whose load and timezone match yours.' },
    { q: 'How long does delivery take?', a: 'Most material and weapon orders are in your Stash within 10–30 minutes. Bundles and custom loadouts land within 1–2 hours. Boss clears, raids, and expedition runs depend on instance availability — usually same-day, never beyond 48 hours unless we tell you up front.' },
    { q: 'Are prices in real money or Raider Coins?', a: 'The configurator displays prices in Raider Coins for clarity. Checkout converts to your selected fiat or crypto at our current daily rate, shown before you confirm. No hidden conversion fees.' },
    { q: 'What happens if a run fails?', a: 'Runs are outcome contracts. A failed extract, a wiped raid, a missed objective — the runner retries until the order is fulfilled, at no extra cost. If a service genuinely can’t be completed (game outage, content gate), we refund pro-rated against any work already delivered.' },
    { q: 'Can I watch the run live?', a: 'Yes — add the Stream Games option in Discord and you get a private link plus saved VODs of every session. Great for boss/raid services where you want to learn the routes.' },
    { q: 'Refunds and cancellations?', a: 'Cancel any time from your Discord ticket — no penalty. Refunds are pro-rated against goods already delivered, full refund if no work has started. We honour a money-back guarantee if our ETA slips by more than 48 hours without a heads-up.' },
    { q: 'Is the service safe from bans?', a: 'Every runner is manual-only, on residential IPs, screened against our Arc Raiders safety checklist. We have shipped 2,400+ Arc Raiders orders with zero account bans on file. Encrypted login handoff via OAuth where supported — we never store credentials.' },
    { q: 'Do you support all servers?', a: 'Yes — every published Arc Raiders region. Runner availability per region is shown in your Discord ticket; concierge will tell you up front if we need to schedule the order for a peak window in your timezone.' }
  ];

  /* ────────────────────────────────────────────────────────────
     HELPERS
     ──────────────────────────────────────────────────────────── */
  function $(id) { return document.getElementById(id); }
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function fmtRC(n) {
    return n.toLocaleString('en-US');
  }

  function coinHtml(amount) {
    return fmtDollar(amount);
  }

  function fmtDollar(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function matSizeClass(name) {
    var len = name.length;
    if (len > 28) return 'arc-mat-name--xs';
    if (len > 22) return 'arc-mat-name--sm';
    if (len > 16) return 'arc-mat-name--md';
    return '';
  }

  /* ────────────────────────────────────────────────────────────
     STEPPER HELPER
     ──────────────────────────────────────────────────────────── */
  function createStepper(value, min, max, onChange) {
    var wrap = document.createElement('div');
    wrap.className = 'arc-stepper';

    var btnDec = document.createElement('button');
    btnDec.type = 'button';
    btnDec.textContent = '−';
    btnDec.setAttribute('aria-label', 'Decrease');

    var inp = document.createElement('input');
    inp.type = 'number';
    inp.min = min;
    inp.max = max;
    inp.value = value;
    inp.setAttribute('aria-label', 'Quantity');

    var btnInc = document.createElement('button');
    btnInc.type = 'button';
    btnInc.textContent = '+';
    btnInc.setAttribute('aria-label', 'Increase');

    function sync() {
      var v = parseInt(inp.value, 10);
      if (isNaN(v)) v = min;
      v = clamp(v, min, max);
      inp.value = v;
      btnDec.disabled = (v <= min);
      btnInc.disabled = (v >= max);
      if (onChange) onChange(v);
    }

    btnDec.addEventListener('click', function () {
      inp.value = clamp(parseInt(inp.value, 10) - 1, min, max);
      sync();
    });
    btnInc.addEventListener('click', function () {
      inp.value = clamp(parseInt(inp.value, 10) + 1, min, max);
      sync();
    });
    inp.addEventListener('change', sync);
    inp.addEventListener('input', function () {
      var v = parseInt(inp.value, 10);
      if (!isNaN(v)) {
        inp.value = clamp(v, min, max);
        sync();
      }
    });

    wrap.appendChild(btnDec);
    wrap.appendChild(inp);
    wrap.appendChild(btnInc);

    btnDec.disabled = (value <= min);
    btnInc.disabled = (value >= max);

    wrap.getValue = function () { return parseInt(inp.value, 10) || min; };
    wrap.setValue = function (v) { inp.value = clamp(v, min, max); sync(); };

    return wrap;
  }

  /* ────────────────────────────────────────────────────────────
     STATE
     ──────────────────────────────────────────────────────────── */
  var state = {
    currentService: null,
    cartItems: [],
    sidebarOpen: false,
    glowState: { mode: 'idle', hoveredEl: null, activeEl: null, timer: null },
    cartMode: 'rc' // 'rc' | 'dollar' | 'custom'
  };

  /* ────────────────────────────────────────────────────────────
     DOM REFERENCES
     ──────────────────────────────────────────────────────────── */
  var elNav = $('arcNav');
  var elHubMap = $('arcHubMap');
  var elHubMobile = $('arcHubMobile');
  var elBelowMap = $('arcBelowMap');
  var elScrollHint = $('arcScrollHint');
  var elSidebar = $('arcSidebar');
  var elSidebarOverlay = $('arcSidebarOverlay');
  var elServiceView = $('arcServiceView');
  var elArt = $('arcArt');
  var elArtImage = $('arcArtImage');
  var elArtName = $('arcArtName');
  var elArtDesc = $('arcArtDesc');
  var elArtTags = $('arcArtTags');
  var configPanel = $('arcConfigPanel');
  var elCartEl = $('arcCart');
  var elCartBody = $('arcCartBody');
  var elCartEmpty = $('arcCartEmpty');
  var elCartSub = $('arcCartSub');
  var elCartFee = $('arcCartFee');
  var elCartTotal = $('arcCartTotal');
  var elCartCount = $('arcCartCount');
  var elCartDot = $('cartCount');
  var elCartFoot = $('arcCartFoot');
  var elCopyCta = $('arcCopyCta');
  var elBackBtn = $('arcBackBtn');
  var elBackBtn2 = $('arcBackBtn2');
  var elReviewsRail = $('arcReviewsRail');
  var elFaqList = $('arcFaqList');
  var elFooter = $('arcFooter');

  /* ────────────────────────────────────────────────────────────
     CART
     ──────────────────────────────────────────────────────────── */
  var cart = {
    replaceAll: function (items) {
      state.cartItems = items.filter(function (it) { return it && it.qty > 0; });
      renderCart();
    },
    remove: function (id) {
      state.cartItems = state.cartItems.filter(function (it) { return it.id !== id; });
      renderCart();
      // Re-sync configurator if needed
      if (state.onCartRemove) state.onCartRemove(id);
    },
    clear: function () {
      state.cartItems = [];
      renderCart();
    }
  };

  function renderCart() {
    var items = state.cartItems;
    var n = items.length;
    var isCustom = (state.cartMode === 'custom');
    var isDollar = (state.cartMode === 'dollar');

    // Count text
    elCartCount.textContent = n + ' item' + (n !== 1 ? 's' : '');

    // Cart badge in nav
    if (n > 0) {
      elCartDot.textContent = n;
      elCartDot.hidden = false;
    } else {
      elCartDot.hidden = true;
    }

    // has-items class on cart
    if (n > 0) {
      elCartEl.classList.add('has-items');
    } else {
      elCartEl.classList.remove('has-items');
    }

    // Build body
    if (n === 0) {
      elCartBody.innerHTML = '';
      elCartBody.appendChild(elCartEmpty);
      elCartEmpty.classList.remove('hidden');
    } else {
      elCartBody.innerHTML = '';
      elCartEmpty.classList.add('hidden');
      items.forEach(function (it) {
        var line = document.createElement('div');
        line.className = 'arc-line';

        var thumb = document.createElement('span');
        thumb.className = 'arc-line-thumb';
        thumb.style.setProperty('--thumb-color', it.color || '');
        thumb.textContent = (it.name || '?').charAt(0);

        var info = document.createElement('span');
        var nameEl = document.createElement('span');
        nameEl.className = 'arc-line-name';
        nameEl.textContent = it.name;
        var qtyEl = document.createElement('span');
        qtyEl.className = 'arc-line-qty';
        var qtyText = '× ' + it.qty;
        if (it.sub) qtyText += ' · ' + it.sub;
        qtyEl.textContent = qtyText;
        info.appendChild(nameEl);
        info.appendChild(qtyEl);

        var priceEl = document.createElement('span');
        priceEl.className = 'arc-line-price';
        if (isCustom) {
          priceEl.textContent = 'CUSTOM';
        } else {
          priceEl.textContent = coinHtml(it.price);
        }

        var xBtn = document.createElement('button');
        xBtn.type = 'button';
        xBtn.className = 'arc-line-x';
        xBtn.setAttribute('aria-label', 'Remove ' + it.name);
        xBtn.textContent = '×';
        xBtn.addEventListener('click', function () { cart.remove(it.id); });

        line.appendChild(thumb);
        line.appendChild(info);
        line.appendChild(priceEl);
        line.appendChild(xBtn);
        elCartBody.appendChild(line);
      });

      // Stream by PRO add-on slot
      if (state.streamAddon) {
        var streamLine = document.createElement('div');
        streamLine.className = 'arc-line';
        var sThumb = document.createElement('span');
        sThumb.className = 'arc-line-thumb';
        sThumb.style.setProperty('--thumb-color', '#9b6cff');
        sThumb.textContent = '▶';
        var sInfo = document.createElement('span');
        var sName = document.createElement('span');
        sName.className = 'arc-line-name';
        sName.textContent = 'Stream by PRO';
        var sQty = document.createElement('span');
        sQty.className = 'arc-line-qty';
        sQty.textContent = state.streamAddon.sub || '';
        sInfo.appendChild(sName);
        sInfo.appendChild(sQty);
        var sPrice = document.createElement('span');
        sPrice.className = 'arc-line-price';
        sPrice.textContent = coinHtml(state.streamAddon.price);
        var sX = document.createElement('span');
        streamLine.appendChild(sThumb);
        streamLine.appendChild(sInfo);
        streamLine.appendChild(sPrice);
        streamLine.appendChild(sX);
        elCartBody.appendChild(streamLine);
      }
    }

    // Totals
    if (isCustom) {
      elCartSub.textContent = 'CUSTOM';
      elCartFee.textContent = 'CUSTOM';
      elCartTotal.textContent = 'CUSTOM';
    } else {
      var subtotal = 0;
      items.forEach(function (it) { subtotal += it.price; });
      if (state.streamAddon) subtotal += state.streamAddon.price;
      var fee = Math.round(subtotal * 0.05);
      var total = subtotal + fee;

      elCartSub.textContent = coinHtml(subtotal);
      elCartFee.textContent = coinHtml(fee);
      elCartTotal.textContent = coinHtml(total);
    }
  }

  /* ────────────────────────────────────────────────────────────
     OPEN / CLOSE SERVICE
     ──────────────────────────────────────────────────────────── */
  function getService(id) {
    for (var i = 0; i < SERVICES.length; i++) {
      if (SERVICES[i].id === id) return SERVICES[i];
    }
    return null;
  }

  function openService(id) {
    var svc = getService(id);
    if (!svc) return;

    state.currentService = id;
    state.cartMode = (id === 'materials') ? 'dollar' : (id === 'custom-orders') ? 'custom' : 'rc';
    state.streamAddon = null;
    state.onCartRemove = null;

    // Hide map, show service view
    elHubMap.hidden = true;
    if (elHubMobile) elHubMobile.hidden = true;
    if (elBelowMap) elBelowMap.hidden = true;
    if (elFooter) elFooter.hidden = true;
    elServiceView.hidden = false;

    // Update art panel
    elArt.style.setProperty('--svc-color', svc.color);
    elArtImage.src = svc.image;
    elArtImage.alt = svc.name;
    elArtName.textContent = svc.name;
    elArtDesc.textContent = svc.art;
    elArtTags.innerHTML = '';
    svc.tags.forEach(function (t) {
      var span = document.createElement('span');
      span.className = 'arc-art-tag';
      span.textContent = t;
      elArtTags.appendChild(span);
    });

    // Clear cart
    cart.clear();

    // Render configurator
    renderConfig(id);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeService() {
    state.currentService = null;
    state.streamAddon = null;
    state.onCartRemove = null;

    elServiceView.hidden = true;
    elHubMap.hidden = false;
    if (elHubMobile) elHubMobile.hidden = false;
    if (elBelowMap) elBelowMap.hidden = false;
    if (elFooter) elFooter.hidden = false;

    cart.clear();
    configPanel.innerHTML = '';

    var mapEl = document.getElementById('arcHubMap');
    if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ────────────────────────────────────────────────────────────
     RENDER CONFIG DISPATCHER
     ──────────────────────────────────────────────────────────── */
  function renderConfig(serviceId) {
    configPanel.innerHTML = '';
    var renderers = {
      'custom-loadout': renderCustomLoadoutConfig,
      'all-weapons': renderAllWeaponsConfig,
      'blueprints': renderBlueprintsConfig,
      'leveling': renderLevelingConfig,
      'workshop': renderWorkshopConfig,
      'materials': renderMaterialsConfig,
      'depositary': renderDepositaryConfig,
      'boss-puzzle': renderBossPuzzleConfig,
      'raider-coins': renderRaiderCoinsConfig,
      'trials-boost': renderTrialsBoostConfig,
      'raids': renderRaidsConfig,
      'expedition-boost': renderExpeditionConfig,
      'raid-coaching': renderCoachingConfig,
      'custom-orders': renderCustomOrdersConfig,
      'assorted-seeds': renderSeedsConfig
    };
    var fn = renderers[serviceId];
    if (fn) fn();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: CUSTOM LOADOUT
     ════════════════════════════════════════════════════════════ */
  function renderCustomLoadoutConfig() {
    var PRICE_PRI = 95;
    var PRICE_SEC = 55;
    var MOD_SURCHARGE = 10; // per weapon with legendary/epic mods (0.10 RC represented as 10 for integer math — actually +0.10 per weapon, so we store in hundredths... but spec says +$0.10 per weapon. We use RC integers here.)
    var PRICE_LOOT = 22;
    var PRICE_SHIELD = 18;

    configPanel.innerHTML =
      '<div class="arc-card">' +
        '<div class="arc-card-head">' +
          '<span class="arc-card-eyebrow">◆</span>' +
          '<h3 class="arc-card-title">Primary Weapon</h3>' +
        '</div>' +
        '<label class="arc-field-label">Weapon</label>' +
        '<div class="arc-select-wrap"><select class="arc-select" id="clPriWeapon">' +
          WEAPONS.map(function (w) { return '<option value="' + escHtml(w) + '">' + escHtml(w) + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="arc-field-label-row" style="margin-top:14px"><label class="arc-field-label">Mods</label>' +
          '<button type="button" class="arc-help" data-tip="+0.10 RC per weapon for Legendary/Epic">?</button>' +
        '</div>' +
        '<div class="arc-modtoggle" id="clPriMod">' +
          '<button type="button" class="on" data-mod="none">No Mods</button>' +
          '<button type="button" data-mod="legendary">Legendary / Epic <span class="price">+0.10</span></button>' +
        '</div>' +
        '<label class="arc-field-label" style="margin-top:14px">Quantity</label>' +
        '<div id="clPriQty"></div>' +
      '</div>' +

      '<div class="arc-card">' +
        '<div class="arc-card-head">' +
          '<span class="arc-card-eyebrow">◆</span>' +
          '<h3 class="arc-card-title">Secondary Weapon</h3>' +
        '</div>' +
        '<label class="arc-field-label">Weapon</label>' +
        '<div class="arc-select-wrap"><select class="arc-select" id="clSecWeapon">' +
          WEAPONS.map(function (w) { return '<option value="' + escHtml(w) + '">' + escHtml(w) + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="arc-field-label-row" style="margin-top:14px"><label class="arc-field-label">Mods</label></div>' +
        '<div class="arc-modtoggle" id="clSecMod">' +
          '<button type="button" class="on" data-mod="none">No Mods</button>' +
          '<button type="button" data-mod="legendary">Legendary / Epic <span class="price">+0.10</span></button>' +
        '</div>' +
        '<label class="arc-field-label" style="margin-top:14px">Quantity</label>' +
        '<div id="clSecQty"></div>' +
      '</div>' +

      '<div class="arc-card">' +
        '<div class="arc-card-head">' +
          '<span class="arc-card-eyebrow">◆</span>' +
          '<h3 class="arc-card-title">Gear</h3>' +
        '</div>' +
        '<div class="arc-gear-pair">' +
          '<div class="arc-gear-cell" id="clGearLoot">' +
            '<div><span class="name">Looting Mk.3</span><span class="sub">' + fmtRC(PRICE_LOOT) + ' RC each</span></div>' +
            '<div id="clLootQty"></div>' +
          '</div>' +
          '<div class="arc-gear-cell" id="clGearShield">' +
            '<div><span class="name">Medium Shield</span><span class="sub">' + fmtRC(PRICE_SHIELD) + ' RC each</span></div>' +
            '<div id="clShieldQty"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="arc-card">' +
        '<div class="arc-card-head">' +
          '<span class="arc-card-eyebrow">◆</span>' +
          '<h3 class="arc-card-title">Quick Use</h3>' +
        '</div>' +
        '<div class="arc-quick" id="clQuickGrid"></div>' +
      '</div>';

    // Wire up steppers
    var priQtyStepper = createStepper(1, 0, 99, syncCart);
    $('clPriQty').appendChild(priQtyStepper);

    var secQtyStepper = createStepper(0, 0, 99, syncCart);
    $('clSecQty').appendChild(secQtyStepper);

    var lootStepper = createStepper(0, 0, 99, function () { syncGearHighlight(); syncCart(); });
    $('clLootQty').appendChild(lootStepper);

    var shieldStepper = createStepper(0, 0, 99, function () { syncGearHighlight(); syncCart(); });
    $('clShieldQty').appendChild(shieldStepper);

    function syncGearHighlight() {
      $('clGearLoot').classList.toggle('on', lootStepper.getValue() > 0);
      $('clGearShield').classList.toggle('on', shieldStepper.getValue() > 0);
    }

    // Mod toggles
    var priMod = 'none';
    var secMod = 'none';

    function bindModToggle(containerId, getCb, setCb) {
      var container = $(containerId);
      container.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-mod]');
        if (!btn) return;
        qsa('button', container).forEach(function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
        setCb(btn.getAttribute('data-mod'));
        syncCart();
      });
    }

    bindModToggle('clPriMod', function () { return priMod; }, function (v) { priMod = v; });
    bindModToggle('clSecMod', function () { return secMod; }, function (v) { secMod = v; });

    // Quick Use grid
    var quSteppers = {};
    var quGrid = $('clQuickGrid');
    QUICK_USE.forEach(function (qu) {
      var cell = document.createElement('div');
      cell.className = 'arc-quick-cell';
      var nameDiv = document.createElement('div');
      nameDiv.className = 'arc-quick-name';
      nameDiv.innerHTML = escHtml(qu.name) + '<span class="pack">' + fmtRC(qu.per * qu.mul) + ' RC</span>';
      cell.appendChild(nameDiv);
      var stepper = createStepper(0, 0, 99, syncCart);
      quSteppers[qu.id] = stepper;
      cell.appendChild(stepper);
      quGrid.appendChild(cell);
    });

    function syncCart() {
      var items = [];
      var priQty = priQtyStepper.getValue();
      if (priQty > 0) {
        var priPrice = priQty * PRICE_PRI + (priMod === 'legendary' ? priQty * MOD_SURCHARGE : 0);
        items.push({ id: 'cl-pri', name: $('clPriWeapon').value + ' (Primary)', qty: priQty, price: priPrice, color: '#e08a2c', sub: priMod === 'legendary' ? 'Legendary/Epic Mods' : '' });
      }
      var secQty = secQtyStepper.getValue();
      if (secQty > 0) {
        var secPrice = secQty * PRICE_SEC + (secMod === 'legendary' ? secQty * MOD_SURCHARGE : 0);
        items.push({ id: 'cl-sec', name: $('clSecWeapon').value + ' (Secondary)', qty: secQty, price: secPrice, color: '#c98a2c', sub: secMod === 'legendary' ? 'Legendary/Epic Mods' : '' });
      }
      var lootQty = lootStepper.getValue();
      if (lootQty > 0) items.push({ id: 'cl-loot', name: 'Looting Mk.3', qty: lootQty, price: lootQty * PRICE_LOOT, color: '#4ec6e8' });
      var shieldQty = shieldStepper.getValue();
      if (shieldQty > 0) items.push({ id: 'cl-shield', name: 'Medium Shield', qty: shieldQty, price: shieldQty * PRICE_SHIELD, color: '#7faedc' });
      QUICK_USE.forEach(function (qu) {
        var q = quSteppers[qu.id].getValue();
        if (q > 0) items.push({ id: qu.id, name: qu.name, qty: q * qu.mul, price: q * qu.per * qu.mul, color: qu.color });
      });
      cart.replaceAll(items);
    }

    // Weapon change listeners
    $('clPriWeapon').addEventListener('change', syncCart);
    $('clSecWeapon').addEventListener('change', syncCart);

    syncCart();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: ALL WEAPONS
     ════════════════════════════════════════════════════════════ */
  function renderAllWeaponsConfig() {
    var PRICE_PER = 95;
    var BUNDLE_QTY = 20;
    var BUNDLE_DISCOUNT = 0.10;

    configPanel.innerHTML =
      '<div class="arc-card">' +
        '<div class="arc-card-head">' +
          '<span class="arc-card-eyebrow">◆</span>' +
          '<h3 class="arc-card-title">Weapon</h3>' +
        '</div>' +
        '<label class="arc-field-label">Select weapon</label>' +
        '<div class="arc-select-wrap"><select class="arc-select" id="awWeapon">' +
          WEAPONS.map(function (w) { return '<option value="' + escHtml(w) + '">' + escHtml(w) + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="arc-field-label-row" style="margin-top:14px"><label class="arc-field-label">Mods</label></div>' +
        '<div class="arc-modtoggle" id="awMod">' +
          '<button type="button" class="on" data-mod="none">No Mods</button>' +
          '<button type="button" data-mod="legendary">Legendary / Epic <span class="price">+0.10</span></button>' +
        '</div>' +
        '<label class="arc-field-label" style="margin-top:14px">Quantity</label>' +
        '<div id="awQty"></div>' +
        '<button type="button" class="arc-bundle-toggle" id="awBundle">' +
          '<span class="arc-ws-switch"></span>' +
          '<span class="arc-bundle-toggle-body">' +
            '<span class="arc-bundle-toggle-title">20x Bundle Mode</span>' +
            '<span class="arc-bundle-toggle-sub">Qty locked at 20 · Legendary forced · −10%</span>' +
          '</span>' +
          '<span class="arc-bundle-toggle-badge">−10%</span>' +
        '</button>' +
      '</div>';

    var modVal = 'none';
    var bundleOn = false;
    var qtyStepper = createStepper(1, 1, 99, syncCart);
    $('awQty').appendChild(qtyStepper);

    $('awMod').addEventListener('click', function (e) {
      if (bundleOn) return;
      var btn = e.target.closest('button[data-mod]');
      if (!btn) return;
      qsa('button', $('awMod')).forEach(function (b) { b.classList.remove('on'); });
      btn.classList.add('on');
      modVal = btn.getAttribute('data-mod');
      syncCart();
    });

    $('awBundle').addEventListener('click', function () {
      bundleOn = !bundleOn;
      $('awBundle').classList.toggle('on', bundleOn);
      if (bundleOn) {
        qtyStepper.setValue(BUNDLE_QTY);
        qs('input', qtyStepper).disabled = true;
        qsa('button', qtyStepper).forEach(function (b) { b.disabled = true; });
        modVal = 'legendary';
        qsa('button', $('awMod')).forEach(function (b) { b.classList.remove('on'); });
        qs('button[data-mod="legendary"]', $('awMod')).classList.add('on');
        qsa('button', $('awMod')).forEach(function (b) { b.disabled = true; });
      } else {
        qs('input', qtyStepper).disabled = false;
        qsa('button', $('awMod')).forEach(function (b) { b.disabled = false; });
        qtyStepper.setValue(1);
      }
      syncCart();
    });

    $('awWeapon').addEventListener('change', syncCart);

    function syncCart() {
      var qty = qtyStepper.getValue();
      var perUnit = PRICE_PER + (modVal === 'legendary' ? 10 : 0);
      var total = qty * perUnit;
      if (bundleOn) total = Math.round(total * (1 - BUNDLE_DISCOUNT));
      var sub = modVal === 'legendary' ? 'Legendary/Epic Mods' : '';
      if (bundleOn) sub = (sub ? sub + ' · ' : '') + 'Bundle −10%';
      cart.replaceAll([{ id: 'aw-weapon', name: $('awWeapon').value, qty: qty, price: total, color: '#c98a2c', sub: sub }]);
    }

    syncCart();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: BLUEPRINTS
     ════════════════════════════════════════════════════════════ */
  function renderBlueprintsConfig() {
    var activeTab = 0;
    var selected = {}; // key: tabId-itemIdx, value: { tier: string|null }
    var tierChoices = {}; // key: tabId-itemIdx, value: tier string

    function priceFor(tabId, base, tier) {
      if (tabId === 'gunpart' && tier === 'III') return Math.round(base * 1.2);
      return base;
    }
    function defaultTier(item) {
      if (!item.tiers) return null;
      if (item.tiers.indexOf('II') >= 0) return 'II';
      return item.tiers[0];
    }

    function render() {
      var tab = BP_TABS[activeTab];
      var allSelected = tab.items.every(function (_, i) { return selected[tab.id + '-' + i]; });

      var html =
        '<div class="arc-card">' +
          '<div class="arc-card-head">' +
            '<span class="arc-card-eyebrow">◆</span>' +
            '<h3 class="arc-card-title">Blueprints</h3>' +
          '</div>' +
          '<div class="arc-bp-tabs">' +
            BP_TABS.map(function (t, i) {
              return '<button type="button" class="arc-bp-tab' + (i === activeTab ? ' active' : '') + '" data-tabidx="' + i + '">' + escHtml(t.label) + '</button>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div class="arc-card">' +
          '<div class="arc-card-head">' +
            '<h3 class="arc-card-title">' + escHtml(tab.label) + '</h3>' +
            '<button type="button" class="arc-bp-selectall' + (allSelected ? ' deselect' : '') + '" id="bpSelectAll">' + (allSelected ? 'Deselect All' : 'Select All') + '</button>' +
          '</div>' +
          '<div class="arc-bp-grid' + (tab.id === 'backpack' ? ' arc-bp-grid-2col' : '') + '">' +
            tab.items.map(function (item, i) {
              var key = tab.id + '-' + i;
              var isOn = !!selected[key];
              var tier = tierChoices[key] || defaultTier(item);
              var p = priceFor(tab.id, tab.price, tier);
              var cellHtml = '<button type="button" class="arc-bp-cell' + (isOn ? ' on' : '') + '" data-idx="' + i + '">';
              cellHtml += '<span class="arc-bp-cell-name">' + escHtml(item.name) + '</span>';
              if (item.tiers) {
                cellHtml += '<span class="arc-bp-tier-row">';
                item.tiers.forEach(function (t) {
                  cellHtml += '<span class="arc-bp-tier' + (t === tier ? ' on' : '') + '" data-tier="' + t + '" data-idx="' + i + '">' + t + '</span>';
                });
                cellHtml += '</span>';
              }
              cellHtml += '<span class="arc-bp-cell-price">' + fmtRC(p) + ' RC</span>';
              cellHtml += '</button>';
              return cellHtml;
            }).join('') +
          '</div>' +
        '</div>';

      configPanel.innerHTML = html;

      // Tab clicks
      qsa('.arc-bp-tab', configPanel).forEach(function (btn) {
        btn.addEventListener('click', function () {
          activeTab = parseInt(btn.getAttribute('data-tabidx'), 10);
          render();
        });
      });

      // Cell clicks
      qsa('.arc-bp-cell', configPanel).forEach(function (cell) {
        cell.addEventListener('click', function (e) {
          if (e.target.closest('.arc-bp-tier')) return;
          var idx = parseInt(cell.getAttribute('data-idx'), 10);
          var key = tab.id + '-' + idx;
          if (selected[key]) {
            delete selected[key];
          } else {
            var item = tab.items[idx];
            var tier = tierChoices[key] || defaultTier(item);
            selected[key] = { tier: tier };
          }
          render();
        });
      });

      // Tier clicks
      qsa('.arc-bp-tier', configPanel).forEach(function (tierEl) {
        tierEl.addEventListener('click', function (e) {
          e.stopPropagation();
          var idx = parseInt(tierEl.getAttribute('data-idx'), 10);
          var key = tab.id + '-' + idx;
          var t = tierEl.getAttribute('data-tier');
          tierChoices[key] = t;
          if (selected[key]) selected[key].tier = t;
          render();
        });
      });

      // Select all / Deselect all
      var saBtn = $('bpSelectAll');
      if (saBtn) {
        saBtn.addEventListener('click', function () {
          if (allSelected) {
            tab.items.forEach(function (_, i) { delete selected[tab.id + '-' + i]; });
          } else {
            tab.items.forEach(function (item, i) {
              var key = tab.id + '-' + i;
              var tier = tierChoices[key] || defaultTier(item);
              selected[key] = { tier: tier };
            });
          }
          render();
        });
      }

      syncCart();
    }

    function syncCart() {
      var items = [];
      BP_TABS.forEach(function (tab) {
        tab.items.forEach(function (item, i) {
          var key = tab.id + '-' + i;
          if (!selected[key]) return;
          var tier = selected[key].tier;
          var p = priceFor(tab.id, tab.price, tier);
          var sub = tab.sub;
          if (tier) sub += ' · Tier ' + tier;
          items.push({ id: 'bp-' + key, name: item.name, qty: 1, price: p, color: tab.color, sub: sub });
        });
      });
      cart.replaceAll(items);
    }

    render();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: LEVELING
     ════════════════════════════════════════════════════════════ */
  function renderLevelingConfig() {
    var PRICE_PER_LEVEL = 200; // $2.00 => 200 RC
    var SPEEDS = [
      { id: 'standard', label: 'Standard', mul: 1.0, pct: '' },
      { id: 'express', label: 'Express', mul: 1.10, pct: '+10%' },
      { id: 'super', label: 'Super Express', mul: 1.25, pct: '+25%' }
    ];

    configPanel.innerHTML =
      '<div class="arc-card">' +
        '<div class="arc-card-head">' +
          '<span class="arc-card-eyebrow">◆</span>' +
          '<h3 class="arc-card-title">Level Range</h3>' +
        '</div>' +
        '<div class="arc-level-row">' +
          '<div><label class="arc-field-label">Current Level</label><div id="lvlCur"></div></div>' +
          '<div><label class="arc-field-label">Target Level</label><div id="lvlTgt"></div></div>' +
        '</div>' +
      '</div>' +

      '<div class="arc-card">' +
        '<div class="arc-card-head">' +
          '<span class="arc-card-eyebrow">◆</span>' +
          '<h3 class="arc-card-title">Speed</h3>' +
        '</div>' +
        '<div class="arc-pilltoggle" id="lvlSpeed">' +
          SPEEDS.map(function (s) {
            return '<button type="button" data-speed="' + s.id + '"' + (s.id === 'standard' ? ' class="on"' : '') + '>' +
              escHtml(s.label) + (s.pct ? ' <span class="pct">' + s.pct + '</span>' : '') +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>';

    var speedVal = 'standard';
    var curStepper = createStepper(1, 1, 74, function () {
      var c = curStepper.getValue();
      var t = tgtStepper.getValue();
      if (t <= c) tgtStepper.setValue(c + 1);
      syncCart();
    });
    var tgtStepper = createStepper(2, 2, 75, syncCart);
    $('lvlCur').appendChild(curStepper);
    $('lvlTgt').appendChild(tgtStepper);

    $('lvlSpeed').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-speed]');
      if (!btn) return;
      qsa('button', $('lvlSpeed')).forEach(function (b) { b.classList.remove('on'); });
      btn.classList.add('on');
      speedVal = btn.getAttribute('data-speed');
      syncCart();
    });

    function syncCart() {
      var c = curStepper.getValue();
      var t = tgtStepper.getValue();
      if (t <= c) { tgtStepper.setValue(c + 1); t = c + 1; }
      var diff = t - c;
      var spd = SPEEDS.filter(function (s) { return s.id === speedVal; })[0];
      var price = Math.round(diff * PRICE_PER_LEVEL * spd.mul);
      var sub = 'Lv.' + c + ' → Lv.' + t + (spd.id !== 'standard' ? ' · ' + spd.label : '');
      cart.replaceAll([{ id: 'lvl', name: 'Leveling', qty: diff, price: price, color: '#e5c26b', sub: sub }]);
    }

    syncCart();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: WORKSHOP & SCRAPPY
     ════════════════════════════════════════════════════════════ */
  function renderWorkshopConfig() {
    var BENCH_PRICE = 300; // $3.00 per level diff
    var SCRAPPY_PRICE = 300;
    var MAX_BUNDLE_PRICE = 4590;
    var BENCHES = ['Gunsmith', 'Gear Bench', 'Medical Lab', 'Explosive Station', 'Utility Station', 'Refiner'];

    var wsTab = 'workshop'; // 'workshop' | 'scrappy'
    var maxBundle = false;
    var benchSelected = {};
    var wsFrom = 1;
    var wsTo = 3;
    var scFrom = 1;
    var scTo = 5;

    function render() {
      var html =
        '<div class="arc-card">' +
          '<div class="arc-card-head">' +
            '<span class="arc-card-eyebrow">◆</span>' +
            '<h3 class="arc-card-title">Workshop &amp; Scrappy</h3>' +
          '</div>' +
          '<button type="button" class="arc-bundle-toggle' + (maxBundle ? ' on' : '') + '" id="wsMaxBundle">' +
            '<span class="arc-ws-switch"></span>' +
            '<span class="arc-bundle-toggle-body">' +
              '<span class="arc-bundle-toggle-title">Max Bundle</span>' +
              '<span class="arc-bundle-toggle-sub">All 6 benches L3 + Scrappy L5 · −10%</span>' +
            '</span>' +
            '<span class="arc-bundle-toggle-badge">' + coinHtml(MAX_BUNDLE_PRICE) + '</span>' +
          '</button>' +
        '</div>';

      if (!maxBundle) {
        html +=
          '<div class="arc-card">' +
            '<div class="arc-card-head">' +
              '<h3 class="arc-card-title">Mode</h3>' +
            '</div>' +
            '<div class="arc-modtoggle" id="wsTabSel">' +
              '<button type="button" data-tab="workshop"' + (wsTab === 'workshop' ? ' class="on"' : '') + '>Workshop</button>' +
              '<button type="button" data-tab="scrappy"' + (wsTab === 'scrappy' ? ' class="on"' : '') + '>Scrappy</button>' +
            '</div>' +
          '</div>';

        if (wsTab === 'workshop') {
          html +=
            '<div class="arc-card">' +
              '<div class="arc-card-head"><h3 class="arc-card-title">Level Range</h3></div>' +
              '<div class="arc-level-row">' +
                '<div><label class="arc-field-label">From Level</label><div id="wsFrom"></div></div>' +
                '<div><label class="arc-field-label">To Level</label><div id="wsTo"></div></div>' +
              '</div>' +
            '</div>' +
            '<div class="arc-card">' +
              '<div class="arc-card-head"><h3 class="arc-card-title">Benches</h3></div>' +
              '<div class="arc-ws-rows" id="wsBenches">' +
                BENCHES.map(function (b) {
                  return '<button type="button" class="arc-ws-row' + (benchSelected[b] ? ' on' : '') + '" data-bench="' + escHtml(b) + '">' +
                    '<span class="arc-ws-switch"></span>' +
                    '<span class="arc-ws-name">' + escHtml(b) + '</span>' +
                    '<span class="arc-ws-price">' + fmtRC(BENCH_PRICE) + ' RC / level</span>' +
                  '</button>';
                }).join('') +
              '</div>' +
            '</div>';
        } else {
          html +=
            '<div class="arc-card">' +
              '<div class="arc-card-head"><h3 class="arc-card-title">Scrappy Level Range</h3></div>' +
              '<div class="arc-level-row">' +
                '<div><label class="arc-field-label">From Level</label><div id="scFrom"></div></div>' +
                '<div><label class="arc-field-label">To Level</label><div id="scTo"></div></div>' +
              '</div>' +
            '</div>';
        }
      }

      configPanel.innerHTML = html;

      // Max bundle toggle
      $('wsMaxBundle').addEventListener('click', function () {
        maxBundle = !maxBundle;
        render();
      });

      if (!maxBundle) {
        // Tab selector
        $('wsTabSel').addEventListener('click', function (e) {
          var btn = e.target.closest('button[data-tab]');
          if (!btn) return;
          wsTab = btn.getAttribute('data-tab');
          render();
        });

        if (wsTab === 'workshop') {
          var fromStepper = createStepper(wsFrom, 1, 2, function (v) {
            wsFrom = v;
            if (wsTo <= wsFrom) { wsTo = wsFrom + 1; toStepper.setValue(wsTo); }
            syncCart();
          });
          var toStepper = createStepper(wsTo, 2, 3, function (v) {
            wsTo = v;
            if (wsTo <= wsFrom) { wsFrom = wsTo - 1; fromStepper.setValue(wsFrom); }
            syncCart();
          });
          $('wsFrom').appendChild(fromStepper);
          $('wsTo').appendChild(toStepper);

          qsa('.arc-ws-row', $('wsBenches')).forEach(function (row) {
            row.addEventListener('click', function () {
              var b = row.getAttribute('data-bench');
              benchSelected[b] = !benchSelected[b];
              row.classList.toggle('on', benchSelected[b]);
              syncCart();
            });
          });
        } else {
          var scFromStepper = createStepper(scFrom, 1, 4, function (v) {
            scFrom = v;
            if (scTo <= scFrom) { scTo = scFrom + 1; scToStepper.setValue(scTo); }
            syncCart();
          });
          var scToStepper = createStepper(scTo, 2, 5, function (v) {
            scTo = v;
            if (scTo <= scFrom) { scFrom = scTo - 1; scFromStepper.setValue(scFrom); }
            syncCart();
          });
          $('scFrom').appendChild(scFromStepper);
          $('scTo').appendChild(scToStepper);
        }
      }

      syncCart();
    }

    function syncCart() {
      if (maxBundle) {
        cart.replaceAll([{ id: 'ws-max', name: 'Max Bundle', qty: 1, price: MAX_BUNDLE_PRICE, color: '#d4571b', sub: 'All benches L3 + Scrappy L5 · −10%' }]);
        return;
      }

      var items = [];
      if (wsTab === 'workshop') {
        var diff = wsTo - wsFrom;
        BENCHES.forEach(function (b) {
          if (!benchSelected[b]) return;
          items.push({ id: 'ws-' + b, name: b, qty: diff, price: diff * BENCH_PRICE, color: '#d4571b', sub: 'L' + wsFrom + ' → L' + wsTo });
        });
      } else {
        var sdiff = scTo - scFrom;
        if (sdiff > 0) {
          items.push({ id: 'ws-scrappy', name: 'Scrappy', qty: sdiff, price: sdiff * SCRAPPY_PRICE, color: '#d4571b', sub: 'L' + scFrom + ' → L' + scTo });
        }
      }
      cart.replaceAll(items);
    }

    render();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: ALL MATERIALS
     ════════════════════════════════════════════════════════════ */
  function renderMaterialsConfig() {
    var activeCat = 0;
    var quantities = {}; // key: catId-itemIdx, value: qty
    var searchQuery = '';

    function render() {
      var cat = MATERIALS_CATS[activeCat];
      var filteredItems = [];
      var filteredIdxMap = [];

      if (searchQuery) {
        // Search across all categories
        MATERIALS_CATS.forEach(function (c, ci) {
          c.items.forEach(function (item, ii) {
            if (item.name.toLowerCase().indexOf(searchQuery) >= 0) {
              filteredItems.push({ item: item, catIdx: ci, itemIdx: ii, catLabel: c.label });
              filteredIdxMap.push(c.id + '-' + ii);
            }
          });
        });
      } else {
        cat.items.forEach(function (item, ii) {
          filteredItems.push({ item: item, catIdx: activeCat, itemIdx: ii, catLabel: cat.label });
          filteredIdxMap.push(cat.id + '-' + ii);
        });
      }

      var allInTabSelected = !searchQuery && cat.items.every(function (_, i) {
        return (quantities[cat.id + '-' + i] || 0) > 0;
      });

      var html =
        '<div class="arc-card">' +
          '<div class="arc-card-head">' +
            '<span class="arc-card-eyebrow">◆</span>' +
            '<h3 class="arc-card-title">All Materials</h3>' +
          '</div>' +
          '<div class="arc-mat-search">' +
            '<svg class="arc-mat-search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.4"/><path d="M11 11L15 15" stroke="currentColor" stroke-width="1.4"/></svg>' +
            '<input type="text" class="arc-mat-search-input" id="matSearch" placeholder="Search materials..." value="' + escHtml(searchQuery) + '">' +
            '<button type="button" class="arc-mat-search-clear" id="matClear">&times;</button>' +
          '</div>' +
        '</div>';

      if (!searchQuery) {
        html +=
          '<div class="arc-card">' +
            '<div class="arc-card-head">' +
              '<h3 class="arc-card-title">Category</h3>' +
              '<button type="button" class="arc-bp-selectall' + (allInTabSelected ? ' deselect' : '') + '" id="matSelectAll">' + (allInTabSelected ? 'Deselect All' : 'Select All') + '</button>' +
            '</div>' +
            '<div class="arc-bp-tabs">' +
              MATERIALS_CATS.map(function (c, i) {
                return '<button type="button" class="arc-bp-tab' + (i === activeCat ? ' active' : '') + '" data-catidx="' + i + '">' + escHtml(c.label) + '</button>';
              }).join('') +
            '</div>' +
          '</div>';
      }

      html += '<div class="arc-card"><div class="arc-bp-grid" id="matGrid">';

      if (filteredItems.length === 0) {
        html += '<div class="arc-bp-empty"><span class="arc-bp-empty-eye">No Results</span><p>No materials match your search.</p></div>';
      } else {
        filteredItems.forEach(function (fi) {
          var key = MATERIALS_CATS[fi.catIdx].id + '-' + fi.itemIdx;
          var qty = quantities[key] || 0;
          var isOn = qty > 0;
          var sc = matSizeClass(fi.item.name);
          html += '<div class="arc-bp-cell arc-mat-cell' + (isOn ? ' on' : '') + '" data-key="' + key + '" data-catidx="' + fi.catIdx + '" data-itemidx="' + fi.itemIdx + '">';
          html += '<button type="button" class="arc-mat-clear" aria-label="Clear">&times;</button>';
          html += '<span class="arc-mat-name' + (sc ? ' ' + sc : '') + '">' + escHtml(fi.item.name) + '</span>';
          if (searchQuery) html += '<span class="arc-mat-cell-cat">' + escHtml(fi.catLabel) + '</span>';
          html += '<div class="arc-mat-cell-foot">';
          html += '<span class="arc-mat-cell-price">' + fmtDollar(fi.item.price) + '</span>';
          html += '<div class="arc-mat-stepper-slot" data-key="' + key + '"></div>';
          html += '</div></div>';
        });
      }
      html += '</div></div>';

      configPanel.innerHTML = html;

      // Wire search
      var searchEl = $('matSearch');
      searchEl.addEventListener('input', function () {
        searchQuery = searchEl.value.trim().toLowerCase();
        render();
      });
      $('matClear').addEventListener('click', function () {
        searchQuery = '';
        render();
      });

      // Wire cat tabs
      qsa('.arc-bp-tab[data-catidx]', configPanel).forEach(function (btn) {
        btn.addEventListener('click', function () {
          activeCat = parseInt(btn.getAttribute('data-catidx'), 10);
          render();
        });
      });

      // Wire steppers
      qsa('.arc-mat-stepper-slot', configPanel).forEach(function (slot) {
        var key = slot.getAttribute('data-key');
        var stepper = createStepper(quantities[key] || 0, 0, 99, function (v) {
          quantities[key] = v;
          var cell = slot.closest('.arc-mat-cell');
          if (cell) cell.classList.toggle('on', v > 0);
          syncCart();
        });
        slot.appendChild(stepper);
      });

      // Wire clear buttons
      qsa('.arc-mat-clear', configPanel).forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var cell = btn.closest('.arc-mat-cell');
          var key = cell.getAttribute('data-key');
          quantities[key] = 0;
          cell.classList.remove('on');
          var stepperSlot = qs('.arc-mat-stepper-slot[data-key="' + key + '"]', cell);
          var inp = qs('input', stepperSlot);
          if (inp) { inp.value = 0; inp.dispatchEvent(new Event('change')); }
          syncCart();
        });
      });

      // Select all
      var saBtn = $('matSelectAll');
      if (saBtn) {
        saBtn.addEventListener('click', function () {
          var c = MATERIALS_CATS[activeCat];
          if (allInTabSelected) {
            c.items.forEach(function (_, i) { quantities[c.id + '-' + i] = 0; });
          } else {
            c.items.forEach(function (_, i) {
              var k = c.id + '-' + i;
              if (!quantities[k]) quantities[k] = 1;
            });
          }
          render();
        });
      }

      syncCart();
    }

    function syncCart() {
      var items = [];
      MATERIALS_CATS.forEach(function (cat) {
        cat.items.forEach(function (item, i) {
          var key = cat.id + '-' + i;
          var qty = quantities[key] || 0;
          if (qty <= 0) return;
          items.push({ id: 'mat-' + key, name: item.name, qty: qty, price: qty * item.price, color: cat.color, sub: cat.label });
        });
      });
      cart.replaceAll(items);
    }

    render();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: DEPOSITARY
     ════════════════════════════════════════════════════════════ */
  function renderDepositaryConfig() {
    var PRICE_PER_SLOT = 35; // $0.35 => 35 cents
    var MIN_SLOTS = 20;
    var MAX_SLOTS = 280;

    configPanel.innerHTML =
      '<div class="arc-card">' +
        '<div class="arc-card-head">' +
          '<span class="arc-card-eyebrow">◆</span>' +
          '<h3 class="arc-card-title">Depositary Slots</h3>' +
        '</div>' +
        '<div class="arc-fromto arc-fromto--bare">' +
          '<div class="arc-fromto-cell">' +
            '<span class="arc-fromto-eye">Slots</span>' +
            '<span class="arc-fromto-num" id="depNum">' + MIN_SLOTS + '</span>' +
          '</div>' +
          '<div class="arc-fromto-cell">' +
            '<span class="arc-fromto-eye">Price</span>' +
            '<span class="arc-fromto-num" id="depPrice">' + fmtRC(MIN_SLOTS * PRICE_PER_SLOT) + '</span>' +
          '</div>' +
        '</div>' +
        '<input type="range" class="arc-rc-slider" id="depSlider" min="' + MIN_SLOTS + '" max="' + MAX_SLOTS + '" step="1" value="' + MIN_SLOTS + '">' +
        '<div class="arc-stepper-wide" style="margin-top:14px"><div id="depStepper"></div></div>' +
      '</div>';

    var slider = $('depSlider');
    var numEl = $('depNum');
    var priceNumEl = $('depPrice');

    var stepper = createStepper(MIN_SLOTS, MIN_SLOTS, MAX_SLOTS, function (v) {
      slider.value = v;
      updateSliderFill();
      numEl.textContent = v;
      priceNumEl.textContent = fmtRC(v * PRICE_PER_SLOT);
      syncCart();
    });
    $('depStepper').appendChild(stepper);

    function updateSliderFill() {
      var v = parseInt(slider.value, 10);
      var pct = ((v - MIN_SLOTS) / (MAX_SLOTS - MIN_SLOTS)) * 100;
      slider.style.setProperty('--p', pct + '%');
    }

    slider.addEventListener('input', function () {
      var v = parseInt(slider.value, 10);
      stepper.setValue(v);
      numEl.textContent = v;
      priceNumEl.textContent = fmtRC(v * PRICE_PER_SLOT);
      updateSliderFill();
      syncCart();
    });

    function syncCart() {
      var slots = stepper.getValue();
      cart.replaceAll([{ id: 'dep', name: 'Depositary Slots', qty: slots, price: slots * PRICE_PER_SLOT, color: '#b794d6', sub: slots + ' slots' }]);
    }

    updateSliderFill();
    syncCart();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: BOSS & PUZZLE
     ════════════════════════════════════════════════════════════ */
  function renderBossPuzzleConfig() {
    var ITEMS = [
      { id: 'bp-queen', name: 'Queen Kill', price: 2000, color: '#c75059' },
      { id: 'bp-matriarch', name: 'Matriarch Kill', price: 2000, color: '#c75059' },
      { id: 'bp-harvester', name: 'Harvester Puzzle', price: 2000, color: '#c75059' }
    ];

    configPanel.innerHTML =
      '<div class="arc-card">' +
        '<div class="arc-card-head">' +
          '<span class="arc-card-eyebrow">◆</span>' +
          '<h3 class="arc-card-title">Boss &amp; Puzzle</h3>' +
        '</div>' +
        '<div class="arc-gear-stack" id="bpStack"></div>' +
      '</div>';

    var steppers = {};
    var stack = $('bpStack');
    ITEMS.forEach(function (it) {
      var cell = document.createElement('div');
      cell.className = 'arc-gear-cell';
      cell.id = 'bp-cell-' + it.id;
      var info = document.createElement('div');
      var nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      nameSpan.textContent = it.name;
      var sub = document.createElement('span');
      sub.className = 'sub';
      sub.textContent = fmtRC(it.price) + ' RC each';
      info.appendChild(nameSpan);
      info.appendChild(sub);
      cell.appendChild(info);
      var stepper = createStepper(0, 0, 10, function () {
        cell.classList.toggle('on', stepper.getValue() > 0);
        syncCart();
      });
      steppers[it.id] = stepper;
      cell.appendChild(stepper);
      stack.appendChild(cell);
    });

    function syncCart() {
      var items = [];
      ITEMS.forEach(function (it) {
        var qty = steppers[it.id].getValue();
        if (qty > 0) items.push({ id: it.id, name: it.name, qty: qty, price: qty * it.price, color: it.color });
      });
      cart.replaceAll(items);
    }

    syncCart();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: RAIDER COINS
     ════════════════════════════════════════════════════════════ */
  function renderRaiderCoinsConfig() {
    var RC_MIN = 100000;
    var RC_MAX = 12000000;
    var RC_STEP = 100000;
    var RC_BASE_RATE = 0.0000025;
    var TIERS = [
      { threshold: 12000000, disc: 0.25 },
      { threshold: 9000000, disc: 0.20 },
      { threshold: 6000000, disc: 0.15 },
      { threshold: 3000000, disc: 0.10 }
    ];
    var PRESETS = [
      { coins: 3000000, price: 675 },
      { coins: 6000000, price: 1275 },
      { coins: 9000000, price: 1800 },
      { coins: 12000000, price: 2250 }
    ];

    function getDiscount(amount) {
      for (var i = 0; i < TIERS.length; i++) {
        if (amount >= TIERS[i].threshold) return TIERS[i].disc;
      }
      return 0;
    }

    function calcPrice(amount) {
      var base = amount * RC_BASE_RATE;
      var disc = getDiscount(amount);
      return Math.round(base * (1 - disc) * 100);
    }

    function fmtShort(n) {
      if (n >= 1000000) return (n / 1000000) + 'M';
      if (n >= 1000) return (n / 1000) + 'K';
      return String(n);
    }

    var currentAmount = RC_MIN;

    function render() {
      var disc = getDiscount(currentAmount);
      var priceCents = calcPrice(currentAmount);
      var pct = ((currentAmount - RC_MIN) / (RC_MAX - RC_MIN)) * 100;

      // Next tier hint
      var hintHtml = '';
      var nextTier = null;
      for (var i = TIERS.length - 1; i >= 0; i--) {
        if (currentAmount < TIERS[i].threshold) { nextTier = TIERS[i]; break; }
      }
      if (nextTier && currentAmount < RC_MAX) {
        hintHtml = '<div class="arc-rc-hint">' +
          '<span class="pct">' + Math.round(nextTier.disc * 100) + '%</span> discount at ' + fmtShort(nextTier.threshold) +
          ' — add ' + fmtShort(nextTier.threshold - currentAmount) + ' more' +
        '</div>';
      } else if (currentAmount >= RC_MAX) {
        hintHtml = '<div class="arc-rc-hint max"><span class="pct">MAX</span> Maximum tier unlocked — 25% discount applied</div>';
      }

      configPanel.innerHTML =
        '<div class="arc-card">' +
          '<div class="arc-card-head">' +
            '<span class="arc-card-eyebrow">◆</span>' +
            '<h3 class="arc-card-title">Raider Coins</h3>' +
          '</div>' +
          '<div class="arc-rc-stat-row">' +
            '<div><span class="arc-rc-stat-label">Amount</span>' +
              '<span class="arc-rc-big">' + fmtShort(currentAmount) + '<span class="unit">RC</span></span></div>' +
            '<div><span class="arc-rc-stat-sub">' + fmtDollar(priceCents) + (disc > 0 ? ' <span class="arc-sd-disc">−' + Math.round(disc * 100) + '%</span>' : '') + '</span></div>' +
          '</div>' +
          '<input type="range" class="arc-rc-slider" id="rcSlider" min="' + RC_MIN + '" max="' + RC_MAX + '" step="' + RC_STEP + '" value="' + currentAmount + '">' +
          '<div class="arc-rc-ticks">' +
            TIERS.slice().reverse().map(function (t) {
              var pos = ((t.threshold - RC_MIN) / (RC_MAX - RC_MIN)) * 100;
              var passed = currentAmount >= t.threshold;
              return '<span class="arc-rc-tick' + (passed ? ' passed' : '') + '" style="left:' + pos + '%"><span class="label">' + fmtShort(t.threshold) + '</span><span class="at">−' + Math.round(t.disc * 100) + '%</span></span>';
            }).join('') +
          '</div>' +
          hintHtml +
        '</div>' +

        '<div class="arc-card">' +
          '<div class="arc-card-head"><h3 class="arc-card-title">Presets</h3></div>' +
          '<div class="arc-rc-presets">' +
            PRESETS.map(function (p) {
              var isOn = currentAmount === p.coins;
              return '<button type="button" class="arc-rc-preset' + (isOn ? ' on' : '') + '" data-coins="' + p.coins + '">' +
                '<span class="arc-rc-preset-row"><span class="arc-rc-preset-coins">' + fmtShort(p.coins) + '</span><span class="arc-rc-preset-price">' + fmtDollar(p.price) + '</span></span>' +
                '<span class="arc-rc-preset-sub">Raider Coins</span>' +
              '</button>';
            }).join('') +
          '</div>' +
          '<div class="arc-rc-foot"><span class="arc-rc-foot-tag">Prices in USD at daily rate</span></div>' +
        '</div>';

      // Slider fill
      var slider = $('rcSlider');
      slider.style.setProperty('--p', pct + '%');

      slider.addEventListener('input', function () {
        currentAmount = parseInt(slider.value, 10);
        render();
      });

      // Preset clicks
      qsa('.arc-rc-preset', configPanel).forEach(function (btn) {
        btn.addEventListener('click', function () {
          currentAmount = parseInt(btn.getAttribute('data-coins'), 10);
          render();
        });
      });

      syncCart();
    }

    function syncCart() {
      var priceCents = calcPrice(currentAmount);
      var disc = getDiscount(currentAmount);
      var sub = fmtShort(currentAmount) + ' RC';
      if (disc > 0) sub += ' · −' + Math.round(disc * 100) + '%';
      cart.replaceAll([{ id: 'rc', name: 'Raider Coins', qty: 1, price: priceCents, color: '#e5c26b', sub: sub }]);
    }

    render();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: TRIALS BOOST
     ════════════════════════════════════════════════════════════ */
  function renderTrialsBoostConfig() {
    var weeklyOn = false;
    var rankUpOn = false;
    var challengeOn = false;
    var rankOption = 0; // 0/1/2/3 => +$0/+$5/+$10/+$15
    var RANK_OPTS = [
      { label: '+0 Ranks', add: 0 },
      { label: '+1 Rank', add: 500 },
      { label: '+2 Ranks', add: 1000 },
      { label: '+3 Ranks', add: 1500 }
    ];
    var selectedRank = TRIALS_RANKS[0];

    function render() {
      configPanel.innerHTML =
        '<div class="arc-card">' +
          '<div class="arc-card-head">' +
            '<span class="arc-card-eyebrow">◆</span>' +
            '<h3 class="arc-card-title">Trials Boost</h3>' +
          '</div>' +
          '<div class="arc-ws-rows">' +

            '<button type="button" class="arc-ws-row' + (weeklyOn ? ' on' : '') + '" id="trWeekly">' +
              '<span class="arc-ws-switch"></span>' +
              '<span class="arc-ws-name">Weekly All 3 Star</span>' +
              '<span class="arc-trials-price">$20.00</span>' +
            '</button>' +

            '<button type="button" class="arc-ws-row' + (rankUpOn ? ' on' : '') + '" id="trRankUp">' +
              '<span class="arc-ws-switch"></span>' +
              '<span class="arc-ws-name">Rank Up Service</span>' +
              '<span class="arc-trials-price">$' + ((2000 + RANK_OPTS[rankOption].add) / 100).toFixed(2) + '</span>' +
            '</button>' +

            '<div class="arc-trials-collapse' + (rankUpOn ? ' on' : '') + '">' +
              '<div class="arc-card" style="margin:0">' +
                '<label class="arc-field-label">Current Rank</label>' +
                '<div class="arc-select-wrap"><select class="arc-select" id="trRank">' +
                  TRIALS_RANKS.map(function (r) { return '<option value="' + escHtml(r) + '"' + (r === selectedRank ? ' selected' : '') + '>' + escHtml(r) + '</option>'; }).join('') +
                '</select></div>' +
                '<label class="arc-field-label" style="margin-top:14px">Rank Option</label>' +
                '<div class="arc-pilltoggle" id="trRankOpt" style="grid-template-columns:repeat(4,1fr)">' +
                  RANK_OPTS.map(function (o, i) {
                    return '<button type="button" data-idx="' + i + '"' + (i === rankOption ? ' class="on"' : '') + '>' + escHtml(o.label) + '</button>';
                  }).join('') +
                '</div>' +
              '</div>' +
            '</div>' +

            '<button type="button" class="arc-ws-row' + (challengeOn ? ' on' : '') + '" id="trChallenge">' +
              '<span class="arc-ws-switch"></span>' +
              '<span class="arc-ws-name">Specific Challenge</span>' +
              '<span class="arc-trials-price">$17.99</span>' +
            '</button>' +

          '</div>' +
        '</div>';

      $('trWeekly').addEventListener('click', function () { weeklyOn = !weeklyOn; render(); });
      $('trRankUp').addEventListener('click', function () { rankUpOn = !rankUpOn; render(); });
      $('trChallenge').addEventListener('click', function () { challengeOn = !challengeOn; render(); });

      var rankSel = $('trRank');
      if (rankSel) {
        rankSel.addEventListener('change', function () { selectedRank = rankSel.value; syncCart(); });
      }

      var rankOptEl = $('trRankOpt');
      if (rankOptEl) {
        rankOptEl.addEventListener('click', function (e) {
          var btn = e.target.closest('button[data-idx]');
          if (!btn) return;
          rankOption = parseInt(btn.getAttribute('data-idx'), 10);
          render();
        });
      }

      syncCart();
    }

    function syncCart() {
      var items = [];
      if (weeklyOn) items.push({ id: 'tr-weekly', name: 'Weekly All 3 Star', qty: 1, price: 2000, color: '#ff8a3d' });
      if (rankUpOn) {
        var price = 2000 + RANK_OPTS[rankOption].add;
        items.push({ id: 'tr-rankup', name: 'Rank Up Service', qty: 1, price: price, color: '#ff8a3d', sub: selectedRank + ' · ' + RANK_OPTS[rankOption].label });
      }
      if (challengeOn) items.push({ id: 'tr-challenge', name: 'Specific Challenge', qty: 1, price: 1799, color: '#ff8a3d' });
      cart.replaceAll(items);
    }

    render();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: RAIDS
     ════════════════════════════════════════════════════════════ */
  function renderRaidsConfig() {
    var BASE = 400; // $4.00 per raid
    var EVENT_ADD = 150; // $1.50 per raid
    var TRIO_MUL = 1.50;
    var STREAM_PER = 200; // $2.00 per raid
    var PRESETS = [2, 4, 6, 8, 10, 12];

    var team = 'duo';
    var eventMode = false;
    var selectedPreset = 4;
    var streamOn = false;

    function priceForPreset(n) {
      var base = n * BASE;
      if (eventMode) base += n * EVENT_ADD;
      if (team === 'trio') base = Math.round(base * TRIO_MUL);
      return base;
    }

    function render() {
      configPanel.innerHTML =
        '<div class="arc-card">' +
          '<div class="arc-card-head"><span class="arc-card-eyebrow">◆</span><h3 class="arc-card-title">Raid Team</h3></div>' +
          '<div class="arc-focus-grid">' +
            '<button type="button" class="arc-focus-card arc-focus-card--compact' + (team === 'duo' ? ' on' : '') + '" data-team="duo">' +
              '<span class="arc-focus-card-title">Duo</span>' +
              '<span class="arc-focus-card-sub">Standard duo raid with one booster.</span>' +
              '<span class="arc-focus-card-mark"></span>' +
            '</button>' +
            '<button type="button" class="arc-focus-card arc-focus-card--compact' + (team === 'trio' ? ' on' : '') + '" data-team="trio">' +
              '<span class="arc-focus-card-title">Trio</span>' +
              '<span class="arc-focus-card-sub">Trio squad with +50% surcharge.</span>' +
              '<span class="arc-focus-card-badge">+50%</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        '<div class="arc-card">' +
          '<div class="arc-card-head"><h3 class="arc-card-title">Options</h3></div>' +
          '<button type="button" class="arc-ws-row arc-event-row' + (eventMode ? ' on' : '') + '" id="raidEvent">' +
            '<span class="arc-ws-switch"></span>' +
            '<span class="arc-event-meta"><span class="lbl">Event Mode</span><span class="sub">+$1.50 per raid</span></span>' +
            '<span class="arc-event-badge">EVENT</span>' +
          '</button>' +
        '</div>' +

        '<div class="arc-card">' +
          '<div class="arc-card-head"><h3 class="arc-card-title">Number of Raids</h3></div>' +
          '<div class="arc-raid-grid" id="raidGrid">' +
            PRESETS.map(function (n) {
              var p = priceForPreset(n);
              return '<button type="button" class="arc-raid-cell' + (n === selectedPreset ? ' on' : '') + '" data-n="' + n + '">' +
                '<span class="arc-raid-cell-row"><span class="arc-raid-cell-name">' + n + ' Raids</span><span class="arc-raid-cell-price">' + fmtDollar(p) + '</span></span>' +
                '<span class="arc-raid-cell-sub">' + fmtDollar(Math.round(p / n)) + ' per raid</span>' +
              '</button>';
            }).join('') +
          '</div>' +
          '<div class="arc-raid-notes"><span>Event mode adds +$1.50/raid</span><span>Trio adds +50% surcharge on base</span></div>' +
        '</div>' +

        '<div class="arc-card">' +
          '<button type="button" class="arc-ws-row' + (streamOn ? ' on' : '') + '" id="raidStream">' +
            '<span class="arc-ws-switch"></span>' +
            '<span class="arc-ws-name">Stream by PRO</span>' +
            '<span class="arc-ws-price">+$2.00/raid</span>' +
          '</button>' +
        '</div>';

      // Team select
      qsa('.arc-focus-card[data-team]', configPanel).forEach(function (card) {
        card.addEventListener('click', function () {
          team = card.getAttribute('data-team');
          render();
        });
      });

      // Event mode
      $('raidEvent').addEventListener('click', function () { eventMode = !eventMode; render(); });

      // Preset grid
      qsa('.arc-raid-cell', configPanel).forEach(function (cell) {
        cell.addEventListener('click', function () {
          selectedPreset = parseInt(cell.getAttribute('data-n'), 10);
          render();
        });
      });

      // Stream
      $('raidStream').addEventListener('click', function () { streamOn = !streamOn; render(); });

      syncCart();
    }

    function syncCart() {
      var p = priceForPreset(selectedPreset);
      var sub = team === 'trio' ? 'Trio +50%' : 'Duo';
      if (eventMode) sub += ' · Event';
      var items = [{ id: 'raid', name: 'Raid Bundles', qty: selectedPreset, price: p, color: '#ff4655', sub: sub }];

      if (streamOn) {
        state.streamAddon = { price: selectedPreset * STREAM_PER, sub: '+$2.00/raid × ' + selectedPreset };
      } else {
        state.streamAddon = null;
      }

      cart.replaceAll(items);
    }

    render();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: EXPEDITION BOOST
     ════════════════════════════════════════════════════════════ */
  function renderExpeditionConfig() {
    var EXP_TIERS = [
      { label: 'Tier I', price: 800, color: '#4ec6e8' },
      { label: 'Tier II', price: 1200, color: '#4ec6e8' },
      { label: 'Tier III', price: 1800, color: '#4ec6e8' },
      { label: 'Tier IV', price: 2500, color: '#4ec6e8' }
    ];
    var STAGES = [
      { name: 'Foundation', price: 1000 },
      { name: 'Core Systems', price: 1000 },
      { name: 'Framework', price: 1000 },
      { name: 'Outfitting', price: 1000 },
      { name: 'Load Stage', price: 1500 }
    ];
    var SKILL_OPTS = [
      { label: '+1 Skill', price: 500 },
      { label: '+2 Skills', price: 1000 },
      { label: '+3 Skills', price: 1500 },
      { label: '+4 Skills', price: 2000 },
      { label: '+5 Skills', price: 2500 }
    ];

    var selectedTier = 0;
    var selectedStages = {};
    var selectedSkill = -1; // -1 = none

    configPanel.innerHTML =
      '<div class="arc-card">' +
        '<div class="arc-card-head"><span class="arc-card-eyebrow">◆</span><h3 class="arc-card-title">Expedition Tier</h3></div>' +
        '<div class="arc-bp-tabs" id="expTiers">' +
          EXP_TIERS.map(function (t, i) {
            return '<button type="button" class="arc-bp-tab' + (i === selectedTier ? ' active' : '') + '" data-idx="' + i + '">' + escHtml(t.label) + ' · ' + fmtDollar(t.price) + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +

      '<div class="arc-card">' +
        '<div class="arc-card-head"><h3 class="arc-card-title">Stages</h3></div>' +
        '<div class="arc-ws-rows" id="expStages">' +
          STAGES.map(function (s, i) {
            return '<button type="button" class="arc-ws-row" data-idx="' + i + '">' +
              '<span class="arc-ws-switch"></span>' +
              '<span class="arc-ws-name">' + escHtml(s.name) + '</span>' +
              '<span class="arc-ws-price">' + fmtDollar(s.price) + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>' +

      '<div class="arc-card">' +
        '<div class="arc-card-head"><h3 class="arc-card-title">Skill Points</h3></div>' +
        '<div class="arc-bp-tabs" id="expSkills" style="grid-template-columns:repeat(5,1fr)">' +
          SKILL_OPTS.map(function (s, i) {
            return '<button type="button" class="arc-bp-tab' + (i === selectedSkill ? ' active' : '') + '" data-idx="' + i + '">' + escHtml(s.label) + '</button>';
          }).join('') +
        '</div>' +
      '</div>';

    // Tier selection
    $('expTiers').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-idx]');
      if (!btn) return;
      selectedTier = parseInt(btn.getAttribute('data-idx'), 10);
      qsa('.arc-bp-tab', $('expTiers')).forEach(function (b, i) { b.classList.toggle('active', i === selectedTier); });
      syncCart();
    });

    // Stages
    $('expStages').addEventListener('click', function (e) {
      var row = e.target.closest('.arc-ws-row');
      if (!row) return;
      var idx = parseInt(row.getAttribute('data-idx'), 10);
      selectedStages[idx] = !selectedStages[idx];
      row.classList.toggle('on', !!selectedStages[idx]);
      syncCart();
    });

    // Skills
    $('expSkills').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-idx]');
      if (!btn) return;
      var idx = parseInt(btn.getAttribute('data-idx'), 10);
      selectedSkill = (selectedSkill === idx) ? -1 : idx;
      qsa('.arc-bp-tab', $('expSkills')).forEach(function (b, i) { b.classList.toggle('active', i === selectedSkill); });
      syncCart();
    });

    function syncCart() {
      var items = [];
      items.push({ id: 'exp-tier', name: 'Expedition ' + EXP_TIERS[selectedTier].label, qty: 1, price: EXP_TIERS[selectedTier].price, color: '#4ec6e8' });
      STAGES.forEach(function (s, i) {
        if (selectedStages[i]) items.push({ id: 'exp-stage-' + i, name: s.name, qty: 1, price: s.price, color: '#4ec6e8', sub: 'Stage' });
      });
      if (selectedSkill >= 0) {
        items.push({ id: 'exp-skill', name: SKILL_OPTS[selectedSkill].label, qty: 1, price: SKILL_OPTS[selectedSkill].price, color: '#4ec6e8', sub: 'Skill Points' });
      }
      cart.replaceAll(items);
    }

    syncCart();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: HOURLY COACHING
     ════════════════════════════════════════════════════════════ */
  function renderCoachingConfig() {
    var PRICES = { duo: 2000, trio: 3000, group: 2500 };
    var STREAM_FLAT = 500;
    var focus = 'pvp';
    var session = 'duo';
    var hours = 1;
    var streamOn = false;

    function render() {
      var perHour = PRICES[session];

      configPanel.innerHTML =
        '<div class="arc-card">' +
          '<div class="arc-card-head"><span class="arc-card-eyebrow">◆</span><h3 class="arc-card-title">Focus</h3></div>' +
          '<div class="arc-focus-grid">' +
            '<button type="button" class="arc-focus-card' + (focus === 'pvp' ? ' on' : '') + '" data-focus="pvp">' +
              '<span class="arc-focus-card-title">PvP</span>' +
              '<span class="arc-focus-card-sub">Gunfight mechanics, positioning, team plays.</span>' +
              '<span class="arc-focus-card-mark"></span>' +
            '</button>' +
            '<button type="button" class="arc-focus-card' + (focus === 'pve' ? ' on' : '') + '" data-focus="pve">' +
              '<span class="arc-focus-card-title">PvE</span>' +
              '<span class="arc-focus-card-sub">Route planning, boss strats, extraction efficiency.</span>' +
              '<span class="arc-focus-card-mark"></span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        '<div class="arc-card">' +
          '<div class="arc-card-head"><h3 class="arc-card-title">Session Type</h3></div>' +
          '<div class="arc-pilltoggle" id="coachSession">' +
            '<button type="button" data-sess="duo"' + (session === 'duo' ? ' class="on"' : '') + '>Duo <span class="pct">$' + (PRICES.duo / 100).toFixed(0) + '/hr</span></button>' +
            '<button type="button" data-sess="trio"' + (session === 'trio' ? ' class="on"' : '') + '>Trio <span class="pct">$' + (PRICES.trio / 100).toFixed(0) + '/hr</span></button>' +
            '<button type="button" data-sess="group"' + (session === 'group' ? ' class="on"' : '') + '>Group <span class="pct">$' + (PRICES.group / 100).toFixed(0) + '/hr</span></button>' +
          '</div>' +
        '</div>' +

        '<div class="arc-card">' +
          '<div class="arc-card-head"><h3 class="arc-card-title">Hours</h3></div>' +
          '<div id="coachHours"></div>' +
        '</div>' +

        '<div class="arc-card">' +
          '<div class="arc-card-head"><h3 class="arc-card-title">Notes</h3></div>' +
          '<textarea class="arc-textarea" id="coachNotes" placeholder="Any specific topics, weapons, or scenarios you want to focus on..."></textarea>' +
        '</div>' +

        '<div class="arc-card">' +
          '<button type="button" class="arc-ws-row' + (streamOn ? ' on' : '') + '" id="coachStream">' +
            '<span class="arc-ws-switch"></span>' +
            '<span class="arc-ws-name">Stream by PRO</span>' +
            '<span class="arc-ws-price">+$5.00 flat</span>' +
          '</button>' +
        '</div>';

      // Focus
      qsa('.arc-focus-card[data-focus]', configPanel).forEach(function (card) {
        card.addEventListener('click', function () {
          focus = card.getAttribute('data-focus');
          render();
        });
      });

      // Session type
      $('coachSession').addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-sess]');
        if (!btn) return;
        session = btn.getAttribute('data-sess');
        render();
      });

      // Hours stepper
      var hrsStepper = createStepper(hours, 1, 4, function (v) {
        hours = v;
        syncCart();
      });
      $('coachHours').appendChild(hrsStepper);

      // Stream
      $('coachStream').addEventListener('click', function () { streamOn = !streamOn; render(); });

      syncCart();
    }

    function syncCart() {
      var perHour = PRICES[session];
      var total = hours * perHour;
      var sub = session.charAt(0).toUpperCase() + session.slice(1) + ' · ' + focus.toUpperCase() + ' · ' + hours + 'h';
      var items = [{ id: 'coach', name: 'Hourly Coaching', qty: hours, price: total, color: '#9b6cff', sub: sub }];

      if (streamOn) {
        state.streamAddon = { price: STREAM_FLAT, sub: '+$5.00 flat' };
      } else {
        state.streamAddon = null;
      }

      cart.replaceAll(items);
    }

    render();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: CUSTOM ORDERS
     ════════════════════════════════════════════════════════════ */
  function renderCustomOrdersConfig() {
    configPanel.innerHTML =
      '<div class="arc-card">' +
        '<div class="arc-card-head"><span class="arc-card-eyebrow">◆</span><h3 class="arc-card-title">Custom Order</h3></div>' +
        '<p class="arc-co-section">Describe Your Request</p>' +
        '<p class="arc-co-body-text">Tell us what you need — anything not covered by the standard stations. Our concierge desk will price it and confirm in Discord.</p>' +
        '<textarea class="arc-textarea" id="coText" placeholder="Describe your custom order here..."></textarea>' +
        '<div class="arc-co-hint"><span class="bolt">⚡</span> Pricing confirmed in your Discord ticket</div>' +
        '<div class="arc-co-trust"><span>Manual Delivery</span><span>VPN Protected</span><span>24/7 Support</span></div>' +
      '</div>';

    $('coText').addEventListener('input', syncCart);

    function syncCart() {
      var text = $('coText').value.trim();
      if (text) {
        cart.replaceAll([{ id: 'custom', name: 'Custom Order', qty: 1, price: 0, color: '#e08a2c', sub: 'See Discord ticket' }]);
      } else {
        cart.replaceAll([]);
      }
    }

    syncCart();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: ASSORTED SEEDS
     ════════════════════════════════════════════════════════════ */
  function renderSeedsConfig() {
    var SEED_PRICE = 40; // $0.40 per 100 seeds
    var SEED_MIN = 100;
    var SEED_MAX = 2000;
    var SEED_STEP = 100;
    var DISC_TIERS = [
      { threshold: 2000, disc: 0.20 },
      { threshold: 1000, disc: 0.10 }
    ];
    var PRESETS = [
      { seeds: 1000, price: 360 },
      { seeds: 2000, price: 640 }
    ];

    var currentSeeds = SEED_MIN;

    function getDiscount(n) {
      for (var i = 0; i < DISC_TIERS.length; i++) {
        if (n >= DISC_TIERS[i].threshold) return DISC_TIERS[i].disc;
      }
      return 0;
    }

    function calcPrice(n) {
      var packs = n / 100;
      var base = packs * SEED_PRICE;
      var disc = getDiscount(n);
      return Math.round(base * (1 - disc));
    }

    function render() {
      var disc = getDiscount(currentSeeds);
      var priceCents = calcPrice(currentSeeds);
      var pct = ((currentSeeds - SEED_MIN) / (SEED_MAX - SEED_MIN)) * 100;

      var hintHtml = '';
      var nextTier = null;
      for (var i = DISC_TIERS.length - 1; i >= 0; i--) {
        if (currentSeeds < DISC_TIERS[i].threshold) { nextTier = DISC_TIERS[i]; break; }
      }
      if (nextTier) {
        hintHtml = '<div class="arc-rc-hint">' +
          '<span class="pct">' + Math.round(nextTier.disc * 100) + '%</span> discount at ' + nextTier.threshold + ' seeds — add ' + (nextTier.threshold - currentSeeds) + ' more' +
        '</div>';
      } else if (currentSeeds >= SEED_MAX) {
        hintHtml = '<div class="arc-rc-hint max"><span class="pct">MAX</span> Maximum tier unlocked — 20% discount applied</div>';
      }

      configPanel.innerHTML =
        '<div class="arc-card">' +
          '<div class="arc-card-head"><span class="arc-card-eyebrow">◆</span><h3 class="arc-card-title">Assorted Seeds</h3></div>' +
          '<div class="arc-rc-stat-row">' +
            '<div><span class="arc-rc-stat-label">Seeds</span>' +
              '<span class="arc-rc-big">' + currentSeeds + '<span class="unit">seeds</span></span></div>' +
            '<div><span class="arc-rc-stat-sub">' + fmtDollar(priceCents) + (disc > 0 ? ' <span class="arc-sd-disc">−' + Math.round(disc * 100) + '%</span>' : '') + '</span></div>' +
          '</div>' +
          '<input type="range" class="arc-rc-slider" id="seedSlider" min="' + SEED_MIN + '" max="' + SEED_MAX + '" step="' + SEED_STEP + '" value="' + currentSeeds + '">' +
          '<div class="arc-rc-ticks">' +
            DISC_TIERS.slice().reverse().map(function (t) {
              var pos = ((t.threshold - SEED_MIN) / (SEED_MAX - SEED_MIN)) * 100;
              var passed = currentSeeds >= t.threshold;
              return '<span class="arc-rc-tick' + (passed ? ' passed' : '') + '" style="left:' + pos + '%"><span class="label">' + t.threshold + '</span><span class="at">−' + Math.round(t.disc * 100) + '%</span></span>';
            }).join('') +
          '</div>' +
          hintHtml +
        '</div>' +

        '<div class="arc-card">' +
          '<div class="arc-card-head"><h3 class="arc-card-title">Presets</h3></div>' +
          '<div class="arc-rc-presets">' +
            PRESETS.map(function (p) {
              var isOn = currentSeeds === p.seeds;
              return '<button type="button" class="arc-rc-preset' + (isOn ? ' on' : '') + '" data-seeds="' + p.seeds + '">' +
                '<span class="arc-rc-preset-row"><span class="arc-rc-preset-coins">' + p.seeds + ' Seeds</span><span class="arc-rc-preset-price">' + fmtDollar(p.price) + '</span></span>' +
                '<span class="arc-rc-preset-sub">Assorted Seeds</span>' +
              '</button>';
            }).join('') +
          '</div>' +
        '</div>';

      var slider = $('seedSlider');
      slider.style.setProperty('--p', pct + '%');

      slider.addEventListener('input', function () {
        currentSeeds = parseInt(slider.value, 10);
        render();
      });

      qsa('.arc-rc-preset', configPanel).forEach(function (btn) {
        btn.addEventListener('click', function () {
          currentSeeds = parseInt(btn.getAttribute('data-seeds'), 10);
          render();
        });
      });

      syncCart();
    }

    function syncCart() {
      var priceCents = calcPrice(currentSeeds);
      var disc = getDiscount(currentSeeds);
      var sub = currentSeeds + ' seeds';
      if (disc > 0) sub += ' · −' + Math.round(disc * 100) + '%';
      cart.replaceAll([{ id: 'seeds', name: 'Assorted Seeds', qty: currentSeeds, price: priceCents, color: '#4ea568', sub: sub }]);
    }

    render();
  }

  /* ────────────────────────────────────────────────────────────
     REVIEWS
     ──────────────────────────────────────────────────────────── */
  function renderReviews() {
    if (!elReviewsRail) return;
    elReviewsRail.innerHTML = '';
    ARC_REVIEWS.forEach(function (r) {
      var card = document.createElement('div');
      card.className = 'val-review';

      // Head
      var head = document.createElement('div');
      head.className = 'val-review-head';

      var avatar = document.createElement('span');
      avatar.className = 'val-avatar';
      avatar.textContent = r.initials;

      var user = document.createElement('span');
      user.className = 'val-review-user';
      user.textContent = r.user + ' ';

      var flag = document.createElement('span');
      flag.className = 'val-flag';
      flag.style.setProperty('--c1', r.flagColors[0]);
      flag.style.setProperty('--c2', r.flagColors[1]);
      flag.style.setProperty('--c3', r.flagColors[2]);
      user.appendChild(flag);

      var verified = document.createElement('span');
      verified.className = 'val-verified';
      verified.textContent = '✓ Verified';

      head.appendChild(avatar);
      head.appendChild(user);
      head.appendChild(verified);

      // Stars
      var stars = document.createElement('div');
      stars.className = 'val-review-stars';
      stars.textContent = '★★★★★';

      // Quote
      var quote = document.createElement('p');
      quote.className = 'val-review-quote';
      quote.textContent = r.quote;

      // Meta
      var meta = document.createElement('div');
      meta.className = 'val-review-meta';
      meta.innerHTML = '<span class="game">Arc Raiders</span> · ' + escHtml(r.from) + ' → ' + escHtml(r.to) + ' · ' + r.days + 'd';

      card.appendChild(head);
      card.appendChild(stars);
      card.appendChild(quote);
      card.appendChild(meta);
      elReviewsRail.appendChild(card);
    });
  }

  /* ────────────────────────────────────────────────────────────
     FAQ
     ──────────────────────────────────────────────────────────── */
  function renderFaqs() {
    if (!elFaqList) return;
    elFaqList.innerHTML = '';
    ARC_FAQS.forEach(function (faq, i) {
      var row = document.createElement('div');
      row.className = 'eb-faq-row';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'eb-faq-btn';
      btn.innerHTML =
        '<span class="eb-faq-n">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="eb-faq-q">' + escHtml(faq.q) + '</span>' +
        '<span class="eb-faq-plus">+</span>';

      var panel = document.createElement('div');
      panel.className = 'eb-faq-panel';
      var answer = document.createElement('div');
      answer.className = 'eb-faq-a';
      answer.innerHTML = '<span></span><p>' + escHtml(faq.a) + '</p><span></span>';
      panel.appendChild(answer);

      row.appendChild(btn);
      row.appendChild(panel);
      elFaqList.appendChild(row);
    });

    // Accordion handler (delegated)
    elFaqList.addEventListener('click', function (e) {
      var btn = e.target.closest('.eb-faq-btn');
      if (!btn) return;
      var row = btn.closest('.eb-faq-row');
      if (!row) return;
      var wasOpen = row.classList.contains('eb-open');
      qsa('.eb-faq-row.eb-open', elFaqList).forEach(function (r) { r.classList.remove('eb-open'); });
      if (!wasOpen) row.classList.add('eb-open');
    });
  }

  /* ────────────────────────────────────────────────────────────
     NAV SCROLL STATE
     ──────────────────────────────────────────────────────────── */
  function onScroll() {
    if (elNav) {
      if (window.scrollY > 40) {
        elNav.classList.add('eb-scrolled');
      } else {
        elNav.classList.remove('eb-scrolled');
      }
    }
    if (elScrollHint) {
      if (window.scrollY > 40) {
        elScrollHint.classList.add('hidden');
      } else {
        elScrollHint.classList.remove('hidden');
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ────────────────────────────────────────────────────────────
     SCROLL REVEAL
     ──────────────────────────────────────────────────────────── */
  (function initScrollReveal() {
    var els = qsa('.eb-reveal');
    if (!els.length) return;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('eb-in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      els.forEach(function (el) { io.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add('eb-in'); });
    }
  })();

  /* ────────────────────────────────────────────────────────────
     HUB MAP GLOW CYCLE
     ──────────────────────────────────────────────────────────── */
  (function initGlowCycle() {
    if (!elHubMap) return;
    var hotspots = qsa('.arc-hot', elHubMap);
    if (!hotspots.length) return;
    var gs = state.glowState;

    function clearGlow() {
      if (gs.timer) { clearTimeout(gs.timer); gs.timer = null; }
    }

    function setGlow(el) {
      if (gs.activeEl) gs.activeEl.classList.remove('glow');
      gs.activeEl = el;
      if (el) el.classList.add('glow');
    }

    function cycleGlow() {
      if (gs.mode !== 'idle') return;
      var candidates = [];
      hotspots.forEach(function (h) {
        if (h !== gs.activeEl) candidates.push(h);
      });
      if (!candidates.length) return;
      var next = candidates[Math.floor(Math.random() * candidates.length)];
      setGlow(next);
      var hold = 3000 + Math.random() * 2000;
      gs.timer = setTimeout(function () {
        setGlow(null);
        gs.timer = setTimeout(cycleGlow, 400);
      }, hold);
    }

    hotspots.forEach(function (h) {
      h.addEventListener('mouseenter', function () {
        clearGlow();
        gs.mode = 'hovering';
        gs.hoveredEl = h;
        setGlow(h);
      });
      h.addEventListener('mouseleave', function () {
        if (gs.hoveredEl !== h) return;
        gs.hoveredEl = null;
        gs.mode = 'paused';
        setGlow(null);
        gs.timer = setTimeout(function () {
          gs.mode = 'idle';
          cycleGlow();
        }, 1000);
      });
    });

    cycleGlow();
  })();

  /* ────────────────────────────────────────────────────────────
     SIDEBAR
     ──────────────────────────────────────────────────────────── */
  function openSidebar() {
    if (!elSidebar || !elSidebarOverlay) return;
    elSidebar.classList.add('on');
    elSidebarOverlay.classList.add('on');
    elSidebar.setAttribute('aria-hidden', 'false');
    state.sidebarOpen = true;
  }

  function closeSidebar() {
    if (!elSidebar || !elSidebarOverlay) return;
    elSidebar.classList.remove('on');
    elSidebarOverlay.classList.remove('on');
    elSidebar.setAttribute('aria-hidden', 'true');
    state.sidebarOpen = false;
  }

  var sidebarBtn = $('arcSidebarBtn');
  var sidebarClose = $('arcSidebarClose');
  if (sidebarBtn) sidebarBtn.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (elSidebarOverlay) elSidebarOverlay.addEventListener('click', closeSidebar);

  /* ────────────────────────────────────────────────────────────
     SERVICE NAVIGATION (hotspots, sidebar items, mobile grid)
     ──────────────────────────────────────────────────────────── */
  function bindServiceNav(container) {
    if (!container) return;
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-service]');
      if (!btn) return;
      var id = btn.getAttribute('data-service');
      if (!id) return;
      closeSidebar();
      openService(id);
    });
  }

  bindServiceNav(elHubMap);
  bindServiceNav(elHubMobile);
  bindServiceNav(elSidebar);

  /* ────────────────────────────────────────────────────────────
     BACK BUTTONS
     ──────────────────────────────────────────────────────────── */
  if (elBackBtn) elBackBtn.addEventListener('click', closeService);
  if (elBackBtn2) elBackBtn2.addEventListener('click', closeService);

  /* ────────────────────────────────────────────────────────────
     ESC KEY
     ──────────────────────────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (state.sidebarOpen) { closeSidebar(); return; }
    if (state.currentService) { closeService(); return; }
  });

  /* ────────────────────────────────────────────────────────────
     COPY TO DISCORD
     ──────────────────────────────────────────────────────────── */
  if (elCopyCta) {
    elCopyCta.addEventListener('click', function () {
      var svc = getService(state.currentService);
      if (!svc || !state.cartItems.length) return;
      var items = state.cartItems;
      var isCustom = (state.cartMode === 'custom');
      var isDollar = (state.cartMode === 'dollar');

      function priceStr(it) {
        if (isCustom) return 'CUSTOM';
        if (isDollar) return fmtDollar(it.price);
        return fmtRC(it.price) + ' RC';
      }

      var lines = items.map(function (it) {
        var txt = '▸ ' + it.name + ' × ' + it.qty;
        if (it.sub) txt += ' · ' + it.sub;
        txt += ' — ' + priceStr(it);
        return txt;
      });

      if (state.streamAddon) {
        lines.push('▸ Stream by PRO' + (state.streamAddon.sub ? ' · ' + state.streamAddon.sub : '') + ' — ' + (isDollar ? fmtDollar(state.streamAddon.price) : fmtRC(state.streamAddon.price) + ' RC'));
      }

      var subtotal = 0;
      items.forEach(function (it) { subtotal += it.price; });
      if (state.streamAddon) subtotal += state.streamAddon.price;
      var fee = Math.round(subtotal * 0.05);
      var total = subtotal + fee;

      function totalStr(v) {
        if (isCustom) return 'CUSTOM';
        if (isDollar) return fmtDollar(v);
        return fmtRC(v) + ' RC';
      }

      var text =
        '🏰 ELYSIUM BOOST — Arc Raiders Order\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
        'Service: ' + svc.name + '\n\n' +
        lines.join('\n') + '\n\n' +
        'Subtotal: ' + totalStr(subtotal) + '\n' +
        'Service Fee (5%): ' + totalStr(fee) + '\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
        'TOTAL: ' + totalStr(total) + '\n\n' +
        'Paste this into your Discord ticket.';

      navigator.clipboard.writeText(text).then(function () {
        var orig = elCopyCta.textContent;
        elCopyCta.textContent = 'Copied!';
        setTimeout(function () {
          elCopyCta.textContent = '';
          // Restore the icon + text via innerHTML for the SVG
          elCopyCta.innerHTML =
            '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" stroke="currentColor" stroke-width="1.4"/><path d="M11 5V2H2v9h3" stroke="currentColor" stroke-width="1.4"/></svg>' +
            'Copy to Discord';
        }, 2000);
      });
    });
  }

  /* ────────────────────────────────────────────────────────────
     INIT
     ──────────────────────────────────────────────────────────── */
  renderReviews();
  renderFaqs();

})();
