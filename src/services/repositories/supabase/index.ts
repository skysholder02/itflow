// Supabase repositories: the user and session repositories are implemented;
// the rest are placeholder stubs until their migration steps.
// Keep VITE_DATA_PROVIDER=local until all repositories are ready.

export { supabaseUserRepo } from './userRepository'
export { supabaseSessionRepo } from './sessionRepository'

const notImplemented = (repo: string, method: string) => {
  throw new Error(
    `Supabase repository "${repo}.${method}" is not implemented yet. ` +
      'Keep VITE_DATA_PROVIDER=local until Supabase repositories are ready.',
  )
}

export const supabaseTicketRepo = {
  getAll: () => notImplemented('ticket', 'getAll'),
  getById: () => notImplemented('ticket', 'getById'),
  getByReporter: () => notImplemented('ticket', 'getByReporter'),
  create: () => notImplemented('ticket', 'create'),
  update: () => notImplemented('ticket', 'update'),
  addNote: () => notImplemented('ticket', 'addNote'),
  delete: () => notImplemented('ticket', 'delete'),
}

export const supabaseAssetRepo = {
  getAll: () => notImplemented('asset', 'getAll'),
  getById: () => notImplemented('asset', 'getById'),
  create: () => notImplemented('asset', 'create'),
  update: () => notImplemented('asset', 'update'),
  delete: () => notImplemented('asset', 'delete'),
}

export const supabaseAssetHistoryRepo = {
  getAll: () => notImplemented('assetHistory', 'getAll'),
  getByAssetId: () => notImplemented('assetHistory', 'getByAssetId'),
  create: () => notImplemented('assetHistory', 'create'),
  delete: () => notImplemented('assetHistory', 'delete'),
}

export const supabaseNotificationRepo = {
  getByUserId: () => notImplemented('notification', 'getByUserId'),
  create: () => notImplemented('notification', 'create'),
  markAsRead: () => notImplemented('notification', 'markAsRead'),
  markAllAsRead: () => notImplemented('notification', 'markAllAsRead'),
}

export const supabaseContactRepo = {
  submit: () => notImplemented('contact', 'submit'),
}

export const supabaseJobRepo = {
  getAll: () => notImplemented('job', 'getAll'),
  getById: () => notImplemented('job', 'getById'),
  getByVendor: () => notImplemented('job', 'getByVendor'),
  create: () => notImplemented('job', 'create'),
  update: () => notImplemented('job', 'update'),
}