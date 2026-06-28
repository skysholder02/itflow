import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import QRCode from 'react-qr-code'
import { Card, SkeletonList, EmptyState, Button } from '@/components/ui'
import { assetService } from '@/services/assetService'
import { getAssetUrl } from '@/utils/formatters'
import { useQRCodeDownload } from '@/hooks/useQRCodeDownload'
import type { Asset } from '@/types'

function QRCodeCard({ asset, onNavigate }: { asset: Asset; onNavigate: () => void }) {
  const { setContainerRef, download } = useQRCodeDownload()

  return (
    <Card hover className="cursor-pointer text-center" onClick={onNavigate}>
      <div ref={setContainerRef} className="bg-white p-4 rounded-xl inline-block mb-4">
        <QRCode value={getAssetUrl(asset.id)} size={120} />
      </div>
      <h3 className="font-semibold text-text-primary">{asset.name}</h3>
      <p className="text-xs font-mono text-text-muted mt-1">{asset.id}</p>
      <p className="text-sm text-text-muted mt-1">{asset.location}</p>
      <Button
        variant="secondary"
        size="sm"
        className="mt-4"
        onClick={(e) => {
          e.stopPropagation()
          download()
        }}
      >
        Download QR Code
      </Button>
    </Card>
  )
}

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
        <h2 className="text-2xl font-bold text-text-primary">QR Code</h2>
        <p className="text-text-muted text-sm mt-1">
          Pindai QR Code untuk mengakses informasi aset secara instan
        </p>
      </div>

      {assets.length === 0 ? (
        <EmptyState title="Tidak ada aset" description="Tambah aset untuk menghasilkan QR Code." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <QRCodeCard asset={asset} onNavigate={() => navigate(`/assets/manage/${asset.id}`)} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
