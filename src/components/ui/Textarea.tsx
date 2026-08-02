import { cn } from '@/utils/cn'
import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import { FieldFeedback } from '@/components/ui/FieldFeedback'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  success?: string
  counter?: number
  maxCount?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, success, counter, maxCount, id = useId(), ...props }, ref) => {
    const feedbackId = useId()
    const hasFeedback = !!error || !!success
    const ratio = maxCount && maxCount > 0 && counter !== undefined ? counter / maxCount : 0
    const counterColor =
      counter !== undefined && maxCount !== undefined && counter >= maxCount
        ? 'text-red-400'
        : ratio >= 0.9
          ? 'text-amber-500'
          : ratio >= 0.75
            ? 'text-amber-400/80'
            : 'text-text-muted'

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          {...props}
          ref={ref}
          id={id}
          maxLength={maxCount}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasFeedback ? feedbackId : undefined}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-muted outline-none transition-colors duration-300 focus:bg-white/10 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 resize-none min-h-[100px]',
            error && 'border-red-500/60 focus:border-red-500/60 focus:ring-red-500/50',
            !error && success && 'border-emerald-500/60 focus:border-emerald-500/60',
            className,
          )}
        />
        {counter !== undefined && maxCount !== undefined ? (
          <div className="flex items-center justify-between gap-3 min-h-[1.25rem]">
            <div className="min-w-0">
              <FieldFeedback
                id={feedbackId}
                type={error ? 'error' : success ? 'success' : undefined}
                message={error ?? success}
              />
            </div>
            <span className={cn('shrink-0 text-xs tabular-nums', counterColor)}>
              {counter} / {maxCount}
            </span>
          </div>
        ) : (
          <FieldFeedback
            id={feedbackId}
            type={error ? 'error' : success ? 'success' : undefined}
            message={error ?? success}
          />
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'