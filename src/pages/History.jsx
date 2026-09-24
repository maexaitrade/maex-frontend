import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Loader, Empty, money } from '../components/ui';

const TYPES = ['', 'roi', 'referral', 'booster', 'reward', 'deposit', 'withdrawal', 'purchase'];
const LABEL = { '': 'All', roi: 'ROI', referral: 'Referral', booster: 'Booster', reward: 'Reward', deposit: 'Deposit', withdrawal: 'Withdrawal', purchase: 'Purchase' };
const COLOR = { roi: 'var(--cyan)', referral: 'var(--violet)', booster: 'var(--green)', reward: 'var(--amber)', deposit: 'var(--green)', withdrawal: 'var(--danger)', purchase: 'var(--muted)' };

export default function History() {
  const toast = useToast();
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    const q = new URLSearchParams({ page: String(page), ...(type ? { type } : {}) });
    api.get(`/me/income?${q}`).then(setData).catch((e) => toast.err(e.message));
  }, [type, page]);

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card">
        <div className="pill-tabs">
          {TYPES.map((t) => (
            <button key={t || 'all'} className={type === t ? 'active' : ''}
              onClick={() => { setType(t); setPage(1); }}>{LABEL[t]}</button>
          ))}
        </div>
      </div>

      <div className="card">
        {!data ? <Loader /> : data.items.length === 0 ? <Empty>No transactions found.</Empty> : (
          <>
            <div className="table-wrap">
              <table className="data">
                <thead><tr><th>#</th><th>Type</th><th>Direction</th><th>Amount</th><th>Balance after</th><th>Date</th></tr></thead>
                <tbody>
                  {data.items.map((t) => (
                    <tr key={t.id}>
                      <td className="mono muted">{t.id}</td>
                      <td><span className="badge" style={{ color: COLOR[t.type], borderColor: 'var(--border)' }}>{LABEL[t.type] || t.type}</span></td>
                      <td className={t.direction === 'credit' ? '' : 'muted'} style={{ color: t.direction === 'credit' ? 'var(--green)' : 'var(--danger)' }}>
                        {t.direction === 'credit' ? '+ credit' : '− debit'}
                      </td>
                      <td className="mono">{money(t.amount)}</td>
                      <td className="mono muted">{money(t.balance_after)}</td>
                      <td className="muted">{new Date(t.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="between" style={{ marginTop: 16 }}>
              <button className="btn ghost sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span className="muted" style={{ fontSize: '.85rem' }}>Page {data.page}</span>
              <button className="btn ghost sm" disabled={data.items.length < data.page_size} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
