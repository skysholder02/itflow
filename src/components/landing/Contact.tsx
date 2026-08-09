import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui'
import { BusinessContactModal } from './BusinessContactModal'
import { useCtaSequence } from '@/hooks/useCtaSequence'

export function Contact() {
  const {
    sectionRef,
    isActive,
    isInView,
    highlightActive,
    showModal,
    onModalClose,
    openModal,
    trigger,
  } = useCtaSequence('scroll-to-contact')

  const reducedMotion = useReducedMotion()
  const animate = !reducedMotion

  return (
    <section ref={sectionRef} id="contact" className="relative py-28 overflow-hidden">
      {/* Layered background — subtly more expressive than the sections above */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage:
              'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />
        <div
          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[520px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08), transparent 62%)',
          }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          key={isActive ? trigger : undefined}
          initial={
            !animate
              ? false
              : isActive
                ? { opacity: 0, y: 20, scale: 0.98 }
                : { opacity: 0, y: 24 }
          }
          animate={
            !animate
              ? undefined
              : isInView
                ? { opacity: 1, y: 0, scale: isActive ? 1 : undefined }
                : {}
          }
          transition={
            isActive
              ? { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
              : { duration: 0.6, ease: [0.25, 1, 0.5, 1] }
          }
        >
          {/* Premium CTA surface */}
          <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border-light)] bg-bg-secondary/40 backdrop-blur-sm px-6 py-16 md:py-20 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.07), transparent 60%)',
              }}
            />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
                Ready When You Are
              </p>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-text-primary leading-tight">
                Ready to Fix Your IT Problems?
              </h2>
              <p className="mt-6 text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
                Tell us about your company&rsquo;s IT needs and we&rsquo;ll help
                you choose the right solution for your workflow.
              </p>
              <div className="mt-10 flex justify-center">
                <div className="relative inline-flex">
                  {animate && highlightActive && (
                    <motion.div
                      animate={{
                        opacity: [0, 0.25, 0.2, 0],
                        scale: [1, 1.08, 1.15, 1.22],
                      }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -inset-6 rounded-[32px] pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.30) 0%, transparent 70%)',
                        filter: 'blur(18px)',
                      }}
                    />
                  )}
                  <Button size="lg" onClick={openModal}>
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <BusinessContactModal isOpen={showModal} onClose={onModalClose} />
    </section>
  )
}