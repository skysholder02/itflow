export function generateId(prefix: string, existingIds: string[]): string {
  const numbers = existingIds
    .filter((id) => id.startsWith(prefix))
    .map((id) => parseInt(id.replace(`${prefix}-`, ''), 10))
    .filter((n) => !isNaN(n))

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1
  return `${prefix}-${String(next).padStart(3, '0')}`
}

export function generateNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function generateHistoryId(): string {
  return `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function generateNotificationId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
