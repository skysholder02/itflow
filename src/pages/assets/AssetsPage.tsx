import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import QRCode from 'react-qr-code'
import { Button, Badge, Card, Input, Select, Modal, SkeletonList, EmptyState } from '@/components/ui'
import { assetService } from '@/services/assetService'
import { useAuth } from '@/contexts/AuthContext'
import { getAssetUrl, formatAssetCategory, formatAssetStatus } from '@/utils/formatters'
import type { Asset, AssetCategory, AssetStatus } from '@/types'

const schema = z.object({
  name: z.string().min(2),
  brand: z.string().min(1),
  serialNumber: z.string().min(1),
  location: z.string().min(2),
  status: z.enum(['Active', 'Maintenance', 'Retired']),
  category: z.enum(['Printer', 'PC', 'CCTV', 'Speaker', 'Access Point']),
})

type FormData = z.infer<typeof schema>

const categories: AssetCategory[] = ['Printer', 'PC', 'CCTV', 'Speaker', 'Access Point']
const statuses: AssetStatus[] = ['Active', 'Maintenance', 'Retired']

export function AssetsPage() {
  const { role } = useAuth()
  const navigate = useNavigate()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Asset | null>(null)
  const [search, setSearch] = useState('')

  const canManage = role ? assetService.canManageAssets(role) : false

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'Active', category: 'PC' },
  })

  const loadAssets = () => {
    assetService.getAssets().then(setAssets).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAssets()
  }, [])

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', brand: '', serialNumber: '', location: '', status: 'Active', category: 'PC' })
    setModalOpen(true)
  }

  const openEdit = (asset: Asset) => {
    setEditing(asset)
    reset({
      name: asset.name,
      brand: asset.brand,
      serialNumber: asset.serialNumber,
      location: asset.location,
      status: asset.status,
      category: asset.category,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data: FormData) => {
    if (editing) {
      await assetService.updateAsset(editing.id, data)
    } else {
      await assetService.createAsset(data)
    }
    setModalOpen(false)
    loadAssets()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this asset?')) {
      await assetService.deleteAsset(id)
      loadAssets()
    }
  }

  const filtered = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) return <SkeletonList count={5} />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Assets</h2>
          <p className="text-text-muted text-sm mt-1">Manage IT infrastructure assets</p>
        </div>
        {canManage && <Button onClick={openCreate}>Add Asset</Button>}
      </div>

      <Input
        placeholder="Search assets..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No assets found"
          description="Add your first asset to get started."
          actionLabel={canManage ? 'Add Asset' : undefined}
          onAction={canManage ? openCreate : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover className="cursor-pointer" onClick={() => navigate(`/assets/manage/${asset.id}`)}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-mono text-text-muted">{asset.id}</span>
                  <Badge variant="assetStatus" value={asset.status} />
                </div>
                <h3 className="font-semibold text-text-primary mb-1">{asset.name}</h3>
                <p className="text-sm text-text-muted">{asset.brand} · {formatAssetCategory(asset.category)}</p>
                <p className="text-xs text-text-muted mt-2">{asset.location}</p>
                {canManage && (
                  <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="secondary" onClick={() => openEdit(asset)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(asset.id)}>
                      Delete
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Asset' : 'Add Asset'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Brand" error={errors.brand?.message} {...register('brand')} />
          <Input label="Serial Number" error={errors.serialNumber?.message} {...register('serialNumber')} />
          <Input label="Location" error={errors.location?.message} {...register('location')} />
          <Select
            label="Category"
            options={categories.map((c) => ({ value: c, label: formatAssetCategory(c) }))}
            {...register('category')}
          />
          <Select
            label="Status"
            options={statuses.map((s) => ({ value: s, label: formatAssetStatus(s) }))}
            {...register('status')}
          />
          <div className="flex gap-3">
            <Button type="submit" loading={isSubmitting}>
              {editing ? 'Update' : 'Create'}
            </Button>
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export function QRDisplay({ assetId }: { assetId: string }) {
  return (
    <div className="bg-white p-4 rounded-xl inline-block">
      <QRCode value={getAssetUrl(assetId)} size={128} />
    </div>
  )
}
