import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, getToken } from '../api/client';

const AuthCtx = createContext(null);
const USER_KEY = 'maex_user';

function loadUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
}
function saveUser(u) {
  try { u ? localStorage.setItem(USER_KEY, JSON.stringify(u)) : localStorage.removeItem(USER_KEY); } catch { /* ignore */ }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const [ready, setReady] = useState(true);

  useEffect(() => { if (!getToken()) setUser(null); }, []);

  function setSession(token, u) {
    setToken(token); saveUser(u); setUser(u);
    return u;
  }
  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password }, { auth: false });
    return setSession(res.token, res.user);
  }
  // Registration no longer logs in — the account must verify its email first.
  // Returns the API response ({ verifyRequired, email, message }).
  async function register(payload, sponsorId) {
    const q = sponsorId ? `?ref=${encodeURIComponent(sponsorId)}` : '';
    return api.post(`/auth/register${q}`, payload, { auth: false });
  }
  function logout() { setToken(null); saveUser(null); setUser(null); }

  return (
    <AuthCtx.Provider value={{ user, ready, login, register, logout, setSession, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
