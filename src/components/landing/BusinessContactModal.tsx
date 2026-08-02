import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4"
        >
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              boxShadow: [
                '0 25px 80px rgba(0,0,0,0.10)',
                '0 28px 85px rgba(0,0,0,0.12)',
                '0 25px 80px rgba(0,0,0,0.10)',
              ],
            }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{
              opacity: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.05 },
              scale: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.05 },
              y: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.05 },
              boxShadow: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
            }}
            className="relative w-full max-w-md glass-card p-9 my-auto md:max-w-2xl lg:max-w-[960px]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-black/5 hover:rotate-90 transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-5 shadow-[0_0_20px_rgba(175,82,222,0.08)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
              Let's Build Your IT Workflow
            </h2>
            <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">
              Tell us about your company's IT needs.
              We'll help you choose the best solution for your workflow.
            </p>

            <ContactSalesForm onBack={onClose} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}