import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/cn'
import { sidebarSlide, sidebarSlideConfig } from '@/animations/variants'

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Tickets', path: '/tickets', icon: '🎫' },
  { label: 'Assets', path: '/assets', icon: '💻' },
  { label: 'QR Assets', path: '/qr-assets', icon: '📱' },
  { label: 'Profile', path: '/profile', icon: '👤' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const content = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/6">
        <Logo size="sm" layoutId="itflow-logo" />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all',
                isActive
                  ? 'bg-brand-primary/20 text-brand-primary font-medium'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5',
              )
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={sidebarSlideConfig}
        className="hidden lg:flex w-64 flex-shrink-0 bg-bg-secondary/60 border-r border-white/6 backdrop-blur-xl flex-col h-screen sticky top-0"
      >
        {content}
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              variants={sidebarSlide}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={sidebarSlideConfig}
              className="fixed top-0 left-0 w-64 h-full bg-bg-secondary z-50 lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
