import type { Notification, NotificationType } from '@/types'

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  ticket: '🎫',
  asset: '🖥️',
  vendor: '🏢',
  approval: '✅',
  extension: '⏰',
  system: '⚙️',
}

const DEFAULT_TYPE_ICON = NOTIFICATION_TYPE_ICONS.system

export function getNotificationIcon(
  notification: Pick<Notification, 'type'>,
): string {
  const type = notification.type
  if (!type) return DEFAULT_TYPE_ICON
  return NOTIFICATION_TYPE_ICONS[type] ?? DEFAULT_TYPE_ICON
}