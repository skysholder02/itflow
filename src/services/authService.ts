import { userRepo, sessionRepo } from '@/services/repositories'
import type { Session, User } from '@/types'

export const authService = {
  async login(email: string, password: string): Promise<Session> {
    const user = await userRepo.getByEmail(email)
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password')
    }
    const session: Session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
    await sessionRepo.setSession(session)
    return session
  },

  async logout(): Promise<void> {
    await sessionRepo.clearSession()
  },

  async getSession(): Promise<Session | null> {
    return sessionRepo.getSession()
  },

  async getCurrentUser(): Promise<User | null> {
    const session = await sessionRepo.getSession()
    if (!session) return null
    return userRepo.getById(session.userId)
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    return userRepo.update(userId, data)
  },
}
