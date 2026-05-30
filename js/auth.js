/**
 * Elysium Boost — Supabase Auth Module
 * Stack: Vanilla JS, Static Site, GitHub Pages
 * Providers: Google, Apple, Discord, Email/Password
 */

const SUPABASE_URL      = 'https://ylaxzlejhzgakhtfmsbt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hjqgJX_RSpeypqtjJDk4xQ_pPGSnWAT';
const REDIRECT_ORIGIN   = 'https://elysiumboost.com';

const { createClient } = supabase;
const _sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
});

let _currentUser = null;

_sb.auth.onAuthStateChange((event, session) => {
  _currentUser = session?.user ?? null;
  if (window.location.hash.includes('access_token')) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  window.dispatchEvent(new CustomEvent('eb:authChange', { detail: { event, user: _currentUser, session } }));
  _updateNavUI(_currentUser);
});

async function ebAuthGoogle() {
  const { error } = await _sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: REDIRECT_ORIGIN, queryParams: { access_type: 'offline', prompt: 'consent' } },
  });
  if (error) _showAuthError(error.message);
}

async function ebAuthApple() {
  const { error } = await _sb.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: REDIRECT_ORIGIN },
  });
  if (error) _showAuthError(error.message);
}

async function ebAuthDiscord() {
  const { error } = await _sb.auth.signInWithOAuth({
    provider: 'discord',
    options: { redirectTo: REDIRECT_ORIGIN },
  });
  if (error) _showAuthError(error.message);
}

async function ebAuthEmailSignIn(email, password) {
  const btn = document.getElementById('ebEmailCta');
  _setLoading(btn, true, 'Signing in…');
  const { data, error } = await _sb.auth.signInWithPassword({ email, password });
  _setLoading(btn, false, 'Enter the Realm');
  if (error) { _showAuthError(error.message, 'ebEmailMsg'); return null; }
  ebClose();
  return data.user;
}

async function ebAuthEmailSignUp(email, password, meta = {}) {
  const btn = document.getElementById('ebSignUpCta');
  _setLoading(btn, true, 'Creating…');
  const { data, error } = await _sb.auth.signUp({
    email, password,
    options: { data: { username: meta.username || '', discord_id: meta.discord_id || '', role: 'user' }, emailRedirectTo: REDIRECT_ORIGIN },
  });
  _setLoading(btn, false, 'Join the Realm');
  if (error) { _showAuthError(error.message, 'ebSignUpMsg'); return null; }
  if (data.user && data.user.identities?.length === 0) { _showAuthSuccess('Account already exists — try signing in.', 'ebSignUpMsg'); return null; }
  _showAuthSuccess('Check your email to confirm your account.', 'ebSignUpMsg');
  return data.user;
}

async function ebForgotPassword(email, msgId) {
  msgId = msgId || 'ebEmailMsg';
  if (!email) { _showAuthError('Enter your email first.', msgId); return; }
  // Resolve against the document base so the redirect works on both the
  // custom domain and the GitHub Pages /elysium.new/ project path.
  const resetUrl = new URL('pages/reset-password.html', document.baseURI).href;
  const { error } = await _sb.auth.resetPasswordForEmail(email, { redirectTo: resetUrl });
  if (error) { _showAuthError(error.message, msgId); return; }
  _showAuthSuccess('Check your email. Reset link sent.', msgId);
}

/* localStorage helpers for cross-page nav sync (username + avatar) */
function _lsGet(k)    { try { return localStorage.getItem(k) || ''; } catch (_) { return ''; } }
function _lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
function _lsRemove(k) { try { localStorage.removeItem(k); } catch (_) {} }

async function ebSignOut() {
  _lsRemove('elysium_username');
  _lsRemove('elysium_avatar_url');
  await _sb.auth.signOut();
}
function ebGetUser() { return _currentUser; }
async function ebGetSession() { const { data } = await _sb.auth.getSession(); return data.session ?? null; }
function ebIsLoggedIn() { return _currentUser !== null; }

