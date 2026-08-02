import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface FieldFeedbackProps {
  type?: 'error' | 'success'
  message?: string
  id?: string
}

export function FieldFeedback({ type, message, id }: FieldFeedbackProps) {
  return (
    <div className="flex items-center min-h-[1.25rem] text-xs" aria-live="polite">
      <AnimatePresence initial={false} mode="wait">
        {type && message ? (
          <motion.span
            key={id ?? `${type}-${message}`}
            id={id}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn(
              'flex items-center gap-1.5',
              type === 'error' ? 'text-red-400' : 'text-emerald-500',
            )}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              {type === 'error' ? (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" />
                </>
              ) : (
                <polyline points="20 6 9 17 4 12" />
              )}
            </svg>
            <span>{message}</span>
          </motion.span>
        ) : (
          <motion.span
            key="empty"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sr-only"
          />
        )}
      </AnimatePresence>
    </div>
  )
}