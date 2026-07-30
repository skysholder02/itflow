import type { Announcement } from '@/types'

const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    title: 'Scheduled Maintenance: Email Server',
    description: 'The email server will undergo maintenance on Saturday, August 2nd from 10 PM to 2 AM. Intermittent disruptions may occur during this period.',
    date: '2026-07-28T09:00:00Z',
  },
  {
    id: 'ann-002',
    title: 'New VPN Access Policy',
    description: 'Starting August 1st, all VPN access requests must be approved by your department head. Please submit requests at least 3 days in advance.',
    date: '2026-07-25T14:00:00Z',
  },
  {
    id: 'ann-003',
    title: 'IT Asset Inventory Week',
    description: 'The annual IT asset inventory will take place from August 5-9. Please ensure all IT equipment in your area is properly tagged and accessible.',
    date: '2026-07-22T10:30:00Z',
  },
  {
    id: 'ann-004',
    title: 'Software License Renewal Notice',
    description: 'Microsoft 365 and Adobe Creative Cloud licenses are up for renewal. Please verify your software needs with your supervisor by July 30th.',
    date: '2026-07-18T08:00:00Z',
  },
  {
    id: 'ann-005',
    title: 'Security Awareness Training',
    description: 'All employees are required to complete the quarterly security awareness training module by August 15th. Access the module via the HR portal.',
    date: '2026-07-15T11:00:00Z',
  },
]

export const announcementService = {
  async getAnnouncements(): Promise<Announcement[]> {
    return [...mockAnnouncements].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  },
}
