import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

interface TransitionContextType {
  isActive: boolean
  startTransition: () => void
  endTransition: () => void
  transitionId: number
  dashboardReady: boolean
  signalDashboardReady: () => void
  manualLoginInProgress: boolean
  startManualLogin: () => void
  finishManualLogin: () => void
  // TEMPORARY DIAGNOSTIC: identifies which provider generation/instance a
  // consumer is subscribed to. Remove once the login-transition investigation
  // is complete.
  providerId: string
}

const TransitionContext = createContext<TransitionContextType | null>(null)

// TEMPORARY DIAGNOSTICS (dev-only output). If Vite HMR leaves two module
// generations alive simultaneously, these random per-evaluation tags differ
// between the provider module and the consumer module, which proves H1.
const PROVIDER_MODULE_GEN = Math.random().toString(36).slice(2, 8)
let providerInstanceCounter = 0

const devLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.info('[FIYRO-TRANSITION]', ...args)
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [transitionId, setTransitionId] = useState(0)
  const [dashboardReady, setDashboardReady] = useState(false)
  const [manualLoginInProgress, setManualLoginInProgress] = useState(false)
  // Guards against duplicate transition starts without impure state updaters.
  const activeRef = useRef(false)

  const providerIdRef = useRef<string | null>(null)
  if (providerIdRef.current === null) {
    providerInstanceCounter += 1
    providerIdRef.current = `${PROVIDER_MODULE_GEN}#${providerInstanceCounter}`
  }
  const providerId = providerIdRef.current

  const startTransition = useCallback(() => {
    if (activeRef.current) {
      devLog('startTransition IGNORED (already active)', { providerId })
      return
    }
    devLog('startTransition', { providerId })
    activeRef.current = true
    setDashboardReady(false)
    setTransitionId(id => id + 1)
    setIsActive(true)
  }, [providerId])

  const endTransition = useCallback(() => {
    devLog('endTransition invoked', { providerId })
    activeRef.current = false
    setIsActive(false)
    setDashboardReady(false)
  }, [providerId])

  const signalDashboardReady = useCallback(() => {
    devLog('signalDashboardReady', { providerId })
    setDashboardReady(true)
  }, [providerId])

  const startManualLogin = useCallback(() => {
  setManualLoginInProgress(true)
}, [])

const finishManualLogin = useCallback(() => {
  setManualLoginInProgress(false)
}, [])

  return (
    <TransitionContext.Provider
      value={{
        isActive,
        startTransition,
        endTransition,
        transitionId,
        dashboardReady,
        signalDashboardReady,
        manualLoginInProgress,
        startManualLogin,
        finishManualLogin,
        providerId,
      }}
    >
      {children}
    </TransitionContext.Provider>
  )
}

export function useTransition() {
  const context = useContext(TransitionContext)
  if (!context) throw new Error('useTransition must be used within TransitionProvider')
  return context
}
