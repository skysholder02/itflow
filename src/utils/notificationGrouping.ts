import type { Notification } from '@/types'

export type NotificationGroupLabel = 'Today' | 'Yesterday' | 'Earlier'

export interface NotificationGroup {
  label: NotificationGroupLabel
  items: Notification[]
}

const GROUP_ORDER: NotificationGroupLabel[] = ['Today', 'Yesterday', 'Earlier']

function getStartOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function getNotificationGroupLabel(
  notification: Notification,
  now: Date = new Date(),
): NotificationGroupLabel {
  const createdAt = new Date(notification.createdAt)
  const startOfToday = getStartOfLocalDay(now)
  const startOfYesterday = getStartOfLocalDay(now)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  if (createdAt >= startOfToday) return 'Today'
  if (createdAt >= startOfYesterday) return 'Yesterday'
  return 'Earlier'
}

export function groupNotifications(
  notifications: Notification[],
  now: Date = new Date(),
): NotificationGroup[] {
  const sorted = [...notifications].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const groups: Record<NotificationGroupLabel, Notification[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  }

  for (const notification of sorted) {
    groups[getNotificationGroupLabel(notification, now)].push(notification)
  }

  return GROUP_ORDER.map((label) => ({ label, items: groups[label] })).filter(
    (group) => group.items.length > 0,
  )
}