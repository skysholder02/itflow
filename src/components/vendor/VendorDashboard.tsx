import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Badge, Button, Skeleton } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { jobService } from '@/services/jobService'
import type { Job } from '@/types'
import { cardStaggerContainer } from '@/animations/variants'
import { Link } from 'react-router-dom'
import { StatWidget } from '../dashboard/StatWidget'

export function VendorDashboard() {
  const { user } = useAuth()
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-24px" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-24px" />
      </div>
    )
  }

  // Calculate statistics
  const assignedJobs = jobs.filter(j => j.status === 'Pending' || j.status === 'Approved').length
  const inProgressJobs = jobs.filter(j => j.status === 'In Progress' || j.status === 'Need Extension').length
  const completedJobs = jobs.filter(j => j.status === 'Completed').length
  
  const todayStr = new Date().toISOString().split('T')[0]
  const deadlineToday = jobs.filter(j => j.deadline === todayStr && j.status !== 'Completed' && j.status !== 'Cancelled').length

  // Aggregate recent activities
  interface ActivityItem {
    jobId: string
    jobTitle: string
    time: string
    activity: string
    timestamp: number // for sorting
  }

  const activities: ActivityItem[] = []
  jobs.forEach(job => {
    job.timeline.forEach((item, idx) => {
      // Create a deterministic timestamp based on timeline item id or index if time is format "09.00"
      // We can parse or just use index to estimate, but let's do a reliable sorting.
      // Let's assume the timeline items are appended, so we can sort by index descending or parse time
      activities.push({
        jobId: job.id,
        jobTitle: job.title,
        time: item.time,
        activity: item.activity,
        timestamp: Date.now() - (idx * 60000) // Mock timestamp sequence
      })
    })
  })

  // Sort by latest timeline items
  const recentActivities = activities.slice(-5).reverse()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Dashboard Vendor</h2>
        <p className="text-text-muted text-sm mt-1">Selamat datang kembali, {user?.name} ({user?.vendorCompany})</p>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={cardStaggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatWidget label="Assigned Jobs" value={assignedJobs} />
        <StatWidget label="In Progress" value={inProgressJobs} />
        <StatWidget label="Completed" value={completedJobs} />
        <StatWidget label="Deadline Today" value={deadlineToday} />
      </motion.div>

      {/* Recent Activity & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Aktivitas Terbaru</h3>
          <div className="flow-root">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-text-muted py-4">Belum ada aktivitas tercatat.</p>
            ) : (
              <ul className="-mb-8">
                {recentActivities.map((act, actIdx) => (
                  <li key={actIdx}>
                    <div className="relative pb-8">
                      {actIdx !== recentActivities.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/5" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-xs text-brand-primary font-bold">
                            {act.time}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-text-secondary">
                              {act.activity}
                            </p>
                            <Link to={`/vendor/jobs/${act.jobId}`} className="text-xs text-brand-accent hover:underline mt-0.5 block">
                              Pekerjaan: {act.jobTitle}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* Account Info Card */}
        <Card className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Informasi Akun</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-text-muted">Status:</span>
              <Badge variant="role" value="vendor" />
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-text-muted">Perusahaan:</span>
              <span className="text-text-primary font-medium">{user?.vendorCompany}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-text-muted">Masa Aktif:</span>
              <span className="text-text-primary font-medium">
                {user?.vendorExpiryDate ? new Date(user.vendorExpiryDate).toLocaleDateString() : '-'}
              </span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-text-muted">PIC:</span>
              <span className="text-text-primary font-medium">{user?.vendorPIC}</span>
            </div>
          </div>
          <div className="pt-2">
            <Link to="/profile">
              <Button variant="secondary" className="w-full">
                Lihat Profil Lengkap
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
