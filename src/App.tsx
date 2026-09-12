/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { SMMLayout } from './components/layout/SMMLayout';
import { GuestOnly, HomeRedirect, RequireAuth } from './components/RequireAuth';
import { AuthProvider } from './contexts/AuthContext';
import { SMMProvider } from './contexts/SMMContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerificationPending from './pages/auth/VerificationPending';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

// SMM Pages
import SMMHome from './pages/smm/Home';
import SMMHub from './pages/smm/Hub';
import SMMMissions from './pages/smm/Missions';
import SMMRapidTasks from './pages/smm/RapidTasks';
import SMMMessages from './pages/smm/Messages';
import SMMCareer from './pages/smm/Career';
import SMMRewards from './pages/smm/Rewards';
import SMMWallet from './pages/smm/Wallet';

export default function App() {
  return (
    <AuthProvider>
      <SMMProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />

            {/* Public */}
            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
            <Route
              path="/verification"
              element={<RequireAuth area="verification"><VerificationPending /></RequireAuth>}
            />

            {/* Admin (platform) and Brand Admin */}
            <Route
              path="/admin"
              element={<RequireAuth area={['platform', 'brand']}><AdminLayout /></RequireAuth>}
            >
              {/* Platform Admin workspace across all brands: /admin/overview, /admin/brands, /admin/users, ... */}
              <Route index element={<HomeRedirect />} />
              <Route path=":tab" element={<RequireAuth area="platform"><AdminDashboard scope="platform" /></RequireAuth>} />
              <Route path="brand" element={<RequireAuth area="brand"><AdminDashboard scope="brand" /></RequireAuth>} />
              <Route path="brand/:tab" element={<RequireAuth area="brand"><AdminDashboard scope="brand" /></RequireAuth>} />
              <Route path="*" element={<HomeRedirect />} />
            </Route>

            {/* SMM Routes */}
            <Route path="/smm" element={<RequireAuth area="smm"><SMMLayout /></RequireAuth>}>
              <Route path="home" element={<SMMHome />} />
              <Route path="hub" element={<SMMHub />} />
              <Route path="missions" element={<SMMMissions />} />
              <Route path="rapid-tasks" element={<SMMRapidTasks />} />
              <Route path="messages" element={<SMMMessages />} />
              <Route path="career" element={<SMMCareer />} />
              <Route path="rewards" element={<SMMRewards />} />
              <Route path="wallet" element={<SMMWallet />} />
              {/* Fallbacks */}
              <Route path="*" element={<div className="p-8 text-center text-slate-500">Coming soon</div>} />
            </Route>

            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </BrowserRouter>
      </SMMProvider>
    </AuthProvider>
  );
}
