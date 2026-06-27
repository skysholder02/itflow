import type { AssetHistory, CreateAssetHistoryDTO } from '@/types'
import type { IAssetHistoryRepository } from '../types'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import { generateHistoryId } from '@/utils/idGenerator'
import { getCollection, setCollection, seedDatabase } from './seed'

class LocalAssetHistoryRepository implements IAssetHistoryRepository {
  private ensureSeed() {
    seedDatabase()
  }

  async getAll(): Promise<AssetHistory[]> {
    this.ensureSeed()
    return getCollection<AssetHistory>(STORAGE_KEYS.ASSET_HISTORIES)
  }

  async getByAssetId(assetId: string): Promise<AssetHistory[]> {
    const histories = await this.getAll()
    return histories
      .filter((h) => h.assetId === assetId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async create(data: CreateAssetHistoryDTO): Promise<AssetHistory> {
    const histories = await this.getAll()
    const history: AssetHistory = { id: generateHistoryId(), ...data }
    histories.push(history)
    setCollection(STORAGE_KEYS.ASSET_HISTORIES, histories)
    return history
  }

  async delete(id: string): Promise<void> {
    const histories = await this.getAll()
    setCollection(
      STORAGE_KEYS.ASSET_HISTORIES,
      histories.filter((h) => h.id !== id),
    )
  }
}

export const localAssetHistoryRepo = new LocalAssetHistoryRepository()
