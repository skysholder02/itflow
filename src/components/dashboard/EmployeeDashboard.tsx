import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, Badge, Skeleton } from '@/components/ui'
import { StatWidget } from '@/components/dashboard/StatWidget'
import { statsService } from '@/services/statsService'
import { ticketService } from '@/services/ticketService'
import { announcementService } from '@/services/announcementService'
import { useAuth } from '@/contexts/AuthContext'
import { cardStaggerContainer, cardStaggerItem, cardStaggerItemTransition } from '@/animations/variants'
import { formatDateTime } from '@/utils/formatters'
import type { DashboardStats, Ticket, Announcement } from '@/types'

interface ActivityItem {
  id: string
  ticketId: string
  ticketTitle: string
  label: string
  timestamp: string
}

export function EmployeeDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      statsService.getDashboardStats('karyawan', user.id),
      ticketService.getTickets('karyawan', user.id),
      announcementService.getAnnouncements(),
    ])
      .then(([s, t, a]) => {
        setStats(s)
        setTickets(t)
        setAnnouncements(a)
      })
      .finally(() => setLoading(false))
  }, [user])

  const todayStr = new Date().toISOString().split('T')[0]

  const waitingCount = tickets.filter((t) => t.status === 'In Progress').length
  const completedToday = tickets.filter((t) => t.status === 'Completed' && t.updatedAt.startsWith(todayStr)).length

  const activeTickets = tickets
    .filter((t) => t.status === 'Open' || t.status === 'In Progress')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const activities: ActivityItem[] = []
  tickets.forEach((ticket) => {
    activities.push({
      id: `${ticket.id}-submitted`,
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      label: 'Ticket submitted',
      timestamp: ticket.createdAt,
    })

    if (ticket.notes.length > 0) {
      activities.push({
        id: `${ticket.id}-accepted`,
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        label: 'Ticket accepted',
        timestamp: ticket.notes[0].createdAt,
      })
    }

    if (ticket.status === 'In Progress' && ticket.notes.length > 0) {
      activities.push({
        id: `${ticket.id}-progress`,
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        label: 'Ticket in progress',
        timestamp: ticket.notes[ticket.notes.length - 1].createdAt,
      })
    }

    if (ticket.status === 'Completed') {
      activities.push({
        id: `${ticket.id}-completed`,
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        label: 'Ticket completed',
        timestamp: ticket.updatedAt,
      })
    }
  })
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!stats || !user) return null

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Row 1: Today's Summary */}
      <motion.div
        variants={cardStaggerItem}
        transition={cardStaggerItemTransition}
      >
        <Card padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                Today's Summary
              </p>
              <p className="text-text-muted text-sm mt-1">
                Track your tickets and activities for today.
              </p>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.openTickets}</p>
                <p className="text-xs text-text-muted mt-0.5">Open Tickets</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{waitingCount}</p>
                <p className="text-xs text-text-muted mt-0.5">Waiting Tickets</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{completedToday}</p>
                <p className="text-xs text-text-muted mt-0.5">Completed Today</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Row 2: 4 Statistics Cards */}
      <motion.div
        variants={cardStaggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatWidget label="Total Tickets" value={stats.totalTickets} />
        <StatWidget label="Open Tickets" value={stats.openTickets} />
        <StatWidget label="Completed Tickets" value={stats.completedTickets} />
        <StatWidget label="Total Assets" value={stats.totalAssets} />
      </motion.div>

      {/* Row 3: My Active Tickets + Recent Activity */}
      <motion.div
        variants={cardStaggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <Card padding="lg" className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              My Active Tickets
            </h3>
            {activeTickets.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">
                No active tickets. Everything looks good!
              </p>
            ) : (
              <div className="space-y-3">
                {activeTickets.slice(0, 3).map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="w-full text-left p-3 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-medium text-text-primary truncate">
                      {ticket.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-mono text-text-muted">
                        {ticket.id}
                      </span>
                      <Badge variant="priority" value={ticket.priority} />
                      <Badge variant="status" value={ticket.status} />
                    </div>
                    <p className="text-xs text-text-muted mt-1.5">
                      Last Updated: {formatDateTime(ticket.updatedAt)}
                    </p>
                  </button>
                ))}
              </div>
            )}
            {activeTickets.length > 3 && (
              <button
                onClick={() => navigate('/tickets')}
                className="w-full text-center text-sm text-brand-primary font-medium mt-4 hover:underline cursor-pointer"
              >
                View All Tickets
              </button>
            )}
          </Card>
        </motion.div>

        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <Card padding="lg" className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Recent Activity
            </h3>
            {activities.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">
                No recent activity.
              </p>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/tickets/${item.ticketId}`)}
                    className="w-full text-left p-3 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-medium text-text-primary">
                      {item.label}
                    </p>
                    <p className="text-sm text-text-muted truncate mt-0.5">
                      {item.ticketTitle}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {formatDateTime(item.timestamp)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Row 4: Quick Actions + Announcement */}
      <motion.div
        variants={cardStaggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <Card padding="lg" className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Quick Actions
            </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/tickets/create')}
              className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
            >
              <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="text-sm font-medium text-text-primary">Create Ticket</p>
              <p className="text-xs text-text-muted mt-0.5">Report a new IT issue</p>
            </button>

            <button
              onClick={() => navigate('/qr-assets')}
              className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
            >
              <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h.75a.375.375 0 0 1 .375.375v.75c0 .207-.168.375-.375.375h-.75a1.125 1.125 0 0 1-1.125-1.125v-.75ZM16.5 16.5v.75c0 .207.168.375.375.375h.75a.375.375 0 0 0 .375-.375v-.75a.375.375 0 0 0-.375-.375h-.75a.375.375 0 0 0-.375.375v.75ZM16.5 13.875v-.75a.375.375 0 0 1 .375-.375h.75a.375.375 0 0 1 .375.375v.75a.375.375 0 0 1-.375.375h-.75a.375.375 0 0 1-.375-.375ZM19.5 14.625a1.125 1.125 0 0 0-1.125 1.125v.75c0 .621.504 1.125 1.125 1.125h.75a1.125 1.125 0 0 0 1.125-1.125v-.75a1.125 1.125 0 0 0-1.125-1.125h-.75Z" />
              </svg>
              <p className="text-sm font-medium text-text-primary">Scan QR Code</p>
              <p className="text-xs text-text-muted mt-0.5">Scan asset QR code</p>
            </button>

            <button
              onClick={() => navigate('/assets')}
              className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
            >
              <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
              <p className="text-sm font-medium text-text-primary">View My Assets</p>
              <p className="text-xs text-text-muted mt-0.5">Browse your registered assets</p>
            </button>

            <button
              onClick={() => navigate('/tickets')}
              className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
            >
              <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>
              <p className="text-sm font-medium text-text-primary">Ticket History</p>
              <p className="text-xs text-text-muted mt-0.5">View all your tickets</p>
            </button>
          </div>
        </Card>
        </motion.div>

        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <Card padding="lg" className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Announcement
            </h3>
            {announcements.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">
                No announcements available.
              </p>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((ann) => (
                  <div
                    key={ann.id}
                    className="rounded-xl bg-surface-overlay p-4 space-y-1.5"
                  >
                    <p className="text-sm font-medium text-text-primary">
                      {ann.title}
                    </p>
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                      {ann.description}
                    </p>
                    <p className="text-[11px] text-text-muted/60">
                      {formatDateTime(ann.date)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}