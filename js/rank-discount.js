/**
 * rank-discount.js — reads the rank stored in localStorage by dashboard.js
 * and exposes helpers for cart.js to apply the rank discount.
 *
 * Load this after auth.js on any page that has a cart.
 */
(function () {
  'use strict';

  var RANKS = [
    { name: 'Veteran',  min: 0,    discount: 0  },
    { name: 'Champion', min: 100,  discount: 5  },
    { name: 'Legend',   min: 250,  discount: 10 },
    { name: 'Immortal', min: 500,  discount: 15 },
    { name: 'Elysian',  min: 1000, discount: 20 },
  ];

  function getRankDiscount() {
    try {
      var raw = localStorage.getItem('elysium_rank_discount');
      if (raw) {
        var parsed = JSON.parse(raw);
        if (typeof parsed.discount === 'number') return parsed;
      }
    } catch (_) {}
    return { rank: 'Veteran', discount: 0 };
  }

  function applyRankDiscount(subtotal) {
    var info = getRankDiscount();
    if (!info.discount) return { discounted: subtotal, saving: 0, rank: info.rank, pct: 0 };
    var saving    = Math.round(subtotal * info.discount) / 100;
    var discounted = Math.round((subtotal - saving) * 100) / 100;
    return { discounted: discounted, saving: saving, rank: info.rank, pct: info.discount };
  }

  /* After Supabase login, refresh rank from profiles table */
  window.addEventListener('eb:authChange', function (e) {
    var user = e.detail && e.detail.user;
    if (!user) { localStorage.removeItem('elysium_rank_discount'); return; }

    var SB_URL = 'https://ylaxzlejhzgakhtfmsbt.supabase.co';
    var SB_KEY = 'sb_publishable_hjqgJX_RSpeypqtjJDk4xQ_pPGSnWAT';

    try {
      var sb = supabase.createClient(SB_URL, SB_KEY, {
        auth: { persistSession: true, autoRefreshToken: false, detectSessionInUrl: false },
      });
      sb.from('profiles').select('total_spent').eq('id', user.id).maybeSingle().then(function (res) {
        var spent = parseFloat((res.data && res.data.total_spent) || 0);
        var rank  = RANKS[0];
        for (var i = RANKS.length - 1; i >= 0; i--) {
          if (spent >= RANKS[i].min) { rank = RANKS[i]; break; }
        }
        try { localStorage.setItem('elysium_rank_discount', JSON.stringify({ rank: rank.name, discount: rank.discount })); } catch (_) {}
        window.dispatchEvent(new CustomEvent('eb:rankDiscountReady', { detail: { rank: rank.name, discount: rank.discount } }));
      });
    } catch (_) {}
  });

  window.ElysiumRank = { get: getRankDiscount, apply: applyRankDiscount };

})();
