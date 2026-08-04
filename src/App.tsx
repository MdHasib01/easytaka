import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RequireAuth } from './components/auth/RequireAuth';
import { LoginPage } from './components/auth/LoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { SMMLayout } from './components/smm/SMMLayout';
import { AppRole } from './types';

// Admin Pages
import { CommandCenterPage } from './components/admin/CommandCenterPage';
import { BrandsPage } from './components/admin/BrandsPage';
import { WorkforcePage } from './components/admin/WorkforcePage';
import { MissionsPage } from './components/admin/MissionsPage';
import { RapidCenterPage } from './components/admin/RapidCenterPage';
import { ReviewCenterPage } from './components/admin/ReviewCenterPage';
import { AdminAcademyPage } from './components/admin/AdminAcademyPage';
import { GamificationPage } from './components/admin/GamificationPage';
import { AdminWalletPage } from './components/admin/AdminWalletPage';
import { PayrollPage } from './components/admin/PayrollPage';
import { ReportsPage } from './components/admin/ReportsPage';
import { AuditLogsPage } from './components/admin/AuditLogsPage';
import { SettingsPage } from './components/admin/SettingsPage';

// SMM Pages
import { SMMHomePage } from './components/smm/SMMHomePage';
import { SMMMissionsPage } from './components/smm/SMMMissionsPage';
import { SMMRapidPage } from './components/smm/SMMRapidPage';
import { MissionDetailsPage } from './components/smm/MissionDetailsPage';
import { SMMCareerPage } from './components/smm/SMMCareerPage';
import { SMMWalletPage } from './components/smm/SMMWalletPage';
import { SMMAcademyPage } from './components/smm/SMMAcademyPage';
import { SMMProfilePage } from './components/smm/SMMProfilePage';
import { SMMNotificationsPage } from './components/smm/SMMNotificationsPage';
import { SMMSalaryProgressPage } from './components/smm/SMMSalaryProgressPage';
import { SMMLeavePage } from './components/smm/SMMLeavePage';
import { SMMAppealsPage } from './components/smm/SMMAppealsPage';
import { SMMSupportPage } from './components/smm/SMMSupportPage';

const homeFor = (role: AppRole) => (role === 'admin' ? '/admin/command-center' : '/smm/home');

/** Wraps an admin page in its guard + layout. */
const admin = (page: React.ReactNode) => (
  <RequireAuth role="admin">
    <AdminLayout>{page}</AdminLayout>
  </RequireAuth>
);

/** Wraps an SMM page in its guard + layout. */
const smm = (page: React.ReactNode) => (
  <RequireAuth role="smm">
    <SMMLayout>{page}</SMMLayout>
  </RequireAuth>
);

const AppRoutes: React.FC = () => {
  // Role now comes from the authenticated session, not from local UI state.
  const { user, loading } = useAuth();
  const location = useLocation();

  const fallback = user ? homeFor(user.role as AppRole) : '/login';

  if (location.pathname === '/') {
    if (loading) return null; // avoid bouncing to /login while the session restores
    return <Navigate to={fallback} replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Routes */}
      <Route path="/admin/command-center" element={admin(<CommandCenterPage />)} />
      <Route path="/admin/brands" element={admin(<BrandsPage />)} />
      <Route path="/admin/workforce" element={admin(<WorkforcePage />)} />
      <Route path="/admin/missions" element={admin(<MissionsPage />)} />
      <Route path="/admin/rapid-center" element={admin(<RapidCenterPage />)} />
      <Route path="/admin/review-center" element={admin(<ReviewCenterPage />)} />
      <Route path="/admin/academy" element={admin(<AdminAcademyPage />)} />
      <Route path="/admin/gamification" element={admin(<GamificationPage />)} />
      <Route path="/admin/wallet" element={admin(<AdminWalletPage />)} />
      <Route path="/admin/payroll" element={admin(<PayrollPage />)} />
      <Route path="/admin/reports" element={admin(<ReportsPage />)} />
      <Route path="/admin/audit-logs" element={admin(<AuditLogsPage />)} />
      <Route path="/admin/settings" element={admin(<SettingsPage />)} />

      {/* SMM Routes */}
      <Route path="/smm/home" element={smm(<SMMHomePage />)} />
      <Route path="/smm/missions" element={smm(<SMMMissionsPage />)} />
      <Route path="/smm/rapid" element={smm(<SMMRapidPage />)} />
      <Route path="/smm/mission-details" element={smm(<MissionDetailsPage />)} />
      <Route path="/smm/career" element={smm(<SMMCareerPage />)} />
      <Route path="/smm/wallet" element={smm(<SMMWalletPage />)} />
      <Route path="/smm/academy" element={smm(<SMMAcademyPage />)} />
      <Route path="/smm/profile" element={smm(<SMMProfilePage />)} />
      <Route path="/smm/notifications" element={smm(<SMMNotificationsPage />)} />
      <Route path="/smm/salary-progress" element={smm(<SMMSalaryProgressPage />)} />
      <Route path="/smm/leave" element={smm(<SMMLeavePage />)} />
      <Route path="/smm/appeals" element={smm(<SMMAppealsPage />)} />
      <Route path="/smm/support" element={smm(<SMMSupportPage />)} />

      <Route path="*" element={<Navigate to={fallback} replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* AppProvider sits inside AuthProvider — it loads data with the token. */}
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
