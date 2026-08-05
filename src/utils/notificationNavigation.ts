import type { Notification, NotificationTargetType } from '@/types'

export const NOTIFICATION_TARGET_ROUTES: Record<NotificationTargetType, string> = {
  ticket: '/tickets/:id',
  asset: '/assets/manage/:id',
  'vendor-job': '/vendor/jobs/:id',
  vendor: '/leader/vendors',
  user: '/leader/users',
  dashboard: '/dashboard',
  profile: '/profile',
}

const DEFAULT_ROUTE = '/dashboard'

export function getNotificationPath(
  notification: Pick<Notification, 'targetType' | 'targetId'>,
): string {
  const targetType = notification.targetType
  if (!targetType) return DEFAULT_ROUTE

  const route = NOTIFICATION_TARGET_ROUTES[targetType]
  if (!route) return DEFAULT_ROUTE

  if (route.includes(':id')) {
    return notification.targetId
      ? route.replace(':id', notification.targetId)
      : DEFAULT_ROUTE
  }

  return route
}