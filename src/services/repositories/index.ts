import { localUserRepo } from './local/userRepository'
import { localTicketRepo } from './local/ticketRepository'
import { localAssetRepo } from './local/assetRepository'
import { localAssetHistoryRepo } from './local/assetHistoryRepository'
import { localNotificationRepo } from './local/notificationRepository'
import { localSessionRepo } from './local/sessionRepository'
import { localContactRepo } from './local/contactRepository'
import {
  firebaseUserRepo,
  firebaseTicketRepo,
  firebaseAssetRepo,
  firebaseAssetHistoryRepo,
  firebaseNotificationRepo,
  firebaseSessionRepo,
  firebaseContactRepo,
} from './firebase'

const provider = import.meta.env.VITE_DATA_PROVIDER ?? 'local'
const useFirebase = provider === 'firebase'

export const userRepo = useFirebase ? firebaseUserRepo : localUserRepo
export const ticketRepo = useFirebase ? firebaseTicketRepo : localTicketRepo
export const assetRepo = useFirebase ? firebaseAssetRepo : localAssetRepo
export const assetHistoryRepo = useFirebase ? firebaseAssetHistoryRepo : localAssetHistoryRepo
export const notificationRepo = useFirebase ? firebaseNotificationRepo : localNotificationRepo
export const sessionRepo = useFirebase ? firebaseSessionRepo : localSessionRepo
export const contactRepo = useFirebase ? firebaseContactRepo : localContactRepo
