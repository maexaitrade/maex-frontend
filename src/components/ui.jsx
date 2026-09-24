// Small reusable presentational components.

export function money(n) {
  const v = Number(n || 0);
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div className="card stat">
      {icon && <div className="icon" style={accent ? { background: accent } : undefined}>{icon}</div>}
      <div className="label">{label}</div>
      <div className="value gradient-text">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

export function Progress({ pct }) {
  const w = Math.max(0, Math.min(100, Number(pct) || 0));
  return <div className="progress"><span style={{ width: `${w}%` }} /></div>;
}

export function Loader() {
  return <div className="center-load"><div className="spinner" /></div>;
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}

export function Badge({ status }) {
  const map = {
    active: 'green', confirmed: 'green', paid: 'green',
    pending: 'amber', capped: 'violet',
    rejected: 'danger', blocked: 'danger',
  };
  return <span className={`badge ${map[status] || 'cyan'}`}>{status}</span>;
}
