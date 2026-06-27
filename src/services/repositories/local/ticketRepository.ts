import type { Ticket, CreateTicketDTO, TicketNote } from '@/types'
import type { ITicketRepository } from '../types'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import { generateId, generateNoteId } from '@/utils/idGenerator'
import { getCollection, setCollection, seedDatabase } from './seed'

class LocalTicketRepository implements ITicketRepository {
  private ensureSeed() {
    seedDatabase()
  }

  async getAll(): Promise<Ticket[]> {
    this.ensureSeed()
    return getCollection<Ticket>(STORAGE_KEYS.TICKETS)
  }

  async getById(id: string): Promise<Ticket | null> {
    const tickets = await this.getAll()
    return tickets.find((t) => t.id === id) ?? null
  }

  async getByReporter(userId: string): Promise<Ticket[]> {
    const tickets = await this.getAll()
    return tickets.filter((t) => t.reporterId === userId)
  }

  async create(data: CreateTicketDTO): Promise<Ticket> {
    const tickets = await this.getAll()
    const id = generateId('TKT', tickets.map((t) => t.id))
    const now = new Date().toISOString()
    const ticket: Ticket = {
      id,
      ...data,
      status: 'Open',
      createdAt: now,
      updatedAt: now,
      notes: [],
    }
    tickets.push(ticket)
    setCollection(STORAGE_KEYS.TICKETS, tickets)
    return ticket
  }

  async update(id: string, data: Partial<Ticket>): Promise<Ticket> {
    const tickets = await this.getAll()
    const index = tickets.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('Ticket not found')
    tickets[index] = {
      ...tickets[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    setCollection(STORAGE_KEYS.TICKETS, tickets)
    return tickets[index]
  }

  async addNote(id: string, note: Omit<TicketNote, 'id'>): Promise<Ticket> {
    const tickets = await this.getAll()
    const index = tickets.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('Ticket not found')
    const fullNote: TicketNote = { ...note, id: generateNoteId() }
    tickets[index].notes.push(fullNote)
    tickets[index].updatedAt = new Date().toISOString()
    setCollection(STORAGE_KEYS.TICKETS, tickets)
    return tickets[index]
  }

  async delete(id: string): Promise<void> {
    const tickets = await this.getAll()
    setCollection(
      STORAGE_KEYS.TICKETS,
      tickets.filter((t) => t.id !== id),
    )
  }
}

export const localTicketRepo = new LocalTicketRepository()
