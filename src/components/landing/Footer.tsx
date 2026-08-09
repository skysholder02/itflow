import { Logo } from '@/components/ui'

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-light)] bg-bg-tertiary">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-12">
          <div>
            <Logo variant="horizontal" size="sm" width={150} forceLight />
            <p className="mt-5 text-sm text-text-muted leading-relaxed max-w-xs">
              Fix Your Problem.
              <br />
              Anytime. Anywhere.
            </p>
            <p className="mt-3 text-sm text-text-muted leading-relaxed max-w-xs">
              One platform for all IT services &mdash; streamlining ticketing,
              asset tracking, and infrastructure management.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-5">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-sm text-text-secondary hover:text-brand-primary transition-colors duration-150">
                  Features
                </a>
              </li>
              <li>
                <a href="#statistics" className="text-sm text-text-secondary hover:text-brand-primary transition-colors duration-150">
                  Statistics
                </a>
              </li>
              <li><span className="text-sm text-text-secondary">Pricing</span></li>
              <li><span className="text-sm text-text-secondary">Documentation</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-5">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#home" className="text-sm text-text-secondary hover:text-brand-primary transition-colors duration-150">
                  Home
                </a>
              </li>
              <li><span className="text-sm text-text-secondary">About</span></li>
              <li>
                <a href="#contact" className="text-sm text-text-secondary hover:text-brand-primary transition-colors duration-150">
                  Contact
                </a>
              </li>
              <li><span className="text-sm text-text-secondary">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-[var(--color-border-light)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} FIYRO. All rights reserved.
          </p>
          <p className="text-sm text-text-muted">Crafted for IT teams. Built to fix problems.</p>
        </div>
      </div>
    </footer>
  )
}