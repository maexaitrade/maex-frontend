import { useEffect, useState, useRef } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Loader, Empty } from '../../components/ui';

const ACTION_COLORS = {
  'deposit.confirm': 'green',
  'deposit.reject': 'danger',
  'withdrawal.pay': 'green',
  'withdrawal.reject': 'danger',
  'wallet.adjust.credit': 'cyan',
  'wallet.adjust.debit': 'amber',
  'roi.manual_run': 'violet',
  'user.status': 'amber',
  'user.profile_edit': 'cyan',
  'user.password_reset': 'violet',
};

const ACTION_LABELS = {
  'deposit.confirm': 'Deposit Confirmed',
  'deposit.reject': 'Deposit Rejected',
  'withdrawal.pay': 'Withdrawal Paid',
  'withdrawal.reject': 'Withdrawal Rejected',
  'wallet.adjust.credit': 'Wallet Credited',
  'wallet.adjust.debit': 'Wallet Debited',
  'roi.manual_run': 'ROI Manual Run',
  'user.status': 'User Status Changed',
  'user.profile_edit': 'Profile Edited',
  'user.password_reset': 'Password Reset',
};

const fmt$ = (n) => n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null;

// ---- human-readable detail rows per action type -------------------------
function copy(text) {
  navigator.clipboard.writeText(String(text)).catch(() => {});
}

