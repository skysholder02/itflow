import type { Asset, CreateAssetDTO } from '@/types'
import type { IAssetRepository } from '../types'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import { generateId } from '@/utils/idGenerator'
import { getCollection, setCollection, seedDatabase } from './seed'

class LocalAssetRepository implements IAssetRepository {
  private ensureSeed() {
    seedDatabase()
  }

  async getAll(): Promise<Asset[]> {
    this.ensureSeed()
    return getCollection<Asset>(STORAGE_KEYS.ASSETS)
  }

  async getById(id: string): Promise<Asset | null> {
    const assets = await this.getAll()
    return assets.find((a) => a.id === id) ?? null
  }

  async create(data: CreateAssetDTO): Promise<Asset> {
    const assets = await this.getAll()
    const id = generateId('AST', assets.map((a) => a.id))
    const now = new Date().toISOString()
    const asset: Asset = { id, ...data, createdAt: now, updatedAt: now }
    assets.push(asset)
    setCollection(STORAGE_KEYS.ASSETS, assets)
    return asset
  }

  async update(id: string, data: Partial<Asset>): Promise<Asset> {
    const assets = await this.getAll()
    const index = assets.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('Asset not found')
    assets[index] = {
      ...assets[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    setCollection(STORAGE_KEYS.ASSETS, assets)
    return assets[index]
  }

  async delete(id: string): Promise<void> {
    const assets = await this.getAll()
    setCollection(
      STORAGE_KEYS.ASSETS,
      assets.filter((a) => a.id !== id),
    )
  }
}

export const localAssetRepo = new LocalAssetRepository()
