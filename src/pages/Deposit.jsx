import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Loader, Empty, Badge, money } from '../components/ui';

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const t = useRef(null);

  function handleCopy() {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div className="muted" style={{ fontSize: '.78rem', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span className="input mono" style={{ flex: 1, padding: '8px 12px', fontSize: '.85rem', wordBreak: 'break-all', userSelect: 'all', cursor: 'text' }}>
          {value}
        </span>
        <button
          onClick={handleCopy}
          className="btn ghost"
          style={{ flexShrink: 0, border: `1px solid ${copied ? 'var(--green)' : 'var(--border)'}`, color: copied ? 'var(--green)' : undefined, transition: 'color .15s, border-color .15s' }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

function PaymentPending({ payment, onDone }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card tight" style={{ background: 'rgba(163,230,53,.06)', border: '1px solid rgba(163,230,53,.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="badge green">Waiting for payment</span>
          <span className="muted" style={{ fontSize: '.78rem' }}>Payment #{payment.payment_id}</span>
        </div>
        <p className="muted" style={{ fontSize: '.83rem', margin: '0 0 14px 0' }}>
          Send exactly the amount below to the TRC-20 address. Your account will be credited automatically once confirmed.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 18px' }}>
          <div style={{ background: '#fff', padding: 12, borderRadius: 10 }}>
            <QRCodeSVG value={payment.pay_address} size={160} />
          </div>
        </div>
        <CopyField label="Send exactly (USDT TRC-20)" value={String(payment.pay_amount)} />
        <CopyField label="To address (TRC-20 network only)" value={payment.pay_address} />
      </div>
      <div className="card tight muted" style={{ fontSize: '.8rem', lineHeight: 1.6 }}>
        ⚠️ Send <strong>only USDT on Tron (TRC-20)</strong> network. Sending on any other network will result in lost funds.
      </div>
      <button className="btn ghost" onClick={onDone}>Done — check history below</button>
    </div>
  );
}

function isNowPaymentsPending(d) {
  return d.status === 'pending' && d.pay_address;
}

function isNowPaymentsExpired(d) {
  return d.status === 'expired';
}

export default function Deposit() {
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [payment, setPayment] = useState(null);
  const [items, setItems] = useState(null);
  const [cfg, setCfg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [deps, settings] = await Promise.all([api.get('/deposits'), api.get('/settings')]);
    setItems(deps.items);
    setCfg(settings);
  }
  useEffect(() => { load().catch((e) => toast.err(e.message)); }, []);

  const MIN = cfg?.min_deposit ?? 100;
  const amt = Number(amount) || 0;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await api.post('/deposits/nowpayments', { amount: Number(amount) });
      setPayment(result);
      setAmount('');
      await load();
    } catch (err) { toast.err(err.message); }
    finally { setBusy(false); }
  }

  function reset() { setPayment(null); load().catch(() => {}); }

  function resume(d) {
    setPayment({
      payment_id: d.tx_hash,
      pay_address: d.pay_address,
      pay_amount: d.pay_amount_crypto,
    });
  }

  return (
    <div className="cols-2 even">
      <div className="card" style={{ alignSelf: 'start' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="card-title" style={{ margin: 0 }}>Deposit USDT</div>
          {payment && (
            <button className="btn ghost sm" onClick={reset}>+ New deposit</button>
          )}
        </div>

        {payment ? (
          <PaymentPending payment={payment} onDone={reset} />
        ) : (
          <>
            <div className="card tight" style={{ background: 'var(--brand-soft)', border: '1px solid var(--border)', marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className="badge cyan">TRC-20</span>
                <span className="muted" style={{ fontSize: '.85rem' }}>Powered by NOWPayments — auto-credited on confirmation.</span>
              </div>
            </div>
            <form onSubmit={submit}>
              <div className="field">
                <label>Amount (USDT)</label>
                <input
                  className="input mono"
                  type="number"
                  min={MIN}
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`min ${MIN}`}
                />
              </div>
              <button className="btn primary block" disabled={busy || amt < MIN}>
                {busy ? <span className="spinner" /> : 'Generate Payment Address'}
              </button>
              <p className="muted" style={{ fontSize: '.8rem', marginTop: 10 }}>
                Minimum deposit is {money(MIN)}. Funds are auto-credited once the payment confirms.
              </p>
            </form>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 14 }}>Deposit History</div>
        {!items ? <Loader /> : items.length === 0 ? <Empty>No deposits yet.</Empty> : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>#</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d.id}>
                    <td className="mono muted">{d.id}</td>
                    <td className="mono">{money(d.amount)}</td>
                    <td>
                      {isNowPaymentsPending(d)
                        ? <span className="badge amber" style={{ whiteSpace: 'nowrap' }}>Awaiting Payment</span>
                        : isNowPaymentsExpired(d)
                          ? <span className="badge danger" style={{ whiteSpace: 'nowrap' }}>Expired</span>
                          : <Badge status={d.status} />}
                    </td>
                    <td className="muted">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td>
                      {isNowPaymentsPending(d) && (
                        <button className="btn ghost sm" onClick={() => resume(d)}>
                          View address
                        </button>
                      )}
                      {isNowPaymentsExpired(d) && (
                        <button className="btn ghost sm" onClick={() => { setPayment(null); setAmount(String(d.amount)); }}>
                          Try again
                        </button>
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
