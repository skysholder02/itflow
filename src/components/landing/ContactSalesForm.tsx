import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Input, Select, Textarea } from '@/components/ui'
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
  fullName: z.string().min(2, 'Please enter your full name'),
  companyName: z.string().min(2, 'Please enter your company name'),
  businessEmail: z.string().email('Please enter a valid business email'),
  phoneNumber: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9+\-\s()]{7,20}$/.test(v), 'Please enter a valid phone number'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
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
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const closeTimer = useRef<number | undefined>(undefined)
  const toastIdRef = useRef(0)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { subject: '' },
  })

  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimer.current)
      window.clearTimeout(closeTimer.current)
    }
  }, [])

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ id: ++toastIdRef.current, type, message })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 4000)
  }

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      await contactSalesEmailService.sendEmail(buildContactSalesEmailParams(data))
      reset()
      showToast('success', 'Your inquiry was sent successfully. Our team will contact you shortly.')
      closeTimer.current = window.setTimeout(() => onClose(), 1400)
    } catch {
      showToast('error', 'Failed to send your inquiry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const onWhatsAppSubmit = (data: FormData) => {
    openContactSalesWhatsApp(data)
    reset()
    closeTimer.current = window.setTimeout(() => onClose(), 400)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="Your full name"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Company Name"
            placeholder="e.g. PT Solusi Utama"
            error={errors.companyName?.message}
            {...register('companyName')}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Business Email"
            type="email"
            placeholder="name@company.com"
            error={errors.businessEmail?.message}
            {...register('businessEmail')}
          />
          <Input
            label="Phone Number (optional)"
            type="tel"
            placeholder="e.g. 081234567890"
            error={errors.phoneNumber?.message}
            {...register('phoneNumber')}
          />
        </div>
        <Select
          label="Subject"
          options={subjectOptions}
          error={errors.subject?.message}
          {...register('subject')}
        />
        <Textarea
          label="Message"
          placeholder="Tell us about your IT needs..."
          error={errors.message?.message}
          {...register('message')}
        />

        <div className="space-y-2.5 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-primary text-white text-sm font-medium hover:bg-[#1a8aff] hover:shadow-[0_8px_30px_rgba(0,122,255,0.35)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              )}
              {submitting ? 'Sending...' : 'Send Email'}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(onWhatsAppSubmit)()}
              className="group w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/5 text-text-primary border border-white/10 text-sm font-medium hover:bg-green-500/5 hover:border-green-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 group-hover:text-green-600 transition-colors">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Continue to WhatsApp
            </button>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 text-sm text-text-muted hover:text-text-primary hover:scale-[1.01] transition-all cursor-pointer"
          >
            Back
          </button>
        </div>
      </form>
    </motion.div>
  )
}
