import type {
  AssetHistory,
  CreateAssetHistoryDTO,
} from '@/types'

import type {
  IAssetHistoryRepository,
} from '../types'

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

function mapAssetHistoryRow(
  row: any,
): AssetHistory {
  return {
    id: row.id,
    assetId: row.asset_id,
    date: row.date,
    problem: row.problem,
    action: row.action,
    technician: row.technician,
  }
}

class SupabaseAssetHistoryRepository
  implements IAssetHistoryRepository
{
  async getAll(): Promise<AssetHistory[]> {
    const client = getClient()

    const { data, error } = await client
      .from('asset_histories')
      .select('*')
      .order('date', {
        ascending: false,
      })

    if (error) {
      throw new Error(
        `Failed to load asset histories: ${error.message}`,
      )
    }

    return (data ?? []).map(
      mapAssetHistoryRow,
    )
  }

  async getByAssetId(
    assetId: string,
  ): Promise<AssetHistory[]> {
    const client = getClient()

    const { data, error } = await client
      .from('asset_histories')
      .select('*')
      .eq('asset_id', assetId)
      .order('date', {
        ascending: false,
      })

    if (error) {
      throw new Error(
        `Failed to load asset histories: ${error.message}`,
      )
    }

    return (data ?? []).map(
      mapAssetHistoryRow,
    )
  }

  async create(
    data: CreateAssetHistoryDTO,
  ): Promise<AssetHistory> {
    const client = getClient()

    const id =
      `HIST-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`

    const { data: created, error } =
      await client
        .from('asset_histories')
        .insert({
          id,

          asset_id: data.assetId,
          date: data.date,
          problem: data.problem,
          action: data.action,
          technician: data.technician,
        })
        .select()
        .single()

    if (error) {
      throw new Error(
        `Failed to create asset history: ${error.message}`,
      )
    }

    return mapAssetHistoryRow(created)
  }

  async delete(
    id: string,
  ): Promise<void> {
    const client = getClient()

    const { error } = await client
      .from('asset_histories')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(
        `Failed to delete asset history: ${error.message}`,
      )
    }
  }
}

export const supabaseAssetHistoryRepo =
  new SupabaseAssetHistoryRepository()