(function () {
  'use strict';

  /* ── Constants ─────────────────────────────────────────────── */

  var SB_URL = 'https://ylaxzlejhzgakhtfmsbt.supabase.co';
  var SB_KEY = 'sb_publishable_hjqgJX_RSpeypqtjJDk4xQ_pPGSnWAT';

  var PROOF_BUCKET = 'booster-proofs';
  var AVATAR_BASE  = '../assets/avatars/elysium_unique_avatar_';
  var AVATAR_COUNT = 16;

  /* Booster rank ladder — share % grows with lifetime completed orders. */
  var BRANKS = [
    { name: 'Recruit',   min: 0,    pct: 55, icon: 'ti-shield',       blurb: 'Welcome aboard. Build your record.' },
    { name: 'Vanguard',  min: 100,  pct: 58, icon: 'ti-shield-bolt',  blurb: 'Proven hands. Higher share.' },
    { name: 'Elite',     min: 300,  pct: 61, icon: 'ti-star',         blurb: 'Trusted specialist. Priority queue.' },
    { name: 'Legendary', min: 600,  pct: 63, icon: 'ti-flame',        blurb: 'Top performer. Premium orders.' },
    { name: 'Elysian',   min: 1000, pct: 65, icon: 'ti-crown',        blurb: 'The pinnacle. Maximum share.' },
  ];

  /* ── State ─────────────────────────────────────────────────── */

  var _sb, _user, _profile = {};
  var _myOrders = [], _pending = [], _unread = {};
  var _selectedAvNum = null;
  var _orderFilter = 'all';
  var _openOrderId = null;
  var _msgChannel = null, _ordersChannel = null;
  var _pickTimer = null, _pickCountdown = 15, _autoRefresh = true;
  var _etaTimer = null;
  var _sendLock = false;

  /* ── Bootstrap ─────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    _sb = supabase.createClient(SB_URL, SB_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });

    authGuard().then(function (user) {
      if (!user) return;
      _user = user;
      return _sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
    }).then(function (res) {
      if (!res) return;
      _profile = res.data || {};

      // 2. Banned → ban screen, nothing else loads.
      if (_profile.is_banned) { showBanScreen(); return; }
      // 3. Not a booster → bounce to the customer dashboard.
      if (_profile.role !== 'booster' && _profile.role !== 'admin') {
        window.location.replace('dashboard.html'); return;
      }
      // 4. Rules not yet accepted → blocking rules modal.
      if (!_profile.rules_accepted_at) { showRulesModal(); return; }
      // 5. All clear.
      startPanel();
    });
  });

  function authGuard() {
    return _sb.auth.getSession().then(function (res) {
      if (res.data && res.data.session && res.data.session.user) return res.data.session.user;
      return new Promise(function (resolve) {
        var timer = setTimeout(function () { window.location.replace('../index.html?login=true'); resolve(null); }, 3000);
        _sb.auth.onAuthStateChange(function (e, session) {
          if (session && session.user) { clearTimeout(timer); resolve(session.user); }
        });
      });
    });
  }

  function startPanel() {
    ensureBoosterCode();
    updateGreeting();
    setupNav();
    setupAvailability();
    setupRulesStrip();
    setupProfileForm();
    setupPickControls();
    buildAvatarGrid();
    requestNotifyPermission();
    subscribeOrders();
    var hash = (window.location.hash.slice(1) || 'overview').split('/');
    loadData().then(function () {
      if (hash[0] === 'order' && hash[1]) openOrder(hash[1]);
      else showSection(hash[0], false);
    });
  }

  function ensureBoosterCode() {
    if (_profile.booster_id_code) return;
    var code = 'B' + _user.id.replace(/-/g, '').slice(0, 9).toUpperCase();
    _profile.booster_id_code = code;
    _sb.from('profiles').upsert({ id: _user.id, booster_id_code: code }, { onConflict: 'id' });
  }

  /* ── Rank helper ───────────────────────────────────────────── */

  function getRankInfo(done) {
    done = parseInt(done, 10) || 0;
    var cur = BRANKS[0];
    for (var i = BRANKS.length - 1; i >= 0; i--) { if (done >= BRANKS[i].min) { cur = BRANKS[i]; break; } }
    var idx  = BRANKS.indexOf(cur);
    var next = BRANKS[idx + 1] || null;
    return {
      name: cur.name, percentage: cur.pct, icon: cur.icon, blurb: cur.blurb, index: idx,
      nextName: next ? next.name : null,
      nextThreshold: next ? next.min : null,
      ordersRemaining: next ? Math.max(0, next.min - done) : 0,
      progressPct: next ? Math.min(100, Math.round(((done - cur.min) / (next.min - cur.min)) * 100)) : 100,
    };
  }
  function netOf(price) { return (parseFloat(price) || 0) * getRankInfo(_profile.completed_orders).percentage / 100; }

  /* ── Data ──────────────────────────────────────────────────── */

  function loadData() {
    return Promise.all([
      _sb.from('orders').select('*').eq('booster_id', _user.id).order('created_at', { ascending: false }),
      _sb.from('orders').select('*').is('booster_id', null).eq('status', 'pending').order('created_at', { ascending: true }),
    ]).then(function (r) {
      _myOrders = (r[0].data) || [];
      _pending  = (r[1].data) || [];
      return loadUnread();
    }).then(function () {
      renderSidebar();
      renderBadges();
      renderOverview();
      renderOrders();
      renderPick();
      renderMessages();
      renderProfile();
      renderEarnings();
      renderRank();
    });
  }

  function loadUnread() {
    _unread = {};
    var ids = _myOrders.map(function (o) { return o.id; });
    if (!ids.length) return Promise.resolve();
    return _sb.from('messages').select('order_id')
      .in('order_id', ids).eq('sender_role', 'customer').is('read_at', null)
      .then(function (res) {
        (res.data || []).forEach(function (m) { _unread[m.order_id] = (_unread[m.order_id] || 0) + 1; });
      });
  }

  /* ── Navigation ────────────────────────────────────────────── */

  var SECTIONS = ['overview', 'pick', 'orders', 'order', 'messages', 'profile', 'earnings', 'rank'];

  function setupNav() {
    document.querySelectorAll('[data-section]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var s = el.dataset.section;
        history.pushState(null, '', '#' + s);
        showSection(s, true);
      });
    });
    window.addEventListener('popstate', function () {
      var h = (window.location.hash.slice(1) || 'overview').split('/');
      if (h[0] === 'order' && h[1]) openOrder(h[1]); else showSection(h[0], true);
    });
    var logout = document.getElementById('bpNavLogout');
    if (logout) logout.addEventListener('click', function () {
      _sb.auth.signOut().then(function () { window.location.replace('../index.html'); });
    });
  }

  function showSection(key, animate) {
    if (SECTIONS.indexOf(key) === -1) key = 'overview';
    if (key !== 'order') { _openOrderId = null; teardownOrder(); }
    if (key === 'pick') startPickTimer(); else stopPickTimer();

    document.querySelectorAll('.bp-section').forEach(function (s) {
      s.classList.add('bp-hidden'); s.classList.remove('bp-section-enter');
    });
    document.querySelectorAll('[data-section]').forEach(function (el) {
      el.classList.toggle('is-active', el.dataset.section === key);
    });
    var target = document.getElementById('bpSection' + key.charAt(0).toUpperCase() + key.slice(1));
    if (target) {
      target.classList.remove('bp-hidden');
      if (animate) { void target.offsetWidth; target.classList.add('bp-section-enter'); }
    }
  }

  /* ── Sidebar ───────────────────────────────────────────────── */

  function renderSidebar() {
    var name = _profile.username || (_user.email && _user.email.split('@')[0]) || 'Booster';
    var rank = getRankInfo(_profile.completed_orders);
    setText('bpProfileName', name);
    setText('bpBoosterId', _profile.booster_id_code || '—');
    setText('bpRankBadgeName', rank.name);

    var circle = document.getElementById('bpAvatarCircle');
    if (circle) {
      if (_profile.avatar_url) {
        var r = _profile.avatar_url.indexOf('assets/') === 0 ? '../' + _profile.avatar_url : _profile.avatar_url;
        circle.innerHTML = '<img src="' + r + '" alt="' + esc(name) + '">';
        circle.classList.add('has-img');
        var m = _profile.avatar_url.match(/elysium_unique_avatar_(\d+)\.png$/);
        if (m) _selectedAvNum = m[1];
      } else { circle.textContent = initials(name); circle.classList.remove('has-img'); }
    }
    var toggle = document.getElementById('bpAvailToggle');
    if (toggle) toggle.classList.toggle('is-on', _profile.is_available !== false);
    var dot = document.getElementById('bpOnlineDot');
    if (dot) dot.classList.toggle('is-on', _profile.is_available !== false);
  }

  function renderBadges() {
    var active  = _myOrders.filter(function (o) { return o.status === 'active'; }).length;
    var unread  = Object.keys(_unread).reduce(function (a, k) { return a + _unread[k]; }, 0);
    badge('bpNavPickBadge', _pending.length);
    badge('bpNavOrdersBadge', active);
    badge('bpNavMessagesBadge', unread);
    badge('bpMobPickBadge', _pending.length);
    badge('bpMobMsgBadge', unread);
  }

  function badge(id, n) {
    var el = document.getElementById(id);
    if (!el) return;
    if (n > 0) { el.textContent = n; el.hidden = false; } else { el.hidden = true; }
  }

  function setupAvailability() {
    var toggle = document.getElementById('bpAvailToggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      var on = !(toggle.classList.contains('is-on'));
      toggle.classList.toggle('is-on', on);
      var dot = document.getElementById('bpOnlineDot');
      if (dot) dot.classList.toggle('is-on', on);
      _profile.is_available = on;
      _sb.from('profiles').upsert({ id: _user.id, is_available: on }, { onConflict: 'id' }).then(function (res) {
        if (res.error) { toast('error', 'Could not update availability.'); return; }
        toast(on ? 'success' : 'info', on ? 'You are live in the pick queue.' : 'You are now hidden from new orders.');
      });
    });
  }

  function setupRulesStrip() {
    var strip = document.getElementById('bpRulesStrip');
    if (strip) strip.addEventListener('click', function () { showRulesModal(true); });
  }

  /* ── Overview ──────────────────────────────────────────────── */

  function renderOverview() {
    var rank      = getRankInfo(_profile.completed_orders);
    var active    = _myOrders.filter(function (o) { return o.status === 'active'; });
    var completed = parseInt(_profile.completed_orders, 10) || 0;
    var net30     = monthlyNet();

    var grid = document.getElementById('bpStatsGrid');
    if (grid) {
      grid.innerHTML =
        statCard('ti-circle-check',    'Completed',  completed, false) +
        statCard('ti-loader-2',        'Active',     active.length, active.length > 0) +
        statCard('ti-star',            'Rating',     (parseFloat(_profile.rating) || 5).toFixed(1), false) +
        statCard('ti-coin',            'This Month', '$' + net30.toFixed(2), false);
      grid.querySelectorAll('[data-count]').forEach(function (el) { countUp(el, parseFloat(el.dataset.count)); });
    }

    var list = document.getElementById('bpActiveList');
    if (list) {
      if (!active.length) {
        list.innerHTML = emptyMini('ti-checkbox', 'No active orders', 'Head to Pick Services to claim one.');
      } else {
        list.innerHTML = active.slice(0, 3).map(orderLineCard).join('') +
          (active.length > 3 ? '<a class="bp-see-all" href="#orders" data-section="orders">View all ' + active.length + ' active →</a>' : '');
        rewireSections(list);
      }
    }

    var check = document.getElementById('bpChecklist');
    if (check) {
      check.innerHTML =
        checkRow('VPN active for account safety', true, 'amber') +
        checkRow('Discord tag linked', !!_profile.discord_tag, _profile.discord_tag ? 'green' : 'red') +
        checkRow('Payout email set', !!_profile.payout_email, _profile.payout_email ? 'green' : 'red') +
        checkRow('Two-factor authentication', false, 'amber');
    }
  }

  function orderLineCard(o) {
    return '<a class="bp-order-line" href="#order/' + o.id + '" data-open-order="' + o.id + '">' +
      '<span class="bp-order-line-game">' + esc(o.game || 'Boost') + '</span>' +
      '<span class="bp-order-line-name">' + esc(o.service_name || '—') + '</span>' +
      '<span class="bp-order-line-net">$' + netOf(o.price).toFixed(2) + '</span>' +
      etaPill(o) +
      '<i class="ti ti-chevron-right bp-order-line-arrow"></i></a>';
  }

  function statCard(icon, label, value, hot) {
    var isNum = typeof value === 'number';
    return '<div class="bp-stat-card' + (hot ? ' bp-stat-hot' : '') + '">' +
      '<i class="ti ' + icon + ' bp-stat-icon"></i>' +
      '<div class="bp-stat-value"' + (isNum ? ' data-count="' + value + '"' : '') + '>' + (isNum ? '0' : esc(String(value))) + '</div>' +
      '<div class="bp-stat-label">' + label + '</div></div>';
  }

  /* ── Pick Services ─────────────────────────────────────────── */

  function setupPickControls() {
    var refresh = document.getElementById('bpRefreshBtn');
    if (refresh) refresh.addEventListener('click', function () { refreshPick(true); });
    var auto = document.getElementById('bpAutoRefreshToggle');
    if (auto) {
      auto.classList.toggle('is-on', _autoRefresh);
      auto.addEventListener('click', function () {
        _autoRefresh = !_autoRefresh;
        auto.classList.toggle('is-on', _autoRefresh);
        if (_autoRefresh && isActiveSection('pick')) startPickTimer(); else stopPickTimer();
      });
    }
  }

  function startPickTimer() {
    stopPickTimer();
    if (!_autoRefresh) return;
    _pickCountdown = 15;
    updateCountdownLabel();
    _pickTimer = setInterval(function () {
      _pickCountdown--;
      updateCountdownLabel();
      if (_pickCountdown <= 0) refreshPick(false);
    }, 1000);
  }
  function stopPickTimer() { if (_pickTimer) { clearInterval(_pickTimer); _pickTimer = null; } }
  function updateCountdownLabel() {
    var el = document.getElementById('bpPickCountdown');
    if (el) el.textContent = _autoRefresh ? ('Auto-refresh in ' + _pickCountdown + 's') : 'Auto-refresh off';
  }

  function refreshPick(manual) {
    _pickCountdown = 15;
    return _sb.from('orders').select('*').is('booster_id', null).eq('status', 'pending')
      .order('created_at', { ascending: true })
      .then(function (res) {
        _pending = res.data || [];
        renderPick();
        renderBadges();
        if (manual) toast('info', _pending.length + ' open order' + (_pending.length === 1 ? '' : 's') + ' in queue.');
      });
  }

  function activeCount() { return _myOrders.filter(function (o) { return o.status === 'active'; }).length; }
  function maxActive() { return parseInt(_profile.max_active_orders, 10) || 5; }

  function renderPick() {
    var warn = document.getElementById('bpPickWarning');
    var full = activeCount() >= maxActive();
    if (warn) {
      warn.hidden = !full;
      if (full) warn.innerHTML = '<i class="ti ti-alert-triangle"></i> You are at your limit of ' + maxActive() + ' active orders. Finish one before picking more.';
    }
    var grid = document.getElementById('bpPickGrid');
    if (!grid) return;
    if (!_pending.length) {
      grid.innerHTML = emptyMini('ti-inbox', 'Queue is empty', 'New orders appear here the moment customers place them.');
      return;
    }
    grid.innerHTML = _pending.map(function (o) { return pickCard(o, full); }).join('');
    grid.querySelectorAll('[data-pick]').forEach(function (btn) {
      btn.addEventListener('click', function () { pickOrder(btn.dataset.pick, btn); });
    });
  }

  function pickCard(o, disabled) {
    return '<div class="bp-pick-card">' +
      '<div class="bp-pick-top">' +
        '<span class="bp-game-badge">' + esc(o.game || 'Boost') + '</span>' +
        '<span class="bp-pick-net">$' + netOf(o.price).toFixed(2) + ' <span class="bp-pick-net-lbl">net</span></span>' +
      '</div>' +
      '<div class="bp-pick-name">' + esc(o.service_name || '—') + '</div>' +
      (o.customer_note ? '<div class="bp-pick-note">' + esc(o.customer_note) + '</div>' : '') +
      '<div class="bp-pick-meta">' +
        '<span><i class="ti ti-clock"></i> ' + (o.eta_minutes ? o.eta_minutes + ' min ETA' : 'No ETA') + '</span>' +
        '<span><i class="ti ti-calendar"></i> ' + fmtDate(o.created_at) + '</span>' +
      '</div>' +
      '<button class="eb-btn-primary bp-pick-btn" type="button" data-pick="' + o.id + '"' + (disabled ? ' disabled' : '') + '>' +
        '<i class="ti ti-hand-finger"></i> Pick Order</button>' +
      '</div>';
  }

  function pickOrder(orderId, btn) {
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="ti ti-loader-2 bp-spin"></i> Claiming…'; }
    _sb.rpc('pick_order', { p_order_id: orderId, p_booster_id: _user.id }).then(function (res) {
      if (res.error) { toast('error', res.error.message); if (btn) resetPickBtn(btn); return; }
      if (res.data === true) {
        toast('success', 'Order claimed. Good luck, Booster!');
        loadData().then(function () { openOrder(orderId); history.pushState(null, '', '#order/' + orderId); });
      } else {
        toast('error', 'Bu sipariş başka booster tarafından alındı.');
        refreshPick(false);
      }
    });
  }
  function resetPickBtn(btn) { btn.disabled = false; btn.innerHTML = '<i class="ti ti-hand-finger"></i> Pick Order'; }

  /* ── My Orders ─────────────────────────────────────────────── */

  function setupOrderTabs() {
    var tabs = document.getElementById('bpOrderFilterTabs');
    if (!tabs || tabs._wired) return;
    tabs._wired = true;
    tabs.addEventListener('click', function (e) {
      var t = e.target.closest('[data-filter]');
      if (!t) return;
      tabs.querySelectorAll('.bp-tab').forEach(function (x) { x.classList.remove('is-active'); });
      t.classList.add('is-active');
      _orderFilter = t.dataset.filter;
      renderOrdersTable();
    });
  }

  function renderOrders() {
    setupOrderTabs();
    var stats = document.getElementById('bpOrdersStats');
    if (stats) {
      var active    = _myOrders.filter(function (o) { return o.status === 'active'; }).length;
      var completed = _myOrders.filter(function (o) { return o.status === 'completed'; }).length;
      var earned    = _myOrders.filter(function (o) { return o.status === 'completed'; }).reduce(function (a, o) { return a + netOf(o.price); }, 0);
      stats.innerHTML = oStat(active, 'Active') + oStat(completed, 'Completed') + oStat('$' + earned.toFixed(2), 'Total Earned');
    }
    renderOrdersTable();
  }

  function renderOrdersTable() {
    var body = document.getElementById('bpOrdersBody');
    if (!body) return;
    var rows = _myOrders;
    if (_orderFilter === 'active')    rows = rows.filter(function (o) { return o.status === 'active'; });
    if (_orderFilter === 'completed') rows = rows.filter(function (o) { return o.status === 'completed'; });
    if (_orderFilter === 'disputed')  rows = rows.filter(function (o) { return o.status === 'disputed'; });

    if (!rows.length) { body.innerHTML = emptyMini('ti-clipboard-list', 'Nothing here', 'Orders you pick show up in this list.'); return; }
    body.innerHTML =
      '<div class="bp-table-wrap"><table class="bp-table">' +
      '<thead><tr><th>Game</th><th>Service</th><th>Picked</th><th>Net</th><th>Status</th><th></th></tr></thead><tbody>' +
      rows.map(function (o) {
        return '<tr class="bp-order-row">' +
          '<td><span class="bp-game-badge">' + esc(o.game || 'Boost') + '</span></td>' +
          '<td class="bp-service-cell">' + esc(o.service_name || '—') + '</td>' +
          '<td class="bp-date-cell">' + fmtDate(o.picked_at || o.created_at) + '</td>' +
          '<td class="bp-net-cell">$' + netOf(o.price).toFixed(2) + '</td>' +
          '<td>' + statusBadge(o.status) + '</td>' +
          '<td><button class="bp-view-btn" type="button" data-open-order="' + o.id + '">View' +
            (_unread[o.id] ? ' <span class="bp-unread-dot">' + _unread[o.id] + '</span>' : '') + '</button></td>' +
          '</tr>';
      }).join('') + '</tbody></table></div>';
    rewireOrderOpeners(body);
  }

  /* ── Order Detail + Chat ───────────────────────────────────── */

  function rewireOrderOpeners(scope) {
    (scope || document).querySelectorAll('[data-open-order]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var id = el.dataset.openOrder;
        history.pushState(null, '', '#order/' + id);
        openOrder(id);
      });
    });
  }
  function rewireSections(scope) {
    scope.querySelectorAll('[data-section]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); var s = el.dataset.section; history.pushState(null, '', '#' + s); showSection(s, true); });
    });
    rewireOrderOpeners(scope);
  }

  function openOrder(id) {
    var o = _myOrders.filter(function (x) { return x.id === id; })[0];
    if (!o) { showSection('orders', true); toast('error', 'Order not found.'); return; }
    _openOrderId = id;
    showSection('order', true);
    renderOrderDetail(o);
    loadMessages(o);
    subscribeMessages(o);
    startEtaTimer(o);
  }

  function teardownOrder() {
    if (_msgChannel) { _sb.removeChannel(_msgChannel); _msgChannel = null; }
    if (_etaTimer) { clearInterval(_etaTimer); _etaTimer = null; }
  }

  function renderOrderDetail(o) {
    var sec = document.getElementById('bpSectionOrder');
    if (!sec) return;
    var rank = getRankInfo(_profile.completed_orders);
    var steps = ['pending', 'active', 'proof_submitted', 'completed'];
    var curIdx = steps.indexOf(o.status);
    if (o.status === 'disputed') curIdx = 1;

    sec.innerHTML =
      '<div class="bp-section-hd">' +
        '<a class="bp-back" href="#orders" data-section="orders"><i class="ti ti-arrow-left"></i> Orders</a>' +
        '<h1 class="bp-section-title">' + esc(o.service_name || 'Order') + '</h1>' +
        statusBadge(o.status) +
      '</div>' +
      '<div class="bp-order-grid">' +
        '<div class="bp-order-info">' +
          progressBar(steps, curIdx, o.status === 'disputed') +
          infoCard('ti-device-gamepad-2', 'Service', esc(o.game || 'Boost') + ' · ' + esc(o.service_name || '—')) +
          (o.customer_note ? infoCard('ti-message-dots', 'Customer Note', esc(o.customer_note)) : '') +
          (o.embark_id ? infoCard('ti-id-badge-2', 'Game / Embark ID', '<code class="bp-code">' + esc(o.embark_id) + '</code>') : '') +
          '<div class="bp-info-card"><div class="bp-info-card-hd"><i class="ti ti-coin"></i> Your Net Earnings</div>' +
            '<div class="bp-net-big">$' + netOf(o.price).toFixed(2) + '<span class="bp-net-rate"> · ' + rank.percentage + '% ' + rank.name + ' share</span></div></div>' +
          '<div class="bp-info-card" id="bpEtaCard"></div>' +
          proofSection(o) +
        '</div>' +
        '<div class="bp-chat">' +
          '<div class="bp-chat-hd"><span class="bp-chat-title"><i class="ti ti-messages"></i> Site Chat</span>' +
            '<span class="bp-chat-cust">Müşteri #' + shortId(o.user_id) + '</span></div>' +
          '<div class="bp-chat-thread" id="bpChatThread"><div class="bp-chat-loading">Loading…</div></div>' +
          (o.status === 'completed' || o.status === 'disputed'
            ? '<div class="bp-chat-closed">This order is ' + esc(o.status) + '. Chat is read-only.</div>'
            : '<form class="bp-chat-input" id="bpChatForm">' +
                '<button type="button" class="bp-chat-img-btn" id="bpChatImgBtn" aria-label="Send image"><i class="ti ti-photo"></i></button>' +
                '<input type="file" id="bpChatImgInput" accept="image/png,image/jpeg,image/webp" hidden>' +
                '<input type="text" class="bp-chat-field" id="bpChatField" placeholder="Müşteriye yaz…" autocomplete="off" maxlength="2000">' +
                '<button type="submit" class="bp-chat-send" id="bpChatSend" aria-label="Send"><i class="ti ti-send"></i></button>' +
              '</form>') +
      '</div></div>';

    rewireSections(sec);
    wireProof(o);
    wireChatInput(o);
  }

  function progressBar(steps, curIdx, disputed) {
    var labels = { pending: 'Pending', active: 'In Progress', proof_submitted: 'Proof Sent', completed: 'Completed' };
    return '<div class="bp-track">' + steps.map(function (s, i) {
      var cls = i < curIdx ? 'is-done' : i === curIdx ? 'is-current' : '';
      return '<div class="bp-track-step ' + cls + '">' +
        '<span class="bp-track-dot"><i class="ti ' + (i < curIdx ? 'ti-check' : 'ti-point') + '"></i></span>' +
        '<span class="bp-track-lbl">' + labels[s] + '</span></div>';
    }).join('') + '</div>' +
    (disputed ? '<div class="bp-dispute-flag"><i class="ti ti-alert-octagon"></i> This order is under dispute. Our team will review.</div>' : '');
  }

  function infoCard(icon, label, html) {
    return '<div class="bp-info-card"><div class="bp-info-card-hd"><i class="ti ' + icon + '"></i> ' + label + '</div>' +
      '<div class="bp-info-card-body">' + html + '</div></div>';
  }

  function proofSection(o) {
    if (o.status === 'completed') {
      return '<div class="bp-info-card"><div class="bp-info-card-hd"><i class="ti ti-circle-check"></i> Proof</div>' +
        '<div class="bp-info-card-body">Order completed and verified.</div></div>';
    }
    if (o.status === 'disputed') return '';
    return '<div class="bp-info-card bp-proof" id="bpProofCard">' +
      '<div class="bp-info-card-hd"><i class="ti ti-upload"></i> Completion Proof</div>' +
      '<div class="bp-proof-drop" id="bpProofDrop">' +
        '<i class="ti ti-cloud-upload"></i>' +
        '<span>Drag a screenshot or clip here, or <strong>browse</strong></span>' +
        '<span class="bp-proof-hint">PNG · JPG · MP4 · 100KB–20MB</span>' +
        '<input type="file" id="bpProofInput" accept="image/png,image/jpeg,image/webp,video/mp4" hidden>' +
      '</div>' +
      '<div class="bp-proof-preview" id="bpProofPreview" hidden></div>' +
      '<div class="bp-proof-actions">' +
        '<button class="eb-btn-primary bp-proof-submit" id="bpProofSubmit" type="button" disabled><i class="ti ti-send"></i> Submit for Review</button>' +
        '<button class="bp-report-btn" id="bpReportBtn" type="button"><i class="ti ti-flag"></i> Report Issue</button>' +
      '</div>' +
      '<div class="bp-report-box bp-hidden" id="bpReportBox">' +
        '<textarea class="bp-report-text" id="bpReportText" placeholder="Describe the issue (customer unreachable, wrong details…)"></textarea>' +
        '<button class="bp-danger-btn" id="bpReportSubmit" type="button">Submit Dispute</button>' +
      '</div></div>';
  }

  var _proofPath = null;
  function wireProof(o) {
    var drop = document.getElementById('bpProofDrop');
    var input = document.getElementById('bpProofInput');
    var submit = document.getElementById('bpProofSubmit');
    if (!drop || !input) return;
    _proofPath = null;
    drop.addEventListener('click', function () { input.click(); });
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('is-drag'); });
    drop.addEventListener('dragleave', function () { drop.classList.remove('is-drag'); });
    drop.addEventListener('drop', function (e) {
      e.preventDefault(); drop.classList.remove('is-drag');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handleProofFile(e.dataTransfer.files[0], o);
    });
    input.addEventListener('change', function () { if (input.files[0]) handleProofFile(input.files[0], o); });

    if (submit) submit.addEventListener('click', function () {
      if (!_proofPath) return;
      submit.disabled = true; submit.innerHTML = '<i class="ti ti-loader-2 bp-spin"></i> Submitting…';
      _sb.from('orders').update({ status: 'proof_submitted', proof_url: _proofPath }).eq('id', o.id).then(function (res) {
        if (res.error) { toast('error', res.error.message); submit.disabled = false; submit.innerHTML = '<i class="ti ti-send"></i> Submit for Review'; return; }
        toast('success', 'Proof submitted. Our team will verify shortly.');
        o.status = 'proof_submitted';
        loadData().then(function () { openOrder(o.id); });
      });
    });

    var reportBtn = document.getElementById('bpReportBtn');
    var reportBox = document.getElementById('bpReportBox');
    if (reportBtn && reportBox) reportBtn.addEventListener('click', function () { reportBox.classList.toggle('bp-hidden'); });
    var reportSubmit = document.getElementById('bpReportSubmit');
    if (reportSubmit) reportSubmit.addEventListener('click', function () {
      var reason = (document.getElementById('bpReportText').value || '').trim();
      if (!reason) { toast('error', 'Please describe the issue first.'); return; }
      _sb.from('orders').update({ status: 'disputed' }).eq('id', o.id).then(function (res) {
        if (res.error) { toast('error', res.error.message); return; }
        sendMessage(o, '⚠️ Issue reported by booster: ' + reason, null);
        toast('info', 'Dispute opened. Our team will step in.');
        o.status = 'disputed';
        loadData().then(function () { openOrder(o.id); });
      });
    });
  }

  function handleProofFile(file, o) {
    var okType = /^(image\/(png|jpeg|webp)|video\/mp4)$/.test(file.type);
    if (!okType) { toast('error', 'Use PNG, JPG, WebP or MP4.'); return; }
    if (file.size < 100 * 1024) { toast('error', 'File too small (min 100KB).'); return; }
    if (file.size > 20 * 1024 * 1024) { toast('error', 'File too large (max 20MB).'); return; }

    var preview = document.getElementById('bpProofPreview');
    var submit = document.getElementById('bpProofSubmit');
    if (preview) { preview.hidden = false; preview.innerHTML = '<div class="bp-proof-uploading"><i class="ti ti-loader-2 bp-spin"></i> Uploading…</div>'; }

    var path = _user.id + '/' + o.id + '/' + Date.now() + '_' + safeName(file.name);
    _sb.storage.from(PROOF_BUCKET).upload(path, file, { upsert: false }).then(function (res) {
      if (res.error) { toast('error', res.error.message); if (preview) preview.hidden = true; return; }
      _proofPath = path;
      if (submit) submit.disabled = false;
      return _sb.storage.from(PROOF_BUCKET).createSignedUrl(path, 3600);
    }).then(function (signed) {
      if (!preview || !signed || !signed.data) return;
      var url = signed.data.signedUrl;
      preview.innerHTML = /\.mp4$/i.test(path)
        ? '<video src="' + url + '" controls class="bp-proof-thumb"></video>'
        : '<img src="' + url + '" alt="Proof preview" class="bp-proof-thumb">';
    });
  }

  /* ── Chat ──────────────────────────────────────────────────── */

  function loadMessages(o) {
    return _sb.from('messages').select('*').eq('order_id', o.id).order('created_at', { ascending: true }).then(function (res) {
      renderThread(res.data || [], o);
      markRead(o);
    });
  }

  function renderThread(msgs, o) {
    var thread = document.getElementById('bpChatThread');
    if (!thread) return;
    if (!msgs.length) {
      thread.innerHTML = '<div class="bp-chat-empty"><i class="ti ti-message-2"></i><p>Henüz mesaj yok. Müşteriye merhaba de!</p></div>';
      return;
    }
    thread.innerHTML = msgs.map(bubble).join('');
    resolveChatImages(thread);
    scrollThread();
  }

  function bubble(m) {
    var mine = m.sender_role === 'booster';
    var body = m.image_url
      ? '<span class="bp-bubble-img" data-img-path="' + esc(m.image_url) + '"><i class="ti ti-photo"></i> Loading image…</span>'
      : esc(m.content || '');
    var seen = mine && m.read_at ? '<span class="bp-bubble-seen">Seen</span>' : '';
    return '<div class="bp-bubble-row ' + (mine ? 'is-mine' : 'is-them') + '">' +
      '<div class="bp-bubble">' + body + '<span class="bp-bubble-time">' + fmtTime(m.created_at) + seen + '</span></div></div>';
  }

  function resolveChatImages(scope) {
    scope.querySelectorAll('[data-img-path]').forEach(function (el) {
      _sb.storage.from(PROOF_BUCKET).createSignedUrl(el.dataset.imgPath, 3600).then(function (signed) {
        if (signed && signed.data) el.innerHTML = '<img src="' + signed.data.signedUrl + '" alt="Shared image" class="bp-bubble-photo">';
      });
    });
  }

  function wireChatInput(o) {
    var form = document.getElementById('bpChatForm');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (_sendLock) return;
      var field = document.getElementById('bpChatField');
      var txt = (field.value || '').trim();
      if (!txt) return;
      field.value = '';
      lockSend();
      sendMessage(o, txt, null);
    });
    var imgBtn = document.getElementById('bpChatImgBtn');
    var imgInput = document.getElementById('bpChatImgInput');
    if (imgBtn && imgInput) {
      imgBtn.addEventListener('click', function () { imgInput.click(); });
      imgInput.addEventListener('change', function () {
        var f = imgInput.files[0];
        if (!f) return;
        if (f.size > 20 * 1024 * 1024) { toast('error', 'Image too large (max 20MB).'); return; }
        var path = _user.id + '/' + o.id + '/chat_' + Date.now() + '_' + safeName(f.name);
        toast('info', 'Uploading image…');
        _sb.storage.from(PROOF_BUCKET).upload(path, f).then(function (res) {
          if (res.error) { toast('error', res.error.message); return; }
          sendMessage(o, null, path);
        });
        imgInput.value = '';
      });
    }
  }

  function lockSend() {
    _sendLock = true;
    var send = document.getElementById('bpChatSend');
    if (send) send.disabled = true;
    setTimeout(function () { _sendLock = false; if (send) send.disabled = false; }, 1000);
  }

  function sendMessage(o, content, imagePath) {
    return _sb.from('messages').insert({
      order_id: o.id, sender_id: _user.id, sender_role: 'booster',
      content: content, image_url: imagePath,
    }).then(function (res) {
      if (res.error) toast('error', res.error.message);
    });
  }

  function subscribeMessages(o) {
    if (_msgChannel) _sb.removeChannel(_msgChannel);
    _msgChannel = _sb.channel('msg-' + o.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'order_id=eq.' + o.id }, function (payload) {
        appendBubble(payload.new, o);
        if (payload.new.sender_role === 'customer') {
          markRead(o);
          if (document.hidden) notify('New message', payload.new.content || 'Sent an image');
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: 'order_id=eq.' + o.id }, function () {
        if (_openOrderId === o.id) loadMessages(o);
      })
      .subscribe();
  }

  function appendBubble(m, o) {
    var thread = document.getElementById('bpChatThread');
    if (!thread || _openOrderId !== o.id) return;
    var empty = thread.querySelector('.bp-chat-empty');
    if (empty) thread.innerHTML = '';
    thread.insertAdjacentHTML('beforeend', bubble(m));
    resolveChatImages(thread);
    scrollThread();
  }

  function scrollThread() {
    var thread = document.getElementById('bpChatThread');
    if (thread) thread.scrollTop = thread.scrollHeight;
  }

  function markRead(o) {
    _sb.from('messages').update({ read_at: new Date().toISOString() })
      .eq('order_id', o.id).eq('sender_role', 'customer').is('read_at', null).then(function () {
        if (_unread[o.id]) { delete _unread[o.id]; renderBadges(); }
      });
  }

  /* ── Messages tab ──────────────────────────────────────────── */

  function renderMessages() {
    var list = document.getElementById('bpMessagesList');
    if (!list) return;
    var withChat = _myOrders.filter(function (o) { return o.status !== 'pending'; });
    if (!withChat.length) { list.innerHTML = emptyMini('ti-messages-off', 'No conversations yet', 'Pick an order to start chatting with a customer.'); return; }
    list.innerHTML = withChat.map(function (o) {
      var u = _unread[o.id] || 0;
      return '<a class="bp-msg-row' + (u ? ' has-unread' : '') + '" href="#order/' + o.id + '" data-open-order="' + o.id + '">' +
        '<span class="bp-msg-avatar"><i class="ti ti-user"></i></span>' +
        '<span class="bp-msg-main"><span class="bp-msg-name">Müşteri #' + shortId(o.user_id) + '</span>' +
          '<span class="bp-msg-sub">' + esc(o.service_name || 'Order') + '</span></span>' +
        '<span class="bp-msg-side">' + statusBadge(o.status) + (u ? '<span class="bp-unread-dot">' + u + '</span>' : '') + '</span>' +
        '</a>';
    }).join('');
    rewireOrderOpeners(list);
  }

  /* ── Profile ───────────────────────────────────────────────── */

  function setupProfileForm() {
    var form = document.getElementById('bpProfileForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var payload = {
        id: _user.id,
        username:      val('bpFUsername'),
        discord_tag:   val('bpFDiscord'),
        country:       val('bpFCountry'),
        games:         val('bpFGames'),
        payout_email:  val('bpFPayoutEmail'),
        payout_method: val('bpFPayoutMethod'),
      };
      if (_selectedAvNum) payload.avatar_url = 'assets/avatars/elysium_unique_avatar_' + _selectedAvNum + '.png';
      var btn = form.querySelector('.bp-save-btn');
      var lbl = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="ti ti-loader-2 bp-spin"></i> Saving…'; }
      _sb.from('profiles').upsert(payload, { onConflict: 'id' }).then(function (res) {
        if (btn) { btn.disabled = false; btn.innerHTML = lbl; }
        if (res.error) { toast('error', res.error.message); return; }
        Object.assign(_profile, payload);
        renderSidebar(); renderOverview(); renderProfile(); renderEarnings();
        toast('success', 'Profile saved.');
      });
    });
  }

  function renderProfile() {
    setVal('bpFUsername', _profile.username || '');
    setVal('bpFDiscord', _profile.discord_tag || '');
    setVal('bpFCountry', _profile.country || '');
    setVal('bpFGames', _profile.games || '');
    setVal('bpFPayoutEmail', _profile.payout_email || '');
    setVal('bpFPayoutMethod', _profile.payout_method || '');
    setText('bpBoosterIdRO', _profile.booster_id_code || '—');
    setText('bpMemberSince', fmtDate(_user.created_at));

    var check = document.getElementById('bpProfileChecklist');
    if (check) {
      check.innerHTML =
        checkRow('Email verified', !!_user.email_confirmed_at, _user.email_confirmed_at ? 'green' : 'red') +
        checkRow('Discord tag linked', !!_profile.discord_tag, _profile.discord_tag ? 'green' : 'red') +
        checkRow('Payout method set', !!_profile.payout_method, _profile.payout_method ? 'green' : 'red') +
        checkRow('Rules accepted', !!_profile.rules_accepted_at, 'green');
    }
  }

  /* ── Earnings ──────────────────────────────────────────────── */

  function completedOrders() { return _myOrders.filter(function (o) { return o.status === 'completed'; }); }
  function netInRange(days) {
    var since = Date.now() - days * 864e5;
    return completedOrders().filter(function (o) { return new Date(o.completed_at || o.created_at).getTime() >= since; })
      .reduce(function (a, o) { return a + netOf(o.price); }, 0);
  }
  function monthlyNet() { return netInRange(30); }
  function pendingNet() {
    return _myOrders.filter(function (o) { return o.status === 'active' || o.status === 'proof_submitted'; })
      .reduce(function (a, o) { return a + netOf(o.price); }, 0);
  }

  function renderEarnings() {
    var stats = document.getElementById('bpEarnStats');
    if (stats) {
      stats.innerHTML =
        oStat('$' + netInRange(1).toFixed(2), 'Today') +
        oStat('$' + netInRange(7).toFixed(2), 'This Week') +
        oStat('$' + netInRange(30).toFixed(2), 'This Month') +
        oStat('$' + pendingNet().toFixed(2), 'Pending');
    }

    var rank = getRankInfo(_profile.completed_orders);
    var callout = document.getElementById('bpEarnCallout');
    if (callout) {
      callout.innerHTML = rank.nextName
        ? '<i class="ti ti-trending-up"></i> <strong>' + rank.ordersRemaining + '</strong> more completed orders unlock <strong>' + esc(rank.nextName) + '</strong> (' + BRANKS[rank.index + 1].pct + '% share).'
        : '<i class="ti ti-crown"></i> You are <strong>Elysian</strong>, the highest booster rank. Maximum 65% share.';
    }

    var payout = document.getElementById('bpPayoutStatus');
    if (payout) {
      var pend = pendingNet();
      payout.innerHTML = _profile.payout_email
        ? '<div class="bp-payout-amt">$' + pend.toFixed(2) + '</div><div class="bp-payout-sub">Pending payout to ' + esc(_profile.payout_email) + ' (' + esc(_profile.payout_method || 'unset') + ')</div>'
        : '<div class="bp-payout-warn"><i class="ti ti-alert-triangle"></i> Payout email required. Add it in My Profile to receive earnings.</div>';
    }

    var history = document.getElementById('bpPayoutHistory');
    if (history) {
      var weeks = groupByWeek(completedOrders());
      if (!weeks.length) { history.innerHTML = emptyMini('ti-receipt', 'No payouts yet', 'Completed orders are summarized here by week.'); }
      else {
        history.innerHTML = '<div class="bp-table-wrap"><table class="bp-table"><thead><tr><th>Week</th><th>Orders</th><th>Net</th><th>Avg</th></tr></thead><tbody>' +
          weeks.map(function (w) {
            return '<tr class="bp-order-row"><td class="bp-date-cell">' + esc(w.label) + '</td>' +
              '<td>' + w.count + '</td><td class="bp-net-cell">$' + w.net.toFixed(2) + '</td>' +
              '<td class="bp-date-cell">$' + (w.net / w.count).toFixed(2) + '</td></tr>';
          }).join('') + '</tbody></table></div>';
      }
    }
  }

  function groupByWeek(orders) {
    var map = {};
    orders.forEach(function (o) {
      var d = new Date(o.completed_at || o.created_at);
      var onejan = new Date(d.getFullYear(), 0, 1);
      var wk = Math.ceil((((d - onejan) / 864e5) + onejan.getDay() + 1) / 7);
      var key = d.getFullYear() + '-W' + wk;
      if (!map[key]) map[key] = { label: 'Week ' + wk + ', ' + d.getFullYear(), count: 0, net: 0, k: d.getTime() };
      map[key].count++; map[key].net += netOf(o.price);
    });
    return Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return b.k - a.k; });
  }

  /* ── Booster Rank tab ──────────────────────────────────────── */

  function renderRank() {
    var done = parseInt(_profile.completed_orders, 10) || 0;
    var rank = getRankInfo(done);

    var hero = document.getElementById('bpRankHero');
    if (hero) {
      hero.innerHTML =
        '<div class="bp-rank-hero-icon"><i class="ti ' + rank.icon + '"></i></div>' +
        '<div class="bp-rank-hero-info">' +
          '<div class="bp-rank-hero-eyebrow">Booster Rank</div>' +
          '<div class="bp-rank-hero-name">' + rank.name + '</div>' +
          '<div class="bp-rank-hero-share">' + rank.percentage + '% earnings share · ' + done + ' completed</div>' +
          '<div class="bp-rank-hero-bar"><div class="bp-rank-hero-fill" style="width:0%" data-pct="' + rank.progressPct + '"></div></div>' +
          '<div class="bp-rank-hero-msg">' + (rank.nextName
            ? rank.ordersRemaining + ' orders to ' + rank.nextName
            : 'Highest rank achieved') + '</div>' +
        '</div>';
      setTimeout(function () { var f = hero.querySelector('.bp-rank-hero-fill'); if (f) f.style.width = f.dataset.pct + '%'; }, 90);
    }

    var ladder = document.getElementById('bpRankLadder');
    if (ladder) {
      ladder.innerHTML = BRANKS.map(function (r, i) {
        var cls = i === rank.index ? 'is-current' : done >= r.min ? 'is-unlocked' : 'is-locked';
        return '<div class="bp-ladder-step bp-ladder-' + cls + '">' +
          '<i class="ti ' + r.icon + ' bp-ladder-icon"></i>' +
          '<div class="bp-ladder-name">' + r.name + '</div>' +
          '<div class="bp-ladder-th">' + r.min + '+ orders</div>' +
          '<div class="bp-ladder-pct">' + r.pct + '% share</div>' +
          '<div class="bp-ladder-blurb">' + esc(r.blurb) + '</div>' +
          (i === rank.index ? '<div class="bp-ladder-cur">Current</div>' : '') +
          '</div>';
      }).join('');
    }
  }

  /* ── ETA timer ─────────────────────────────────────────────── */

  function startEtaTimer(o) {
    if (_etaTimer) clearInterval(_etaTimer);
    if (!o.picked_at || !o.eta_minutes) { var c = document.getElementById('bpEtaCard'); if (c) c.style.display = 'none'; return; }
    var deadline = new Date(o.picked_at).getTime() + o.eta_minutes * 60000;
    function tick() {
      var card = document.getElementById('bpEtaCard');
      if (!card) { clearInterval(_etaTimer); return; }
      var ms = deadline - Date.now();
      var over = ms < 0;
      var mins = Math.floor(Math.abs(ms) / 60000);
      var hrs = Math.floor(mins / 60);
      var label = (hrs > 0 ? hrs + 'h ' : '') + (mins % 60) + 'm';
      var state = over ? 'is-over' : ms < 30 * 60000 ? 'is-warn' : '';
      card.className = 'bp-info-card bp-eta ' + state;
      card.innerHTML = '<div class="bp-info-card-hd"><i class="ti ti-clock-hour-4"></i> Delivery ETA</div>' +
        '<div class="bp-eta-time">' + (over ? 'Overdue by ' + label : label + ' remaining') + '</div>';
    }
    tick();
    _etaTimer = setInterval(tick, 30000);
  }

  /* ── Realtime: order queue ─────────────────────────────────── */

  function subscribeOrders() {
    _ordersChannel = _sb.channel('orders-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, function (payload) {
        var o = payload.new;
        if (o.status === 'pending' && !o.booster_id) {
          if (_profile.is_available !== false && document.hidden) notify('New order available', (o.game || 'Boost') + ' · ' + (o.service_name || ''));
          if (isActiveSection('pick')) refreshPick(false); else { _pending.push(o); renderBadges(); }
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, function (payload) {
        if (payload.new.booster_id === _user.id || payload.old.booster_id === _user.id) loadData();
        else if (isActiveSection('pick')) refreshPick(false);
      })
      .subscribe();
  }

  /* ── Rules modal ───────────────────────────────────────────── */

  var RULES = [
    'Harici ödeme talebi yasaktır → €250 ceza + kalıcı ban',
    'Müşteri bilgileri gizlidir → kalıcı ban',
    'Sahte proof yasaktır → kalıcı ban',
    'Sadece site içi chat → Discord dışı iletişim yasak',
    'Hesap bilgilerini kötüye kullanmak → yasal işlem',
  ];

  function showRulesModal(reopen) {
    var modal = document.getElementById('bpRulesModal');
    if (!modal) return;
    var list = document.getElementById('bpRulesList');
    if (list && !list.childElementCount) {
      list.innerHTML = RULES.map(function (r, i) {
        return '<li class="bp-rule"><span class="bp-rule-x"><i class="ti ti-x"></i></span>' +
          '<span class="bp-rule-text"><strong>' + (i + 1) + '.</strong> ' + esc(r) + '</span></li>';
      }).join('');
    }
    modal.classList.remove('bp-hidden');
    document.body.style.overflow = 'hidden';

    var cb = document.getElementById('bpRulesCheckbox');
    var accept = document.getElementById('bpRulesAccept');
    if (reopen) {
      // Re-opened from the strip: already accepted, allow closing.
      if (cb) cb.checked = true;
      if (accept) { accept.disabled = false; accept.textContent = 'Close'; accept.onclick = function () { closeRules(); }; return; }
    }
    if (cb && accept) {
      cb.checked = false; accept.disabled = true; accept.textContent = 'Kuralları Kabul Ediyorum';
      cb.onchange = function () { accept.disabled = !cb.checked; };
      accept.onclick = function () {
        if (!cb.checked) return;
        accept.disabled = true; accept.innerHTML = '<i class="ti ti-loader-2 bp-spin"></i> …';
        var now = new Date().toISOString();
        _sb.from('profiles').upsert({ id: _user.id, rules_accepted_at: now }, { onConflict: 'id' }).then(function (res) {
          if (res.error) { toast('error', res.error.message); accept.disabled = false; accept.textContent = 'Kuralları Kabul Ediyorum'; return; }
          _profile.rules_accepted_at = now;
          closeRules();
          startPanel();
        });
      };
    }
  }
  function closeRules() {
    var modal = document.getElementById('bpRulesModal');
    if (modal) modal.classList.add('bp-hidden');
    document.body.style.overflow = '';
  }

  /* ── Ban screen ────────────────────────────────────────────── */

  function showBanScreen() {
    var el = document.getElementById('bpBanScreen');
    if (!el) return;
    var reason = document.getElementById('bpBanReason');
    if (reason) reason.textContent = 'Hesabınız askıya alındı: ' + (_profile.ban_reason || 'Kural ihlali');
    el.classList.remove('bp-hidden');
    var out = document.getElementById('bpBanSignout');
    if (out) out.addEventListener('click', function () { _sb.auth.signOut().then(function () { window.location.replace('../index.html'); }); });
  }

  /* ── Avatar picker ─────────────────────────────────────────── */

  function buildAvatarGrid() {
    var grid = document.getElementById('bpModalAvGrid');
    if (grid) {
      grid.innerHTML = '';
      for (var i = 1; i <= AVATAR_COUNT; i++) {
        var num = i < 10 ? '0' + i : '' + i;
        var btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'bp-av-cell'; btn.dataset.avNum = num;
        btn.setAttribute('aria-label', 'Avatar ' + num);
        var img = document.createElement('img'); img.src = AVATAR_BASE + num + '.png'; img.alt = 'Avatar ' + num; img.loading = 'lazy';
        btn.appendChild(img);
        btn.addEventListener('click', function () { selectAvatar(this.dataset.avNum); });
        grid.appendChild(btn);
      }
    }
    var wrap = document.getElementById('bpAvatarWrap');
    if (wrap) wrap.addEventListener('click', openAvModal);
    var close = document.getElementById('bpAvatarModalClose');
    if (close) close.addEventListener('click', closeAvModal);
    var overlay = document.getElementById('bpAvatarModal');
    if (overlay) overlay.addEventListener('click', function (e) { if (e.target === overlay) closeAvModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAvModal(); });
  }
  function openAvModal() {
    var m = document.getElementById('bpAvatarModal');
    if (m) m.classList.remove('bp-hidden');
    document.body.style.overflow = 'hidden';
    if (_selectedAvNum) markAv(_selectedAvNum);
  }
  function closeAvModal() {
    var m = document.getElementById('bpAvatarModal');
    if (m) m.classList.add('bp-hidden');
    document.body.style.overflow = '';
  }
  function markAv(num) {
    document.querySelectorAll('.bp-av-cell').forEach(function (b) { b.classList.toggle('is-selected', b.dataset.avNum === num); });
  }
  function selectAvatar(num) {
    _selectedAvNum = num; markAv(num);
    var url = 'assets/avatars/elysium_unique_avatar_' + num + '.png';
    _profile.avatar_url = url;
    renderSidebar();
    _sb.from('profiles').upsert({ id: _user.id, avatar_url: url }, { onConflict: 'id' }).then(function (res) {
      toast(res.error ? 'error' : 'success', res.error ? 'Failed to save avatar.' : 'Avatar updated.');
    });
    closeAvModal();
  }

  /* ── Notifications ─────────────────────────────────────────── */

  function requestNotifyPermission() {
    if (!('Notification' in window) || Notification.permission !== 'default') return;
    Notification.requestPermission().catch(function () {});
  }
  function notify(title, body) {
    if (document.hidden) { toastQueue(title, body); }
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try { new Notification(title, { body: body, icon: '../assets/elysium-logo-mark.png' }); } catch (_) {}
  }
  function toastQueue(title, body) { toast('info', title + (body ? ': ' + body : '')); }

  /* ── Shared bits ───────────────────────────────────────────── */

  function statusBadge(status) {
    var map = {
      pending: { c: 'pending', t: 'Pending' }, active: { c: 'active', t: 'In Progress' },
      proof_submitted: { c: 'review', t: 'In Review' }, completed: { c: 'completed', t: 'Completed' },
      disputed: { c: 'disputed', t: 'Disputed' },
    };
    var s = map[status] || { c: 'pending', t: status || 'Pending' };
    return '<span class="bp-status bp-status-' + s.c + '">' + s.t + '</span>';
  }
  function etaPill(o) {
    if (!o.picked_at || !o.eta_minutes) return '';
    var ms = new Date(o.picked_at).getTime() + o.eta_minutes * 60000 - Date.now();
    var cls = ms < 0 ? 'is-over' : ms < 30 * 60000 ? 'is-warn' : '';
    return '<span class="bp-eta-pill ' + cls + '"><i class="ti ti-clock"></i></span>';
  }
  function checkRow(label, ok, tone) {
    tone = ok ? 'green' : tone || 'red';
    var icon = ok ? 'ti-circle-check' : tone === 'amber' ? 'ti-alert-circle' : 'ti-circle-x';
    return '<div class="bp-check bp-check-' + tone + '"><i class="ti ' + icon + '"></i><span>' + esc(label) + '</span></div>';
  }
  function oStat(val, label) { return '<div class="bp-ostat"><div class="bp-ostat-val">' + esc(String(val)) + '</div><div class="bp-ostat-lbl">' + label + '</div></div>'; }
  function emptyMini(icon, title, sub) {
    return '<div class="bp-empty"><i class="ti ' + icon + '"></i><div class="bp-empty-title">' + esc(title) + '</div><div class="bp-empty-sub">' + esc(sub) + '</div></div>';
  }

  function countUp(el, target) {
    if (isNaN(target)) return;
    var start = performance.now();
    (function step(now) {
      var p = Math.min((now - start) / 800, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  function isActiveSection(key) {
    var s = document.getElementById('bpSection' + key.charAt(0).toUpperCase() + key.slice(1));
    return s && !s.classList.contains('bp-hidden');
  }

  function toast(type, message) {
    var c = document.getElementById('bpToasts');
    if (!c) return;
    var icons = { success: 'ti-check', error: 'ti-x', info: 'ti-info-circle' };
    var t = document.createElement('div');
    t.className = 'bp-toast bp-toast-' + type;
    t.innerHTML = '<i class="ti ' + (icons[type] || 'ti-info-circle') + '"></i><span>' + esc(message) + '</span>';
    c.appendChild(t);
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('is-visible'); }); });
    setTimeout(function () { t.classList.remove('is-visible'); t.addEventListener('transitionend', function () { t.remove(); }, { once: true }); }, 3200);
  }

  function updateGreeting() {
    var h = new Date().getHours();
    setText('bpGreeting', h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }

  function initials(n) { return (n || 'B').split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase() || 'B'; }
  function shortId(id) { return (id || '').replace(/-/g, '').slice(0, 6).toUpperCase(); }
  function safeName(n) { return (n || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-40); }
  function fmtDate(s) { if (!s) return '—'; try { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch (_) { return '—'; } }
  function fmtTime(s) { if (!s) return ''; try { return new Date(s).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); } catch (_) { return ''; } }
  function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
  function setVal(id, v) { var el = document.getElementById(id); if (el) el.value = v; }
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

})();
