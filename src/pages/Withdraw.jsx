import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Loader, Empty, Badge, money } from '../components/ui';

export default function Withdraw() {
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState(undefined); // undefined = loading
  const [items, setItems] = useState(null);
  const [cfg, setCfg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [dash, list, settings] = await Promise.all([api.get('/me/dashboard'), api.get('/withdrawals'), api.get('/settings')]);
    setWallet(dash.wallet);
    setWalletAddress(dash.wallet_address || null);
    setItems(list.items);
    setCfg(settings);
  }
  useEffect(() => { load().catch((e) => toast.err(e.message)); }, []);

  const CHARGE_PCT = cfg?.withdraw_charge ?? 6;
  const CHARGE = CHARGE_PCT / 100;
  const MIN = cfg?.min_withdraw ?? 50;
  const amt = Number(amount) || 0;
  const charge = +(amt * CHARGE).toFixed(2);
  const net = +(amt - charge).toFixed(2);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/withdrawals', { amount: amt });
      toast.ok(`Requested ${money(res.amount)} · you receive ${money(res.net_amount)}`);
      setAmount('');
      await load();
    } catch (err) { toast.err(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="cols-2 even">
      {/* Blocking modal when no withdrawal address is set */}
      {walletAddress === null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ maxWidth: 360, width: '100%', textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>⚠</div>
            <div className="card-title" style={{ marginBottom: 8 }}>No Withdrawal Address</div>
            <p className="muted" style={{ fontSize: '.88rem', marginBottom: 24, lineHeight: 1.6 }}>
              You need to save a TRC-20 USDT wallet address on your profile before requesting a withdrawal.
            </p>
            <Link className="btn primary block" to="/app/profile?focus=wallet">
              Add Withdrawal Address
            </Link>
          </div>
        </div>
      )}

      <div className="card" style={{ alignSelf: 'start' }}>
        <div className="card-title" style={{ marginBottom: 12 }}>Request Withdrawal</div>
        <div className="between" style={{ marginBottom: 16 }}>
          <span className="muted" style={{ fontSize: '.85rem' }}>Available</span>
          <span className="mono gradient-text" style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.3rem' }}>{money(wallet?.balance)}</span>
        </div>
        <form onSubmit={submit}>
          <div className="field">
            <label>Amount (USDT)</label>
            <input className="input mono" type="number" min={MIN} step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`min ${MIN}`} />
          </div>
          <div className="card tight" style={{ background: 'rgba(6,10,22,.5)', marginBottom: 16 }}>
            <div className="between" style={{ fontSize: '.88rem', marginBottom: 6 }}><span className="muted">Withdrawal charge ({CHARGE_PCT}%)</span><span className="mono">{money(charge)}</span></div>
            <div className="between" style={{ fontSize: '.95rem', fontWeight: 600 }}><span>You receive</span><span className="mono gradient-text">{money(net > 0 ? net : 0)}</span></div>
          </div>
          <button className="btn primary block" disabled={busy || amt < MIN}>
            {busy ? <span className="spinner" /> : 'Request Withdrawal'}
          </button>
          <p className="muted" style={{ fontSize: '.8rem', marginTop: 10 }}>
            Set your TRC-20 wallet address in <Link className="gradient-text" to="/app/profile">Profile</Link> first. Minimum {money(MIN)}. Payout is instant after admin approval.
          </p>
        </form>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 14 }}>Withdrawal History</div>
        {!items ? <Loader /> : items.length === 0 ? <Empty>No withdrawals yet.</Empty> : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>#</th><th>Amount</th><th>Charge</th><th>Net</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {items.map((w) => (
                  <tr key={w.id}>
                    <td className="mono">{w.id}</td>
                    <td className="mono">{money(w.amount)}</td>
                    <td className="mono muted">{money(w.charge)}</td>
                    <td className="mono">{money(w.net_amount)}</td>
                    <td><Badge status={w.status} /></td>
                    <td className="muted">{new Date(w.requested_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
