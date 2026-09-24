import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon } from './icons';

const memberNav = [
  { to: '/app/dashboard', label: 'Dashboard', icon: 'home' },
  { to: '/app/packages', label: 'Packages', icon: 'box' },
  { to: '/app/wallet', label: 'Wallet', icon: 'wallet' },
  { to: '/app/team', label: 'Team', icon: 'users' },
  { to: '/app/profile', label: 'Profile', icon: 'user' },
];

const adminNav = [
  { to: '/admin', label: 'Overview', icon: 'home', exact: true },
  { to: '/admin/deposits', label: 'Deposits', icon: 'depositCircle' },
  { to: '/admin/withdrawals', label: 'Payouts', icon: 'payoutCircle' },
  { to: '/admin/users', label: 'Members', icon: 'users' },
  { to: '/admin/config', label: 'Config', icon: 'gear' },
  { to: '/admin/reports', label: 'Reports', icon: 'chart' },
  { to: '/admin/audit', label: 'Audit Log', icon: 'chart' },
];

// Mobile bottom-bar layout: 2 icons | center FAB (Wallet) | 2 icons.
const mobileLeft = ['/app/dashboard', '/app/packages'];
const mobileRight = ['/app/team', '/app/profile'];

const titles = {
  dashboard: 'Dashboard', packages: 'Packages', wallet: 'Wallet',
  team: 'My Team', profile: 'Profile',
  deposits: 'Deposit Approvals', withdrawals: 'Payout Approvals', users: 'Members',
  config: 'Plan Configuration', reports: 'Reports', audit: 'Audit Log',
  admin: 'Admin Overview',
};

function MobileNavItem({ item }) {
  return (
    <NavLink to={item.to} className={({ isActive }) => `mnav ${isActive ? 'active' : ''}`} aria-label={item.label}>
      <Icon name={item.icon} size={22} />
    </NavLink>
  );
}

export default function Layout({ admin = false }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const items = admin ? adminNav : memberNav;
  const key = loc.pathname.split('/').pop() || (admin ? 'admin' : 'dashboard');
  const title = titles[key] || (admin ? 'Admin' : 'Dashboard');
  const initials = (user?.name || 'U').slice(0, 1).toUpperCase();

  const byPath = Object.fromEntries(memberNav.map((n) => [n.to, n]));

  return (
    <div className="shell">
      {/* desktop sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">M</div>
          <b>MAEX<span className="gradient-text"> Trade</span></b>
        </div>
        {items.map((n) => (
          <NavLink key={n.to} to={n.to} end={!!n.exact} className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
            <span className="ni"><Icon name={n.icon} size={20} /></span>
            <span>{n.label}</span>
          </NavLink>
        ))}
        <div className="spacer" />
        <button className="navlink logout-desktop" onClick={logout}
          style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}>
          <span className="ni"><Icon name="power" size={20} /></span><span>Logout</span>
        </button>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="row">
            <h1>{title}</h1>
            {admin && <span className="badge violet">Admin</span>}
          </div>
          <div className="row">
            <div className="hide-xs muted" style={{ fontSize: '.85rem', textAlign: 'right' }}>
              <div style={{ color: 'var(--text)', fontWeight: 600 }}>{user?.name}</div>
              <div>{user?.email}</div>
            </div>
            <div className="avatar">{initials}</div>
            <button className="btn ghost sm mobile-top" onClick={logout}>Logout</button>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>

      {/* mobile floating nav */}
      <nav className="mobilebar">
        {admin ? (
          <div className="mbar no-fab">
            {adminNav.map((n) => <MobileNavItem key={n.to} item={n} />)}
          </div>
        ) : (
          <div className="mbar">
            {mobileLeft.map((p) => <MobileNavItem key={p} item={byPath[p]} />)}
            <span className="mbar-spacer" aria-hidden="true" />
            {mobileRight.map((p) => <MobileNavItem key={p} item={byPath[p]} />)}
            <button
              className={`fab ${loc.pathname.startsWith('/app/wallet') ? 'active' : ''}`}
              onClick={() => nav('/app/wallet')} aria-label="Wallet">
              <Icon name="wallet" size={26} strokeWidth={2.2} />
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
