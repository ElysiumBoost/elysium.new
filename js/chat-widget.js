/* Elysium Boost — Chat Widget (chat-widget.js)
 * Floating FAB + slide-in iframe drawer for all pages.
 * Depends on: supabase CDN loaded, auth.js loaded.
 */
(function () {
  'use strict';

  function _chatBase() {
    const p = location.pathname;
    if (p.includes('/pages/games/')) return '../../pages/chat.html';
    if (p.includes('/pages/'))       return 'chat.html';
    return 'pages/chat.html';
  }

  function _assetBase() {
    const p = location.pathname;
    if (p.includes('/pages/games/')) return '../../assets/';
    if (p.includes('/pages/'))       return '../assets/';
    return 'assets/';
  }

  if (location.pathname.endsWith('chat.html')) return;

  let _widgetUser    = null;
  let _widgetChannel = null;
  let _unread        = 0;
  let _drawerOpen    = false;

  // ── Inject HTML ──────────────────────────────────────────────────────────────
  function _inject() {
    const base = _assetBase();

    const fab = document.createElement('button');
    fab.id = 'ecwFab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Open chat');
    fab.innerHTML = `<img src="${base}elysium-logo-mark.png" alt="" width="28" height="28">
      <span class="ecw-badge ec-hidden" id="ecwBadge" aria-live="polite"></span>`;
    document.body.appendChild(fab);

    const backdrop = document.createElement('div');
    backdrop.id = 'ecwBackdrop';
    backdrop.className = 'ecw-backdrop ec-hidden';
    document.body.appendChild(backdrop);

    const drawer = document.createElement('div');
    drawer.id = 'ecwDrawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Chat');
    drawer.className = 'ecw-drawer ec-hidden';
    drawer.innerHTML = `<iframe id="ecwIframe" class="ecw-iframe" src="about:blank" title="Chat"></iframe>`;
    document.body.appendChild(drawer);

    _injectStyles();

    fab.addEventListener('click', _onFabClick);
    backdrop.addEventListener('click', _closeDrawer);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && _drawerOpen) _closeDrawer();
    });
  }

  // ── Styles ───────────────────────────────────────────────────────────────────
  function _injectStyles() {
    if (document.getElementById('ecw-style')) return;
    const s = document.createElement('style');
    s.id = 'ecw-style';
    s.textContent = `
      #ecwFab { position: fixed; bottom: 24px; right: 24px; z-index: 8000; width: 52px; height: 52px; border-radius: 50%; background: var(--gold,#c9a84c); border: 2px solid var(--gold-bright,#e5c26b); box-shadow: 0 4px 20px var(--gold-glow,rgba(201,168,76,.42)); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform .15s, box-shadow .15s; }
      #ecwFab:hover { transform: scale(1.08); box-shadow: 0 6px 28px var(--gold-glow,rgba(201,168,76,.55)); }
      #ecwFab.is-pulse { animation: ecwPulse 1s ease 2; }
      @keyframes ecwPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
      .ecw-badge { position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px; border-radius: 9px; background: #e53e3e; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; border: 2px solid var(--bg,#0a0805); }
      .ecw-backdrop { position: fixed; inset: 0; z-index: 8001; background: rgba(0,0,0,.55); opacity: 0; transition: opacity .25s; pointer-events: none; }
      .ecw-backdrop.is-open { opacity: 1; pointer-events: all; }
      .ecw-drawer { position: fixed; top: 0; right: 0; bottom: 0; z-index: 8002; width: 480px; background: var(--bg,#0a0805); border-left: 1px solid var(--line,rgba(201,168,76,.18)); box-shadow: -8px 0 40px rgba(0,0,0,.6); transform: translateX(100%); transition: transform .3s cubic-bezier(.4,0,.2,1); pointer-events: none; }
      .ecw-drawer.is-open { transform: translateX(0); pointer-events: all; }
      .ecw-iframe { width: 100%; height: 100%; border: none; display: block; }
      .ec-hidden { display: none !important; }
      @media (max-width: 540px) { .ecw-drawer { width: 100vw; } }
    `;
    document.head.appendChild(s);
  }

  // ── Drawer open / close ───────────────────────────────────────────────────────
  function _openDrawer(orderId) {
    const drawer   = document.getElementById('ecwDrawer');
    const backdrop = document.getElementById('ecwBackdrop');
    const iframe   = document.getElementById('ecwIframe');

    const base = _chatBase();
    const src  = orderId ? `${base}?order=${encodeURIComponent(orderId)}` : base;

    if (iframe.getAttribute('src') !== src) iframe.src = src;

    backdrop.classList.remove('ec-hidden');
    drawer.classList.remove('ec-hidden');
    requestAnimationFrame(() => {
      backdrop.classList.add('is-open');
      drawer.classList.add('is-open');
    });

    _drawerOpen = true;
    _clearBadge();
    document.body.style.overflow = 'hidden';
  }

  function _closeDrawer() {
    const drawer   = document.getElementById('ecwDrawer');
    const backdrop = document.getElementById('ecwBackdrop');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    setTimeout(() => {
      drawer.classList.add('ec-hidden');
      backdrop.classList.add('ec-hidden');
    }, 300);
    _drawerOpen = false;
    document.body.style.overflow = '';
  }

  // ── Fab click ────────────────────────────────────────────────────────────────
  function _onFabClick() {
    if (!_widgetUser) { if (typeof ebOpen === 'function') ebOpen(); return; }
    _drawerOpen ? _closeDrawer() : _openDrawer(null);
  }

  // ── Unread badge ──────────────────────────────────────────────────────────────
  async function _subscribeUnread() {
    if (typeof _sb === 'undefined' || !_widgetUser) return;

    try {
      const { data: profile } = await _sb.from('profiles').select('role').eq('id', _widgetUser.id).maybeSingle();
      const role = profile?.role || 'customer';

      let q = _sb.from('orders').select('id');
      if (role === 'booster') q = q.eq('booster_id', _widgetUser.id);
      else q = q.eq('user_id', _widgetUser.id);

      const { data: orders } = await q;
      const ids = (orders || []).map(o => o.id);
      if (!ids.length) return;

      const { data: unreadMsgs } = await _sb
        .from('messages')
        .select('id')
        .in('order_id', ids)
        .neq('sender_id', _widgetUser.id)
        .is('read_at', null)
        .is('deleted_at', null);

      _unread = unreadMsgs?.length || 0;
      _updateBadge();

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
    } catch (_) {}
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

  function _clearBadge() { _unread = 0; _updateBadge(); }

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
    if (_widgetUser) {
      _subscribeUnread();
    } else {
      _unread = 0;
      _updateBadge();
      if (_widgetChannel && typeof _sb !== 'undefined') {
        _sb.removeChannel(_widgetChannel);
        _widgetChannel = null;
      }
      if (_drawerOpen) _closeDrawer();
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────────
  window.EcwOpenChat = function (orderId) {
    if (!_widgetUser) { if (typeof ebOpen === 'function') ebOpen(); return; }
    _openDrawer(orderId || null);
  };

  // ── Boot ──────────────────────────────────────────────────────────────────────
  function _boot() {
    _inject();
    window.addEventListener('eb:authChange', _onAuth);
    if (window.ElysiumAuth?.isLoggedIn?.()) {
      _widgetUser = window.ElysiumAuth.getUser();
      _subscribeUnread();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _boot);
  } else {
    _boot();
  }
})();
