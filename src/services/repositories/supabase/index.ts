// Supabase repositories: the user and session repositories are implemented;
// the rest are placeholder stubs until their migration steps.
// Keep VITE_DATA_PROVIDER=local until all repositories are ready.

export { supabaseUserRepo } from './userRepository'
export { supabaseSessionRepo } from './sessionRepository'
export { supabaseTicketRepo } from './ticketRepository'
export { supabaseNotificationRepo } from './notificationRepository'
export { supabaseAssetRepo } from './assetRepository'
export { supabaseAssetHistoryRepo } from './assetHistoryRepository'
export { supabaseJobRepo } from './jobRepository'

const notImplemented = (repo: string, method: string) => {
  throw new Error(
    `Supabase repository "${repo}.${method}" is not implemented yet. ` +
      'Keep VITE_DATA_PROVIDER=local until Supabase repositories are ready.',
  )
}

export const supabaseContactRepo = {
  submit: () => notImplemented('contact', 'submit'),
}