/* Elysium Boost — Chat (chat.js) */

const PROOF_BUCKET = 'booster-proofs';

const PAYMENT_RX = /\b(paypal|iban|wise|crypto|wallet|bitcoin|btc|eth(?:ereum)?|bank\s*transfer|western\s*union)\b/i;

const CANNED = [
  'Starting now',
  'ETA 30 min',
  'Proof uploaded',
  'Need your confirmation',
  'Almost done!',
  'BRB 15 min',
];

let _user    = null;
let _profile = null;
let _orders  = [];
let _openOrderId = null;
let _msgChannel   = null;
let _orderChannel = null;
let _sendLock = false;
let _offlineQueue = [];
let _filterMode = 'all';
let _searchQ    = '';
let _typingTimer = null;

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('eb:authChange', ({ detail }) => {
    _user = detail.user;
    if (_user) _init();
    else _redirectLogin();
  });

  // Auth may have already fired before DOMContentLoaded
  const sess = window.ElysiumAuth?.isLoggedIn?.();
  if (sess) { _user = window.ElysiumAuth.getUser(); _init(); }
});

async function _init() {
  try {
    const { data } = await _sb.from('profiles').select('*').eq('id', _user.id).maybeSingle();
    _profile = data || { role: 'customer', id: _user.id };
  } catch (_) {
    _profile = { role: 'customer', id: _user.id };
  }

  _adjustHomeLink();
  _loadQueue();
  await loadConversations();
  _subscribeOrders();

  const params = new URLSearchParams(location.search);
  const pid = params.get('order');
  if (pid) openConversation(pid);

  _wireUI();
}

function _redirectLogin() {
  location.href = '../index.html';
}

function _adjustHomeLink() {
  const el = document.getElementById('ecHomeLink');
  if (!el) return;
  if (_profile.role === 'booster') {
    el.href = 'booster.html';
    el.setAttribute('aria-label', 'Back to booster panel');
    el.querySelector('i').className = 'ti ti-shield-bolt';
  }
}

// ── Conversations ─────────────────────────────────────────────────────────────
async function loadConversations() {
  const list = document.getElementById('ecConvoList');

  try {
    let q = _sb.from('orders').select('*, booster:profiles!booster_id(id,username,avatar_url,role)');

    if (_profile.role === 'booster') {
      q = q.eq('booster_id', _user.id);
    } else if (_profile.role === 'admin') {
      // admin sees all — no filter
    } else {
      q = q.eq('user_id', _user.id);
    }

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 5000)
    );

    const { data, error } = await Promise.race([
      q.order('created_at', { ascending: false }),
      timeout,
    ]);

    if (error) throw error;
    _orders = data || [];
    await renderConvoList();
  } catch (_err) {
    if (list) {
      list.innerHTML = '<div class="ec-list-msg"><i class="ti ti-wifi-off"></i><span>Could not load conversations. Check your connection.</span></div>';
    }
    _toast('Failed to load conversations', 'error');
  }
}

async function renderConvoList() {
  const list = document.getElementById('ecConvoList');

  let orders = [..._orders];

  if (_filterMode !== 'all') {
    orders = orders.filter(o => {
      if (_filterMode === 'active')   return ['active','pending','proof_submitted','In Progress'].includes(o.status);
      if (_filterMode === 'support')  return o.status === 'disputed';
      if (_filterMode === 'disputed') return o.status === 'disputed';
      return true;
    });
  }

  if (_searchQ) {
    const q = _searchQ.toLowerCase();
    orders = orders.filter(o =>
      o.game?.toLowerCase().includes(q) ||
      o.service_name?.toLowerCase().includes(q) ||
      o.id?.slice(0, 8).toLowerCase().includes(q)
    );
  }

  // Sort: disputed first, then active, then by updated
  orders.sort((a, b) => {
    const rank = s => s === 'disputed' ? 0 : ['active','proof_submitted'].includes(s) ? 1 : 2;
    return rank(a.status) - rank(b.status);
  });

  if (!orders.length) {
    list.innerHTML = '<div class="ec-list-msg"><i class="ti ti-message-off"></i><span>No conversations found.</span></div>';
    return;
  }

  // Fetch last messages for all orders in view
  const ids = orders.map(o => o.id);
  const { data: msgs } = await _sb
    .from('messages')
    .select('order_id, content, created_at, sender_id, image_url, message_type')
    .in('order_id', ids)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const lastMsgMap = {};
  const unreadMap  = {};
  (msgs || []).forEach(m => {
    if (!lastMsgMap[m.order_id]) lastMsgMap[m.order_id] = m;
    if (m.sender_id !== _user.id) unreadMap[m.order_id] = (unreadMap[m.order_id] || 0) + 1;
  });

  list.innerHTML = orders.map(o => renderConvoItem(o, lastMsgMap[o.id], unreadMap[o.id] || 0)).join('');

  list.querySelectorAll('[data-convo-id]').forEach(el => {
    el.addEventListener('click', () => openConversation(el.dataset.convoId));
  });
}

