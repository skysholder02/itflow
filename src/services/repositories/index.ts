import { localUserRepo } from './local/userRepository'
import { localTicketRepo } from './local/ticketRepository'
import { localAssetRepo } from './local/assetRepository'
import { localAssetHistoryRepo } from './local/assetHistoryRepository'
import { localNotificationRepo } from './local/notificationRepository'
import { localSessionRepo } from './local/sessionRepository'
import { localContactRepo } from './local/contactRepository'
import { localJobRepo } from './local/jobRepository'
import {
  firebaseUserRepo,
  firebaseTicketRepo,
  firebaseAssetRepo,
  firebaseAssetHistoryRepo,
  firebaseNotificationRepo,
  firebaseSessionRepo,
  firebaseContactRepo,
  firebaseJobRepo,
} from './firebase'
import {
  supabaseUserRepo,
  supabaseSessionRepo,
  supabaseTicketRepo,
  supabaseNotificationRepo,
  supabaseAssetRepo,
  supabaseAssetHistoryRepo,
  supabaseJobRepo,
} from './supabase'

const provider = import.meta.env.VITE_DATA_PROVIDER ?? 'local'
const useFirebase = provider === 'firebase'
const useSupabase = provider === 'supabase'

export const userRepo = useSupabase
  ? supabaseUserRepo
  : useFirebase
    ? firebaseUserRepo
    : localUserRepo

export const sessionRepo = useSupabase
  ? supabaseSessionRepo
  : useFirebase
    ? firebaseSessionRepo
    : localSessionRepo

export const ticketRepo = useSupabase
  ? supabaseTicketRepo
  : useFirebase
    ? firebaseTicketRepo
    : localTicketRepo

export const assetRepo = useSupabase
  ? supabaseAssetRepo
  : useFirebase
    ? firebaseAssetRepo
    : localAssetRepo

export const assetHistoryRepo = useSupabase
  ? supabaseAssetHistoryRepo
  : useFirebase
    ? firebaseAssetHistoryRepo
    : localAssetHistoryRepo

export const notificationRepo = useSupabase
  ? supabaseNotificationRepo
  : useFirebase
    ? firebaseNotificationRepo
    : localNotificationRepo

export const contactRepo = useFirebase
  ? firebaseContactRepo
  : localContactRepo

export const jobRepo = useSupabase
  ? supabaseJobRepo
  : useFirebase
    ? firebaseJobRepo
    : localJobRepo