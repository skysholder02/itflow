import { assetRepo } from '@/services/repositories'
import type { Asset, CreateAssetDTO, Role } from '@/types'

export const assetService = {
  async getAssets(): Promise<Asset[]> {
    return assetRepo.getAll()
  },

  async getAsset(id: string): Promise<Asset | null> {
    return assetRepo.getById(id)
  },

  async createAsset(data: CreateAssetDTO): Promise<Asset> {
    return assetRepo.create(data)
  },

  async updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
    return assetRepo.update(id, data)
  },

  async deleteAsset(id: string): Promise<void> {
    return assetRepo.delete(id)
  },

  canManageAssets(role: Role): boolean {
    return role === 'it_support' || role === 'leader_it'
  },
}
