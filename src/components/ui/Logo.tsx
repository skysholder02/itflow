import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  layoutId?: string
  className?: string
}

const sizes = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
}

export function Logo({ size = 'md', layoutId, className }: LogoProps) {
  return (
    <motion.div layoutId={layoutId} className={cn('flex items-center gap-2', className)}>
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center">
        <span className="text-white font-bold text-sm">IF</span>
      </div>
      <span
        className={cn(
          'font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent',
          sizes[size],
        )}
      >
        ITFlow
      </span>
    </motion.div>
  )
}
