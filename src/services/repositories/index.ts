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

export const ticketRepo = useFirebase
  ? firebaseTicketRepo
  : localTicketRepo

export const assetRepo = useFirebase
  ? firebaseAssetRepo
  : localAssetRepo

export const assetHistoryRepo = useFirebase
  ? firebaseAssetHistoryRepo
  : localAssetHistoryRepo

export const notificationRepo = useFirebase
  ? firebaseNotificationRepo
  : localNotificationRepo

export const contactRepo = useFirebase
  ? firebaseContactRepo
  : localContactRepo

export const jobRepo = useFirebase
  ? firebaseJobRepo
  : localJobRepo