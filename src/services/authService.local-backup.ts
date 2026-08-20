import { userRepo, sessionRepo } from '@/services/repositories'
import type { Session, User } from '@/types'
import { isLoginBlocked, resolveAccountStatus, getLoginBlockReason } from '@/utils/vendorStatus'

export const VENDOR_PENDING_APPROVAL_ERROR = 'VENDOR_PENDING_APPROVAL'
export const ACCOUNT_PENDING_APPROVAL_ERROR = 'ACCOUNT_PENDING_APPROVAL'
export const VENDOR_EXPIRED_ERROR = 'VENDOR_EXPIRED'
export const ACCOUNT_EXPIRED_ERROR = 'ACCOUNT_EXPIRED'

async function syncAccountStatus(user: User): Promise<User> {
  const resolvedStatus = resolveAccountStatus(user)
  
  // Update status if account has expired
  if (resolvedStatus === 'Expired') {
    const currentStatus = user.status || user.vendorStatus
    if (currentStatus === 'Active') {
      return userRepo.update(user.id, {
        status: 'Expired',
        vendorStatus: user.role === 'vendor' ? 'Expired' : user.vendorStatus,
      })
    }
  }

  return user
}

export const authService = {
  async login(email: string, password: string): Promise<Session> {
    const user = await userRepo.getByEmail(email)
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password')
    }

    const syncedUser = await syncAccountStatus(user)
    const accountStatus = resolveAccountStatus(syncedUser)

    if (isLoginBlocked(accountStatus)) {
      const reason = getLoginBlockReason(accountStatus)
      if (reason === 'pending') {
        throw new Error(ACCOUNT_PENDING_APPROVAL_ERROR)
      }
      if (reason === 'expired') {
        throw new Error(ACCOUNT_EXPIRED_ERROR)
      }
    }

    const session: Session = {
      userId: syncedUser.id,
      email: syncedUser.email,
      name: syncedUser.name,
      role: syncedUser.role,
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
    const user = await userRepo.getById(session.userId)
    if (!user) return null
    return syncAccountStatus(user)
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    return userRepo.update(userId, data)
  },
}
