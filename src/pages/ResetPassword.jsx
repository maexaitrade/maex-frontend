import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function ResetPassword() {
  const toast = useToast();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (password !== confirm) return toast.err('Passwords do not match');
    if (password.length < 6) return toast.err('Password must be at least 6 characters');
    setBusy(true);
    try {
      await api.post('/auth/reset-password', { token, password }, { auth: false });
      toast.ok('Password updated — please sign in');
      nav('/login', { replace: true });
    } catch (err) { toast.err(err.message); }
    finally { setBusy(false); }
  }

  if (!token) {
    return (
      <div className="auth">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo">M</div>
          <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>⚠️</div>
          <h2>Invalid reset link</h2>
          <p className="muted" style={{ margin: '8px 0 20px', fontSize: '.9rem' }}>This link is missing its token. Request a new one.</p>
          <Link className="btn primary block" to="/forgot-password">Request New Link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <div className="card auth-card">
        <div className="auth-logo">M</div>
        <h2 style={{ textAlign: 'center' }}>Set a new <span className="gradient-text">password</span></h2>
        <p className="muted" style={{ textAlign: 'center', marginTop: 6, marginBottom: 22, fontSize: '.9rem' }}>
          Choose a strong password for your account.
        </p>
        <form onSubmit={submit}>
          <div className="field">
            <label>New password</label>
            <input className="input" type="password" required minLength={6} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="min 6 chars" />
          </div>
          <div className="field">
            <label>Confirm password</label>
            <input className="input" type="password" required value={confirm}
              onChange={(e) => setConfirm(e.target.value)} placeholder="repeat password" />
          </div>
          <button className="btn primary block" disabled={busy}>
            {busy ? <span className="spinner" /> : 'Update Password'}
          </button>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: 18, fontSize: '.9rem' }}>
          <Link to="/login" className="gradient-text" style={{ fontWeight: 600 }}>Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
