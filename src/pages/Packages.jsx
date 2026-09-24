import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Loader, money } from '../components/ui';

export default function Packages() {
  const toast = useToast();
  const [packages, setPackages] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const [pkgs, dash] = await Promise.all([api.get('/packages'), api.get('/me/dashboard')]);
    setPackages(pkgs.items);
    setWallet(dash.wallet);
  }
  useEffect(() => { load().catch((e) => toast.err(e.message)); }, []);

  async function buy(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/packages/buy', { amount: Number(amount) });
      if (res.topUp) {
        const msg = res.tierChanged
          ? `Upgraded to ${res.package}! · Total ${money(res.amount)} (cap ${money(res.cap_amount)})`
          : `Top-up added · Active package now ${money(res.amount)} (cap ${money(res.cap_amount)})`;
        toast.ok(msg);
      } else {
        toast.ok(`Activated ${res.package} · ${money(res.amount)} (cap ${money(res.cap_amount)})`);
      }
      setAmount('');
      await load();
    } catch (err) { toast.err(err.message); }
    finally { setBusy(false); }
  }

  if (!packages) return <Loader />;

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card">
        <div className="between wrap">
          <div>
            <div className="card-title">Available Balance</div>
            <div className="value gradient-text" style={{ fontFamily: 'var(--font-head)', fontSize: '1.7rem', fontWeight: 700, marginTop: 6 }}>
              {money(wallet?.balance)}
            </div>
          </div>
          <div className="muted" style={{ fontSize: '.85rem', maxWidth: 320 }}>
            Add to your active package anytime — amounts accumulate. ROI starts the <b style={{ color: 'var(--text)' }}>next day</b> on the total. Earns up to <b style={{ color: 'var(--text)' }}>2× its value</b>, then repurchase. Auto-upgrades tier when total crosses the threshold.
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {packages.map((p) => (
          <div key={p.id} className="card" style={{ borderColor: 'var(--border-strong)' }}>
            <div className="between">
              <h3>{p.name}</h3>
              <span className="badge cyan">{p.daily_roi_percent}% / day</span>
            </div>
            <div className="muted" style={{ margin: '14px 0', fontSize: '.9rem' }}>
              Range: {money(p.min_amount)} – {p.max_amount ? money(p.max_amount) : '∞'}
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)', fontSize: '.88rem', lineHeight: 1.9 }}>
              <li><b style={{ color: 'var(--text)' }}>{p.daily_roi_percent}%</b> daily return</li>
              <li>2× earning cap</li>
              <li>Referral + rank eligible</li>
            </ul>
            <button className="btn ghost sm block" style={{ marginTop: 16 }}
              onClick={() => setAmount(String(p.min_amount))}>
              Select {p.name}
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 14 }}>Purchase a Package</div>
        <form onSubmit={buy} className="row wrap" style={{ alignItems: 'flex-end', gap: 14 }}>
          <div className="field" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
            <label>Amount (USDT)</label>
            <input className="input mono" type="number" min="1" step="0.01" required
              value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 1000" />
          </div>
          <button className="btn primary" disabled={busy} style={{ minWidth: 150 }}>
            {busy ? <span className="spinner" /> : 'Buy Package'}
          </button>
        </form>
        <div className="muted" style={{ fontSize: '.82rem', marginTop: 10 }}>
          The matching package tier is chosen automatically from your amount.
        </div>
      </div>
    </div>
  );
}
