import type {
  Ticket,
  CreateTicketDTO,
  TicketNote,
} from '@/types'

import type { ITicketRepository } from '../types'

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

function mapTicketRow(row: any): Ticket {
  return {
    id: row.id,

    title: row.title,
    description: row.description,

    category: row.category,
    priority: row.priority,

    location: row.location,

    assetId: row.asset_id ?? undefined,
    assetName: row.asset_name ?? undefined,
    assetLocation: row.asset_location ?? undefined,

    photo: row.photo ?? undefined,

    reporterId: row.reporter_id,
    reporterName: row.reporter_name,

    status: row.status,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    notes: [],
  }
}

class SupabaseTicketRepository
  implements ITicketRepository
{
  async getAll(): Promise<Ticket[]> {
    const client = getClient()

    const { data, error } = await client
      .from('tickets')
      .select(`
        *,
        ticket_notes (
          id,
          text,
          author_id,
          author_name,
          created_at
        )
      `)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      throw new Error(
        `Failed to load tickets: ${error.message}`,
      )
    }

    return (data ?? []).map((row: any) => ({
      ...mapTicketRow(row),

      notes: (row.ticket_notes ?? []).map(
        (note: any): TicketNote => ({
          id: note.id,
          text: note.text,

          authorId: note.author_id,
          authorName: note.author_name,

          createdAt: note.created_at,
        }),
      ),
    }))
  }

  async getById(
    id: string,
  ): Promise<Ticket | null> {
    const client = getClient()

    const { data, error } = await client
      .from('tickets')
      .select(`
        *,
        ticket_notes (
          id,
          text,
          author_id,
          author_name,
          created_at
        )
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(
        `Failed to load ticket: ${error.message}`,
      )
    }

    if (!data) {
      return null
    }

    return {
      ...mapTicketRow(data),

      notes: (data.ticket_notes ?? []).map(
        (note: any): TicketNote => ({
          id: note.id,

          text: note.text,

          authorId: note.author_id,
          authorName: note.author_name,

          createdAt: note.created_at,
        }),
      ),
    }
  }

  async getByReporter(
    userId: string,
  ): Promise<Ticket[]> {
    const tickets = await this.getAll()

    return tickets.filter(
      ticket =>
        ticket.reporterId === userId,
    )
  }

  async create(
    data: CreateTicketDTO,
  ): Promise<Ticket> {
    const client = getClient()

    const id = `TKT-${Date.now()}`

    const { data: created, error } =
      await client
        .from('tickets')
        .insert({
          id,

          title: data.title,
          description: data.description,

          category: data.category,
          priority: data.priority,

          location: data.location,

          asset_id: data.assetId ?? null,
          asset_name: data.assetName ?? null,
          asset_location:
            data.assetLocation ?? null,

          photo: data.photo ?? null,

          reporter_id: data.reporterId,
          reporter_name: data.reporterName,

          status: 'Open',
        })
        .select()
        .single()

    if (error) {
      throw new Error(
        `Failed to create ticket: ${error.message}`,
      )
    }

    return mapTicketRow(created)
  }

  async update(
    id: string,
    data: Partial<Ticket>,
  ): Promise<Ticket> {
    const client = getClient()

    const payload: Record<string, unknown> = {}

    if (data.title !== undefined)
      payload.title = data.title

    if (data.description !== undefined)
      payload.description = data.description

    if (data.category !== undefined)
      payload.category = data.category

    if (data.priority !== undefined)
      payload.priority = data.priority

    if (data.location !== undefined)
      payload.location = data.location

    if (data.assetId !== undefined)
      payload.asset_id = data.assetId

    if (data.assetName !== undefined)
      payload.asset_name = data.assetName

    if (data.assetLocation !== undefined)
      payload.asset_location =
        data.assetLocation

    if (data.photo !== undefined)
      payload.photo = data.photo

    if (data.reporterId !== undefined)
      payload.reporter_id =
        data.reporterId

    if (data.reporterName !== undefined)
      payload.reporter_name =
        data.reporterName

    if (data.status !== undefined)
      payload.status = data.status

    const { data: updated, error } =
      await client
        .from('tickets')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

    if (error) {
      throw new Error(
        `Failed to update ticket: ${error.message}`,
      )
    }

    return mapTicketRow(updated)
  }

  async addNote(
    id: string,
    note: Omit<TicketNote, 'id'>,
  ): Promise<Ticket> {
    const client = getClient()

    const noteId =
      `NOTE-${Date.now()}`

    const { error } =
      await client
        .from('ticket_notes')
        .insert({
          id: noteId,

          ticket_id: id,

          text: note.text,

          author_id: note.authorId,
          author_name: note.authorName,

          created_at: note.createdAt,
        })

    if (error) {
      throw new Error(
        `Failed to add ticket note: ${error.message}`,
      )
    }

    const ticket =
      await this.getById(id)

    if (!ticket) {
      throw new Error(
        'Ticket not found after adding note',
      )
    }

    return ticket
  }

  async delete(
    id: string,
  ): Promise<void> {
    const client = getClient()

    const { error } =
      await client
        .from('tickets')
        .delete()
        .eq('id', id)

    if (error) {
      throw new Error(
        `Failed to delete ticket: ${error.message}`,
      )
    }
  }
}

export const supabaseTicketRepo =
  new SupabaseTicketRepository()