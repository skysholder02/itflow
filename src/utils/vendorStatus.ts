import type { User, AccountStatus } from '@/types'

const LEGACY_STATUS_MAP: Record<string, AccountStatus> = {
  'Pending Approval': 'PendingApproval',
  Rejected: 'Archived',
  PendingApproval: 'PendingApproval',
  Active: 'Active',
  Expired: 'Expired',
  Archived: 'Archived',
}

export function normalizeAccountStatus(status?: string): AccountStatus | undefined {
  if (!status) return undefined
  return LEGACY_STATUS_MAP[status] ?? (status as AccountStatus)
}

// Legacy function name for backwards compatibility
export const normalizeVendorStatus = normalizeAccountStatus

export function resolveAccountStatus(user: User): AccountStatus | undefined {
  // First check the new status field
  let status = normalizeAccountStatus(user.status)
  
  // Fall back to vendorStatus for legacy data
  if (!status && user.role === 'vendor') {
    status = normalizeAccountStatus(user.vendorStatus)
  }
  
  // Check expiry for active accounts
  if (status === 'Active') {
    const expiryDate = user.vendorExpiryDate
    if (expiryDate) {
      const expiry = new Date(expiryDate)
      expiry.setHours(23, 59, 59, 999)
      if (expiry < new Date()) return 'Expired'
    }
  }

  return status
}

// Legacy function name for backwards compatibility
export const resolveVendorStatus = resolveAccountStatus

export function isLoginBlocked(status?: AccountStatus): boolean {
  return status === 'PendingApproval' || status === 'Expired'
}

// Legacy function name for backwards compatibility
export const isVendorLoginBlocked = isLoginBlocked

export function getLoginBlockReason(status?: AccountStatus): 'pending' | 'expired' | null {
  if (status === 'PendingApproval') return 'pending'
  if (status === 'Expired') return 'expired'
  return null
}

// Legacy function name for backwards compatibility
export const getVendorLoginBlockReason = getLoginBlockReason

export function isDashboardBlocked(status?: AccountStatus): boolean {
  return status !== 'Active'
}

// Legacy function name for backwards compatibility
export const isVendorDashboardBlocked = isDashboardBlocked