function _updateNavUI(user) {
  const signInBtns  = document.querySelectorAll('[data-eb-login]');
  const userMenus   = document.querySelectorAll('[data-eb-user-menu]');
  const userNames   = document.querySelectorAll('[data-eb-username]');
  const signOutBtns = document.querySelectorAll('[data-eb-signout]');
  const avatarEls   = document.querySelectorAll('[data-eb-avatar]');
  if (user) {
    const cachedName = _lsGet('elysium_username');
    const name = cachedName || user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Champion';
    const initials = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
    signInBtns.forEach(el => el.style.display = 'none');
    userMenus.forEach(el  => el.style.display = '');
    userNames.forEach(el  => el.textContent = name);
    const cachedAvatar = _lsGet('elysium_avatar_url');
    if (cachedAvatar) _applyAvatarUrl(cachedAvatar);
    avatarEls.forEach(el  => {
      if (!el.getAttribute('data-has-img')) el.textContent = initials;
    });
    signOutBtns.forEach(el=> el.style.display = '');
    _loadAvatarFromProfile(user.id);
    _loadBoosterRole(user.id);
  } else {
    signInBtns.forEach(el => el.style.display = '');
    userMenus.forEach(el  => el.style.display = 'none');
    signOutBtns.forEach(el=> el.style.display = 'none');
    _applyAvatarUrl(null);
    _applyBoosterLink(null);
    window._ebCurrentAvatarUrl = '';
    _lsRemove('elysium_username');
    _lsRemove('elysium_avatar_url');
  }
}

/* Booster Panel menu item — shown only for the 'booster' role, never for
   customers. Role is read from the profiles table, falling back to user
   metadata so a missing column never breaks the rest of nav loading. */
async function _loadBoosterRole(userId) {
  let role = null;
  try {
    const { data } = await _sb.from('profiles').select('role').eq('id', userId).maybeSingle();
    if (data && data.role) role = data.role;
  } catch (_) {}
  if (!role) role = _currentUser?.user_metadata?.role || null;
  _applyBoosterLink(role);
}

function _applyBoosterLink(role) {
  const isBooster = role === 'booster';
  document.querySelectorAll('[data-eb-user-menu] .eb-user-dropdown').forEach(function (dd) {
    const existing = dd.querySelector('.eb-user-item--booster');
    if (!isBooster) { if (existing) existing.remove(); return; }
    if (existing) return;
    // Derive the path prefix from a sibling dashboard link so the href is
    // correct from both the root page and the /pages/games/ subpages.
    const dash = dd.querySelector('a.eb-user-item[href*="dashboard.html"]');
    const prefix = dash ? (dash.getAttribute('href') || '').replace(/dashboard\.html.*$/, '') : 'pages/';
    const link = document.createElement('a');
    link.href = prefix + 'booster.html';
    link.className = 'eb-user-item eb-user-item--booster';
    link.setAttribute('role', 'menuitem');
    link.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="#e5c26b" aria-hidden="true" style="vertical-align:-1px;margin-right:5px"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>Booster Panel';
    const sep = dd.querySelector('.eb-user-separator');
    const logout = dd.querySelector('.eb-user-logout');
    if (sep) dd.insertBefore(link, sep);
    else if (logout) dd.insertBefore(link, logout);
    else dd.appendChild(link);
  });
}

function _applyAvatarUrl(url) {
  document.querySelectorAll('[data-eb-avatar]').forEach(function(el) {
    if (url) {
      el.innerHTML = '<img src="' + url + '" alt="Your avatar">';
      el.setAttribute('data-has-img', 'true');
    } else {
      el.innerHTML = '';
      el.removeAttribute('data-has-img');
    }
  });
}

async function _loadAvatarFromProfile(userId) {
  try {
    const { data } = await _sb.from('profiles').select('avatar_url, username').eq('id', userId).maybeSingle();
    if (data && data.avatar_url) {
      _applyAvatarUrl(data.avatar_url);
      window._ebCurrentAvatarUrl = data.avatar_url;
      _lsSet('elysium_avatar_url', data.avatar_url);
    }
    if (data && data.username) {
      _lsSet('elysium_username', data.username);
      document.querySelectorAll('[data-eb-username]').forEach(el => { el.textContent = data.username; });
    }
  } catch (_) {}
}

function ebOpenAvatar() {
  const modal = document.getElementById('ebAvatarModal');
  if (!modal) return;
  modal.classList.remove('eb-hidden');
  document.body.style.overflow = 'hidden';
  const current = window._ebCurrentAvatarUrl || '';
  modal.querySelectorAll('[data-av-num]').forEach(function(btn) {
    const filename = 'elysium_unique_avatar_' + btn.dataset.avNum + '.png';
    btn.classList.toggle('is-selected', current.endsWith(filename));
  });
}

