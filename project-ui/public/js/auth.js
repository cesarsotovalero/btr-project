/**
 * BTR — Authentication module
 * Manages JWT tokens, user state, login/register API calls.
 * Must load BEFORE api.js.
 */
const Auth = (() => {
  const TOKEN_KEY = 'btr-token';
  const USER_KEY  = 'btr-user';

  /* ---- Token helpers ---- */
  function getToken()  { return localStorage.getItem(TOKEN_KEY); }
  function getUser()   {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
  }
  function isLoggedIn() { return !!getToken(); }

  function _save(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.hash = '#/login';
  }

  /* ---- API calls (raw fetch — API module not available yet) ---- */
  async function login(username, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();

    // Fetch full user profile
    const me = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const user = await me.json();
    _save(data.access_token, user);
    return user;
  }

  async function register(username, email, password, fullName) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        email,
        password,
        full_name: fullName,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();

    // Fetch full user profile
    const me = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const user = await me.json();
    _save(data.access_token, user);
    return user;
  }

  async function updateProfile(updates) {
    const token = getToken();
    const res = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Update failed');
    }
    const user = await res.json();
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }

  /** Redirect to login if not authenticated */
  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.hash = '#/login';
      return false;
    }
    return true;
  }

  return { getToken, getUser, isLoggedIn, login, register, logout, updateProfile, requireAuth };
})();
