import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, Badge, Skeleton, Select, EmptyState } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { jobService } from '@/services/jobService'
import type { Job } from '@/types'
import { cardStaggerContainer } from '@/animations/variants'
import { formatDate } from '@/utils/formatters'

export function MyJobs() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (!user) return
    jobService.getJobs('vendor', user.id)
      .then(setJobs)
      .finally(() => setLoading(false))
  }, [user])

  const filteredJobs = jobs.filter((j) => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false
    return true
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-24px" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Pekerjaan Saya</h2>
          <p className="text-text-muted text-sm mt-1">Daftar semua tugas dan proyek yang diberikan kepada Anda</p>
        </div>
        <div className="w-full sm:w-64">
          <Select
            options={[
              { value: 'all', label: 'Semua Status' },
              { value: 'Pending', label: 'Menunggu' },
              { value: 'Approved', label: 'Disetujui' },
              { value: 'In Progress', label: 'Dalam Proses' },
              { value: 'Need Extension', label: 'Butuh Perpanjangan' },
              { value: 'Completed', label: 'Selesai' },
              { value: 'Cancelled', label: 'Dibatalkan' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <EmptyState
          title="Tidak ada pekerjaan"
          description={
            statusFilter === 'all'
              ? 'Saat ini belum ada pekerjaan yang ditugaskan kepada Anda.'
              : 'Tidak ada pekerjaan dengan status terpilih.'
          }
        />
      ) : (
        <motion.div
          variants={cardStaggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              hover
              onClick={() => navigate(`/vendor/jobs/${job.id}`)}
              className="cursor-pointer border border-white/5 flex flex-col justify-between h-full hover:border-brand-primary/40 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-brand-accent">{job.id}</span>
                  <Badge variant="jobStatus" value={job.status} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-brand-primary transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 block">📍 {job.location}</p>
                </div>
              </div>

              <div className="border-t border-white/5 mt-6 pt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Leader IT:</span>
                  <span className="text-text-primary font-medium">{job.leaderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">IT Support Pendamping:</span>
                  <span className="text-text-primary font-medium">{job.itSupportName}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/5">
                  <span className="text-text-muted">Deadline:</span>
                  <span className="text-red-400 font-semibold">{formatDate(job.deadline)}</span>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  )
}
