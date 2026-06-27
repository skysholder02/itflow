import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import QRCode from 'react-qr-code'
import { Button, Badge, Card, Input, Textarea, Skeleton, GlowBackground, Logo } from '@/components/ui'
import { assetService } from '@/services/assetService'
import { assetHistoryService } from '@/services/assetHistoryService'
import { useAuth } from '@/contexts/AuthContext'
import { getAssetUrl, formatDate } from '@/utils/formatters'
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

export function AssetDetailPage({ publicView = false }: AssetDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const { role, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [histories, setHistories] = useState<AssetHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showHistoryForm, setShowHistoryForm] = useState(false)

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

  const loadData = async () => {
    if (!id) return
    const [assetData, historyData] = await Promise.all([
      assetService.getAsset(id),
      assetHistoryService.getByAssetId(id),
    ])
    setAsset(assetData)
    setHistories(historyData)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [id])

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

  const content = (
    <div className="max-w-3xl mx-auto">
      {!isPublic && (
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate(isAuthenticated ? '/assets' : '/')}
        >
          ← Back
        </Button>
      )}

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-mono text-text-muted">{asset.id}</span>
              <Badge variant="assetStatus" value={asset.status} />
              <Badge value={asset.category} />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">{asset.name}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Brand</span>
                <p className="text-text-primary">{asset.brand}</p>
              </div>
              <div>
                <span className="text-text-muted">Serial Number</span>
                <p className="text-text-primary font-mono">{asset.serialNumber}</p>
              </div>
              <div>
                <span className="text-text-muted">Location</span>
                <p className="text-text-primary">{asset.location}</p>
              </div>
              <div>
                <span className="text-text-muted">Status</span>
                <p className="text-text-primary">{asset.status}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="bg-white p-4 rounded-xl">
              <QRCode value={getAssetUrl(asset.id)} size={140} />
            </div>
            <p className="text-xs text-text-muted text-center max-w-[160px]">
              Scan to view asset info
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Repair History</h3>
          {canManageHistory && !showHistoryForm && (
            <Button size="sm" onClick={() => setShowHistoryForm(true)}>
              Add Entry
            </Button>
          )}
        </div>

        {showHistoryForm && (
          <form onSubmit={handleSubmit(onAddHistory)} className="space-y-4 mb-6 p-4 rounded-xl bg-white/5">
            <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />
            <Input label="Problem" error={errors.problem?.message} {...register('problem')} />
            <Textarea label="Action Taken" error={errors.action?.message} {...register('action')} />
            <Input label="Technician" error={errors.technician?.message} {...register('technician')} />
            <div className="flex gap-3">
              <Button type="submit" loading={isSubmitting} size="sm">Save</Button>
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowHistoryForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {histories.length === 0 ? (
          <p className="text-text-muted text-sm">No repair history recorded.</p>
        ) : (
          <div className="space-y-0">
            {histories.map((h, i) => (
              <div key={h.id} className="relative pl-8 pb-6 last:pb-0">
                {i < histories.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-white/10" />
                )}
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-brand-primary/20 border-2 border-brand-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-brand-primary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">{formatDate(h.date)}</p>
                  <p className="text-text-primary font-medium mt-1">{h.problem}</p>
                  <p className="text-text-secondary text-sm mt-1">{h.action}</p>
                  <p className="text-text-muted text-xs mt-1">Technician: {h.technician}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {isPublic && (
        <div className="text-center mt-8">
          <Link to="/login">
            <Button variant="secondary">Login to ITFlow</Button>
          </Link>
        </div>
      )}
    </div>
  )

  if (isPublic) {
    return (
      <div className="min-h-screen relative py-12 px-6">
        <GlowBackground />
        <div className="relative z-10">
          <div className="text-center mb-8">
            <Logo size="md" className="justify-center" />
            <p className="text-text-muted text-sm mt-2">Asset Information</p>
          </div>
          {content}
        </div>
      </div>
    )
  }

  return content
}
