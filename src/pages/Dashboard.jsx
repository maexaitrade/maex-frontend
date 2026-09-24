import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatCard, Progress, Loader, Badge, money } from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/me/dashboard').then(setData).catch((e) => toast.err(e.message));
  }, []);

  if (!data) return <Loader />;

  const { wallet, investments, income, rank, team_business } = data;
  const active = investments.find((i) => i.status === 'active') || investments[0];
  const refLink = `${window.location.origin}/register?ref=MAEX${user.id}`;
  const incomeRows = [
    { k: 'ROI', v: income.roi, c: 'var(--cyan)' },
    { k: 'Referral', v: income.referral, c: 'var(--violet)' },
    { k: 'Booster', v: income.booster, c: 'var(--green)' },
    { k: 'Reward', v: income.reward, c: 'var(--amber)' },
  ];
  const totalIncome = income.roi + income.referral + income.booster + income.reward;

  function copyRef() {
    navigator.clipboard?.writeText(refLink).then(() => toast.ok('Referral link copied'), () => {});
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard label="Wallet Balance" value={money(wallet.balance)} icon="◈"
          sub={`Deposited ${money(wallet.total_deposit)}`} />
        <StatCard label="Total Earned" value={money(wallet.total_earned)} icon="↗"
          sub={`Withdrawn ${money(wallet.total_withdraw)}`} />
        <StatCard label="Team Business" value={money(team_business)} icon="⚇"
          sub={rank ? `Rank: ${rank}` : 'No rank yet'} />
        <StatCard label="Current Rank" value={rank || '—'} icon="★"
          sub={rank ? 'Star rank achieved' : 'Build $5,000 team business'} />
      </div>

      <div className="cols-2">
        {/* Active package + cap progress */}
        <div className="card" style={{
          position: 'relative', overflow: 'hidden',
          background: active ? 'linear-gradient(145deg, #0a1a06 0%, #0d1f08 60%, #091508 100%)' : undefined,
          border: active ? '1px solid rgba(163,230,53,0.2)' : undefined,
        }}>
          {active && <>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(163,230,53,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,220,130,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          </>}

          <div className="between" style={{ marginBottom: 20, position: 'relative' }}>
            <span className="muted" style={{ fontSize: '.75rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>Active Package</span>
            {active && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.72rem', fontWeight: 700, color: '#a3e635', letterSpacing: '.06em' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#a3e635', boxShadow: '0 0 0 2px rgba(163,230,53,0.25)', animation: 'pulse 2s ease-in-out infinite' }} />
                LIVE
              </span>
            )}
          </div>

          {active ? (
            <div style={{ position: 'relative' }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-.02em', background: 'linear-gradient(135deg, #a3e635 0%, #00dc82 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {money(active.amount)}
                </div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '.8rem', fontWeight: 700, color: '#a3e635' }}>{active.package_name}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--muted)' }} />
                  <span className="muted" style={{ fontSize: '.8rem' }}>{active.daily_roi_rate}% / day</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Earned', value: money(active.total_earned), color: '#a3e635' },
                  { label: `Cap (2×)`, value: money(active.cap_amount), color: 'var(--text)' },
                ].map((s) => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="muted" style={{ fontSize: '.72rem', marginBottom: 4 }}>{s.label}</div>
                    <div className="mono" style={{ fontWeight: 700, fontSize: '1rem', color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ height: 5, borderRadius: 99, background: 'rgba(163,230,53,0.1)', overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', width: `${active.cap_progress_pct}%`, borderRadius: 99, background: 'linear-gradient(90deg, #a3e635, #00dc82)', boxShadow: '0 0 10px rgba(163,230,53,0.5)', transition: 'width .6s ease' }} />
                </div>
                <div className="between">
                  <span className="muted" style={{ fontSize: '.75rem' }}>{active.cap_progress_pct}% complete</span>
                  <span className="muted" style={{ fontSize: '.75rem' }}>{money(active.remaining_to_cap)} remaining</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty">
              No active package yet.
              <div style={{ marginTop: 12 }}><Link className="btn primary sm" to="/app/packages">Buy a package</Link></div>
            </div>
          )}
        </div>

        {/* Income breakdown */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Income Breakdown</div>
          <div className="value gradient-text" style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', fontWeight: 700 }}>
            {money(totalIncome)}
          </div>
          <div className="muted" style={{ fontSize: '.82rem', marginBottom: 14 }}>total working + ROI income</div>
          {incomeRows.map((r) => {
            const pct = totalIncome > 0 ? (r.v / totalIncome) * 100 : 0;
            return (
              <div key={r.k} style={{ marginBottom: 12 }}>
                <div className="between" style={{ fontSize: '.88rem', marginBottom: 5 }}>
                  <span className="row" style={{ gap: 8 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: r.c }} /> {r.k}
                  </span>
                  <span className="mono">{money(r.v)}</span>
                </div>
                <div className="progress" style={{ height: 6 }}>
                  <span style={{ width: `${pct}%`, background: r.c, boxShadow: 'none' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral link */}
      <div className="card">
        <div className="between wrap">
          <div>
            <div className="card-title">Your Referral Link</div>
            <div className="mono" style={{ marginTop: 8, color: 'var(--cyan)', wordBreak: 'break-all', fontSize: '.9rem' }}>{refLink}</div>
            <div className="muted" style={{ fontSize: '.82rem', marginTop: 6 }}>
              Your member ID is <b style={{ color: 'var(--text)' }}>MAEX{user.id}</b> — share to build your team.
            </div>
          </div>
          <button className="btn primary" onClick={copyRef}>Copy link</button>
        </div>
      </div>
    </div>
  );
}
