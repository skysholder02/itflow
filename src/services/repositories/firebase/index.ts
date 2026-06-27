const notConfigured = () => {
  throw new Error(
    'Firebase is not configured. Set VITE_DATA_PROVIDER=local or configure Firebase env variables.',
  )
}

export const firebaseUserRepo = {
  getAll: notConfigured,
  getById: notConfigured,
  getByEmail: notConfigured,
  update: notConfigured,
}

export const firebaseTicketRepo = {
  getAll: notConfigured,
  getById: notConfigured,
  getByReporter: notConfigured,
  create: notConfigured,
  update: notConfigured,
  addNote: notConfigured,
  delete: notConfigured,
}

export const firebaseAssetRepo = {
  getAll: notConfigured,
  getById: notConfigured,
  create: notConfigured,
  update: notConfigured,
  delete: notConfigured,
}

export const firebaseAssetHistoryRepo = {
  getAll: notConfigured,
  getByAssetId: notConfigured,
  create: notConfigured,
  delete: notConfigured,
}

export const firebaseNotificationRepo = {
  getByUserId: notConfigured,
  markAsRead: notConfigured,
  markAllAsRead: notConfigured,
}

export const firebaseSessionRepo = {
  getSession: notConfigured,
  setSession: notConfigured,
  clearSession: notConfigured,
}

export const firebaseContactRepo = {
  submit: notConfigured,
}
