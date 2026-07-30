import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, Badge, Skeleton } from '@/components/ui'
import { StatWidget } from '@/components/dashboard/StatWidget'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { statsService } from '@/services/statsService'
import { ticketService } from '@/services/ticketService'
import { jobService } from '@/services/jobService'
import { userRepo } from '@/services/repositories'
import { useAuth } from '@/contexts/AuthContext'
import { cardStaggerContainer, cardStaggerItem, cardStaggerItemTransition } from '@/animations/variants'
import type { DashboardStats, Ticket, Job, User } from '@/types'

export function LeaderITDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      statsService.getDashboardStats('leaderit', user.id),
      ticketService.getTickets('leaderit', user.id),
      jobService.getJobs('leaderit', user.id),
      userRepo.getAll(),
    ])
      .then(([s, t, j, u]) => {
        setStats(s)
        setTickets(t)
        setJobs(j)
        setUsers(u)
      })
      .finally(() => setLoading(false))
  }, [user])

  const todayStr = new Date().toISOString().split('T')[0]
  const todayTickets = tickets.filter((t) => t.createdAt.startsWith(todayStr)).length
  const resolvedToday = tickets.filter((t) => t.status === 'Completed' && t.updatedAt.startsWith(todayStr)).length
  const activeVendors = new Set(jobs.filter((j) => j.status === 'In Progress').map((j) => j.vendorId)).size

  const criticalTickets = tickets
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

  const userMap = new Map(users.map((u) => [u.id, u]))
  const deptStats: Record<string, { total: number; completed: number }> = {}
  tickets.forEach((t) => {
    const dept = userMap.get(t.reporterId)?.department ?? 'Unknown'
    if (!deptStats[dept]) deptStats[dept] = { total: 0, completed: 0 }
    deptStats[dept].total++
    if (t.status === 'Completed') deptStats[dept].completed++
  })
  const topDepartments = Object.entries(deptStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)

  const vendorJobs: Record<string, { completed: number; total: number; status: string }> = {}
  jobs.forEach((j) => {
    if (!vendorJobs[j.vendorName]) vendorJobs[j.vendorName] = { completed: 0, total: 0, status: 'Inactive' }
    vendorJobs[j.vendorName].total++
    if (j.status === 'Completed') vendorJobs[j.vendorName].completed++
    if (j.status === 'In Progress') vendorJobs[j.vendorName].status = 'Active'
    else if (j.status === 'Need Extension' && vendorJobs[j.vendorName].status !== 'Active')
      vendorJobs[j.vendorName].status = 'Extension'
  })
  const vendorEntries = Object.entries(vendorJobs).slice(0, 5)

  const locCount: Record<string, number> = {}
  tickets.forEach((t) => {
    locCount[t.location] = (locCount[t.location] || 0) + 1
  })
  const topLocations = Object.entries(locCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const pendingEmployeeApprovals = users.filter(
    (u) => u.role === 'karyawan' && u.status === 'PendingApproval',
  ).length
  const pendingVendorApprovals = users.filter(
    (u) => u.role === 'vendor' && u.vendorStatus === 'PendingApproval',
  ).length
  const pendingExtensionRequests = jobs.filter((j) =>
    j.extensionRequests?.some((r) => r.status === 'Pending'),
  ).length
  const pendingApprovals = pendingEmployeeApprovals + pendingVendorApprovals
  const pendingAssetRequests = 0

  const getAssignedInfo = (location: string) => {
    const match = jobs.find((j) => j.status === 'In Progress' && j.location === location)
    if (!match) return null
    return { vendorName: match.vendorName, itSupportName: match.itSupportName }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>
      </div>
    )
  }

  if (!stats || !user) return null

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Row 1: Executive Overview */}
      <motion.div
        variants={cardStaggerItem}
        initial="initial"
        animate="animate"
        transition={cardStaggerItemTransition}
      >
        <Card padding="lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="lg:max-w-md">
              <h1 className="text-2xl font-bold text-text-primary">
                IT Operations Overview
              </h1>
              <p className="text-text-muted mt-2 leading-relaxed">
                Monitor department performance, SLA compliance and infrastructure status across the company.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 shrink-0">
              <div className="p-4 rounded-xl bg-surface-overlay">
                <p className="text-2xl font-bold text-text-primary">{todayTickets}</p>
                <p className="text-xs text-text-muted mt-0.5">Today's Tickets</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-overlay">
                <p className="text-2xl font-bold text-red-400">{criticalTickets.length}</p>
                <p className="text-xs text-text-muted mt-0.5">Critical Issues</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-overlay">
                <p className="text-2xl font-bold text-brand-primary">{activeVendors}</p>
                <p className="text-xs text-text-muted mt-0.5">Active Vendors</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-overlay">
                <p className="text-2xl font-bold text-amber-400">{pendingApprovals}</p>
                <p className="text-xs text-text-muted mt-0.5">Pending Approvals</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Row 2: Executive Stats */}
      <motion.div
        variants={cardStaggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6"
      >
        <StatWidget label="Total Tickets" value={stats.totalTickets} />
        <StatWidget label="Open Tickets" value={stats.openTickets} />
        <StatWidget label="Resolved Today" value={resolvedToday} />
        <StatWidget label="Total Assets" value={stats.totalAssets} />
        <StatWidget label="Active Vendors" value={activeVendors} />
      </motion.div>

      {/* Row 3: Critical Tickets | SLA Performance */}
      <motion.div
        variants={cardStaggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <Card padding="lg" className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Critical Tickets
            </h3>
            {criticalTickets.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">
                No critical or high priority tickets.
              </p>
            ) : (
              <div className="space-y-3">
                {criticalTickets.slice(0, 5).map((ticket) => (
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
                    {(() => {
                      const assigned = getAssignedInfo(ticket.location)
                      if (!assigned) return null
                      return (
                        <p className="text-xs text-text-muted mt-1.5">
                          Assigned to {assigned.vendorName || assigned.itSupportName}
                          {assigned.vendorName ? ' (Vendor)' : ' (IT Support)'}
                        </p>
                      )
                    })()}
                  </button>
                ))}
              </div>
            )}
            {criticalTickets.length > 5 && (
              <button
                onClick={() => navigate('/tickets')}
                className="w-full text-center text-sm text-brand-primary font-medium mt-4 hover:underline cursor-pointer"
              >
                View all critical tickets
              </button>
            )}
          </Card>
        </motion.div>

        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <Card padding="lg" className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              SLA Performance
            </h3>
            <div className="space-y-4">
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

      {/* Row 4: Department Performance | Vendor Performance */}
      <motion.div
        variants={cardStaggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <Card padding="lg" className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Department Performance
            </h3>
            {topDepartments.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">
                No department data available.
              </p>
            ) : (
              <div className="space-y-4">
                {topDepartments.map(([dept, stats], i) => {
                  const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
                  return (
                    <div key={dept}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">{dept}</span>
                        <span className="text-text-muted">{stats.completed}/{stats.total} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-surface-overlay rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <Card padding="lg" className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Vendor Performance
            </h3>
            {vendorEntries.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">
                No vendor data available.
              </p>
            ) : (
              <div className="space-y-3">
                {vendorEntries.map(([name, v]) => {
                  const pct = v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0
                  return (
                    <div
                      key={name}
                      className="w-full p-3 rounded-xl bg-surface-overlay"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {name}
                        </p>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            v.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : v.status === 'Extension'
                                ? 'bg-amber-500/10 text-amber-400'
                                : v.status === 'Completed'
                                  ? 'bg-blue-500/10 text-blue-400'
                                  : 'bg-surface-overlay text-text-muted'
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                        <span>{v.completed} Completed</span>
                        <span>{pct}% Performance</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-surface-overlay rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }}
                          className="h-full rounded-full bg-brand-primary"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Row 5: Top Problem Locations | Ticket Categories */}
      <motion.div
        variants={cardStaggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <Card padding="lg" className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Top Problem Locations
            </h3>
            {topLocations.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">
                No location data available.
              </p>
            ) : (
              <div className="space-y-4">
                {topLocations.map(([loc, count], i) => {
                  const maxCount = topLocations[0][1]
                  const width = (count / maxCount) * 100
                  return (
                    <div key={loc}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-text-secondary truncate">{loc}</span>
                        <span className="text-text-muted shrink-0 ml-2">{count}</span>
                      </div>
                      <div className="h-2 bg-surface-overlay rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                          className="h-full rounded-full bg-brand-secondary"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <CategoryChart data={stats.ticketsByCategory} />
        </motion.div>
      </motion.div>

      {/* Row 6: Approval Center | Quick Actions */}
      <motion.div
        variants={cardStaggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <Card padding="lg" className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Approval Center
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/leader/vendors')}
                className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Pending Vendor Approval</p>
                    <p className="text-xs text-text-muted mt-0.5">New vendor registrations</p>
                  </div>
                  <span className="text-lg font-bold text-text-primary">{pendingVendorApprovals}</span>
                </div>
              </button>
              <button
                onClick={() => navigate('/leader/users')}
                className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Pending Registration</p>
                    <p className="text-xs text-text-muted mt-0.5">New employee registrations</p>
                  </div>
                  <span className="text-lg font-bold text-text-primary">{pendingEmployeeApprovals}</span>
                </div>
              </button>
              <button
                onClick={() => navigate('/leader/jobs')}
                className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Pending Time Extension</p>
                    <p className="text-xs text-text-muted mt-0.5">Vendor job extension requests</p>
                  </div>
                  <span className="text-lg font-bold text-text-primary">{pendingExtensionRequests}</span>
                </div>
              </button>
              <button
                onClick={() => navigate('/assets')}
                className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Pending Asset Requests</p>
                    <p className="text-xs text-text-muted mt-0.5">Asset procurement requests</p>
                  </div>
                  <span className="text-lg font-bold text-text-primary">{pendingAssetRequests}</span>
                </div>
              </button>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardStaggerItem} transition={cardStaggerItemTransition}>
          <Card padding="lg" className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/leader/vendors')}
                className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
              >
                <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
                <p className="text-sm font-medium text-text-primary">Approve Vendor</p>
                <p className="text-xs text-text-muted mt-0.5">Review and approve vendor accounts</p>
              </button>
              <button
                onClick={() => navigate('/leader/users')}
                className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
              >
                <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
                <p className="text-sm font-medium text-text-primary">Assign IT Support</p>
                <p className="text-xs text-text-muted mt-0.5">Manage IT support assignments</p>
              </button>
              <button
                onClick={() => navigate('/leader/jobs')}
                className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
              >
                <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.485.485 0 0 1-.482-.027A9.112 9.112 0 0 1 5.126 9.9M15.34 15.84c.688-.06 1.386-.09 2.09-.09H16.5a4.5 4.5 0 1 0 0-9h-.75c-.704 0-1.402-.03-2.09-.09m0 9.18c-.253.962-.584 1.892-.985 2.783-.247.55-.06 1.21.463 1.511l.657.38a.485.485 0 0 0 .482-.027A9.112 9.112 0 0 0 18.874 9.9" />
                </svg>
                <p className="text-sm font-medium text-text-primary">Create Announcement</p>
                <p className="text-xs text-text-muted mt-0.5">Post department announcements</p>
              </button>
              <button
                onClick={() => navigate('/tickets')}
                className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
              >
                <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                </svg>
                <p className="text-sm font-medium text-text-primary">Export Report</p>
                <p className="text-xs text-text-muted mt-0.5">Generate IT operations report</p>
              </button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