function renderConvoItem(order, lastMsg, unread) {
  const isActive  = order.id === _openOrderId;
  const gameClass = _gameClass(order.game);
  const statusLabel = _statusLabel(order.status);
  const preview   = lastMsg
    ? (lastMsg.image_url ? '📎 Image' : lastMsg.content?.slice(0, 55) || '')
    : 'No messages yet';
  const timeStr   = lastMsg ? _relTime(lastMsg.created_at) : '';
  const badge     = unread > 0 ? `<span class="ec-unread-badge">${unread > 9 ? '9+' : unread}</span>` : '';
  const etaPill   = order.eta_minutes
    ? `<span class="ec-eta-pill">${_etaLabel(order.eta_minutes, order.picked_at)}</span>` : '';
  const flag      = order.status === 'disputed' ? '<span class="ec-flag-dot" title="Disputed"></span>' : '';

  return `
    <div class="ec-convo-item ${isActive ? 'is-active' : ''}" data-convo-id="${order.id}" role="button" tabindex="0" aria-label="${order.game} — ${order.service_name}">
      <div class="ec-convo-avatar ec-convo-avatar--game">
        <span class="ec-game-badge ${gameClass}">${order.game?.slice(0,2).toUpperCase()}</span>
        ${flag}
      </div>
      <div class="ec-convo-meta">
        <div class="ec-convo-top">
          <span class="ec-convo-name">${_esc(order.service_name)}</span>
          <span class="ec-convo-time">${timeStr}</span>
        </div>
        <div class="ec-convo-bottom">
          <span class="ec-convo-preview">${_esc(preview)}</span>
          <div class="ec-convo-pills">${etaPill}${badge}</div>
        </div>
        <span class="ec-status-chip ec-status-${order.status.toLowerCase().replace(/\s/g,'-')}">${statusLabel}</span>
      </div>
    </div>`;
}

// ── Open / Close conversation ──────────────────────────────────────────────────
async function openConversation(orderId) {
  _openOrderId = orderId;

  document.getElementById('ecEmptyState').classList.add('ec-hidden');
  document.getElementById('ecConv').classList.remove('ec-hidden');
  document.getElementById('ecRight').classList.remove('ec-hidden');
  document.getElementById('ecMobBack').classList.remove('ec-hidden');
  document.getElementById('ecMobPanel').classList.remove('ec-hidden');

  // Highlight active item
  document.querySelectorAll('[data-convo-id]').forEach(el => {
    el.classList.toggle('is-active', el.dataset.convoId === orderId);
  });

  const order = _orders.find(o => o.id === orderId);
  if (!order) return;

  // Render header + panel
  const counterpartyId = _profile.role === 'booster' ? order.user_id : order.booster_id;
  let counterparty = null;
  if (counterpartyId) {
    const { data } = await _sb.from('profiles').select('id,username,avatar_url,role,is_available').eq('id', counterpartyId).maybeSingle();
    counterparty = data;
  }

  renderChatHeader(order, counterparty);
  renderOrderPanel(order);

  // Booster-only buttons visibility
  document.querySelectorAll('.ec-booster-only').forEach(el => {
    el.style.display = _profile.role === 'booster' ? '' : 'none';
  });

  await _loadMessages(orderId);
  _subscribeMessages(orderId);
  _markRead(orderId);
}

// ── Header ─────────────────────────────────────────────────────────────────────
function renderChatHeader(order, counterparty) {
  const hd = document.getElementById('ecChatHeader');
  const name    = counterparty?.username || (order.booster_id ? 'Booster' : 'Waiting for booster…');
  const avatarHtml = counterparty?.avatar_url
    ? `<img src="${_esc(counterparty.avatar_url)}" alt="${_esc(name)}">`
    : `<span>${name.slice(0,2).toUpperCase()}</span>`;
  const online  = counterparty?.is_available ? '<span class="ec-online-dot"></span>' : '';
  const gameClass = _gameClass(order.game);
  const statusLabel = _statusLabel(order.status);

  const actionsBtns = _renderHeaderActions(order);

  hd.innerHTML = `
    <div class="ec-chat-hd-left">
      <div class="ec-chat-avatar">${avatarHtml}${online}</div>
      <div class="ec-chat-hd-info">
        <div class="ec-chat-hd-name">${_esc(name)}</div>
        <div class="ec-chat-hd-sub">
          <span class="ec-game-badge ${gameClass}">${_esc(order.game)}</span>
          <span class="ec-hd-service">${_esc(order.service_name)}</span>
          <span class="ec-status-chip ec-status-${order.status.toLowerCase().replace(/\s/g,'-')}">${statusLabel}</span>
        </div>
      </div>
    </div>
    <div class="ec-chat-hd-right">${actionsBtns}</div>`;

  hd.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => _handleHeaderAction(btn.dataset.action, order));
  });
}

