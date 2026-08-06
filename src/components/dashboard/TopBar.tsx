import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { notificationService } from '@/services/notificationService'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Badge } from '@/components/ui'
import { formatRole } from '@/utils/formatters'
import type { Notification } from '@/types'
import { formatDateTime } from '@/utils/formatters'
import { getNotificationPath } from '@/utils/notificationNavigation'
import { getNotificationTypeDotColor } from '@/utils/notificationIcons'
import { groupNotifications } from '@/utils/notificationGrouping'

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, role } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<{ id: number } | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const toastIdRef = useRef(0)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user) return

    const reloadNotifications = () => {
      notificationService.getByUserId(user.id).then(setNotifications)
    }

    reloadNotifications()
    window.addEventListener('notifications-changed', reloadNotifications)
    return () => {
      window.removeEventListener('notifications-changed', reloadNotifications)
    }
  }, [user])

  const dismissPopover = () => {
    window.clearTimeout(toastTimer.current)
    setToast(null)
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        dismissPopover()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current)
  }, [])

  const showAlreadyHereToast = () => {
    setToast({ id: ++toastIdRef.current })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2500)
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const groups = groupNotifications(notifications)

  const markRead = async (id: string) => {
    await notificationService.markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    )
  }

  const handleNotificationClick = (n: Notification) => {
    const destination = getNotificationPath(n).replace(/\/+$/, '')
    const current = location.pathname.replace(/\/+$/, '')

    if (current !== destination) {
      if (!n.isRead) {
        void markRead(n.id)
      }
      setOpen(false)
      navigate(destination)
      return
    }

    if (!n.isRead) {
      void markRead(n.id)
    }
    setOpen(false)
    showAlreadyHereToast()
  }

  return (
    <header className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-xl border-b border-white/6 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-text-primary cursor-pointer"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              Welcome, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-xs text-text-muted">IT Control Center</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {role && <Badge variant="role" value={formatRole(role)} />}

          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 rounded-xl hover:bg-surface-overlay transition-colors cursor-pointer text-text-secondary"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </motion.button>

          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen(!open)}
              className="relative p-2 rounded-xl hover:bg-surface-overlay transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-primary rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {toast && (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.98,
                    transition: { duration: 0.15, ease: 'easeIn' },
                  }}
                  transition={{ type: 'spring', stiffness: 600, damping: 32, mass: 1 }}
                  role="status"
                  className="absolute right-0 top-full mt-2 w-64 glass-card notification-popover-glow p-3.5 text-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-sm shadow-brand-primary/25">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold leading-snug tracking-[-0.01em] text-text-primary">
                        Already here
                      </p>
                      <p className="text-xs leading-relaxed text-text-muted mt-1">
                        You're already viewing this page.
                      </p>
                      <div className="mt-2 flex justify-end">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={dismissPopover}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              dismissPopover()
                            }
                          }}
                          className="cursor-pointer text-xs font-medium text-brand-primary underline-offset-4 transition duration-150 hover:opacity-85 hover:underline"
                        >
                          Dismiss
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {open && (
              <div className="absolute right-0 mt-2 w-80 glass-card shadow-card p-2 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-text-muted p-4 text-center">No notifications</p>
                ) : (
                  groups.map((group) => (
                    <div key={group.label}>
                      <p className="text-[11px] uppercase tracking-wider text-text-muted px-3 pt-2 pb-1">
                        {group.label}
                      </p>
                      {group.items.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`w-full text-left p-3 rounded-xl transition-colors cursor-pointer ${
                            n.isRead ? 'opacity-60' : 'bg-surface-overlay'
                          } hover:bg-surface-overlay-hover`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${getNotificationTypeDotColor(n)}`}
                              aria-hidden="true"
                            />
                            <div className="min-w-0">
                              <p
                                className={`text-sm text-text-primary ${
                                  n.isRead ? 'font-semibold' : 'font-bold'
                                }`}
                              >
                                {n.title}
                              </p>
                              <p className="text-xs text-text-muted mt-1 line-clamp-2">{n.message}</p>
                              <p className="text-[11px] text-text-muted mt-1.5">{formatDateTime(n.createdAt)}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
