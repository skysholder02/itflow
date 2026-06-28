import { cn } from '@/utils/cn'
import { AnimatePresence, motion } from 'framer-motion'
import { modalOverlay, modalScale, modalTransition } from '@/animations/variants' // ← tambah modalTransition
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            variants={modalOverlay}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={modalTransition}            // ← konsisten
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Kotak modal */}
          <motion.div
            variants={modalScale}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={modalTransition}            // ← ganti spring inline
            className={cn('relative w-full glass-card p-6 shadow-card', sizes[size])}
          >
            {title && (
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {title}
              </h2>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}