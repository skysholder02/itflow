import { DEMO_ACCOUNTS } from '@/data/demoAccounts'
import type { Role } from '@/types'

const demoRoleLabels: Record<Role, string> = {
  karyawan: 'Employee',
  itsupport: 'IT Support',
  leaderit: 'Leader IT',
  vendor: 'Vendor',
}

interface DemoAccountsViewProps {
  onSelect: (email: string, password: string) => void
  onBack: () => void
}

export function DemoAccountsView({ onSelect, onBack }: DemoAccountsViewProps) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-text-primary tracking-[-0.01em]">
          Demo Accounts
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          Choose an account to explore FIYRO
        </p>
      </div>

      <div className="space-y-2.5">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            onClick={() => onSelect(account.email, account.password)}
            className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-left transition-colors duration-200 cursor-pointer hover:border-brand-primary/40 hover:bg-brand-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium text-text-primary">
                {demoRoleLabels[account.role]}
              </span>
              <span className="block truncate text-xs text-text-muted">{account.email}</span>
            </span>
            <span className="shrink-0 rounded-full border border-black/[0.06] bg-black/[0.03] px-3 py-1 text-xs font-medium text-brand-primary transition-colors group-hover:border-brand-primary/30 group-hover:bg-brand-primary/10">
              Use account
            </span>
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-brand-primary hover:underline font-medium cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
        >
          ← Back to sign in
        </button>
      </div>
    </div>
  )
}
