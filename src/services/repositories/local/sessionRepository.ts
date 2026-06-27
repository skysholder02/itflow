import type { Session } from '@/types'
import type { ISessionRepository } from '../types'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import { getItem, setItem, removeItem } from '@/utils/localStorage'

class LocalSessionRepository implements ISessionRepository {
  async getSession(): Promise<Session | null> {
    return getItem<Session>(STORAGE_KEYS.SESSION)
  }

  async setSession(session: Session): Promise<void> {
    setItem(STORAGE_KEYS.SESSION, session)
  }

  async clearSession(): Promise<void> {
    removeItem(STORAGE_KEYS.SESSION)
  }
}

export const localSessionRepo = new LocalSessionRepository()
