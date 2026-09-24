import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Loader, Empty, StatCard, money } from '../components/ui';

export default function Team() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [level, setLevel] = useState(1);

  useEffect(() => { api.get('/me/team').then(setData).catch((e) => toast.err(e.message)); }, []);
  if (!data) return <Loader />;

  const rows = data.levels[level] || [];

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard label="Level 1" value={data.counts.level1} />
        <StatCard label="Level 2" value={data.counts.level2} />
        <StatCard label="Level 3" value={data.counts.level3} />
      </div>
      <StatCard label="Team Business" value={money(data.team_business)} icon="⚇" sub="confirmed deposits" />

      <div className="card">
        <div className="between wrap" style={{ marginBottom: 16 }}>
          <div className="card-title">Downline Members</div>
          <div className="pill-tabs">
            {[1, 2, 3].map((l) => (
              <button key={l} className={level === l ? 'active' : ''} onClick={() => setLevel(l)}>Level {l}</button>
            ))}
          </div>
        </div>
        {rows.length === 0 ? <Empty>No members at level {level} yet.</Empty> : (
          <div className="table-wrap">
            <table className="data compact">
              <thead><tr><th>ID</th><th>Name</th><th className="hide-sm">Email</th><th>Deposits</th><th className="hide-sm">Joined</th></tr></thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id}>
                    <td className="mono">MAEX{m.id}</td>
                    <td>{m.name}</td>
                    <td className="muted hide-sm">{m.email}</td>
                    <td className="mono">{money(m.total_deposit)}</td>
                    <td className="muted hide-sm">{new Date(m.created_at).toLocaleDateString()}</td>
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
