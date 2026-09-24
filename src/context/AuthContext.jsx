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

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password }, { auth: false });
    setToken(res.token); saveUser(res.user); setUser(res.user);
    return res.user;
  }
  async function register(payload, sponsorId) {
    const q = sponsorId ? `?ref=${encodeURIComponent(sponsorId)}` : '';
    const res = await api.post(`/auth/register${q}`, payload, { auth: false });
    setToken(res.token); saveUser(res.user); setUser(res.user);
    return res.user;
  }
  function logout() { setToken(null); saveUser(null); setUser(null); }

  return (
    <AuthCtx.Provider value={{ user, ready, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
