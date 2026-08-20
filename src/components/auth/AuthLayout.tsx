import { AuthShowcase } from './AuthShowcase'
import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="light-theme flex h-dvh overflow-hidden bg-[#f5f5f7] p-3 sm:p-6 lg:p-8">
      <div className="mx-auto grid h-full min-h-0 w-full max-w-[1560px] overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#f5f5f7] shadow-[0_24px_70px_rgba(15,23,42,0.10),0_1px_3px_rgba(15,23,42,0.06)] md:grid-cols-[0.8fr_1fr] lg:grid-cols-[1.05fr_1fr]">
        <aside className="relative hidden h-full min-h-0 overflow-hidden border-r border-black/[0.06] bg-[#f0f2f8] md:block">
          <AuthShowcase />
        </aside>

        <main className="flex min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="m-auto w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  )
}