function DetailRow({ label, value, color, mono, copyable }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  if (value == null || value === '') return null;

  function handleCopy(e) {
    e.stopPropagation();
    copy(value.replace(/^#/, ''));
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1000);
  }

  return (
    <div style={{ display: 'flex', gap: 12, padding: '4px 0', alignItems: 'center' }}>
      <span style={{ color: 'var(--muted)', fontSize: '.82rem', minWidth: 130, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '.88rem', color: color || 'var(--text)', fontFamily: mono ? 'monospace' : undefined, wordBreak: 'break-all' }}>
        {value}
      </span>
      {copyable && (
        <button
          onClick={handleCopy}
          style={{ background: 'none', border: `1px solid ${copied ? 'var(--green)' : 'var(--border)'}`, borderRadius: 6, padding: '1px 7px', fontSize: '.72rem', color: copied ? 'var(--green)' : 'var(--muted)', cursor: 'pointer', flexShrink: 0, transition: 'color .15s, border-color .15s' }}
        >
          {copied ? 'copied' : 'copy'}
        </button>
      )}
    </div>
  );
}

function AuditDetail({ action, detail }) {
  if (!detail) return null;
  const d = detail;

  if (action === 'deposit.confirm') return (
    <>
      <DetailRow label="Deposit ID" value={`#${d.depositId}`} mono copyable />
      <DetailRow label="Amount" value={fmt$(d.amount)} color="var(--green)" />
    </>
  );

  if (action === 'deposit.reject') return (
    <DetailRow label="Deposit ID" value={`#${d.depositId}`} mono copyable />
  );

  if (action === 'withdrawal.pay') return (
    <>
      <DetailRow label="Withdrawal ID" value={`#${d.id}`} mono copyable />
      <DetailRow label="Amount" value={fmt$(d.amount)} />
      {d.tx_hash && <DetailRow label="Tx Hash" value={d.tx_hash} mono copyable />}
    </>
  );

  if (action === 'withdrawal.reject') return (
    <>
      <DetailRow label="Withdrawal ID" value={`#${d.id}`} mono copyable />
      <DetailRow label="Refunded" value={fmt$(d.amount)} color="var(--amber)" />
    </>
  );

  if (action === 'wallet.adjust.credit') return (
    <>
      <DetailRow label="User ID" value={`#${d.userId}`} mono copyable />
      <DetailRow label="Credited" value={fmt$(d.amount)} color="var(--green)" />
      {d.note && <DetailRow label="Note" value={d.note} />}
    </>
  );

  if (action === 'wallet.adjust.debit') return (
    <>
      <DetailRow label="User ID" value={`#${d.userId}`} mono copyable />
      <DetailRow label="Debited" value={fmt$(d.amount)} color="var(--amber)" />
      {d.note && <DetailRow label="Note" value={d.note} />}
    </>
  );

  if (action === 'roi.manual_run') return (
    <>
      <DetailRow label="Date" value={d.date} mono />
      <DetailRow label="Investments credited" value={d.credited != null ? String(d.credited) : undefined} />
      <DetailRow label="Total paid" value={fmt$(d.totalPaid)} color="var(--cyan)" />
    </>
  );

  if (action === 'user.status') return (
    <>
      <DetailRow label="User ID" value={`#${d.userId}`} mono copyable />
      <DetailRow label="New status" value={d.status} color={d.status === 'active' ? 'var(--green)' : 'var(--danger)'} />
    </>
  );

  if (action === 'user.profile_edit') return (
    <>
      <DetailRow label="User ID" value={`#${d.userId}`} mono copyable />
      <DetailRow label="Fields updated" value={Array.isArray(d.fields) ? d.fields.join(', ') : d.fields} />
    </>
  );

  if (action === 'user.password_reset') return (
    <DetailRow label="User ID" value={`#${d.userId}`} mono copyable />
  );

  // Generic fallback
  return (
    <>
      {Object.entries(d).map(([k, v]) => (
        <DetailRow
          key={k}
          label={k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          value={typeof v === 'object' ? JSON.stringify(v) : String(v)}
        />
      ))}
    </>
  );
}

// -------------------------------------------------------------------------
export default function AdminAudit() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setData(null);
    api.get(`/admin/audit?page=${page}`).then(setData).catch((e) => toast.err(e.message));
  }, [page]);

  function toggle(id) { setExpanded((e) => (e === id ? null : id)); }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card">
        {!data ? <Loader /> : data.items.length === 0 ? <Empty>No audit entries.</Empty> : (
          <>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr><th>#</th><th>Action</th><th>By</th><th>When</th><th></th></tr>
                </thead>
                <tbody>
                  {data.items.map((a) => {
                    let detail = null;
                    try { detail = a.detail ? JSON.parse(a.detail) : null; } catch { /* ignore */ }
                    const isOpen = expanded === a.id;
                    return [
                      <tr
                        key={a.id}
                        style={{ cursor: detail ? 'pointer' : 'default' }}
                        onClick={() => detail && toggle(a.id)}
                      >
                        <td className="mono muted">{a.id}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span className={`badge ${ACTION_COLORS[a.action] || 'cyan'}`} style={{ alignSelf: 'flex-start' }}>
                              {ACTION_LABELS[a.action] || a.action}
                            </span>
                            <span className="muted" style={{ fontSize: '.72rem', fontFamily: 'monospace' }}>{a.action}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{a.actor_name || 'System'}</div>
                          {a.actor_email && <div className="muted" style={{ fontSize: '.78rem' }}>{a.actor_email}</div>}
                        </td>
                        <td className="muted" style={{ fontSize: '.82rem', whiteSpace: 'nowrap' }}>
                          {new Date(a.created_at).toLocaleString()}
                        </td>
                        <td>
                          {detail && (
                            <button className="btn ghost sm" style={{ minWidth: 32 }}>
                              {isOpen ? '▲' : '▼'}
                            </button>
                          )}
                        </td>
                      </tr>,
                      isOpen && detail && (
                        <tr key={`${a.id}-detail`}>
                          <td />
                          <td colSpan={4} style={{ padding: '4px 0 12px 0' }}>
                            <div style={{ paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
                              <AuditDetail action={a.action} detail={detail} />
                            </div>
                          </td>
                        </tr>
                      ),
                    ];
                  })}
                </tbody>
              </table>
            </div>
            <div className="between" style={{ marginTop: 16 }}>
              <button className="btn ghost sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span className="muted" style={{ fontSize: '.85rem' }}>Page {data.page} · {data.total} entries</span>
              <button className="btn ghost sm" disabled={data.items.length < 50} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
