import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { authService } from '@/services/authService'
import { seedDatabase } from '@/services/repositories/local/seed'
import type { Session, User, Role } from '@/types'

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
    seedDatabase()
    refreshUser().finally(() => setLoading(false))
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    const newSession = await authService.login(email, password)
    setSession(newSession)
    const currentUser = await authService.getCurrentUser()
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
