import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function AdminSetup() {
  const toast = useToast();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', setup_key: '' });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/auth/create-admin', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        setup_key: form.setup_key,
      }, { auth: false });
      toast.ok(`Admin created: ${res.user.email}`);
      nav('/login', { replace: true });
    } catch (err) {
      toast.err(err.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="auth">
      <div className="card auth-card">
        <div className="auth-logo">M</div>
        <h2 style={{ textAlign: 'center' }}>Create <span className="gradient-text">Admin</span></h2>
        <p className="muted" style={{ textAlign: 'center', marginTop: 6, marginBottom: 22, fontSize: '.9rem' }}>
          Restricted — requires the setup key
        </p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Name</label>
            <input className="input" required value={form.name}
              onChange={set('name')} placeholder="Admin name" />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required value={form.email}
              onChange={set('email')} placeholder="admin@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" required minLength={6} value={form.password}
              onChange={set('password')} placeholder="••••••••" />
          </div>
          <div className="field">
            <label>Setup key</label>
            <input className="input mono" type="password" required value={form.setup_key}
              onChange={set('setup_key')} placeholder="secret setup key from .env" />
          </div>
          <button className="btn primary block" disabled={busy}>
            {busy ? <span className="spinner" /> : 'Create Admin'}
          </button>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: 18, fontSize: '.9rem' }}>
          <Link to="/login" className="gradient-text" style={{ fontWeight: 600 }}>Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
