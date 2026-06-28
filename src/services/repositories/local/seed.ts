import { getItem, setItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import {
  seedUsers,
  seedTickets,
  seedAssets,
  seedAssetHistories,
  seedNotifications,
} from '@/data/mockData'
import type { User, Ticket, AssetHistory, Role } from '@/types'

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
  return users.map((u) => ({
    ...u,
    role: normalizeRole(u.role),
    name: normalizeName(u.name),
  }))
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
}

export function seedDatabase(): void {
  const seeded = localStorage.getItem(STORAGE_KEYS.SEEDED)
  if (seeded) return

  setItem(STORAGE_KEYS.USERS, seedUsers)
  setItem(STORAGE_KEYS.TICKETS, seedTickets)
  setItem(STORAGE_KEYS.ASSETS, seedAssets)
  setItem(STORAGE_KEYS.ASSET_HISTORIES, seedAssetHistories)
  setItem(STORAGE_KEYS.NOTIFICATIONS, seedNotifications)
  localStorage.setItem(STORAGE_KEYS.SEEDED, 'true')
}

export function getCollection<T>(key: string): T[] {
  return getItem<T[]>(key) ?? []
}

export function setCollection<T>(key: string, data: T[]): void {
  setItem(key, data)
}
