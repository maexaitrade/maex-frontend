import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import History from './History';

const TABS = [
  { k: 'deposit', label: 'Deposit' },
  { k: 'withdraw', label: 'Withdraw' },
  { k: 'history', label: 'History' },
];

export default function Wallet() {
  const [params, setParams] = useSearchParams();
  const initial = TABS.some((t) => t.k === params.get('tab')) ? params.get('tab') : 'deposit';
  const [tab, setTab] = useState(initial);

  function pick(k) {
    setTab(k);
    setParams({ tab: k }, { replace: true });
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="segmented">
        {TABS.map((t) => (
          <button key={t.k} className={tab === t.k ? 'active' : ''} onClick={() => pick(t.k)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'deposit' && <Deposit />}
      {tab === 'withdraw' && <Withdraw />}
      {tab === 'history' && <History />}
    </div>
  );
}
