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
}

const TransitionContext = createContext<TransitionContextType | null>(null)

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [transitionId, setTransitionId] = useState(0)

  const startTransition = useCallback(() => {
    setIsActive(prev => {
      if (prev) return prev
      setTransitionId(id => id + 1)
      return true
    })
  }, [])

  const endTransition = useCallback(() => {
    setIsActive(false)
  }, [])

  return (
    <TransitionContext.Provider
      value={{
        isActive,
        startTransition,
        endTransition,
        transitionId,
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