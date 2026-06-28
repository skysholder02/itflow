import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Card, Badge } from '@/components/ui'
import { authService } from '@/services/authService'
import { useAuth } from '@/contexts/AuthContext'
import { formatRole } from '@/utils/formatters'

const schema = z.object({
  name: z.string().min(2, 'Nama harus terdiri dari minimal 2 karakter'),
})

type FormData = z.infer<typeof schema>

export function ProfilePage() {
  const { user, role, refreshUser } = useAuth()
  const [saved, setSaved] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '' },
  })

  const onSubmit = async (data: FormData) => {
    if (!user) return
    await authService.updateProfile(user.id, { name: data.name })
    await refreshUser()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!user) return null

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Profile</h2>

      <Card className="mb-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-text-primary">{user.name}</h3>
          <p className="text-text-muted text-sm">{user.email}</p>
          {role && <Badge variant="role" value={formatRole(role)} className="mt-2" />}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-muted">Departemen</span>
            <p className="text-text-primary">{user.department}</p>
          </div>
          <div>
            <span className="text-text-muted">ID User</span>
            <p className="text-text-primary font-mono">{user.id}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Edit Profil</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nama Tampilan"
            id="name"
            error={errors.name?.message}
            {...register('name')}
          />
          {saved && (
            <p className="text-sm text-green-400">Profil berhasil diperbarui!</p>
          )}
          <Button type="submit" loading={isSubmitting}>
            Simpan Perubahan
          </Button>
        </form>
      </Card>
    </div>
  )
}
