import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { StatWidget } from '@/components/dashboard/StatWidget'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { SkeletonCard } from '@/components/ui'
import { statsService } from '@/services/statsService'
import { useAuth } from '@/contexts/AuthContext'
import { cardStaggerContainer } from '@/animations/variants'
import type { DashboardStats } from '@/types'

export function DashboardPage() {
  const { role, user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!role || !user) return
    statsService
      .getDashboardStats(role, user.id)
      .then(setStats)
      .finally(() => setLoading(false))
  }, [role, user])

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
          {role === 'employee'
            ? 'Your ticket overview'
            : role === 'leader_it'
              ? 'IT department statistics'
              : 'All tickets overview'}
        </p>
      </div>

      <motion.div
        variants={cardStaggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatWidget
          label="Total Tickets"
          value={stats.totalTickets}
          icon="🎫"
          color="from-brand-primary/30 to-brand-primary/10"
        />
        <StatWidget
          label="Open Tickets"
          value={stats.openTickets}
          icon="📂"
          color="from-blue-500/30 to-blue-500/10"
        />
        <StatWidget
          label="Completed Tickets"
          value={stats.completedTickets}
          icon="✅"
          color="from-green-500/30 to-green-500/10"
        />
        <StatWidget
          label="Total Assets"
          value={stats.totalAssets}
          icon="💻"
          color="from-brand-accent/30 to-brand-accent/10"
        />
      </motion.div>

      {(role === 'it_support' || role === 'leader_it') && (
        <CategoryChart data={stats.ticketsByCategory} />
      )}
    </div>
  )
}
