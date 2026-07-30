import { LoginForm } from '@/components/auth/LoginForm'
import { PageTransition } from '@/components/ui'

export function LoginPage() {
  return (
    <PageTransition className="light-theme">
      <LoginForm />
    </PageTransition>
  )
}
