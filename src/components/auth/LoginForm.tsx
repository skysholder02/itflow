import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Button, Input, Card, Logo, GlowBackground } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useTransition } from '@/contexts/TransitionContext'
import { DEMO_ACCOUNTS } from '@/data/demoAccounts'
import { fadeUp, fadeUpTransition } from '@/animations/variants'

const schema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Kata Sandi wajib diisi'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const { login } = useAuth()
  const { startTransition } = useTransition()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      setError('')
      await login(data.email, data.password)
      startTransition()
    } catch {
      setError('Email atau kata sandi salah')
    }
  }

  const fillDemo = (email: string, password: string) => {
    setValue('email', email)
    setValue('password', password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6">
      <GlowBackground />
<motion.div
  variants={fadeUp}
  initial="initial"
  animate="animate"
  transition={fadeUpTransition}
  className="w-full max-w-md relative z-10"
>
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center" />
          <p className="text-text-muted mt-4">Masuk ke akun Anda</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                id="email"
                type="email"
                placeholder="email@perusahaan.com"
                error={errors.email?.message}
                {...register('email')}
              />
            <Input
              label="Kata Sandi"
              id="password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}
            <Button type="submit" loading={isSubmitting} className="w-full">
              Login
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/6">
            <p className="text-xs text-text-muted text-center mb-3">Akun Demo</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account.email, account.password)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm cursor-pointer"
                >
                  <span className="text-text-primary font-medium">{account.label}</span>
                  <span className="text-text-muted ml-2">{account.email}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
