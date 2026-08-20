import type { Notification } from '@/types'
import type { INotificationRepository } from '../types'

import {
  supabase,
  isSupabaseConfigured,
} from '@/services/supabase/client'

function getClient() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    )
  }

  return supabase
}

function mapNotificationRow(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
    type: row.type ?? undefined,
    targetType: row.target_type ?? undefined,
    targetId: row.target_id ?? undefined,
  }
}

class SupabaseNotificationRepository
  implements INotificationRepository
{
  async getByUserId(
    userId: string,
  ): Promise<Notification[]> {
    const client = getClient()

    const { data, error } = await client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      throw new Error(
        `Failed to load notifications: ${error.message}`,
      )
    }

    return (data ?? []).map(mapNotificationRow)
  }

  async create(
    notification: Omit<Notification, 'id'>,
  ): Promise<Notification> {
    const client = getClient()

    const id = `NOTIF-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`

    const { data, error } = await client
      .from('notifications')
      .insert({
        id,

        user_id: notification.userId,

        title: notification.title,
        message: notification.message,

        is_read: notification.isRead,

        created_at: notification.createdAt,

        type: notification.type ?? null,
        target_type:
          notification.targetType ?? null,
        target_id:
          notification.targetId ?? null,
      })
      .select()
      .single()

    if (error) {
      throw new Error(
        `Failed to create notification: ${error.message}`,
      )
    }

    return mapNotificationRow(data)
  }

  async markAsRead(
    id: string,
  ): Promise<void> {
    const client = getClient()

    const { error } = await client
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('id', id)

    if (error) {
      throw new Error(
        `Failed to mark notification as read: ${error.message}`,
      )
    }
  }

  async markAllAsRead(
    userId: string,
  ): Promise<void> {
    const client = getClient()

    const { error } = await client
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      throw new Error(
        `Failed to mark all notifications as read: ${error.message}`,
      )
    }
  }
}

export const supabaseNotificationRepo =
  new SupabaseNotificationRepository()