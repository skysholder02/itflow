import { getItem, setItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import {
  seedUsers,
  seedTickets,
  seedAssets,
  seedAssetHistories,
  seedNotifications,
  seedJobs,
} from '@/data/mockData'
import type { User, Ticket, AssetHistory, Role, Notification } from '@/types'
import { normalizeVendorStatus } from '@/utils/vendorStatus'

const REMOVED_DEMO_VENDOR_EMAILS = new Set([
  'vendor_pending@fiyro.demo',
  'vendor_expired@fiyro.demo',
])

const CURRENT_DEMO_EMAILS = new Set([
  'employee@fiyro.demo',
  'support@fiyro.demo',
  'leader@fiyro.demo',
  'vendor@fiyro.demo',
])

const LEGACY_DEMO_EMAIL_MAP: Record<string, string> = {
  'employee@itflow.demo': 'employee@fiyro.demo',
  'support@itflow.demo': 'support@fiyro.demo',
  'leader@itflow.demo': 'leader@fiyro.demo',
  'vendor@itflow.demo': 'vendor@fiyro.demo',
}

// Rename only the known legacy demo seed accounts to their current identities.
// Never touches arbitrary registered users. Idempotent: legacy emails are
// consumed on the first run, so later runs produce no further changes.
function migrateLegacyDemoEmails(users: User[]): User[] {
  const currentEmails = new Set(users.map((u) => u.email.toLowerCase()))
  const migrated: User[] = []
  const seen = new Set<string>()

  for (const user of users) {
    const currentEmail = LEGACY_DEMO_EMAIL_MAP[user.email.toLowerCase()]
    if (currentEmail) {
      const target = currentEmail.toLowerCase()
      // Drop the legacy duplicate if the current account already exists.
      if (currentEmails.has(target) || seen.has(target)) continue
      migrated.push({ ...user, email: currentEmail })
      seen.add(target)
      continue
    }
    migrated.push(user)
  }

  return migrated
}

// Add any missing current demo seed accounts to an already-seeded database.
// Additive and idempotent: only appends demo users that are absent.
function ensureCurrentDemoAccounts(users: User[]): User[] {
  const existingEmails = new Set(users.map((u) => u.email.toLowerCase()))
  const missingDemoUsers = seedUsers.filter(
    (u) =>
      CURRENT_DEMO_EMAILS.has(u.email.toLowerCase()) &&
      !existingEmails.has(u.email.toLowerCase()),
  )
  if (missingDemoUsers.length === 0) return users
  return [...users, ...missingDemoUsers]
}

const ROLE_MAP: Record<string, string> = {
  employee: 'karyawan',
  it_support: 'itsupport',
  leader_it: 'leaderit',
}

const NAME_MAP: Record<string, string> = {
  KARYAWAN1: 'Karyawan 1',
  KARYAWAN2: 'Karyawan 2',
  KARYAWAN3: 'Karyawan 3',
  ITSUPPORT: 'ITSupport',
  LEADERIT: 'LeaderIT',
}

export function normalizeRole(role: string): Role {
  return (ROLE_MAP[role] ?? role) as Role
}

export function normalizeName(name: string): string {
  return NAME_MAP[name] ?? name
}

function migrateUsers(users: User[]): User[] {
  return migrateLegacyDemoEmails(
    users
      .filter((u) => !REMOVED_DEMO_VENDOR_EMAILS.has(u.email))
      .map((u) => ({
        ...u,
        role: normalizeRole(u.role),
        name: normalizeName(u.name),
        vendorStatus:
          u.role === 'vendor' && u.vendorStatus
            ? normalizeVendorStatus(u.vendorStatus)
            : u.vendorStatus,
      })),
  )
}

function migrateTickets(tickets: Ticket[]): Ticket[] {
  return tickets.map((t) => ({
    ...t,
    reporterName: normalizeName(t.reporterName),
    notes: t.notes.map((n) => ({
      ...n,
      authorName: normalizeName(n.authorName),
    })),
  }))
}

function migrateHistories(histories: AssetHistory[]): AssetHistory[] {
  return histories.map((h) => ({
    ...h,
    technician: normalizeName(h.technician),
  }))
}

function migrateNotifications(notifications: Notification[]): Notification[] {
  return notifications.map((n) => {
    if ('isRead' in n) return n
    const { read, ...rest } = n as Notification & { read: boolean }
    return { ...rest, isRead: read }
  })
}

export function migrateDatabase(): void {
  const users = getItem<User[]>(STORAGE_KEYS.USERS) ?? []
  const migratedUsers = migrateUsers(users)
  if (migratedUsers.length > 0 && JSON.stringify(migratedUsers) !== JSON.stringify(users)) {
    setItem(STORAGE_KEYS.USERS, migratedUsers)
  }

  const tickets = getItem<Ticket[]>(STORAGE_KEYS.TICKETS) ?? []
  const migratedTickets = migrateTickets(tickets)
  if (migratedTickets.length > 0 && JSON.stringify(migratedTickets) !== JSON.stringify(tickets)) {
    setItem(STORAGE_KEYS.TICKETS, migratedTickets)
  }

  const histories = getItem<AssetHistory[]>(STORAGE_KEYS.ASSET_HISTORIES) ?? []
  const migratedHistories = migrateHistories(histories)
  if (migratedHistories.length > 0 && JSON.stringify(migratedHistories) !== JSON.stringify(histories)) {
    setItem(STORAGE_KEYS.ASSET_HISTORIES, migratedHistories)
  }

  const notifications = getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) ?? []
  const migratedNotifications = migrateNotifications(notifications)
  if (
    migratedNotifications.length > 0 &&
    JSON.stringify(migratedNotifications) !== JSON.stringify(notifications)
  ) {
    setItem(STORAGE_KEYS.NOTIFICATIONS, migratedNotifications)
  }
}

export function seedDatabase(): void {
  const seeded = localStorage.getItem(STORAGE_KEYS.SEEDED)
  
  // Ensure jobs are seeded even if database was previously seeded without jobs
  const jobs = localStorage.getItem(STORAGE_KEYS.JOBS)
  if (!jobs) {
    setItem(STORAGE_KEYS.JOBS, seedJobs)
  }

  if (seeded) {
    // Repair old databases: ensure all four current demo accounts exist.
    const users = getItem<User[]>(STORAGE_KEYS.USERS) ?? []
    const updatedUsers = ensureCurrentDemoAccounts(users)
    if (updatedUsers.length > users.length) {
      setItem(STORAGE_KEYS.USERS, updatedUsers)
    }
    return
  }

  setItem(STORAGE_KEYS.USERS, seedUsers)
  setItem(STORAGE_KEYS.TICKETS, seedTickets)
  setItem(STORAGE_KEYS.ASSETS, seedAssets)
  setItem(STORAGE_KEYS.ASSET_HISTORIES, seedAssetHistories)
  setItem(STORAGE_KEYS.NOTIFICATIONS, seedNotifications)
  setItem(STORAGE_KEYS.JOBS, seedJobs)
  localStorage.setItem(STORAGE_KEYS.SEEDED, 'true')
}

export function getCollection<T>(key: string): T[] {
  return getItem<T[]>(key) ?? []
}

export function setCollection<T>(key: string, data: T[]): void {
  setItem(key, data)
}
