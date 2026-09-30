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
  const [walletAddressValid, setWalletAddressValid] = useState(false);
  const [addressNoticeDismissed, setAddressNoticeDismissed] = useState(false);
  const [networkLabel, setNetworkLabel] = useState('TRC20');
  const [items, setItems] = useState(null);
  const [cfg, setCfg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [dash, list, settings] = await Promise.all([api.get('/me/dashboard'), api.get('/withdrawals'), api.get('/settings')]);
    setWallet(dash.wallet);
    setWalletAddress(dash.wallet_address || null);
    setWalletAddressValid(Boolean(dash.wallet_address_valid));
    setNetworkLabel(dash.active_crypto_network_label || dash.active_crypto_network || 'TRC20');
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
      {/* Dismissible notice when the saved address cannot be used on the active network */}
      {!addressNoticeDismissed && walletAddress !== undefined && (!walletAddress || !walletAddressValid) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ position: 'relative', maxWidth: 360, width: '100%', textAlign: 'center', padding: '32px 24px' }}>
            <button
              type="button"
              className="btn ghost"
              aria-label="Close withdrawal address notice"
              onClick={() => setAddressNoticeDismissed(true)}
              style={{ position: 'absolute', top: 8, right: 8, width: 44, height: 44, padding: 0, fontSize: '1.5rem', lineHeight: 1 }}
            >
              <span aria-hidden="true">×</span>
            </button>
            <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>⚠</div>
            <div className="card-title" style={{ marginBottom: 8 }}>{walletAddress ? 'Update Withdrawal Address' : 'No Withdrawal Address'}</div>
            <p className="muted" style={{ fontSize: '.88rem', marginBottom: 24, lineHeight: 1.6 }}>
              {walletAddress
                ? `Your saved address is not valid for the active ${networkLabel} network. Replace it before requesting a withdrawal.`
                : `Save a valid ${networkLabel} USDT wallet address on your profile before requesting a withdrawal.`}
            </p>
            <Link className="btn primary block" to="/app/profile?focus=wallet">
              {walletAddress ? `Change to ${networkLabel} Address` : 'Add Withdrawal Address'}
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
          <button className="btn primary block" disabled={busy || amt < MIN || !walletAddressValid}>
            {busy ? <span className="spinner" /> : 'Request Withdrawal'}
          </button>
          <p className="muted" style={{ fontSize: '.8rem', marginTop: 10 }}>
            Set your {networkLabel} wallet address in <Link className="gradient-text" to="/app/profile">Profile</Link> first. Minimum {money(MIN)}. Payout is instant after admin approval.
          </p>
        </form>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 14 }}>Withdrawal History</div>
        {!items ? <Loader /> : items.length === 0 ? <Empty>No withdrawals yet.</Empty> : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>#</th><th>Network</th><th>Amount</th><th>Charge</th><th>Net</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {items.map((w) => (
                  <tr key={w.id}>
                    <td className="mono">{w.id}</td>
                    <td><span className="badge cyan">{w.withdrawal_network || 'TRC20'}</span></td>
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
