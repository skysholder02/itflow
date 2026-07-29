import { HashRouter, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from '@/contexts/AuthContext'
import { TransitionProvider } from '@/contexts/TransitionContext'
import { AppRoutes } from '@/routes'
import { LoginTransition } from '@/components/auth/LoginTransition'

const getTransitionKey = (pathname: string) => {
  if (pathname.match(/^\/assets\/[^/]+$/)) {
    return pathname
  }
  // All dashboard routes should use the same key to prevent layout remount
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/tickets') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/qr-assets') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/vendor/') ||
    pathname.startsWith('/leader/')
  ) {
    return 'dashboard-layout'
  }
  return pathname
}

function AppContent() {
  const location = useLocation()
  return (
    <>
      <AnimatePresence mode="sync">
        <AppRoutes key={getTransitionKey(location.pathname)} />
      </AnimatePresence>
      <LoginTransition />
    </>
  )
}

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <TransitionProvider>
          <AppContent />
        </TransitionProvider>
      </AuthProvider>
    </HashRouter>
  )
}
