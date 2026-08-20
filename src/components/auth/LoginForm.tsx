import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Input } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useTransition } from '@/contexts/TransitionContext'
import { VENDOR_PENDING_APPROVAL_ERROR, VENDOR_EXPIRED_ERROR, ACCOUNT_PENDING_APPROVAL_ERROR, ACCOUNT_EXPIRED_ERROR } from '@/services/authService'
import { fadeUp, fadeUpTransition } from '@/animations/variants'
import { RegistrationStatusCard, clearRegistrationInfo, getRememberedAccount, clearRememberedAccount } from './RegistrationStatusCard'
import { DemoAccountsView } from './DemoAccountsView'
import { userRepo, sessionRepo } from '@/services/repositories'
import type { Role, AccountStatus } from '@/types'

const emailSchema = z.string().email('Invalid email format')

const schema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

const roleLabels: Record<Role, string> = {
  karyawan: 'Employee',
  itsupport: 'IT Support',
  vendor: 'Vendor',
  leaderit: 'Leader IT',
}

export function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { login, refreshUser } = useAuth()
  const navigate = useNavigate()
  // Gunakan endTransition, bukan completeTransition
  const {
    startTransition,
    endTransition,
    startManualLogin,
    finishManualLogin,
  } = useTransition()
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
  const [showForgotHint, setShowForgotHint] = useState(false)
  const [step, setStep] = useState<'email' | 'password' | 'demo'>('email')
  const [confirmedEmail, setConfirmedEmail] = useState('')
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    getValues,
    clearErrors,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  // Check for remembered account on mount
  useEffect(() => {
    const checkRememberedAccount = async () => {
      const remembered = getRememberedAccount()
      if (remembered && remembered.status === 'Active') {
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
            clearRememberedAccount()
          }
        } catch {
          clearRememberedAccount()
        }
      }
    }
    checkRememberedAccount()
  }, [])

  // Track the current step so the entering step's animation completion can focus its input
  const currentStepRef = useRef(step)
  useEffect(() => {
    currentStepRef.current = step
  }, [step])

  // Guards against duplicate submissions from a single click / repeated Enter
  const emailCheckInFlightRef = useRef(false)

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return
    try {
      setError('')
      setExpiredEmail(null)

      // mulai flag manual login
      startManualLogin()
      // mulai animasi
      startTransition()

      // baru login
      await login(data.email, data.password)

      clearRegistrationInfo()
    } catch (err) {
      // Pakai endTransition, bukan completeTransition
      finishManualLogin()
      endTransition()

      if (err instanceof Error && (err.message === VENDOR_PENDING_APPROVAL_ERROR || err.message === ACCOUNT_PENDING_APPROVAL_ERROR)) {
        setError('Your account is still waiting for Leader IT approval.')
        return
      }
      if (err instanceof Error && (err.message === VENDOR_EXPIRED_ERROR || err.message === ACCOUNT_EXPIRED_ERROR)) {
        setError('Your account has expired.')
        setExpiredEmail(data.email)
        return
      }
      setError('Invalid email or password')
    }
  }

  const handleDemoSelect = (email: string, password: string) => {
    setValue('email', email)
    setValue('password', password)
    handleSubmit(onSubmit)()
  }

  const handleLoginFocus = () => {
    setFocus('email')
  }

  const handleEmailContinue = async () => {
    if (emailCheckInFlightRef.current) return
    setError('')
    setExpiredEmail(null)

    const email = getValues('email') ?? ''
    const emailResult = emailSchema.safeParse(email)
    if (!emailResult.success) {
      setFormError('email', { type: 'manual', message: 'Invalid email format' })
      return
    }
    clearErrors('email')

    emailCheckInFlightRef.current = true
    setIsCheckingEmail(true)
    try {
      const user = await userRepo.getByEmail(email)
      if (!user) {
        setError('No account found with this email.')
        return
      }
      setConfirmedEmail(email)
      setStep('password')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsCheckingEmail(false)
      emailCheckInFlightRef.current = false
    }
  }

  const handleBack = () => {
    setStep('email')
    setError('')
    setExpiredEmail(null)
    setValue('password', '')
    clearErrors('password')
  }

  const handleOpenDemo = () => {
    setError('')
    setExpiredEmail(null)
    clearErrors('email')
    setStep('demo')
  }

  const handleBackToSignIn = () => {
    setError('')
    setExpiredEmail(null)
    setStep('email')
  }

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (step === 'email') {
      void handleEmailContinue()
      return
    }
    void handleSubmit(onSubmit)(e)
  }

  const handleSessionCreated = async () => {
    startManualLogin()
    startTransition()

    await refreshUser()
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

      // Start transition before refreshing user
      startManualLogin()
      startTransition()
      await refreshUser()
    } catch (err) {
      // Pakai endTransition, bukan completeTransition
      finishManualLogin()
      endTransition()
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
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={fadeUpTransition}
      className="w-full max-w-md relative z-10"
    >
      <div className="text-center mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-[-0.02em]">
          Welcome, sir!
        </h1>
        <p className="text-sm text-text-secondary mt-2 font-[450] tracking-[-0.01em]">
          Sign in to continue to FIYRO
        </p>
      </div>

      <div
        className="rounded-3xl bg-white border border-black/[0.06] p-6 lg:p-8"
        style={{ boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.05)' }}
      >
        {/* Returning User Quick Login */}
        <AnimatePresence mode="wait">
          {step !== 'demo' && rememberedAccount && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="bg-surface-overlay border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                    <span className="text-green-500">🟢</span>
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
                    className="flex-1 !rounded-xl focus-visible:ring-2 focus-visible:ring-brand-primary/70 focus-visible:ring-offset-2"
                  >
                    {continueLoginInProgress ? 'Logging in...' : 'Continue Login'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleNotYou}
                    disabled={continueLoginInProgress}
                    className="px-3 !rounded-xl focus-visible:ring-2 focus-visible:ring-brand-primary/70 focus-visible:ring-offset-2"
                  >
                    Not You?
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout transition={{ duration: 0.25, ease: 'easeInOut' }}>
          <AnimatePresence mode="wait" initial={false}>
            {step === 'demo' ? (
              <motion.div
                key="demo"
                className="space-y-4"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
              >
                <DemoAccountsView onSelect={handleDemoSelect} onBack={handleBackToSignIn} />
              </motion.div>
            ) : (
              <motion.form
                key={step}
                onSubmit={onFormSubmit}
                noValidate
                className="space-y-4"
                initial={{ opacity: 0, x: step === 'email' ? -24 : 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: step === 'email' ? -24 : 24 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                onAnimationComplete={() => {
                  if (currentStepRef.current === step) {
                    setFocus(step === 'password' ? 'password' : 'email')
                  }
                }}
              >
                {step === 'email' ? (
                  <>
                    <Input
                      label="Email"
                      id="email"
                      type="email"
                      placeholder="email@company.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    {error && (
                      <div className="text-sm text-red-500 text-center">
                        <p>{error}</p>
                      </div>
                    )}
                    <Button
                      type="submit"
                      loading={isCheckingEmail}
                      className="w-full !rounded-xl focus-visible:ring-2 focus-visible:ring-brand-primary/70 focus-visible:ring-offset-2"
                    >
                      Continue
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleOpenDemo}
                        className="text-xs text-brand-primary hover:underline font-medium cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
                      >
                        View demo accounts
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center">
                      <span className="inline-flex max-w-full items-center justify-center rounded-full border border-black/[0.06] bg-black/[0.03] px-4 py-1.5 text-xs font-medium text-text-muted">
                        <span className="truncate">{confirmedEmail}</span>
                      </span>
                    </div>
                    <Input
                      label="Password"
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      error={errors.password?.message}
                      {...register('password')}
                    />
                    {error && (
                      <div className="text-sm text-red-500 text-center space-y-2">
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
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      className="w-full !rounded-xl focus-visible:ring-2 focus-visible:ring-brand-primary/70 focus-visible:ring-offset-2"
                    >
                      Sign In
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleBack}
                      className="w-full !rounded-xl focus-visible:ring-2 focus-visible:ring-brand-primary/70 focus-visible:ring-offset-2"
                    >
                      Back
                    </Button>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForgotHint((v) => !v)}
                        aria-expanded={showForgotHint}
                        className="text-xs text-brand-primary hover:underline font-medium cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
                      >
                        Forgot password?
                      </button>
                    </div>
                    {showForgotHint && (
                      <p className="-mt-2 text-xs text-slate-500">
                        Contact your Leader IT to reset your password.
                      </p>
                    )}
                  </>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {step !== 'demo' && (
          <>
            <div className="text-center pt-4">
              <p className="text-xs text-text-muted">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-brand-primary hover:underline font-medium cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
                >
                  Create account
                </button>
              </p>
            </div>

            {/* Registration Status Card - shows after registering on this browser session */}
            <RegistrationStatusCard
              onLoginFocus={handleLoginFocus}
              onSessionCreated={handleSessionCreated}
            />
          </>
        )}
      </div>
    </motion.div>
  )
}