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
    { id: 'assorted-seeds', name: 'Assorted Seeds', color: '#4ea568', glyph: 'S', tags: ['Seeds', 'Drops'], image: '../../assets/arc-raiders/images/assorted-seeds.webp', art: 'Curated seed bundles for vault runs, drop chases, and rare encounters.' },
    { id: 'custom-orders', name: 'Custom Orders', color: '#e08a2c', glyph: 'O', tags: ['Custom'], image: '../../assets/arc-raiders/images/custom-orders.webp', art: 'Off-menu requests handled by our concierge desk.' }
  ];

  var WEAPONS = [
    'Anvil', 'Aphelion', 'Bettina', 'Bobcat', 'Burletta', 'Canto', 'Dolabra', 'Equalizer',
    'Hullcracker', 'Il Toro', 'Jupiter', 'Osprey', 'Rascal', 'Renegade', 'Tempest', 'Torrente', 'Venator', 'Vulcano'
  ];

  var MOD_KITS = ['Standard', 'Extended Mag', 'Suppressor', 'Holographic', 'Tac Light + Grip'];

  // Quick Use Bundles — name, pack multiplier (mul), pack price in cents
  var QUICK_USE = [
    { id: 'qu-wolfpack',    name: 'Wolfpack',            mul: 1, price: 125, color: '#c98a2c' },
    { id: 'qu-fuze',        name: 'Heavy Fuze Grenade',  mul: 3, price: 150, color: '#ff8a3d' },
    { id: 'qu-showstopper', name: 'Showstopper Grenade', mul: 5, price: 250, color: '#e08a2c' },
    { id: 'qu-trailblazer', name: 'Trailblazer',         mul: 3, price: 150, color: '#4ea568' },
    { id: 'qu-blaze',       name: 'Blaze Grenade',       mul: 5, price: 350, color: '#d4571b' },
    { id: 'qu-seeker',      name: 'Seeker Grenade',      mul: 5, price: 350, color: '#7faedc' },
    { id: 'qu-smoke',       name: 'Smoke Grenade',       mul: 5, price: 575, color: '#a3acb1' },
    { id: 'qu-tagging',     name: 'Tagging Grenade',     mul: 3, price: 180, color: '#b794d6' }
  ];

  // Custom Loadout — augment options (multi-select, price in cents)
  var AUGMENTS = [
    { id: 'aug-combat-flank',  name: 'Combat Mk.3 (Flanking)',    price: 100 },
    { id: 'aug-combat-aggro',  name: 'Combat Mk.3 (Aggressive)',  price: 100 },
    { id: 'aug-tac-def',       name: 'Tactical Mk.3 (Defensive)', price: 100 },
    { id: 'aug-tac-heal',      name: 'Tactical Mk.3 (Healing)',   price: 70 },
    { id: 'aug-tac-smoke',     name: 'Tactical Mk.3 (Smoke)',     price: 250 },
    { id: 'aug-tac-revival',   name: 'Tactical Mk.3 (Revival)',   price: 100 },
    { id: 'aug-loot-survivor', name: 'Looting Mk.3 (Survivor)',   price: 250 },
    { id: 'aug-loot-safe',     name: 'Looting Mk.3 (Safekeeper)', price: 150 }
  ];

  // Custom Loadout — shield options (single-select, price in cents)
  var SHIELDS = [
    { id: 'shield-heavy',  name: 'Heavy Shield',  price: 50 },
    { id: 'shield-medium', name: 'Medium Shield', price: 30 }
  ];

  // Trials Boost — Specific Challenge selectable challenges (multi-select)
  var TRIALS_CHALLENGES = [
    'First Challenge', 'Second Challenge', 'Third Challenge',
    'Fourth Challenge', 'Fifth Challenge', 'Sixth Challenge'
  ];

  // Service card badges shown in the station list (sidebar)
  var SERVICE_BADGES = {
    'custom-loadout':   ['recommended'],
    'all-weapons':      ['pricedrop'],
    'blueprints':       ['hot'],
    'materials':        ['popular'],
    'raider-coins':     ['hot', 'recommended'],
    'expedition-boost': ['hot'],
    'trials-boost':     ['pricedrop']
  };
  var BADGE_META = {
    hot:         { label: 'Hot' },
    pricedrop:   { label: 'Price Drop' },
    recommended: { label: 'Recommended' },
    popular:     { label: 'Popular' }
  };
  var TAB_BADGES = {
    'custom-loadout': 'recommended',
    'blueprints':     'hot',
    'trials-boost':   'pricedrop'
  };

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
    { name: 'Combat Mk.3 (Flanking)', price: 100 },
    { name: 'Tactical Mk.3 (Defensive)', price: 100 },
    { name: 'Looting Mk.3 (Survivor)', price: 250 },
    { name: 'Combat Mk.3 (Aggressive)', price: 100 },
    { name: 'Tactical Mk.3 (Healing)', price: 70 },
    { name: 'Looting Mk.3 (Safekeeper)', price: 150 },
    { name: 'Tactical Mk.3 (Revival)', price: 100 },
    { name: 'Tactical Mk.3 (Smoke)', price: 250 }
  ];

  var QUICK_USE_BLUEPRINTS = [
    { name: 'Barricade Kit', price: 100 }, { name: 'Explosive Mine', price: 50 },
    { name: 'Defibrillator', price: 50 }, { name: 'White Flag', price: 50 },
    { name: 'Crash Mat', price: 50 }, { name: 'Powered Descender', price: 50 },
    { name: 'Vita Shot', price: 100 }, { name: 'Vita Spray', price: 60 },
    { name: 'Wolfpack', price: 125 }, { name: 'Snap Hook', price: 125 },
    { name: 'Smoke Grenade', price: 115 }, { name: 'Showstopper', price: 50 },
    { name: 'Lure Grenade', price: 300 }, { name: 'Deadline', price: 50 },
    { name: 'Seeker Grenade', price: 70 }, { name: 'Trailblazer', price: 50 },
    { name: 'Gas Mine', price: 50 }, { name: 'Pulse Mine', price: 50 },
    { name: 'Fireworks Box', price: 100 }, { name: 'Blue Light Stick', price: 50 },
    { name: 'Green Light Stick', price: 50 }, { name: 'Yellow Light Stick', price: 50 },
    { name: 'Red Light Stick', price: 50 }, { name: 'Remote Raider Flare', price: 60 },
    { name: 'Surge Coil', price: 60 }, { name: 'Tagging Grenade', price: 60 },
    { name: 'Jolt Mine', price: 50 }, { name: 'Blaze Grenade', price: 70 },
    { name: 'Trigger Nade', price: 70 }
  ];

  var GUNPART_BLUEPRINTS = [
    { name: 'Angled Grip', tiers: ['II', 'III'], tierPrices: { 'II': 90, 'III': 125 } },
    { name: 'Compensator', tiers: ['II', 'III'], tierPrices: { 'II': 125, 'III': 150 } },
    { name: 'Extended Light Mag', tiers: ['II', 'III'], tierPrices: { 'II': 50, 'III': 150 } },
    { name: 'Extended Medium Mag', tiers: ['II', 'III'], tierPrices: { 'II': 100, 'III': 200 } },
    { name: 'Extended Shotgun Mag', tiers: ['II', 'III'], tierPrices: { 'II': 50, 'III': 150 } },
    { name: 'Muzzle Brake', tiers: ['II', 'III'], tierPrices: { 'II': 50, 'III': 125 } },
    { name: 'Shotgun Choke', tiers: ['II', 'III'], tierPrices: { 'II': 80, 'III': 95 } },
    { name: 'Stable Stock', tiers: ['II', 'III'], tierPrices: { 'II': 80, 'III': 125 } },
    { name: 'Silencer', tiers: ['I', 'II'], tierPrices: { 'I': 50, 'II': 70 } },
    { name: 'Extended Barrel', tiers: ['II', 'III'], tierPrices: { 'II': 400, 'III': 300 } },
    { name: 'Lightweight Stock', price: 150 },
    { name: 'Padded Stock', price: 120 },
    { name: 'Light Gun Parts', price: 90 },
    { name: 'Medium Gun Parts', price: 115 },
    { name: 'Heavy Gun Parts', price: 100 },
    { name: 'Complex Gun Parts', price: 70 },
    { name: 'Shotgun Silencer', price: 100 },
    { name: 'Vertical Grip', tiers: ['II', 'III'], tierPrices: { 'II': 60, 'III': 70 } }
  ];

  var WEAPON_BP_PRICES = {
    'Anvil': 90, 'Aphelion': 60, 'Bettina': 50, 'Bobcat': 115, 'Burletta': 300,
    'Canto': 200, 'Dolabra': 250, 'Equalizer': 95, 'Hullcracker': 300, 'Il Toro': 60,
    'Jupiter': 95, 'Osprey': 60, 'Rascal': 500, 'Renegade': 95, 'Tempest': 125,
    'Torrente': 60, 'Venator': 60, 'Vulcano': 125
  };

  var BP_TABS = [
    { id: 'gun', label: 'Gun Blueprints', items: WEAPONS.map(function (n) { return { name: n, price: WEAPON_BP_PRICES[n] || 100 }; }), sub: 'Gun Blueprint', color: '#c9a84c', enabled: true },
    { id: 'backpack', label: 'Backpack Blueprints', items: BACKPACK_BLUEPRINTS, sub: 'Backpack Blueprint', color: '#7faedc', enabled: true },
    { id: 'quick', label: 'Quick Use Blueprints', items: QUICK_USE_BLUEPRINTS, sub: 'Quick Use Blueprint', color: '#4ea568', enabled: true },
    { id: 'gunpart', label: 'Gun Part Blueprints', items: GUNPART_BLUEPRINTS, sub: 'Gun Part Blueprint', color: '#e08a2c', enabled: true }
  ];

  var MATERIALS_CATS = [
    { id: 'uncommon', label: 'Uncommon', color: '#c9a84c', items: [
      { name: 'Battery', price: 7 }, { name: 'Canister', price: 7 }, { name: 'Crude Explosives', price: 6 },
      { name: 'Duct Tape', price: 5 }, { name: 'Durable Cloth', price: 6 }, { name: 'Electrical Components', price: 5 },
      { name: 'Great Mullein', price: 8 }, { name: 'Magnet', price: 8 }, { name: 'Mechanical Components', price: 7 },
      { name: 'Mushroom', price: 12 }, { name: 'Oil', price: 8 }, { name: 'Simple Gun Parts', price: 8 },
      { name: 'Steel Spring', price: 10 }, { name: 'Wires', price: 8 }, { name: 'Apricot', price: 13 },
      { name: 'Arc Alloy', price: 5 }, { name: 'Lemon', price: 13 }, { name: 'Olives', price: 13 },
      { name: 'Prickly Pear', price: 13 }, { name: 'Snitch Scanner', price: 20 }, { name: 'Tick Pod', price: 7 }
    ]},
    { id: 'rare', label: 'Rare', color: '#7faedc', items: [
      { name: 'Advanced Electrical Components', price: 10 }, { name: 'Advanced Mechanical Components', price: 10 },
      { name: 'Antiseptic', price: 10 }, { name: 'Explosive Compound', price: 10 },
      { name: 'Heavy Gun Parts', price: 10 }, { name: 'Light Gun Parts', price: 10 },
      { name: 'Medium Gun Parts', price: 10 }, { name: 'Mod Components', price: 10 },
      { name: 'Processor', price: 5 }, { name: 'Rusted Gear', price: 25 },
      { name: 'Rusted Tools', price: 20 }, { name: 'Rope', price: 25 },
      { name: 'Sensors', price: 15 }, { name: 'Speaker Component', price: 10 },
      { name: 'Synthesized Fuel', price: 15 }, { name: 'Syringe', price: 9 },
      { name: 'Voltage Converter', price: 10 }, { name: 'Arc Circuitry', price: 6 },
      { name: 'Arc Motion Core', price: 6 }, { name: 'Cracked Bioscanner', price: 15 },
      { name: 'Damaged Heatsink', price: 15 }, { name: 'Dog Collar', price: 25 },
      { name: 'Fried Motherboard', price: 10 }, { name: 'Industrial Battery', price: 20 },
      { name: 'Laboratory Reagents', price: 20 }, { name: 'Motor', price: 20 },
      { name: 'Power Cable', price: 15 }, { name: 'Rusted Shut Medical Kit', price: 20 },
      { name: 'Sentinel Firing Core', price: 25 }, { name: 'Surveyor Vault', price: 30 },
      { name: 'Toaster', price: 10 }, { name: 'Wasp Drive', price: 9 },
      { name: 'Comet Igniter', price: 50 }, { name: 'Firefly Burner', price: 50 },
      { name: 'Arc Synthetic Resin', price: 40 }
    ]},
    { id: 'epic', label: 'Epic', color: '#b794d6', items: [
      { name: 'Complex Gun Parts', price: 20 }, { name: 'Bastion Cell', price: 25 },
      { name: 'Bombardier Cell', price: 25 }, { name: 'Leaper Pulse Unit', price: 30 },
      { name: 'Exodus Module', price: 10 }, { name: 'Power Rod', price: 150 },
      { name: 'Magnetic Accelerator', price: 12 }, { name: 'Rocketeer Driver', price: 30 },
      { name: 'Vaporizer Regulator', price: 25 }, { name: 'Assessor Matrix', price: 55 }
    ]},
    { id: 'legendary', label: 'Legendary', color: '#d97757', items: [
      { name: 'Matriarch Reactor', price: 55 }, { name: 'Queen Reactor', price: 55 }
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
    { q: 'How does Arc Raiders boosting work?', a: 'Pick a station on the map, configure your order in the middle column, and add it to cart. Complete checkout via our secure on-site checkout. A verified runner picks up the order, executes it manually in-game (or queues alongside you for coaching/raid services), and delivers items directly to your Stash. You get live updates in your dashboard the whole way.' },
    { q: 'How is delivery handled — will it affect my account?', a: 'Delivery happens through the in-game trade and Stash systems, on residential IPs from your region, manually — the same way two friends would hand off loot. No exploits, no shared sessions. The runner signs out the moment your goods are in your Stash.' },
    { q: 'Can I choose which runner completes my order?', a: 'If you’ve worked with one of our runners before and want them again, drop their handle in your ticket and we’ll route the order to them. Otherwise, our concierge desk pairs your order with the runner whose load and timezone match yours.' },
    { q: 'How long does delivery take?', a: 'Most material and weapon orders are in your Stash within 10–30 minutes. Bundles and custom loadouts land within 1–2 hours. Boss clears, raids, and expedition runs depend on instance availability — usually same-day, never beyond 48 hours unless we tell you up front.' },
    { q: 'Are prices in real money or Raider Coins?', a: 'The configurator displays prices in Raider Coins for clarity. Checkout converts to your selected fiat or crypto at our current daily rate, shown before you confirm. No hidden conversion fees.' },
    { q: 'What happens if a run fails?', a: 'Runs are outcome contracts. A failed extract, a wiped raid, a missed objective — the runner retries until the order is fulfilled, at no extra cost. If a service genuinely can’t be completed (game outage, content gate), we refund pro-rated against any work already delivered.' },
    { q: 'Can I watch the run live?', a: 'Yes — add the Stream by PRO option to your order and you get a private link plus saved VODs of every session. Great for boss/raid services where you want to learn the routes.' },
    { q: 'Refunds and cancellations?', a: 'Cancel any time from your dashboard — no penalty. Refunds are pro-rated against goods already delivered, full refund if no work has started. We honour a money-back guarantee if our ETA slips by more than 48 hours without a heads-up.' },
    { q: 'Is the service safe from bans?', a: 'Every runner is manual-only, on residential IPs, screened against our Arc Raiders safety checklist. We have shipped 2,400+ Arc Raiders orders with zero account bans on file. Encrypted login handoff via OAuth where supported — we never store credentials.' },
    { q: 'Do you support all servers?', a: 'Yes — every published Arc Raiders region. Runner availability per region is confirmed in your dashboard; concierge will tell you up front if we need to schedule the order for a peak window in your timezone.' }
  ];

  /* ────────────────────────────────────────────────────────────
     HELPERS
     ──────────────────────────────────────────────────────────── */
  function $(id) { return document.getElementById(id); }
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  var CURRENCY_RATES = {
    USD: { rate: 1,    symbol: '$',  code: 'USD' },
    EUR: { rate: 0.92, symbol: '€',  code: 'EUR' },
    GBP: { rate: 0.79, symbol: '£',  code: 'GBP' },
    TRY: { rate: 32.5, symbol: '₺',  code: 'TRY' }
  };

  function fmtRC(n) {
    return n.toLocaleString('en-US');
  }

  function coinHtml(amount) {
    return fmtDollar(amount);
  }

  function fmtDollar(cents) {
    var sel = document.getElementById('arcCurrency');
    var code = sel ? sel.value : 'USD';
    var cur = CURRENCY_RATES[code] || CURRENCY_RATES.USD;
    return cur.symbol + ((cents / 100) * cur.rate).toFixed(2);
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
    cartMode: 'dollar', // 'dollar' | 'custom'
    play: 'piloted',    // 'piloted' | 'selfplay'  — selfplay adds +35% to the order
    platform: 'PC'      // 'PC' | 'XBOX' | 'PSN'   — label only, no price change
  };

  /* ────────────────────────────────────────────────────────────
     DOM REFERENCES
     ──────────────────────────────────────────────────────────── */
  var elNav = $('ebNav');
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
  var elModeBar = $('arcModeBar');
  var elCartSelfRow = $('arcCartSelfRow');
  var elCartSelf = $('arcCartSelf');
  var elAddCta = $('arcAddCta');
  var elServiceNav = $('arcServiceNav');
  var elBackBtn = $('arcBackBtn');
  var elArtBack = $('arcArtBack');
  var elReviewsRail = null; // reviews section removed
  var elFaqList = $('arcFaqList');
  var elFooter = $('siteFooter');

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

    // Count text
    elCartCount.textContent = n + ' item' + (n !== 1 ? 's' : '');

    // The nav cart badge reflects the persisted global cart (elyOrderStateV1),
    // owned by syncNavBadge() — not this in-service configurator — so it
    // survives leaving the service panel instead of resetting to 0.

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

        line.appendChild(info);
        line.appendChild(priceEl);
        line.appendChild(xBtn);
        elCartBody.appendChild(line);
      });

      // Stream by PRO add-on slot
      if (state.streamAddon) {
        var streamLine = document.createElement('div');
        streamLine.className = 'arc-line';
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
      if (elCartSelfRow) elCartSelfRow.hidden = true;
    } else {
      var subtotal = 0;
      items.forEach(function (it) { subtotal += it.price; });
      if (state.streamAddon) subtotal += state.streamAddon.price;
      var self = (state.play === 'selfplay' && subtotal > 0) ? Math.round(subtotal * 0.35) : 0;
      var fee = Math.round((subtotal + self) * 0.05);
      var total = subtotal + self + fee;

      elCartSub.textContent = coinHtml(subtotal);
      if (elCartSelfRow) elCartSelfRow.hidden = (self === 0);
      if (elCartSelf) elCartSelf.textContent = coinHtml(self);
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
    state.cartMode = (id === 'custom-orders') ? 'custom' : 'dollar';
    state.streamAddon = null;
    state.onCartRemove = null;
    resetModeBar();

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

    // Quick category nav + configurator
    renderServiceNav(id);
    renderConfig(id);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* Quick category nav inside the service view — switch service without
     leaving the panel. Active service highlighted. */
  function renderServiceNav(activeId) {
    if (!elServiceNav) return;
    elServiceNav.innerHTML = SERVICES.map(function (svc) {
      var on = svc.id === activeId;
      var tabBadge = TAB_BADGES[svc.id];
      var badgeHtml = tabBadge ? '<sup class="arc-pill-badge arc-pill-badge--' + tabBadge + '">' + BADGE_META[tabBadge].label.toUpperCase() + '</sup>' : '';
      return '<button type="button" class="arc-svc-pill' + (on ? ' on' : '') + '" data-service="' + svc.id + '"' +
        (on ? ' aria-current="true"' : '') + '>' + escHtml(svc.name) + badgeHtml + '</button>';
    }).join('');
    // Keep the active pill in view
    var activePill = qs('.arc-svc-pill.on', elServiceNav);
    if (activePill && activePill.scrollIntoView) {
      activePill.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
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
    var MOD_SURCHARGE = 10; // +$0.10 per weapon for Legendary/Epic mods

    function weaponCol(side, label) {
      return '<div class="arc-weapon-col">' +
        '<span class="arc-weapon-col-label">' + label + '</span>' +
        '<div class="arc-select-wrap"><select class="arc-select" id="cl' + side + 'Weapon">' +
          WEAPONS.map(function (w) { return '<option value="' + escHtml(w) + '">' + escHtml(w) + '</option>'; }).join('') +
        '</select></div>' +
        '<button type="button" class="arc-modtoggle-single" id="cl' + side + 'Mod" data-mod="none">' +
          '<span class="arc-modtoggle-single-lbl">Legendary / Epic Mods</span>' +
          '<span class="arc-modtoggle-single-price">+$0.10</span>' +
        '</button>' +
        '<div class="arc-weapon-col-qty" id="cl' + side + 'Qty"></div>' +
      '</div>';
    }

    configPanel.innerHTML =
      '<div class="arc-card">' +
        '<div class="arc-card-head">' +
          '<span class="arc-card-eyebrow">◆</span>' +
          '<h3 class="arc-card-title">Weapons</h3>' +
        '</div>' +
        '<div class="arc-weapon-cols">' +
          weaponCol('Pri', 'Primary') +
          weaponCol('Sec', 'Secondary') +
        '</div>' +
      '</div>' +

      '<div class="arc-card">' +
        '<div class="arc-card-head">' +
          '<span class="arc-card-eyebrow">◆</span>' +
          '<h3 class="arc-card-title">Augments</h3>' +
          '<span class="arc-card-sub">Set quantity</span>' +
        '</div>' +
        '<div class="arc-gear-fade-wrap"><div class="arc-gear-stack arc-gear-stack--scroll" id="clAugments"></div></div>' +
      '</div>' +

      '<div class="arc-card">' +
        '<div class="arc-card-head">' +
          '<span class="arc-card-eyebrow">◆</span>' +
          '<h3 class="arc-card-title">Shield</h3>' +
          '<span class="arc-card-sub">Choose one</span>' +
        '</div>' +
        '<div class="arc-gear-stack" id="clShields"></div>' +
      '</div>' +

      '<div class="arc-card">' +
        '<div class="arc-card-head">' +
          '<span class="arc-card-eyebrow">◆</span>' +
          '<h3 class="arc-card-title">Quick Use Bundles</h3>' +
        '</div>' +
        '<div class="arc-quick-fade-wrap"><div class="arc-quick arc-quick--scroll" id="clQuickGrid"></div></div>' +
      '</div>';

    // Wire up weapon steppers
    var priQtyStepper = createStepper(1, 0, 99, syncCart);
    $('clPriQty').appendChild(priQtyStepper);

    var secQtyStepper = createStepper(0, 0, 99, syncCart);
    $('clSecQty').appendChild(secQtyStepper);

    // Mod toggles
    var priMod = 'none';
    var secMod = 'none';

    function bindModToggle(btnId, setCb) {
      var btn = $(btnId);
      if (!btn) return;
      btn.addEventListener('click', function () {
        var isOn = btn.getAttribute('data-mod') === 'legendary';
        var next = isOn ? 'none' : 'legendary';
        btn.setAttribute('data-mod', next);
        btn.classList.toggle('on', !isOn);
        setCb(next);
        syncCart();
      });
    }

    bindModToggle('clPriMod', function (v) { priMod = v; });
    bindModToggle('clSecMod', function (v) { secMod = v; });

    // Augments (quantity steppers, min 0 — price per row = unit × qty)
    var augSteppers = {};
    var augStack = $('clAugments');
    AUGMENTS.forEach(function (a) {
      var cell = document.createElement('div');
      cell.className = 'arc-gear-cell';
      var info = document.createElement('div');
      var nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      nameSpan.textContent = a.name;
      var sub = document.createElement('span');
      sub.className = 'sub';
      sub.textContent = '+' + fmtDollar(a.price) + ' each';
      info.appendChild(nameSpan);
      info.appendChild(sub);
      cell.appendChild(info);
      var stepper = createStepper(0, 0, 99, function () {
        var q = stepper.getValue();
        cell.classList.toggle('on', q > 0);
        sub.textContent = q > 0 ? fmtDollar(a.price * q) : '+' + fmtDollar(a.price) + ' each';
        syncCart();
      });
      augSteppers[a.id] = stepper;
      cell.appendChild(stepper);
      augStack.appendChild(cell);
    });

    // Shield (choose one — stepper capped at 1, radio behaviour)
    var shieldSteppers = {};
    var shieldStack = $('clShields');
    SHIELDS.forEach(function (s) {
      var cell = document.createElement('div');
      cell.className = 'arc-gear-cell';
      var info = document.createElement('div');
      var nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      nameSpan.textContent = s.name;
      var sub = document.createElement('span');
      sub.className = 'sub';
      sub.textContent = '+' + fmtDollar(s.price);
      info.appendChild(nameSpan);
      info.appendChild(sub);
      cell.appendChild(info);
      var stepper = createStepper(0, 0, 1, function () {
        var on = stepper.getValue() > 0;
        cell.classList.toggle('on', on);
        if (on) {
          SHIELDS.forEach(function (other) {
            if (other.id !== s.id && shieldSteppers[other.id].getValue() > 0) {
              shieldSteppers[other.id].setValue(0);
            }
          });
        }
        syncCart();
      });
      shieldSteppers[s.id] = stepper;
      cell.appendChild(stepper);
      shieldStack.appendChild(cell);
    });

    // Quick Use Bundles
    var quSteppers = {};
    var quGrid = $('clQuickGrid');
    QUICK_USE.forEach(function (qu) {
      var cell = document.createElement('div');
      cell.className = 'arc-quick-cell';
      var nameDiv = document.createElement('div');
      nameDiv.className = 'arc-quick-name';
      nameDiv.innerHTML = escHtml(qu.name) + '<span class="pack">' + fmtDollar(qu.price) + ' · ' + qu.mul + 'x</span>';
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
      AUGMENTS.forEach(function (a) {
        var aq = augSteppers[a.id].getValue();
        if (aq > 0) items.push({ id: a.id, name: a.name, qty: aq, price: a.price * aq, color: '#9b6cff', sub: 'Augment' });
      });
      SHIELDS.forEach(function (s) {
        var shq = shieldSteppers[s.id].getValue();
        if (shq > 0) items.push({ id: 'cl-shield', name: s.name, qty: shq, price: s.price * shq, color: '#7faedc', sub: 'Shield' });
      });
      QUICK_USE.forEach(function (qu) {
        var q = quSteppers[qu.id].getValue();
        if (q > 0) items.push({ id: qu.id, name: qu.name, qty: q * qu.mul, price: q * qu.price, color: qu.color });
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

    function priceFor(item, tabId, tier) {
      if (tabId === 'gunpart') {
        if (item.tierPrices && tier && item.tierPrices[tier]) return item.tierPrices[tier];
        return item.price || 90;
      }
      return item.price || 100;
    }
    function defaultTier(item) {
      if (!item.tiers) return null;
      if (item.tiers.indexOf('II') >= 0) return 'II';
      return item.tiers[0];
    }

    function render() {
      var tab = BP_TABS[activeTab];
      var allSelected = tab.items.every(function (_, i) {
      var k = tab.id + '-' + i;
      return selected[k] && selected[k].qty > 0;
    });

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
              var isOn = !!(selected[key] && selected[key].qty > 0);
              var tier = tierChoices[key] || defaultTier(item);
              var p = priceFor(item, tab.id, tier);
              var cellHtml = '<div class="arc-bp-cell' + (isOn ? ' on' : '') + '" data-idx="' + i + '">';
              cellHtml += '<span class="arc-bp-cell-name">' + escHtml(item.name) + '</span>';
              if (item.tiers) {
                cellHtml += '<span class="arc-bp-tier-row">';
                item.tiers.forEach(function (t) {
                  cellHtml += '<span class="arc-bp-tier' + (t === tier ? ' on' : '') + '" data-tier="' + t + '" data-idx="' + i + '">' + t + '</span>';
                });
                cellHtml += '</span>';
              }
              cellHtml += '<span class="arc-bp-cell-price">' + fmtDollar(p) + '</span>';
              cellHtml += '<div id="bp-step-' + key + '"></div>';
              cellHtml += '</div>';
              return cellHtml;
            }).join('') +
          '</div>' +
        '</div>';

      configPanel.innerHTML = html;

      // Attach qty steppers
      tab.items.forEach(function (item, i) {
        var key = tab.id + '-' + i;
        var slotEl = document.getElementById('bp-step-' + key);
        if (!slotEl) return;
        var currentQty = (selected[key] && selected[key].qty) || 0;
        var stepper = createStepper(currentQty, 0, 99, function (v) {
          if (!selected[key]) {
            var tier = tierChoices[key] || defaultTier(item);
            selected[key] = { tier: tier, qty: v };
          } else {
            selected[key].qty = v;
          }
          var cellEl = slotEl.closest('.arc-bp-cell');
          if (cellEl) cellEl.classList.toggle('on', v > 0);
          syncCart();
        });
        slotEl.appendChild(stepper);
      });

      // Tab clicks
      qsa('.arc-bp-tab', configPanel).forEach(function (btn) {
        btn.addEventListener('click', function () {
          activeTab = parseInt(btn.getAttribute('data-tabidx'), 10);
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
              if (!selected[key] || selected[key].qty < 1) {
                var tier = tierChoices[key] || defaultTier(item);
                selected[key] = { tier: tier, qty: 1 };
              }
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
          if (!selected[key] || selected[key].qty < 1) return;
          var tier = selected[key].tier;
          var qty = selected[key].qty;
          var p = priceFor(item, tab.id, tier);
          var sub = tab.sub;
          if (tier) sub += ' · Tier ' + tier;
          items.push({ id: 'bp-' + key, name: item.name, qty: qty, price: p * qty, color: tab.color, sub: sub });
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
                    '<span class="arc-ws-price">' + fmtDollar(BENCH_PRICE) + ' / level</span>' +
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
    var PRICE_PER_SLOT = 35;
    var MIN_SLOTS = 20;
    var MAX_SLOTS = 280;
    var DISC_TIERS = [
      { min: 50, pct: 5 },
      { min: 100, pct: 10 },
      { min: 200, pct: 15 },
      { min: 280, pct: 20 }
    ];

    function getDepDiscount(slots) {
      var best = 0;
      for (var i = 0; i < DISC_TIERS.length; i++) {
        if (slots >= DISC_TIERS[i].min) best = DISC_TIERS[i].pct;
      }
      return best;
    }

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
        '</div>' +
        '<div class="arc-dep-tiers" id="depTiers">' +
          DISC_TIERS.map(function (t) {
            return '<span class="arc-dep-tier" data-pct="' + t.pct + '" data-min="' + t.min + '">' +
              t.min + (t.min < MAX_SLOTS ? '+' : '') + ' <span class="arc-dep-tier-pct">' + t.pct + '% OFF</span>' +
            '</span>';
          }).join('') +
        '</div>' +
        '<input type="range" class="arc-rc-slider" id="depSlider" min="' + MIN_SLOTS + '" max="' + MAX_SLOTS + '" step="1" value="' + MIN_SLOTS + '">' +
        '<div class="arc-dep-discount" id="depDiscount"></div>' +
        '<div class="arc-stepper-wide" style="margin-top:14px"><div id="depStepper"></div></div>' +
        '<p class="arc-panel-desc">Your selected slots are transferred to clean storage accounts and delivered after expedition. Any loss or in-game theft during the process is fully compensated.</p>' +
      '</div>';

    var slider = $('depSlider');
    var numEl = $('depNum');

    function updateDepUI(slots) {
      var disc = getDepDiscount(slots);
      qsa('.arc-dep-tier', configPanel).forEach(function (el) {
        var tierPct = parseInt(el.getAttribute('data-pct'), 10);
        el.classList.toggle('active', tierPct === disc && disc > 0);
      });
      var discEl = $('depDiscount');
      if (discEl) discEl.textContent = disc > 0 ? 'ACTIVE DISCOUNT: ' + disc + '% OFF' : '';
    }

    var stepper = createStepper(MIN_SLOTS, MIN_SLOTS, MAX_SLOTS, function (v) {
      slider.value = v;
      updateSliderFill();
      numEl.textContent = v;
      updateDepUI(v);
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
      updateSliderFill();
      updateDepUI(v);
      syncCart();
    });

    function syncCart() {
      var slots = stepper.getValue();
      var disc = getDepDiscount(slots);
      var price = Math.round(slots * PRICE_PER_SLOT * (1 - disc / 100));
      var sub = slots + ' slots' + (disc > 0 ? ' · ' + disc + '% off' : '');
      cart.replaceAll([{ id: 'dep', name: 'Depositary Slots', qty: slots, price: price, color: '#b794d6', sub: sub }]);
    }

    updateSliderFill();
    updateDepUI(MIN_SLOTS);
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

    var selected = {};
    var stack = $('bpStack');
    ITEMS.forEach(function (it) {
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'arc-gear-cell arc-gear-cell--select';
      cell.id = 'bp-cell-' + it.id;
      var info = document.createElement('div');
      var nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      nameSpan.textContent = it.name;
      var sub = document.createElement('span');
      sub.className = 'sub';
      sub.textContent = fmtDollar(it.price);
      info.appendChild(nameSpan);
      info.appendChild(sub);
      cell.appendChild(info);
      var mark = document.createElement('span');
      mark.className = 'arc-gear-check';
      cell.appendChild(mark);
      cell.addEventListener('click', function () {
        selected[it.id] = !selected[it.id];
        cell.classList.toggle('on', !!selected[it.id]);
        syncCart();
      });
      stack.appendChild(cell);
    });

    function syncCart() {
      var items = [];
      ITEMS.forEach(function (it) {
        if (selected[it.id]) items.push({ id: it.id, name: it.name, qty: 1, price: it.price, color: it.color });
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

    function getNextTier() {
      for (var i = TIERS.length - 1; i >= 0; i--) {
        if (currentAmount < TIERS[i].threshold) return TIERS[i];
      }
      return null;
    }

    function updateRcHint() {
      var hintEl = $('rcHint');
      if (!hintEl) return;
      var nextT = getNextTier();
      var newClass, newHtml;
      if (nextT && currentAmount < RC_MAX) {
        newClass = 'arc-rc-hint';
        newHtml = '<span class="pct">' + Math.round(nextT.disc * 100) + '%</span> discount at ' + fmtShort(nextT.threshold) + ' — add ' + fmtShort(nextT.threshold - currentAmount) + ' more';
      } else if (currentAmount >= RC_MAX) {
        newClass = 'arc-rc-hint max';
        newHtml = '<span class="pct">MAX</span> Maximum tier unlocked — 25% discount applied';
      } else {
        hintEl.hidden = true;
        return;
      }
      if (hintEl.className !== newClass) {
        hintEl.style.opacity = '0';
        requestAnimationFrame(function () {
          hintEl.className = newClass;
          hintEl.innerHTML = newHtml;
          hintEl.hidden = false;
          hintEl.style.opacity = '1';
        });
      } else {
        hintEl.className = newClass;
        hintEl.innerHTML = newHtml;
        hintEl.hidden = false;
      }
    }

    function render() {
      var disc = getDiscount(currentAmount);
      var priceCents = calcPrice(currentAmount);
      var pct = ((currentAmount - RC_MIN) / (RC_MAX - RC_MIN)) * 100;

      var hintHtml = '<div class="arc-rc-hint" id="rcHint" hidden></div>';

      configPanel.innerHTML =
        '<div class="arc-card">' +
          '<div class="arc-card-head">' +
            '<span class="arc-card-eyebrow">◆</span>' +
            '<h3 class="arc-card-title">Raider Coins</h3>' +
          '</div>' +
          '<div class="arc-rc-stat-row">' +
            '<div><span class="arc-rc-stat-label">Amount</span>' +
              '<span class="arc-rc-big">' + fmtShort(currentAmount) + '</span></div>' +
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
      updateRcHint();

      slider.addEventListener('input', function () {
        currentAmount = parseInt(slider.value, 10);
        var p = ((currentAmount - RC_MIN) / (RC_MAX - RC_MIN)) * 100;
        slider.style.setProperty('--p', p + '%');
        var bigEl = configPanel.querySelector('.arc-rc-big');
        var subEl = configPanel.querySelector('.arc-rc-stat-sub');
        var d = getDiscount(currentAmount), pc = calcPrice(currentAmount);
        if (bigEl) bigEl.textContent = fmtShort(currentAmount);
        if (subEl) subEl.innerHTML = fmtDollar(pc) + (d > 0 ? ' <span class="arc-sd-disc">−' + Math.round(d * 100) + '%</span>' : '');
        updateRcHint();
        syncCart();
      });
      slider.addEventListener('change', render);

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
      var sub = fmtShort(currentAmount);
      if (disc > 0) sub += ' · −' + Math.round(disc * 100) + '%';
      cart.replaceAll([{ id: 'rc', name: 'Raider Coins', qty: 1, price: priceCents, color: '#e5c26b', sub: sub }]);
    }

    render();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: TRIALS BOOST
     ════════════════════════════════════════════════════════════ */
  function renderTrialsBoostConfig() {
    var RANKUP_BASE = 2000;      // $20.00 base
    var CHALLENGE_PRICE = 1799;  // $17.99 flat
    var weeklyOn = false;
    var rankUpOn = false;
    var challengeOn = false;
    var hotshotOn = false;
    var selectedRank = TRIALS_RANKS[0];
    var rankOptionKey = '+1';
    var challengeSelected = {};

    // Rank-up options depend on the selected Current Rank.
    function rankOptionsFor(rank) {
      if (rank === 'Hotshot') {
        return [{ key: 'secure', label: 'Rank Secure', total: 2000 }];
      }
      if (rank === 'Daredevil III') {
        return [{ key: '+1', label: '+1 Rank', total: RANKUP_BASE + 500 }];
      }
      if (rank === 'Daredevil II') {
        return [
          { key: '+1', label: '+1 Rank',  total: RANKUP_BASE + 500 },
          { key: '+2', label: '+2 Ranks', total: RANKUP_BASE + 1500 }
        ];
      }
      return [
        { key: '+1', label: '+1 Rank',  total: RANKUP_BASE + 500 },
        { key: '+2', label: '+2 Ranks', total: RANKUP_BASE + 1500 },
        { key: '+3', label: '+3 Ranks', total: RANKUP_BASE + 2500 }
      ];
    }

    function currentRankOption() {
      var opts = rankOptionsFor(selectedRank);
      var match = opts.filter(function (o) { return o.key === rankOptionKey; })[0];
      return match || opts[0];
    }

    function render() {
      var opts = rankOptionsFor(selectedRank);
      // Keep the selected option valid for the chosen rank.
      if (!opts.some(function (o) { return o.key === rankOptionKey; })) rankOptionKey = opts[0].key;
      var rankOpt = currentRankOption();

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
              '<span class="arc-trials-price">$' + (rankOpt.total / 100).toFixed(2) + '</span>' +
            '</button>' +

            '<div class="arc-trials-collapse' + (rankUpOn ? ' on' : '') + '">' +
              '<div class="arc-card" style="margin:0">' +
                '<label class="arc-field-label">Current Rank</label>' +
                '<div class="arc-select-wrap"><select class="arc-select" id="trRank">' +
                  TRIALS_RANKS.map(function (r) { return '<option value="' + escHtml(r) + '"' + (r === selectedRank ? ' selected' : '') + '>' + escHtml(r) + '</option>'; }).join('') +
                '</select></div>' +
                '<label class="arc-field-label" style="margin-top:14px">Rank Option</label>' +
                '<div class="arc-pilltoggle" id="trRankOpt" style="grid-template-columns:repeat(' + opts.length + ',1fr)">' +
                  opts.map(function (o) {
                    return '<button type="button" data-key="' + o.key + '"' + (o.key === rankOptionKey ? ' class="on"' : '') + '>' + escHtml(o.label) + '</button>';
                  }).join('') +
                '</div>' +
              '</div>' +
            '</div>' +

            '<button type="button" class="arc-ws-row' + (challengeOn ? ' on' : '') + '" id="trChallenge">' +
              '<span class="arc-ws-switch"></span>' +
              '<span class="arc-ws-name">Specific Challenge</span>' +
              '<span class="arc-trials-price">$17.99</span>' +
            '</button>' +

            '<div class="arc-trials-collapse' + (challengeOn ? ' on' : '') + '">' +
              '<div class="arc-card" style="margin:0">' +
                '<label class="arc-field-label">Select Challenges</label>' +
                '<div class="arc-ws-rows" id="trChallengeList">' +
                  TRIALS_CHALLENGES.map(function (c) {
                    return '<button type="button" class="arc-ws-row' + (challengeSelected[c] ? ' on' : '') + '" data-challenge="' + escHtml(c) + '">' +
                      '<span class="arc-ws-switch"></span>' +
                      '<span class="arc-ws-name">' + escHtml(c) + '</span>' +
                    '</button>';
                  }).join('') +
                '</div>' +
              '</div>' +
            '</div>' +

            '<button type="button" class="arc-ws-row' + (hotshotOn ? ' on' : '') + '" id="trHotshot">' +
              '<span class="arc-ws-switch"></span>' +
              '<span class="arc-ws-name">Hotshot to Cantina Legend</span>' +
              '<span class="arc-trials-price">$250.00</span>' +
            '</button>' +

          '</div>' +
        '</div>';

      $('trWeekly').addEventListener('click', function () { weeklyOn = !weeklyOn; render(); });
      $('trRankUp').addEventListener('click', function () { rankUpOn = !rankUpOn; render(); });
      $('trChallenge').addEventListener('click', function () { challengeOn = !challengeOn; render(); });
      $('trHotshot').addEventListener('click', function () { hotshotOn = !hotshotOn; render(); });

      var rankSel = $('trRank');
      if (rankSel) {
        rankSel.addEventListener('change', function () { selectedRank = rankSel.value; render(); });
      }

      var rankOptEl = $('trRankOpt');
      if (rankOptEl) {
        rankOptEl.addEventListener('click', function (e) {
          var btn = e.target.closest('button[data-key]');
          if (!btn) return;
          rankOptionKey = btn.getAttribute('data-key');
          render();
        });
      }

      var chList = $('trChallengeList');
      if (chList) {
        chList.addEventListener('click', function (e) {
          var btn = e.target.closest('button[data-challenge]');
          if (!btn) return;
          var c = btn.getAttribute('data-challenge');
          challengeSelected[c] = !challengeSelected[c];
          btn.classList.toggle('on', challengeSelected[c]);
          syncCart();
        });
      }

      syncCart();
    }

    function syncCart() {
      var items = [];
      if (weeklyOn) items.push({ id: 'tr-weekly', name: 'Weekly All 3 Star', qty: 1, price: 2000, color: '#ff8a3d' });
      if (rankUpOn) {
        var rankOpt = currentRankOption();
        items.push({ id: 'tr-rankup', name: 'Rank Up Service', qty: 1, price: rankOpt.total, color: '#ff8a3d', sub: selectedRank + ' · ' + rankOpt.label });
      }
      if (challengeOn) {
        var chosen = TRIALS_CHALLENGES.filter(function (c) { return challengeSelected[c]; });
        items.push({ id: 'tr-challenge', name: 'Specific Challenge', qty: 1, price: CHALLENGE_PRICE, color: '#ff8a3d', sub: chosen.length ? chosen.join(', ') : 'Select challenges' });
      }
      if (hotshotOn) items.push({ id: 'tr-hotshot', name: 'Hotshot to Cantina Legend', qty: 1, price: 25000, color: '#ff8a3d' });
      cart.replaceAll(items);
    }

    render();
  }

  /* ════════════════════════════════════════════════════════════
     CONFIGURATOR: RAIDS
     ════════════════════════════════════════════════════════════ */
  function renderRaidsConfig() {
    var BASE = 350; // $3.50 per raid
    var EVENT_ADD = 150; // $1.50 per raid
    var STREAM_PER = 200; // $2.00 per raid
    var SUCCESS_MUL = 1.35;                          // Successful Raids Only
    var TRIO_MULS = { '2p1b': 1.50, '2b1p': 1.35 };  // optional trio configurations
    var PRESETS = [2, 4, 6, 8, 10, 12];

    var trioConfig = null; // null = standard 1 booster | '2p1b' | '2b1p'
    var eventMode = false;
    var successOnly = false;
    var selectedPreset = 4;
    var streamOn = false;

    function priceForPreset(n) {
      var base = n * BASE;
      if (eventMode) base += n * EVENT_ADD;
      if (trioConfig && TRIO_MULS[trioConfig]) base *= TRIO_MULS[trioConfig];
      if (successOnly) base *= SUCCESS_MUL;
      return Math.round(base);
    }

    function render() {
      var trioCardHtml = '';
      if (selectedPreset >= 2) {
        trioCardHtml =
          '<div class="arc-card">' +
            '<div class="arc-card-head"><span class="arc-card-eyebrow">◆</span><h3 class="arc-card-title">Trio Configuration</h3><span class="arc-card-sub">Optional</span></div>' +
            '<div class="arc-focus-grid">' +
              '<button type="button" class="arc-focus-card arc-focus-card--compact' + (trioConfig === '2p1b' ? ' on' : '') + '" data-trio="2p1b">' +
                '<span class="arc-focus-card-title">2 Players · 1 Booster</span>' +
                '<span class="arc-focus-card-sub">You and a friend raid alongside one of our boosters.</span>' +
                '<span class="arc-focus-card-badge">+50%</span>' +
              '</button>' +
              '<button type="button" class="arc-focus-card arc-focus-card--compact' + (trioConfig === '2b1p' ? ' on' : '') + '" data-trio="2b1p">' +
                '<span class="arc-focus-card-title">2 Boosters · 1 Player</span>' +
                '<span class="arc-focus-card-sub">You play carried by two of our boosters.</span>' +
                '<span class="arc-focus-card-badge">+35%</span>' +
              '</button>' +
            '</div>' +
          '</div>';
      }

      configPanel.innerHTML =
        '<div class="arc-card">' +
          '<div class="arc-card-head"><span class="arc-card-eyebrow">◆</span><h3 class="arc-card-title">Options</h3></div>' +
          '<div class="arc-ws-rows">' +
            '<button type="button" class="arc-ws-row arc-event-row' + (eventMode ? ' on' : '') + '" id="raidEvent">' +
              '<span class="arc-ws-switch"></span>' +
              '<span class="arc-event-meta"><span class="lbl">Event Mode</span><span class="sub">+$1.50 per raid</span></span>' +
              '<span class="arc-event-badge">EVENT</span>' +
            '</button>' +
            '<button type="button" class="arc-ws-row arc-event-row' + (successOnly ? ' on' : '') + '" id="raidSuccess">' +
              '<span class="arc-ws-switch"></span>' +
              '<span class="arc-event-meta"><span class="lbl">Successful Raids Only</span><span class="sub">You only pay for raids our team successfully clears.</span></span>' +
              '<span class="arc-event-badge">+35%</span>' +
            '</button>' +
          '</div>' +
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
          '<div class="arc-raid-notes"><span>Event mode adds +$1.50/raid</span><span>Trio &amp; Successful Raids add a surcharge</span></div>' +
        '</div>' +

        trioCardHtml +

        '<div class="arc-card">' +
          '<button type="button" class="arc-ws-row' + (streamOn ? ' on' : '') + '" id="raidStream">' +
            '<span class="arc-ws-switch"></span>' +
            '<span class="arc-ws-name">Stream by PRO</span>' +
            '<span class="arc-ws-price">+$2.00/raid</span>' +
          '</button>' +
        '</div>';

      // Trio configuration (optional — click again to clear)
      qsa('.arc-focus-card[data-trio]', configPanel).forEach(function (card) {
        card.addEventListener('click', function () {
          var v = card.getAttribute('data-trio');
          trioConfig = (trioConfig === v) ? null : v;
          render();
        });
      });

      // Event mode + Successful Raids Only
      $('raidEvent').addEventListener('click', function () { eventMode = !eventMode; render(); });
      $('raidSuccess').addEventListener('click', function () { successOnly = !successOnly; render(); });

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
      var parts = [];
      if (trioConfig === '2p1b') parts.push('2P·1B +50%');
      else if (trioConfig === '2b1p') parts.push('2B·1P +35%');
      if (eventMode) parts.push('Event');
      if (successOnly) parts.push('Success only +35%');
      var sub = parts.length ? parts.join(' · ') : 'Standard';
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
            return '<button type="button" class="arc-bp-tab' + (i === selectedTier ? ' active' : '') + '" data-idx="' + i + '">' + escHtml(t.label) + '</button>';
          }).join('') +
        '</div>' +
        '<p class="arc-tier-note" id="expTierNote"></p>' +
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
      var tier = EXP_TIERS[selectedTier];
      var noteEl = $('expTierNote');
      if (noteEl) noteEl.textContent = tier.label + ' base — ' + fmtDollar(tier.price);
      items.push({ id: 'exp-tier', name: 'Expedition ' + tier.label, qty: 1, price: tier.price, color: '#4ec6e8', sub: tier.label });
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
    var PRICES = { duo: 2000, trio: 3000, group: 3500 };
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
          '<div class="arc-pilltoggle arc-pilltoggle--coach" id="coachSession">' +
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
        '<p class="arc-co-body-text">Tell us what you need — anything not covered by the standard stations. Our concierge desk will price it and confirm at checkout.</p>' +
        '<textarea class="arc-textarea" id="coText" placeholder="Describe your custom order here..."></textarea>' +
        '<div class="arc-co-hint"><span class="bolt">⚡</span> Pricing confirmed after checkout</div>' +
        '<div class="arc-co-trust"><span>Manual Delivery</span><span>VPN Protected</span><span>24/7 Support</span></div>' +
      '</div>';

    $('coText').addEventListener('input', syncCart);

    function syncCart() {
      var text = $('coText').value.trim();
      if (text) {
        cart.replaceAll([{ id: 'custom', name: 'Custom Order', qty: 1, price: 0, color: '#e08a2c', sub: 'Confirm at checkout' }]);
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
    var SEED_PRICE = 75; // $0.75 per 100 seeds
    var SEED_MIN = 100;
    var SEED_MAX = 2000;
    var SEED_STEP = 100;
    var DISC_TIERS = [
      { threshold: 2000, disc: 0.20 },
      { threshold: 1000, disc: 0.10 }
    ];
    var PRESETS = [
      { seeds: 1000, price: 675 },
      { seeds: 2000, price: 1200 }
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
        var p = ((currentSeeds - SEED_MIN) / (SEED_MAX - SEED_MIN)) * 100;
        slider.style.setProperty('--p', p + '%');
        var bigEl = configPanel.querySelector('.arc-rc-big');
        var subEl = configPanel.querySelector('.arc-rc-stat-sub');
        var d = getDiscount(currentSeeds), pc = calcPrice(currentSeeds);
        if (bigEl) bigEl.innerHTML = currentSeeds + '<span class="unit">seeds</span>';
        if (subEl) subEl.innerHTML = fmtDollar(pc) + (d > 0 ? ' <span class="arc-sd-disc">−' + Math.round(d * 100) + '%</span>' : '');
        syncCart();
      });
      slider.addEventListener('change', render);

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
  bindServiceNav(elServiceNav);

  /* ────────────────────────────────────────────────────────────
     BACK BUTTONS
     ──────────────────────────────────────────────────────────── */
  if (elBackBtn) elBackBtn.addEventListener('click', closeService);
  if (elArtBack) elArtBack.addEventListener('click', closeService);

  /* ────────────────────────────────────────────────────────────
     ESC KEY
     ──────────────────────────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (state.sidebarOpen) { closeSidebar(); return; }
    if (state.currentService) { closeService(); return; }
  });

  /* ────────────────────────────────────────────────────────────
     ORDER ACTIONS — Add to Cart and Copy for Discord are two separate
     actions. "Add to Cart" always keeps its label; the "Copied!" state
     belongs only to the Copy for Discord button.
     ──────────────────────────────────────────────────────────── */
  function buildOrderSummary() {
    var svc = getService(state.currentService);
    if (!svc || !state.cartItems.length) return null;
    var items = state.cartItems;
    var isCustom = (state.cartMode === 'custom');
    var subtotal = 0;
    items.forEach(function (it) { subtotal += it.price; });
    if (state.streamAddon) subtotal += state.streamAddon.price;
    var self = (!isCustom && state.play === 'selfplay' && subtotal > 0) ? Math.round(subtotal * 0.35) : 0;
    var fee = Math.round((subtotal + self) * 0.05);
    return { svc: svc, items: items, isCustom: isCustom, subtotal: subtotal, self: self, fee: fee, total: subtotal + self + fee };
  }

  function showArcToast(msg) {
    var t = document.querySelector('.eb-toast');
    if (!t) { t = document.createElement('div'); t.className = 'eb-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(function () { t.classList.add('is-show'); });
    clearTimeout(t._hide);
    t._hide = setTimeout(function () { t.classList.remove('is-show'); }, 2400);
  }

  // Nav cart badge = total quantity in the persisted global cart.
  function syncNavBadge() {
    if (!elCartDot) return;
    var count = 0;
    try {
      var store = JSON.parse(localStorage.getItem('elyOrderStateV1') || '{}');
      if (Array.isArray(store.cart)) {
        count = store.cart.reduce(function (n, it) { return n + (it && it.qty ? it.qty : 1); }, 0);
      }
    } catch (e) {}
    if (count > 0) { elCartDot.textContent = count > 99 ? '99+' : String(count); elCartDot.hidden = false; }
    else { elCartDot.hidden = true; }
  }

  // ADD TO CART — write the configured order into the shared cart store
  // (elyOrderStateV1) so it persists into the nav cart and checkout.
  if (elAddCta) {
    elAddCta.addEventListener('click', function () {
      var o = buildOrderSummary();
      if (!o) { showArcToast('Configure your order first'); return; }
      var STORAGE_KEY = 'elyOrderStateV1';
      var sel = document.getElementById('arcCurrency');
      var currency = sel ? sel.value : 'USD';
      var detailLines = o.items.map(function (it) {
        var txt = it.name + ' × ' + it.qty;
        if (it.sub) txt += ' · ' + it.sub;
        txt += ' — ' + (o.isCustom ? 'CUSTOM' : fmtDollar(it.price));
        return txt;
      });
      if (state.streamAddon) {
        detailLines.push('Stream by PRO' + (state.streamAddon.sub ? ' · ' + state.streamAddon.sub : '') + ' — ' + (o.isCustom ? 'CUSTOM' : fmtDollar(state.streamAddon.price)));
      }
      if (o.self) {
        detailLines.push('Selfplay (+35%) — ' + fmtDollar(o.self));
      }
      detailLines.unshift(o.svc.name + ' · ' + state.platform + ' · ' + (state.play === 'selfplay' ? 'Selfplay' : 'Piloted'));
      var entry = {
        id: 'arc-' + Date.now(),
        gameId: 'arc',
        game: 'Arc Raiders',
        name: 'Arc Raiders — ' + o.svc.name,
        category: o.svc.name,
        qty: 1,
        total: o.isCustom ? 0 : +(o.total / 100).toFixed(2),
        custom: o.isCustom,
        details: detailLines.join('\n'),
        viewedCurrency: currency,
        addedAt: Date.now()
      };
      var store;
      try { store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { store = {}; }
      if (!Array.isArray(store.cart)) store.cart = [];
      store.cart.push(entry);
      store.currency = currency;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (e) {}
      syncNavBadge();
      showArcToast('Added to cart');
    });
  }

  /* ────────────────────────────────────────────────────────────
     SERVICE MODE BAR — Piloted/Selfplay + Platform (PC/XBOX/PSN).
     Lives in the order-summary foot (above Add to Cart) so it
     survives panel re-renders. Selfplay adds +35% (applied in
     renderCart / buildOrderSummary); platform is a label only.
     ──────────────────────────────────────────────────────────── */
  function resetModeBar() {
    state.play = 'piloted';
    state.platform = 'PC';
    if (!elModeBar) return;
    qsa('[data-play]', elModeBar).forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-play') === 'piloted');
    });
    qsa('[data-plat]', elModeBar).forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-plat') === 'PC');
    });
  }

  if (elModeBar) {
    elModeBar.addEventListener('click', function (e) {
      var playBtn = e.target.closest('[data-play]');
      if (playBtn) {
        state.play = playBtn.getAttribute('data-play');
        qsa('[data-play]', elModeBar).forEach(function (b) { b.classList.toggle('on', b === playBtn); });
        renderCart();
        return;
      }
      var platBtn = e.target.closest('[data-plat]');
      if (platBtn) {
        state.platform = platBtn.getAttribute('data-plat');
        qsa('[data-plat]', elModeBar).forEach(function (b) { b.classList.toggle('on', b === platBtn); });
      }
    });
  }

  /* ────────────────────────────────────────────────────────────
     INIT
     ──────────────────────────────────────────────────────────── */
  var arcCurrencyEl = document.getElementById('arcCurrency');
  if (arcCurrencyEl) {
    arcCurrencyEl.addEventListener('change', function () {
      renderCart();
      if (state.currentService) renderConfig(state.currentService);
    });
  }

  /* Station list badges (HOT / PRICE DROP / RECOMMENDED / POPULAR) */
  function initSidebarBadges() {
    if (!elSidebar) return;
    qsa('.arc-sidebar-item', elSidebar).forEach(function (item) {
      var id = item.getAttribute('data-service');
      var badges = SERVICE_BADGES[id];
      if (!badges || !badges.length) return;
      var nameEl = qs('.arc-sidebar-name', item);
      if (!nameEl) return;
      var mid = document.createElement('span');
      mid.className = 'arc-sidebar-mid';
      var badgesRow = document.createElement('span');
      badgesRow.className = 'arc-sidebar-badges';
      badges.forEach(function (b) {
        var meta = BADGE_META[b];
        if (!meta) return;
        var pill = document.createElement('span');
        pill.className = 'arc-badge arc-badge--' + b;
        pill.textContent = meta.label;
        badgesRow.appendChild(pill);
      });
      item.insertBefore(mid, nameEl);
      mid.appendChild(badgesRow);
      mid.appendChild(nameEl);
    });
  }

  /* Service + blueprint search overlay (covers the station map) */
  function initServiceSearch() {
    var btn = $('arcSvcSearchBtn');
    var panel = $('arcSvcSearch');
    var input = $('arcSvcSearchInput');
    var results = $('arcSvcSearchResults');
    var closeBtn = $('arcSvcSearchClose');
    if (!btn || !panel || !input || !results) return;

    var index = SERVICES.map(function (s) { return { type: 'Service', name: s.name, serviceId: s.id }; });
    var seen = {};
    BP_TABS.forEach(function (tab) {
      tab.items.forEach(function (item) {
        if (seen[item.name]) return;
        seen[item.name] = true;
        index.push({ type: 'Blueprint', name: item.name, serviceId: 'blueprints' });
      });
    });

    function renderResults(q) {
      var query = q.trim().toLowerCase();
      var matches = query
        ? index.filter(function (r) { return r.name.toLowerCase().indexOf(query) >= 0; })
        : index.filter(function (r) { return r.type === 'Service'; });
      if (!matches.length) {
        results.innerHTML = '<div class="arc-svc-search-empty">No services or blueprints match &ldquo;' + escHtml(q) + '&rdquo;</div>';
        return;
      }
      results.innerHTML = matches.slice(0, 80).map(function (r) {
        return '<button type="button" class="arc-svc-search-item" data-service="' + r.serviceId + '">' +
          '<span class="arc-svc-search-item-name">' + escHtml(r.name) + '</span>' +
          '<span class="arc-svc-search-item-type">' + r.type + '</span>' +
        '</button>';
      }).join('');
    }

    function open() {
      panel.classList.add('on');
      panel.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
      renderResults('');
      setTimeout(function () { input.focus(); }, 30);
    }
    function close() {
      panel.classList.remove('on');
      panel.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
      input.value = '';
    }

    btn.addEventListener('click', function () {
      panel.classList.contains('on') ? close() : open();
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    input.addEventListener('input', function () { renderResults(input.value); });
    results.addEventListener('click', function (e) {
      var item = e.target.closest('[data-service]');
      if (!item) return;
      close();
      openService(item.getAttribute('data-service'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('on')) close();
    });
  }

  initSidebarBadges();
  initServiceSearch();
  syncNavBadge();
  renderFaqs();

})();
