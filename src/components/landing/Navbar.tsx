import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Logo, Button } from '@/components/ui'
import { cn } from '@/utils/cn'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Statistics', href: '#statistics' },
  { label: 'Contact', href: '#contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const animate = !reducedMotion

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.nav
      initial={animate ? { y: -20, opacity: 0 } : false}
      animate={animate ? { y: 0, opacity: 1 } : undefined}
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled ? 'glass-card border-0 border-b border-[var(--color-border-light)] py-2' : 'py-2.5',
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <button onClick={() => scrollTo('#home')} className="cursor-pointer">
          <Logo variant="horizontal" size="md" width={100} forceLight />
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button size="sm" onClick={() => navigate('/login')}>
            Get Started
          </Button>
        </div>

        <button
          className="md:hidden text-text-primary cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          id="mobile-navigation"
          initial={animate ? { opacity: 0, y: -10 } : false}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          className="md:hidden glass-card mx-4 mt-2 p-4 space-y-3"
        >
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="block w-full text-left text-text-secondary hover:text-text-primary py-2 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <Link to="/login" className="block">
            <Button className="w-full">Login</Button>
          </Link>
        </motion.div>
      )}
    </motion.nav>
  )
}
