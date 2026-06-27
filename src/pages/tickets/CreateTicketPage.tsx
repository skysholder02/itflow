import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Textarea, Select, Card } from '@/components/ui'
import { ticketService } from '@/services/ticketService'
import { useAuth } from '@/contexts/AuthContext'
import type { TicketCategory, TicketPriority } from '@/types'

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['Printer', 'WiFi', 'PC', 'CCTV', 'Speaker', 'Other']),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
  location: z.string().min(2, 'Location is required'),
})

type FormData = z.infer<typeof schema>

const categories: TicketCategory[] = ['Printer', 'WiFi', 'PC', 'CCTV', 'Speaker', 'Other']
const priorities: TicketPriority[] = ['Critical', 'High', 'Medium', 'Low']

export function CreateTicketPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [photo, setPhoto] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'PC', priority: 'Medium' },
  })

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: FormData) => {
    if (!user) return
    const ticket = await ticketService.createTicket({
      ...data,
      photo,
      reporterId: user.id,
      reporterName: user.name,
    })
    navigate(`/tickets/${ticket.id}`)
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Create Ticket</h2>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Title"
            id="title"
            placeholder="Brief description of the issue"
            error={errors.title?.message}
            {...register('title')}
          />
          <Textarea
            label="Description"
            id="description"
            placeholder="Detailed description of the problem"
            error={errors.description?.message}
            {...register('description')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              id="category"
              options={categories.map((c) => ({ value: c, label: c }))}
              error={errors.category?.message}
              {...register('category')}
            />
            <Select
              label="Priority"
              id="priority"
              options={priorities.map((p) => ({ value: p, label: p }))}
              error={errors.priority?.message}
              {...register('priority')}
            />
          </div>
          <Input
            label="Location"
            id="location"
            placeholder="Building, floor, room"
            error={errors.location?.message}
            {...register('location')}
          />
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
