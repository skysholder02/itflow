import { ticketRepo, userRepo } from '@/services/repositories'
import { notificationService } from '@/services/notificationService'
import type { CreateTicketDTO, Ticket, TicketNote, Role } from '@/types'

export const ticketService = {
  async getTickets(role: Role, userId: string): Promise<Ticket[]> {
    if (role === 'karyawan') {
      return ticketRepo.getByReporter(userId)
    }
    return ticketRepo.getAll()
  },

  async getTicket(id: string): Promise<Ticket | null> {
    return ticketRepo.getById(id)
  },

  async createTicket(data: CreateTicketDTO): Promise<Ticket> {
    const ticket = await ticketRepo.create(data)

    const recipients = await userRepo.getAll()
    const supportUsers = recipients.filter(
      (u) => u.role === 'itsupport' || u.role === 'leaderit',
    )

    await Promise.all(
      supportUsers.map((u) =>
        notificationService.create({
          userId: u.id,
          title: 'New Ticket',
          message: `Ticket ${ticket.id} has been created by ${ticket.reporterName}`,
          type: 'ticket',
          targetType: 'ticket',
          targetId: ticket.id,
        }),
      ),
    )

    return ticket
  },

  async updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket> {
    const previous = await ticketRepo.getById(id)
    const updated = await ticketRepo.update(id, data)

    if (
      previous &&
      data.status &&
      data.status !== previous.status &&
      previous.reporterId
    ) {
      await notificationService.create({
        userId: previous.reporterId,
        title: 'Ticket Updated',
        message: `Your ticket ${updated.id} status changed to ${updated.status}`,
        type: 'ticket',
        targetType: 'ticket',
        targetId: updated.id,
      })
    }

    return updated
  },

  async addNote(
    ticketId: string,
    note: Omit<TicketNote, 'id'>,
  ): Promise<Ticket> {
    const updated = await ticketRepo.addNote(ticketId, note)

    if (updated.reporterId && note.authorId !== updated.reporterId) {
      await notificationService.create({
        userId: updated.reporterId,
        title: 'New Reply',
        message: `IT Support replied to ticket ${updated.id}`,
        type: 'ticket',
        targetType: 'ticket',
        targetId: updated.id,
      })
    }

    return updated
  },

  async deleteTicket(id: string): Promise<void> {
    return ticketRepo.delete(id)
  },

  canCreateTicket(role: Role): boolean {
    return role === 'karyawan' || role === 'itsupport'
  },

  canUpdateStatus(role: Role): boolean {
    return role === 'itsupport'
  },

  canAddNotes(role: Role): boolean {
    return role === 'itsupport'
  },

  canViewAll(role: Role): boolean {
    return role === 'itsupport' || role === 'leaderit'
  },
}
