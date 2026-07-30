import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, Badge, Skeleton } from '@/components/ui'
import { StatWidget } from '@/components/dashboard/StatWidget'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { statsService } from '@/services/statsService'
import { ticketService } from '@/services/ticketService'
import { jobService } from '@/services/jobService'
import { useAuth } from '@/contexts/AuthContext'
import { cardStaggerContainer, cardStaggerItem, cardStaggerItemTransition } from '@/animations/variants'
import { timeAgo } from '@/utils/formatters'
import type { DashboardStats, Ticket, Job } from '@/types'

export function ITSupDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      statsService.getDashboardStats('itsupport', user.id),
      ticketService.getTickets('itsupport', user.id),
      jobService.getJobs('itsupport', user.id),
    ])
      .then(([s, t, j]) => {
        setStats(s)
        setTickets(t)
        setJobs(j)
      })
      .finally(() => setLoading(false))
  }, [user])

  const activeTickets = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length
  const vendorsWorking = jobs.filter((j) => j.status === 'In Progress').length
  const waitingApproval = jobs.filter((j) => j.status === 'Pending').length

  const highPriorityTickets = tickets
    .filter((t) => (t.priority === 'Critical' || t.priority === 'High') && t.status !== 'Completed')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const slaMs = 24 * 60 * 60 * 1000
  const nearMs = 18 * 60 * 60 * 1000
  const now = Date.now()
  let withinSLA = 0
  let nearDeadline = 0
  let overSLA = 0
  tickets.forEach((t) => {
    const created = new Date(t.createdAt).getTime()
    if (t.status === 'Completed') {
      const resolved = new Date(t.updatedAt).getTime()
      if (resolved - created <= slaMs) withinSLA++
      else overSLA++
    } else {
      const age = now - created
      if (age <= nearMs) withinSLA++
      else if (age <= slaMs) nearDeadline++
      else overSLA++
    }
  })
  const slaTotal = withinSLA + nearDeadline + overSLA
  const slaPct = (v: number) => (slaTotal > 0 ? Math.round((v / slaTotal) * 100) : 0)

  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-3xl" />
      </div>
    )
  }

  if (!stats || !user) return null

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Row 1: Today's Operations */}
      <motion.div
        variants={cardStaggerItem}
        initial="initial"
        animate="animate"
        transition={cardStaggerItemTransition}
      >
        <Card padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                Today's Operations
              </p>
              <p className="text-text-muted text-sm mt-1">
                Monitor ongoing tickets and today's IT activities.
              </p>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-2xl font-bold text-text-primary">{activeTickets}</p>
                <p className="text-xs text-text-muted mt-0.5">Active Tickets</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{vendorsWorking}</p>
                <p className="text-xs text-text-muted mt-0.5">Vendors Working</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{waitingApproval}</p>
                <p className="text-xs text-text-muted mt-0.5">Waiting Approval</p>
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

      {/* Row 3: High Priority Tickets | SLA Status */}
      <motion.div
        variants={cardStaggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <Card padding="lg" className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              High Priority Tickets
            </h3>
            {highPriorityTickets.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">
                No high priority tickets.
              </p>
            ) : (
              <div className="space-y-3">
                {highPriorityTickets.slice(0, 5).map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="w-full text-left p-3 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-medium text-text-primary truncate">
                      {ticket.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="priority" value={ticket.priority} />
                      <Badge variant="status" value={ticket.status} />
                    </div>
                  </button>
                ))}
              </div>
            )}
            {highPriorityTickets.length > 5 && (
              <button
                onClick={() => navigate('/tickets')}
                className="w-full text-center text-sm text-brand-primary font-medium mt-4 hover:underline cursor-pointer"
              >
                View all high priority tickets
              </button>
            )}
          </Card>
        </motion.div>

        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <Card padding="lg" className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              SLA Status
            </h3>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-primary font-medium">Within SLA</span>
                  <span className="text-text-muted">{withinSLA} ({slaPct(withinSLA)}%)</span>
                </div>
                <div className="h-2.5 bg-surface-overlay rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${slaPct(withinSLA)}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-primary font-medium">Near Deadline</span>
                  <span className="text-text-muted">{nearDeadline} ({slaPct(nearDeadline)}%)</span>
                </div>
                <div className="h-2.5 bg-surface-overlay rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${slaPct(nearDeadline)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full rounded-full bg-amber-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-primary font-medium">Over SLA</span>
                  <span className="text-text-muted">{overSLA} ({slaPct(overSLA)}%)</span>
                </div>
                <div className="h-2.5 bg-surface-overlay rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${slaPct(overSLA)}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-full rounded-full bg-red-500"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Row 4: Recent Tickets | Vendor Monitoring */}
      <motion.div
        variants={cardStaggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <Card padding="lg" className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Recent Tickets
            </h3>
            {recentTickets.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">
                No tickets yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="w-full text-left p-3 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-medium text-text-primary truncate">
                      {ticket.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-text-muted">
                        {timeAgo(ticket.createdAt)}
                      </span>
                      <Badge variant="status" value={ticket.status} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <Card padding="lg" className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Vendor Monitoring
            </h3>
            {jobs.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">
                No vendor jobs.
              </p>
            ) : (
              <div className="space-y-3">
                {jobs.filter((j) => j.status !== 'Cancelled').map((job) => (
                  <button
                    key={job.id}
                    onClick={() => navigate('/leader/jobs')}
                    className="w-full text-left p-3 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-medium text-text-primary truncate">
                      {job.vendorName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-text-muted">
                        {job.workers.length} Worker{job.workers.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary font-medium">
                        {job.status}
                      </span>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => navigate('/leader/jobs')}
                  className="w-full text-center text-sm text-brand-primary font-medium mt-2 hover:underline cursor-pointer"
                >
                  View All Jobs
                </button>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Row 5: Ticket Categories */}
      <motion.div
        variants={cardStaggerItem}
        initial="initial"
        animate="animate"
        transition={cardStaggerItemTransition}
      >
        <CategoryChart data={stats.ticketsByCategory} />
      </motion.div>

      {/* Row 6: Quick Actions */}
      <motion.div
        variants={cardStaggerItem}
        initial="initial"
        animate="animate"
        transition={cardStaggerItemTransition}
      >
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/tickets/create')}
              className="w-full text-left p-5 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
            >
              <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="text-sm font-medium text-text-primary">Create Ticket</p>
              <p className="text-xs text-text-muted mt-1">Report a new IT issue</p>
            </button>
            <button
              onClick={() => navigate('/leader/jobs')}
              className="w-full text-left p-5 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
            >
              <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
              <p className="text-sm font-medium text-text-primary">Assign Vendor</p>
              <p className="text-xs text-text-muted mt-1">Assign vendor to jobs</p>
            </button>
            <button
              onClick={() => navigate('/qr-assets')}
              className="w-full text-left p-5 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
            >
              <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h.75a.375.375 0 0 1 .375.375v.75c0 .207-.168.375-.375.375h-.75a1.125 1.125 0 0 1-1.125-1.125v-.75ZM16.5 16.5v.75c0 .207.168.375.375.375h.75a.375.375 0 0 0 .375-.375v-.75a.375.375 0 0 0-.375-.375h-.75a.375.375 0 0 0-.375.375v.75ZM16.5 13.875v-.75a.375.375 0 0 1 .375-.375h.75a.375.375 0 0 1 .375.375v.75a.375.375 0 0 1-.375.375h-.75a.375.375 0 0 1-.375-.375ZM19.5 14.625a1.125 1.125 0 0 0-1.125 1.125v.75c0 .621.504 1.125 1.125 1.125h.75a1.125 1.125 0 0 0 1.125-1.125v-.75a1.125 1.125 0 0 0-1.125-1.125h-.75Z" />
              </svg>
              <p className="text-sm font-medium text-text-primary">Scan QR Asset</p>
              <p className="text-xs text-text-muted mt-1">Scan asset QR codes</p>
            </button>
            <button
              onClick={() => navigate('/assets')}
              className="w-full text-left p-5 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
            >
              <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
              <p className="text-sm font-medium text-text-primary">Add Asset</p>
              <p className="text-xs text-text-muted mt-1">Register new IT asset</p>
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
