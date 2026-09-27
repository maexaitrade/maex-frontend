import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminSetup from './pages/AdminSetup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import Wallet from './pages/Wallet';
import Team from './pages/Team';
import Profile from './pages/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminUsers from './pages/admin/AdminUsers';
import AdminConfig from './pages/admin/AdminConfig';
import AdminReports from './pages/admin/AdminReports';
import AdminAudit from './pages/admin/AdminAudit';

function RequireAuth({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-setup" element={<AdminSetup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/app" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="packages" element={<Packages />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="team" element={<Team />} />
        <Route path="profile" element={<Profile />} />
        {/* legacy paths now live inside Wallet */}
        <Route path="deposit" element={<Navigate to="/app/wallet?tab=deposit" replace />} />
        <Route path="withdraw" element={<Navigate to="/app/wallet?tab=withdraw" replace />} />
        <Route path="history" element={<Navigate to="/app/wallet?tab=history" replace />} />
      </Route>

      <Route path="/admin" element={<RequireAuth role="admin"><Layout admin /></RequireAuth>}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="deposits" element={<AdminDeposits />} />
        <Route path="withdrawals" element={<AdminWithdrawals />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="config" element={<AdminConfig />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="audit" element={<AdminAudit />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
