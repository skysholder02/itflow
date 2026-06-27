import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import QRCode from 'react-qr-code'
import { Card, SkeletonList, EmptyState } from '@/components/ui'
import { assetService } from '@/services/assetService'
import { getAssetUrl } from '@/utils/formatters'
import type { Asset } from '@/types'

export function QRAssetsPage() {
  const navigate = useNavigate()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    assetService.getAssets().then(setAssets).finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonList count={6} />

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary">QR Assets</h2>
        <p className="text-text-muted text-sm mt-1">
          Scan QR codes to instantly access asset information
        </p>
      </div>

      {assets.length === 0 ? (
        <EmptyState icon="📱" title="No assets" description="Add assets to generate QR codes." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                hover
                className="cursor-pointer text-center"
                onClick={() => navigate(`/assets/manage/${asset.id}`)}
              >
                <div className="bg-white p-4 rounded-xl inline-block mb-4">
                  <QRCode value={getAssetUrl(asset.id)} size={120} />
                </div>
                <h3 className="font-semibold text-text-primary">{asset.name}</h3>
                <p className="text-xs font-mono text-text-muted mt-1">{asset.id}</p>
                <p className="text-sm text-text-muted mt-1">{asset.location}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
