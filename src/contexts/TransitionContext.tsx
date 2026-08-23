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
}

const TransitionContext = createContext<TransitionContextType | null>(null)

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [transitionId, setTransitionId] = useState(0)
  const [dashboardReady, setDashboardReady] = useState(false)
  const [manualLoginInProgress, setManualLoginInProgress] = useState(false)
  // Guards against duplicate transition starts without impure state updaters.
  const activeRef = useRef(false)

  const startTransition = useCallback(() => {
    if (activeRef.current) return
    activeRef.current = true
    setDashboardReady(false)
    setTransitionId(id => id + 1)
    setIsActive(true)
  }, [])

  const endTransition = useCallback(() => {
    activeRef.current = false
    setIsActive(false)
    setDashboardReady(false)
  }, [])

  const signalDashboardReady = useCallback(() => {
    setDashboardReady(true)
  }, [])

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