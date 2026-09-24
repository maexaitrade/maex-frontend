import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Loader, StatCard, money } from '../../components/ui';

function ActionBadge({ action }) {
  const map = {
    'deposit.confirm': 'green',
    'deposit.reject': 'danger',
    'withdrawal.pay': 'green',
    'withdrawal.reject': 'danger',
    'wallet.adjust.credit': 'cyan',
    'wallet.adjust.debit': 'amber',
    'roi.manual_run': 'violet',
    'user.status': 'amber',
  };
  const col = map[action] || 'cyan';
  return <span className={`badge ${col}`}>{action}</span>;
}

export default function AdminDashboard() {
  const toast = useToast();
  const [r, setR] = useState(null);
  const [roiDate, setRoiDate] = useState('');
  const [roiBusy, setRoiBusy] = useState(false);

  useEffect(() => {
    api.get('/admin/reports').then(setR).catch((e) => toast.err(e.message));
  }, []);

  async function runRoi(e) {
    e.preventDefault();
    if (!roiDate) return;
    setRoiBusy(true);
    try {
      const res = await api.post('/admin/roi/run', { date: roiDate });
      toast.ok(`ROI run for ${roiDate}: ${res.credited} investments credited ($${res.totalPaid})`);
      setRoiDate('');
    } catch (err) { toast.err(err.message); }
    finally { setRoiBusy(false); }
  }

  if (!r) return <Loader />;

  const p = r.payouts || {};
  const totalPayout = (p.roi || 0) + (p.referral || 0) + (p.booster || 0) + (p.reward || 0);

  return (
    <div className="grid" style={{ gap: 18 }}>
      {/* KPI row */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <StatCard label="Total Members" value={r.users} icon="⚇" />
        <StatCard label="Confirmed Deposits" value={money(r.confirmed_deposits)} icon="↓" accent="var(--green)" />
        <StatCard label="Paid Withdrawals" value={money(r.paid_withdrawals)} icon="↑" accent="var(--violet)" />
        <StatCard label="Total Payouts" value={money(totalPayout)} icon="◈" accent="var(--cyan)" />
      </div>

      {/* Pending alerts */}
      {(r.pending_deposits > 0 || r.pending_withdrawals > 0) && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {r.pending_deposits > 0 && (
            <Link to="/admin/deposits" style={{ textDecoration: 'none' }}>
              <div className="card tight" style={{ background: 'var(--brand-soft)', cursor: 'pointer' }}>
                <div className="between">
                  <span className="muted" style={{ fontSize: '.9rem' }}>Pending Deposits</span>
                  <span className="badge amber">{r.pending_deposits} waiting</span>
                </div>
              </div>
            </Link>
          )}
          {r.pending_withdrawals > 0 && (
            <Link to="/admin/withdrawals" style={{ textDecoration: 'none' }}>
              <div className="card tight" style={{ background: 'var(--brand-soft)', cursor: 'pointer' }}>
                <div className="between">
                  <span className="muted" style={{ fontSize: '.9rem' }}>Pending Withdrawals</span>
                  <span className="badge amber">{r.pending_withdrawals} waiting</span>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Payout breakdown + manual ROI side by side */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Payout Breakdown</div>
          {[
            { k: 'ROI', v: p.roi || 0, c: 'var(--cyan)' },
            { k: 'Referral', v: p.referral || 0, c: 'var(--violet)' },
            { k: 'Booster', v: p.booster || 0, c: 'var(--green)' },
            { k: 'Reward', v: p.reward || 0, c: 'var(--amber)' },
          ].map((row) => {
            const pct = totalPayout > 0 ? (row.v / totalPayout) * 100 : 0;
            return (
              <div key={row.k} style={{ marginBottom: 12 }}>
                <div className="between" style={{ marginBottom: 4 }}>
                  <span className="row" style={{ gap: 6 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: row.c, display: 'inline-block' }} />
                    <span style={{ fontSize: '.88rem' }}>{row.k}</span>
                  </span>
                  <span className="mono" style={{ fontSize: '.88rem' }}>{money(row.v)} <span className="muted">({pct.toFixed(1)}%)</span></span>
                </div>
                <div className="progress" style={{ height: 6 }}>
                  <span style={{ width: `${pct}%`, background: row.c, boxShadow: 'none' }} />
                </div>
              </div>
            );
          })}
          <div className="card tight" style={{ marginTop: 12, background: 'var(--surface-2)' }}>
            <div className="between">
              <span className="muted" style={{ fontSize: '.85rem' }}>Net (deposits − withdrawals − payouts)</span>
              <span className="mono gradient-text" style={{ fontWeight: 700 }}>{money(r.confirmed_deposits - r.paid_withdrawals - totalPayout)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Manual ROI Run</div>
          <p className="muted" style={{ fontSize: '.85rem', marginTop: 0 }}>
            Run catches up automatically on startup. Use this to trigger for a specific date manually.
          </p>
          <form onSubmit={runRoi} className="grid" style={{ gap: 10 }}>
            <div className="field">
              <label>Date (YYYY-MM-DD)</label>
              <input className="input mono" type="date" value={roiDate} onChange={(e) => setRoiDate(e.target.value)} required />
            </div>
            <button className="btn primary" disabled={roiBusy}>
              {roiBusy ? <span className="spinner" /> : 'Run ROI for date'}
            </button>
          </form>
        </div>
      </div>

      {/* Recent audit activity */}
      {r.recent_audit && r.recent_audit.length > 0 && (
        <div className="card">
          <div className="between" style={{ marginBottom: 14 }}>
            <div className="card-title">Recent Activity</div>
            <Link to="/admin/audit" style={{ fontSize: '.85rem', color: 'var(--brand)' }}>View all →</Link>
          </div>
          <div className="table-wrap">
            <table className="data compact">
              <thead><tr><th>Action</th><th>By</th><th>When</th></tr></thead>
              <tbody>
                {r.recent_audit.map((a) => (
                  <tr key={a.id}>
                    <td><ActionBadge action={a.action} /></td>
                    <td className="muted" style={{ fontSize: '.85rem' }}>{a.actor_name || 'System'}</td>
                    <td className="muted mono" style={{ fontSize: '.82rem' }}>{new Date(a.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
