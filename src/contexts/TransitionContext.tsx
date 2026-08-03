import {
  createContext,
  useContext,
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

  const startTransition = useCallback(() => {
    setIsActive(prev => {
      if (prev) return prev
      setTransitionId(id => id + 1)
      setDashboardReady(false)
      return true
    })
  }, [])

  const endTransition = useCallback(() => {
    setIsActive(false)
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