/* Elysium Boost — Chat Widget (chat-widget.js)
 * Floating FAB + native tabbed panel: My Orders + Live Support.
 * Quick-action requests, voluntary tips, realtime unread, keyword safety.
 * Depends on: supabase CDN + auth.js (global _sb), loaded before this file.
 */
(function () {
  'use strict';

  // The full chat page mounts its own UI; never double-mount the widget there.
  if (location.href.includes('/chat.html')) return;

  /* ── Path helpers (page may live at root, /pages/, or /pages/games/) ── */
  function _depth() {
    var p = location.pathname;
    if (p.includes('/pages/games/')) return '../../';
    if (p.includes('/pages/')) return '../';
    return '';
  }
  function _asset(f) { return _depth() + 'assets/' + f; }
  function _chatPage() { return _depth() + 'pages/chat.html'; }
  function _cssHref() { return _depth() + 'css/chat.css'; }
  function _arcHref() { return _depth() + 'pages/games/arc-raiders.html'; }

  /* ── State ── */
  var S = {
    user: null,
    tab: 'orders',
    open: false,
    orders: [],
    completed: [],
    support: [],
    unread: 0,
    sendLockedUntil: 0,
    channel: null,
    countdown: null,
    busy: false
  };

  var EXTERNAL_PAYMENT_RE = /\b(paypal|iban|wise|crypto|wallet|bitcoin|btc|western union|venmo|cashapp|zelle)\b/i;

  /* ── Quick actions (Support tab) ── */
  var ACTIONS = [
    { type: 'change_booster', icon: '🔄', label: 'Change Booster', needsOrder: true,
      reasons: ['No communication', 'Too slow', 'Rule violation', 'Other'],
      cta: 'Submit request', sys: 'Booster change request submitted. Admin will review.' },
    { type: 'refund', icon: '💰', label: 'Request Refund', needsOrder: true,
      reasons: ['Order not delivered', 'Wrong service', 'Quality issue', 'Too late', 'Other'],
      cta: 'Submit request', sys: 'Refund request submitted. 24h processing time.' },
    { type: 'eta_update', icon: '⏱', label: 'ETA Update', needsOrder: true,
      cta: 'Request ETA update', sys: 'ETA update requested from your booster.' },
    { type: 'urgent', icon: '⚡', label: 'Mark as Urgent', needsOrder: true,
      warning: 'Urgent delivery may incur additional fees.',
      cta: 'Mark urgent', sys: 'Order marked as urgent. Admin notified.' },
    { type: 'schedule', icon: '📅', label: 'Schedule Order', needsOrder: true, datetime: true,
      cta: 'Send schedule request', sys: 'Schedule request sent for {datetime}.' },
    { type: 'preferred_booster', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="#e5c26b" aria-hidden="true" style="vertical-align:-2px"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>', label: 'Add to Preferred Booster', needsOrder: true, needsBooster: true,
      note: 'Work with this booster again on future orders.',
      cta: 'Add to preferred', sys: 'Booster added to your preferred list.' },
    { type: 'report', icon: '⚠️', label: 'Report Issue',
      reasons: ['Rule violation', 'External payment requested', 'Account damaged', 'Technical issue'],
      cta: 'Report issue', sys: 'Issue reported. Admin will investigate.' },
    { type: 'external_payment_report', icon: '🚨', label: 'Report External Payment', needsOrder: true, urgent: true,
      fixedReason: 'Booster requested external payment',
      warning: 'External payment is never allowed on Elysium. This files an urgent report.',
      cta: 'File urgent report',
      sys: 'External payment report filed. This is a serious violation. Admin has been notified immediately.' }
  ];

  /* ── Tiny DOM helpers ── */
  function _$(id) { return document.getElementById(id); }
  function _esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function _sbReady() { return typeof _sb !== 'undefined' && _sb; }
  function _money(n) { return '$' + Number(n || 0).toFixed(2); }

  function _gameClass(g) {
    var s = (g || '').toLowerCase();
    if (s.indexOf('arc') >= 0) return 'arc';
    if (s.indexOf('val') >= 0) return 'val';
    return 'default';
  }
  var STATUS_LABEL = { pending: 'Pending', active: 'Active', proof_submitted: 'Proof Submitted', completed: 'Completed', disputed: 'Disputed' };

  function _etaText(o) {
    if (o.status === 'pending' || !o.picked_at || !o.eta_minutes) return { txt: 'ETA pending', cls: '' };
    var deadline = new Date(o.picked_at).getTime() + o.eta_minutes * 60000;
    var rem = deadline - Date.now();
    if (rem <= 0) return { txt: 'Overdue', cls: 'is-over' };
    var mins = Math.floor(rem / 60000);
    var secs = Math.floor((rem % 60000) / 1000);
    var txt;
    if (mins >= 60) txt = Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm left';
    else txt = mins + 'm ' + (secs < 10 ? '0' : '') + secs + 's left';
    return { txt: txt, cls: mins < 15 ? 'is-warn' : '' };
  }
  function _tipEligible(o) {
    return o.status === 'completed' && o.booster_id && o.completed_at &&
      (Date.now() - new Date(o.completed_at).getTime() > 24 * 3600 * 1000);
  }

  /* ── Inject stylesheet (widget styles live in css/chat.css) ── */
  function _injectStylesheet() {
    var has = Array.prototype.some.call(document.querySelectorAll('link[rel="stylesheet"]'), function (l) {
      return (l.getAttribute('href') || '').indexOf('css/chat.css') >= 0;
    });
    if (has) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = _cssHref();
    document.head.appendChild(link);
  }

  /* ── Inject FAB + panel ── */
  function _inject() {
    _injectStylesheet();

    var fab = document.createElement('button');
    fab.id = 'ecwFab';
    fab.type = 'button';
    fab.className = 'ecw-fab';
    fab.setAttribute('aria-label', 'Open Elysium chat');
    fab.innerHTML =
      '<img class="ecw-fab-logo" src="' + _asset('elysium-logo-mark.png') + '" alt="" width="30" height="30">' +
      '<span class="ecw-fab-badge ecw-hidden" id="ecwBadge" aria-live="polite"></span>';
    document.body.appendChild(fab);

    var panel = document.createElement('div');
    panel.id = 'ecwPanel';
    panel.className = 'ecw-panel ecw-hidden';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Elysium chat');
    panel.innerHTML =
      '<header class="ecw-head">' +
        '<span class="ecw-head-title"><img class="ecw-head-logo" src="' + _asset('elysium-logo-mark.png') + '" alt="" width="22" height="22">Elysium Concierge</span>' +
        '<button class="ecw-close" id="ecwClose" type="button" aria-label="Close chat">' +
          '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
        '</button>' +
      '</header>' +
      '<div class="ecw-tabs" role="tablist">' +
        '<button class="ecw-tab is-active" id="ecwTabOrders" data-tab="orders" type="button" role="tab">My Orders</button>' +
        '<button class="ecw-tab" id="ecwTabSupport" data-tab="support" type="button" role="tab">Support</button>' +
      '</div>' +
      '<div class="ecw-pane" id="ecwOrdersPane"></div>' +
      '<div class="ecw-pane ecw-hidden" id="ecwSupportPane">' +
        '<div class="ecw-reply-eta"><span class="ecw-dot"></span> Support usually replies in ~5 min</div>' +
        '<div class="ecw-thread" id="ecwThread"></div>' +
        '<div class="ecw-flagwarn ecw-hidden" id="ecwFlagWarn">This message may violate platform rules. External payment is never allowed.</div>' +
        '<form class="ecw-composer" id="ecwForm">' +
          '<input class="ecw-input" id="ecwInput" type="text" autocomplete="off" maxlength="2000" placeholder="Message support…">' +
          '<button class="ecw-send" id="ecwSend" type="submit" aria-label="Send">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12l16-8-6 16-3-7-7-1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>' +
          '</button>' +
        '</form>' +
        '<div class="ecw-monitor">Messages are monitored for platform safety.</div>' +
      '</div>';
    document.body.appendChild(panel);

    // Wiring
    fab.addEventListener('click', _onFab);
    _$('ecwClose').addEventListener('click', _close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.open) _close(); });
    panel.querySelectorAll('.ecw-tab').forEach(function (t) {
      t.addEventListener('click', function () { _switchTab(t.dataset.tab); });
    });
    _$('ecwOrdersPane').addEventListener('click', _onOrdersClick);
    _$('ecwForm').addEventListener('submit', _onSupportSend);
    _$('ecwInput').addEventListener('input', _onSupportInput);
  }

  /* ── Open / close ── */
  function _onFab() {
    if (!S.user) { _login(); return; }
    S.open ? _close() : _open();
  }
  function _login() { if (typeof ebOpen === 'function') ebOpen(); }

  function _open() {
    var panel = _$('ecwPanel');
    panel.classList.remove('ecw-hidden');
    requestAnimationFrame(function () { panel.classList.add('is-open'); });
    S.open = true;
    _switchTab(S.tab);
    _startCountdown();
  }
  function _close() {
    var panel = _$('ecwPanel');
    if (!panel) return;
    panel.classList.remove('is-open');
    setTimeout(function () { panel.classList.add('ecw-hidden'); }, 280);
    S.open = false;
    _stopCountdown();
    _closeModal();
  }

  function _switchTab(tab) {
    S.tab = tab;
    _$('ecwTabOrders').classList.toggle('is-active', tab === 'orders');
    _$('ecwTabSupport').classList.toggle('is-active', tab === 'support');
    _$('ecwOrdersPane').classList.toggle('ecw-hidden', tab !== 'orders');
    _$('ecwSupportPane').classList.toggle('ecw-hidden', tab !== 'support');
    if (tab === 'orders') _renderOrders();
    else _renderSupport();
  }

  /* ── Loading / empty / error shells ── */
  function _spinner(label) {
    return '<div class="ecw-state"><span class="ecw-ring" aria-hidden="true"></span><span>' + _esc(label || 'Loading…') + '</span></div>';
  }
  function _stateMsg(icon, title, sub, btnLabel, btnAttr) {
    return '<div class="ecw-state">' +
      '<div class="ecw-state-icon">' + icon + '</div>' +
      '<div class="ecw-state-title">' + _esc(title) + '</div>' +
      (sub ? '<div class="ecw-state-sub">' + _esc(sub) + '</div>' : '') +
      (btnLabel ? '<button class="ecw-state-btn" ' + (btnAttr || '') + '>' + _esc(btnLabel) + '</button>' : '') +
      '</div>';
  }

  /* ════════════ ORDERS TAB ════════════ */
  async function _renderOrders() {
    var pane = _$('ecwOrdersPane');
    if (!S.user) {
      pane.innerHTML = _stateMsg('🔒', 'Login to track your orders', 'Sign in to see live status, ETAs, and chat with your booster.', 'Login', 'data-ecw="login"');
      return;
    }
    if (!_sbReady()) { pane.innerHTML = _stateMsg('⚠️', 'Chat unavailable', 'Please reload the page and try again.'); return; }
    pane.innerHTML = _spinner('Loading your orders…');
    try {
      await _loadOrders();
    } catch (e) {
      console.error('[Elysium chat] orders load failed:', e);
      pane.innerHTML = _stateMsg('📦', 'No orders available', 'We could not load your orders right now. Try again in a moment.', 'Retry', 'data-ecw="reload-orders"');
      return;
    }
    if (!S.orders.length && !S.completed.length) {
      pane.innerHTML = _stateMsg('📦', 'No active orders yet', 'Configure a boost to get started.', 'Browse Arc Raiders', 'data-ecw="browse"');
      return;
    }
    var html = '';
    if (S.orders.length) {
      html += '<div class="ecw-list">' + S.orders.map(_orderRow).join('') + '</div>';
    }
    if (S.completed.length) {
      html += '<div class="ecw-group-label">Recently completed</div>' +
        '<div class="ecw-list">' + S.completed.map(_completedRow).join('') + '</div>';
    }
    pane.innerHTML = html;
    _paintCountdowns();
  }

  function _orderRow(o) {
    var boosterTxt = o.booster_id ? (o.booster && o.booster.username ? o.booster.username : 'Booster assigned') : 'Assigning booster…';
    var eta = _etaText(o);
    return '<button class="ecw-order" data-order="' + _esc(o.id) + '" type="button">' +
      '<span class="ecw-order-badge ecw-badge-' + _gameClass(o.game) + '">' + _esc(o.game || 'Order') + '</span>' +
      '<span class="ecw-order-main">' +
        '<span class="ecw-order-name">' + _esc(o.service_name || 'Service') + '</span>' +
        '<span class="ecw-order-booster">' + _esc(boosterTxt) + '</span>' +
      '</span>' +
      '<span class="ecw-order-side">' +
        '<span class="ecw-status ecw-status-' + _esc(o.status) + '">' + _esc(STATUS_LABEL[o.status] || o.status) + '</span>' +
        (o._unread ? '<span class="ecw-unread">' + (o._unread > 9 ? '9+' : o._unread) + '</span>' : '') +
        '<span class="ecw-eta ' + eta.cls + '" data-eta-for="' + _esc(o.id) + '">' + _esc(eta.txt) + '</span>' +
      '</span>' +
    '</button>';
  }

  function _completedRow(o) {
    return '<div class="ecw-order is-completed">' +
      '<span class="ecw-order-badge ecw-badge-' + _gameClass(o.game) + '">' + _esc(o.game || 'Order') + '</span>' +
      '<span class="ecw-order-main">' +
        '<span class="ecw-order-name">' + _esc(o.service_name || 'Service') + '</span>' +
        '<span class="ecw-order-booster">' + _esc(o.booster && o.booster.username ? o.booster.username : 'Booster') + ' · delivered</span>' +
      '</span>' +
      '<span class="ecw-order-side">' +
        '<button class="ecw-tip-btn" data-tip="' + _esc(o.id) + '" type="button">Leave a tip</button>' +
      '</span>' +
    '</div>';
  }

  async function _loadOrders() {
    var res = await _sb.from('orders')
      .select('id, game, service_name, price, status, booster_id, eta_minutes, picked_at, completed_at, booster:profiles!booster_id(username)')
      .eq('user_id', S.user.id)
      .in('status', ['pending', 'active', 'proof_submitted', 'completed'])
      .order('created_at', { ascending: false })
      .limit(20);
    if (res.error) throw res.error;
    var active = [], completed = [];
    (res.data || []).forEach(function (o) {
      if (o.status === 'completed') { if (_tipEligible(o)) completed.push(o); }
      else active.push(o);
    });
    var ids = (res.data || []).map(function (o) { return o.id; });
    var unread = {};
    if (ids.length) {
      var u = await _sb.from('messages').select('order_id')
        .in('order_id', ids).neq('sender_id', S.user.id).is('read_at', null).is('deleted_at', null);
      (u.data || []).forEach(function (m) { unread[m.order_id] = (unread[m.order_id] || 0) + 1; });
    }
    active.forEach(function (o) { o._unread = unread[o.id] || 0; });
    S.orders = active;
    S.completed = completed;
  }

  function _onOrdersClick(e) {
    var tip = e.target.closest('[data-tip]');
    if (tip) { _openTip(tip.getAttribute('data-tip')); return; }
    var hook = e.target.closest('[data-ecw]');
    if (hook) {
      var a = hook.getAttribute('data-ecw');
      if (a === 'login') _login();
      else if (a === 'browse') location.href = _arcHref();
      else if (a === 'reload-orders') _renderOrders();
      return;
    }
    var row = e.target.closest('[data-order]');
    if (row) location.href = _chatPage() + '?order=' + encodeURIComponent(row.getAttribute('data-order'));
  }

  /* ── Live ETA countdowns ── */
  function _startCountdown() { _stopCountdown(); S.countdown = setInterval(_paintCountdowns, 1000); }
  function _stopCountdown() { if (S.countdown) { clearInterval(S.countdown); S.countdown = null; } }
  function _paintCountdowns() {
    if (!S.open || S.tab !== 'orders') return;
    S.orders.forEach(function (o) {
      var el = document.querySelector('[data-eta-for="' + o.id + '"]');
      if (!el) return;
      var eta = _etaText(o);
      el.textContent = eta.txt;
      el.className = 'ecw-eta ' + eta.cls;
    });
  }

  /* ════════════ SUPPORT TAB ════════════ */
  async function _renderSupport() {
    if (!S.user) {
      _$('ecwThread').innerHTML = _stateMsg('🔒', 'Login to message support', 'Sign in to start a conversation with our team.', 'Login', 'data-ecw="login"');
      _$('ecwThread').querySelector('[data-ecw="login"]').addEventListener('click', _login);
      return;
    }

    var thread = _$('ecwThread');
    if (!_sbReady()) { thread.innerHTML = _stateMsg('⚠️', 'Chat unavailable', 'Please reload and try again.'); return; }
    thread.innerHTML = _spinner('Loading conversation…');
    try {
      var res = await _sb.from('messages')
        .select('id, content, sender_id, sender_role, message_type, created_at, flagged')
        .is('order_id', null).eq('support_user_id', S.user.id)
        .order('created_at', { ascending: true }).limit(100);
      if (res.error) throw res.error;
      S.support = res.data || [];
    } catch (e) {
      console.error('[Elysium chat] support load failed:', e);
      thread.innerHTML = _stateMsg('💬', 'Support unavailable', 'We could not reach support right now. Please try again in a moment.', 'Retry', 'data-ecw="reload-support"');
      thread.querySelector('[data-ecw="reload-support"]').addEventListener('click', _renderSupport);
      return;
    }
    _paintThread();
    await _markSupportRead();
  }

  function _paintThread() {
    var thread = _$('ecwThread');
    if (!S.support.length) {
      thread.innerHTML = '<div class="ecw-thread-empty">Send us a message and our team will reply fast.</div>';
      return;
    }
    thread.innerHTML = S.support.map(function (m) {
      if (m.message_type === 'system') {
        return '<div class="ecw-sys">' + _esc(m.content) + '</div>';
      }
      var mine = m.sender_id === S.user.id;
      return '<div class="ecw-msg ' + (mine ? 'is-mine' : 'is-them') + (m.flagged ? ' is-flagged' : '') + '">' +
        '<div class="ecw-bubble">' + _esc(m.content) +
        (m.flagged ? '<span class="ecw-flag-tag">⚠ flagged</span>' : '') + '</div></div>';
    }).join('');
    thread.scrollTop = thread.scrollHeight;
  }

  function _onSupportInput() {
    var v = _$('ecwInput').value;
    _$('ecwFlagWarn').classList.toggle('ecw-hidden', !EXTERNAL_PAYMENT_RE.test(v));
  }

  async function _onSupportSend(e) {
    e.preventDefault();
    if (!S.user || !_sbReady()) { _login(); return; }
    if (Date.now() < S.sendLockedUntil) return;
    var input = _$('ecwInput');
    var text = input.value.trim();
    if (!text) return;

    var flagged = EXTERNAL_PAYMENT_RE.test(text);
    _lockSend();
    input.value = '';
    _$('ecwFlagWarn').classList.add('ecw-hidden');

    var row = {
      support_user_id: S.user.id, sender_id: S.user.id, sender_role: 'customer',
      order_id: null, message_type: 'user', content: text,
      flagged: flagged, flag_reason: flagged ? 'external_payment_keyword' : null
    };
    var res = await _sb.from('messages').insert(row).select('id, content, sender_id, sender_role, message_type, created_at, flagged').single();
    if (res.error) { _toast('Message failed to send.', 'error'); return; }
    S.support.push(res.data);
    _paintThread();
  }

  function _lockSend() {
    S.sendLockedUntil = Date.now() + 1000;
    var btn = _$('ecwSend');
    if (!btn) return;
    btn.disabled = true;
    setTimeout(function () { if (btn) btn.disabled = false; }, 1000);
  }

  async function _markSupportRead() {
    try {
      await _sb.from('messages').update({ read_at: new Date().toISOString() })
        .is('order_id', null).eq('support_user_id', S.user.id).neq('sender_id', S.user.id).is('read_at', null);
    } catch (e) {}
    _refreshUnread();
  }

  async function _postSystem(text) {
    try {
      var res = await _sb.from('messages').insert({
        support_user_id: S.user.id, sender_id: S.user.id, sender_role: 'customer',
        order_id: null, message_type: 'system', content: text
      }).select('id, content, sender_id, sender_role, message_type, created_at, flagged').single();
      if (!res.error && res.data) { S.support.push(res.data); _paintThread(); }
    } catch (e) {}
  }

  /* ════════════ QUICK-ACTION MODALS ════════════
     The quick-action chip row was removed from the support pane. The action
     modal machinery below (ACTIONS, _openAction, …) is retained so these
     support flows can be re-surfaced from a future entry point without a
     rebuild. */
  function _orderOptions(boosterOnly) {
    var list = S.orders.concat(S.completed).filter(function (o) { return boosterOnly ? o.booster_id : true; });
    if (!list.length) return '';
    return list.map(function (o) {
      return '<option value="' + _esc(o.id) + '">' + _esc((o.game || '') + ' · ' + (o.service_name || 'Order')) + '</option>';
    }).join('');
  }

  function _openAction(action) {
    var body = '';
    if (action.warning) body += '<div class="ecw-modal-warn">' + _esc(action.warning) + '</div>';
    if (action.note) body += '<p class="ecw-modal-note">' + _esc(action.note) + '</p>';

    if (action.needsOrder) {
      var opts = _orderOptions(action.needsBooster);
      if (!opts) {
        body += '<p class="ecw-modal-note">' + (action.needsBooster
          ? 'No order with an assigned booster yet.'
          : 'You have no active orders to attach this to.') + '</p>';
        _showModal(action.label, body, null);
        return;
      }
      body += '<label class="ecw-field"><span>Order</span><select id="ecwSelOrder">' + opts + '</select></label>';
    }
    if (action.reasons) {
      body += '<label class="ecw-field"><span>Reason</span><select id="ecwSelReason">' +
        action.reasons.map(function (r) { return '<option value="' + _esc(r) + '">' + _esc(r) + '</option>'; }).join('') +
        '</select></label>';
    }
    if (action.fixedReason) {
      body += '<p class="ecw-modal-note">Reason: ' + _esc(action.fixedReason) + '</p>';
    }
    if (action.datetime) {
      body += '<label class="ecw-field"><span>Preferred date &amp; time</span><input type="datetime-local" id="ecwSelWhen"></label>';
    }
    _showModal(action.label, body, action.cta, function () { return _submitAction(action); });
  }

  async function _submitAction(action) {
    var orderId = null, reason = action.fixedReason || null, datetime = null;
    var sel = _$('ecwSelOrder'); if (sel) orderId = sel.value;
    var rsel = _$('ecwSelReason'); if (rsel) reason = rsel.value;
    var wsel = _$('ecwSelWhen'); if (wsel) { if (!wsel.value) { _toast('Pick a date and time.', 'error'); return false; } datetime = wsel.value; }

    try {
      if (action.type === 'preferred_booster') {
        var order = S.orders.concat(S.completed).filter(function (o) { return o.id === orderId; })[0];
        if (!order || !order.booster_id) { _toast('That order has no booster.', 'error'); return false; }
        var prof = await _sb.from('profiles').select('preferred_boosters').eq('id', S.user.id).maybeSingle();
        var arr = (prof.data && prof.data.preferred_boosters) || [];
        if (arr.indexOf(order.booster_id) < 0) arr = arr.concat([order.booster_id]);
        var up = await _sb.from('profiles').update({ preferred_boosters: arr }).eq('id', S.user.id);
        if (up.error) throw up.error;
      } else {
        var ins = await _sb.from('support_requests').insert({
          user_id: S.user.id,
          order_id: orderId,
          type: action.type,
          reason: reason || (datetime ? ('Scheduled for ' + datetime) : null),
          urgent: !!action.urgent,
          metadata: datetime ? { datetime: datetime } : {}
        });
        if (ins.error) throw ins.error;
      }
    } catch (e) {
      _toast('Request failed. Please try again.', 'error');
      return false;
    }

    var sys = action.sys.replace('{datetime}', datetime ? _formatWhen(datetime) : '');
    await _postSystem(sys);
    _toast('Request sent.', 'success');
    return true;
  }

  function _formatWhen(v) {
    var d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  /* ════════════ TIP MODAL ════════════ */
  function _openTip(orderId) {
    var order = S.completed.filter(function (o) { return o.id === orderId; })[0];
    if (!order) return;
    var maxTip = Math.max(1, Number(order.price || 0) * 0.5);
    var body =
      '<p class="ecw-modal-note">Tip is 100% voluntary. Boosters cannot request tips.</p>' +
      '<div class="ecw-tip-summary">' + _esc(order.service_name || 'Order') +
        ' · ' + _esc(order.booster && order.booster.username ? order.booster.username : 'your booster') + '</div>' +
      '<label class="ecw-field"><span>Tip amount (max ' + _money(maxTip) + ')</span>' +
        '<input type="number" id="ecwTipAmt" min="1" max="' + maxTip.toFixed(2) + '" step="0.5" inputmode="decimal" placeholder="0.00"></label>' +
      '<div class="ecw-tip-split" id="ecwTipSplit">Enter an amount between $1 and ' + _money(maxTip) + '.</div>';
    _showModal('Tip your booster', body, 'Send tip', function () { return _submitTip(order, maxTip); });

    var amt = _$('ecwTipAmt');
    amt.addEventListener('input', function () {
      var v = parseFloat(amt.value);
      var split = _$('ecwTipSplit');
      if (isNaN(v) || v < 1) { split.textContent = 'Enter an amount between $1 and ' + _money(maxTip) + '.'; split.classList.remove('is-ok'); return; }
      if (v > maxTip + 0.001) { split.textContent = 'Maximum tip is ' + _money(maxTip) + '.'; split.classList.remove('is-ok'); return; }
      split.textContent = _money(v * 0.8) + ' goes to your booster (' + _money(v * 0.2) + ' platform fee).';
      split.classList.add('is-ok');
    });
  }

  async function _submitTip(order, maxTip) {
    var v = parseFloat(_$('ecwTipAmt').value);
    if (isNaN(v) || v < 1) { _toast('Enter at least $1.', 'error'); return false; }
    if (v > maxTip + 0.001) { _toast('Tip exceeds the 50% limit.', 'error'); return false; }
    var booster = +(v * 0.8).toFixed(2);
    var platform = +(v * 0.2).toFixed(2);
    try {
      var ins = await _sb.from('tips').insert({
        order_id: order.id, customer_id: S.user.id, booster_id: order.booster_id,
        amount: +v.toFixed(2), booster_amount: booster, platform_amount: platform
      });
      if (ins.error) throw ins.error;
    } catch (e) {
      _toast('Tip failed. Please try again.', 'error');
      return false;
    }
    _toast(_money(booster) + ' sent to your booster. Thank you!', 'success');
    return true;
  }

  /* ── Generic modal host (fixed overlay above the panel) ── */
  function _showModal(title, bodyHtml, ctaLabel, onConfirm) {
    _closeModal();
    var ov = document.createElement('div');
    ov.className = 'ecw-modal-overlay';
    ov.id = 'ecwModal';
    ov.innerHTML =
      '<div class="ecw-modal" role="dialog" aria-modal="true" aria-label="' + _esc(title) + '">' +
        '<div class="ecw-modal-hd"><span>' + _esc(title) + '</span>' +
          '<button class="ecw-modal-x" id="ecwModalX" type="button" aria-label="Close">' +
            '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
          '</button></div>' +
        '<div class="ecw-modal-body">' + bodyHtml + '</div>' +
        (ctaLabel ? '<div class="ecw-modal-ft"><button class="ecw-modal-cancel" id="ecwModalCancel" type="button">Cancel</button>' +
          '<button class="ecw-modal-cta" id="ecwModalCta" type="button">' + _esc(ctaLabel) + '</button></div>'
          : '<div class="ecw-modal-ft"><button class="ecw-modal-cancel" id="ecwModalCancel" type="button">Close</button></div>') +
      '</div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) { if (e.target === ov) _closeModal(); });
    _$('ecwModalX').addEventListener('click', _closeModal);
    _$('ecwModalCancel').addEventListener('click', _closeModal);
    requestAnimationFrame(function () { ov.classList.add('is-open'); });

    var cta = _$('ecwModalCta');
    if (cta && onConfirm) {
      cta.addEventListener('click', async function () {
        if (S.busy) return;
        S.busy = true;
        cta.disabled = true;
        var ok = await onConfirm();
        S.busy = false;
        if (ok !== false) _closeModal(); else cta.disabled = false;
      });
    }
  }
  function _closeModal() {
    var ov = _$('ecwModal');
    if (ov) ov.remove();
  }

  /* ── Toast (reuses the site .eb-toast pill) ── */
  function _toast(msg, kind) {
    var t = document.querySelector('.eb-toast');
    if (!t) { t = document.createElement('div'); t.className = 'eb-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.toggle('is-error', kind === 'error');
    requestAnimationFrame(function () { t.classList.add('is-show'); });
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove('is-show'); }, 2600);
  }

  /* ── Unread badge + realtime ── */
  function _renderBadge() {
    var b = _$('ecwBadge');
    if (!b) return;
    if (S.unread > 0) { b.textContent = S.unread > 9 ? '9+' : String(S.unread); b.classList.remove('ecw-hidden'); }
    else b.classList.add('ecw-hidden');
  }
  function _pulseFab() {
    var fab = _$('ecwFab');
    if (!fab) return;
    fab.classList.remove('is-pulse');
    void fab.offsetWidth;
    fab.classList.add('is-pulse');
  }

  async function _refreshUnread() {
    if (!_sbReady() || !S.user) { S.unread = 0; _renderBadge(); return; }
    try {
      var total = 0;
      if (!S.orders.length && !S.completed.length) { try { await _loadOrders(); } catch (e) {} }
      var ids = S.orders.concat(S.completed).map(function (o) { return o.id; });
      if (ids.length) {
        var r = await _sb.from('messages').select('id')
          .in('order_id', ids).neq('sender_id', S.user.id).is('read_at', null).is('deleted_at', null);
        total += (r.data || []).length;
      }
      var sup = await _sb.from('messages').select('id')
        .is('order_id', null).eq('support_user_id', S.user.id).neq('sender_id', S.user.id).is('read_at', null).is('deleted_at', null);
      total += (sup.data || []).length;
      S.unread = total;
      _renderBadge();
    } catch (e) {}
  }

  function _subscribe() {
    if (!_sbReady() || !S.user) return;
    if (S.channel) { _sb.removeChannel(S.channel); S.channel = null; }
    S.channel = _sb.channel('ecw-' + S.user.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, function (payload) {
        var m = payload.new;
        if (!m || m.sender_id === S.user.id) return;
        var myOrder = S.orders.concat(S.completed).some(function (o) { return o.id === m.order_id; });
        var mySupport = !m.order_id && m.support_user_id === S.user.id;
        if (!myOrder && !mySupport) return;
        _pulseFab();
        if (mySupport && S.open && S.tab === 'support') { S.support.push(m); _paintThread(); _markSupportRead(); }
        else _refreshUnread();
        if (myOrder && S.open && S.tab === 'orders') _renderOrders();
      })
      .subscribe();
  }

  /* ── Auth wiring ── */
  function _onAuth(e) {
    var detail = e && e.detail;
    S.user = detail ? detail.user : null;
    if (S.user) { _refreshUnread(); _subscribe(); }
    else {
      S.unread = 0; S.orders = []; S.completed = []; S.support = [];
      _renderBadge();
      if (S.channel && _sbReady()) { _sb.removeChannel(S.channel); S.channel = null; }
      if (S.open) _close();
    }
  }

  /* ── Public API (kept for existing callers) ── */
  window.EcwOpenChat = function (orderId) {
    if (!S.user) { _login(); return; }
    if (orderId) { location.href = _chatPage() + '?order=' + encodeURIComponent(orderId); return; }
    if (!S.open) _open();
  };

  // Open the widget directly on the Support tab (used by the dashboard
  // "My Tickets" tab to start/continue a support conversation).
  window.EcwOpenSupport = function () {
    if (!S.user) { _login(); return; }
    S.tab = 'support';
    if (!S.open) _open(); else _switchTab('support');
  };

  /* ── Boot ── */
  function _boot() {
    _inject();
    window.addEventListener('eb:authChange', _onAuth);
    if (window.ElysiumAuth && window.ElysiumAuth.isLoggedIn && window.ElysiumAuth.isLoggedIn()) {
      S.user = window.ElysiumAuth.getUser();
      _refreshUnread();
      _subscribe();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _boot);
  else _boot();
})();
