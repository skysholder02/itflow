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
    employee: 'Employee',
    it_support: 'IT Support',
    leader_it: 'Leader IT',
  }
  return map[role] ?? role
}

export function getAssetUrl(assetId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/assets/${assetId}`
  }
  return `/assets/${assetId}`
}
