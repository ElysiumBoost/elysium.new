    const DISCORD_URL = "https://discord.com/channels/1499767937974669363/1499796035382415462";

    window.elyPlaceholderSrc = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#120a1c"/><stop offset="100%" stop-color="#07050d"/></linearGradient></defs><rect width="480" height="300" fill="url(#g)" rx="12"/><text x="240" y="142" text-anchor="middle" fill="#a78bfa" font-family="system-ui,sans-serif" font-size="15" font-weight="700">ELYSIUM BOOST</text><text x="240" y="166" text-anchor="middle" fill="#7c6a9e" font-size="11">Premium artwork</text></svg>');
    function elyImagePlaceholder(img) {
      if (!img || img.dataset.elyPh === "1") return;
      img.dataset.elyPh = "1";
      img.removeAttribute("src");
      img.src = window.elyPlaceholderSrc;
      img.alt = img.alt || "ELYSIUM BOOST";
      img.style.display = "";
    }

    const rates = {
      USD: { symbol: "$", rate: 1 },
      EUR: { symbol: "\u20ac", rate: 0.92 },
      GBP: { symbol: "\u00a3", rate: 0.79 },
      TRY: { symbol: "\u20ba", rate: 32.5 }
    };

    function valorantEurToStoredTotal(eur) {
      return Number(eur || 0) / rates.EUR.rate;
    }

    const VALORANT_RANKS = [
      "Iron I", "Iron II", "Iron III", "Bronze I", "Bronze II", "Bronze III",
      "Silver I", "Silver II", "Silver III", "Gold I", "Gold II", "Gold III",
      "Platinum I", "Platinum II", "Platinum III", "Diamond I", "Diamond II", "Diamond III",
      "Ascendant I", "Ascendant II", "Ascendant III", "Immortal I", "Immortal II", "Immortal III"
    ];

    function valorantRankBadgeImageCandidates(rankLabel) {
      const r = String(rankLabel || "").trim();
      if (r === "Radiant") {
        return [
          "assets/valorant-radiant-boost.webp"
        ];
      }
      const m = r.match(/^([A-Za-z]+)/);
      if (!m) return [];
      const tier = m[1].toLowerCase();
      return [`assets/${tier}_3.webp`];
    }

    function applyValorantRankBadgeImage(img, rankLabel) {
      if (!img) return;
      const wrap = img.closest(".valorant-rank-card-visual");
      const ph = wrap && wrap.querySelector(".valorant-rank-card-ph");
      const urls = valorantRankBadgeImageCandidates(rankLabel);
      let idx = 0;
      const showPlaceholder = () => {
        img.removeAttribute("src");
        img.style.display = "none";
        if (ph) ph.hidden = false;
      };
      const tryNext = () => {
        if (idx >= urls.length) {
          showPlaceholder();
          return;
        }
        const url = urls[idx++];
        img.onload = () => {
          img.style.display = "block";
          if (ph) ph.hidden = true;
        };
        img.onerror = () => tryNext();
        img.alt = rankLabel || "";
        img.src = url;
      };
      tryNext();
    }

    function syncValorantRankBoostRankArt() {
      if (currentService()?.form !== "valorant-rank-boost") return;
      applyValorantRankBadgeImage($("valRbCurrentImg"), val("valRbCurrent"));
      applyValorantRankBadgeImage($("valRbDesiredImg"), val("valRbDesired"));
    }

    const VALORANT_RANK_SEGMENT_EUR = [
      4.5, 4.9, 5.5, 5.9, 6.4, 7.2, 7.9, 8.7, 9.9, 11.5, 12.9, 15.5, 18.5, 21.5, 26, 32, 38, 46, 58, 72, 95, 130, 170
    ];

    const valorantPlacementRankEur = {
      "Unranked": 2.4,
      "Iron": 2.4,
      "Bronze": 2.45,
      "Silver": 2.5,
      "Gold": 2.54,
      "Platinum": 2.9,
      "Diamond I": 3.4,
      "Diamond II": 3.7,
      "Diamond III": 4,
      "Ascendant I": 4.6,
      "Ascendant II": 5,
      "Ascendant III": 5.4,
      "Immortal I": 6.2,
      "Immortal II": 7,
      "Immortal III": 8,
      "Radiant": 10
    };

    const valorantRankedWinEur = {
      "Iron I": 2.2, "Iron II": 2.3, "Iron III": 2.4,
      "Bronze I": 2.5, "Bronze II": 2.6, "Bronze III": 2.7,
      "Silver I": 2.9, "Silver II": 3.1, "Silver III": 3.3,
      "Gold I": 3.6, "Gold II": 3.9, "Gold III": 4.2,
      "Platinum I": 4.8, "Platinum II": 5.2, "Platinum III": 5.6,
      "Diamond I": 6.5, "Diamond II": 7.2, "Diamond III": 8,
      "Ascendant I": 9, "Ascendant II": 10, "Ascendant III": 11.5,
      "Immortal I": 14, "Immortal II": 17, "Immortal III": 21
    };

    const valorantUnratedPackages = [
      { id: "u1", label: "1 Game", eur: 2 },
      { id: "u3", label: "3 Games", eur: 5.5 },
      { id: "u5", label: "5 Games", eur: 8.5 },
      { id: "u10", label: "10 Games", eur: 15 },
      { id: "u20", label: "20 Games", eur: 27 }
    ];

    const valorantLevelPackages = [
      { id: "l1", label: "Level 1 to 20", eur: 24.9 },
      { id: "l5", label: "Level 5 to 20", eur: 19.9 },
      { id: "l10", label: "Level 10 to 20", eur: 14.9 },
      { id: "l15", label: "Level 15 to 20", eur: 8.9 }
    ];

    const valorantBattlePassPackages = [
      { id: "bp-small", label: "Small Progress Pack", eur: 9.9 },
      { id: "bp-half", label: "Half Battle Pass", eur: 19.9 },
      { id: "bp-full", label: "Full Battle Pass", eur: 34.9 },
      { id: "bp-express", label: "Express Battle Pass", eur: 44.9 }
    ];

    const valorantCoachingHours = [
      { id: "c1", label: "1 Hour", eur: 14.9 },
      { id: "c2", label: "2 Hours", eur: 27.9 },
      { id: "c3", label: "3 Hours", eur: 39.9 },
      { id: "c5", label: "5 Hours", eur: 59.9 },
      { id: "c10", label: "10 Hours", eur: 109.9 }
    ];

    const valorantExtrasPaid = [
      { id: "duo", label: "Duo Queue", pct: 0.35 },
      { id: "otp", label: "OTP Plus", pct: 0.2 },
      { id: "vip", label: "VIP Booster", pct: 0.25 },
      { id: "priority", label: "Priority Start", pct: 0.25 },
      { id: "soloace", label: "Solo Ace", pct: 0.35 },
      { id: "stream", label: "Stream Games", pct: 0.2 }
    ];

    const valorantExtrasFree = [
      { id: "agent", label: "Agent Selection" },
      { id: "offline", label: "Offline Mode" }
    ];

    const valorantServers = ["EU", "NA", "LATAM", "BR", "KR", "JP", "AP", "OCE", "MEA"];

    const valorantCategoryContent = {
      "rank-boosting": {
        title: "Valorant Rank Boosting",
        short: "Climb faster with manual, professional rank progression tailored to your account.",
        intro: "Climb faster and smarter with ElysiumBoost Valorant Rank Boosting. Choose your current rank, set your desired rank, and let our experienced boosters handle the grind with clean, manual and professional gameplay. Perfect for players who want reliable progress without wasting time.",
        highlights: ["Manual and secure boosting", "Fast rank progression", "Professional Valorant players", "Solo or Duo options", "Flexible order customization", "Privacy-focused service"]
      },
      "placement-matches": {
        title: "Valorant Placement Matches",
        short: "Strong placement performance for a confident new act or season start.",
        intro: "Start your new act with confidence through ElysiumBoost Placement Matches. Our boosters help complete your placement games with strong performance, smart decision-making and a safe manual process, giving your account the best possible start for the season.",
        highlights: ["Great for new act / new season start", "Manual placement gameplay", "Choose your last known rank", "Select 1–5 placement games", "Optional priority and stream extras", "Safe and private service"]
      },
      "radiant-boost": {
        title: "Valorant Radiant Boost",
        short: "Premium high-rank support with custom planning and elite boosters.",
        intro: "Push toward the highest level of Valorant with ElysiumBoost Radiant Boost. This premium service is designed for Immortal and high-RR players who need elite-level performance, custom planning and experienced top-tier boosters.",
        highlights: ["Premium high-rank service", "Custom pricing for each order", "Designed for Immortal and Radiant players", "Elite booster assignment", "Schedule-based planning", "Contact-based custom service"]
      },
      "ranked-wins": {
        title: "Valorant Ranked Wins",
        short: "Pay per win at your rank — flexible progress without a full boost.",
        intro: "Need clean wins without committing to a full rank boost? ElysiumBoost Ranked Wins lets you choose your current rank and the number of wins you need. A simple, flexible and effective way to gain progress while keeping full control of your order.",
        highlights: ["Pay per selected win", "Ideal for steady rank progress", "Manual and safe gameplay", "Available for most ranks", "Solo or Duo options", "Clean order tracking in cart"]
      },
      "unrated-games": {
        title: "Valorant Unrated Games",
        short: "Casual unrated matches for activity, requirements, or relaxed play.",
        intro: "Keep your account active, complete match requirements or enjoy casual progress with ElysiumBoost Unrated Games. This service is perfect for non-ranked gameplay, account activity and relaxed match completion without rank pressure.",
        highlights: ["Casual unrated match completion", "Great for account activity", "No ranked pressure", "Manual gameplay only", "Simple package selection", "Safe and smooth process"]
      },
      "account-leveling": {
        title: "Valorant Account Leveling",
        short: "Reach ranked-ready levels faster with safe manual leveling packages.",
        intro: "Unlock ranked access faster with ElysiumBoost Account Leveling. Our team levels your Valorant account manually and safely, helping you reach competitive-ready requirements without spending hours grinding normal matches.",
        highlights: ["Reach ranked-ready level faster", "Manual account leveling", "Safe gameplay process", "Multiple level packages", "Ideal for new accounts", "Clean and simple order flow"]
      },
      "battle-pass": {
        title: "Valorant Battle Pass Boost",
        short: "More Battle Pass progress with manual play — pick the package that fits.",
        intro: "Get more rewards without the grind with ElysiumBoost Battle Pass Boost. Choose your progress package and let our team complete Battle Pass progress manually, helping you unlock more content while saving time.",
        highlights: ["Faster Battle Pass progress", "Multiple package options", "Manual gameplay", "Great for limited-time rewards", "Express option available", "Save time while unlocking content"]
      },
      "coaching": {
        title: "Valorant Coaching",
        short: "Personalized sessions for aim, positioning, agents, and game sense.",
        intro: "Improve your gameplay with personalized ElysiumBoost Valorant Coaching. Work with an experienced player to improve your aim, positioning, decision-making, agent usage and overall game sense with a structured coaching session.",
        highlights: ["Personalized coaching sessions", "Aim and mechanics improvement", "Positioning and decision-making help", "VOD review option", "Rank improvement planning", "Great for long-term progress"]
      }
    };

    const valorantTrustBlock = {
      title: "Why Choose ElysiumBoost?",
      intro: "ElysiumBoost focuses on safe, manual and high-quality gaming services. Every Valorant order is handled with privacy, professionalism and clear service structure, so customers can choose exactly what they need with confidence.",
      points: ["100% manual service", "No cheats, no scripts, no third-party tools", "Secure and privacy-focused process", "Professional experienced players", "Flexible service options", "Premium customer-focused experience"]
    };
