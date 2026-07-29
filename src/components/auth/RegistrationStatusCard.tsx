import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { userRepo, sessionRepo } from '@/services/repositories'
import type { User, AccountStatus, Role, Session } from '@/types'
import { formatDate } from '@/utils/formatters'

const roleLabels: Record<Role, string> = {
  karyawan: 'Employee',
  itsupport: 'IT Support',
  vendor: 'Vendor',
  leaderit: 'Leader IT',
}

const statusConfig: Record<AccountStatus, { icon: string; color: string; bgColor: string; borderColor: string; label: string }> = {
  PendingApproval: {
    icon: '🟡',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    label: 'Pending Approval',
  },
  Active: {
    icon: '🟢',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    label: 'Account Approved',
  },
  Expired: {
    icon: '🟠',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    label: 'Account Expired',
  },
  Archived: {
    icon: '🔴',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    label: 'Registration Rejected',
  },
}

interface RegistrationStatusCardProps {
  onLoginFocus?: () => void
  onSessionCreated?: () => void
}

// Session storage keys for registration tracking (cleared when browser closes)
const REGISTRATION_STORAGE_KEYS = {
  email: 'lastRegisteredEmail',
  role: 'lastRegisteredRole',
  submitted: 'registrationSubmitted',
}

// Local storage keys for remembered account (persists across sessions)
const REMEMBERED_ACCOUNT_KEY = 'rememberedAccount'

// Interface for remembered account (safe data only - NO PASSWORD)
interface RememberedAccount {
  userId: string
  email: string
  name: string
  role: Role
  status: AccountStatus
  rememberedAt: string
}

// Helper functions for sessionStorage (privacy: only shows account registered in this browser session)
function getRegistrationInfo(): { email: string; role: Role; submitted: boolean } | null {
  try {
    const email = sessionStorage.getItem(REGISTRATION_STORAGE_KEYS.email)
    const role = sessionStorage.getItem(REGISTRATION_STORAGE_KEYS.role) as Role | null
    const submitted = sessionStorage.getItem(REGISTRATION_STORAGE_KEYS.submitted) === 'true'

    if (email && role && submitted) {
      return { email, role, submitted }
    }
    return null
  } catch {
    return null
  }
}

function setRegistrationInfo(email: string, role: Role): void {
  try {
    sessionStorage.setItem(REGISTRATION_STORAGE_KEYS.email, email)
    sessionStorage.setItem(REGISTRATION_STORAGE_KEYS.role, role)
    sessionStorage.setItem(REGISTRATION_STORAGE_KEYS.submitted, 'true')
  } catch {
    // Ignore storage errors
  }
}

export function clearRegistrationInfo(): void {
  try {
    sessionStorage.removeItem(REGISTRATION_STORAGE_KEYS.email)
    sessionStorage.removeItem(REGISTRATION_STORAGE_KEYS.role)
    sessionStorage.removeItem(REGISTRATION_STORAGE_KEYS.submitted)
  } catch {
    // Ignore storage errors
  }
}

// Remembered account functions (localStorage - persists across browser sessions)
export function getRememberedAccount(): RememberedAccount | null {
  try {
    const data = localStorage.getItem(REMEMBERED_ACCOUNT_KEY)
    if (!data) return null
    const account = JSON.parse(data) as RememberedAccount
    // Validate required fields exist
    if (account.userId && account.email && account.role && account.status) {
      return account
    }
    return null
  } catch {
    return null
  }
}

export function setRememberedAccount(user: User): void {
  try {
    const account: RememberedAccount = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status || 'Active',
      rememberedAt: new Date().toISOString(),
    }
    localStorage.setItem(REMEMBERED_ACCOUNT_KEY, JSON.stringify(account))
  } catch {
    // Ignore storage errors
  }
}

export function clearRememberedAccount(): void {
  try {
    localStorage.removeItem(REMEMBERED_ACCOUNT_KEY)
  } catch {
    // Ignore storage errors
  }
}

export function updateRememberedAccountStatus(status: AccountStatus): void {
  try {
    const account = getRememberedAccount()
    if (account) {
      account.status = status
      localStorage.setItem(REMEMBERED_ACCOUNT_KEY, JSON.stringify(account))
    }
  } catch {
    // Ignore storage errors
  }
}

// Create session directly for approved accounts (secure - validates status first)
async function createSessionForApprovedUser(user: User): Promise<Session | null> {
  // Security: Only allow session creation for Active accounts
  const userStatus = user.status || user.vendorStatus
  if (userStatus !== 'Active') {
    return null
  }

  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }

  await sessionRepo.setSession(session)
  return session
}

