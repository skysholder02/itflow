import { cn } from '@/utils/cn'
import { motion, type HTMLMotionProps } from 'framer-motion'

interface CardProps extends HTMLMotionProps<'div'> {
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

const paddings = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({
  className,
  hover = false,
  padding = 'md',
  children,
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      className={cn('glass-card shadow-card', paddings[padding], className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
