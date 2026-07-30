export function timeAgo(date: string): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffSec = Math.floor((now - then) / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`
  return formatDate(date)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRole(role: string): string {
  const map: Record<string, string> = {
    karyawan: 'Employee',
    itsupport: 'ITSupport',
    leaderit: 'LeaderIT',
    vendor: 'Vendor',
  }
  return map[role] ?? role
}

export function formatVendorStatus(status: string): string {
  const map: Record<string, string> = {
    PendingApproval: 'Pending Approval',
    Active: 'Active',
    Expired: 'Expired',
    Archived: 'Archived',
  }
  return map[status] ?? status
}

export function formatJobStatus(status: string): string {
  const map: Record<string, string> = {
    Pending: 'Pending',
    Approved: 'Approved',
    'In Progress': 'In Progress',
    'Need Extension': 'Need Extension',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
  }
  return map[status] ?? status
}

export function formatTicketStatus(status: string): string {
  const map: Record<string, string> = {
    Open: 'Open',
    'In Progress': 'In Progress',
    Completed: 'Completed',
  }
  return map[status] ?? status
}

export function formatTicketPriority(priority: string): string {
  const map: Record<string, string> = {
    Critical: 'Critical',
    High: 'High',
    Medium: 'Medium',
    Low: 'Low',
  }
  return map[priority] ?? priority
}

export function formatTicketCategory(category: string): string {
  const map: Record<string, string> = {
    Other: 'Other',
  }
  return map[category] ?? category
}

export function formatAssetCategory(category: string): string {
  const map: Record<string, string> = {
    'Access Point': 'Access Point',
  }
  return map[category] ?? category
}

export function formatAssetStatus(status: string): string {
  const map: Record<string, string> = {
    Active: 'Active',
    Maintenance: 'Maintenance',
    Retired: 'Inactive',
  }
  return map[status] ?? status
}

export function getAssetUrl(assetId: string): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    const base = import.meta.env.BASE_URL || '/'
    const leadingSlash = base.startsWith('/') ? '' : '/'
    const trailingSlash = base.endsWith('/') ? '' : '/'
    const cleanBase = `${leadingSlash}${base}${trailingSlash}`.replace(/\/+/g, '/')
    return `${origin}${cleanBase}#/assets/${assetId}`
  }
  return `#/assets/${assetId}`
}
