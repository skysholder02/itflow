import { notificationRepo, contactRepo } from '@/services/repositories'
import type { Notification } from '@/types'

export const notificationService = {
  async getByUserId(userId: string): Promise<Notification[]> {
    return notificationRepo.getByUserId(userId)
  },

  async markAsRead(id: string): Promise<void> {
    return notificationRepo.markAsRead(id)
  },

  async markAllAsRead(userId: string): Promise<void> {
    return notificationRepo.markAllAsRead(userId)
  },
}

export const contactService = {
  async submit(data: { name: string; email: string; message: string }): Promise<void> {
    return contactRepo.submit(data)
  },
}
