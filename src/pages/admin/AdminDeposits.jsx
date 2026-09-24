import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Loader, Empty, Badge, money } from '../../components/ui';

export default function AdminDeposits() {
  const toast = useToast();
  const [status, setStatus] = useState('pending');
  const [items, setItems] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setItems(null);
    setItems((await api.get(`/admin/deposits?status=${status}`)).items);
  }
  useEffect(() => { load().catch((e) => toast.err(e.message)); }, [status]);

  async function review(id, action) {
    setBusyId(id);
    try {
      await api.patch(`/admin/deposits/${id}`, { action });
      toast.ok(`Deposit #${id} ${action === 'confirm' ? 'confirmed' : 'rejected'}`);
      await load();
    } catch (err) { toast.err(err.message); }
    finally { setBusyId(null); }
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card">
        <div className="pill-tabs">
          {['pending', 'confirmed', 'rejected'].map((s) => (
            <button key={s} className={status === s ? 'active' : ''} onClick={() => setStatus(s)}>
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="card">
        {!items ? <Loader /> : items.length === 0 ? <Empty>No {status} deposits.</Empty> : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>#</th><th>Member</th><th>Amount</th><th>Tx hash</th><th>Status</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d.id}>
                    <td className="mono">{d.id}</td>
                    <td><div>{d.name}</div><div className="muted" style={{ fontSize: '.8rem' }}>{d.email}</div></td>
                    <td className="mono">{money(d.amount)}</td>
                    <td className="mono muted" style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.tx_hash || '—'}</td>
                    <td><Badge status={d.status} /></td>
                    <td className="muted">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td>
                      {d.status === 'pending' && (
                        <div className="row" style={{ gap: 8 }}>
                          <button className="btn ok sm" disabled={busyId === d.id} onClick={() => review(d.id, 'confirm')}>Confirm</button>
                          <button className="btn danger sm" disabled={busyId === d.id} onClick={() => review(d.id, 'reject')}>Reject</button>
                        </div>
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
