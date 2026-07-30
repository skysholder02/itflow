import { Logo } from '@/components/ui'

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-light)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Logo size="sm" />
            <p className="mt-4 text-sm text-text-muted leading-relaxed max-w-xs">
              One platform for all IT services — streamlining ticketing, asset tracking,
              and infrastructure management.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</a></li>
              <li><span className="text-sm text-text-secondary">Pricing</span></li>
              <li><span className="text-sm text-text-secondary">Documentation</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Company</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-text-secondary">About</span></li>
              <li><a href="#contact" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Contact</a></li>
              <li><span className="text-sm text-text-secondary">Privacy Policy</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[var(--color-border-light)] text-center">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} ITFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
