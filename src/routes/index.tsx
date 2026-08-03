import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute, RoleGuard, GuestOnlyRoute, } from './guards'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { TicketsPage } from '@/pages/tickets/TicketsPage'
import { CreateTicketPage } from '@/pages/tickets/CreateTicketPage'
import { TicketDetailPage } from '@/pages/tickets/TicketDetailPage'
import { AssetsPage } from '@/pages/assets/AssetsPage'
import { AssetDetailPage } from '@/pages/assets/AssetDetailPage'
import { QRAssetsPage } from '@/pages/assets/QRAssetsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { DashboardLayout } from '@/layouts/DashboardLayout'

// Vendor specific pages
import { MyJobs } from '@/pages/vendor/MyJobs'
import { JobDetailPage } from '@/pages/vendor/JobDetailPage'
import { AccountTimelinePage } from '@/pages/vendor/AccountTimelinePage'
import { MaterialNotesPage } from '@/pages/vendor/MaterialNotesPage'
import { DocumentationPage } from '@/pages/vendor/DocumentationPage'
import { ExtensionRequestPage } from '@/pages/vendor/ExtensionRequestPage'

// Leader & IT Support specific pages
import { UserManagementPage } from '@/pages/leader/UserManagementPage'
import { VendorManagementPage } from '@/pages/leader/VendorManagementPage'
import { JobManagementPage } from '@/pages/leader/JobManagementPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route
  path="/"
  element={
    <GuestOnlyRoute>
      <LandingPage />
    </GuestOnlyRoute>
  }
/>
      <Route
  path="/login"
  element={
    <GuestOnlyRoute>
      <LoginPage />
    </GuestOnlyRoute>
  }
/>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/vendor/extension-request" element={<ExtensionRequestPage />} />
      <Route
        path="/assets/:id"
        element={<AssetDetailPage publicView />}
      />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Guard tickets, assets, qr-assets against Vendor role */}
        <Route
          path="/tickets"
          element={
            <RoleGuard allowedRoles={['karyawan', 'itsupport', 'leaderit']}>
              <TicketsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/tickets/create"
          element={
            <RoleGuard allowedRoles={['karyawan', 'itsupport']}>
              <CreateTicketPage />
            </RoleGuard>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <RoleGuard allowedRoles={['karyawan', 'itsupport', 'leaderit']}>
              <TicketDetailPage />
            </RoleGuard>
          }
        />
        <Route
          path="/assets"
          element={
            <RoleGuard allowedRoles={['karyawan', 'itsupport', 'leaderit']}>
              <AssetsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/assets/manage/:id"
          element={
            <RoleGuard allowedRoles={['karyawan', 'itsupport', 'leaderit']}>
              <AssetDetailPage />
            </RoleGuard>
          }
        />
        <Route
          path="/qr-assets"
          element={
            <RoleGuard allowedRoles={['karyawan', 'itsupport', 'leaderit']}>
              <QRAssetsPage />
            </RoleGuard>
          }
        />

        {/* Vendor Routes */}
        <Route
          path="/vendor/jobs"
          element={
            <RoleGuard allowedRoles={['vendor']}>
              <MyJobs />
            </RoleGuard>
          }
        />
        <Route
          path="/vendor/jobs/:id"
          element={
            <RoleGuard allowedRoles={['vendor', 'itsupport', 'leaderit']}>
              <JobDetailPage />
            </RoleGuard>
          }
        />
        <Route
          path="/vendor/timeline"
          element={
            <RoleGuard allowedRoles={['vendor']}>
              <AccountTimelinePage />
            </RoleGuard>
          }
        />
        <Route
          path="/vendor/materials"
          element={
            <RoleGuard allowedRoles={['vendor']}>
              <MaterialNotesPage />
            </RoleGuard>
          }
        />
        <Route
          path="/vendor/documentation"
          element={
            <RoleGuard allowedRoles={['vendor']}>
              <DocumentationPage />
            </RoleGuard>
          }
        />

        {/* Leader & IT Support Vendor Management Routes */}
        <Route
          path="/leader/users"
          element={
            <RoleGuard allowedRoles={['leaderit']}>
              <UserManagementPage />
            </RoleGuard>
          }
        />
        <Route
          path="/leader/vendors"
          element={
            <RoleGuard allowedRoles={['leaderit']}>
              <VendorManagementPage />
            </RoleGuard>
          }
        />
        <Route
          path="/leader/jobs"
          element={
            <RoleGuard allowedRoles={['leaderit', 'itsupport']}>
              <JobManagementPage />
            </RoleGuard>
          }
        />

        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
