import type { Notification } from '@/types'
import type { INotificationRepository } from '../types'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import { getCollection, setCollection, seedDatabase } from './seed'

class LocalNotificationRepository implements INotificationRepository {
  private ensureSeed() {
    seedDatabase()
  }

  async getByUserId(userId: string): Promise<Notification[]> {
    this.ensureSeed()
    const notifications = getCollection<Notification>(STORAGE_KEYS.NOTIFICATIONS)
    return notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async markAsRead(id: string): Promise<void> {
    const notifications = getCollection<Notification>(STORAGE_KEYS.NOTIFICATIONS)
    const index = notifications.findIndex((n) => n.id === id)
    if (index !== -1) {
      notifications[index].read = true
      setCollection(STORAGE_KEYS.NOTIFICATIONS, notifications)
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = getCollection<Notification>(STORAGE_KEYS.NOTIFICATIONS)
    const updated = notifications.map((n) =>
      n.userId === userId ? { ...n, read: true } : n,
    )
    setCollection(STORAGE_KEYS.NOTIFICATIONS, updated)
  }
}

export const localNotificationRepo = new LocalNotificationRepository()
