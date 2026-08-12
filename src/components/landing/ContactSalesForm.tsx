import { useEffect, useRef, useState } from 'react'
import { useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Input, Select, Textarea } from '@/components/ui'
import { cn } from '@/utils/cn'
import {
  buildContactSalesEmailParams,
  contactSalesEmailService,
  openContactSalesWhatsApp,
} from '@/services/contactSalesService'

interface ContactSalesFormProps {
  onBack: () => void
  onClose: () => void
}

const schema = z.object({
  fullName: z
    .string()
    .transform((v) => v.trim().replace(/\s{2,}/g, ' '))
    .pipe(
      z
        .string()
        .min(3, 'Full name must be at least 3 characters')
        .max(100, 'Full name must be 100 characters or fewer')
        .refine((v) => /^[A-Za-z' .-]+$/.test(v), 'Full name may only contain letters, spaces, apostrophes, periods, and hyphens'),
    ),
  companyName: z
    .string()
    .transform((v) => v.trim().replace(/\s{2,}/g, ' '))
    .pipe(
      z
        .string()
        .min(5, 'Company name must be at least 5 characters')
        .max(150, 'Company name must be 150 characters or fewer')
        .refine((v) => /^[A-Za-z0-9 .&-]+$/.test(v), 'Company name may only contain letters, numbers, spaces, periods, ampersands, and hyphens')
        .refine((v) => /^PT\.?/i.test(v), 'Company name must begin with "PT" or "PT."'),
    ),
  businessEmail: z
    .string()
    .transform((v) => v.trim().toLowerCase())
    .pipe(z.string().min(1, 'Please enter a business email').email('Please enter a valid business email')),
  phoneNumber: z
    .string()
    .transform((v) => v.replace(/[\s()-]/g, ''))
    .refine((v) => v.length > 0, 'Please enter a phone number')
    .refine((v) => /^[0-9]{10,15}$/.test(v), 'Please enter a valid 10–15 digit phone number'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .min(10, 'Message must be at least 10 characters')
        .max(1000, 'Message must be 1000 characters or fewer'),
    ),
})

type FormData = z.infer<typeof schema>

const subjectOptions = [
  { value: '', label: 'Select a subject' },
  { value: 'IT Consultation', label: 'IT Consultation' },
  { value: 'Custom Development', label: 'Custom Development' },
  { value: 'Infrastructure Deployment', label: 'Infrastructure Deployment' },
  { value: 'Other', label: 'Other' },
]

type Toast = { id: number; type: 'success' | 'error'; message: string }

export function ContactSalesForm({ onBack, onClose }: ContactSalesFormProps) {
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [toast, setToast] = useState<Toast | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const closeTimer = useRef<number | undefined>(undefined)
  const sentTimer = useRef<number | undefined>(undefined)
  const toastIdRef = useRef(0)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { subject: '' },
  })

  const values = watch()

  const reducedMotion = useReducedMotion()

  type FieldName = keyof FormData
  const feedback = (name: FieldName): { error?: string; success?: string } => {
    const message = errors[name]?.message
    const raw = values[name]
    const filled = typeof raw === 'string' && raw.trim().length > 0
    if (message) return { error: message }
    if (filled) return { success: 'Looks good' }
    return {}
  }

  const fieldClass = (name: FieldName) => {
    const f = feedback(name)
    return cn(
      'cs-field bg-white/[0.06]! text-white! placeholder:text-white/40! [color-scheme:dark]!',
      f.error
        ? 'border-red-500/60! focus:border-red-500/60!'
        : f.success
          ? 'border-emerald-500/60! focus:border-emerald-500/60!'
          : 'border-white/15! focus:border-[#8b5cf6]/80!',
    )
  }

  const normalizePasteValue = (name: FieldName, value: string): string => {
    switch (name) {
      case 'businessEmail':
        return value.trim().toLowerCase()
      case 'phoneNumber':
        return value.replace(/[\s()-]/g, '')
      case 'companyName':
      case 'fullName':
        return value.trim().replace(/\s{2,}/g, ' ')
      default:
        return value
    }
  }

  const handlePaste = (name: FieldName) => (e: React.ClipboardEvent) => {
    const field = e.currentTarget as HTMLInputElement | HTMLTextAreaElement
    const start = field.selectionStart ?? field.value.length
    const end = field.selectionEnd ?? field.value.length
    const pasted = e.clipboardData.getData('text')
    e.preventDefault()
    const next = field.value.slice(0, start) + normalizePasteValue(name, pasted) + field.value.slice(end)
    setValue(name, next, { shouldValidate: true, shouldDirty: true })
  }

  const formIsValid = schema.safeParse(values).success

  const focusFirstInvalid = (invalid: FieldErrors<FormData>) => {
    const first = (Object.keys(invalid)[0] ?? '') as FieldName | ''
    if (!first) return
    const el = document.querySelector<HTMLElement>(`[name="${first}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      window.setTimeout(() => el.focus({ preventScroll: true }), 300)
    }
  }

  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimer.current)
      window.clearTimeout(closeTimer.current)
      window.clearTimeout(sentTimer.current)
    }
  }, [])

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ id: ++toastIdRef.current, type, message })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 4000)
  }

  const onSubmit = async (data: FormData) => {
    setSendStatus('sending')
    try {
      await contactSalesEmailService.sendEmail(buildContactSalesEmailParams(data))
      setSendStatus('sent')
      sentTimer.current = window.setTimeout(() => {
        reset()
        showToast('success', 'Your inquiry was sent successfully. Our team will contact you shortly.')
        closeTimer.current = window.setTimeout(() => onClose(), 1400)
      }, 800)
    } catch {
      setSendStatus('idle')
      showToast('error', 'Failed to send your inquiry. Please try again.')
    }
  }

  const sending = sendStatus !== 'idle'

  const onWhatsAppSubmit = (data: FormData) => {
    if (sending) return
    openContactSalesWhatsApp(data)
    reset()
    closeTimer.current = window.setTimeout(() => onClose(), 400)
  }

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mt-6"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`mb-4 flex items-start gap-2.5 px-4 py-3 rounded-2xl border text-sm ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              {toast.type === 'success' ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <path d="M12 8v4m0 4h.01" />
              )}
            </svg>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit, focusFirstInvalid)} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
          <Input
            label="Full Name"
            placeholder="Your full name"
            error={feedback('fullName').error}
            success={feedback('fullName').success}
            className={fieldClass('fullName')}
            {...register('fullName')}
          />
          <Input
            label="Company Name"
            placeholder="e.g. PT Solusi Utama"
            error={feedback('companyName').error}
            success={feedback('companyName').success}
            className={fieldClass('companyName')}
            onPaste={handlePaste('companyName')}
            {...register('companyName')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
          <Input
            label="Business Email"
            type="email"
            placeholder="name@company.com"
            error={feedback('businessEmail').error}
            success={feedback('businessEmail').success}
            className={fieldClass('businessEmail')}
            onPaste={handlePaste('businessEmail')}
            {...register('businessEmail')}
          />
          <Input
            label="Phone Number (optional)"
            type="tel"
            placeholder="e.g. 081234567890"
            error={feedback('phoneNumber').error}
            success={feedback('phoneNumber').success}
            className={fieldClass('phoneNumber')}
            onPaste={handlePaste('phoneNumber')}
            {...register('phoneNumber')}
          />
        </div>
        <Select
          label="Subject"
          options={subjectOptions}
          error={feedback('subject').error}
          success={feedback('subject').success}
          className={fieldClass('subject')}
          {...register('subject')}
        />
        <Textarea
          label="Message"
          placeholder="Tell us about your IT needs..."
          error={feedback('message').error}
          success={feedback('message').success}
          className={fieldClass('message')}
          counter={typeof values.message === 'string' ? values.message.replace(/\r\n/g, '\n').length : 0}
          maxCount={1000}
          {...register('message')}
        />

        <div className="space-y-2.5 pt-3">
          {formIsValid ? (
            <p className="flex items-center justify-center gap-1.5 text-xs text-emerald-500/90" role="status" aria-live="polite">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Ready to send
            </p>
          ) : (
            <p className="text-center text-xs cs-text-muted">Complete the form to continue.</p>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-3">
            <button
              type="submit"
              disabled={sending || !formIsValid}
              title={formIsValid ? undefined : 'Complete the form to continue'}
              className="w-full min-w-[170px] flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white text-sm font-medium cs-glow-indigo hover:shadow-[0_12px_44px_rgba(99,102,241,0.5),0_0_24px_rgba(139,92,246,0.35)] hover:-translate-y-0.5 active:scale-[0.97] transition-all disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]"
            >
              <span className="inline-flex justify-center items-center w-[18px] h-[18px] shrink-0">
                {sendStatus === 'sending' ? (
                  <Loader2 className="w-[18px] h-[18px] animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    {sendStatus === 'sent' ? (
                      <polyline points="20 6 9 17 4 12" />
                    ) : (
                      <>
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </>
                    )}
                  </svg>
                )}
              </span>
              {sendStatus === 'sending' ? 'Sending...' : sendStatus === 'sent' ? 'Sent!' : 'Send Email'}
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={() => handleSubmit(onWhatsAppSubmit, focusFirstInvalid)()}
              className="group w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.06] text-white border border-white/15 text-sm font-medium hover:bg-green-500/10 hover:border-green-500/30 hover:-translate-y-0.5 active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 group-hover:text-green-400 transition-colors">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Continue to WhatsApp
            </button>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 text-sm cs-text-muted hover:text-white hover:scale-[1.01] transition-all cursor-pointer"
          >
            Back
          </button>
        </div>
      </form>
    </motion.div>
  )
}
