import { useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ContactSalesForm } from './ContactSalesForm'

interface BusinessContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BusinessContactModal({ isOpen, onClose }: BusinessContactModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  const reducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overflow-x-hidden p-4"
        >
          {/* Overlay */}
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, backdropFilter: 'blur(6px)' }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/60"
            onClick={onClose}
          />

          {/* Panel wrapper + ambient halo */}
          <motion.div className="relative my-auto w-full max-w-xl md:max-w-2xl">
            <div className="absolute -inset-6 pointer-events-none" aria-hidden="true">
              <div className="cs-orb cs-orb-indigo -top-16 -left-16 h-72 w-72" />
              <div className="cs-orb cs-orb-violet -bottom-20 -right-16 h-80 w-80" />
            </div>

            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
              transition={
                reducedMotion
                  ? { duration: 0.25, ease: 'easeOut' }
                  : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
              }
              className="relative w-full cs-surface cs-hairline rounded-[28px] p-9"
            >
              {/* Atmospheric decorations */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="cs-grid" />
                <div className="cs-orb cs-orb-soft left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2" />
                <div className="cs-orb cs-orb-indigo -top-24 -right-24 h-64 w-64" />
                <div className="cs-orb cs-orb-violet -bottom-28 -left-24 h-72 w-72" />
              </div>

              {/* Subtle one-time top-edge shimmer */}
              {!reducedMotion && (
                <motion.div
                  initial={{ x: '-120%' }}
                  animate={{ x: '320%' }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  className="absolute top-0 left-0 h-px w-2/5 pointer-events-none"
                  aria-hidden="true"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.6), transparent)',
                  }}
                />
              )}

              {/* Close */}
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/15 cs-text-muted hover:text-white hover:bg-white/[0.12] hover:shadow-[0_0_18px_rgba(139,92,246,0.35)] hover:rotate-90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12] motion-reduce:transition-none motion-reduce:hover:rotate-0 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Content */}
              <div className="relative">
                <div className="relative mb-5 inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-[0_8px_24px_rgba(99,102,241,0.4)]">
                  <span
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    aria-hidden="true"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.22), transparent)',
                    }}
                  />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="relative">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight cs-text-primary">
                  Let's Build Your IT <span className="cs-text-gradient">Workflow</span>
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed cs-text-secondary">
                  Tell us about your company's IT needs.
                  We'll help you choose the best solution for your workflow.
                </p>

                <ContactSalesForm onBack={onClose} onClose={onClose} />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
