import type { ContactSubmission } from '@/types'
import type { IContactRepository } from '../types'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import { getCollection, setCollection } from './seed'

class LocalContactRepository implements IContactRepository {
  async submit(data: { name: string; email: string; message: string }): Promise<void> {
    const submissions = getCollection<ContactSubmission>(STORAGE_KEYS.CONTACT)
    const submission: ContactSubmission = {
      id: `contact-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    }
    submissions.push(submission)
    setCollection(STORAGE_KEYS.CONTACT, submissions)
  }
}

export const localContactRepo = new LocalContactRepository()
