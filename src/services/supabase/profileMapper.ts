import type { User, Role, AccountStatus } from '@/types'

// Raw row shape of public.profiles (snake_case database fields).
export interface ProfileRow {
  id: string
  email: string
  name: string
  role: Role
  department: string | null
  status: AccountStatus
  reject_reason: string | null
  whatsapp: string | null
  vendor_company: string | null
  vendor_pic: string | null
  vendor_phone: string | null
  vendor_worker_count: number | null
  vendor_expiry_date: string | null
  created_at: string
  updated_at: string
}

// App stores vendor expiry as a date-only string; normalize the full timestamptz
// returned by Postgres so application behavior matches the LocalStorage provider.
function normalizeDateOnly(value: string | null): string | undefined {
  if (!value) return undefined
  return value.slice(0, 10)
}

// Shared mapping: public.profiles row -> application User.
// Used by both SupabaseUserRepository and the Supabase auth adapter so the
// mapping logic is defined exactly once.
export function mapProfileRowToUser(row: ProfileRow): User {
  const user: User = {
    id: row.id,
    email: row.email,
    // PASSWORD COMPATIBILITY: profiles intentionally has no password column.
    // Returning '' guarantees password comparison in authService.login can never
    // succeed, so Supabase-backed code cannot be used for password auth until the
    // Supabase Auth migration step. No password is fabricated.
    password: '',
    name: row.name,
    role: row.role,
    department: row.department ?? '',
    status: row.status,
    rejectReason: row.reject_reason ?? undefined,
    rejectWhatsApp: row.whatsapp ?? undefined,
    vendorExpiryDate: normalizeDateOnly(row.vendor_expiry_date),
    vendorCompany: row.vendor_company ?? undefined,
    vendorPIC: row.vendor_pic ?? undefined,
    vendorPhone: row.vendor_phone ?? undefined,
    vendorWorkerCount: row.vendor_worker_count ?? undefined,
  }
  // Legacy alias: keep vendorStatus in sync with the stored status so existing
  // vendor UI (VendorStatusScreen, status filters) keeps working.
  if (row.role === 'vendor') {
    user.vendorStatus = row.status
  }
  return user
}