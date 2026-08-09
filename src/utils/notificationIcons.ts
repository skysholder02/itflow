import type { Notification, NotificationType } from '@/types'

export const NOTIFICATION_TYPE_DOT_COLORS: Record<NotificationType, string> = {
  ticket: 'bg-violet-500',
  asset: 'bg-sky-500',
  vendor: 'bg-orange-500',
  approval: 'bg-emerald-500',
  extension: 'bg-yellow-500',
  system: 'bg-slate-400',
  job: 'bg-indigo-500',
}

const DEFAULT_TYPE_DOT_COLOR = 'bg-slate-500'

export function getNotificationTypeDotColor(
  notification: Pick<Notification, 'type'>,
): string {
  const type = notification.type
  if (!type) return DEFAULT_TYPE_DOT_COLOR
  return NOTIFICATION_TYPE_DOT_COLORS[type] ?? DEFAULT_TYPE_DOT_COLOR
}