export function RegistrationStatusCard({ onLoginFocus: _onLoginFocus, onSessionCreated }: RegistrationStatusCardProps) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loginInProgress, setLoginInProgress] = useState(false)
  const registrationInfo = useRef(getRegistrationInfo())
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadUser = useCallback(async (showRefreshing = false) => {
    const info = registrationInfo.current
    if (!info?.email) {
      setLoading(false)
      return
    }

    if (showRefreshing) {
      setRefreshing(true)
    }

    try {
      const foundUser = await userRepo.getByEmail(info.email)
      setUser(foundUser)
    } catch (err) {
      console.error('Failed to load user:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadUser()
  }, [loadUser])

  // Auto-polling for status updates when pending (simulates realtime listener)
  useEffect(() => {
    const info = registrationInfo.current
    
    // Poll when pending - faster updates for better UX
    if (info?.email && user?.status === 'PendingApproval') {
      pollingIntervalRef.current = setInterval(() => {
        loadUser(false)
      }, 5000)
    }
    
    // Also poll briefly when status might be changing (recently registered)
    // This helps catch the approval moment faster
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [user?.status, loadUser])

  // Clear registration info if user is not found (deleted/rejected)
  useEffect(() => {
    if (!loading && registrationInfo.current && !user) {
      clearRegistrationInfo()
      registrationInfo.current = null
    }
  }, [loading, user])

  const getStatus = (): AccountStatus | null => {
    if (!user) return null
    if (user.status === 'Archived' || user.vendorStatus === 'Archived') return 'Archived'
    if (user.status === 'Expired' || user.vendorStatus === 'Expired') return 'Expired'
    if (user.status === 'PendingApproval' || user.vendorStatus === 'PendingApproval') return 'PendingApproval'
    if (user.status === 'Active' || user.vendorStatus === 'Active') return 'Active'
    return 'PendingApproval'
  }

  const getRegistrationDate = (): string => {
    if (user?.vendorTimeline && user.vendorTimeline.length > 0) {
      return formatDate(user.vendorTimeline[0].timestamp)
    }
    return formatDate(new Date().toISOString())
  }

  const handleRefresh = () => {
    loadUser(true)
  }

  const handleLoginNow = async () => {
    if (!user) return
    
    // Security: Verify user is still Active before creating session
    const currentStatus = getStatus()
    if (currentStatus !== 'Active') {
      return
    }

    setLoginInProgress(true)
    try {
      // Refresh user data to ensure it's current
      const freshUser = await userRepo.getByEmail(user.email)
      if (!freshUser || freshUser.status !== 'Active') {
        setLoginInProgress(false)
        return
      }

      // Remember the approved account (safe data only)
      setRememberedAccount(freshUser)
      
      // Create session directly for approved user
      const session = await createSessionForApprovedUser(freshUser)
      
      if (session) {
        // Clear registration tracking
        clearRegistrationInfo()
        registrationInfo.current = null
        
        // Notify parent to refresh auth state
        onSessionCreated?.()
      }
    } catch (err) {
      console.error('Failed to create session:', err)
    } finally {
      setLoginInProgress(false)
    }
  }

  const handleRegisterAgain = () => {
    clearRegistrationInfo()
    clearRememberedAccount()
    registrationInfo.current = null
    navigate('/register')
  }

  // Don't render if no registration info or still loading initially
  if (!registrationInfo.current || (loading && !refreshing)) {
    return null
  }

  // Don't render if user not found
  if (!user) {
    return null
  }

  const currentStatus = getStatus()
  const config = currentStatus ? statusConfig[currentStatus] : null
  const rejectReason = user.rejectReason || user.vendorRejectReason
  const rejectWhatsApp = user.rejectWhatsApp || user.vendorRejectWhatsApp

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStatus}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="mt-4"
      >
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">📌</span>
            <span className="text-sm font-medium text-text-primary">Registration Status</span>
          </div>

          {/* Status Badge */}
          {config && (
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-xl ${config.bgColor} ${config.borderColor} border flex items-center justify-center text-sm`}>
                {config.icon}
              </div>
              <span className={`font-medium ${config.color}`}>{config.label}</span>
            </div>
          )}

          {/* Registration Details */}
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wide">Role</p>
                <p className="text-text-primary text-sm font-medium mt-0.5">{roleLabels[user.role]}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wide">Submitted</p>
                <p className="text-text-primary text-sm font-medium mt-0.5">{getRegistrationDate()}</p>
              </div>
            </div>
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wide">Email</p>
              <p className="text-text-primary text-sm font-medium mt-0.5 break-all">{user.email}</p>
            </div>
          </div>

          {/* Status-specific content */}
          {currentStatus === 'PendingApproval' && (
            <>
              <div className="space-y-2 mb-3">
                <p className="text-text-muted text-xs uppercase tracking-wide">Current Step</p>
                <p className={`text-sm ${config?.color}`}>
                  Waiting for Leader IT Approval
                </p>
              </div>
              <p className="text-text-muted text-sm mb-4">
                Your account has been successfully created and is currently waiting for Leader IT approval.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-primary text-sm font-medium transition-colors disabled:opacity-50"
              >
                {refreshing ? 'Refreshing...' : 'Refresh Status'}
              </motion.button>
            </>
          )}

          {currentStatus === 'Active' && (
            <>
              <p className="text-text-secondary text-sm mb-4">
                Congratulations! Your account has been approved.
              </p>
              <p className="text-text-muted text-sm mb-4">
                Your account is ready to use. Click below to login automatically.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLoginNow}
                disabled={loginInProgress}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loginInProgress ? 'Logging in...' : 'Login Now'}
              </motion.button>
            </>
          )}

          {currentStatus === 'Archived' && (
            <>
              <p className="text-text-secondary text-sm mb-4">
                Your registration request was rejected.
              </p>
              {(rejectReason || rejectWhatsApp) && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 space-y-2">
                  {rejectReason && (
                    <div>
                      <p className="text-red-400 text-xs font-medium">Reason:</p>
                      <p className="text-text-secondary text-sm mt-0.5">{rejectReason}</p>
                    </div>
                  )}
                  {rejectWhatsApp && (
                    <div>
                      <p className="text-red-400 text-xs font-medium">WhatsApp Number:</p>
                      <p className="text-text-secondary text-sm mt-0.5">{rejectWhatsApp}</p>
                    </div>
                  )}
                </div>
              )}
              <p className="text-text-muted text-sm mb-4">
                If you still wish to join, please submit a new registration.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRegisterAgain}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-primary text-sm font-medium transition-colors"
              >
                Register Again
              </motion.button>
            </>
          )}

          {currentStatus === 'Expired' && (
            <>
              <p className="text-text-secondary text-sm mb-4">
                Your account access period has ended.
              </p>
              <p className="text-text-muted text-sm mb-4">
                Please contact Leader IT for assistance.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export { setRegistrationInfo }
