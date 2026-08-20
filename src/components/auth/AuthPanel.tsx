import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

type AuthMode = 'login' | 'register'

export function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
        >
          {mode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setMode('register')} />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setMode('login')}
              onSuccess={() => setMode('login')}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}