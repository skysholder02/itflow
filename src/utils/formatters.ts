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
    karyawan: 'Karyawan',
    itsupport: 'ITSupport',
    leaderit: 'LeaderIT',
  }
  return map[role] ?? role
}

export function formatTicketStatus(status: string): string {
  const map: Record<string, string> = {
    Open: 'Terbuka',
    'In Progress': 'Dalam Proses',
    Completed: 'Selesai',
  }
  return map[status] ?? status
}

export function formatTicketPriority(priority: string): string {
  const map: Record<string, string> = {
    Critical: 'Kritis',
    High: 'Tinggi',
    Medium: 'Sedang',
    Low: 'Rendah',
  }
  return map[priority] ?? priority
}

export function formatTicketCategory(category: string): string {
  const map: Record<string, string> = {
    Other: 'Lainnya',
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
    Active: 'Aktif',
    Maintenance: 'Maintenance',
    Retired: 'Tidak Aktif',
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
