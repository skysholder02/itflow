import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, Badge, Skeleton } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { jobService } from '@/services/jobService'
import type { Job } from '@/types'
import { cardStaggerContainer } from '@/animations/variants'
import { StatWidget } from '../dashboard/StatWidget'

export function VendorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    jobService.getJobs('vendor', user.id)
      .then(setJobs)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    )
  }

  // Calculate statistics
  const assignedJobs = jobs.filter(j => j.status === 'Pending' || j.status === 'Approved').length
  const inProgressJobs = jobs.filter(j => j.status === 'In Progress' || j.status === 'Need Extension').length
  const completedJobs = jobs.filter(j => j.status === 'Completed').length
  const pendingVerification = 0
  const todayJobs = jobs.length

  const todayStr = new Date().toISOString().split('T')[0]
  const deadlineToday = jobs.filter(j => j.deadline === todayStr && j.status !== 'Completed' && j.status !== 'Cancelled').length

  // Today's Schedule (active jobs sorted by timeline time)
  const todaySchedule = jobs
    .filter(j => j.status !== 'Cancelled' && j.status !== 'Completed')
    .sort((a, b) => {
      const aTime = a.timeline.length > 0 ? a.timeline[a.timeline.length - 1].time : a.deadline
      const bTime = b.timeline.length > 0 ? b.timeline[b.timeline.length - 1].time : b.deadline
      return aTime.localeCompare(bTime)
    })
    .slice(0, 5)

  // Job Progress - first active job
  const activeJob = jobs.find(j => j.status === 'In Progress' || j.status === 'Need Extension')

  const checklistItems = activeJob
    ? [
        { label: 'Before Documentation', done: activeJob.documentation.some(d => d.type === 'Before') },
        { label: 'Material Recorded', done: activeJob.materials.length > 0 },
        { label: 'Work Started', done: activeJob.timeline.length > 0 },
        { label: 'After Documentation', done: activeJob.documentation.some(d => d.type === 'After') },
        { label: 'Waiting Verification', done: false },
      ]
    : []

  const progressPct = checklistItems.length > 0
    ? Math.round((checklistItems.filter(i => i.done).length / checklistItems.length) * 100)
    : 0

  // Recent Assigned Jobs
  const recentJobs = [...jobs]
    .sort((a, b) => b.deadline.localeCompare(a.deadline))
    .slice(0, 5)

  // Material Usage
  const materialMap: Record<string, { quantity: number; unit: string }> = {}
  jobs.forEach(job => {
    job.materials.forEach(mat => {
      if (!materialMap[mat.materialName]) {
        materialMap[mat.materialName] = { quantity: 0, unit: mat.unit }
      }
      materialMap[mat.materialName].quantity += mat.quantity
    })
  })
  const materialUsage = Object.entries(materialMap).slice(0, 8)

  // Recent Activity (aggregate timeline items across all jobs)
  interface ActivityItem {
    jobId: string
    jobTitle: string
    time: string
    activity: string
    idx: number
  }
  const allActivities: ActivityItem[] = []
  jobs.forEach(job => {
    job.timeline.forEach((item, idx) => {
      allActivities.push({
        jobId: job.id,
        jobTitle: job.title,
        time: item.time,
        activity: item.activity,
        idx,
      })
    })
  })
  const recentActivities = allActivities.slice(-5).reverse()

  // Documentation Status
  const hasBeforePhotos = jobs.some(j => j.documentation.some(d => d.type === 'Before'))
  const hasAfterPhotos = jobs.some(j => j.documentation.some(d => d.type === 'After'))
  const docStatusItems = [
    { label: 'Before Photos', done: hasBeforePhotos },
    { label: 'After Photos', done: hasAfterPhotos },
    { label: 'Signature', done: false },
    { label: 'Verification', done: false },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section: Today's Work Overview */}
      <Card padding="lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="lg:max-w-md">
            <h1 className="text-2xl font-bold text-text-primary">
              Today's Work Overview
            </h1>
            <p className="text-text-muted mt-1">
              Welcome back, {user?.vendorCompany || user?.name}
            </p>
            <p className="text-text-muted text-sm mt-3 leading-relaxed">
              Stay on track! Complete your assigned jobs before the SLA deadline to ensure smooth operations.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0">
            <div className="p-4 rounded-xl bg-surface-overlay">
              <p className="text-2xl font-bold text-text-primary">{todayJobs}</p>
              <p className="text-xs text-text-muted mt-0.5">Today's Jobs</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-overlay">
              <p className="text-2xl font-bold text-brand-primary">{inProgressJobs}</p>
              <p className="text-xs text-text-muted mt-0.5">In Progress</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-overlay">
              <p className="text-2xl font-bold text-emerald-400">{completedJobs}</p>
              <p className="text-xs text-text-muted mt-0.5">Completed Today</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-overlay">
              <p className="text-2xl font-bold text-amber-400">{deadlineToday}</p>
              <p className="text-xs text-text-muted mt-0.5">Deadline Today</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Row: Job Stat Cards */}
      <motion.div
        variants={cardStaggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <StatWidget label="Assigned Jobs" value={assignedJobs} />
        <StatWidget label="In Progress" value={inProgressJobs} />
        <StatWidget label="Completed" value={completedJobs} />
        <StatWidget label="Deadline Today" value={deadlineToday} />
        <StatWidget label="Pending Verification" value={pendingVerification} />
      </motion.div>

      {/* Two-column: Today's Schedule | Job Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Today's Schedule */}
        <Card padding="lg" className="h-full">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Today's Schedule
          </h3>
          {todaySchedule.length === 0 ? (
            <p className="text-sm text-text-muted py-6 text-center">
              No scheduled jobs for today.
            </p>
          ) : (
            <div className="space-y-0">
              {todaySchedule.map((job, idx) => {
                const lastTime = job.timeline.length > 0
                  ? job.timeline[job.timeline.length - 1].time
                  : job.deadline.slice(5)
                return (
                  <div key={job.id} className="relative pb-6 last:pb-0">
                    {idx < todaySchedule.length - 1 && (
                      <span className="absolute top-5 left-[11px] -ml-px h-full w-0.5 bg-white/5" />
                    )}
                    <div className="relative flex gap-4">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-brand-primary">
                          {idx + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {job.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                          <span>{lastTime}</span>
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="mt-1">
                          <Badge variant="status" value={job.status} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Right: Job Progress */}
        <Card padding="lg" className="h-full">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Job Progress
          </h3>
          {!activeJob ? (
            <p className="text-sm text-text-muted py-6 text-center">
              No active job in progress.
            </p>
          ) : (
            <div>
              <p className="text-sm font-medium text-text-primary">
                {activeJob.title}
              </p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-muted">Progress</span>
                  <span className="text-text-primary font-medium">{progressPct}%</span>
                </div>
                <div className="h-2.5 bg-surface-overlay rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="h-full rounded-full bg-brand-primary"
                  />
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="status" value={activeJob.status} />
              </div>
              <div className="mt-5 space-y-2.5">
                {checklistItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <span className={`text-sm ${item.done ? 'text-emerald-400' : 'text-text-muted'}`}>
                      {item.done ? '✔' : '⏳'}
                    </span>
                    <span className={`text-sm ${item.done ? 'text-text-primary' : 'text-text-muted'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Two-column: Recent Assigned Jobs | Material Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Assigned Jobs */}
        <Card padding="lg" className="h-full">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Recent Assigned Jobs
          </h3>
          {recentJobs.length === 0 ? (
            <p className="text-sm text-text-muted py-6 text-center">
              No assigned jobs yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/vendor/jobs/${job.id}`)}
                  className="w-full p-3 rounded-xl bg-surface-overlay cursor-pointer transition-colors duration-300 border border-transparent hover:border-brand-primary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {job.title}
                    </p>
                    <Badge variant="status" value={job.status} />
                  </div>
                  <p className="text-xs text-text-muted mt-1.5">
                    Assigned: {new Date(job.deadline).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right: Material Usage */}
        <Card padding="lg" className="h-full">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Material Usage
          </h3>
          {materialUsage.length === 0 ? (
            <p className="text-sm text-text-muted py-6 text-center">
              No materials recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {materialUsage.map(([name, mat]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-overlay"
                >
                  <span className="text-sm text-text-primary truncate">{name}</span>
                  <span className="text-sm text-text-muted shrink-0 ml-2">
                    {mat.quantity} {mat.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Section: Recent Activity | Documentation Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Activity */}
        <Card padding="lg" className="h-full">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Recent Activity
          </h3>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-text-muted py-6 text-center">
              No recent activity recorded.
            </p>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivities.map((act, actIdx) => (
                  <li key={actIdx}>
                    <div className="relative pb-8">
                      {actIdx !== recentActivities.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/5" />
                      )}
                      <div className="relative flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-brand-primary">
                            {act.time}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="text-sm text-text-secondary">
                            {act.activity}
                          </p>
                          <button
                            onClick={() => navigate(`/vendor/jobs/${act.jobId}`)}
                            className="text-xs text-brand-accent hover:underline mt-0.5 block cursor-pointer"
                          >
                            {act.jobTitle}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Right: Documentation Status */}
        <Card padding="lg" className="h-full">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Documentation Status
          </h3>
          <div className="space-y-3">
            {docStatusItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-overlay"
              >
                <span className="text-sm text-text-primary">{item.label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  item.done
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {item.done ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => navigate('/vendor/documentation')}
            className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
          >
            <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            <p className="text-sm font-medium text-text-primary">Upload Before Photos</p>
            <p className="text-xs text-text-muted mt-0.5">Add before-work documentation</p>
          </button>
          <button
            onClick={() => navigate('/vendor/documentation')}
            className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
          >
            <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            <p className="text-sm font-medium text-text-primary">Upload After Photos</p>
            <p className="text-xs text-text-muted mt-0.5">Add after-work documentation</p>
          </button>
          <button
            onClick={() => navigate('/vendor/materials')}
            className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
          >
            <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            <p className="text-sm font-medium text-text-primary">Add Material</p>
            <p className="text-xs text-text-muted mt-0.5">Record material usage</p>
          </button>
          <button
            onClick={() => navigate('/vendor/timeline')}
            className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
          >
            <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-text-primary">Open Timeline</p>
            <p className="text-xs text-text-muted mt-0.5">View job activity timeline</p>
          </button>
          <button
            onClick={() => navigate('/vendor/jobs')}
            className="w-full text-left p-4 rounded-xl bg-surface-overlay hover:bg-surface-overlay-hover transition-colors cursor-pointer group"
          >
            <svg className="w-6 h-6 text-brand-primary mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m-7.5 0V5.25A2.25 2.25 0 0113.5 3h3a2.25 2.25 0 012.25 2.25v.894m-7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            <p className="text-sm font-medium text-text-primary">View My Jobs</p>
            <p className="text-xs text-text-muted mt-0.5">Browse all assigned jobs</p>
          </button>
        </div>
      </Card>
    </div>
  )
}
