import { assetHistoryRepo } from '@/services/repositories'
import type { AssetHistory, CreateAssetHistoryDTO, Role } from '@/types'

export const assetHistoryService = {
  async getByAssetId(assetId: string): Promise<AssetHistory[]> {
    return assetHistoryRepo.getByAssetId(assetId)
  },

  async create(data: CreateAssetHistoryDTO): Promise<AssetHistory> {
    return assetHistoryRepo.create(data)
  },

  async delete(id: string): Promise<void> {
    return assetHistoryRepo.delete(id)
  },

  canManageHistory(role: Role): boolean {
    return role === 'it_support'
  },
}
