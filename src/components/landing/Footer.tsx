import { Logo } from '@/components/ui'

export function Footer() {
  return (
    <footer className="border-t border-white/6 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" />
          <p className="text-text-muted text-sm">
            Satu Platform untuk Semua Layanan IT
          </p>
          <p className="text-text-muted text-xs">
            &copy; {new Date().getFullYear()} ITFlow. Hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  )
}
