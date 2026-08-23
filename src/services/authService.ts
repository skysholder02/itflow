import { userRepo } from '@/services/repositories'
import type { Session, User } from '@/types'
import { supabaseAuthAdapter } from '@/services/supabase/authAdapter'
import { isLoginBlocked, resolveAccountStatus, getLoginBlockReason } from '@/utils/vendorStatus'

export const VENDOR_PENDING_APPROVAL_ERROR = 'VENDOR_PENDING_APPROVAL'
export const ACCOUNT_PENDING_APPROVAL_ERROR = 'ACCOUNT_PENDING_APPROVAL'
export const VENDOR_EXPIRED_ERROR = 'VENDOR_EXPIRED'
export const ACCOUNT_EXPIRED_ERROR = 'ACCOUNT_EXPIRED'
export const ACCOUNT_ARCHIVED_ERROR = 'ACCOUNT_ARCHIVED'

async function syncAccountStatus(user: User): Promise<User> {
  return user
}

function validateAccountStatus(user: User): User {
  const accountStatus = resolveAccountStatus(user)

  if (isLoginBlocked(accountStatus)) {
    const reason = getLoginBlockReason(accountStatus)

    // STEP 5D.11 (G3): Expired vendors keep their authenticated session;
    // DashboardLayout renders VendorStatusScreen, which restricts them to the
    // extension request flow (identity from auth.uid() via
    // fiyro_request_vendor_extension). Only PendingApproval stays hard-blocked.
    if (reason === 'pending') {
      throw new Error(ACCOUNT_PENDING_APPROVAL_ERROR)
    }
  }

  if (accountStatus === 'Archived') {
    throw new Error(ACCOUNT_ARCHIVED_ERROR)
  }

  return user
}

export const authService = {
  async login(email: string, password: string): Promise<Session> {
  await supabaseAuthAdapter.signInWithPassword(email, password)

  try {
    const user = await supabaseAuthAdapter.getCurrentUser()

    if (!user) {
      throw new Error('Authenticated user profile could not be loaded')
    }

    const syncedUser = await syncAccountStatus(user)

    validateAccountStatus(syncedUser)

    return {
      userId: syncedUser.id,
      email: syncedUser.email,
      name: syncedUser.name,
      role: syncedUser.role,
    }
  } catch (error) {
    await supabaseAuthAdapter.signOut()
    throw error
  }
},

  async logout(): Promise<void> {
    await supabaseAuthAdapter.signOut()
  },

  async getSession(): Promise<Session | null> {
    return supabaseAuthAdapter.getSession()
  },

  async getCurrentUser(): Promise<User | null> {
    const user = await supabaseAuthAdapter.getCurrentUser()

    if (!user) return null

    return syncAccountStatus(user)
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    return userRepo.update(userId, data)
  },
}