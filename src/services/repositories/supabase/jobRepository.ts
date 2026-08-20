import type { Job } from '@/types'
import type { IJobRepository } from '../types'

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

function mapJobRow(row: any): Job {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    deadline: row.deadline,
    status: row.status,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    vendorPIC: row.vendor_pic,
    vendorPhone: row.vendor_phone,
    itSupportId: row.it_support_id,
    itSupportName: row.it_support_name,
    leaderId: row.leader_id,
    leaderName: row.leader_name,
    workers: row.workers ?? [],
    timeline: row.timeline ?? [],
    documentation: row.documentation ?? [],
    materials: row.materials ?? [],
    extensionRequests: row.extension_requests ?? [],
    ratings: row.ratings ?? [],
  }
}

class SupabaseJobRepository implements IJobRepository {
  async getAll(): Promise<Job[]> {
    const client = getClient()

    const { data, error } = await client
      .from('jobs')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      throw new Error(
        `Failed to load jobs: ${error.message}`,
      )
    }

    return (data ?? []).map(mapJobRow)
  }

  async getById(id: string): Promise<Job | null> {
    const client = getClient()

    const { data, error } = await client
      .from('jobs')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(
        `Failed to load job: ${error.message}`,
      )
    }

    if (!data) {
      return null
    }

    return mapJobRow(data)
  }

  async getByVendor(vendorId: string): Promise<Job[]> {
    const client = getClient()

    const { data, error } = await client
      .from('jobs')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      throw new Error(
        `Failed to load vendor jobs: ${error.message}`,
      )
    }

    return (data ?? []).map(mapJobRow)
  }

  async create(data: Omit<Job, 'id'>): Promise<Job> {
    const client = getClient()

    const id = `JOB-${Date.now()}`
    const now = new Date().toISOString()

    const { data: created, error } = await client
      .from('jobs')
      .insert({
        id,

        title: data.title,
        description: data.description,
        location: data.location,
        deadline: data.deadline,
        status: data.status,

        vendor_id: data.vendorId,
        vendor_name: data.vendorName,
        vendor_pic: data.vendorPIC,
        vendor_phone: data.vendorPhone,

        it_support_id: data.itSupportId,
        it_support_name: data.itSupportName,

        leader_id: data.leaderId,
        leader_name: data.leaderName,

        workers: data.workers,
        timeline: data.timeline,
        documentation: data.documentation,
        materials: data.materials,
        extension_requests: data.extensionRequests,
        ratings: data.ratings,

        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) {
      throw new Error(
        `Failed to create job: ${error.message}`,
      )
    }

    return mapJobRow(created)
  }

  async update(
    id: string,
    data: Partial<Job>,
  ): Promise<Job> {
    const client = getClient()

    const payload: Record<string, unknown> = {}

    if (data.title !== undefined) {
      payload.title = data.title
    }

    if (data.description !== undefined) {
      payload.description = data.description
    }

    if (data.location !== undefined) {
      payload.location = data.location
    }

    if (data.deadline !== undefined) {
      payload.deadline = data.deadline
    }

    if (data.status !== undefined) {
      payload.status = data.status
    }

    if (data.vendorId !== undefined) {
      payload.vendor_id = data.vendorId
    }

    if (data.vendorName !== undefined) {
      payload.vendor_name = data.vendorName
    }

    if (data.vendorPIC !== undefined) {
      payload.vendor_pic = data.vendorPIC
    }

    if (data.vendorPhone !== undefined) {
      payload.vendor_phone = data.vendorPhone
    }

    if (data.itSupportId !== undefined) {
      payload.it_support_id = data.itSupportId
    }

    if (data.itSupportName !== undefined) {
      payload.it_support_name = data.itSupportName
    }

    if (data.leaderId !== undefined) {
      payload.leader_id = data.leaderId
    }

    if (data.leaderName !== undefined) {
      payload.leader_name = data.leaderName
    }

    if (data.workers !== undefined) {
      payload.workers = data.workers
    }

    if (data.timeline !== undefined) {
      payload.timeline = data.timeline
    }

    if (data.documentation !== undefined) {
      payload.documentation = data.documentation
    }

    if (data.materials !== undefined) {
      payload.materials = data.materials
    }

    if (data.extensionRequests !== undefined) {
      payload.extension_requests = data.extensionRequests
    }

    if (data.ratings !== undefined) {
      payload.ratings = data.ratings
    }

    payload.updated_at = new Date().toISOString()

    const { data: updated, error } = await client
      .from('jobs')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(
        `Failed to update job: ${error.message}`,
      )
    }

    return mapJobRow(updated)
  }
}

export const supabaseJobRepo =
  new SupabaseJobRepository()