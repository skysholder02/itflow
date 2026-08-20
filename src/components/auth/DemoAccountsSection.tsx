import { DEMO_ACCOUNTS } from '@/data/demoAccounts'

const demoRoleLabels: Record<string, string> = {
  karyawan: 'Employee',
  itsupport: 'IT Support',
  leaderit: 'Leader IT',
  vendor: 'Vendor',
}

interface DemoAccountsSectionProps {
  onSelect: (email: string, password: string) => void
}

export function DemoAccountsSection({ onSelect }: DemoAccountsSectionProps) {
  return (
    <div className="mt-6 border-t border-black/[0.06] pt-5">
      <p className="text-center text-sm text-slate-500">
        Want to explore first?{' '}
        <span className="font-medium text-slate-700">Try the demo.</span>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            onClick={() => onSelect(account.email, account.password)}
            className="cursor-pointer rounded-xl border border-black/[0.05] bg-white/40 py-2 text-[13px] font-medium text-slate-500 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 focus-visible:ring-offset-2 hover:border-black/[0.12] hover:bg-white hover:text-slate-900"
          >
            {demoRoleLabels[account.role] ?? account.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        Demo data is stored locally in your browser.
      </p>
    </div>
  )
}