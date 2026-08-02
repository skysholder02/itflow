import { cn } from '@/utils/cn'
import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { FieldFeedback } from '@/components/ui/FieldFeedback'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, success, id = useId(), ...props }, ref) => {
    const feedbackId = useId()
    const hasFeedback = !!error || !!success
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          {...props}
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasFeedback ? feedbackId : undefined}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-muted outline-none transition-colors duration-300 focus:bg-white/10 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50',
            error && 'border-red-500/60 focus:border-red-500/60 focus:ring-red-500/50',
            !error && success && 'border-emerald-500/60 focus:border-emerald-500/60',
            className,
          )}
        />
        <FieldFeedback
          id={feedbackId}
          type={error ? 'error' : success ? 'success' : undefined}
          message={error ?? success}
        />
      </div>
    )
  },
)

Input.displayName = 'Input'