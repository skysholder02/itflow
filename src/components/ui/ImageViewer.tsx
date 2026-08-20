import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { modalOverlay, modalScale, modalTransition } from '@/animations/variants'

interface ImageViewerProps {
  open: boolean
  onClose: () => void
  src: string
  alt: string
}

// Full-size image lightbox. Displays an image as large as the viewport allows,
// preserving its aspect ratio. Closes via the close button, clicking the
// backdrop, or pressing Escape.
export function ImageViewer({
  open,
  onClose,
  src,
  alt,
}: ImageViewerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      // Keep focus contained while the viewer is open (only close button is focusable).
      if (event.key === 'Tab') {
        event.preventDefault()
        closeButtonRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocusedRef.current?.focus()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Full view: ${alt}`}
        >
          {/* Backdrop */}
          <motion.div
            variants={modalOverlay}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={modalTransition}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Close button */}
          <motion.button
            variants={modalScale}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={modalTransition}
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close image"
            className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 border border-white/20 text-white transition-colors hover:bg-black/80 cursor-pointer"
          >
            <X size={20} />
          </motion.button>

          {/* Image */}
          <motion.div
            variants={modalScale}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={modalTransition}
            className="relative z-10 max-w-[92vw] max-h-[92vh]"
          >
            <img
              src={src}
              alt={alt}
              className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-contain rounded-xl shadow-2xl select-none"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}