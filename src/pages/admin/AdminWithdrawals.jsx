import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Loader, Empty, Badge, money } from '../../components/ui';

const TX_EXPLORERS = {
  TRC20: 'https://tronscan.org/#/transaction/',
  BEP20: 'https://bscscan.com/tx/',
  SPL: 'https://solscan.io/tx/',
};

function CopyBtn({ text, toast, label = 'address' }) {
  const [done, setDone] = useState(false);
  async function copy(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      toast.ok(`Copied ${label}`);
      setTimeout(() => setDone(false), 1500);
    } catch { toast.err('Copy failed'); }
  }
  return (
    <button type="button" className="btn ghost sm" onClick={copy} title={`Copy ${label}`}
      style={{ padding: '2px 8px', fontSize: '.72rem', flex: 'none' }}>
      {done ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function PayModal({ item, onClose, onDone }) {
  const toast = useToast();
  const [txHash, setTxHash] = useState('');
  const [busy, setBusy] = useState(false);
  const network = item.withdrawal_network || 'TRC20';

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch(`/admin/withdrawals/${item.id}`, { action: 'pay', tx_hash: txHash || undefined });
      toast.ok(`Withdrawal #${item.id} paid`);
      onDone();
    } catch (err) { toast.err(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="card-title" style={{ marginBottom: 12 }}>Pay Withdrawal #{item.id}</div>

        <div className="grid" style={{ gap: 8, marginBottom: 14 }}>
          <div className="between">
            <span className="muted">Member</span>
            <span style={{ fontWeight: 600 }}>{item.name} {item.member_code && <span className="mono muted" style={{ fontSize: '.78rem' }}>({item.member_code})</span>}</span>
          </div>
          <div className="between">
            <span className="muted">Email</span>
            <span style={{ fontSize: '.85rem' }}>{item.email}</span>
          </div>
          <div className="between">
            <span className="muted">Network</span>
            <span className="badge cyan">{network}</span>
          </div>
          {item.phone && (
            <div className="between">
              <span className="muted">Phone</span>
              <span className="mono" style={{ fontSize: '.85rem' }}>{item.phone}</span>
            </div>
          )}
          <div className="between" style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 8 }}>
            <span className="muted">Amount (gross)</span>
            <span className="mono">{money(item.amount)}</span>
          </div>
          <div className="between">
            <span className="muted">Charge (6%)</span>
            <span className="mono" style={{ color: '#fb7185' }}>−{money(item.charge)}</span>
          </div>
          <div className="between" style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 8 }}>
            <span className="muted" style={{ fontWeight: 600 }}>Net to send</span>
            <span className="mono gradient-text" style={{ fontWeight: 800, fontSize: '1.05rem' }}>{money(item.net_amount)}</span>
          </div>
        </div>

        <div className="field" style={{ marginBottom: 14 }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{network} wallet address</span>
            <CopyBtn text={item.wallet_address} toast={toast} label="address" />
          </label>
          <div className="input mono" style={{ fontSize: '.82rem', wordBreak: 'break-all', userSelect: 'all', background: 'rgba(255,255,255,.04)', cursor: 'text' }}>
            {item.wallet_address}
          </div>
        </div>

        <form onSubmit={submit} className="grid" style={{ gap: 10 }}>
          <div className="field">
            <label>Transaction hash <span className="muted">(optional)</span></label>
            <input className="input mono" placeholder={`${network} tx hash…`} value={txHash} onChange={(e) => setTxHash(e.target.value)} />
          </div>
          <div className="row" style={{ gap: 10 }}>
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn ok" disabled={busy} style={{ flex: 1 }}>
              {busy ? <span className="spinner" /> : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminWithdrawals() {
  const toast = useToast();
  const [status, setStatus] = useState('pending');
  const [items, setItems] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [payItem, setPayItem] = useState(null);

  async function load() {
    setItems(null);
    setItems((await api.get(`/admin/withdrawals?status=${status}`)).items);
  }
  useEffect(() => { load().catch((e) => toast.err(e.message)); }, [status]);

  async function reject(id) {
    if (!window.confirm(`Reject withdrawal #${id}? The balance will be refunded.`)) return;
    setBusyId(id);
    try {
      await api.patch(`/admin/withdrawals/${id}`, { action: 'reject' });
      toast.ok(`Withdrawal #${id} rejected`);
      await load();
    } catch (err) { toast.err(err.message); }
    finally { setBusyId(null); }
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      {payItem && (
        <PayModal
          item={payItem}
          onClose={() => setPayItem(null)}
          onDone={() => { setPayItem(null); load(); }}
        />
      )}

      <div className="card">
        <div className="pill-tabs">
          {['pending', 'paid', 'rejected'].map((s) => (
            <button key={s} className={status === s ? 'active' : ''} onClick={() => setStatus(s)}>
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="card">
        {!items ? <Loader /> : items.length === 0 ? <Empty>No {status} withdrawals.</Empty> : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>#</th><th>Member</th><th>Network</th><th>Amount</th><th>Net</th>
                  <th className="hide-sm">Wallet Address</th>
                  <th>Status</th><th>Date</th><th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((w) => (
                  <tr key={w.id}>
                    <td className="mono muted">{w.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{w.name}</div>
                      <div className="muted" style={{ fontSize: '.8rem' }}>{w.email}</div>
                    </td>
                    <td><span className="badge cyan">{w.withdrawal_network || 'TRC20'}</span></td>
                    <td className="mono">{money(w.amount)}</td>
                    <td className="mono gradient-text" style={{ fontWeight: 600 }}>{money(w.net_amount)}</td>
                    <td className="hide-sm">
                      <div className="row" style={{ gap: 6, alignItems: 'center' }}>
                        <span className="mono muted" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={w.wallet_address}>{w.wallet_address}</span>
                        <CopyBtn text={w.wallet_address} toast={toast} label="address" />
                      </div>
                    </td>
                    <td><Badge status={w.status} /></td>
                    <td className="muted">{new Date(w.requested_at || w.created_at).toLocaleDateString()}</td>
                    <td>
                      {w.status === 'pending' && (
                        <div className="row" style={{ gap: 8 }}>
                          <button className="btn ok sm" disabled={busyId === w.id} onClick={() => setPayItem(w)}>Pay</button>
                          <button className="btn danger sm" disabled={busyId === w.id} onClick={() => reject(w.id)}>Reject</button>
                        </div>
                      )}
                      {w.tx_hash && (
                        <a className="mono muted" style={{ fontSize: '.75rem' }} title={w.tx_hash}
                          href={`${TX_EXPLORERS[w.withdrawal_network || 'TRC20'] || ''}${w.tx_hash}`} target="_blank" rel="noopener noreferrer">tx↗</a>
                      )}
                    </td>
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
