import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Loader, Empty, Badge, money } from '../../components/ui';

// =====================================================================
// Helpers
// =====================================================================
function InfoRow({ label, value, mono }) {
  return (
    <div className="between" style={{ padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
      <span className="muted" style={{ fontSize: '.82rem', minWidth: 110 }}>{label}</span>
      <span className={mono ? 'mono' : ''} style={{ fontSize: '.88rem', textAlign: 'right', wordBreak: 'break-all', maxWidth: 280 }}>{value ?? '—'}</span>
    </div>
  );
}

function SectionTitle({ children, style }) {
  return <div style={{ fontWeight: 700, fontSize: '.82rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 10, marginTop: 6, ...style }}>{children}</div>;
}

function MiniCard({ label, value, color }) {
  return (
    <div className="card tight" style={{ padding: '10px 14px', flex: 1, minWidth: 110 }}>
      <div className="muted" style={{ fontSize: '.75rem', marginBottom: 3 }}>{label}</div>
      <div className="mono" style={{ fontWeight: 700, fontSize: '1rem', color }}>{value}</div>
    </div>
  );
}

// =====================================================================
// Profile edit form (name / email / phone / wallet)
// =====================================================================
function ProfileEditor({ user, userId, onSaved, toast }) {
  const [form, setForm] = useState({ name: user.name || '', email: user.email || '', phone: user.phone || '', wallet_address: user.wallet_address || '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch(`/admin/users/${userId}`, { name: form.name, email: form.email, phone: form.phone || undefined, wallet_address: form.wallet_address || undefined });
      toast.ok('Profile updated');
      onSaved({ ...user, ...form });
    } catch (err) { toast.err(err.message); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={save}>
      <SectionTitle>Profile Info</SectionTitle>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="field" style={{ margin: 0 }}>
          <label style={{ fontSize: '.8rem' }}>Full Name</label>
          <input className="input" value={form.name} onChange={set('name')} required style={{ fontSize: '.88rem', padding: '8px 10px' }} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label style={{ fontSize: '.8rem' }}>Email</label>
          <input className="input" type="email" value={form.email} onChange={set('email')} required style={{ fontSize: '.88rem', padding: '8px 10px' }} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label style={{ fontSize: '.8rem' }}>Phone</label>
          <input className="input" value={form.phone} onChange={set('phone')} placeholder="optional" style={{ fontSize: '.88rem', padding: '8px 10px' }} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label style={{ fontSize: '.8rem' }}>TRC-20 Wallet Address</label>
          <input className="input mono" value={form.wallet_address} onChange={set('wallet_address')} placeholder="T…" style={{ fontSize: '.82rem', padding: '8px 10px' }} />
        </div>
      </div>
      <button className="btn primary sm" style={{ marginTop: 12 }} disabled={busy}>
        {busy ? <span className="spinner" /> : 'Save Profile'}
      </button>
    </form>
  );
}

// =====================================================================
// Reset password form
// =====================================================================
function PasswordReset({ userId, toast }) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (pw !== confirm) return toast.err('Passwords do not match');
    if (pw.length < 6) return toast.err('Minimum 6 characters');
    setBusy(true);
    try {
      await api.post(`/admin/users/${userId}/reset-password`, { new_password: pw });
      toast.ok('Password reset successfully');
      setPw(''); setConfirm('');
    } catch (err) { toast.err(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <SectionTitle>Reset Password</SectionTitle>
      <form onSubmit={submit} className="row" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="field" style={{ margin: 0, flex: '1 1 160px' }}>
          <label style={{ fontSize: '.8rem' }}>New Password</label>
          <input className="input" type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} placeholder="min 6 chars" style={{ fontSize: '.88rem', padding: '8px 10px' }} />
        </div>
        <div className="field" style={{ margin: 0, flex: '1 1 160px' }}>
          <label style={{ fontSize: '.8rem' }}>Confirm</label>
          <input className="input" type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="repeat" style={{ fontSize: '.88rem', padding: '8px 10px' }} />
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button type="button" className="btn ghost sm" onClick={() => setShow((s) => !s)}>{show ? 'Hide' : 'Show'}</button>
          <button className="btn danger sm" disabled={busy}>{busy ? <span className="spinner" /> : 'Reset'}</button>
        </div>
      </form>
    </div>
  );
}

// =====================================================================
// Team & Rank card
// =====================================================================
function TeamRankCard({ team, totalBusiness, user, nextRank }) {
  const progressPct = nextRank ? Math.min(100, (totalBusiness / Number(nextRank.business_required)) * 100) : 100;

  return (
    <div>
      <SectionTitle>Team &amp; Rank</SectionTitle>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {[1, 2, 3].map((lvl) => (
          <div key={lvl} className="card tight" style={{ padding: '10px 12px', textAlign: 'center' }}>
            <div className="muted" style={{ fontSize: '.72rem', marginBottom: 4 }}>Level {lvl}</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{team[lvl].members}</div>
            <div className="muted mono" style={{ fontSize: '.75rem' }}>{money(team[lvl].business)}</div>
          </div>
        ))}
      </div>
      <div className="between" style={{ marginBottom: 6 }}>
        <span className="muted" style={{ fontSize: '.82rem' }}>Total Team Business</span>
        <span className="mono" style={{ fontWeight: 700 }}>{money(totalBusiness)}</span>
      </div>
      <div className="between" style={{ marginBottom: 8 }}>
        <span className="muted" style={{ fontSize: '.82rem' }}>Current Rank</span>
        {user.rank_name ? <span className="badge amber">{user.rank_name}</span> : <span className="muted" style={{ fontSize: '.82rem' }}>No rank</span>}
      </div>
      {nextRank && (
        <>
          <div className="between" style={{ marginBottom: 6 }}>
            <span className="muted" style={{ fontSize: '.78rem' }}>Next: {nextRank.name} ({money(nextRank.business_required)})</span>
            <span className="muted mono" style={{ fontSize: '.78rem' }}>{progressPct.toFixed(1)}%</span>
          </div>
          <div className="progress" style={{ height: 6 }}>
            <span style={{ width: `${progressPct}%` }} />
          </div>
        </>
      )}
      {!nextRank && user.rank_name && (
        <div className="muted" style={{ fontSize: '.8rem', textAlign: 'center', marginTop: 4 }}>✦ Highest rank achieved</div>
      )}
    </div>
  );
}

// =====================================================================
// Wallet adjustment
// =====================================================================
function WalletAdjust({ userId, onAdjusted, toast }) {
  const [dir, setDir] = useState('credit');
  const [amt, setAmt] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const amount = Number(amt);
    if (!amount || amount <= 0) return;
    setBusy(true);
    try {
      const res = await api.post(`/admin/users/${userId}/adjust`, { amount, direction: dir, note: note || undefined });
      toast.ok(`${dir === 'credit' ? 'Credited' : 'Debited'} ${money(amount)}. New balance: ${money(res.balance)}`);
      setAmt(''); setNote('');
      onAdjusted(res.balance);
    } catch (err) { toast.err(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <SectionTitle>Manual Balance Adjustment</SectionTitle>
      <form onSubmit={submit} className="row" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <select className="input" style={{ width: 110 }} value={dir} onChange={(e) => setDir(e.target.value)}>
          <option value="credit">Credit +</option>
          <option value="debit">Debit −</option>
        </select>
        <input className="input mono" type="number" step="0.01" min="0.01" placeholder="Amount" value={amt} onChange={(e) => setAmt(e.target.value)} style={{ width: 120 }} required />
        <input className="input" placeholder="Reason / note (optional)" value={note} onChange={(e) => setNote(e.target.value)} style={{ flex: 1, minWidth: 140 }} />
        <button className="btn primary sm" disabled={busy}>{busy ? <span className="spinner" /> : 'Apply'}</button>
      </form>
    </div>
  );
}

// =====================================================================
// History tabs
// =====================================================================
function HistoryTabs({ investments, deposits, withdrawals, transactions, referralEarnings }) {
  const [tab, setTab] = useState('inv');
  const tabs = [
    { key: 'inv', label: 'Investments', n: investments.length },
    { key: 'dep', label: 'Deposits', n: deposits.length },
    { key: 'wd', label: 'Withdrawals', n: withdrawals.length },
    { key: 'ref', label: 'Referrals', n: referralEarnings.length },
    { key: 'tx', label: 'Ledger', n: transactions.length },
  ];

  return (
    <div>
      <div className="pill-tabs" style={{ marginBottom: 12 }}>
        {tabs.map((t) => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            {t.label}
            {t.n > 0 && <span className="muted" style={{ marginLeft: 4, fontSize: '.78rem' }}>({t.n})</span>}
          </button>
        ))}
      </div>

      {tab === 'inv' && (
        <div className="table-wrap">
          {investments.length === 0 ? <Empty>No investments.</Empty> : (
            <table className="data compact">
              <thead><tr><th>Package</th><th>Invested</th><th>Rate</th><th>Earned</th><th>Cap</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {investments.map((i) => {
                  const pct = Math.min(100, (Number(i.total_earned) / Number(i.cap_amount)) * 100);
                  return (
                    <tr key={i.id}>
                      <td><span className="badge cyan">{i.package_name}</span></td>
                      <td className="mono">{money(i.amount)}</td>
                      <td className="mono muted">{i.daily_roi_rate}%/d</td>
                      <td>
                        <div className="mono">{money(i.total_earned)}</div>
                        <div className="progress" style={{ height: 4, marginTop: 3 }}><span style={{ width: `${pct}%` }} /></div>
                      </td>
                      <td className="mono muted">{money(i.cap_amount)}</td>
                      <td><Badge status={i.status} /></td>
                      <td className="muted" style={{ fontSize: '.78rem' }}>{new Date(i.purchased_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'dep' && (
        <div className="table-wrap">
          {deposits.length === 0 ? <Empty>No deposits.</Empty> : (
            <table className="data compact">
              <thead><tr><th>#</th><th>Amount</th><th>Status</th><th>From</th><th>Tx Hash</th><th>Date</th></tr></thead>
              <tbody>
                {deposits.map((d) => (
                  <tr key={d.id}>
                    <td className="mono muted">{d.id}</td>
                    <td className="mono">{money(d.amount)}</td>
                    <td><Badge status={d.status} /></td>
                    <td className="mono muted" style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '.78rem' }}>{d.from_address || '—'}</td>
                    <td className="mono muted" style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '.78rem' }}>{d.tx_hash || '—'}</td>
                    <td className="muted" style={{ fontSize: '.78rem', whiteSpace: 'nowrap' }}>{new Date(d.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'wd' && (
        <div className="table-wrap">
          {withdrawals.length === 0 ? <Empty>No withdrawals.</Empty> : (
            <table className="data compact">
              <thead><tr><th>#</th><th>Amount</th><th>Charge</th><th>Net</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td className="mono muted">{w.id}</td>
                    <td className="mono">{money(w.amount)}</td>
                    <td className="mono muted">{money(w.charge)}</td>
                    <td className="mono gradient-text" style={{ fontWeight: 600 }}>{money(w.net_amount)}</td>
                    <td><Badge status={w.status} /></td>
                    <td className="muted" style={{ fontSize: '.78rem', whiteSpace: 'nowrap' }}>{new Date(w.requested_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'ref' && (
        <div className="table-wrap">
          {referralEarnings.length === 0 ? <Empty>No referral earnings.</Empty> : (
            <table className="data compact">
              <thead><tr><th>From</th><th>Lvl</th><th>Source</th><th>%</th><th>Earned</th><th>Date</th></tr></thead>
              <tbody>
                {referralEarnings.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '.82rem' }}>{r.from_name}</td>
                    <td><span className="badge violet">L{r.level}</span></td>
                    <td className="mono muted">{money(r.source_amount)}</td>
                    <td className="mono muted">{r.percent}%</td>
                    <td className="mono gradient-text" style={{ fontWeight: 600 }}>{money(r.amount)}</td>
                    <td className="muted" style={{ fontSize: '.78rem', whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'tx' && (
        <div className="table-wrap">
          {transactions.length === 0 ? <Empty>No transactions.</Empty> : (
            <table className="data compact">
              <thead><tr><th>Type</th><th>Dir</th><th>Amount</th><th>Balance After</th><th>Date</th></tr></thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td><span className={`badge ${t.type === 'adjustment' ? 'violet' : t.type === 'roi' ? 'green' : 'cyan'}`}>{t.type}</span></td>
                    <td><span className={`badge ${t.direction === 'credit' ? 'green' : 'amber'}`}>{t.direction === 'credit' ? '↑' : '↓'} {t.direction}</span></td>
                    <td className="mono">{money(t.amount)}</td>
                    <td className="mono muted">{money(t.balance_after)}</td>
                    <td className="muted" style={{ fontSize: '.78rem', whiteSpace: 'nowrap' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Main modal
// =====================================================================
function UserModal({ userId, onClose, onUpdated }) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState('');

  function load() {
    api.get(`/admin/users/${userId}`).then(setData).catch((e) => { toast.err(e.message); onClose(); });
  }

  useEffect(() => { if (userId) load(); }, [userId]);

  async function toggleStatus() {
    if (!data) return;
    const next = data.user.status === 'active' ? 'blocked' : 'active';
    if (!window.confirm(`${next === 'blocked' ? 'Block' : 'Activate'} this user?`)) return;
    setBusy('status');
    try {
      await api.patch(`/admin/users/${userId}`, { status: next });
      toast.ok(`User ${next}`);
      setData((d) => ({ ...d, user: { ...d.user, status: next } }));
      onUpdated();
    } catch (err) { toast.err(err.message); }
    finally { setBusy(''); }
  }

  if (!data) return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ minHeight: 140 }}>
        <Loader />
      </div>
    </div>
  );

  const { user, sponsor, investments, deposits, withdrawals, transactions, referral_earnings, team, total_business, next_rank } = data;
  const initials = (user.name || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 860 }}>

        {/* ---- Header ---- */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <div className="avatar" style={{ width: 48, height: 48, fontSize: '1.2rem', flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 3 }}>{user.name}</div>
            <div className="muted" style={{ fontSize: '.82rem' }}>
              {user.email}
              {user.phone && <> · {user.phone}</>}
              {' · '}MAEX{user.id}
              {' · '}Joined {new Date(user.created_at).toLocaleDateString()}
            </div>
            <div className="row" style={{ gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <Badge status={user.status} />
              {user.role === 'admin' && <span className="badge violet">Admin</span>}
              {user.rank_name && <span className="badge amber">{user.rank_name}</span>}
              {sponsor && <span className="muted" style={{ fontSize: '.78rem' }}>Referred by <strong>{sponsor.name}</strong></span>}
            </div>
          </div>
          <div className="row" style={{ gap: 8, flexShrink: 0 }}>
            <button
              className={`btn ${user.status === 'active' ? 'danger' : 'ok'} sm`}
              disabled={busy === 'status'}
              onClick={toggleStatus}
            >
              {busy === 'status' ? <span className="spinner" /> : user.status === 'active' ? 'Block' : 'Activate'}
            </button>
            <button className="btn ghost sm" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* ---- Wallet summary row ---- */}
        <div className="row" style={{ gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          <MiniCard label="Balance" value={money(user.balance)} color="var(--green)" />
          <MiniCard label="Deposited" value={money(user.total_deposit)} />
          <MiniCard label="Withdrawn" value={money(user.total_withdraw)} color="var(--amber)" />
          <MiniCard label="Total Earned" value={money(user.total_earned)} color="var(--cyan)" />
        </div>

        {/* ---- Two-column layout: Profile + Team/Wallet ---- */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 18 }}>
          <div className="card tight" style={{ background: 'var(--surface-2)' }}>
            <ProfileEditor
              user={user}
              userId={userId}
              toast={toast}
              onSaved={(updated) => setData((d) => ({ ...d, user: { ...d.user, ...updated } }))}
            />
            <div style={{ marginTop: 20 }}>
              <PasswordReset userId={userId} toast={toast} />
            </div>
          </div>

          <div className="grid" style={{ gap: 14 }}>
            <div className="card tight" style={{ background: 'var(--surface-2)' }}>
              <TeamRankCard team={team} totalBusiness={total_business} user={user} nextRank={next_rank} />
            </div>
            <div className="card tight" style={{ background: 'var(--surface-2)' }}>
              <WalletAdjust
                userId={userId}
                toast={toast}
                onAdjusted={load}
              />
            </div>
          </div>
        </div>

        {/* ---- Account info row ---- */}
        <div className="card tight" style={{ background: 'var(--surface-2)', marginBottom: 18 }}>
          <SectionTitle>Account Details</SectionTitle>
          <InfoRow label="Wallet address" value={user.wallet_address} mono />
          <InfoRow label="Sponsor" value={sponsor ? `${sponsor.name} (${sponsor.email})` : 'Direct / No sponsor'} />
          <InfoRow label="Role" value={user.role} />
          <InfoRow label="Joined" value={new Date(user.created_at).toLocaleString()} />
        </div>

        {/* ---- History tabs ---- */}
        <div className="card tight" style={{ background: 'var(--surface-2)' }}>
          <SectionTitle style={{ marginBottom: 14 }}>Transaction History</SectionTitle>
          <HistoryTabs
            investments={investments}
            deposits={deposits}
            withdrawals={withdrawals}
            transactions={transactions}
            referralEarnings={referral_earnings}
          />
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// Main list page
// =====================================================================
export default function AdminUsers() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [data, setData] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const load = useCallback(() => {
    setData(null);
    const params = new URLSearchParams({ page });
    if (search) params.set('q', search);
    if (statusFilter) params.set('status', statusFilter);
    api.get(`/admin/users?${params}`).then(setData).catch((e) => toast.err(e.message));
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e) { e.preventDefault(); setSearch(q); setPage(1); }

  return (
    <div className="grid" style={{ gap: 18 }}>
      {detailId && (
        <UserModal userId={detailId} onClose={() => setDetailId(null)} onUpdated={load} />
      )}

      {/* Search + filter bar */}
      <div className="card tight">
        <form onSubmit={handleSearch} className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <input
            className="input"
            placeholder="Search by name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ flex: 1, minWidth: 180 }}
          />
          <select
            className="input"
            style={{ width: 140 }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            <option value="active">Active only</option>
            <option value="blocked">Blocked only</option>
          </select>
          <button className="btn primary sm" type="submit">Search</button>
          {(search || statusFilter) && (
            <button className="btn ghost sm" type="button" onClick={() => { setQ(''); setSearch(''); setStatusFilter(''); setPage(1); }}>
              Clear
            </button>
          )}
        </form>
      </div>

      <div className="card">
        {!data ? <Loader /> : data.items.length === 0 ? <Empty>No members found.</Empty> : (
          <>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th className="hide-sm">Balance</th>
                    <th className="hide-sm">Deposited</th>
                    <th className="hide-sm">Earned</th>
                    <th className="hide-sm">Rank</th>
                    <th className="hide-sm">Joined</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((u) => (
                    <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => setDetailId(u.id)}>
                      <td className="mono muted">{u.id}</td>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td className="muted" style={{ fontSize: '.83rem' }}>{u.email}</td>
                      <td className="mono hide-sm">{money(u.balance)}</td>
                      <td className="mono muted hide-sm">{money(u.total_deposit)}</td>
                      <td className="mono hide-sm">{money(u.total_earned)}</td>
                      <td className="hide-sm">
                        {u.rank_name ? <span className="badge amber">{u.rank_name}</span> : <span className="muted">—</span>}
                      </td>
                      <td className="muted hide-sm" style={{ fontSize: '.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td><Badge status={u.status} /></td>
                      <td>
                        <button className="btn ghost sm" onClick={(e) => { e.stopPropagation(); setDetailId(u.id); }}>
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="between" style={{ marginTop: 16 }}>
              <button className="btn ghost sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span className="muted" style={{ fontSize: '.85rem' }}>Page {data.page} · {data.total} members</span>
              <button className="btn ghost sm" disabled={data.items.length < 50} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
