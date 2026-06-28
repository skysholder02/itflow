import { ticketRepo, assetRepo } from '@/services/repositories'
import type { DashboardStats, Role, TicketCategory } from '@/types'

const categories: TicketCategory[] = [
  'Printer',
  'WiFi',
  'PC',
  'CCTV',
  'Speaker',
  'Other',
]

export const statsService = {
  async getDashboardStats(role: Role, userId: string): Promise<DashboardStats> {
    const allTickets =
      role === 'karyawan'
        ? await ticketRepo.getByReporter(userId)
        : await ticketRepo.getAll()

    const assets = await assetRepo.getAll()

    const ticketsByCategory = categories.reduce(
      (acc, cat) => {
        acc[cat] = allTickets.filter((t) => t.category === cat).length
        return acc
      },
      {} as Record<TicketCategory, number>,
    )

    return {
      totalTickets: allTickets.length,
      openTickets: allTickets.filter((t) => t.status === 'Open').length,
      completedTickets: allTickets.filter((t) => t.status === 'Completed').length,
      totalAssets: assets.length,
      ticketsByCategory,
    }
  },
}
