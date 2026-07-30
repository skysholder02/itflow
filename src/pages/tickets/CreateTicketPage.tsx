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
  description: z.string().min(10, 'Description must be at least 10 characters'),
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
      setError('title', { message: 'Title must be at least 3 characters' })
      return
    }
    if (!linkedAsset && !data.location?.trim()) {
      setError('location', { message: 'Location is required' })
      return
    }
    const title = linkedAsset
      ? `Issue report for ${linkedAsset.name}`
      : data.title?.trim() || 'Untitled ticket'
    const location = linkedAsset ? linkedAsset.location : data.location?.trim() || 'Not specified'
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
        text: `Reported from asset QR code scan: ${linkedAsset.id} - ${linkedAsset.name}.`,
        authorId: user.id,
        authorName: user.name,
        createdAt: new Date().toISOString(),
      })
      await assetHistoryService.create({
        assetId: linkedAsset.id,
        date: new Date().toISOString().split('T')[0],
        problem: data.description,
        action: `Ticket ${ticket.id} created for reported issue.`,
        technician: 'Awaiting assignment',
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
        {asset ? 'Report Asset Issue' : 'Create Ticket'}
      </h2>
      <p className="text-text-muted text-sm mb-6">
        {asset
          ? 'Asset details locked from QR code scan.'
          : 'Submit a new IT service request.'}
      </p>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {asset ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Asset ID" value={asset.id} readOnly />
              <Input label="Asset Name" value={asset.name} readOnly />
              <Input label="Asset Location" value={asset.location} readOnly className="sm:col-span-2" />
            </div>
          ) : (
            <Input
              label="Title"
              id="title"
              placeholder="Brief description of the issue"
              error={errors.title?.message}
              {...register('title')}
            />
          )}
          <Textarea
            label={asset ? 'Issue Description' : 'Description'}
            id="description"
            placeholder="Detailed description of the issue"
            error={errors.description?.message}
            {...register('description')}
          />
          <div className={asset ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
            {!asset && (
              <Select
                label="Category"
                id="category"
                options={categories.map((c) => ({ value: c, label: formatTicketCategory(c) }))}
                error={errors.category?.message}
                {...register('category')}
              />
            )}
            <Select
              label="Priority"
              id="priority"
              options={priorities.map((p) => ({ value: p, label: formatTicketPriority(p) }))}
              error={errors.priority?.message}
              {...register('priority')}
            />
          </div>
          {!asset && (
            <Input
              label="Location"
              id="location"
              placeholder="Building, floor, room"
              error={errors.location?.message}
              {...register('location')}
            />
          )}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Photo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-primary/20 file:text-brand-primary cursor-pointer"
            />
            {photo && (
              <img src={photo} alt="Preview" className="mt-2 rounded-xl max-h-40 object-cover" />
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting}>
              Submit Ticket
            </Button>
            <Button variant="ghost" type="button" onClick={() => navigate('/tickets')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
