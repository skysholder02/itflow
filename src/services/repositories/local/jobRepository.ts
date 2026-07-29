import type { Job } from '@/types'
import type { IJobRepository } from '../types'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import { getCollection, setCollection, seedDatabase } from './seed'

class LocalJobRepository implements IJobRepository {
  private ensureSeed() {
    seedDatabase()
  }

  async getAll(): Promise<Job[]> {
    this.ensureSeed()
    return getCollection<Job>(STORAGE_KEYS.JOBS)
  }

  async getById(id: string): Promise<Job | null> {
    const jobs = await this.getAll()
    return jobs.find((j) => j.id === id) ?? null
  }

  async getByVendor(vendorId: string): Promise<Job[]> {
    const jobs = await this.getAll()
    return jobs.filter((j) => j.vendorId === vendorId)
  }

  async create(data: Omit<Job, 'id'>): Promise<Job> {
    const jobs = await this.getAll()
    const newJob: Job = {
      ...data,
      id: `JOB-${String(jobs.length + 1).padStart(3, '0')}`,
    }
    jobs.push(newJob)
    setCollection(STORAGE_KEYS.JOBS, jobs)
    return newJob
  }

  async update(id: string, data: Partial<Job>): Promise<Job> {
    const jobs = await this.getAll()
    const index = jobs.findIndex((j) => j.id === id)
    if (index === -1) throw new Error('Job not found')
    jobs[index] = { ...jobs[index], ...data }
    setCollection(STORAGE_KEYS.JOBS, jobs)
    return jobs[index]
  }
}

export const localJobRepo = new LocalJobRepository()
