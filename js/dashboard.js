(function () {
  'use strict';

  /* ── Constants ─────────────────────────────────────────────── */

  var SB_URL = 'https://ylaxzlejhzgakhtfmsbt.supabase.co';
  var SB_KEY = 'sb_publishable_hjqgJX_RSpeypqtjJDk4xQ_pPGSnWAT';

  var RANKS = [
    { name: 'Veteran',  min: 0,    max: 100,  discount: 0,  icon: 'ti-shield',  perks: ['Basic support'] },
    { name: 'Champion', min: 100,  max: 250,  discount: 5,  icon: 'ti-star',    perks: ['5% discount', 'Priority support'] },
    { name: 'Legend',   min: 250,  max: 500,  discount: 10, icon: 'ti-flame',   perks: ['10% discount', 'Fast delivery', 'Priority support'] },
    { name: 'Immortal', min: 500,  max: 1000, discount: 15, icon: 'ti-bolt',    perks: ['15% discount', 'Custom booster selection', 'All above'] },
    { name: 'Elysian',  min: 1000, max: null, discount: 20, icon: 'ti-crown',   perks: ['20% discount', 'VIP Discord channel', 'Exclusive badge', 'All above'] },
  ];

  var AVATAR_BASE  = '../assets/avatars/elysium_unique_avatar_';
  var AVATAR_COUNT = 16;

  /* ── State ─────────────────────────────────────────────────── */

  var _sb, _user, _profile = {}, _orders = [];
  var _selectedAvNum = null;
  var _currentFilter = 'all';

  /* ── Bootstrap ─────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    _sb = supabase.createClient(SB_URL, SB_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });

    authGuard().then(function (user) {
      if (!user) return;
      _user = user;
      updateGreeting();
      setupNav();
      setupForms();
      buildAvatarGrids();
      var hash = window.location.hash.slice(1) || 'overview';
      showSection(hash, false);
      loadData();
    });
  });

  /* ── Auth guard ─────────────────────────────────────────────── */

  function authGuard() {
    return _sb.auth.getSession().then(function (res) {
      if (res.data && res.data.session && res.data.session.user) {
        return res.data.session.user;
      }
      return new Promise(function (resolve) {
        var timer = setTimeout(function () {
          window.location.replace('../index.html?login=true');
          resolve(null);
        }, 3000);

        _sb.auth.onAuthStateChange(function (event, session) {
          if (session && session.user) {
            clearTimeout(timer);
            resolve(session.user);
          }
        });
      });
    });
  }

  /* ── Navigation ─────────────────────────────────────────────── */

  function setupNav() {
    document.querySelectorAll('[data-section]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var section = el.dataset.section;
        history.pushState(null, '', '#' + section);
        showSection(section, true);
      });
    });

    window.addEventListener('popstate', function () {
      showSection(window.location.hash.slice(1) || 'overview', true);
    });

    var logoutBtn = document.getElementById('dbNavLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        _sb.auth.signOut().then(function () {
          window.location.replace('../index.html');
        });
      });
    }
  }

  function showSection(key, animate) {
    var valid = ['overview', 'orders', 'tickets', 'rank', 'account', 'security', 'discord'];
    if (valid.indexOf(key) === -1) key = 'overview';

    document.querySelectorAll('.db-section').forEach(function (s) {
      s.classList.add('db-hidden');
      s.classList.remove('db-section-enter');
    });

    document.querySelectorAll('[data-section]').forEach(function (el) {
      el.classList.toggle('is-active', el.dataset.section === key);
    });

    var id = 'dbSection' + key.charAt(0).toUpperCase() + key.slice(1);
    var target = document.getElementById(id);
    if (target) {
      target.classList.remove('db-hidden');
      if (animate) {
        void target.offsetWidth; /* force reflow */
        target.classList.add('db-section-enter');
      }
    }
  }

  /* ── Load data ──────────────────────────────────────────────── */

  function loadData() {
    Promise.all([
      _sb.from('profiles')
        .select('username, email, discord_id, country, avatar_url, total_spent, referral_code')
        .eq('id', _user.id)
        .maybeSingle(),
      _sb.from('orders')
        .select('*')
        .eq('user_id', _user.id)
        .order('created_at', { ascending: false }),
    ]).then(function (results) {
      _profile = (results[0].data) || {};
      _orders  = (results[1].data) || [];

      if (!_profile.referral_code) {
        _profile.referral_code = 'ELY-' + _user.id.slice(0, 8).toUpperCase();
      }

      var rank = computeRank(parseFloat(_profile.total_spent) || 0);
      try { localStorage.setItem('elysium_rank_discount', JSON.stringify({ rank: rank.name, discount: rank.discount })); } catch (_) {}

      renderSidebar();
      renderOverview();
      renderOrders();
      renderOrdersStats();
      renderTickets();
      renderTicketsStats();
      renderRank();
      renderAccount();
      renderSecurity();
      renderDiscord();
    });
  }

  /* ── Rank ───────────────────────────────────────────────────── */

  function computeRank(spent) {
    var current = RANKS[0];
    for (var i = RANKS.length - 1; i >= 0; i--) {
      if (spent >= RANKS[i].min) { current = RANKS[i]; break; }
    }
    return current;
  }

  /* ── Sidebar ────────────────────────────────────────────────── */

  function renderSidebar() {
    var name  = _profile.username || (_user.user_metadata && (_user.user_metadata.username || _user.user_metadata.full_name)) || (_user.email && _user.email.split('@')[0]) || 'Champion';
    var spent = parseFloat(_profile.total_spent) || 0;
    var rank  = computeRank(spent);

    var nameEl  = document.getElementById('dbProfileName');
    var emailEl = document.getElementById('dbProfileEmail');
    var rankBEl = document.getElementById('dbRankBadgeName');

    if (nameEl)  nameEl.textContent  = name;
    if (emailEl) emailEl.textContent = _user.email || '';
    if (rankBEl) rankBEl.textContent = rank.name;

    /* Cache for nav sync across pages */
    try {
      if (name) localStorage.setItem('elysium_username', name);
      if (_profile.avatar_url) localStorage.setItem('elysium_avatar_url', _profile.avatar_url);
    } catch (e) {}

    var circle = document.getElementById('dbAvatarCircle');
    if (circle) {
      if (_profile.avatar_url) {
        var resolved = _profile.avatar_url.startsWith('assets/') ? '../' + _profile.avatar_url : _profile.avatar_url;
        circle.innerHTML = '<img src="' + resolved + '" alt="' + esc(name) + '">';
        circle.classList.add('has-img');
      } else {
        circle.textContent = makeInitials(name);
        circle.classList.remove('has-img');
      }
    }

    var active = _orders.filter(function (o) { return (o.status || '').toLowerCase().indexOf('progress') !== -1; }).length;
    var badge  = document.getElementById('dbNavOrdersBadge');
    if (badge && active > 0) { badge.textContent = active; badge.hidden = false; }
  }

  function updateGreeting() {
    var h = new Date().getHours();
    var el = document.getElementById('dbGreeting');
    if (el) el.textContent = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }

  function makeInitials(name) {
    return (name || 'EB').split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase() || 'EB';
  }

  /* ── Overview ───────────────────────────────────────────────── */

  function renderOverview() {
    var spent  = parseFloat(_profile.total_spent) || 0;
    var rank   = computeRank(spent);
    var active = _orders.filter(function (o) { return (o.status || '').toLowerCase().indexOf('progress') !== -1; }).length;

    /* Stat cards */
    var grid = document.getElementById('dbStatsGrid');
    if (grid) {
      grid.innerHTML =
        statCard('ti-shopping-bag',    'Total Orders',  _orders.length, false) +
        statCard('ti-currency-dollar', 'Total Spent',   '$' + spent.toFixed(2), false) +
        statCard('ti-loader-2',        'Active Orders', active, active > 0) +
        statCard('ti-crown',           'Current Rank',  rank.name, false);

      grid.querySelectorAll('[data-count]').forEach(function (el) {
        countUp(el, parseFloat(el.dataset.count));
      });
    }

    /* Last order */
    var lastCard = document.getElementById('dbLastOrderCard');
    if (lastCard) {
      var activeOrders = _orders.filter(function (o) { return (o.status || '').toLowerCase().indexOf('progress') !== -1; });
      var latest = activeOrders[0] || _orders[0];
      if (latest) {
        var sc = statusClass(latest.status);
        lastCard.innerHTML =
          '<div class="db-card-header"><span class="db-card-title-sm"><i class="ti ti-activity"></i> Latest Order</span>' +
          '<span class="db-status-badge db-status-' + sc + '">' + esc(latest.status || 'Pending') + '</span></div>' +
          '<div class="db-last-order-game">' + esc(latest.game || 'Boost') + '</div>' +
          '<div class="db-last-order-service">' + esc(latest.service_name || latest.service || '—') + '</div>' +
          '<div class="db-last-order-meta"><span><i class="ti ti-calendar"></i> ' + fmtDate(latest.created_at || latest.date) + '</span>' +
          '<span class="db-last-order-price">$' + parseFloat(latest.price || 0).toFixed(2) + '</span></div>';
      } else {
        lastCard.innerHTML =
          '<div class="db-card-header"><span class="db-card-title-sm"><i class="ti ti-activity"></i> Latest Order</span></div>' +
          '<div class="db-empty-mini">No orders yet</div>';
      }
    }

    /* Rank progress */
    var rankCard = document.getElementById('dbRankProgressCard');
    if (rankCard) {
      var ridx = rankIdx(rank);
      var next = RANKS[ridx + 1];
      var pct  = 100;
      var msg  = 'Maximum rank achieved!';
      if (next) {
        pct = Math.min(100, Math.round(((spent - rank.min) / (next.min - rank.min)) * 100));
        msg = 'Spend $' + (next.min - spent).toFixed(2) + ' more to reach ' + next.name;
      }
      rankCard.innerHTML =
        '<div class="db-card-header"><span class="db-card-title-sm"><i class="ti ti-crown"></i> Elysium Rank</span></div>' +
        '<div class="db-rank-name-display">' + esc(rank.name) + '</div>' +
        '<div class="db-rank-discount-display">Your discount: <strong>' + rank.discount + '% off</strong></div>' +
        '<div class="db-progress-wrap">' +
          '<div class="db-progress-track"><div class="db-progress-fill" style="width:0%" data-pct="' + pct + '"></div></div>' +
          '<span class="db-progress-pct">' + pct + '%</span>' +
        '</div>' +
        '<div class="db-progress-label">' + esc(msg) + '</div>';

      setTimeout(function () {
        var fill = rankCard.querySelector('.db-progress-fill');
        if (fill) fill.style.width = fill.dataset.pct + '%';
      }, 80);
    }

    /* Referral */
    var refCard = document.getElementById('dbReferralCard');
    if (refCard) {
      var code = _profile.referral_code || '—';
      refCard.innerHTML =
        '<div class="db-card-header"><span class="db-card-title-sm"><i class="ti ti-users"></i> Referral Program</span></div>' +
        '<div class="db-referral-desc">Invite friends, earn <strong>3% per order</strong> they place.</div>' +
        '<div class="db-referral-code-wrap">' +
          '<code class="db-referral-code" id="dbRefCode">' + esc(code) + '</code>' +
          '<button class="db-copy-btn" type="button" onclick="dbCopyRef()" title="Copy code" aria-label="Copy referral code"><i class="ti ti-copy"></i></button>' +
        '</div>';
    }
  }

  function statCard(icon, label, value, highlight) {
    var isNum     = typeof value === 'number';
    var countAttr = isNum ? ' data-count="' + value + '"' : '';
    var display   = isNum ? '0' : esc(String(value));
    return '<div class="db-stat-card' + (highlight ? ' db-stat-highlight' : '') + '">' +
      '<i class="ti ' + icon + ' db-stat-icon"></i>' +
      '<div class="db-stat-value"' + countAttr + '>' + display + '</div>' +
      '<div class="db-stat-label">' + label + '</div>' +
      '</div>';
  }

  /* ── Orders ─────────────────────────────────────────────────── */

  function renderOrders(filter) {
    if (filter !== undefined) _currentFilter = filter;
    var body = document.getElementById('dbOrdersBody');
    if (!body) return;

    var filtered = _orders;
    if (_currentFilter === 'active')    filtered = _orders.filter(function (o) { return (o.status || '').toLowerCase().indexOf('progress') !== -1; });
    if (_currentFilter === 'completed') filtered = _orders.filter(function (o) { return (o.status || '').toLowerCase().indexOf('complet') !== -1; });
    if (_currentFilter === 'pending')   filtered = _orders.filter(function (o) { return (o.status || '').toLowerCase() === 'pending'; });

    if (!filtered.length) {
      body.innerHTML =
        '<div class="db-orders-empty">' +
        '<img src="../assets/elysium-logo-mark.png" alt="" width="48" loading="lazy">' +
        '<p class="db-empty-title">No orders yet, Champion</p>' +
        '<a href="../index.html" class="eb-btn-primary">Start Your Climb</a>' +
        '</div>';
      return;
    }

    body.innerHTML =
      '<div class="db-table-wrap"><table class="db-table">' +
      '<thead><tr><th>Game</th><th>Service</th><th class="db-date-cell">Date</th><th>Price</th><th>Status</th><th>Ticket</th></tr></thead>' +
      '<tbody>' + filtered.map(orderRow).join('') + '</tbody>' +
      '</table></div>';
  }

  function orderRow(o) {
    var sc = statusClass(o.status);
    var discordUrl = 'https://discord.gg/elysiumgg';
    return '<tr class="db-order-row">' +
      '<td><span class="db-game-badge">' + esc(o.game || 'Boost') + '</span></td>' +
      '<td class="db-service-cell">' + esc(o.service_name || o.service || '—') + '</td>' +
      '<td class="db-date-cell">' + fmtDate(o.created_at || o.date) + '</td>' +
      '<td class="db-price-cell">$' + parseFloat(o.price || 0).toFixed(2) + '</td>' +
      '<td><span class="db-status-badge db-status-' + sc + '">' + esc(o.status || 'Pending') + '</span></td>' +
      '<td><a href="' + discordUrl + '" target="_blank" rel="noopener noreferrer" class="db-ticket-btn" aria-label="Open Discord ticket"><i class="ti ti-brand-discord"></i></a></td>' +
      '</tr>';
  }

  /* ── Order stats (My Orders tab) ───────────────────────────── */

  function renderOrdersStats() {
    var el = document.getElementById('dbOrdersStats');
    if (!el) return;
    var total     = _orders.length;
    var active    = _orders.filter(function (o) { return (o.status || '').toLowerCase().indexOf('progress') !== -1; }).length;
    var completed = _orders.filter(function (o) { return (o.status || '').toLowerCase().indexOf('complet') !== -1; }).length;
    var cancelled = _orders.filter(function (o) { return (o.status || '').toLowerCase().indexOf('cancel') !== -1; }).length;
    el.innerHTML =
      oStat(total,     'Total') +
      oStat(active,    'Active') +
      oStat(completed, 'Completed') +
      oStat(cancelled, 'Cancelled');
  }

  function oStat(val, label) {
    return '<div class="db-order-stat">' +
      '<div class="db-order-stat-val">' + val + '</div>' +
      '<div class="db-order-stat-lbl">' + label + '</div>' +
      '</div>';
  }

  /* ── Tickets ────────────────────────────────────────────────── */

  function ticketState(o) {
    var s = (o.status || '').toLowerCase();
    if (s.indexOf('complet') !== -1) return { label: 'Solved',        cls: 'completed' };
    if (s.indexOf('progress') !== -1) return { label: 'Open',          cls: 'active' };
    return { label: 'Waiting Reply', cls: 'pending' };
  }

  function renderTicketsStats() {
    var el = document.getElementById('dbTicketsStats');
    if (!el) return;
    var ticketed = _orders.filter(function (o) { return !!o.discord_ticket_id; });
    var open    = ticketed.filter(function (o) { return ticketState(o).cls === 'active'; }).length;
    var waiting = ticketed.filter(function (o) { return ticketState(o).cls === 'pending'; }).length;
    var solved  = ticketed.filter(function (o) { return ticketState(o).cls === 'completed'; }).length;
    el.innerHTML = oStat(open, 'Open') + oStat(waiting, 'Waiting Reply') + oStat(solved, 'Solved');
  }

  function renderTickets() {
    var body = document.getElementById('dbTicketsBody');
    if (!body) return;
    var ticketed = _orders.filter(function (o) { return !!o.discord_ticket_id; });

    if (!ticketed.length) {
      body.innerHTML =
        '<div class="db-orders-empty">' +
        '<i class="ti ti-ticket db-empty-icon"></i>' +
        '<p class="db-empty-title">No tickets yet</p>' +
        '<a href="https://discord.gg/elysiumgg" target="_blank" rel="noopener noreferrer" class="eb-btn-primary"><i class="ti ti-brand-discord"></i> Open a Ticket on Discord</a>' +
        '<div class="db-help-topics">' +
          helpTopic('ti-package', 'Where is my order?') +
          helpTopic('ti-arrows-exchange', 'Request a refund or change') +
          helpTopic('ti-user-star', 'Switch my assigned booster') +
        '</div>' +
        '</div>';
      return;
    }

    body.innerHTML =
      '<div class="db-table-wrap"><table class="db-table">' +
      '<thead><tr><th>Subject</th><th>Status</th><th class="db-date-cell">Last Update</th><th>Action</th></tr></thead>' +
      '<tbody>' + ticketed.map(function (o) {
        var st = ticketState(o);
        return '<tr class="db-order-row">' +
          '<td class="db-service-cell">' + esc(o.service_name || o.service || 'Support ticket') + '</td>' +
          '<td><span class="db-status-badge db-status-' + st.cls + '">' + st.label + '</span></td>' +
          '<td class="db-date-cell">' + fmtDate(o.created_at || o.date) + '</td>' +
          '<td><a href="https://discord.gg/elysiumgg" target="_blank" rel="noopener noreferrer" class="db-ticket-btn"><i class="ti ti-external-link"></i> Open</a></td>' +
          '</tr>';
      }).join('') +
      '</tbody></table></div>';
  }

  function helpTopic(icon, label) {
    return '<a class="db-help-topic" href="https://discord.gg/elysiumgg" target="_blank" rel="noopener noreferrer">' +
      '<i class="ti ' + icon + '"></i><span>' + esc(label) + '</span>' +
      '<i class="ti ti-arrow-right db-help-topic-arrow"></i></a>';
  }

  /* ── Rank section ───────────────────────────────────────────── */

  function renderRank() {
    var spent = parseFloat(_profile.total_spent) || 0;
    var rank  = computeRank(spent);
    var ridx  = rankIdx(rank);
    var next  = RANKS[ridx + 1];

    var facts = document.getElementById('dbRankFacts');
    if (facts) {
      var remaining = next ? Math.max(0, next.min - spent) : 0;
      facts.innerHTML =
        oStat('$' + spent.toFixed(2),               'Total Spent') +
        oStat(rank.discount + '%',                  'Your Discount') +
        oStat(next ? next.name : 'Max',             'Next Rank') +
        oStat(next ? '$' + remaining.toFixed(2) : 'Achieved', 'To Next Rank');
    }

    var hero = document.getElementById('dbRankHero');
    if (hero) {
      var pct = 100;
      var msg = "You've reached the highest rank!";
      if (next) {
        pct = Math.min(100, Math.round(((spent - rank.min) / (next.min - rank.min)) * 100));
        msg = 'Spend $' + (next.min - spent).toFixed(2) + ' more to unlock ' + next.name;
      }
      hero.innerHTML =
        '<div class="db-rank-hero-inner">' +
          '<div class="db-rank-hero-icon-wrap"><i class="ti ' + rank.icon + ' db-rank-hero-icon"></i></div>' +
          '<div class="db-rank-hero-info">' +
            '<div class="db-rank-hero-label">Current Rank</div>' +
            '<div class="db-rank-hero-name">' + esc(rank.name) + '</div>' +
            '<div class="db-rank-hero-discount">' + rank.discount + '% discount on all orders</div>' +
            '<div class="db-rank-hero-progress">' +
              '<div class="db-progress-track db-progress-track-lg">' +
                '<div class="db-progress-fill db-progress-fill-lg" style="width:0%" data-pct="' + pct + '"></div>' +
              '</div>' +
              '<div class="db-rank-progress-meta">' +
                '<span class="db-progress-label">' + esc(msg) + '</span>' +
                '<span class="db-progress-pct">' + pct + '%</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      setTimeout(function () {
        var fill = hero.querySelector('.db-progress-fill-lg');
        if (fill) fill.style.width = fill.dataset.pct + '%';
      }, 100);
    }

    var tiersEl = document.getElementById('dbRankTiersGrid');
    if (tiersEl) {
      tiersEl.innerHTML = RANKS.map(function (r) {
        var isCurrent  = r.name === rank.name;
        var isUnlocked = spent >= r.min;
        var cls = isCurrent ? 'is-current' : isUnlocked ? 'is-unlocked' : 'is-locked';
        return '<div class="db-rank-tier db-rank-tier-' + cls + '">' +
          '<i class="ti ' + r.icon + ' db-tier-icon"></i>' +
          '<div class="db-tier-name">' + r.name + '</div>' +
          '<div class="db-tier-threshold">$' + r.min + '+</div>' +
          '<div class="db-tier-discount">' + r.discount + '% off</div>' +
          '<ul class="db-tier-perks">' + r.perks.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
          (isCurrent ? '<div class="db-tier-current-label">Current</div>' : '') +
          '</div>';
      }).join('');
    }
  }

  /* ── Account ────────────────────────────────────────────────── */

  function renderAccount() {
    var name = _profile.username || (_user.user_metadata && (_user.user_metadata.username || _user.user_metadata.full_name)) || (_user.email && _user.email.split('@')[0]) || '';

    var fU = document.getElementById('dbFUsername');
    var fE = document.getElementById('dbFEmail');
    var fD = document.getElementById('dbFDiscord');
    var fC = document.getElementById('dbFCountry');

    if (fU) fU.value = name;
    if (fE) fE.value = _user.email || '';
    if (fD) fD.value = _profile.discord_id || '';
    if (fC) fC.value = _profile.country || '';

    applyAvPreview(_profile.avatar_url, name);

    if (_profile.avatar_url) {
      var m = _profile.avatar_url.match(/elysium_unique_avatar_(\d+)\.png$/);
      if (m) { _selectedAvNum = m[1]; markAvSelected(_selectedAvNum); }
    }

    /* Profile summary + aside */
    var rank = computeRank(parseFloat(_profile.total_spent) || 0);
    setText('dbAccName', name || 'Champion');
    setText('dbAccEmail', _user.email || '');
    setText('dbAccRankBadge', rank.name);
    setText('dbAccRefCode', _profile.referral_code || '—');
    setText('dbAccMember', fmtDate(_user.created_at));

    var statusEl = document.getElementById('dbAccStatusList');
    if (statusEl) {
      var emailOk   = !!_user.email_confirmed_at;
      var discordOk = !!_profile.discord_id;
      statusEl.innerHTML =
        infoRow('Account', 'Active', true) +
        infoRow('Email', emailOk ? 'Verified' : 'Unverified', emailOk) +
        infoRow('Discord', discordOk ? 'Linked' : 'Not linked', discordOk);
    }
  }

  function infoRow(label, val, ok) {
    return '<div class="db-info-row"><span class="db-info-row-label">' + esc(label) + '</span>' +
      '<span class="db-info-row-val ' + (ok ? 'is-ok' : 'is-warn') + '">' +
      '<i class="ti ' + (ok ? 'ti-circle-check' : 'ti-circle-x') + '"></i>' + esc(val) + '</span></div>';
  }

  /* ── Security ───────────────────────────────────────────────── */

  function renderSecurity() {
    var sessions = document.getElementById('dbSessionsList');
    if (sessions) {
      var last = _user.last_sign_in_at ? fmtDateTime(_user.last_sign_in_at) : 'Active now';
      sessions.innerHTML =
        '<div class="db-session-row">' +
        '<i class="ti ti-device-desktop db-session-device-icon"></i>' +
        '<div class="db-session-info">' +
        '<span class="db-session-device">This device</span>' +
        '<span class="db-session-time">Last sign-in: ' + esc(last) + '</span>' +
        '</div>' +
        '<span class="db-session-current-badge">Current</span>' +
        '</div>';
    }

    var checklist = document.getElementById('dbChecklist');
    if (checklist) {
      var emailOk   = !!_user.email_confirmed_at;
      var discordOk = !!_profile.discord_id;
      checklist.innerHTML =
        checkRow('Email address verified', emailOk) +
        checkRow('Password protected', true) +
        checkRow('Discord account linked', discordOk) +
        checkRow('Two-factor authentication', false);
    }
  }

  function checkRow(label, done) {
    return '<div class="db-check-row ' + (done ? 'db-check-done' : 'db-check-todo') + '">' +
      '<span class="db-check-icon"><i class="ti ' + (done ? 'ti-check' : 'ti-minus') + '"></i></span>' +
      '<span class="db-check-text">' + esc(label) + '</span></div>';
  }

  /* ── Discord ────────────────────────────────────────────────── */

  function renderDiscord() {
    var el = document.getElementById('dbDiscordConnect');
    if (!el) return;
    var linked = !!_profile.discord_id;
    el.innerHTML =
      '<div class="db-discord-conn-head">' +
        '<div class="db-discord-conn-mark"><i class="ti ti-brand-discord"></i></div>' +
        '<div class="db-discord-conn-info">' +
          '<div class="db-discord-conn-label">Connection Status</div>' +
          '<div class="db-discord-conn-status ' + (linked ? 'is-linked' : 'is-unlinked') + '">' +
            '<span class="db-discord-conn-dot"></span>' + (linked ? 'Linked' : 'Not linked') +
          '</div>' +
        '</div>' +
      '</div>' +
      (linked
        ? '<div class="db-discord-conn-tag">Linked account: <strong>' + esc(_profile.discord_id) + '</strong></div>'
        : '<div class="db-discord-conn-tag">Add your Discord tag in <strong>My Account</strong> so we can reach you about orders.</div>');
  }

  function applyAvPreview(url, name) {
    var preview = document.getElementById('dbAvPreview');
    if (!preview) return;
    if (url) {
      var r = url.startsWith('assets/') ? '../' + url : url;
      preview.innerHTML = '<img src="' + r + '" alt="Avatar preview">';
      preview.classList.add('has-img');
    } else {
      preview.textContent = makeInitials(name || 'Champion');
      preview.classList.remove('has-img');
    }
  }

  function markAvSelected(num) {
    document.querySelectorAll('.db-av-cell').forEach(function (btn) {
      var sel = btn.dataset.avNum === num;
      btn.classList.toggle('is-selected', sel);
      btn.setAttribute('aria-pressed', String(sel));
    });
  }

  /* ── Avatar grids ───────────────────────────────────────────── */

  function buildAvatarGrids() {
    ['dbAvGrid', 'dbModalAvGrid'].forEach(function (id) {
      var grid = document.getElementById(id);
      if (!grid) return;
      grid.innerHTML = '';
      for (var i = 1; i <= AVATAR_COUNT; i++) {
        var num = i < 10 ? '0' + i : '' + i;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'db-av-cell';
        btn.dataset.avNum = num;
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', 'Avatar ' + num);
        var img = document.createElement('img');
        img.src = AVATAR_BASE + num + '.png';
        img.alt = 'Avatar ' + num;
        img.loading = 'lazy';
        btn.appendChild(img);
        var check = document.createElement('span');
        check.className = 'db-av-check';
        check.setAttribute('aria-hidden', 'true');
        check.innerHTML = '<svg viewBox="0 0 18 18" fill="none"><path d="M3 9l4 4 8-8" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        btn.appendChild(check);
        btn.addEventListener('click', function () { selectAvatar(this.dataset.avNum); });
        grid.appendChild(btn);
      }
    });

    var wrap = document.getElementById('dbAvatarWrap');
    if (wrap) wrap.addEventListener('click', openAvModal);

    document.getElementById('dbAvatarModalClose')
      && document.getElementById('dbAvatarModalClose').addEventListener('click', closeAvModal);

    var overlay = document.getElementById('dbAvatarModal');
    if (overlay) overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeAvModal();
    });
  }

  function openAvModal() {
    var m = document.getElementById('dbAvatarModal');
    if (m) m.classList.remove('db-hidden');
    document.body.style.overflow = 'hidden';
    if (_selectedAvNum) markAvSelected(_selectedAvNum);
  }

  function closeAvModal() {
    var m = document.getElementById('dbAvatarModal');
    if (m) m.classList.add('db-hidden');
    document.body.style.overflow = '';
  }

  function selectAvatar(num) {
    _selectedAvNum = num;
    markAvSelected(num);

    var url      = 'assets/avatars/elysium_unique_avatar_' + num + '.png';
    var resolved = '../' + url;

    var name = (_profile && _profile.username) || (_user.email && _user.email.split('@')[0]) || '';

    var circle = document.getElementById('dbAvatarCircle');
    if (circle) { circle.innerHTML = '<img src="' + resolved + '" alt="' + esc(name) + '">'; circle.classList.add('has-img'); }

    applyAvPreview(url, name);

    /* Sync to nav across pages (index.html reads this on load) */
    try { localStorage.setItem('elysium_avatar_url', url); } catch (e) {}
    _profile.avatar_url = url;

    _sb.from('profiles').upsert({ id: _user.id, avatar_url: url }, { onConflict: 'id' })
      .then(function (res) {
        if (res.error) { toast('error', 'Failed to save avatar.'); return; }
        toast('success', 'Avatar updated!');
      });

    closeAvModal();
  }

  /* ── Forms ──────────────────────────────────────────────────── */

  function setupForms() {
    /* Account form */
    var accForm = document.getElementById('dbAccountForm');
    if (accForm) {
      accForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var username = document.getElementById('dbFUsername').value.trim();
        var discord  = document.getElementById('dbFDiscord').value.trim();
        var country  = document.getElementById('dbFCountry').value.trim();
        var avUrl    = _selectedAvNum ? 'assets/avatars/elysium_unique_avatar_' + _selectedAvNum + '.png' : (_profile.avatar_url || null);

        var payload = { id: _user.id, username: username, discord_id: discord, country: country };
        if (avUrl) payload.avatar_url = avUrl;

        var saveBtn = accForm.querySelector('.db-save-btn');
        var saveLabel = saveBtn ? saveBtn.innerHTML : '';
        if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="ti ti-loader-2 db-spin"></i> Saving…'; }

        _sb.from('profiles').upsert(payload, { onConflict: 'id' }).then(function (res) {
          if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = saveLabel; }
          if (res.error) { toast('error', res.error.message); return; }
          Object.assign(_profile, { username: username, discord_id: discord, country: country });
          /* Sync to nav across pages */
          try {
            if (username) localStorage.setItem('elysium_username', username);
            if (avUrl) localStorage.setItem('elysium_avatar_url', avUrl);
          } catch (e2) {}
          var nameEl = document.getElementById('dbProfileName');
          if (nameEl) nameEl.textContent = username || (_user.email && _user.email.split('@')[0]) || 'Champion';
          toast('success', 'Profile updated, ' + (username || 'Champion') + ' ✓');
        });
      });
    }

    /* Password form */
    var pwForm = document.getElementById('dbPasswordForm');
    if (pwForm) {
      pwForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var np = document.getElementById('dbFNewPw').value;
        var cp = document.getElementById('dbFConfirmPw').value;
        if (np.length < 8)  { toast('error', 'Password must be at least 8 characters.'); return; }
        if (np !== cp)       { toast('error', 'Passwords do not match.'); return; }

        _sb.auth.updateUser({ password: np }).then(function (res) {
          if (res.error) { toast('error', res.error.message); return; }
          document.getElementById('dbFNewPw').value  = '';
          document.getElementById('dbFConfirmPw').value = '';
          toast('success', 'Password updated successfully.');
        });
      });
    }

    /* Two-factor auth (UI ready; backend MFA enrolled with our team) */
    function twofaInfo() { toast('info', 'Two-factor setup is handled by our team on Discord. Open a ticket to enable it.'); }
    var twofaBtn = document.getElementById('db2faBtn');
    if (twofaBtn) twofaBtn.addEventListener('click', twofaInfo);
    var twofaToggle = document.getElementById('db2faToggle');
    if (twofaToggle) twofaToggle.addEventListener('click', twofaInfo);

    /* Order filter tabs */
    var tabsEl = document.getElementById('dbOrderTabs');
    if (tabsEl) {
      tabsEl.addEventListener('click', function (e) {
        var tab = e.target.closest('[data-filter]');
        if (!tab) return;
        tabsEl.querySelectorAll('.db-tab').forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        renderOrders(tab.dataset.filter);
      });
    }

    /* Delete account */
    var delBtn = document.getElementById('dbDeleteAccountBtn');
    if (delBtn) {
      delBtn.addEventListener('click', function () {
        var m = document.getElementById('dbDeleteModal');
        if (m) m.classList.remove('db-hidden');
        document.body.style.overflow = 'hidden';
      });
    }

    ['dbDeleteCancelBtn', 'dbDeleteModalClose'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', function () {
        var m = document.getElementById('dbDeleteModal');
        if (m) m.classList.add('db-hidden');
        document.body.style.overflow = '';
      });
    });

    var delInput = document.getElementById('dbDeleteConfirmInput');
    if (delInput) {
      delInput.addEventListener('input', function () {
        var confirmBtn = document.getElementById('dbDeleteConfirmBtn');
        if (confirmBtn) confirmBtn.disabled = delInput.value !== 'DELETE';
      });
    }

    var delConfirm = document.getElementById('dbDeleteConfirmBtn');
    if (delConfirm) {
      delConfirm.addEventListener('click', function () {
        var m = document.getElementById('dbDeleteModal');
        if (m) m.classList.add('db-hidden');
        document.body.style.overflow = '';
        toast('info', 'Account deletion is handled by our team. Open a ticket in Discord, you will be signed out now.');
        setTimeout(function () {
          _sb.auth.signOut().then(function () { window.location.replace('../index.html'); });
        }, 2600);
      });
    }

    /* ESC closes modals */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAvModal();
        var dm = document.getElementById('dbDeleteModal');
        if (dm) dm.classList.add('db-hidden');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── Toast ──────────────────────────────────────────────────── */

  function toast(type, message) {
    var container = document.getElementById('dbToasts');
    if (!container) return;
    var icons = { success: 'ti-check', error: 'ti-x', info: 'ti-info-circle' };
    var t = document.createElement('div');
    t.className = 'db-toast db-toast-' + type;
    t.innerHTML = '<i class="ti ' + (icons[type] || 'ti-info-circle') + '"></i><span>' + esc(message) + '</span>';
    container.appendChild(t);
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('is-visible'); }); });
    setTimeout(function () {
      t.classList.remove('is-visible');
      t.addEventListener('transitionend', function () { t.remove(); }, { once: true });
    }, 3000);
  }

  /* ── Count-up ───────────────────────────────────────────────── */

  function countUp(el, target) {
    if (isNaN(target)) return;
    var start    = performance.now();
    var duration = 800;
    function step(now) {
      var p   = Math.min((now - start) / duration, 1);
      var eas = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eas);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ── Utilities ──────────────────────────────────────────────── */

  function rankIdx(rank) {
    for (var i = 0; i < RANKS.length; i++) { if (RANKS[i].name === rank.name) return i; }
    return 0;
  }

  function statusClass(status) {
    var s = (status || '').toLowerCase();
    if (s.indexOf('complet') !== -1) return 'completed';
    if (s.indexOf('progress') !== -1) return 'active';
    return 'pending';
  }

  function fmtDate(str) {
    if (!str) return '—';
    try { return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch (_) { return '—'; }
  }

  function fmtDateTime(str) {
    if (!str) return '—';
    try { return new Date(str).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (_) { return '—'; }
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Expose referral copy globally (called from inline onclick) */
  function copyCode(id) {
    var code = document.getElementById(id);
    if (code && navigator.clipboard) {
      navigator.clipboard.writeText(code.textContent || '').then(function () { toast('success', 'Referral code copied!'); });
    }
  }
  window.dbCopyRef    = function () { copyCode('dbRefCode'); };
  window.dbCopyAccRef = function () { copyCode('dbAccRefCode'); };

})();
