import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { authService } from '@/services/authService'
import { migrateDatabase, seedDatabase } from '@/services/repositories/local/seed'
import type { Session, User, Role } from '@/types'

// Thrown when a login network leg stalls longer than LOGIN_TIMEOUT_MS so the UI
// can end the transition with a real error instead of hanging forever.
export const LOGIN_TIMEOUT_ERROR = 'LOGIN_TIMEOUT'

const LOGIN_TIMEOUT_MS = 20000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(LOGIN_TIMEOUT_ERROR)), ms)
    promise.then(
      value => {
        window.clearTimeout(timer)
        resolve(value)
      },
      error => {
        window.clearTimeout(timer)
        reject(error)
      },
    )
  })
}

interface AuthContextType {
  user: User | null
  session: Session | null
  role: Role | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const currentSession = await authService.getSession()
    if (currentSession) {
      setSession(currentSession)
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } else {
      setSession(null)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    migrateDatabase()
    seedDatabase()
    refreshUser().finally(() => setLoading(false))
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    // Atomic handoff: auth state commits only after BOTH network legs succeed,
    // each bounded by a timeout so a stalled socket can't freeze the pipeline.
    const newSession = await withTimeout(authService.login(email, password), LOGIN_TIMEOUT_MS)
    const currentUser = await withTimeout(authService.getCurrentUser(), LOGIN_TIMEOUT_MS)
    setSession(newSession)
    setUser(currentUser)
  }

  const logout = async () => {
    await authService.logout()
    setSession(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role: session?.role ?? null,
        isAuthenticated: !!session,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
