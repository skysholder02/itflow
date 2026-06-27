import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

type TransitionPhase =
  | 'idle'
  | 'zoomBlur'
  | 'doorsClose'
  | 'doorsOpen'
  | 'reveal'
  | 'complete'

interface TransitionContextType {
  phase: TransitionPhase
  isTransitioning: boolean
  startTransition: () => void
  setPhase: (phase: TransitionPhase) => void
  completeTransition: () => void
}

const TransitionContext = createContext<TransitionContextType | null>(null)

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<TransitionPhase>('idle')

  const startTransition = useCallback(() => {
    setPhase('zoomBlur')
  }, [])

  const completeTransition = useCallback(() => {
    setPhase('idle')
  }, [])

  return (
    <TransitionContext.Provider
      value={{
        phase,
        isTransitioning: phase !== 'idle',
        startTransition,
        setPhase,
        completeTransition,
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
