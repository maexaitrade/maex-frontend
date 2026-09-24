import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Loader, StatCard, money } from '../../components/ui';

export default function AdminReports() {
  const toast = useToast();
  const [r, setR] = useState(null);
  useEffect(() => { api.get('/admin/reports').then(setR).catch((e) => toast.err(e.message)); }, []);
  if (!r) return <Loader />;

  const p = r.payouts || {};
  const payoutRows = [
    { k: 'ROI', v: p.roi || 0, c: 'var(--cyan)' },
    { k: 'Referral', v: p.referral || 0, c: 'var(--violet)' },
    { k: 'Booster', v: p.booster || 0, c: 'var(--green)' },
    { k: 'Reward', v: p.reward || 0, c: 'var(--amber)' },
  ];
  const totalPayout = payoutRows.reduce((s, x) => s + x.v, 0);

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard label="Total Members" value={r.users} icon="⚇" />
        <StatCard label="Confirmed Deposits" value={money(r.confirmed_deposits)} icon="↓" />
        <StatCard label="Paid Withdrawals" value={money(r.paid_withdrawals)} icon="↑" />
        <StatCard label="Total Payouts" value={money(totalPayout)} icon="◈" sub="ROI + working income" />
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 18 }}>Payout Distribution</div>
        {payoutRows.map((row) => {
          const pct = totalPayout > 0 ? (row.v / totalPayout) * 100 : 0;
          return (
            <div key={row.k} style={{ marginBottom: 16 }}>
              <div className="between" style={{ marginBottom: 6 }}>
                <span className="row" style={{ gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: row.c }} /> {row.k}
                </span>
                <span className="mono">{money(row.v)} <span className="muted">({pct.toFixed(1)}%)</span></span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <span style={{ width: `${pct}%`, background: row.c, boxShadow: 'none' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card tight" style={{ background: 'var(--brand-soft)' }}>
        <div className="between wrap">
          <span className="muted" style={{ fontSize: '.88rem' }}>Net platform flow (deposits − withdrawals − payouts)</span>
          <span className="mono gradient-text" style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.3rem' }}>
            {money(r.confirmed_deposits - r.paid_withdrawals - totalPayout)}
          </span>
        </div>
      </div>
    </div>
  );
}
