import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute, RoleGuard } from './guards'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
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

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
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
        <Route path="/tickets" element={<TicketsPage />} />
        <Route
          path="/tickets/create"
          element={
            <RoleGuard allowedRoles={['karyawan', 'itsupport']}>
              <CreateTicketPage />
            </RoleGuard>
          }
        />
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/assets/manage/:id" element={<AssetDetailPage />} />
        <Route path="/qr-assets" element={<QRAssetsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
