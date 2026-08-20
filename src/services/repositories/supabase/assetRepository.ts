import type { Asset, CreateAssetDTO } from '@/types'
import type { IAssetRepository } from '../types'

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

function mapAssetRow(row: any): Asset {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    serialNumber: row.serial_number,
    location: row.location,
    status: row.status,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

class SupabaseAssetRepository implements IAssetRepository {
  async getAll(): Promise<Asset[]> {
    const client = getClient()

    const { data, error } = await client
      .from('assets')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      throw new Error(
        `Failed to load assets: ${error.message}`,
      )
    }

    return (data ?? []).map(mapAssetRow)
  }

  async getById(id: string): Promise<Asset | null> {
    const client = getClient()

    const { data, error } = await client
      .from('assets')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(
        `Failed to load asset: ${error.message}`,
      )
    }

    if (!data) {
      return null
    }

    return mapAssetRow(data)
  }

  async create(data: CreateAssetDTO): Promise<Asset> {
    const client = getClient()

    const id = `AST-${Date.now()}`
    const now = new Date().toISOString()

    const { data: created, error } = await client
      .from('assets')
      .insert({
        id,

        name: data.name,
        brand: data.brand,
        serial_number: data.serialNumber,
        location: data.location,
        status: data.status,
        category: data.category,

        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) {
      throw new Error(
        `Failed to create asset: ${error.message}`,
      )
    }

    return mapAssetRow(created)
  }

  async update(
    id: string,
    data: Partial<Asset>,
  ): Promise<Asset> {
    const client = getClient()

    const payload: Record<string, unknown> = {}

    if (data.name !== undefined) {
      payload.name = data.name
    }

    if (data.brand !== undefined) {
      payload.brand = data.brand
    }

    if (data.serialNumber !== undefined) {
      payload.serial_number = data.serialNumber
    }

    if (data.location !== undefined) {
      payload.location = data.location
    }

    if (data.status !== undefined) {
      payload.status = data.status
    }

    if (data.category !== undefined) {
      payload.category = data.category
    }

    payload.updated_at = new Date().toISOString()

    const { data: updated, error } = await client
      .from('assets')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(
        `Failed to update asset: ${error.message}`,
      )
    }

    return mapAssetRow(updated)
  }

  async delete(id: string): Promise<void> {
    const client = getClient()

    const { error } = await client
      .from('assets')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(
        `Failed to delete asset: ${error.message}`,
      )
    }
  }
}

export const supabaseAssetRepo =
  new SupabaseAssetRepository()