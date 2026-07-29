import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Input, Card, Logo, GlowBackground } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useTransition } from '@/contexts/TransitionContext'
import { DEMO_ACCOUNTS } from '@/data/demoAccounts'
import { VENDOR_PENDING_APPROVAL_ERROR, VENDOR_EXPIRED_ERROR, ACCOUNT_PENDING_APPROVAL_ERROR, ACCOUNT_EXPIRED_ERROR } from '@/services/authService'
import { fadeUp, fadeUpTransition } from '@/animations/variants'
import { RegistrationStatusCard, clearRegistrationInfo, getRememberedAccount, clearRememberedAccount } from './RegistrationStatusCard'
import { userRepo, sessionRepo } from '@/services/repositories'
import type { Role, AccountStatus } from '@/types'

const schema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Kata Sandi wajib diisi'),
})

type FormData = z.infer<typeof schema>

const roleLabels: Record<Role, string> = {
  karyawan: 'Employee',
  itsupport: 'IT Support',
  vendor: 'Vendor',
  leaderit: 'Leader IT',
}

export function LoginForm() {
  const { login, refreshUser } = useAuth()
  const navigate = useNavigate()
  const { startTransition } = useTransition()
  const [error, setError] = useState('')
  const [expiredEmail, setExpiredEmail] = useState<string | null>(null)
  const [rememberedAccount, setRememberedAccount] = useState<{
    userId: string
    email: string
    name: string
    role: Role
    status: AccountStatus
  } | null>(null)
  const [continueLoginInProgress, setContinueLoginInProgress] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  // Check for remembered account on mount
  useEffect(() => {
    const checkRememberedAccount = async () => {
      const remembered = getRememberedAccount()
      if (remembered && remembered.status === 'Active') {
        // Verify the account still exists and is active
        try {
          const user = await userRepo.getById(remembered.userId)
          if (user && user.status === 'Active') {
            setRememberedAccount({
              userId: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              status: user.status,
            })
          } else {
            // Account no longer valid, clear remembered
            clearRememberedAccount()
          }
        } catch {
          clearRememberedAccount()
        }
      }
    }
    checkRememberedAccount()
  }, [])

  const onSubmit = async (data: FormData) => {
    try {
      setError('')
      setExpiredEmail(null)
      await login(data.email, data.password)
      // Clear registration info after successful login
      clearRegistrationInfo()
      startTransition()
    } catch (err) {
      if (err instanceof Error && (err.message === VENDOR_PENDING_APPROVAL_ERROR || err.message === ACCOUNT_PENDING_APPROVAL_ERROR)) {
        setError('Your account is still waiting for Leader IT approval.')
        return
      }
      if (err instanceof Error && (err.message === VENDOR_EXPIRED_ERROR || err.message === ACCOUNT_EXPIRED_ERROR)) {
        setError('Your account has expired.')
        setExpiredEmail(data.email)
        return
      }
      setError('Email atau kata sandi salah')
    }
  }

  const fillDemo = (email: string, password: string) => {
    setValue('email', email)
    setValue('password', password)
  }

  const handleLoginFocus = () => {
    setFocus('email')
  }

  const handleSessionCreated = async () => {
    await refreshUser()
    startTransition()
  }

  const handleContinueLogin = async () => {
    if (!rememberedAccount) return

    setContinueLoginInProgress(true)
    try {
      // Verify account is still active
      const user = await userRepo.getById(rememberedAccount.userId)
      if (!user || user.status !== 'Active') {
        clearRememberedAccount()
        setRememberedAccount(null)
        setContinueLoginInProgress(false)
        return
      }

      // Create session directly
      await sessionRepo.setSession({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      })

      // Clear registration tracking
      clearRegistrationInfo()

      // Refresh auth state
      await refreshUser()
      startTransition()
    } catch (err) {
      console.error('Continue login failed:', err)
    } finally {
      setContinueLoginInProgress(false)
    }
  }

  const handleNotYou = () => {
    clearRememberedAccount()
    setRememberedAccount(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6">
      <GlowBackground />
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={fadeUpTransition}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center" />
          <p className="text-text-muted mt-4">Masuk ke akun Anda</p>
        </div>

        <Card>
          {/* Returning User Quick Login */}
          <AnimatePresence mode="wait">
            {rememberedAccount && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                      <span className="text-green-400">🟢</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-text-muted uppercase tracking-wide">Continue as</p>
                      <p className="text-text-primary font-medium">{rememberedAccount.name}</p>
                      <p className="text-text-muted text-xs">{roleLabels[rememberedAccount.role]} Account</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleContinueLogin}
                      disabled={continueLoginInProgress}
                      className="flex-1"
                    >
                      {continueLoginInProgress ? 'Logging in...' : 'Continue Login'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleNotYou}
                      disabled={continueLoginInProgress}
                      className="px-3"
                    >
                      Not You?
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              id="email"
              type="email"
              placeholder="email@perusahaan.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Kata Sandi"
              id="password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            {error && (
              <div className="text-sm text-red-400 text-center space-y-2">
                <p>{error}</p>
                {expiredEmail && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/vendor/extension-request?email=${encodeURIComponent(expiredEmail)}`)}
                    className="mt-2"
                  >
                    Request Extension
                  </Button>
                )}
              </div>
            )}
            <Button type="submit" loading={isSubmitting} className="w-full">
              Login
            </Button>
            <div className="text-center mt-4">
              <p className="text-xs text-text-muted">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-brand-primary hover:underline font-medium cursor-pointer"
                >
                  Daftar
                </button>
              </p>
            </div>
          </form>

          {/* Registration Status Card - appears between registration link and demo accounts */}
          <RegistrationStatusCard 
            onLoginFocus={handleLoginFocus}
            onSessionCreated={handleSessionCreated}
          />

          <div className="mt-6 pt-6 border-t border-white/6">
            <p className="text-xs text-text-muted text-center mb-3">🎮 Demo Accounts</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account.email, account.password)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm cursor-pointer"
                >
                  <span className="text-text-primary font-medium">{account.label}</span>
                  <span className="text-text-muted ml-2">{account.email}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
