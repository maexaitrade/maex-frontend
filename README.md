# MAEX Trade — UI

Futuristic, responsive frontend for the MAEX Trade API, built with
**React 18 + Vite + React Router**. Dark glassmorphism theme, neon accents,
mobile-first (sidebar collapses to a bottom nav on phones).

> College project UI for the MAEX Trade simulation. See the backend repo
> (`../metrix-plan`) for the API and the plan.

## Requirements
- Node.js 18+
- The **MAEX Trade API** running (default `http://localhost:4000`). Start it from
  the backend repo with `npm start` (and its MySQL container).

## Setup
```bash
npm install
# API URL (defaults to http://localhost:4000/api)
echo "VITE_API_URL=http://localhost:4000/api" > .env
npm run dev            # http://localhost:5173
```

Build for production: `npm run build` → `dist/` (preview with `npm run preview`).

## What's inside
**Member area** (`/app/*`)
- **Dashboard** — wallet, total earned, team business, rank, active-package 2×
  cap progress bar, income breakdown (ROI / referral / booster / reward),
  referral link.
- **Packages** — tiers + buy form (auto-matches the amount to a tier).
- **Deposit** — TRC-20 deposit form + history.
- **Withdraw** — request with live 6% charge / net preview + history.
- **Team** — levels 1–3 with per-member deposits and team business.
- **History** — full ledger with type filter and pagination.
- **Profile** — account info + TRC-20 payout address.

**Admin area** (`/admin/*`, role-gated)
- **Deposits / Payouts** — approve/reject queues with status tabs.
- **Users** — member list with balances, rank, status.
- **Config** — create/update packages, ranks, and plan settings.
- **Reports** — totals + payout distribution.

## Structure
```
src/
  api/client.js        fetch wrapper (JWT from localStorage)
  context/             AuthContext, ToastContext
  components/          Layout (responsive nav), ui.jsx (StatCard, Progress, Badge…)
  pages/               Login, Register, Dashboard, Packages, Deposit, Withdraw,
                       Team, History, Profile
  pages/admin/         AdminDeposits, AdminWithdrawals, AdminUsers,
                       AdminConfig, AdminReports
  styles.css           the whole futuristic theme (CSS variables + responsive)
```

## Notes
- Auth token + user are kept in `localStorage`; refreshing keeps you signed in.
- The API has CORS enabled, so the Vite dev server talks to it directly.
- Register with a sponsor via `…/register?ref=<memberId>` (the dashboard gives
  each member their own referral link).
