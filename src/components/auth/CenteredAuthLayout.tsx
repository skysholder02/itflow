import { Logo } from '@/components/ui'
import type { ReactNode } from 'react'

interface CenteredAuthLayoutProps {
  children: ReactNode
}

export function CenteredAuthLayout({ children }: CenteredAuthLayoutProps) {
  return (
    <div className="light-theme min-h-dvh overflow-y-auto bg-[#f5f5f7]">
      <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="w-full max-w-[420px]">
          <div className="flex justify-center mb-7 sm:mb-9">
            <Logo variant="vertical" size="lg" width={120} forceDark />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
