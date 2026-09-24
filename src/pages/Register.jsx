import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    sponsorId: params.get('ref') || '',
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { name, email, password, phone, sponsorId } = form;
      const rawSponsor = sponsorId ? sponsorId.replace(/^MAEX/i, '') : undefined;
      await register({ name, email: email.trim(), password, phone }, rawSponsor || undefined);
      toast.ok('Account created');
      nav('/app/dashboard', { replace: true });
    } catch (err) {
      toast.err(err.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="auth">
      <div className="card auth-card">
        <div className="auth-logo">M</div>
        <h2 style={{ textAlign: 'center' }}>Join <span className="gradient-text">MAEX Trade</span></h2>
        <p className="muted" style={{ textAlign: 'center', marginTop: 6, marginBottom: 22, fontSize: '.9rem' }}>
          Create your account to get started
        </p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Full name</label>
            <input className="input" required value={form.name} onChange={set('name')} placeholder="Jane Doe" />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </div>
          <div className="row" style={{ gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Password</label>
              <input className="input" type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="min 6 chars" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Phone <span className="muted">(optional)</span></label>
              <input className="input" value={form.phone} onChange={set('phone')} placeholder="+1..." />
            </div>
          </div>
          <div className="field">
            <label>Sponsor ID <span className="muted">(optional)</span></label>
            <input
              className="input"
              value={form.sponsorId}
              onChange={set('sponsorId')}
              placeholder="referrer's member ID"
              readOnly={!!params.get('ref')}
              style={params.get('ref') ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            />
          </div>
          <button className="btn primary block" disabled={busy}>
            {busy ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: 18, fontSize: '.9rem' }}>
          Already have an account? <Link to="/login" className="gradient-text" style={{ fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
