import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute, RoleGuard, GuestOnlyRoute, } from './guards'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { Skeleton } from '@/components/ui'

const DashboardLayout = lazy(() =>
  import('@/layouts/DashboardLayout').then((m) => ({ default: m.DashboardLayout })),
)
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const TicketsPage = lazy(() =>
  import('@/pages/tickets/TicketsPage').then((m) => ({ default: m.TicketsPage })),
)
const CreateTicketPage = lazy(() =>
  import('@/pages/tickets/CreateTicketPage').then((m) => ({ default: m.CreateTicketPage })),
)
const TicketDetailPage = lazy(() =>
  import('@/pages/tickets/TicketDetailPage').then((m) => ({ default: m.TicketDetailPage })),
)
const AssetsPage = lazy(() =>
  import('@/pages/assets/AssetsPage').then((m) => ({ default: m.AssetsPage })),
)
const AssetDetailPage = lazy(() =>
  import('@/pages/assets/AssetDetailPage').then((m) => ({ default: m.AssetDetailPage })),
)
const QRAssetsPage = lazy(() =>
  import('@/pages/assets/QRAssetsPage').then((m) => ({ default: m.QRAssetsPage })),
)
const ProfilePage = lazy(() =>
  import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)

// Vendor specific pages
const MyJobs = lazy(() => import('@/pages/vendor/MyJobs').then((m) => ({ default: m.MyJobs })))
const JobDetailPage = lazy(() =>
  import('@/pages/vendor/JobDetailPage').then((m) => ({ default: m.JobDetailPage })),
)
const AccountTimelinePage = lazy(() =>
  import('@/pages/vendor/AccountTimelinePage').then((m) => ({ default: m.AccountTimelinePage })),
)
const MaterialNotesPage = lazy(() =>
  import('@/pages/vendor/MaterialNotesPage').then((m) => ({ default: m.MaterialNotesPage })),
)
const DocumentationPage = lazy(() =>
  import('@/pages/vendor/DocumentationPage').then((m) => ({ default: m.DocumentationPage })),
)
const ExtensionRequestPage = lazy(() =>
  import('@/pages/vendor/ExtensionRequestPage').then((m) => ({ default: m.ExtensionRequestPage })),
)

// Leader & IT Support specific pages
const UserManagementPage = lazy(() =>
  import('@/pages/leader/UserManagementPage').then((m) => ({ default: m.UserManagementPage })),
)
const VendorManagementPage = lazy(() =>
  import('@/pages/leader/VendorManagementPage').then((m) => ({ default: m.VendorManagementPage })),
)
const JobManagementPage = lazy(() =>
  import('@/pages/leader/JobManagementPage').then((m) => ({ default: m.JobManagementPage })),
)

function LazyRouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Skeleton className="w-48 h-12" />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LazyRouteFallback />}>
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
    </Suspense>
  )
}