function _renderHeaderActions(order) {
  const btns = [];
  if (_profile.role === 'customer') {
    btns.push(`<button class="ec-hd-btn" data-action="help" type="button"><i class="ti ti-help-circle"></i> Help</button>`);
    if (order.status === 'proof_submitted' && !order.customer_confirmed_at) {
      btns.push(`<button class="ec-hd-btn ec-hd-btn--primary" data-action="confirm" type="button"><i class="ti ti-check"></i> Confirm</button>`);
    }
  }
  if (_profile.role === 'booster') {
    if (order.status === 'active') {
      btns.push(`<button class="ec-hd-btn" data-action="proof" type="button"><i class="ti ti-shield-check"></i> Upload Proof</button>`);
    }
  }
  if (_profile.role === 'admin') {
    btns.push(`<button class="ec-hd-btn" data-action="admin-help" type="button"><i class="ti ti-settings"></i> Admin</button>`);
  }
  return btns.join('');
}

async function _handleHeaderAction(action, order) {
  if (action === 'help')  _openHelpModal(order);
  if (action === 'confirm') _confirmCompletion(order);
  if (action === 'proof') document.getElementById('ecProofModal').classList.remove('ec-hidden');
}

// ── Order Panel ────────────────────────────────────────────────────────────────
function renderOrderPanel(order) {
  const panel = document.getElementById('ecOrderPanel');
  const health = _computeHealthScore(order);

  panel.innerHTML = `
    <div class="ec-panel-hd">
      <span class="ec-panel-title">Order Details</span>
      <span class="ec-health ec-health--${health.level}">${health.label}</span>
    </div>
    <div class="ec-panel-rows">
      ${_panelRow('Order ID', order.id.slice(0,8).toUpperCase())}
      ${_panelRow('Game', order.game)}
      ${_panelRow('Service', order.service_name)}
      ${_panelRow('Status', _statusLabel(order.status))}
      ${order.price ? _panelRow('Price', `$${Number(order.price).toFixed(2)}`) : ''}
      ${order.eta_minutes ? _panelRow('ETA', _etaLabel(order.eta_minutes, order.picked_at)) : ''}
      ${order.embark_id ? _panelRow('Account ID', _esc(order.embark_id)) : ''}
      ${order.customer_note ? _panelRow('Note', _esc(order.customer_note)) : ''}
    </div>
    <div class="ec-panel-section">
      <div class="ec-panel-section-title">Delivery Checklist</div>
      ${renderDeliveryChecklist(order)}
    </div>
    ${order.proof_url ? `
    <div class="ec-panel-section">
      <div class="ec-panel-section-title">Proof</div>
      <div class="ec-proof-thumb" data-zoom-url="${_esc(order.proof_url)}">
        <img src="${_esc(order.proof_url)}" alt="Completion proof" loading="lazy">
      </div>
    </div>` : ''}
    ${_profile.role === 'booster' && order.tip_amount > 0 ? _panelRow('Tip', `$${Number(order.tip_amount).toFixed(2)}`) : ''}`;

  panel.querySelectorAll('[data-zoom-url]').forEach(el => {
    el.addEventListener('click', () => _openZoom(el.dataset.zoomUrl, 'Completion proof'));
  });
}

function _panelRow(label, value) {
  return `<div class="ec-panel-row"><span class="ec-panel-label">${label}</span><span class="ec-panel-val">${value}</span></div>`;
}

function renderDeliveryChecklist(order) {
  const steps = [
    { key: 'created',   label: 'Order placed',      time: order.created_at },
    { key: 'picked',    label: 'Booster assigned',  time: order.picked_at },
    { key: 'active',    label: 'Boost in progress', time: order.picked_at && ['active','proof_submitted','completed','Completed'].includes(order.status) ? order.picked_at : null },
    { key: 'proof',     label: 'Proof submitted',   time: order.status === 'proof_submitted' || order.status === 'completed' || order.status === 'Completed' ? order.completed_at || order.picked_at : null },
    { key: 'confirmed', label: 'Confirmed',          time: order.customer_confirmed_at },
  ];

  const currentIdx = (() => {
    if (order.customer_confirmed_at) return 5;
    if (order.status === 'proof_submitted') return 3;
    if (['active','In Progress'].includes(order.status)) return 2;
    if (order.picked_at) return 1;
    return 0;
  })();

  return `<div class="ec-checklist">${steps.map((s, i) => {
    const done    = i < currentIdx;
    const current = i === currentIdx;
    return `<div class="ec-check-step ${done ? 'is-done' : ''} ${current ? 'is-current' : ''}">
      <span class="ec-check-icon"><i class="ti ${done ? 'ti-check' : 'ti-circle'}"></i></span>
      <span class="ec-check-label">${s.label}</span>
      ${s.time ? `<span class="ec-check-time">${_relTime(s.time)}</span>` : ''}
    </div>`;
  }).join('')}</div>`;
}

function _computeHealthScore(order) {
  if (order.status === 'disputed') return { level: 'bad',  label: 'Disputed' };
  if (order.status === 'proof_submitted' && !order.customer_confirmed_at) return { level: 'warn', label: 'Needs attention' };
  if (['completed','Completed'].includes(order.status)) return { level: 'good', label: 'Completed' };
  if (order.eta_minutes && order.picked_at) {
    const elapsed = (Date.now() - new Date(order.picked_at).getTime()) / 60000;
    if (elapsed > order.eta_minutes * 1.5) return { level: 'bad', label: 'At risk' };
    if (elapsed > order.eta_minutes * 0.9) return { level: 'warn', label: 'Needs attention' };
  }
  return { level: 'good', label: 'Healthy' };
}

