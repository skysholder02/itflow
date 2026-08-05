import { cn } from '@/utils/cn'
import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { FieldFeedback } from '@/components/ui/FieldFeedback'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  success?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, success, id = useId(), options, ...props }, ref) => {
    const feedbackId = useId()
    const hasFeedback = !!error || !!success
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <select
          {...props}
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasFeedback ? feedbackId : undefined}
          className={cn(
            'w-full px-4 h-11 text-sm rounded-xl bg-white/5 border border-white/10 text-text-primary outline-none transition-colors duration-300 focus:bg-white/10 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 appearance-none cursor-pointer',
            error && 'border-red-500/60 focus:border-red-500/60 focus:ring-red-500/50',
            !error && success && 'border-emerald-500/60 focus:border-emerald-500/60',
            className,
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-bg-tertiary">
              {opt.label}
            </option>
          ))}
        </select>
        <FieldFeedback
          id={feedbackId}
          type={error ? 'error' : success ? 'success' : undefined}
          message={error ?? success}
          reserveSpace={!!label}
        />
      </div>
    )
  },
)

Select.displayName = 'Select'