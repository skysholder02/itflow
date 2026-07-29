import { pageTransition, pageTransitionConfig } from '@/animations/variants'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
  onAnimationComplete?: () => void
}

export function PageTransition({ children, className, onAnimationComplete }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransitionConfig}
      className={className}
      onAnimationComplete={onAnimationComplete}
    >
      {children}
    </motion.div>
  )
}