// ── Messages ───────────────────────────────────────────────────────────────────
async function _loadMessages(orderId) {
  const thread = document.getElementById('ecMessages');
  thread.innerHTML = '<div class="ec-skel ec-skel-msg"></div><div class="ec-skel ec-skel-msg"></div>';

  const { data, error } = await _sb
    .from('messages')
    .select('*')
    .eq('order_id', orderId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) { thread.innerHTML = '<div class="ec-load-err">Failed to load messages.</div>'; return; }

  thread.innerHTML = '';
  (data || []).forEach(m => thread.appendChild(_renderMessage(m)));

  _renderPinnedBar(data || []);
  _scrollBottom();
}

function _renderMessage(m) {
  if (m.message_type === 'system')  return _renderSystemMsg(m);
  if (m.message_type === 'admin')   return _renderAdminMsg(m);
  if (m.message_type === 'case')    return _renderCaseMsg(m);
  if (m.message_type === 'proof')   return _renderProofMsg(m);
  return _renderBubble(m);
}

function _renderBubble(m) {
  const mine = m.sender_id === _user.id;
  const wrap = document.createElement('div');
  wrap.className = `ec-msg ${mine ? 'is-mine' : 'is-them'}`;
  wrap.dataset.msgId = m.id;

  const timeAgo = _relTime(m.created_at);
  const edited  = m.edited_at ? ' <span class="ec-edited">(edited)</span>' : '';
  const pinned  = m.pinned    ? '<i class="ti ti-pin ec-pin-icon" title="Pinned"></i>' : '';

  let bodyHtml = '';
  if (m.image_url) {
    bodyHtml = `<div class="ec-bubble-img" data-zoom-url="${_esc(m.image_url)}">
      <img src="${_esc(m.image_url)}" alt="Attached image" loading="lazy">
    </div>`;
  } else {
    bodyHtml = `<div class="ec-bubble">${_esc(m.content || '')}${edited}</div>`;
  }

  const reactions = _renderReactions(m);
  const actions   = _renderMsgActions(m, mine);

  wrap.innerHTML = `
    ${bodyHtml}
    ${reactions}
    <div class="ec-msg-footer">${pinned}<span class="ec-msg-time">${timeAgo}</span></div>
    ${actions}`;

  wrap.querySelectorAll('[data-zoom-url]').forEach(el => {
    el.addEventListener('click', () => _openZoom(el.dataset.zoomUrl, 'Image'));
  });
  wrap.querySelectorAll('[data-react]').forEach(btn => {
    btn.addEventListener('click', () => _toggleReaction(m.id, btn.dataset.react));
  });
  wrap.querySelectorAll('[data-msg-action]').forEach(btn => {
    btn.addEventListener('click', () => _handleMsgAction(btn.dataset.msgAction, m));
  });

  return wrap;
}

function _renderReactions(m) {
  if (!m.reactions || !Object.keys(m.reactions).length) return '';
  const pills = Object.entries(m.reactions).map(([emoji, users]) => {
    const active = users.includes(_user.id);
    return `<button class="ec-react-pill ${active ? 'is-mine' : ''}" data-react="${emoji}" type="button">${emoji} ${users.length}</button>`;
  }).join('');
  return `<div class="ec-reactions">${pills}</div>`;
}

function _renderMsgActions(m, mine) {
  const canEdit   = mine && m.message_type === 'user' && !m.image_url && (Date.now() - new Date(m.created_at).getTime() < 120000);
  const canDelete = mine && m.message_type === 'user';
  const canPin    = _profile.role === 'booster' || _profile.role === 'admin';

  if (!canEdit && !canDelete && !canPin) return '';

  let btns = `<button class="ec-msg-act-btn" data-react="👍" type="button" title="React">👍</button>
    <button class="ec-msg-act-btn" data-react="✓" type="button" title="React">✓</button>
    <button class="ec-msg-act-btn" data-react="❤️" type="button" title="React">❤️</button>`;
  if (canPin)    btns += `<button class="ec-msg-act-btn" data-msg-action="pin" type="button" title="Pin"><i class="ti ti-pin"></i></button>`;
  if (canEdit)   btns += `<button class="ec-msg-act-btn" data-msg-action="edit" type="button" title="Edit"><i class="ti ti-edit"></i></button>`;
  if (canDelete) btns += `<button class="ec-msg-act-btn" data-msg-action="delete" type="button" title="Delete"><i class="ti ti-trash"></i></button>`;

  return `<div class="ec-msg-actions">${btns}</div>`;
}

function _renderSystemMsg(m) {
  const el = document.createElement('div');
  el.className = 'ec-system';
  el.innerHTML = `<i class="ti ti-info-circle"></i> ${_esc(m.content || '')}`;
  return el;
}

