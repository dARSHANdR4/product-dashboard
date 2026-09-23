// lib/auth.ts
// Token storage: in-memory (primary) + sessionStorage (tab-reload persistence)
// Tradeoff: localStorage survives longer but is XSS-vulnerable.
// sessionStorage is scoped to the tab/session — safer than localStorage.
// httpOnly cookies require a server-side proxy, impossible with direct DummyJSON calls.

const TOKEN_KEY = 'pd_auth_token';
const USER_KEY = 'pd_auth_user';

// Module-level variable — primary store (cleared on page reload)
let _token: string | null = null;
let _user: string | null = null;

export function setToken(token: string): void {
  _token = token;
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // sessionStorage may be unavailable in private mode
  }
}

export function getToken(): string | null {
  if (_token) return _token;
  try {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (stored) {
      _token = stored; // re-hydrate memory
      return stored;
    }
  } catch {
    // ignore
  }
  return null;
}

export function clearToken(): void {
  _token = null;
  _user = null;
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

export function setUser(user: object): void {
  const str = JSON.stringify(user);
  _user = str;
  try {
    sessionStorage.setItem(USER_KEY, str);
  } catch {
    // ignore
  }
}

export function getUser<T>(): T | null {
  const source = _user ?? (() => {
    try { return sessionStorage.getItem(USER_KEY); } catch { return null; }
  })();
  if (!source) return null;
  try {
    return JSON.parse(source) as T;
  } catch {
    return null;
  }
}
