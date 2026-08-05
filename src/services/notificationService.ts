import { notificationRepo, contactRepo } from '@/services/repositories'
import type { Notification, NotificationType, NotificationTargetType } from '@/types'

export const notificationService = {
  async getByUserId(userId: string): Promise<Notification[]> {
    return notificationRepo.getByUserId(userId)
  },

  async create(input: {
    userId: string
    title: string
    message: string
    type: NotificationType
    targetType: NotificationTargetType
    targetId?: string
  }): Promise<Notification> {
    const notification: Omit<Notification, 'id'> = {
      userId: input.userId,
      title: input.title,
      message: input.message,
      isRead: false,
      createdAt: new Date().toISOString(),
      type: input.type,
      targetType: input.targetType,
      targetId: input.targetId,
    }
    const created = await notificationRepo.create(notification)
    window.dispatchEvent(new CustomEvent('notifications-changed'))
    return created
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