function _renderAdminMsg(m) {
  const el = document.createElement('div');
  el.className = 'ec-admin-card';
  el.dataset.msgId = m.id;
  el.innerHTML = `<div class="ec-admin-hd"><i class="ti ti-shield-filled"></i> Admin Notice</div>
    <div class="ec-admin-body">${_esc(m.content || '')}</div>
    <div class="ec-admin-time">${_relTime(m.created_at)}</div>`;
  return el;
}

function _renderCaseMsg(m) {
  const el = document.createElement('div');
  el.className = 'ec-case';
  el.dataset.msgId = m.id;
  el.innerHTML = `<div class="ec-case-hd"><i class="ti ti-alert-triangle"></i> Dispute Filed</div>
    <div class="ec-case-body">${_esc(m.content || '')}</div>
    <div class="ec-case-time">${_relTime(m.created_at)}</div>`;
  return el;
}

function _renderProofMsg(m) {
  const el = document.createElement('div');
  el.className = 'ec-proof-msg';
  el.dataset.msgId = m.id;
  const imgHtml = m.image_url
    ? `<div class="ec-proof-msg-img" data-zoom-url="${_esc(m.image_url)}"><img src="${_esc(m.image_url)}" alt="Proof" loading="lazy"></div>`
    : '';
  el.innerHTML = `<div class="ec-proof-msg-hd"><i class="ti ti-shield-check"></i> Completion Proof</div>
    ${imgHtml}
    <div class="ec-proof-msg-body">${_esc(m.content || '')}</div>
    <div class="ec-proof-msg-time">${_relTime(m.created_at)}</div>`;
  el.querySelectorAll('[data-zoom-url]').forEach(z => {
    z.addEventListener('click', () => _openZoom(z.dataset.zoomUrl, 'Completion proof'));
  });
  return el;
}

function _renderPinnedBar(msgs) {
  const pinned = msgs.filter(m => m.pinned && !m.deleted_at);
  const bar = document.getElementById('ecPinnedBar');
  if (!pinned.length) { bar.classList.add('ec-hidden'); return; }
  const latest = pinned[pinned.length - 1];
  bar.classList.remove('ec-hidden');
  bar.innerHTML = `<i class="ti ti-pin"></i> <span>${_esc(latest.content?.slice(0, 80) || '📎 Media')}</span>`;
}

