import type { User } from '@/types'
import type { IUserRepository } from '../types'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import { getCollection, setCollection, seedDatabase } from './seed'

class LocalUserRepository implements IUserRepository {
  private ensureSeed() {
    seedDatabase()
  }

  async getAll(): Promise<User[]> {
    this.ensureSeed()
    return getCollection<User>(STORAGE_KEYS.USERS)
  }

  async getById(id: string): Promise<User | null> {
    const users = await this.getAll()
    return users.find((u) => u.id === id) ?? null
  }

  async getByEmail(email: string): Promise<User | null> {
    const users = await this.getAll()
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const users = await this.getAll()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) throw new Error('User not found')
    users[index] = { ...users[index], ...data }
    setCollection(STORAGE_KEYS.USERS, users)
    return users[index]
  }
}

export const localUserRepo = new LocalUserRepository()
