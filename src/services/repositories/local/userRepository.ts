import type { User } from '@/types'
import type { IUserRepository } from '../types'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import { getCollection, setCollection, seedDatabase, normalizeRole, normalizeName } from './seed'

class LocalUserRepository implements IUserRepository {
  private ensureSeed() {
    seedDatabase()
  }

  private normalize(user: User): User {
    return {
      ...user,
      role: normalizeRole(user.role),
      name: normalizeName(user.name),
    }
  }

  async getAll(): Promise<User[]> {
    this.ensureSeed()
    return getCollection<User>(STORAGE_KEYS.USERS).map(this.normalize)
  }

  async getById(id: string): Promise<User | null> {
    const users = await this.getAll()
    return users.find((u) => u.id === id) ?? null
  }

  async getByEmail(email: string): Promise<User | null> {
    const users = await this.getAll()
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const users = await this.getAll()
    const newUser: User = {
      ...data,
      id: `usr-${String(users.length + 1).padStart(3, '0')}`,
    }
    users.push(this.normalize(newUser))
    setCollection(STORAGE_KEYS.USERS, users)
    return this.normalize(newUser)
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const users = await this.getAll()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) throw new Error('User not found')
    users[index] = this.normalize({ ...users[index], ...data })
    setCollection(STORAGE_KEYS.USERS, users)
    return users[index]
  }
}

export const localUserRepo = new LocalUserRepository()