// ── Send ───────────────────────────────────────────────────────────────────────
async function _sendMessage(content, imageUrl = null, type = 'user') {
  if (_sendLock) return;
  if (!content?.trim() && !imageUrl) return;
  if (!_openOrderId) return;

  _sendLock = true;
  const clientId = `${_user.id}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  const payload = {
    order_id:     _openOrderId,
    sender_id:    _user.id,
    sender_role:  _profile.role === 'booster' ? 'booster' : 'customer',
    content:      content?.trim() || null,
    image_url:    imageUrl || null,
    message_type: type,
    client_id:    clientId,
  };

  const { error } = await _sb.from('messages').insert(payload);
  _sendLock = false;

  if (error) {
    if (error.code !== '23505') { // not a dup
      _enqueueOffline(payload);
      _toast('Message queued — will retry when online.', 'warn');
    }
  }
}

// ── Realtime ───────────────────────────────────────────────────────────────────
function _subscribeMessages(orderId) {
  if (_msgChannel) _sb.removeChannel(_msgChannel);

  _msgChannel = _sb.channel(`msgs-${orderId}`)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'messages',
      filter: `order_id=eq.${orderId}`,
    }, payload => {
      _handleMsgChange(payload);
    })
    .subscribe();
}

function _subscribeOrders() {
  if (_orderChannel) _sb.removeChannel(_orderChannel);
  _orderChannel = _sb.channel('orders-watch')
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'orders',
    }, ({ new: updated }) => {
      const idx = _orders.findIndex(o => o.id === updated.id);
      if (idx >= 0) _orders[idx] = { ..._orders[idx], ...updated };
      renderConvoList();
      if (updated.id === _openOrderId) {
        renderChatHeader(updated, null);
        renderOrderPanel(updated);
      }
    })
    .subscribe();
}

function _handleMsgChange({ eventType, new: m, old }) {
  const thread = document.getElementById('ecMessages');
  if (!thread) return;

  if (eventType === 'INSERT') {
    if (m.deleted_at) return;
    const existing = thread.querySelector(`[data-msg-id="${m.id}"]`);
    if (existing) return; // already rendered (optimistic)
    thread.appendChild(_renderMessage(m));
    _scrollBottom();
    if (m.sender_id !== _user.id) _markRead(_openOrderId);

    // Update convo list preview
    const order = _orders.find(o => o.id === m.order_id);
    if (order) renderConvoList();
  }

  if (eventType === 'UPDATE') {
    const existing = thread.querySelector(`[data-msg-id="${m.id}"]`);
    if (!existing) return;
    if (m.deleted_at) { existing.remove(); return; }
    const fresh = _renderMessage(m);
    thread.replaceChild(fresh, existing);
  }

  if (eventType === 'DELETE') {
    const existing = thread.querySelector(`[data-msg-id="${old?.id}"]`);
    if (existing) existing.remove();
  }
}

// ── Mark read ──────────────────────────────────────────────────────────────────
async function _markRead(orderId) {
  await _sb.from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('order_id', orderId)
    .neq('sender_id', _user.id)
    .is('read_at', null);
}

// ── Reactions / edit / delete / pin ───────────────────────────────────────────
async function _toggleReaction(msgId, emoji) {
  const { data: msg } = await _sb.from('messages').select('reactions').eq('id', msgId).maybeSingle();
  if (!msg) return;
  const r = msg.reactions || {};
  const users = r[emoji] || [];
  if (users.includes(_user.id)) {
    r[emoji] = users.filter(u => u !== _user.id);
    if (!r[emoji].length) delete r[emoji];
  } else {
    r[emoji] = [...users, _user.id];
  }
  await _sb.from('messages').update({ reactions: r }).eq('id', msgId);
}

async function _handleMsgAction(action, m) {
  if (action === 'pin') {
    await _sb.from('messages').update({ pinned: !m.pinned }).eq('id', m.id);
  }
  if (action === 'delete') {
    await _sb.from('messages').update({ deleted_at: new Date().toISOString() }).eq('id', m.id);
  }
  if (action === 'edit') {
    const val = prompt('Edit message:', m.content || '');
    if (val === null || val === m.content) return;
    await _sb.from('messages').update({ content: val.trim(), edited_at: new Date().toISOString() }).eq('id', m.id);
  }
}

// ── Proof upload ───────────────────────────────────────────────────────────────
async function handleProofUpload(file) {
  if (!file) return;
  const MIN = 100 * 1024, MAX = 20 * 1024 * 1024;
  if (file.size < MIN) { _toast('File too small (min 100KB).', 'error'); return; }
  if (file.size > MAX) { _toast('File too large (max 20MB).', 'error'); return; }

  const allowed = ['image/png','image/jpeg','image/webp','video/mp4'];
  if (!allowed.includes(file.type)) { _toast('Unsupported file type.', 'error'); return; }

  const bar  = document.getElementById('ecProofBar');
  const prog = document.getElementById('ecProofProgress');
  prog.classList.remove('ec-hidden');
  bar.style.width = '0%';

  const ext  = file.name.split('.').pop();
  const path = `${_user.id}/${_openOrderId}/${Date.now()}.${ext}`;

  const { data, error } = await _sb.storage.from(PROOF_BUCKET).upload(path, file, {
    upsert: true,
    onUploadProgress: ({ loaded, total }) => {
      bar.style.width = `${Math.round((loaded / total) * 100)}%`;
    },
  });

  if (error) { _toast('Upload failed: ' + error.message, 'error'); prog.classList.add('ec-hidden'); return; }

  const { data: urlData } = _sb.storage.from(PROOF_BUCKET).getPublicUrl(data.path);
  const url = urlData.publicUrl;

  // Save proof_url on order
  await _sb.from('orders').update({ proof_url: url, status: 'proof_submitted' }).eq('id', _openOrderId);

  // Send proof message
  await _sendMessage('Completion proof submitted.', url, 'proof');

  bar.style.width = '100%';
  setTimeout(() => { prog.classList.add('ec-hidden'); }, 800);
  document.getElementById('ecProofModal').classList.add('ec-hidden');
  _toast('Proof submitted!', 'success');
}

// ── Confirm completion (customer) ──────────────────────────────────────────────
async function _confirmCompletion(order) {
  const { error } = await _sb.from('orders').update({
    status: 'completed',
    customer_confirmed_at: new Date().toISOString(),
  }).eq('id', order.id);
  if (error) { _toast('Failed to confirm.', 'error'); return; }
  await _sendMessage('Order confirmed as complete. Thank you!', null, 'system');
  _toast('Order confirmed!', 'success');
}

// ── Help modal ─────────────────────────────────────────────────────────────────
function _openHelpModal(order) {
  const modal = document.getElementById('ecHelpModal');
  const body  = document.getElementById('ecHelpBody');
  const title = document.getElementById('ecHelpTitle');

  const options = _profile.role === 'booster'
    ? [
        { label: 'Upload Proof',    action: () => { modal.classList.add('ec-hidden'); document.getElementById('ecProofModal').classList.remove('ec-hidden'); } },
        { label: 'Mark Complete',   action: () => _confirmBoosterComplete(order) },
        { label: 'Report Issue',    action: () => _fileDispute(order, 'Booster reported issue.') },
      ]
    : [
        { label: 'Refund Request',          action: () => _fileDispute(order, 'Customer requested refund.') },
        { label: 'Change Booster',           action: () => _fileDispute(order, 'Customer requested booster change.') },
        { label: 'Report Issue',             action: () => _fileDispute(order, 'Customer reported issue.') },
        { label: 'Request ETA Update',       action: () => _sendMessage('Please provide an ETA update.', null, 'user') },
        { label: 'Mark as Urgent',           action: () => _sendMessage('🚨 This order is marked as urgent.', null, 'system') },
        { label: 'Report External Payment', action: () => _fileDispute(order, 'Potential external payment request reported.') },
      ];

  title.textContent = 'How can we help?';
  body.innerHTML = options.map((o, i) =>
    `<button class="ec-help-opt" data-idx="${i}" type="button">${o.label}</button>`
  ).join('');

  body.querySelectorAll('[data-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.add('ec-hidden');
      options[parseInt(btn.dataset.idx)].action();
    });
  });

  modal.classList.remove('ec-hidden');
}

async function _confirmBoosterComplete(order) {
  await _sb.from('orders').update({ status: 'proof_submitted' }).eq('id', order.id);
  await _sendMessage('Booster marked order as complete. Awaiting customer confirmation.', null, 'system');
  _toast('Marked as complete — waiting for customer.', 'success');
}

async function _fileDispute(order, reason) {
  await _sb.from('orders').update({ status: 'disputed' }).eq('id', order.id);
  await _sendMessage(reason, null, 'case');
  _toast('Dispute filed.', 'warn');
}

// ── Offline queue ──────────────────────────────────────────────────────────────
function _loadQueue() {
  try {
    _offlineQueue = JSON.parse(localStorage.getItem('ec_queue') || '[]');
  } catch (_) { _offlineQueue = []; }
  _flushQueue();
}

function _enqueueOffline(payload) {
  _offlineQueue.push(payload);
  try { localStorage.setItem('ec_queue', JSON.stringify(_offlineQueue)); } catch (_) {}
}

async function _flushQueue() {
  if (!_offlineQueue.length) return;
  const queue = [..._offlineQueue];
  _offlineQueue = [];
  localStorage.removeItem('ec_queue');
  for (const p of queue) {
    await _sb.from('messages').insert(p).then(({ error }) => {
      if (error && error.code !== '23505') _enqueueOffline(p);
    });
  }
}

// ── Zoom modal ─────────────────────────────────────────────────────────────────
function _openZoom(url, label) {
  const modal = document.getElementById('ecZoomModal');
  const media = document.getElementById('ecZoomMedia');
  const meta  = document.getElementById('ecZoomMeta');
  const isVideo = url?.match(/\.(mp4|webm)(\?|$)/i);
  media.innerHTML = isVideo
    ? `<video src="${_esc(url)}" controls autoplay muted playsinline></video>`
    : `<img src="${_esc(url)}" alt="${_esc(label)}">`;
  meta.textContent = label || '';
  modal.classList.remove('ec-hidden');
}

// ── Toasts ─────────────────────────────────────────────────────────────────────
function _toast(msg, type = 'info') {
  const container = document.getElementById('ecToasts');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `ec-toast ec-toast--${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.classList.add('is-visible'), 10);
  setTimeout(() => { t.classList.remove('is-visible'); setTimeout(() => t.remove(), 300); }, 4000);
}

