import { cn } from '@/utils/cn'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'premium'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-primary text-white hover:shadow-[0_8px_30px_rgba(99,102,241,0.35)]',
  secondary:
    'bg-white/5 text-text-primary border border-white/10 hover:bg-white/10',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
  premium:
    'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white cs-glow-indigo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-xl',
  md: 'px-5 h-11 text-sm rounded-2xl',
  lg: 'px-7 py-3.5 text-base rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const reducedMotion = useReducedMotion()
    const isDisabled = disabled || loading
    const hoverMotion =
      variant === 'premium' && !reducedMotion
        ? { y: -4, scale: 1.03, boxShadow: '0 12px 44px rgba(99, 102, 241, 0.5), 0 0 24px rgba(139, 92, 246, 0.35)' }
        : { scale: 1.03 }
    const tapMotion =
      variant === 'premium' && !reducedMotion
        ? { scale: 0.97, boxShadow: '0 6px 22px rgba(99, 102, 241, 0.4)' }
        : { scale: 0.98 }

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : hoverMotion}
        whileTap={isDisabled ? undefined : tapMotion}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-colors transform-gpu cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Loading...
          </>
        ) : (
          children
        )}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'
