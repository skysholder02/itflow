import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import QRCode from 'react-qr-code'
import {
  Badge,
  Button,
  Card,
  GlowBackground,
  Input,
  Logo,
  Skeleton,
  Textarea,
} from '@/components/ui'
import { assetService } from '@/services/assetService'
import { assetHistoryService } from '@/services/assetHistoryService'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, formatAssetCategory, getAssetUrl } from '@/utils/formatters'
import { useQRCodeDownload } from '@/hooks/useQRCodeDownload'
import type { Asset, AssetHistory } from '@/types'

const historySchema = z.object({
  date: z.string().min(1),
  problem: z.string().min(3),
  action: z.string().min(3),
  technician: z.string().min(2),
})

type HistoryForm = z.infer<typeof historySchema>

interface AssetDetailPageProps {
  publicView?: boolean
}

function HistoryTimeline({ histories }: { histories: AssetHistory[] }) {
  if (histories.length === 0) {
    return <p className="text-text-muted text-sm">No maintenance history yet.</p>
  }

  return (
    <div className="space-y-0">
      {histories.map((history, index) => (
        <div key={history.id} className="relative pl-8 pb-6 last:pb-0">
          {index < histories.length - 1 && (
            <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-white/10" />
          )}
          <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-brand-primary/20 border-2 border-brand-primary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-brand-primary" />
          </div>
          <div>
            <p className="text-xs text-text-muted">{formatDate(history.date)}</p>
            <p className="text-text-primary font-medium mt-1">{history.problem}</p>
            <p className="text-text-secondary text-sm mt-1">{history.action}</p>
            <p className="text-text-muted text-xs mt-1">Technician: {history.technician}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function AssetDetailPage({ publicView = false }: AssetDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const { role, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [histories, setHistories] = useState<AssetHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showHistoryForm, setShowHistoryForm] = useState(false)
  const [showFullHistory, setShowFullHistory] = useState(false)

  const canManageHistory = role ? assetHistoryService.canManageHistory(role) : false
  const isPublic = publicView && !isAuthenticated

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HistoryForm>({
    resolver: zodResolver(historySchema),
    defaultValues: { date: new Date().toISOString().split('T')[0], technician: '' },
  })

  const { setContainerRef: setStatusSvgRef, download: downloadStatusQr } = useQRCodeDownload()

  const loadData = useCallback(async () => {
    if (!id) return
    const [assetData, historyData] = await Promise.all([
      assetService.getAsset(id),
      assetHistoryService.getByAssetId(id),
    ])
    setAsset(assetData)
    setHistories(historyData)
    setLoading(false)
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onAddHistory = async (data: HistoryForm) => {
    if (!id) return
    await assetHistoryService.create({ assetId: id, ...data })
    reset()
    setShowHistoryForm(false)
    const historyData = await assetHistoryService.getByAssetId(id)
    setHistories(historyData)
  }

  if (loading) {
    return isPublic ? (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-64 h-48" />
      </div>
    ) : (
      <Skeleton className="h-64 w-full" />
    )
  }

  if (!asset) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">Asset not found</p>
      </div>
    )
  }

  const lastMaintenance = histories[0]
  const visibleHistories = showFullHistory ? histories : histories.slice(0, 3)

  const content = (
    <div className="max-w-4xl mx-auto pb-28 md:pb-0">
        {!isPublic && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => navigate(isAuthenticated ? '/assets' : '/')}
          >
            Back
          </Button>
        )}

      <header className="mb-6">
        <p className="text-sm uppercase tracking-wider text-brand-primary font-semibold">
          Asset Information
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mt-2">
          {asset.name}
        </h1>
        <p className="text-text-muted mt-2">
          Scan-ready details, maintenance status, and service actions.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 mb-6">
        <Card>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Asset Details</h2>
              <p className="text-sm font-mono text-text-muted mt-1">{asset.id}</p>
            </div>
            <Badge value={formatAssetCategory(asset.category)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl bg-white/5 p-4">
              <span className="text-text-muted">Asset Name</span>
              <p className="text-text-primary font-medium mt-1">{asset.name}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <span className="text-text-muted">Asset ID</span>
              <p className="text-text-primary font-mono mt-1">{asset.id}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <span className="text-text-muted">Brand</span>
              <p className="text-text-primary font-medium mt-1">{asset.brand}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <span className="text-text-muted">Serial Number</span>
              <p className="text-text-primary font-mono mt-1 break-all">{asset.serialNumber}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 sm:col-span-2">
              <span className="text-text-muted">Location</span>
              <p className="text-text-primary font-medium mt-1">{asset.location}</p>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Current Status</h2>
          <div ref={setStatusSvgRef} className="bg-white p-4 rounded-xl inline-block mb-4">
            <QRCode value={getAssetUrl(asset.id)} size={150} />
          </div>
          <div className="flex justify-center mb-4">
            <Badge variant="assetStatus" value={asset.status} />
          </div>
          <Button variant="secondary" size="sm" onClick={downloadStatusQr} className="mb-5">
            Download QR Code
          </Button>
          <div className="mt-5 text-left rounded-2xl bg-white/5 p-4">
            <span className="text-text-muted text-sm">Last Maintenance</span>
            <p className="text-text-primary font-medium mt-1">
              {lastMaintenance ? formatDate(lastMaintenance.date) : 'No maintenance yet'}
            </p>
            {lastMaintenance && (
              <p className="text-text-muted text-xs mt-2">{lastMaintenance.problem}</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Recent History</h3>
            <p className="text-text-muted text-sm">
              {showFullHistory ? 'Full maintenance timeline' : 'Recent maintenance activity'}
            </p>
          </div>
          {canManageHistory && !showHistoryForm && (
            <Button size="sm" onClick={() => setShowHistoryForm(true)}>
              Add Entry
            </Button>
          )}
        </div>

        {showHistoryForm && (
          <form
            onSubmit={handleSubmit(onAddHistory)}
            className="space-y-4 mb-6 p-4 rounded-xl bg-white/5"
          >
            <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />
            <Input label="Issue" error={errors.problem?.message} {...register('problem')} />
            <Textarea label="Action Taken" error={errors.action?.message} {...register('action')} />
            <Input label="Technician" error={errors.technician?.message} {...register('technician')} />
            <div className="flex gap-3">
              <Button type="submit" loading={isSubmitting} size="sm">
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setShowHistoryForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <HistoryTimeline histories={visibleHistories} />
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-30 px-6 py-4 bg-bg-primary/90 backdrop-blur-xl border-t border-white/6 md:static md:px-0 md:py-0 md:mt-6 md:bg-transparent md:backdrop-blur-0 md:border-0">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowFullHistory((current) => !current)}
            className="w-full"
          >
            {showFullHistory ? 'Show Recent History' : 'View Full History'}
          </Button>
          <Button
            size="lg"
            onClick={() => navigate(`/tickets/create?assetId=${asset.id}`)}
            className="w-full"
          >
            Report Issue
          </Button>
        </div>
        {isPublic && (
          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-text-muted hover:text-text-primary">
              Login to ITFlow
            </Link>
          </div>
        )}
      </div>
    </div>
  )

  if (isPublic) {
    return (
      <div className="min-h-screen relative py-10 px-5 sm:px-6">
        <GlowBackground />
        <div className="relative z-10">
          <div className="text-center mb-8">
            <Logo size="md" className="justify-center" />
            <p className="text-text-muted text-sm mt-2">Asset QR Code Scan</p>
          </div>
          {content}
        </div>
      </div>
    )
  }

  return content
}
