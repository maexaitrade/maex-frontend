import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const inputRef = useRef(null);

  const [currentAddr, setCurrentAddr] = useState(null);
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api.get('/me/dashboard').then((d) => {
      const addr = d.wallet_address || null;
      setCurrentAddr(addr);
      if (addr) setInputVal(addr);
      setLoading(false);
    }).catch((e) => { toast.err(e.message); setLoading(false); });
  }, []);

  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(location.search);
    if (params.get('focus') === 'wallet') {
      setEditing(true);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    }
  }, [location.search, loading]);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.patch('/me/profile', { wallet_address: inputVal.trim() });
      setCurrentAddr(res.wallet_address);
      setEditing(false);
      toast.ok('Wallet address saved');
    } catch (err) { toast.err(err.message); }
    finally { setBusy(false); }
  }

  async function remove() {
    setBusy(true);
    try {
      await api.delete('/me/profile/wallet');
      setCurrentAddr(null);
      setInputVal('');
      setEditing(false);
      setConfirmDelete(false);
      toast.ok('Wallet address removed');
    } catch (err) { toast.err(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
      <div className="card">
        <div className="card-title" style={{ marginBottom: 18 }}>Account</div>
        <div className="row" style={{ gap: 16, marginBottom: 20 }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.4rem' }}>{(user?.name || 'U')[0]}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 600 }}>{user?.name}</div>
            <div className="muted">{user?.email}</div>
          </div>
        </div>
        <div className="grid" style={{ gap: 10 }}>
          <div className="between"><span className="muted">Member ID</span><span className="mono">MAEX{user?.id}</span></div>
          <div className="between"><span className="muted">Role</span><span className="badge cyan">{user?.role}</span></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 6 }}>Payout Wallet (TRC-20)</div>
        <p className="muted" style={{ fontSize: '.85rem', marginTop: 0, marginBottom: 18 }}>
          Withdrawals are sent to this Tron TRC-20 USDT address. Only one address can be saved at a time.
        </p>

        {loading ? (
          <div className="muted" style={{ fontSize: '.85rem' }}>Loading...</div>
        ) : currentAddr && !editing ? (
          <div>
            <div className="card tight" style={{ background: 'rgba(52,211,153,.07)', border: '1px solid rgba(52,211,153,.25)', marginBottom: 14 }}>
              <div className="muted" style={{ fontSize: '.75rem', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Saved address</div>
              <div className="mono" style={{ color: 'var(--green)', wordBreak: 'break-all', fontSize: '.88rem' }}>{currentAddr}</div>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn sm" style={{ flex: 1 }} onClick={() => { setEditing(true); setInputVal(currentAddr); }} disabled={busy}>
                Edit
              </button>
              <button className="btn sm" style={{ flex: 1, borderColor: 'rgba(239,68,68,.4)', color: '#ef4444' }} onClick={() => setConfirmDelete(true)} disabled={busy}>
                Delete
              </button>
            </div>

            {confirmDelete && (
              <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 10, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)' }}>
                <div style={{ fontSize: '.88rem', fontWeight: 600, marginBottom: 4 }}>Remove withdrawal address?</div>
                <div className="muted" style={{ fontSize: '.8rem', marginBottom: 14 }}>You won't be able to withdraw until you add a new one.</div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn sm" style={{ flex: 1 }} onClick={() => setConfirmDelete(false)} disabled={busy}>Cancel</button>
                  <button className="btn sm" style={{ flex: 1, background: 'rgba(239,68,68,.15)', borderColor: 'rgba(239,68,68,.4)', color: '#ef4444' }} onClick={remove} disabled={busy}>
                    {busy ? <span className="spinner" /> : 'Yes, remove'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={save}>
            <div className="field">
              <label>TRC-20 Wallet Address</label>
              <input
                ref={inputRef}
                className="input mono"
                required
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="T..."
                autoComplete="off"
              />
            </div>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn primary" style={{ flex: 1 }} disabled={busy}>
                {busy ? <span className="spinner" /> : 'Save Address'}
              </button>
              {currentAddr && (
                <button type="button" className="btn sm" style={{ flex: 1 }} onClick={() => setEditing(false)} disabled={busy}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
