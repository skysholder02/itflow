import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Input, Textarea, Select, Card, Skeleton } from '@/components/ui'
import { ticketService } from '@/services/ticketService'
import { assetService } from '@/services/assetService'
import { assetHistoryService } from '@/services/assetHistoryService'
import { useAuth } from '@/contexts/AuthContext'
import { formatTicketCategory, formatTicketPriority } from '@/utils/formatters'
import type { Asset, TicketCategory, TicketPriority } from '@/types'

const schema = z.object({
  title: z.string().optional(),
  description: z.string().min(10, 'Deskripsi harus terdiri dari minimal 10 karakter'),
  category: z.enum(['Printer', 'WiFi', 'PC', 'CCTV', 'Speaker', 'Other']),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
  location: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const categories: TicketCategory[] = ['Printer', 'WiFi', 'PC', 'CCTV', 'Speaker', 'Other']
const priorities: TicketPriority[] = ['Critical', 'High', 'Medium', 'Low']

export function CreateTicketPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const assetId = searchParams.get('assetId')
  const [asset, setAsset] = useState<Asset | null>(null)
  const [assetLoading, setAssetLoading] = useState(Boolean(assetId))
  const [photo, setPhoto] = useState<string>()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'PC', priority: 'Medium' },
  })

  useEffect(() => {
    if (!assetId) return
    assetService
      .getAsset(assetId)
      .then(setAsset)
      .finally(() => setAssetLoading(false))
  }, [assetId])

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: FormData) => {
    if (!user) return
    const linkedAsset = asset ?? null
    if (!linkedAsset && (data.title?.trim().length ?? 0) < 3) {
      setError('title', { message: 'Judul harus terdiri dari minimal 3 karakter' })
      return
    }
    if (!linkedAsset && !data.location?.trim()) {
      setError('location', { message: 'Lokasi wajib diisi' })
      return
    }
    const title = linkedAsset
      ? `Laporan masalah ${linkedAsset.name}`
      : data.title?.trim() || 'Tiket tanpa judul'
    const location = linkedAsset ? linkedAsset.location : data.location?.trim() || 'Belum ditentukan'
    const category = linkedAsset
      ? linkedAsset.category === 'Access Point'
        ? 'WiFi'
        : linkedAsset.category
      : data.category

    const ticket = await ticketService.createTicket({
      ...data,
      title,
      category,
      location,
      assetId: linkedAsset?.id,
      assetName: linkedAsset?.name,
      assetLocation: linkedAsset?.location,
      photo,
      reporterId: user.id,
      reporterName: user.name,
    })

    if (linkedAsset) {
      await ticketService.addNote(ticket.id, {
        text: `Dilaporkan dari scan QR Code aset: ${linkedAsset.id} - ${linkedAsset.name}.`,
        authorId: user.id,
        authorName: user.name,
        createdAt: new Date().toISOString(),
      })
      await assetHistoryService.create({
        assetId: linkedAsset.id,
        date: new Date().toISOString().split('T')[0],
        problem: data.description,
        action: `Tiket ${ticket.id} dibuat untuk masalah yang dilaporkan.`,
        technician: 'Menunggu penugasan',
      })
    }

    navigate(`/tickets/${ticket.id}`)
  }

  if (assetLoading) {
    return <Skeleton className="h-64 w-full max-w-2xl" />
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        {asset ? 'Laporkan Masalah Aset' : 'Buat Tiket'}
      </h2>
      <p className="text-text-muted text-sm mb-6">
        {asset
          ? 'Detail aset dikunci dari hasil scan QR Code.'
          : 'Kirim permintaan layanan IT baru.'}
      </p>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {asset ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="ID Aset" value={asset.id} readOnly />
              <Input label="Nama Aset" value={asset.name} readOnly />
              <Input label="Lokasi Aset" value={asset.location} readOnly className="sm:col-span-2" />
            </div>
          ) : (
            <Input
              label="Judul"
              id="title"
              placeholder="Deskripsi singkat masalah"
              error={errors.title?.message}
              {...register('title')}
            />
          )}
          <Textarea
            label={asset ? 'Deskripsi Masalah' : 'Deskripsi'}
            id="description"
            placeholder="Deskripsi detail masalah"
            error={errors.description?.message}
            {...register('description')}
          />
          <div className={asset ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
            {!asset && (
              <Select
                label="Kategori"
                id="category"
                options={categories.map((c) => ({ value: c, label: formatTicketCategory(c) }))}
                error={errors.category?.message}
                {...register('category')}
              />
            )}
            <Select
              label="Prioritas"
              id="priority"
              options={priorities.map((p) => ({ value: p, label: formatTicketPriority(p) }))}
              error={errors.priority?.message}
              {...register('priority')}
            />
          </div>
          {!asset && (
            <Input
              label="Lokasi"
              id="location"
              placeholder="Gedung, lantai, ruangan"
              error={errors.location?.message}
              {...register('location')}
            />
          )}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Foto (opsional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-primary/20 file:text-brand-primary cursor-pointer"
            />
            {photo && (
              <img src={photo} alt="Pratinjau" className="mt-2 rounded-xl max-h-40 object-cover" />
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting}>
              Kirim Tiket
            </Button>
            <Button variant="ghost" type="button" onClick={() => navigate('/tickets')}>
              Batal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
