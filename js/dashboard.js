(function () {
  'use strict';

  var AVATAR_PREFIX = '../assets/avatars/elysium_unique_avatar_';
  var AVATAR_COUNT  = 16;

  var RANK_TIERS = [
    { name: 'Veteran',   min: 0,    max: 100  },
    { name: 'Champion',  min: 100,  max: 250  },
    { name: 'Legend',    min: 250,  max: 500  },
    { name: 'Immortal',  min: 500,  max: 1000 },
    { name: 'Elysian',   min: 1000, max: null },
  ];

  var PLACEHOLDER_ORDERS = [
    { game: 'Valorant', service: 'Rank Boosting — Gold III → Platinum I', date: '2025-05-18', price: 48.50, status: 'Completed' },
    { game: 'Valorant', service: 'Ranked Wins × 10 — Platinum II',        date: '2025-05-24', price: 72.00, status: 'In Progress' },
    { game: 'Arc Raiders', service: 'Leveling Boost — Station 4',         date: '2025-05-27', price: 35.00, status: 'Pending' },
  ];

  var _user    = null;
  var _profile = null;
  var _selectedAvatarNum = null;

  /* ── Auth guard ── */

  var _authReady = false;
  window.addEventListener('eb:authChange', function (e) {
    if (_authReady) return;
    _authReady = true;
    _user = e.detail.user;
    if (!_user) {
      window.location.replace('../index.html');
      return;
    }
    _init();
  });

  /* Fallback: if auth event never fires within 3 s, redirect */
  setTimeout(function () {
    if (!_authReady) {
      window.location.replace('../index.html');
    }
  }, 3000);

  /* ── Bootstrap ── */

  function _init() {
    _setupNav();
    _loadProfile();
    _buildAvGrid();
    _setupAccountForm();
    document.getElementById('dbLogout').addEventListener('click', function () {
      ebSignOut();
    });
  }

  /* ── Section switching ── */

  function _setupNav() {
    document.querySelectorAll('[data-section]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _showSection(btn.dataset.section);
      });
    });
  }

  function _showSection(key) {
    document.querySelectorAll('.db-section').forEach(function (el) {
      el.classList.add('db-hidden');
    });
    document.querySelectorAll('[data-section]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.section === key);
    });
    var target = document.getElementById('dbSection' + key.charAt(0).toUpperCase() + key.slice(1));
    if (target) target.classList.remove('db-hidden');
  }

  /* ── Profile loading ── */

  async function _loadProfile() {
    try {
      var result = await _sb.from('profiles').select('username, avatar_url, discord_id, total_spent').eq('id', _user.id).maybeSingle();
      _profile = result.data || {};
    } catch (_) {
      _profile = {};
    }

    var username = _profile.username || _user.user_metadata?.username || _user.user_metadata?.full_name || _user.email?.split('@')[0] || 'Champion';
    var totalSpent = parseFloat(_profile.total_spent) || 0;
    var rank = _computeRank(totalSpent);

    /* Sidebar */
    document.getElementById('dbSidebarUsername').textContent = username;
    document.getElementById('dbSidebarRank').textContent = rank.name;
    _applySidebarAvatar(_profile.avatar_url || null, username);

    /* Account form */
    document.getElementById('dbFieldUsername').value = username;
    document.getElementById('dbFieldEmail').value    = _user.email || '';
    document.getElementById('dbFieldDiscord').value  = _profile.discord_id || '';

    /* Account avatar preview */
    _applyAccountAvatarPreview(_profile.avatar_url || null, username);

    /* Mark selected cell */
    if (_profile.avatar_url) {
      var match = _profile.avatar_url.match(/elysium_unique_avatar_(\d+)\.png$/);
      if (match) {
        _selectedAvatarNum = match[1];
        _markSelectedCell(_selectedAvatarNum);
      }
    }

    /* Rank section */
    _renderRankSection(rank, totalSpent);

    /* Orders */
    _loadOrders(totalSpent);
  }

  /* ── Avatar helpers ── */

  function _applySidebarAvatar(url, username) {
    var el = document.getElementById('dbSidebarAvatar');
    if (!el) return;
    if (url) {
      var resolved = _resolveAvatarUrl(url);
      el.innerHTML = '<img src="' + resolved + '" alt="Your avatar">';
    } else {
      var initials = _makeInitials(username);
      el.textContent = initials;
    }
  }

  function _applyAccountAvatarPreview(url, username) {
    var el = document.getElementById('dbAccountAvatarPreview');
    if (!el) return;
    if (url) {
      var resolved = _resolveAvatarUrl(url);
      el.innerHTML = '<img src="' + resolved + '" alt="Your avatar">';
    } else {
      el.textContent = _makeInitials(username);
    }
  }

  function _resolveAvatarUrl(url) {
    /* Stored as relative-to-root path — prepend ../ for pages/ subdirectory */
    if (url && url.startsWith('assets/')) return '../' + url;
    return url;
  }

  function _makeInitials(name) {
    return (name || 'EB').split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase() || 'EB';
  }

  /* ── Avatar grid ── */

  function _buildAvGrid() {
    var grid = document.getElementById('dbAvGrid');
    if (!grid) return;
    for (var i = 1; i <= AVATAR_COUNT; i++) {
      var num   = i < 10 ? '0' + i : '' + i;
      var btn   = document.createElement('button');
      btn.type  = 'button';
      btn.className = 'db-av-cell';
      btn.dataset.avNum = num;
      var img   = document.createElement('img');
      img.src   = AVATAR_PREFIX + num + '.png';
      img.alt   = 'Avatar ' + num;
      img.loading = 'lazy';
      btn.appendChild(img);
      btn.addEventListener('click', function () { _selectAvatar(this.dataset.avNum); });
      grid.appendChild(btn);
    }
  }

  function _markSelectedCell(num) {
    document.querySelectorAll('.db-av-cell').forEach(function (btn) {
      btn.classList.toggle('is-selected', btn.dataset.avNum === num);
    });
  }

  async function _selectAvatar(num) {
    _selectedAvatarNum = num;
    _markSelectedCell(num);

    var url         = 'assets/avatars/elysium_unique_avatar_' + num + '.png';
    var resolvedUrl = '../' + url;

    /* Update sidebar and preview immediately */
    var sidebar = document.getElementById('dbSidebarAvatar');
    if (sidebar) sidebar.innerHTML = '<img src="' + resolvedUrl + '" alt="Your avatar">';

    var preview = document.getElementById('dbAccountAvatarPreview');
    if (preview) preview.innerHTML = '<img src="' + resolvedUrl + '" alt="Your avatar">';

    /* Persist to Supabase */
    try {
      await _sb.from('profiles').upsert({ id: _user.id, avatar_url: url }, { onConflict: 'id' });
    } catch (_) {}
  }

  /* ── Rank computation ── */

  function _computeRank(totalSpent) {
    var current = RANK_TIERS[0];
    for (var i = RANK_TIERS.length - 1; i >= 0; i--) {
      if (totalSpent >= RANK_TIERS[i].min) { current = RANK_TIERS[i]; break; }
    }
    return current;
  }

  function _renderRankSection(rank, totalSpent) {
    document.getElementById('dbRankCurrentName').textContent = rank.name;

    var fill = document.getElementById('dbRankProgressFill');
    var text = document.getElementById('dbRankProgressText');

    if (rank.max === null) {
      fill.style.width = '100%';
      if (text) text.textContent = 'Maximum rank achieved';
    } else {
      var pct = Math.min(100, Math.round(((totalSpent - rank.min) / (rank.max - rank.min)) * 100));
      fill.style.width = pct + '%';
      var needed = rank.max - totalSpent;
      if (text) text.textContent = '$' + needed.toFixed(2) + ' to next rank';
    }

    var tiersEl = document.getElementById('dbRankTiers');
    if (!tiersEl) return;
    tiersEl.innerHTML = '';

    RANK_TIERS.forEach(function (tier) {
      var card = document.createElement('div');
      card.className = 'db-rank-tier';
      var isCurrent  = tier.name === rank.name;
      var isUnlocked = totalSpent >= tier.min;
      if (isCurrent)  card.classList.add('is-current');
      if (isUnlocked) card.classList.add('is-unlocked');

      var threshold = tier.max !== null ? '$' + tier.min + '+' : '$' + tier.min + '+';

      card.innerHTML =
        '<span class="db-rank-tier-name">' + tier.name + '</span>' +
        '<span class="db-rank-tier-threshold">' + threshold + '</span>' +
        '<div class="db-rank-tier-indicator"></div>';
      tiersEl.appendChild(card);
    });
  }

  /* ── Orders ── */

  async function _loadOrders(totalSpent) {
    var orders = [];
    try {
      var result = await _sb.from('orders').select('*').eq('user_id', _user.id).order('created_at', { ascending: false });
      if (result.data && result.data.length > 0) {
        orders = result.data;
      } else {
        orders = PLACEHOLDER_ORDERS;
      }
    } catch (_) {
      orders = PLACEHOLDER_ORDERS;
    }

    _renderStats(orders, totalSpent);
    _renderOrders(orders);
  }

  function _renderStats(orders, totalSpent) {
    var inProgress = orders.filter(function (o) { return (o.status || '').toLowerCase().includes('progress'); }).length;
    var spent = totalSpent > 0 ? '$' + totalSpent.toFixed(2) : _sumOrders(orders);

    document.getElementById('dbStatTotal').textContent     = orders.length;
    document.getElementById('dbStatSpent').textContent     = spent;
    document.getElementById('dbStatInProgress').textContent = inProgress;
  }

  function _sumOrders(orders) {
    var total = orders.reduce(function (acc, o) { return acc + (parseFloat(o.price) || 0); }, 0);
    return '$' + total.toFixed(2);
  }

  function _renderOrders(orders) {
    var list = document.getElementById('dbOrdersList');
    if (!list) return;
    list.innerHTML = '';

    if (!orders.length) {
      list.innerHTML =
        '<div class="db-orders-empty">' +
          '<p class="db-orders-empty-title">No orders yet</p>' +
          '<p class="db-orders-empty-sub">Your completed and active orders will appear here.</p>' +
        '</div>';
      return;
    }

    var header = document.createElement('div');
    header.className = 'db-order-row db-orders-header';
    header.innerHTML = '<span>Game</span><span>Service</span><span>Date</span><span>Price</span><span>Status</span>';
    list.appendChild(header);

    orders.forEach(function (o) {
      var row = document.createElement('div');
      row.className = 'db-order-row';

      var status    = o.status || 'Pending';
      var statusCls = status.toLowerCase().includes('complete') ? 'db-status-completed' :
                      status.toLowerCase().includes('progress')  ? 'db-status-progress' : 'db-status-pending';

      var dateStr = '';
      if (o.date || o.created_at) {
        try { dateStr = new Date(o.date || o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch (_) {}
      }

      row.innerHTML =
        '<span><span class="db-order-tag">' + _esc(o.game || 'Boost') + '</span></span>' +
        '<span class="db-order-name">' + _esc(o.service || o.service_name || '—') + '</span>' +
        '<span class="db-order-date">' + _esc(dateStr) + '</span>' +
        '<span class="db-order-price">$' + parseFloat(o.price || 0).toFixed(2) + '</span>' +
        '<span><span class="db-order-status ' + statusCls + '">' + _esc(status) + '</span></span>';

      list.appendChild(row);
    });
  }

  /* ── Account form ── */

  function _setupAccountForm() {
    var form = document.getElementById('dbAccountForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      _saveAccount();
    });
  }

  async function _saveAccount() {
    var msg      = document.getElementById('dbFormMsg');
    var username = document.getElementById('dbFieldUsername').value.trim();
    var discord  = document.getElementById('dbFieldDiscord').value.trim();

    if (msg) { msg.textContent = 'Saving…'; msg.className = 'db-form-msg'; }

    var avatarUrl = _selectedAvatarNum
      ? 'assets/avatars/elysium_unique_avatar_' + _selectedAvatarNum + '.png'
      : (_profile && _profile.avatar_url) || null;

    var payload = { id: _user.id, username: username, discord_id: discord };
    if (avatarUrl) payload.avatar_url = avatarUrl;

    try {
      var result = await _sb.from('profiles').upsert(payload, { onConflict: 'id' });
      if (result.error) throw result.error;
      if (_profile) { _profile.username = username; _profile.discord_id = discord; }
      document.getElementById('dbSidebarUsername').textContent = username;
      if (msg) { msg.textContent = 'Saved!'; msg.className = 'db-form-msg is-success'; }
    } catch (err) {
      if (msg) { msg.textContent = 'Failed to save.'; msg.className = 'db-form-msg is-error'; }
    }

    setTimeout(function () { if (msg) { msg.textContent = ''; msg.className = 'db-form-msg'; } }, 3000);
  }

  /* ── Utility ── */

  function _esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

})();
