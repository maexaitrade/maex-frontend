import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Loader, Empty, Badge, money } from '../../components/ui';

function PayModal({ item, onClose, onDone }) {
  const toast = useToast();
  const [txHash, setTxHash] = useState('');
  const [busy, setBusy] = useState(false);

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
            <span style={{ fontWeight: 500 }}>{item.name}</span>
          </div>
          <div className="between">
            <span className="muted">Amount (gross)</span>
            <span className="mono">{money(item.amount)}</span>
          </div>
          <div className="between">
            <span className="muted">Net to send</span>
            <span className="mono gradient-text" style={{ fontWeight: 700 }}>{money(item.net_amount)}</span>
          </div>
          <div className="between" style={{ flexWrap: 'wrap', gap: 4 }}>
            <span className="muted">TRC-20 address</span>
            <span className="mono" style={{ fontSize: '.8rem', wordBreak: 'break-all', textAlign: 'right', maxWidth: 260 }}>{item.wallet_address}</span>
          </div>
        </div>
        <form onSubmit={submit} className="grid" style={{ gap: 10 }}>
          <div className="field">
            <label>Transaction hash <span className="muted">(optional)</span></label>
            <input className="input mono" placeholder="TRC-20 tx hash…" value={txHash} onChange={(e) => setTxHash(e.target.value)} />
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
                  <th>#</th><th>Member</th><th>Amount</th><th>Net</th>
                  <th className="hide-sm">TRC-20 Address</th>
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
                    <td className="mono">{money(w.amount)}</td>
                    <td className="mono gradient-text" style={{ fontWeight: 600 }}>{money(w.net_amount)}</td>
                    <td className="mono muted hide-sm" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.wallet_address}</td>
                    <td><Badge status={w.status} /></td>
                    <td className="muted">{new Date(w.requested_at || w.created_at).toLocaleDateString()}</td>
                    <td>
                      {w.status === 'pending' && (
                        <div className="row" style={{ gap: 8 }}>
                          <button className="btn ok sm" disabled={busyId === w.id} onClick={() => setPayItem(w)}>Pay</button>
                          <button className="btn danger sm" disabled={busyId === w.id} onClick={() => reject(w.id)}>Reject</button>
                        </div>
                      )}
                      {w.tx_hash && <span className="mono muted" style={{ fontSize: '.75rem' }} title={w.tx_hash}>tx…</span>}
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
