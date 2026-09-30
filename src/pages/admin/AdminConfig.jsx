import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Loader, Empty } from '../../components/ui';

function useForm(initial) {
  const [form, setForm] = useState(initial);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const reset = () => setForm(initial);
  const fill = (obj) => setForm(obj);
  return [form, set, reset, fill];
}

// ---- Packages tab -------------------------------------------------------
function PackagesTab() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [pkg, setPkg, resetPkg, fillPkg] = useForm({ id: '', name: '', min_amount: '', max_amount: '', daily_roi_percent: '', is_active: '1' });
  const [busy, setBusy] = useState(false);

  async function load() {
    setItems(null);
    setItems((await api.get('/admin/packages')).items);
  }
  useEffect(() => { load().catch((e) => toast.err(e.message)); }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/admin/packages', {
        id: pkg.id ? Number(pkg.id) : undefined,
        name: pkg.name,
        min_amount: Number(pkg.min_amount),
        max_amount: pkg.max_amount === '' ? null : Number(pkg.max_amount),
        daily_roi_percent: Number(pkg.daily_roi_percent),
        is_active: pkg.is_active === '1',
      });
      toast.ok('Package saved'); resetPkg(); await load();
    } catch (err) { toast.err(err.message); }
    finally { setBusy(false); }
  }

  function edit(p) {
    fillPkg({
      id: String(p.id),
      name: p.name,
      min_amount: String(p.min_amount),
      max_amount: p.max_amount != null ? String(p.max_amount) : '',
      daily_roi_percent: String(p.daily_roi_percent),
      is_active: p.is_active ? '1' : '0',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <form className="card" onSubmit={submit}>
        <div className="between" style={{ marginBottom: 14 }}>
          <div className="card-title">{pkg.id ? `Edit Package #${pkg.id}` : 'Add Package'}</div>
          {pkg.id && <button type="button" className="btn ghost sm" onClick={resetPkg}>+ New</button>}
        </div>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <div className="field" style={{ flex: '1 1 160px' }}>
            <label>Name</label>
            <input className="input" required value={pkg.name} onChange={setPkg('name')} placeholder="Starter" />
          </div>
          <div className="field" style={{ flex: '1 1 110px' }}>
            <label>Min ($)</label>
            <input className="input mono" type="number" required value={pkg.min_amount} onChange={setPkg('min_amount')} placeholder="100" />
          </div>
          <div className="field" style={{ flex: '1 1 110px' }}>
            <label>Max ($) <span className="muted">blank=∞</span></label>
            <input className="input mono" type="number" value={pkg.max_amount} onChange={setPkg('max_amount')} placeholder="5000" />
          </div>
          <div className="field" style={{ flex: '1 1 110px' }}>
            <label>Daily ROI %</label>
            <input className="input mono" type="number" step="0.001" required value={pkg.daily_roi_percent} onChange={setPkg('daily_roi_percent')} placeholder="1.0" />
          </div>
          <div className="field" style={{ flex: '1 1 100px' }}>
            <label>Active</label>
            <select className="input" value={pkg.is_active} onChange={setPkg('is_active')}>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
        </div>
        <button className="btn primary" disabled={busy}>{busy ? <span className="spinner" /> : pkg.id ? 'Update Package' : 'Add Package'}</button>
      </form>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 14 }}>Current Packages</div>
        {!items ? <Loader /> : items.length === 0 ? <Empty>No packages.</Empty> : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Name</th><th>Min</th><th>Max</th><th>Daily ROI</th><th>Active</th><th></th></tr></thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td className="mono">${Number(p.min_amount).toLocaleString()}</td>
                    <td className="mono muted">{p.max_amount != null ? `$${Number(p.max_amount).toLocaleString()}` : '∞'}</td>
                    <td className="mono">{p.daily_roi_percent}%</td>
                    <td><span className={`badge ${p.is_active ? 'green' : 'amber'}`}>{p.is_active ? 'Yes' : 'No'}</span></td>
                    <td><button className="btn ghost sm" onClick={() => edit(p)}>Edit</button></td>
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

// ---- Ranks tab ----------------------------------------------------------
function RanksTab() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [rank, setRank, resetRank, fillRank] = useForm({ id: '', name: '', business_required: '', reward_amount: '', sort_order: '' });
  const [busy, setBusy] = useState(false);

  async function load() {
    setItems(null);
    setItems((await api.get('/admin/ranks')).items);
  }
  useEffect(() => { load().catch((e) => toast.err(e.message)); }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/admin/ranks', {
        id: rank.id ? Number(rank.id) : undefined,
        name: rank.name,
        business_required: Number(rank.business_required),
        reward_amount: Number(rank.reward_amount),
        sort_order: Number(rank.sort_order),
      });
      toast.ok('Rank saved'); resetRank(); await load();
    } catch (err) { toast.err(err.message); }
    finally { setBusy(false); }
  }

  function edit(r) {
    fillRank({
      id: String(r.id),
      name: r.name,
      business_required: String(r.business_required),
      reward_amount: String(r.reward_amount),
      sort_order: String(r.sort_order),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <form className="card" onSubmit={submit}>
        <div className="between" style={{ marginBottom: 14 }}>
          <div className="card-title">{rank.id ? `Edit Rank #${rank.id}` : 'Add Rank'}</div>
          {rank.id && <button type="button" className="btn ghost sm" onClick={resetRank}>+ New</button>}
        </div>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <div className="field" style={{ flex: '1 1 140px' }}>
            <label>Name</label>
            <input className="input" required value={rank.name} onChange={setRank('name')} placeholder="Star 1" />
          </div>
          <div className="field" style={{ flex: '1 1 130px' }}>
            <label>Business required ($)</label>
            <input className="input mono" type="number" required value={rank.business_required} onChange={setRank('business_required')} placeholder="5000" />
          </div>
          <div className="field" style={{ flex: '1 1 110px' }}>
            <label>Reward ($)</label>
            <input className="input mono" type="number" required value={rank.reward_amount} onChange={setRank('reward_amount')} placeholder="100" />
          </div>
          <div className="field" style={{ flex: '1 1 90px' }}>
            <label>Sort order</label>
            <input className="input mono" type="number" required value={rank.sort_order} onChange={setRank('sort_order')} placeholder="1" />
          </div>
        </div>
        <button className="btn primary" disabled={busy}>{busy ? <span className="spinner" /> : rank.id ? 'Update Rank' : 'Add Rank'}</button>
      </form>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 14 }}>Current Ranks</div>
        {!items ? <Loader /> : items.length === 0 ? <Empty>No ranks.</Empty> : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Name</th><th>Business Req.</th><th>Reward</th><th>Order</th><th></th></tr></thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}><span className="badge amber">{r.name}</span></td>
                    <td className="mono">${Number(r.business_required).toLocaleString()}</td>
                    <td className="mono gradient-text">${Number(r.reward_amount).toLocaleString()}</td>
                    <td className="mono muted">{r.sort_order}</td>
                    <td><button className="btn ghost sm" onClick={() => edit(r)}>Edit</button></td>
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

// ---- Settings tab -------------------------------------------------------
function DepositNetworksCard() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [busy, setBusy] = useState('');

  async function load() {
    const data = await api.get('/admin/deposit-networks');
    setItems(data.items);
    setDrafts(Object.fromEntries(data.items.map((item) => [item.code, item.address || ''])));
  }

  useEffect(() => { load().catch((e) => toast.err(e.message)); }, []);

  function looksValid(code, value) {
    const address = value.trim();
    if (code === 'TRC20') return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
    if (code === 'BEP20') return /^0x[0-9a-fA-F]{40}$/.test(address);
    if (code === 'SPL') return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    return false;
  }

  async function saveAddress(item) {
    const address = (drafts[item.code] || '').trim();
    if (!looksValid(item.code, address)) {
      toast.err(`Enter a valid ${item.label} address`);
      return;
    }
    setBusy(`save-${item.code}`);
    try {
      await api.patch(`/admin/deposit-networks/${item.code}`, { address });
      toast.ok(`${item.label} address saved`);
      await load();
    } catch (err) { toast.err(err.message); }
    finally { setBusy(''); }
  }

  async function activate(item) {
    setBusy(`active-${item.code}`);
    try {
      await api.patch('/admin/deposit-networks/active', { network: item.code });
      toast.ok(`${item.label} is now active`);
      await load();
    } catch (err) { toast.err(err.message); }
    finally { setBusy(''); }
  }

  return (
    <div className="card">
      <div className="between" style={{ marginBottom: 6 }}>
        <div className="card-title">Deposit & Withdrawal Network</div>
        <span className="muted" style={{ fontSize: '.78rem' }}>Only one network can be active</span>
      </div>
      <p className="muted" style={{ fontSize: '.82rem', marginTop: 0, marginBottom: 16 }}>
        These are platform deposit addresses. The active network also controls validation of member withdrawal addresses.
      </p>
      {!items ? <Loader /> : (
        <div className="grid" style={{ gap: 12 }}>
          {items.map((item) => {
            const address = drafts[item.code] || '';
            const changed = address.trim() !== (item.address || '');
            return (
              <div key={item.code} className="card tight" style={{ border: item.active ? '1px solid rgba(163,230,53,.45)' : '1px solid var(--border)', background: item.active ? 'rgba(163,230,53,.05)' : undefined }}>
                <div className="between" style={{ marginBottom: 10 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <strong>{item.label}</strong>
                    <span className={`badge ${item.active ? 'green' : 'amber'}`}>{item.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  {!item.active && (
                    <button className="btn ok sm" disabled={Boolean(busy) || !item.address} onClick={() => activate(item)}>
                      {busy === `active-${item.code}` ? <span className="spinner" /> : 'Make Active'}
                    </button>
                  )}
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>{item.label} platform deposit address</label>
                  <div className="row" style={{ gap: 8, alignItems: 'stretch' }}>
                    <input
                      className="input mono"
                      value={address}
                      onChange={(e) => setDrafts({ ...drafts, [item.code]: e.target.value })}
                      placeholder={item.address_placeholder}
                      autoComplete="off"
                      style={{ flex: 1, fontSize: '.82rem' }}
                    />
                    <button className="btn primary sm" disabled={Boolean(busy) || !changed || !address.trim()} onClick={() => saveAddress(item)}>
                      {busy === `save-${item.code}` ? <span className="spinner" /> : 'Save Address'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState({});
  const [busy, setBusy] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  async function load() {
    setItems(null);
    setItems((await api.get('/admin/settings')).items);
  }
  useEffect(() => { load().catch((e) => toast.err(e.message)); }, []);

  async function saveOne(key, value) {
    setBusy(key);
    try {
      await api.post('/admin/settings', { key, value });
      toast.ok(`${key} updated`);
      setEditing((e) => { const n = { ...e }; delete n[key]; return n; });
      await load();
    } catch (err) { toast.err(err.message); }
    finally { setBusy(''); }
  }

  async function addNew(e) {
    e.preventDefault();
    if (!newKey || !newVal) return;
    setBusy('new');
    try {
      await api.post('/admin/settings', { key: newKey, value: newVal });
      toast.ok(`${newKey} saved`); setNewKey(''); setNewVal(''); await load();
    } catch (err) { toast.err(err.message); }
    finally { setBusy(''); }
  }

  const knownDesc = {
    roi_rate_low: 'ROI % for packages ≤ threshold',
    roi_rate_high: 'ROI % for packages > threshold',
    roi_threshold: 'Package amount that flips low→high ROI',
    referral_l1: 'Level 1 referral %',
    referral_l2: 'Level 2 referral %',
    referral_l3: 'Level 3 referral %',
    booster_days: 'Days window for booster qualification',
    booster_directs: 'Direct refs required for booster',
    booster_percent: 'Booster % of sponsor package',
    cap_multiplier: 'Earning cap = amount × multiplier',
    min_deposit: 'Minimum deposit amount ($)',
    min_withdraw: 'Minimum withdrawal amount ($)',
    withdraw_charge: 'Withdrawal fee %',
    deposit_network: 'Accepted deposit network',
    admin_deposit_address: 'TRC-20 USDT address shown to users for deposits',
    deposit_via: 'Deposit mode: admin (direct) or gateway (NOWPayments)',
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <DepositNetworksCard />
      <div className="card">
        <div className="card-title" style={{ marginBottom: 14 }}>Platform Settings</div>
        {!items ? <Loader /> : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Key</th><th>Description</th><th>Value</th><th></th></tr></thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.key}>
                    <td className="mono" style={{ fontWeight: 600 }}>{s.key}</td>
                    <td className="muted" style={{ fontSize: '.82rem' }}>{knownDesc[s.key] || '—'}</td>
                    <td>
                      {editing[s.key] !== undefined ? (
                        <input
                          className="input mono"
                          style={{ width: 120, padding: '4px 8px', fontSize: '.9rem' }}
                          value={editing[s.key]}
                          onChange={(e) => setEditing({ ...editing, [s.key]: e.target.value })}
                          autoFocus
                        />
                      ) : (
                        <span className="mono badge cyan">{s.value}</span>
                      )}
                    </td>
                    <td>
                      {editing[s.key] !== undefined ? (
                        <div className="row" style={{ gap: 6 }}>
                          <button className="btn ok sm" disabled={busy === s.key} onClick={() => saveOne(s.key, editing[s.key])}>
                            {busy === s.key ? <span className="spinner" /> : 'Save'}
                          </button>
                          <button className="btn ghost sm" onClick={() => setEditing((e) => { const n = { ...e }; delete n[s.key]; return n; })}>✕</button>
                        </div>
                      ) : (
                        <button className="btn ghost sm" onClick={() => setEditing({ ...editing, [s.key]: s.value })}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form className="card" onSubmit={addNew}>
        <div className="card-title" style={{ marginBottom: 12 }}>Add New Setting</div>
        <div className="row" style={{ gap: 10 }}>
          <input className="input mono" placeholder="key" value={newKey} onChange={(e) => setNewKey(e.target.value)} style={{ flex: 1 }} required />
          <input className="input mono" placeholder="value" value={newVal} onChange={(e) => setNewVal(e.target.value)} style={{ flex: 1 }} required />
          <button className="btn primary sm" disabled={busy === 'new'}>{busy === 'new' ? <span className="spinner" /> : 'Add'}</button>
        </div>
      </form>
    </div>
  );
}

// ---- Main page ----------------------------------------------------------
export default function AdminConfig() {
  const [tab, setTab] = useState('packages');
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card tight">
        <div className="pill-tabs">
          {['packages', 'ranks', 'settings'].map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {tab === 'packages' && <PackagesTab />}
      {tab === 'ranks' && <RanksTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  );
}
