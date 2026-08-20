import { CenteredAuthLayout } from '@/components/auth/CenteredAuthLayout'
import { AuthPanel } from '@/components/auth/AuthPanel'
import { PageTransition } from '@/components/ui'

export function LoginPage() {
  return (
    <PageTransition>
      <CenteredAuthLayout>
        <AuthPanel />
      </CenteredAuthLayout>
    </PageTransition>
  )
}