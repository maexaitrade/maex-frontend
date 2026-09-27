import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register, setSession } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    sponsorId: params.get('ref') || '',
  });
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function requestOtp(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { name, email, password, phone, sponsorId } = form;
      const rawSponsor = sponsorId ? sponsorId.replace(/^MAEX/i, '') : undefined;
      await register({ name, email: email.trim(), password, phone }, rawSponsor || undefined);
      toast.ok('Verification code sent to your email');
      setStep('otp');
    } catch (err) {
      toast.err(err.message);
    } finally { setBusy(false); }
  }

  async function verify(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/auth/verify-otp', { email: form.email.trim(), otp: otp.trim() }, { auth: false });
      setSession(res.token, res.user);
      toast.ok(`Welcome, ${res.user.name}!`);
      nav('/app/dashboard', { replace: true });
    } catch (err) {
      toast.err(err.message);
    } finally { setBusy(false); }
  }

  async function resend() {
    try {
      await api.post('/auth/resend-otp', { email: form.email.trim() }, { auth: false });
      toast.ok('A new code has been sent');
    } catch (err) { toast.err(err.message); }
  }

  return (
    <div className="auth">
      <div className="card auth-card">
        <div className="auth-logo">M</div>

        {step === 'form' ? (
          <>
            <h2 style={{ textAlign: 'center' }}>Join <span className="gradient-text">MAEX Trade</span></h2>
            <p className="muted" style={{ textAlign: 'center', marginTop: 6, marginBottom: 22, fontSize: '.9rem' }}>
              Create your account to get started
            </p>
            <form onSubmit={requestOtp}>
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
          </>
        ) : (
          <>
            <h2 style={{ textAlign: 'center' }}>Verify your <span className="gradient-text">email</span></h2>
            <p className="muted" style={{ textAlign: 'center', marginTop: 6, marginBottom: 22, fontSize: '.9rem', lineHeight: 1.6 }}>
              We sent a 6-digit code to<br /><b style={{ color: 'var(--text)' }}>{form.email}</b>
            </p>
            <form onSubmit={verify}>
              <div className="field">
                <label>Verification code</label>
                <input
                  className="input mono"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.3rem' }}
                  autoFocus
                />
              </div>
              <button className="btn primary block" disabled={busy || otp.length !== 6}>
                {busy ? <span className="spinner" /> : 'Verify & Create Account'}
              </button>
            </form>
            <p className="muted" style={{ textAlign: 'center', marginTop: 16, fontSize: '.85rem' }}>
              Didn't get it? <button type="button" onClick={resend} className="linklike gradient-text" style={{ fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Resend code</button>
            </p>
            <p className="muted" style={{ textAlign: 'center', marginTop: 8, fontSize: '.85rem' }}>
              <button type="button" onClick={() => { setStep('form'); setOtp(''); }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0 }}>← Change details</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