function ebCloseAvatar() {
  const modal = document.getElementById('ebAvatarModal');
  if (!modal) return;
  modal.classList.add('eb-hidden');
  document.body.style.overflow = '';
}

function ebCloseAvatarOnOverlay(e) {
  if (e.target === document.getElementById('ebAvatarModal')) ebCloseAvatar();
}

async function ebSelectAvatar(num) {
  const url = 'assets/avatars/elysium_unique_avatar_' + num + '.png';
  const statusEl = document.getElementById('ebAvatarStatus');
  _applyAvatarUrl(url);
  window._ebCurrentAvatarUrl = url;
  _lsSet('elysium_avatar_url', url);
  const modal = document.getElementById('ebAvatarModal');
  if (modal) {
    modal.querySelectorAll('[data-av-num]').forEach(function(btn) {
      btn.classList.toggle('is-selected', btn.dataset.avNum === num);
    });
  }
  if (statusEl) statusEl.textContent = 'Saving…';
  const user = ebGetUser();
  if (!user) { if (statusEl) statusEl.textContent = ''; return; }
  const { error } = await _sb.from('profiles').upsert({ id: user.id, avatar_url: url }, { onConflict: 'id' });
  if (statusEl) {
    statusEl.textContent = error ? 'Failed to save.' : 'Saved!';
    setTimeout(function() { if (statusEl) statusEl.textContent = ''; }, 2000);
  }
}

function _heroVideo() { return document.querySelector('.eb-hero-video'); }

function ebOpen() {
  document.getElementById('ebModal').classList.remove('eb-hidden');
  document.body.style.overflow = 'hidden';
  const v = _heroVideo(); if (v) v.pause();
}
function safeEbOpen() {
  if (document.getElementById('ebModal')) ebOpen();
  else window.location.href = '../index.html#login';
}
function ebClose() {
  document.getElementById('ebModal').classList.add('eb-hidden');
  document.body.style.overflow = '';
  const v = _heroVideo(); if (v) v.play().catch(() => {});
}
function ebCloseOnOverlay(e) { if (e.target === document.getElementById('ebModal')) ebClose(); }

function _setLoading(btn, on, label) { if (!btn) return; btn.disabled = on; btn.textContent = label; }
function _showAuthError(msg, elId = 'ebAuthMsg') { const el = document.getElementById(elId); if (!el) return; el.textContent = msg; el.className = 'eb-msg eb-error'; }
function _showAuthSuccess(msg, elId = 'ebAuthMsg') { const el = document.getElementById(elId); if (!el) return; el.textContent = msg; el.className = 'eb-msg eb-success'; }

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-eb-login]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); ebOpen(); }));
  document.querySelectorAll('[data-eb-signout]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); ebSignOut(); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { ebClose(); ebCloseAvatar(); _closeUserMenu(); } });

  // User dropdown toggle
  const menu    = document.getElementById('ebUserMenu');
  const trigger = document.getElementById('ebUserTrigger');
  const dropdown = document.getElementById('ebUserDropdown');
  function _closeUserMenu() {
    if (!menu) return;
    menu.classList.remove('is-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (dropdown) dropdown.setAttribute('aria-hidden', 'true');
  }
  if (trigger && menu) {
    trigger.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(isOpen));
      if (dropdown) dropdown.setAttribute('aria-hidden', String(!isOpen));
    });
    document.addEventListener('click', e => {
      if (menu.classList.contains('is-open') && !menu.contains(e.target)) _closeUserMenu();
    });
  }

  // Avatar circle click — opens picker, stops dropdown from toggling
  document.querySelectorAll('[data-eb-open-avatar]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      _closeUserMenu();
      ebOpenAvatar();
    });
  });
});

window.ElysiumAuth = { getUser: ebGetUser, getSession: ebGetSession, isLoggedIn: ebIsLoggedIn, signOut: ebSignOut, signInGoogle: ebAuthGoogle, signInApple: ebAuthApple, signInDiscord: ebAuthDiscord, signIn: ebAuthEmailSignIn, signUp: ebAuthEmailSignUp, forgotPassword: ebForgotPassword, open: ebOpen, close: ebClose };
