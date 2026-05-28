/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import PublicTemplates from './pages/PublicTemplates';
import PublicPricing from './pages/PublicPricing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import TemplatesManager from './pages/dashboard/TemplatesManager';
import PlaceholderPage from './pages/dashboard/PlaceholderPage';
import Invitations from './pages/dashboard/Invitations';
import CreateInvitation from './pages/dashboard/CreateInvitation';
import Guests from './pages/dashboard/Guests';
import PublicInvitation from './pages/PublicInvitation';
import Rsvp from './pages/dashboard/Rsvp';
import Transactions from './pages/dashboard/Transactions';
import Settings from './pages/dashboard/Settings';
import Wishes from './pages/dashboard/Wishes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/templates" element={<PublicTemplates />} />
        <Route path="/pricing" element={<PublicPricing />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

        {/* Dashboard Routes (Protected) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          
          {/* Admin Only Routes */}
          <Route 
            path="templates" 
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <TemplatesManager />
              </ProtectedRoute>
            } 
          />
          
          {/* Shared Routes */}
          <Route path="invitations" element={<Invitations />} />
          <Route path="invitations/create" element={<CreateInvitation />} />
          <Route path="guests" element={<Guests />} />
          <Route path="rsvp" element={<Rsvp />} />
          <Route path="wishes" element={<Wishes />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="settings" element={<Settings />} />
        </Route>
         
        {/* Public dynamic invitation path */}
        <Route path="/preview/:templateSlug" element={<PublicInvitation />} />
        <Route path="/:invitationSlug" element={<PublicInvitation />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

