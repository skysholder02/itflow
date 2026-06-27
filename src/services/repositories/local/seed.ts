import { getItem, setItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import {
  seedUsers,
  seedTickets,
  seedAssets,
  seedAssetHistories,
  seedNotifications,
} from '@/data/mockData'

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
