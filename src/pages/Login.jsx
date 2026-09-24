import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(email.trim(), password);
      toast.ok(`Welcome back, ${u.name}`);
      nav(u.role === 'admin' ? '/admin/deposits' : '/app/dashboard', { replace: true });
    } catch (err) {
      toast.err(err.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="auth">
      <div className="card auth-card">
        <div className="auth-logo">M</div>
        <h2 style={{ textAlign: 'center' }}>Sign in to <span className="gradient-text">MAEX Trade</span></h2>
        <p className="muted" style={{ textAlign: 'center', marginTop: 6, marginBottom: 22, fontSize: '.9rem' }}>
          Access your investment dashboard
        </p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="btn primary block" disabled={busy}>
            {busy ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: 18, fontSize: '.9rem' }}>
          New here? <Link to="/register" className="gradient-text" style={{ fontWeight: 600 }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
