import { useNavigate } from 'react-router-dom'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PageTransition } from '@/components/ui'

export function RegisterPage() {
  const navigate = useNavigate()

  return (
    <PageTransition>
      <AuthLayout>
        <RegisterForm
          onSwitchToLogin={() => navigate('/login')}
          onSuccess={() => navigate('/login')}
        />
      </AuthLayout>
    </PageTransition>
  )
}