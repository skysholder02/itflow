import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { GlowBackground } from '@/components/ui'
import { PageTransition } from '@/components/ui'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useTransition } from '@/contexts/TransitionContext'
import { VendorStatusScreen } from '@/components/vendor/VendorStatusScreen'
import { isVendorDashboardBlocked, resolveVendorStatus } from '@/utils/vendorStatus'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()
  const { theme } = useTheme()
  const { isActive, signalDashboardReady } = useTransition()

  const handlePageAnimationComplete = useCallback(() => {
    if (isActive) signalDashboardReady()
  }, [isActive, signalDashboardReady])

  // If vendor is blocked, there's no entrance animation to wait for.
  useEffect(() => {
    if (user?.role === 'vendor' && isVendorDashboardBlocked(resolveVendorStatus(user)) && isActive) {
      signalDashboardReady()
    }
  }, [user, isActive, signalDashboardReady])

  // Fail-safe for the login-transition handshake: if the entrance-animation
  // completion never fires (interrupted/throttled), still signal readiness so
  // the login transition can proceed. Normal flow signals earlier via
  // PageTransition's onAnimationComplete below.
  useEffect(() => {
    if (!isActive || !user) return
    const timer = window.setTimeout(signalDashboardReady, 1500)
    return () => window.clearTimeout(timer)
  }, [isActive, user, signalDashboardReady])

  if (user?.role === 'vendor' && isVendorDashboardBlocked(resolveVendorStatus(user))) {
    return <VendorStatusScreen />
  }

  return (
    <div className={`flex min-h-screen relative${theme === 'light' ? ' light-theme' : ''}`}>
      <GlowBackground />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname} onAnimationComplete={handlePageAnimationComplete}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
