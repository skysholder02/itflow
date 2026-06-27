import { useNavigate } from 'react-router-dom'
import { Button, GlowBackground } from '@/components/ui'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <GlowBackground />
      <div className="text-center relative z-10">
        <h1 className="text-8xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-text-muted mt-4 mb-8">Page not found</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    </div>
  )
}
