import { BrowserRouter } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from '@/contexts/AuthContext'
import { TransitionProvider } from '@/contexts/TransitionContext'
import { AppRoutes } from '@/routes'
import { LoginTransition } from '@/components/auth/LoginTransition'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TransitionProvider>
          <AnimatePresence mode="wait">
            <AppRoutes />
          </AnimatePresence>
          <LoginTransition />
        </TransitionProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
