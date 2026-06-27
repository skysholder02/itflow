import { ticketRepo } from '@/services/repositories'
import type { CreateTicketDTO, Ticket, TicketNote, Role } from '@/types'

export const ticketService = {
  async getTickets(role: Role, userId: string): Promise<Ticket[]> {
    if (role === 'employee') {
      return ticketRepo.getByReporter(userId)
    }
    return ticketRepo.getAll()
  },

  async getTicket(id: string): Promise<Ticket | null> {
    return ticketRepo.getById(id)
  },

  async createTicket(data: CreateTicketDTO): Promise<Ticket> {
    return ticketRepo.create(data)
  },

  async updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket> {
    return ticketRepo.update(id, data)
  },

  async addNote(
    ticketId: string,
    note: Omit<TicketNote, 'id'>,
  ): Promise<Ticket> {
    return ticketRepo.addNote(ticketId, note)
  },

  async deleteTicket(id: string): Promise<void> {
    return ticketRepo.delete(id)
  },

  canCreateTicket(role: Role): boolean {
    return role === 'employee' || role === 'it_support'
  },

  canUpdateStatus(role: Role): boolean {
    return role === 'it_support'
  },

  canAddNotes(role: Role): boolean {
    return role === 'it_support'
  },

  canViewAll(role: Role): boolean {
    return role === 'it_support' || role === 'leader_it'
  },
}
