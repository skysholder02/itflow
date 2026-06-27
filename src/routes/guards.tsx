import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui'
import type { Role } from '@/types'
import type { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-48 h-12" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: Role[]
  fallback?: string
}

export function RoleGuard({ children, allowedRoles, fallback = '/dashboard' }: RoleGuardProps) {
  const { role, loading } = useAuth()

  if (loading) return null

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}
