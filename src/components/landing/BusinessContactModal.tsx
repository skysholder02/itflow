import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BusinessContactModalProps {
  isOpen: boolean
  onClose: () => void
}

const mailBody = [
  'Hello ITFlow Team,',
  '',
  'Company Name:',
  '',
  'Industry:',
  '',
  'I would like to know more about ITFlow.',
  '',
  'Please contact us.',
  '',
  'Thank you.',
].join('\n')

const waMessage = [
  'Hello ITFlow Team,',
  '',
  'I am interested in learning more about ITFlow for my company. Could you please contact us?',
  '',
  'Thank you.',
].join('\n')

const mailtoHref = `mailto:?subject=${encodeURIComponent('ITFlow Business Inquiry')}&body=${encodeURIComponent(mailBody)}`
const waHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`

const staggerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/40"
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
            className="relative w-full max-w-md glass-card p-9"
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

            <motion.div
              variants={staggerVariants}
              initial="hidden"
              animate="visible"
              className="mt-6 space-y-3"
            >
              {['IT Consultation', 'Custom Development', 'Infrastructure Deployment'].map((item) => (
                <motion.div
                  key={item}
                  variants={itemVariants}
                  transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                  className="flex items-center gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-brand-accent">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="text-sm text-text-primary">{item}</span>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-10 space-y-2.5">
              <a
                href={mailtoHref}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-brand-primary text-white text-sm font-medium hover:bg-[#1a8aff] hover:shadow-[0_8px_30px_rgba(0,122,255,0.35)] hover:-translate-y-0.5 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Contact Sales
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-white/5 text-text-primary border border-white/10 text-sm font-medium hover:bg-green-500/5 hover:border-green-500/20 hover:-translate-y-0.5 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 group-hover:text-green-600 transition-colors">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                WhatsApp
              </a>
              <button
                onClick={onClose}
                className="w-full py-3 text-sm text-text-muted hover:text-text-primary hover:scale-[1.01] transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
