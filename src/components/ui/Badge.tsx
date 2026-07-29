import { cn } from '@/utils/cn'
import {
  formatAssetStatus,
  formatRole,
  formatTicketPriority,
  formatTicketStatus,
  formatJobStatus,
} from '@/utils/formatters'
import type { TicketPriority, TicketStatus, AssetStatus, JobStatus } from '@/types'

type BadgeVariant = 'priority' | 'status' | 'assetStatus' | 'role' | 'jobStatus' | 'default' | 'custom'

interface BadgeProps {
  variant?: BadgeVariant
  value?: string
  className?: string
  children?: React.ReactNode
}

const priorityColors: Record<TicketPriority, string> = {
  Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const statusColors: Record<TicketStatus, string> = {
  Open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'In Progress': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Completed: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const assetStatusColors: Record<AssetStatus, string> = {
  Active: 'bg-green-500/20 text-green-400 border-green-500/30',
  Maintenance: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Retired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const roleColors: Record<string, string> = {
  karyawan: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  itsupport: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  leaderit: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  vendor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Karyawan: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ITSupport: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  LeaderIT: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  Vendor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
}

const jobStatusColors: Record<JobStatus, string> = {
  Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Approved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'In Progress': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Need Extension': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function Badge({ variant = 'default', value, className }: BadgeProps) {
  let colorClass = 'bg-white/10 text-text-secondary border-white/10'
  let displayValue = value ?? ''

  if (variant === 'priority' && value) {
    colorClass = priorityColors[value as TicketPriority] ?? colorClass
    displayValue = formatTicketPriority(value)
  } else if (variant === 'status' && value) {
    colorClass = statusColors[value as TicketStatus] ?? colorClass
    displayValue = formatTicketStatus(value)
  } else if (variant === 'assetStatus' && value) {
    colorClass = assetStatusColors[value as AssetStatus] ?? colorClass
    displayValue = formatAssetStatus(value)
  } else if (variant === 'role' && value) {
    colorClass = roleColors[value] ?? colorClass
    displayValue = formatRole(value)
  } else if (variant === 'jobStatus' && value) {
    colorClass = jobStatusColors[value as JobStatus] ?? colorClass
    displayValue = formatJobStatus(value)
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colorClass,
        className,
      )}
    >
      {displayValue}
    </span>
  )
}
