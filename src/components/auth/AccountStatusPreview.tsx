import { motion } from 'framer-motion'
import { userRepo } from '@/services/repositories'
import { useEffect, useState } from 'react'
import type { User } from '@/types'

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -4, transition: { duration: 0.2 } }
}

const glowVariants = {
  initial: { boxShadow: '0 0 0 rgba(59, 130, 246, 0)' },
  hover: { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }
}

interface AccountCardProps {
  user: User
  statusColor: string
  statusIcon: string
}

function AccountCard({ user, statusColor, statusIcon }: AccountCardProps) {
  const roleLabels: Record<string, string> = {
    karyawan: 'Employee',
    itsupport: 'IT Support',
    leaderit: 'Leader IT',
    vendor: 'Vendor'
  }

  return (
    <motion.div
      variants={{ ...cardVariants, hover: { ...cardVariants.hover, ...glowVariants.hover } }}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${statusColor}`}>
          {statusIcon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-text-primary font-medium text-sm truncate">{user.name}</p>
          <p className="text-text-muted text-xs truncate">{roleLabels[user.role] || user.role}</p>
        </div>
      </div>
    </motion.div>
  )
}

interface StatusSectionProps {
  title: string
  icon: string
  iconColor: string
  count: number
  users: User[]
  emptyMessage: string
}

function StatusSection({ title, icon, iconColor, count, users, emptyMessage }: StatusSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`text-lg ${iconColor}`}>{icon}</span>
        <h4 className="text-sm font-medium text-text-primary">{title}</h4>
        <span className="text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full">({count})</span>
      </div>
      {users.length === 0 ? (
        <p className="text-xs text-text-muted pl-7">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 pl-7">
          {users.map((user) => (
            <AccountCard
              key={user.id}
              user={user}
              statusColor={iconColor}
              statusIcon={icon}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function AccountStatusPreview() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await userRepo.getAll()
        setUsers(allUsers)
      } catch (err) {
        console.error('Failed to load users:', err)
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-white/5 rounded w-32 mb-2" />
            <div className="space-y-2 pl-7">
              <div className="h-12 bg-white/5 rounded-2xl" />
              <div className="h-12 bg-white/5 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Filter users by status
  const pendingUsers = users.filter(u => u.status === 'PendingApproval' || u.vendorStatus === 'PendingApproval')
  const activeUsers = users.filter(u => u.status === 'Active' || (!u.status && u.vendorStatus === 'Active') || (!u.status && !u.vendorStatus && ['usr-001', 'usr-002', 'usr-003', 'usr-004'].includes(u.id)))
  const expiredUsers = users.filter(u => u.status === 'Expired' || u.vendorStatus === 'Expired')
  const archivedUsers = users.filter(u => u.status === 'Archived' || u.vendorStatus === 'Archived')

  // Demo accounts (the main ones for testing)
  const demoAccountIds = ['usr-001', 'usr-002', 'usr-003', 'usr-005']
  const demoUsers = users.filter(u => demoAccountIds.includes(u.id))

  return (
    <div className="space-y-6">
      {/* Waiting Approval */}
      <StatusSection
        title="Waiting Approval"
        icon="🟡"
        iconColor="text-yellow-400"
        count={pendingUsers.length}
        users={pendingUsers}
        emptyMessage="No pending accounts"
      />

      {/* Active Accounts */}
      <StatusSection
        title="Active Accounts"
        icon="🟢"
        iconColor="text-green-400"
        count={activeUsers.length}
        users={activeUsers}
        emptyMessage="No active accounts"
      />

      {/* Expired Accounts */}
      <StatusSection
        title="Expired Accounts"
        icon="🔴"
        iconColor="text-red-400"
        count={expiredUsers.length}
        users={expiredUsers}
        emptyMessage="No expired accounts"
      />

      {/* Archived Accounts */}
      <StatusSection
        title="Archived Accounts"
        icon="📦"
        iconColor="text-gray-400"
        count={archivedUsers.length}
        users={archivedUsers}
        emptyMessage="No archived accounts"
      />

      {/* Demo Accounts Separator */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎮</span>
          <h4 className="text-sm font-medium text-text-primary">Demo Accounts</h4>
          <span className="text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full">({demoUsers.length})</span>
        </div>
        <div className="grid grid-cols-1 gap-2 pl-7">
          {demoUsers.map((user) => (
            <AccountCard
              key={user.id}
              user={user}
              statusColor="text-brand-primary"
              statusIcon="🎮"
            />
          ))}
        </div>
      </div>
    </div>
  )
}