// ── Wire UI ────────────────────────────────────────────────────────────────────
function _wireUI() {
  // Filters
  document.getElementById('ecFilters')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    document.querySelectorAll('.ec-filter').forEach(b => b.classList.toggle('is-active', b === btn));
    _filterMode = btn.dataset.filter;
    renderConvoList();
  });

  // Search
  document.getElementById('ecSearch')?.addEventListener('input', e => {
    _searchQ = e.target.value.trim();
    renderConvoList();
  });

  // Composer
  const form  = document.getElementById('ecComposer');
  const input = document.getElementById('ecInput');

  input?.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 140) + 'px';
    const warn = document.getElementById('ecFlagWarn');
    if (PAYMENT_RX.test(input.value)) warn.classList.remove('ec-hidden');
    else warn.classList.add('ec-hidden');
  });

  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form?.requestSubmit(); }
  });

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    input.value = '';
    input.style.height = 'auto';
    document.getElementById('ecFlagWarn')?.classList.add('ec-hidden');
    await _sendMessage(val);
    _flushQueue();
  });

  // Attach image
  document.getElementById('ecImgBtn')?.addEventListener('click', () => {
    document.getElementById('ecFileInput')?.click();
  });
  document.getElementById('ecFileInput')?.addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    // Upload to booster-proofs bucket, share as image message
    const ext  = file.name.split('.').pop();
    const path = `${_user.id}/chat-imgs/${Date.now()}.${ext}`;
    const { data, error } = await _sb.storage.from(PROOF_BUCKET).upload(path, file, { upsert: true });
    if (error) { _toast('Image upload failed.', 'error'); return; }
    const { data: urlData } = _sb.storage.from(PROOF_BUCKET).getPublicUrl(data.path);
    await _sendMessage(null, urlData.publicUrl, 'user');
  });

  // Proof modal
  document.getElementById('ecProofBtn')?.addEventListener('click', () => {
    document.getElementById('ecProofModal').classList.remove('ec-hidden');
  });
  document.getElementById('ecProofClose')?.addEventListener('click', () => {
    document.getElementById('ecProofModal').classList.add('ec-hidden');
  });
  document.getElementById('ecProofCancel')?.addEventListener('click', () => {
    document.getElementById('ecProofModal').classList.add('ec-hidden');
  });

  const drop    = document.getElementById('ecProofDrop');
  const proofIn = document.getElementById('ecProofInput');
  let _proofFile = null;

  drop?.addEventListener('click', () => proofIn?.click());
  drop?.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('is-drag'); });
  drop?.addEventListener('dragleave', () => drop.classList.remove('is-drag'));
  drop?.addEventListener('drop', e => {
    e.preventDefault(); drop.classList.remove('is-drag');
    const f = e.dataTransfer.files?.[0];
    if (f) _setProofFile(f);
  });
  proofIn?.addEventListener('change', e => {
    if (e.target.files?.[0]) _setProofFile(e.target.files[0]);
  });

  function _setProofFile(f) {
    _proofFile = f;
    const prev = document.getElementById('ecProofPreview');
    prev.classList.remove('ec-hidden');
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      prev.innerHTML = `<img src="${url}" alt="Preview">`;
    } else {
      prev.innerHTML = `<span>${_esc(f.name)}</span>`;
    }
    document.getElementById('ecProofSubmit').disabled = false;
  }

  document.getElementById('ecProofSubmit')?.addEventListener('click', async () => {
    if (_proofFile) await handleProofUpload(_proofFile);
    _proofFile = null;
    document.getElementById('ecProofPreview').classList.add('ec-hidden');
    document.getElementById('ecProofSubmit').disabled = true;
  });

  // Zoom modal close
  document.getElementById('ecZoomClose')?.addEventListener('click', () => {
    document.getElementById('ecZoomModal').classList.add('ec-hidden');
  });
  document.getElementById('ecZoomModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('ecZoomModal')) {
      document.getElementById('ecZoomModal').classList.add('ec-hidden');
    }
  });

  // Help modal close
  document.getElementById('ecHelpClose')?.addEventListener('click', () => {
    document.getElementById('ecHelpModal').classList.add('ec-hidden');
  });
  document.getElementById('ecHelpModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('ecHelpModal')) {
      document.getElementById('ecHelpModal').classList.add('ec-hidden');
    }
  });

  // Canned replies
  document.getElementById('ecCannedBtn')?.addEventListener('click', e => {
    const menu = document.getElementById('ecCannedMenu');
    menu.classList.toggle('ec-hidden');
    if (!menu.classList.contains('ec-hidden')) {
      menu.innerHTML = CANNED.map((c, i) =>
        `<div class="ec-canned-item" data-idx="${i}" role="menuitem" tabindex="0">${_esc(c)}</div>`
      ).join('');
      menu.querySelectorAll('[data-idx]').forEach(el => {
        el.addEventListener('click', () => {
          const inp = document.getElementById('ecInput');
          if (inp) { inp.value = CANNED[parseInt(el.dataset.idx)]; inp.focus(); }
          menu.classList.add('ec-hidden');
        });
      });
    }
  });

  // Mobile back
  document.getElementById('ecMobBack')?.addEventListener('click', () => {
    document.getElementById('ecConv').classList.add('ec-hidden');
    document.getElementById('ecRight').classList.add('ec-hidden');
    document.getElementById('ecLeft').classList.remove('ec-mob-hidden');
    document.getElementById('ecMobBack').classList.add('ec-hidden');
    document.getElementById('ecMobPanel').classList.add('ec-hidden');
  });

  // Mobile panel toggle
  document.getElementById('ecMobPanel')?.addEventListener('click', () => {
    document.getElementById('ecRight').classList.toggle('ec-hidden');
  });

  // Escape closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      ['ecProofModal','ecZoomModal','ecHelpModal'].forEach(id => {
        document.getElementById(id)?.classList.add('ec-hidden');
      });
      document.getElementById('ecCannedMenu')?.classList.add('ec-hidden');
    }
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function _scrollBottom() {
  const t = document.getElementById('ecMessages');
  if (t) t.scrollTop = t.scrollHeight;
}

function _esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function _relTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function _etaLabel(minutes, pickedAt) {
  if (!pickedAt) return `ETA ${minutes}m`;
  const elapsed = Math.floor((Date.now() - new Date(pickedAt).getTime()) / 60000);
  const left = minutes - elapsed;
  if (left <= 0) return 'ETA overdue';
  return `ETA ${left}m`;
}

function _gameClass(game) {
  if (!game) return 'ec-game-default';
  const g = game.toLowerCase();
  if (g.includes('arc')) return 'ec-game-arc';
  if (g.includes('valorant') || g.includes('val')) return 'ec-game-val';
  return 'ec-game-default';
}

function _statusLabel(s) {
  const map = {
    pending:          'Pending',
    active:           'Active',
    proof_submitted:  'Proof Submitted',
    completed:        'Completed',
    disputed:         'Disputed',
    'Pending':        'Pending',
    'In Progress':    'In Progress',
    'Completed':      'Completed',
    'Cancelled':      'Cancelled',
  };
  return map[s] || s;
}
