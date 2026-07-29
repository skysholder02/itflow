import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { StatWidget } from '@/components/dashboard/StatWidget'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { SkeletonCard } from '@/components/ui'
import { statsService } from '@/services/statsService'
import { useAuth } from '@/contexts/AuthContext'
import { cardStaggerContainer } from '@/animations/variants'
import type { DashboardStats } from '@/types'
import { VendorDashboard } from '@/components/vendor/VendorDashboard'

export function DashboardPage() {
  const { role, user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!role || !user) return
    if (role === 'vendor') {
      setLoading(false)
      return
    }
    statsService
      .getDashboardStats(role, user.id)
      .then(setStats)
      .finally(() => setLoading(false))
  }, [role, user])

  if (role === 'vendor') {
    return <VendorDashboard />
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Dashboard</h2>
        <p className="text-text-muted text-sm mt-1">
          {role === 'karyawan'
            ? 'Ringkasan tiket Anda'
            : role === 'leaderit'
              ? 'Statistik departemen IT'
              : 'Ringkasan semua tiket'}
        </p>
      </div>

      <motion.div
        variants={cardStaggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatWidget label="Total Tiket" value={stats.totalTickets} />
        <StatWidget label="Tiket Terbuka" value={stats.openTickets} />
        <StatWidget label="Tiket Selesai" value={stats.completedTickets} />
        <StatWidget label="Total Aset" value={stats.totalAssets} />
      </motion.div>

      {(role === 'itsupport' || role === 'leaderit') && (
        <CategoryChart data={stats.ticketsByCategory} />
      )}
    </div>
  )
}
