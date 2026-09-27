import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() }, { auth: false });
      setSent(true);
    } catch (err) { toast.err(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="auth">
      <div className="card auth-card">
        <div className="auth-logo">M</div>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>📧</div>
            <h2>Check your <span className="gradient-text">email</span></h2>
            <p className="muted" style={{ margin: '10px 0 22px', fontSize: '.9rem', lineHeight: 1.6 }}>
              If <b style={{ color: 'var(--text)' }}>{email}</b> is registered, we've sent a password reset link. It's valid for 1 hour.
            </p>
            <Link className="btn primary block" to="/login">Back to Sign In</Link>
          </div>
        ) : (
          <>
            <h2 style={{ textAlign: 'center' }}>Forgot <span className="gradient-text">password?</span></h2>
            <p className="muted" style={{ textAlign: 'center', marginTop: 6, marginBottom: 22, fontSize: '.9rem' }}>
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={submit}>
              <div className="field">
                <label>Email</label>
                <input className="input" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <button className="btn primary block" disabled={busy}>
                {busy ? <span className="spinner" /> : 'Send Reset Link'}
              </button>
            </form>
            <p className="muted" style={{ textAlign: 'center', marginTop: 18, fontSize: '.9rem' }}>
              Remembered it? <Link to="/login" className="gradient-text" style={{ fontWeight: 600 }}>Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
