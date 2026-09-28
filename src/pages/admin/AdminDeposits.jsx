import { useEffect, useState, useRef } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Loader, Empty, Badge, money } from '../../components/ui';

function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  const t = useRef(null);
  function copy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setOk(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setOk(false), 1200);
  }
  return (
    <button onClick={copy} className="btn ghost sm" style={{ padding: '2px 8px', fontSize: '.75rem', border: `1px solid ${ok ? 'var(--green)' : 'var(--border)'}`, color: ok ? 'var(--green)' : undefined }}>
      {ok ? '✓' : 'Copy'}
    </button>
  );
}

function VerifyModal({ deposit, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/admin/deposits/${deposit.id}/verify`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [deposit.id]);

  const tronScanUrl = `https://tronscan.org/#/transaction/${deposit.tx_hash}`;

  function statusBadge() {
    if (!data) return null;
    if (!data.trongrid.valid) return <span className="badge danger">Not Found on TronGrid</span>;
    if (data.duplicate) return <span className="badge danger">Duplicate Hash</span>;
    if (!data.matchesAdmin) return <span className="badge danger">Address Mismatch</span>;
    if (!data.amountMatches) return <span className="badge amber">Amount Mismatch</span>;
    return <span className="badge green">Verified</span>;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540, width: '90%' }}>
        <div className="between" style={{ marginBottom: 16 }}>
          <div className="card-title" style={{ margin: 0 }}>Verify Deposit #{deposit.id}</div>
          <button className="btn ghost sm" onClick={onClose}>✕</button>
        </div>

        {loading ? <Loader /> : error ? (
          <div className="card tight" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)' }}>
            <span style={{ color: 'var(--danger)' }}>{error}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ textAlign: 'center', marginBottom: 4 }}>{statusBadge()}</div>

            <div className="card tight" style={{ background: 'var(--brand-soft)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.82rem', marginBottom: 10 }}>
                <span className="muted">Member:</span> <strong>{deposit.name}</strong>
                <span className="muted" style={{ marginLeft: 8 }}>{deposit.member_code}</span>
              </div>
              <div style={{ fontSize: '.82rem' }}>
                <span className="muted">Requested:</span> <strong className="mono">{money(deposit.amount)}</strong>
              </div>
            </div>

            {data.trongrid.valid ? (
              <div className="card tight" style={{ background: 'rgba(163,230,53,.04)', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', fontSize: '.82rem' }}>
                  <tbody>
                    <tr>
                      <td className="muted" style={{ padding: '4px 0', width: 90 }}>From</td>
                      <td className="mono" style={{ wordBreak: 'break-all', fontSize: '.78rem' }}>
                        {data.trongrid.from}
                      </td>
                    </tr>
                    <tr>
                      <td className="muted" style={{ padding: '4px 0' }}>To</td>
                      <td className="mono" style={{ wordBreak: 'break-all', fontSize: '.78rem' }}>
                        {data.trongrid.to}
                        {data.matchesAdmin && <span className="badge green" style={{ marginLeft: 6, fontSize: '.7rem' }}>Admin wallet</span>}
                      </td>
                    </tr>
                    <tr>
                      <td className="muted" style={{ padding: '4px 0' }}>Amount</td>
                      <td className="mono">
                        <strong>{money(data.trongrid.amount)}</strong>
                        {data.amountMatches
                          ? <span className="badge green" style={{ marginLeft: 6, fontSize: '.7rem' }}>Match</span>
                          : <span className="badge amber" style={{ marginLeft: 6, fontSize: '.7rem' }}>Expected {money(deposit.amount)}</span>}
                      </td>
                    </tr>
                    <tr>
                      <td className="muted" style={{ padding: '4px 0' }}>Block</td>
                      <td className="mono muted">{data.trongrid.block}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card tight" style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)' }}>
                <p className="muted" style={{ fontSize: '.82rem', margin: 0 }}>{data.trongrid.error}</p>
              </div>
            )}

            {data.duplicate && (
              <div className="card tight" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)' }}>
                <span style={{ color: 'var(--danger)', fontSize: '.82rem' }}>⚠️ This transaction hash is used by another deposit</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '.82rem' }}>
              <span className="muted">TX Hash:</span>
              <span className="mono" style={{ fontSize: '.75rem', wordBreak: 'break-all', flex: 1 }}>{deposit.tx_hash}</span>
              <CopyBtn text={deposit.tx_hash} />
            </div>

            <a href={tronScanUrl} target="_blank" rel="noopener noreferrer" className="btn ghost block" style={{ textAlign: 'center' }}>
              View on TronScan ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDeposits() {
  const toast = useToast();
  const [status, setStatus] = useState('pending');
  const [items, setItems] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [verifyDep, setVerifyDep] = useState(null);

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
                    <td>
                      <div>{d.name}</div>
                      <div className="muted" style={{ fontSize: '.8rem' }}>{d.email}</div>
                    </td>
                    <td className="mono">{money(d.amount)}</td>
                    <td className="mono muted" style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.tx_hash ? (
                        <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.tx_hash}</span>
                          <CopyBtn text={d.tx_hash} />
                        </span>
                      ) : '—'}
                    </td>
                    <td><Badge status={d.status} /></td>
                    <td className="muted">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td>
                      {d.status === 'pending' && (
                        <div className="row" style={{ gap: 6 }}>
                          {d.tx_hash && (
                            <button className="btn ghost sm" onClick={() => setVerifyDep(d)} style={{ color: 'var(--cyan, #22d3ee)' }}>
                              Verify
                            </button>
                          )}
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

      {verifyDep && (
        <VerifyModal deposit={verifyDep} onClose={() => setVerifyDep(null)} />
      )}
    </div>
  );
}
