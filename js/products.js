    function fastService(id, title, icon, price, short, intro) {
      return {
        id, category: "services", title, cardTitle: title, icon, fromUSD: price, suffix: "", short, start: "By Request", form: "fast", intro
      };
    }

    function gameService(id, category, title, cardTitle, icon, fromUSD, suffix, short, intro, form = "fast") {
      return {
        id, category, categoryId: category, title, cardTitle, icon, fromUSD, suffix, short, start: "", form, intro
      };
    }

    function arcService(id, category, title, cardTitle, icon, fromUSD, suffix, short, start, form, oldUSD = 0) {
      return {
        id, category, title, cardTitle, icon, fromUSD, suffix, short, start, form,
        oldUSD,
        intro: arcIntro(id)
      };
    }

    function arcIntro(id) {
      const copy = {
        blueprints: "Pick the exact blueprint groups you need and use search to find items quickly. Selected items are delivered through a clean Discord ticket so boosters can confirm availability and handoff details.",
        guns: "Choose the weapon, quantity, and optional Blue or Legendary / Epic mods. Weapon and mod quantities are calculated separately, with bundle discounts applied only when the 20x bundle rules match.",
        loadout: "Build a full Arc Raiders loadout around your selected weapon. You can order individual gear or use 10x/20x special bundles for weapons, Looting Mk. 3 (Survivor) Augments, Medium Shields, rechargers, and Herbal Bandages.",
        coins: "Move the slider to choose Raider Coins from 100k to 10 million. Customers can view local currency, while every copied boosters ticket keeps the exact USD total.",
        seeds: "Choose Assorted Seeds from 100 to 10,000. Bulk checkpoints show the discount clearly before the order is added to the Discord ticket.",
        depositary: "Choose safe storage capacity for wipe protection. Boosters confirm the item handoff, keep a clean inventory list, and return items after ticket confirmation.",
        trials: "Order Weekly All 3 Stars, rank-up support, or both. Rank options unlock from your current rank so the ticket stays accurate before boosters confirm timing.",
        raid: "Choose raid count, Duo or Trio team, and optional Event Mode. If a raid fails, we will provide a free weapon gift.",
        pvp: "Choose PvP or PvE coaching, Duo or Trio support, and session hours up to 6. Coaching focuses on positioning, extraction decisions, fights, routes, and safer raid execution.",
        leveling: "Leveling is completed by logging into the customer's Steam or Xbox account. For account protection, boosters can use the customer's preferred VPN location; Steam or Xbox access is required or we cannot log in.",
        workshop: "Upgrade Workshop benches or Scrappy levels with clear level ranges and bundle pricing. The panel shows the total instantly before you add the order to cart.",
        expedition: "Select the exact expedition stages you want completed. Each chosen stage is listed separately in the Discord ticket for clean confirmation.",
        boss: "Choose Queen, Matriarch, or Harvester Puzzle service. The ticket keeps the target and quantity clear so boosters can confirm availability and completion requirements.",
        private: "Describe a custom Arc Raiders request for manual boosters review. Use this when your order does not fit a standard service, bundle, or quantity option."
      };
      return copy[id] || "Customize this service and copy the order into Discord.";
    }

    function valorantGameService(id, categoryId, cardTitle, icon, form, fromEur, extra = null) {
      const c = valorantCategoryContent[categoryId];
      const base = gameService(id, categoryId, c.title, cardTitle, icon, valorantEurToStoredTotal(fromEur), "", c.short, c.intro, form);
      return Object.assign(base, { noDiscount: true, valorantFromEur: fromEur }, extra || {});
    }

    const prices = {
      blueprint: .75,
      coins100k: .25,
      weapon: .90,
      blueMod: .05,
      premiumMod: .10,
      seeds100: .40,
      augment: .35,
      shield: .35,
      bandageBundle: .25,
      nadeBundle: .20,
      rechargerBundle: .15,
      surgeRechargerBundle: .15,
      trialsBase: 20,
      raid: 4,
      event: 1.50,
      workshopBench: 6,
      workshopMax: 36,
      scrappyLevel: 3,
      depositarySlot: .35
    };

    const coinTiers = [
      { amount:  3000000, discount: 0.10, label: "3M Coins"  },
      { amount:  6000000, discount: 0.15, label: "6M Coins"  },
      { amount:  9000000, discount: 0.20, label: "9M Coins"  },
      { amount: 12000000, discount: 0.25, label: "12M Coins" }
    ];

    const seedTiers = [
      { amount: 1000, discount: 0.10, label: "1,000 Seeds" },
      { amount: 2000, discount: 0.20, label: "2,000 Seeds" }
    ];

    function coinTier(amount) {
      for (let i = coinTiers.length - 1; i >= 0; i--) {
        if (amount >= coinTiers[i].amount) return coinTiers[i];
      }
      return null;
    }

    function seedTier(amount) {
      for (let i = seedTiers.length - 1; i >= 0; i--) {
        if (amount >= seedTiers[i].amount) return seedTiers[i];
      }
      return null;
    }

    function nextCoinTier(amount) {
      return coinTiers.find(tier => tier.amount > amount) || null;
    }

    function nextSeedTier(amount) {
      return seedTiers.find(tier => tier.amount > amount) || null;
    }

    const COIN_SLIDER_MIN = 100000;
    const COIN_SLIDER_MAX = 12000000;
    const SEED_SLIDER_MIN = 100;
    const SEED_SLIDER_MAX = 2000;

    function rangeTierMarkerPct(value, min, max) {
      if (max <= min) return 0;
      return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    }

    const blueprintGroups = {
      "Gun Blueprints": ["Anvil", "Aphelion", "Bettina", "Bobcat", "Burletta", "Dolabra", "Equalizer", "Hullcracker", "Il Toro", "Jupiter", "Osprey", "Canto", "Vulcano", "Torrente", "Tempest", "Venator", "Renegade"],
      "Backpack Blueprints": ["Combat Mk.3 (Flanking)", "Combat Mk.3 (Aggressive)", "Tactical Mk.3 (Defensive)", "Tactical Mk.3 (Healing)", "Looting Mk.3 (Survivor)", "Looting Mk.3 (Safekeeper)", "Tactical Mk.3 (Revival)", "Tactical Mk.3 (Smoke)"],
      "Quick Use Blueprints": ["Barricade Kit", "Explosive Mine", "Defibrillator", "White Flag", "Crash Mat", "Powered Descender", "Vita Shot", "Vita Spray", "Wolfpack", "Snap Hook", "Smoke Grenade", "Showstopper", "Lure Grenade", "Deadline", "Seeker Grenade", "Trailblazer", "Gas Mine", "Pulse Mine", "Fireworks Box", "Blue Light Stick", "Green Light Stick", "Yellow Light Stick", "Red Light Stick", "Remote Raider Flare", "Surge Coil", "Tagging Grenade", "Jolt Mine", "Blaze Grenade", "Trigger 'Nade"],
      "Gun Part Blueprints": ["Angled Grip II", "Angled Grip III", "Compensator II", "Extended Barrel", "Extended Light Magazine II", "Extended Medium Magazine II", "Extended Shotgun Magazine II", "Lightweight Stock", "Muzzle Brake II", "Padded Stock", "Shotgun Choke II", "Silencer I", "Silencer II", "Stable Stock II", "Heavy Gun Parts", "Compensator III", "Extended Light Magazine III", "Extended Medium Magazine III", "Extended Shotgun Magazine III", "Muzzle Brake III", "Shotgun Choke III", "Shotgun Silencer", "Stable Stock III", "Vertical Grip III", "Complex Gun Parts"]
    };
    const weapons = ["No Weapon", "Anvil", "Aphelion", "Bettina", "Bobcat", "Burletta", "Canto", "Dolabra", "Equalizer", "Hullcracker", "Il Toro", "Jupiter", "Osprey", "Renegade", "Tempest", "Torrente", "Venator", "Vulcano"];

    function weaponBasePriceUsd(name) {
      const w = String(name || "").trim();
      if (!w || w === "No Weapon") return 0;
      const tier30 = new Set(["Anvil", "Burletta", "Il Toro"]);
      const tier40 = new Set(["Venator", "Renegade", "Torrente", "Canto", "Osprey"]);
      const tier50 = new Set(["Tempest", "Bobcat", "Vulcano", "Bettina", "Hullcracker"]);
      const tier60 = new Set(["Dolabra", "Jupiter", "Equalizer", "Aphelion"]);
      if (tier30.has(w)) return 0.70;
      if (tier40.has(w)) return 0.80;
      if (tier50.has(w)) return 0.90;
      if (tier60.has(w)) return 1.00;
      return prices.weapon;
    }

    function weaponAllowsArcMods(name) {
      const w = String(name || "").trim();
      if (!w || w === "No Weapon") return false;
      return !new Set(["Dolabra", "Jupiter", "Equalizer"]).has(w);
    }
    const stages = [["Foundation", 10], ["Core Systems", 10], ["Framework", 10], ["Outfitting", 10], ["Load Stage", 15]];
    const workshops = ["Gunsmith", "Gear Bench", "Medical Lab", "Explosive Station", "Utility Station", "Refiner"];
    const ranks = ["Rookie I", "Rookie II", "Rookie III", "Tryhard I", "Tryhard II", "Tryhard III", "Wildcard I", "Wildcard II", "Wildcard III", "Daredevil I", "Daredevil II", "Daredevil III", "Hotshot"];

    const valorantCategories = [
      { id: "rank-boosting", label: "Rank Boosting", icon: "rank", badge: null, badgeType: null, featured: true, thumb: "assets/Rank Boosting.webp" },
      { id: "placement-matches", label: "Placement Matches", icon: "placement", badge: null, badgeType: null, featured: false, thumb: "assets/Placement Matches.webp" },
      { id: "radiant-boost", label: "Radiant Boost", icon: "radiant", badge: "HOT", badgeType: "hot", featured: false, thumb: "assets/Raidant Boost.webp" },
      { id: "ranked-wins", label: "Ranked Wins", icon: "wins", badge: null, badgeType: null, featured: false, thumb: "assets/Ranked Wins.webp" },
      { id: "unrated-games", label: "Unrated Games", icon: "unrated", badge: null, badgeType: null, featured: false, thumb: "assets/Unrated Matches.webp" },
      { id: "account-leveling", label: "Account Leveling", icon: "leveling", badge: null, badgeType: null, featured: false, thumb: "assets/account leveling.webp" },
      { id: "battle-pass", label: "Battle Pass", icon: "battle-pass", badge: "NEW", badgeType: "new", featured: false, thumb: "assets/Battle Pass.webp" },
      { id: "coaching", label: "Coaching", icon: "coaching", badge: null, badgeType: null, featured: false, thumb: "assets/Coaching.webp" }
    ];

    const wowCategories = [
      { id: "mythic-plus", label: "Mythic+", icon: "mythic", badge: "HOT", badgeType: "hot", featured: true },
      { id: "raid-calendar", label: "Raid Calendar", icon: "raid", badge: null, badgeType: null, featured: false },
      { id: "arena", label: "Arena", icon: "arena", badge: null, badgeType: null, featured: false },
      { id: "gear-boost", label: "Gear Boost", icon: "gear", badge: null, badgeType: null, featured: false },
      { id: "gold-trade", label: "Gold Trade", icon: "gold", badge: null, badgeType: null, featured: false },
      { id: "leveling", label: "Leveling", icon: "leveling", badge: null, badgeType: null, featured: false },
      { id: "delves", label: "Delves", icon: "delves", badge: "NEW", badgeType: "new", featured: false },
      { id: "dungeons", label: "Dungeons", icon: "dungeons", badge: null, badgeType: null, featured: false },
      { id: "request-a-service", label: "Request a Service", icon: "request", badge: null, badgeType: null, featured: false },
      { id: "timewalking-mage-tower", label: "Timewalking Mage Tower", icon: "mage-tower", badge: null, badgeType: null, featured: false },
      { id: "mounts", label: "Mounts", icon: "mounts", badge: null, badgeType: null, featured: false }
    ];

    function wowCategorySvg(iconKey) {
      const s = 'fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"';
      const map = {
        mythic: `<svg viewBox="0 0 24 24" aria-hidden="true" ${s}><path d="M5 19V5l4 3 3-3 4 2 3-2v14"/><path d="M9 10h2M14 10h2"/></svg>`,
        raid: `<svg viewBox="0 0 24 24" aria-hidden="true" ${s}><circle cx="12" cy="13" r="3"/><path d="M12 4v4M12 17v3M4 12h3M17 12h3"/></svg>`,
        arena: `<svg viewBox="0 0 24 24" aria-hidden="true" ${s}><rect x="4" y="6" width="16" height="13" rx="2"/><path d="M8 9h8M8 13h8"/></svg>`,
        gear: `<svg viewBox="0 0 24 24" aria-hidden="true" ${s}><path d="M12 5l2 3 3 1-2 2 1 4-4-2-4 2 1-4-2-2 3-1 2-3z"/><circle cx="12" cy="11" r="2"/></svg>`,
        gold: `<svg viewBox="0 0 24 24" aria-hidden="true" ${s}><circle cx="9" cy="14" r="5"/><circle cx="15" cy="10" r="5"/></svg>`,
        leveling: `<svg viewBox="0 0 24 24" aria-hidden="true" ${s}><path d="M4 18h16"/><path d="M7 18V9l3 5 3-8 3 7 2-3v8"/></svg>`,
        delves: `<svg viewBox="0 0 24 24" aria-hidden="true" ${s}><path d="M12 3C8 7 6 11 6 14a6 6 0 1012 0c0-3-2-7-6-11z"/></svg>`,
        dungeons: `<svg viewBox="0 0 24 24" aria-hidden="true" ${s}><rect x="5" y="4" width="14" height="16" rx="1"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>`,
        request: `<svg viewBox="0 0 24 24" aria-hidden="true" ${s}><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8h6M9 12h4"/></svg>`,
        "mage-tower": `<svg viewBox="0 0 24 24" aria-hidden="true" ${s}><path d="M12 3l8 6v9l-8 4-8-4V9l8-6z"/><path d="M12 8v7"/></svg>`,
        mounts: `<svg viewBox="0 0 24 24" aria-hidden="true" ${s}><ellipse cx="12" cy="16" rx="7" ry="3"/><path d="M7 16c0-6 2-9 5-10 2 4 3 7 3 10"/></svg>`
      };
      return map[iconKey] || map.mythic;
    }

    const games = [
      {
        id: "valorant",
        label: "Valorant",
        tabIcon: "i-rank",
        homeCardImage: "assets/backgrounds/val33.webp",
        heroBg: "assets/backgrounds/val33.webp",
        heroPosition: "center 15%",
        kicker: "Valorant",
        title: "Rank calculator & boosts",
        copy: "Dial in rank paths, placements, and wins with live pricing — then confirm everything in Discord.",
        categories: valorantCategories,
        popular: ["val-rank", "val-placement", "val-wins", "val-coach"],
        services: [
          valorantGameService("val-rank", "rank-boosting", "Rank Boosting", "i-rank", "valorant-rank-boost", 4.5),
          valorantGameService("val-placement", "placement-matches", "Placement Matches", "i-placement", "valorant-placement", 2.4),
          Object.assign(gameService("val-radiant", "radiant-boost", valorantCategoryContent["radiant-boost"].title, "Radiant Boost", "i-rank", 0, "", valorantCategoryContent["radiant-boost"].short, valorantCategoryContent["radiant-boost"].intro, "valorant-radiant"), { noDiscount: true, valorantCustomPrice: true }),
          valorantGameService("val-wins", "ranked-wins", "Ranked Wins", "i-win", "valorant-ranked-wins", 2.2),
          valorantGameService("val-unrated", "unrated-games", "Unrated Games", "i-swift", "valorant-unrated", 2),
          valorantGameService("val-level", "account-leveling", "Account Leveling", "i-star", "valorant-leveling", 8.9),
          valorantGameService("val-bp", "battle-pass", "Battle Pass", "i-star", "valorant-battlepass", 9.9),
          valorantGameService("val-coach", "coaching", "Coaching", "i-coach", "valorant-coaching", 14.9)
        ]
      },
      {
        id: "circle",
        label: "Boost+",
        tabIcon: "i-circle",
        homeCardImage: "assets/backgrounds/ana1.webp",
        heroBg: "assets/backgrounds/ana1.webp",
        heroPosition: "center center",
        kicker: "Boost+",
        title: "Boost+ Teammate Services",
        copy: "Boost+ teammate sessions are coming soon — ordering opens after listings go live.",
        categories: [],
        popular: [],
        services: []
      },
      {
        id: "social",
        label: "Social",
        tabIcon: "i-star",
        homeCardImage: "assets/backgrounds/socialfinale.webp",
        heroBg: "assets/backgrounds/socialfinale.webp",
        heroPosition: "center 32%",
        kicker: "Social",
        title: "Social Services",
        copy: "Choose social, companion, and community-focused services with a clean Discord-ready request.",
        categories: [],
        popular: [],
        services: []
      },
      {
        id: "lol",
        label: "League of Legends",
        tabIcon: "i-star",
        homeCardImage: "assets/backgrounds/lol33.webp",
        heroBg: "assets/backgrounds/lol33.webp",
        heroPosition: "center center",
        kicker: "League of Legends Boost",
        title: "League Ranked Services",
        copy: "Build a League order for net wins, duo queue, or coaching, then paste the ticket into Discord.",
        categories: [],
        popular: ["lol-win", "lol-duo", "lol-coach"],
        services: [
          fastService("lol-win", "Net Win", "i-trials", 10.99, "One clean net win order.", "A simple win-based order with the final details confirmed by boosters."),
          fastService("lol-duo", "Duo Queue", "i-coach", 12.99, "Queue together with a stronger teammate.", "Play with a coordinated teammate and confirm region and role in Discord."),
          fastService("lol-coach", "LoL Coaching", "i-coach", 19.99, "Lane, macro, matchup, and replay review.", "Choose session length and add your focus areas before copying the ticket.")
        ]
      },
      {
        id: "tft",
        label: "Teamfight Tactics",
        comingSoon: true,
        tabIcon: "i-star",
        homeCardImage: "assets/backgrounds/tft-home-card.webp",
        heroBg: "assets/backgrounds/tft-home-card.webp",
        heroPosition: "center center",
        kicker: "Teamfight Tactics",
        title: "Teamfight Tactics",
        copy: "Teamfight Tactics services are available now. Choose from Rank Up, Placement Matches, Coaching, or Double Up and confirm details through Discord.",
        categories: [
          { id: "rank-up", label: "Rank Up", icon: "i-rank", badge: "POPULAR", badgeTone: "recommended", thumb: "assets/tft-rank-up.webp" },
          { id: "tft-placement", label: "Placement Matches", icon: "i-rank", badge: "NEW", badgeTone: "new", thumb: "assets/tft-placement-matches.webp" },
          { id: "coaching", label: "Coaching", icon: "i-coach", badge: "NEW", badgeTone: "new", thumb: "assets/tft-coaching.webp" },
          { id: "double-up", label: "Double Up", icon: "i-star", badge: "NEW", badgeTone: "new", thumb: "assets/tft-double-up.webp" }
        ],
        popular: [],
        services: [
          { ...gameService("tft-rank-up", "rank-up", "TFT Rank Up", "TFT Rank Up", "i-rank", 7, "", "Rank Up starts at $7 per division. Live price calculator included.", "Choose your current and desired TFT rank for a live total. Iron\u2013Platinum: $7/div, Emerald: $10/div, Diamond: $12/div, Master+: $17/step.", "tft-rank-up"), thumb: "assets/tft-rank-up.webp" },
          { ...gameService("tft-placement-matches", "tft-placement", "TFT Placement Matches", "TFT Placement Matches", "i-rank", 30, " / 5 matches", "Placement Matches price is based on your last rank and always covers 5 matches.", "Get your TFT placement matches handled by a verified booster. Choose your last rank and confirm through your Discord ticket.", "tft-placement"), thumb: "assets/tft-placement-matches.webp" },
          { ...gameService("tft-coaching", "coaching", "TFT Coaching", "TFT Coaching", "i-coach", 10, "", "TFT coaching starts at $10 with optional premium add-ons.", "Improve your TFT decision-making, economy, positioning, comp choices, and late-game execution with a manual coaching request.", "tft-coaching"), thumb: "assets/tft-coaching.webp" },
          { ...gameService("tft-double-up", "double-up", "TFT Double Up", "TFT Double Up", "i-star", 9, "", "Double Up starts at $9.", "Play or request support for TFT Double Up mode and confirm the details through Discord."), thumb: "assets/tft-double-up.webp" }
        ]
      },
      {
        id: "wow",
        label: "World of Warcraft",
        tabIcon: "i-star",
        homeCardImage: "assets/backgrounds/wow22.webp",
        heroBg: "assets/backgrounds/wow22.webp",
        heroPosition: "center center",
        kicker: "World of Warcraft Boost",
        title: "World of Warcraft Services",
        copy: "Browse WoW categories and preview the hub. Services and pricing will be added soon; use Request a Service for custom orders when available.",
        categories: wowCategories,
        popular: [],
        services: []
      },
      {
        id: "cs2",
        label: "Counter-Strike 2",
        tabIcon: "i-star",
        homeCardImage: "assets/backgrounds/cs2-bg.webp",
        heroBg: "assets/backgrounds/cs2-bg.webp",
        heroPosition: "center center",
        kicker: "Counter-Strike 2",
        title: "Counter-Strike 2",
        copy: "Premier and FACEIT CS2 services are coming soon — one hub for matchmaking and competitive queues.",
        categories: [],
        popular: [],
        services: []
      },
      {
        id: "arc",
        label: "Arc Raiders",
        tabIcon: "i-raid",
        homeCardImage: "assets/backgrounds/arc-raiders-home-card.webp?v=social-card-live1",
        heroBg: "assets/backgrounds/arc-raiders-bg.webp?v=social-card-live1",
        heroPosition: "center center",
        kicker: "Arc Raiders",
        title: "Premium extraction marketplace",
        copy: "Loot, currencies, blueprints, and raid services — configure in-site, then lock details with our team in Discord.",
        categories: [
          { id: "blueprints", label: "Blueprints", icon: "i-blueprint", badge: "HOT", badgeTone: "hot", microBadge: "Manual Delivery" },
          { id: "guns", label: "All Weapons", icon: "i-gun", badge: "PRICE DROP", badgeTone: "price-drop", microBadge: "In-Raid Delivery" },
          { id: "loadouts", label: "Custom Loadout", icon: "i-loadout", badge: "POPULAR", badgeTone: "popular", microBadge: "Shields · Extras" },
          { id: "coins", label: "Raider Coins", icon: "i-coins", badge: "PRICE DROP", badgeTone: "price-drop", microBadge: "Fast Discord" },
          { id: "seeds", label: "Assorted Seeds", icon: "i-coins", badge: "NEW", badgeTone: "new", microBadge: "Bulk deals" },
          { id: "depositary", label: "Depositary", icon: "i-depository", microBadge: "Secure storage" },
          { id: "trials", label: "Trials Boost", icon: "i-trials", badge: "RECOMMENDED", badgeTone: "recommended", microBadge: "Manual Delivery" },
          { id: "raids", label: "Raids", icon: "i-raid", microBadge: "Extract runs" },
          { id: "coaching", label: "Raid Coaching", icon: "i-coach", badge: "RECOMMENDED", badgeTone: "recommended", microBadge: "Discord support" },
          { id: "leveling", label: "Leveling", icon: "i-level", microBadge: "Pilot / duo" },
          { id: "workshop", label: "Workshop & Scrappy", icon: "i-workshop", badge: "RECOMMENDED", badgeTone: "recommended", microBadge: "Base upgrades" },
          { id: "bosses", label: "Boss & Puzzle", icon: "i-skull", microBadge: "Guaranteed scope" },
          { id: "expeditions", label: "Expedition Boost", icon: "i-expedition", badge: "HOT", badgeTone: "hot", microBadge: "Stage clears" },
          { id: "custom", label: "Custom Orders", icon: "i-private", microBadge: "Private brief" }
        ],
        popular: ["trials", "guns", "blueprints", "coins"],
        services: [
          arcService("blueprints", "blueprints", "Buy Arc Raiders Blueprints", "All Blueprints", "i-blueprint", .75, " each", "Discounted blueprints, now $0.75 each instead of $1.50.", "30-60 Minutes", "blueprints", 1.50),
          arcService("guns", "guns", "Buy Arc Raiders Weapons", "All Guns", "i-gun", .90, " each", "Discounted weapons and mods with automatic attachment quantity.", "30-60 Minutes", "guns", 1.15),
          arcService("loadout", "loadouts", "Build a Custom Loadout", "Custom Loadout", "i-loadout", 0, "", "Weapon, mods, Looting Mk. 3 Augments, Medium Shields, quick-use bundles, and special bundles.", "30-90 Minutes", "loadout"),
          arcService("coins", "coins", "Buy Raider Coins", "Raider Coins", "i-coins", .25, " / 100k", "Choose from 100k to 9 million coins with instant price updates.", "15-30 Minutes", "coins", 0.4167),
          { ...arcService("seeds", "seeds", "Buy Assorted Seeds", "Assorted Seeds", "i-coins", .35, " / 100", "Choose 100 to 5,000 Assorted Seeds with bulk discount checkpoints.", "15-30 Minutes", "seeds"), noDiscount: true },
          { ...arcService("depositary", "depositary", "Arc Raiders Depositary Service", "Depositary Service", "i-depository", 17.50, " / 50 slots", "Safe item storage service with selectable inventory slots, 20 to 280 slots.", "30-60 Minutes", "depositary"), noDiscount: true },
          arcService("trials", "trials", "Arc Raiders Trials Boost", "Trials Boost", "i-trials", 20, "", "All 3 Stars with current-rank and rank option rules.", "1-3 Hours", "trials", 40),
          arcService("raid", "raids", "Arc Raiders Raid Boost", "All Raids", "i-raid", 4, " / raid", "Choose raid count, Duo/Trio, and optional Event Mode.", "15-30 Minutes", "raid", 4.67),
          arcService("pvp", "coaching", "Arc Raiders Coaching", "Coaching", "i-coach", 20, " / hr", "PvP or PvE coaching with Duo/Trio session options.", "By Request", "pvp", 26.67),
          arcService("leveling", "leveling", "Arc Raiders Leveling", "Leveling", "i-level", 0, "", "Current level, target level, speed, and account access requirements.", "By Request", "leveling"),
          { ...arcService("workshop", "workshop", "Arc Raiders Workshop & Scrappy", "Workshop & Scrappy", "i-workshop", 3, "+", "Upgrade workshops from level 1 to 3 or select Scrappy levels from 1 to 5.", "30-60 Minutes", "workshop"), noDiscount: true },
          arcService("expedition", "expeditions", "Arc Raiders Expedition Boost", "Expedition Boost", "i-expedition", 10, "+", "Choose a specific expedition stage.", "30-60 Minutes", "expedition", 13.33),
          { ...arcService("boss", "bosses", "Arc Raiders Boss & Puzzle", "Boss & Puzzle", "i-skull", 20, "", "Queen, Matriarch, or Harvester Puzzle completion request.", "30-90 Minutes", "boss"), noDiscount: true },
          arcService("private", "custom", "Private Arc Raiders Order", "Private Order", "i-private", 0, "", "Write a custom request for manual boosters review.", "Manual", "private")
        ]
      }
    ];

    const GAME_DROPDOWN_ORDER = ["arc", "valorant", "lol", "tft", "wow", "cs2", "circle", "social"];
    const GAME_HASH_SLUGS = {
      arc: "arc-raiders",
      valorant: "valorant",
      wow: "world-of-warcraft",
      circle: "boost-plus",
      lol: "league-of-legends",
      tft: "teamfight-tactics",
      cs2: "counter-strike-2",
      social: "social"
    };
    const HASH_TO_GAME_ID = (() => {
      const map = {};
      Object.entries(GAME_HASH_SLUGS).forEach(([gameId, slug]) => {
        map[String(slug).toLowerCase()] = gameId;
      });
      map.arc = "arc";
      map.wow = "wow";
      map.lol = "lol";
      map.tft = "tft";
      map["teamfight-tactics"] = "tft";
      map.circle = "circle";
      map.premier = "cs2";
      map.faceit = "cs2";
      map["cs2-premier"] = "cs2";
      map["cs2-faceit"] = "cs2";
      map.cs2 = "cs2";
      return map;
    })();

    function parseGameHash() {
      const raw = (location.hash || "").replace(/^#\/?/, "").trim();
      if (!raw) return null;
      const parts = raw.split("/");
      const slug = parts[0].toLowerCase();
      const categorySlug = parts[1] ? parts[1].toLowerCase() : null;
      const gameId = HASH_TO_GAME_ID[slug] || null;
      if (!gameId) return null;
      return { gameId, categorySlug };
    }

    function syncGameHash(gameId) {
      const base = location.pathname + (location.search || "");
      if (!gameId) {
        if (location.hash) history.replaceState(null, "", base);
        return;
      }
      const slug = GAME_HASH_SLUGS[gameId];
      if (!slug) return;
      const raw = (location.hash || "").replace(/^#/, "");
      const parts = raw.split("/");
      const existingCat = (parts[0] === slug && parts[1]) ? "/" + parts[1] : "";
      const frag = "#" + slug + existingCat;
      if (location.hash !== frag) history.replaceState(null, "", base + frag);
    }

    /** Single source for “ordering disabled” titles; used before order-center-upgrade loads. */
    window.ELY_COMING_SOON_GAME_IDS = new Set(["circle", "wow", "cs2", "lol", "social", "tft"]);









