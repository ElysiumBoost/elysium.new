/* Elysium Boost — Chat Widget (chat-widget.js)
 * Self-contained floating chat button for all pages.
 * Depends on: supabase CDN loaded, auth.js loaded.
 */
(function () {
  'use strict';

  // Detect asset path depth from current page location
  function _assetBase() {
    const p = location.pathname;
    if (p.includes('/pages/games/')) return '../../assets/';
    if (p.includes('/pages/'))       return '../assets/';
    return 'assets/';
  }

  function _chatBase() {
    const p = location.pathname;
    if (p.includes('/pages/games/')) return '../../pages/chat.html';
    if (p.includes('/pages/'))       return 'chat.html';
    return 'pages/chat.html';
  }

  // Don't inject widget on the chat page itself
  if (location.pathname.endsWith('chat.html')) return;

  let _widgetUser    = null;
  let _widgetChannel = null;
  let _unread        = 0;
  let _miniOpen      = false;
  let _orders        = [];

  // ── Inject HTML ──────────────────────────────────────────────────────────────
  function _inject() {
    const base = _assetBase();
    const wrap = document.createElement('div');
    wrap.id = 'ebChatWidget';
    wrap.setAttribute('aria-label', 'Chat with support');
    wrap.innerHTML = `
      <button class="ecw-fab" id="ecwFab" type="button" aria-label="Open chat">
        <img src="${base}elysium-logo-mark.png" alt="" width="28" height="28">
        <span class="ecw-badge ec-hidden" id="ecwBadge" aria-live="polite"></span>
      </button>
      <div class="ecw-panel ec-hidden" id="ecwPanel" role="dialog" aria-modal="false" aria-label="Active orders">
        <div class="ecw-panel-hd">
          <span class="ecw-panel-title">Messages</span>
          <a class="ecw-full-link" href="${_chatBase()}">
            <i class="ti ti-external-link"></i> Open full chat
          </a>
        </div>
        <div class="ecw-panel-list" id="ecwList">
          <div class="ecw-loading">Loading…</div>
        </div>
        <div class="ecw-panel-ft">
          <a class="ecw-all-link" href="${_chatBase()}">View all conversations</a>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    _injectStyles();
    document.getElementById('ecwFab').addEventListener('click', _onFabClick);
    document.addEventListener('click', _onDocClick);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && _miniOpen) _closeMini(); });
  }

  // ── Styles ───────────────────────────────────────────────────────────────────
  function _injectStyles() {
    if (document.getElementById('ecw-style')) return;
    const s = document.createElement('style');
    s.id = 'ecw-style';
    s.textContent = `
      #ebChatWidget { position: fixed; bottom: 24px; right: 24px; z-index: 8000; font-family: var(--f-body,"Plus Jakarta Sans",sans-serif); }
      .ecw-fab { width: 52px; height: 52px; border-radius: 50%; background: var(--gold,#c9a84c); border: 2px solid var(--gold-bright,#e5c26b); box-shadow: 0 4px 20px var(--gold-glow,rgba(201,168,76,.42)); cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; transition: transform .15s, box-shadow .15s; }
      .ecw-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px var(--gold-glow,rgba(201,168,76,.55)); }
      .ecw-fab.is-pulse { animation: ecwPulse 1s ease 2; }
      @keyframes ecwPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
      .ecw-badge { position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px; border-radius: 9px; background: #e53e3e; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; border: 2px solid var(--bg,#0a0805); }
      .ecw-panel { position: absolute; bottom: 64px; right: 0; width: 340px; background: var(--bg-2,#100b07); border: 1px solid var(--line,rgba(201,168,76,.18)); border-radius: 14px; box-shadow: 0 16px 48px rgba(0,0,0,.5); overflow: hidden; transform: translateY(8px); opacity: 0; transition: opacity .2s, transform .2s; pointer-events: none; }
      .ecw-panel.is-open { opacity: 1; transform: translateY(0); pointer-events: all; }
      .ecw-panel-hd { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 10px; border-bottom: 1px solid var(--line-soft,rgba(239,230,207,.08)); }
      .ecw-panel-title { font-family: var(--f-display,"Rajdhani",sans-serif); font-size: 15px; font-weight: 700; color: var(--text,#efe6cf); letter-spacing: .04em; text-transform: uppercase; }
      .ecw-full-link { font-size: 12px; color: var(--gold,#c9a84c); text-decoration: none; display: flex; align-items: center; gap: 4px; }
      .ecw-full-link:hover { color: var(--gold-bright,#e5c26b); }
      .ecw-panel-list { max-height: 320px; overflow-y: auto; padding: 6px 0; }
      .ecw-loading { padding: 20px 16px; font-size: 13px; color: var(--text-dim,rgba(239,230,207,.48)); text-align: center; }
      .ecw-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; cursor: pointer; transition: background .12s; text-decoration: none; }
      .ecw-item:hover { background: var(--bg-3,#18110a); }
      .ecw-item-avatar { width: 36px; height: 36px; border-radius: 8px; background: var(--gold-soft,rgba(201,168,76,.14)); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: var(--gold,#c9a84c); flex-shrink: 0; }
      .ecw-item-meta { flex: 1; min-width: 0; }
      .ecw-item-name { font-size: 13px; font-weight: 600; color: var(--text,#efe6cf); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .ecw-item-sub { font-size: 12px; color: var(--text-dim,rgba(239,230,207,.48)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
      .ecw-item-unread { min-width: 18px; height: 18px; border-radius: 9px; background: var(--gold,#c9a84c); color: var(--bg,#0a0805); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; flex-shrink: 0; }
      .ecw-empty { padding: 20px 16px; font-size: 13px; color: var(--text-dim,rgba(239,230,207,.48)); text-align: center; }
      .ecw-panel-ft { border-top: 1px solid var(--line-soft,rgba(239,230,207,.08)); padding: 10px 16px; }
      .ecw-all-link { font-size: 13px; color: var(--gold,#c9a84c); text-decoration: none; display: block; text-align: center; }
      .ecw-all-link:hover { color: var(--gold-bright,#e5c26b); }
      .ec-hidden { display: none !important; }
      @media (max-width: 480px) { .ecw-panel { width: calc(100vw - 32px); right: 0; } }
    `;
    document.head.appendChild(s);
  }

  // ── Fab click ────────────────────────────────────────────────────────────────
  function _onFabClick(e) {
    e.stopPropagation();
    if (!_widgetUser) { if (typeof ebOpen === 'function') ebOpen(); return; }
    _miniOpen ? _closeMini() : _openMini();
  }

  function _onDocClick(e) {
    const panel = document.getElementById('ecwPanel');
    const fab   = document.getElementById('ecwFab');
    if (_miniOpen && panel && !panel.contains(e.target) && !fab.contains(e.target)) {
      _closeMini();
    }
  }

  function _openMini() {
    _miniOpen = true;
    const panel = document.getElementById('ecwPanel');
    panel.classList.remove('ec-hidden');
    requestAnimationFrame(() => panel.classList.add('is-open'));
    _loadMiniOrders();
    _clearBadge();
  }

  function _closeMini() {
    _miniOpen = false;
    const panel = document.getElementById('ecwPanel');
    panel.classList.remove('is-open');
    setTimeout(() => panel.classList.add('ec-hidden'), 200);
  }

  // ── Load orders for mini panel ────────────────────────────────────────────────
  async function _loadMiniOrders() {
    const list = document.getElementById('ecwList');
    if (!list || !_widgetUser || typeof _sb === 'undefined') return;

    const { data: profile } = await _sb.from('profiles').select('role').eq('id', _widgetUser.id).maybeSingle();
    const role = profile?.role || 'customer';

    let q = _sb.from('orders').select('id, game, service_name, status, booster_id, user_id').limit(10);
    if (role === 'booster') q = q.eq('booster_id', _widgetUser.id);
    else q = q.eq('user_id', _widgetUser.id);
    q = q.in('status', ['pending','active','proof_submitted','Pending','In Progress']);

    const { data: orders } = await q.order('created_at', { ascending: false });
    _orders = orders || [];

    if (!_orders.length) {
      list.innerHTML = '<div class="ecw-empty">No active orders.</div>';
      return;
    }

    const chatBase = _chatBase();
    list.innerHTML = _orders.map(o => {
      const game    = (o.game || '').slice(0, 2).toUpperCase();
      const status  = _widgetStatusLabel(o.status);
      return `<a class="ecw-item" href="${chatBase}?order=${encodeURIComponent(o.id)}" aria-label="${o.service_name}">
        <div class="ecw-item-avatar">${game}</div>
        <div class="ecw-item-meta">
          <div class="ecw-item-name">${_wEsc(o.service_name)}</div>
          <div class="ecw-item-sub">${status}</div>
        </div>
      </a>`;
    }).join('');
  }

  // ── Subscribe for unread count ────────────────────────────────────────────────
  async function _subscribeUnread() {
    if (typeof _sb === 'undefined' || !_widgetUser) return;

    // Initial unread count
    const { data: profile } = await _sb.from('profiles').select('role').eq('id', _widgetUser.id).maybeSingle();
    const role = profile?.role || 'customer';
    let q = _sb.from('orders').select('id');
    if (role === 'booster') q = q.eq('booster_id', _widgetUser.id);
    else q = q.eq('user_id', _widgetUser.id);
    const { data: orders } = await q;
    const ids = (orders || []).map(o => o.id);

    if (ids.length) {
      const { data: unreadMsgs } = await _sb
        .from('messages')
        .select('id', { count: 'exact' })
        .in('order_id', ids)
        .neq('sender_id', _widgetUser.id)
        .is('read_at', null)
        .is('deleted_at', null);
      _unread = unreadMsgs?.length || 0;
      _updateBadge();
    }

    if (!ids.length) return;

    // Realtime: listen for new messages across all user orders
    if (_widgetChannel) _sb.removeChannel(_widgetChannel);
    _widgetChannel = _sb.channel('widget-msgs')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
      }, payload => {
        const m = payload.new;
        if (!ids.includes(m.order_id)) return;
        if (m.sender_id === _widgetUser.id) return;
        _unread++;
        _updateBadge();
        _pulseFab();
      })
      .subscribe();
  }

  function _updateBadge() {
    const badge = document.getElementById('ecwBadge');
    if (!badge) return;
    if (_unread > 0) {
      badge.textContent = _unread > 9 ? '9+' : String(_unread);
      badge.classList.remove('ec-hidden');
    } else {
      badge.classList.add('ec-hidden');
    }
  }

  function _clearBadge() {
    _unread = 0;
    _updateBadge();
  }

  function _pulseFab() {
    const fab = document.getElementById('ecwFab');
    if (!fab) return;
    fab.classList.remove('is-pulse');
    void fab.offsetWidth;
    fab.classList.add('is-pulse');
  }

  // ── Auth listener ─────────────────────────────────────────────────────────────
  function _onAuth({ detail }) {
    _widgetUser = detail.user;
    if (_widgetUser) _subscribeUnread();
    else {
      _unread = 0;
      _updateBadge();
      if (_widgetChannel && typeof _sb !== 'undefined') {
        _sb.removeChannel(_widgetChannel);
        _widgetChannel = null;
      }
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function _wEsc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _widgetStatusLabel(s) {
    const m = { pending:'Pending', active:'In Progress', proof_submitted:'Proof Submitted', 'Pending':'Pending', 'In Progress':'In Progress' };
    return m[s] || s;
  }

  // ── Boot ──────────────────────────────────────────────────────────────────────
  function _boot() {
    _inject();
    window.addEventListener('eb:authChange', _onAuth);
    // If auth already resolved
    if (typeof ebGetUser === 'function') {
      const u = ebGetUser();
      if (u) { _widgetUser = u; _subscribeUnread(); }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _boot);
  } else {
    _boot();
  }
})();
