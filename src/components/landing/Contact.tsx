import type { CSSProperties } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui'
import { cn } from '@/utils/cn'
import { BusinessContactModal } from './BusinessContactModal'
import { useCtaSequence } from '@/hooks/useCtaSequence'

const embers = [
  { left: '10%', bottom: '16%', duration: '11s', delay: '0.5s', drift: '26px', tone: 'cs-ember' },
  { left: '26%', bottom: '24%', duration: '13s', delay: '2s', drift: '34px', tone: 'cs-ember-violet' },
  { left: '52%', bottom: '14%', duration: '10s', delay: '1s', drift: '-24px', tone: 'cs-ember-light' },
  { left: '68%', bottom: '26%', duration: '12s', delay: '3s', drift: '28px', tone: 'cs-ember' },
  { left: '84%', bottom: '18%', duration: '11.5s', delay: '1.5s', drift: '-30px', tone: 'cs-ember-violet' },
  { left: '40%', bottom: '30%', duration: '9.5s', delay: '2.5s', drift: '20px', tone: 'cs-ember' },
]

export function Contact() {
  const {
    sectionRef,
    highlightActive,
    showModal,
    onModalClose,
    openModal,
  } = useCtaSequence('scroll-to-contact')

  const reducedMotion = useReducedMotion()
  const animate = !reducedMotion

  return (
    <section
      ref={sectionRef}
      className="relative min-h-svh h-svh w-full overflow-hidden bg-[#09090b]"
    >
      {/* Cinematic background — masked grid, ambient purple/indigo glow, vignette.
          The glow layer breathes slowly (opacity only — no vertical movement). */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0">
          <div className="cs-grid" />
        </div>
        <motion.div
          animate={animate ? { opacity: [0.7, 1, 0.7] } : undefined}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <div className="cs-orb cs-orb-indigo -top-32 -left-32 h-[520px] w-[520px]" />
          <div className="cs-orb cs-orb-violet -bottom-40 -right-32 h-[560px] w-[560px]" />
          <div className="cs-orb cs-orb-soft left-1/2 top-1/2 h-[720px] w-[900px] -translate-x-1/2 -translate-y-1/2" />
        </motion.div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.6) 100%)',
          }}
        />
      </div>

      {/* Embers */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {embers.map((e, i) => (
          <span
            key={i}
            className={cn('cs-ember', e.tone)}
            style={
              {
                left: e.left,
                bottom: e.bottom,
                '--cs-ember-duration': e.duration,
                '--cs-ember-delay': e.delay,
                '--cs-ember-x': e.drift,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* Centered content — one locked, fully-composed composition. Nothing here
          moves on scroll: the white curtain in front of the scene is the only
          moving layer, so the badge, heading, description and CTA are revealed
          already in their final position. */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-6">
        <div className="w-full max-w-3xl text-center">
          <p className="cs-pill">
            <span className="relative flex h-2 w-2">
              {animate && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a855f7] opacity-75" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#a855f7]" />
            </span>
            Ready When You Are
          </p>

          <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-tight cs-text-primary cs-heading-shine">
            Ready to Fix Your <span className="cs-text-gradient">IT Problems?</span>
          </h2>

          <p className="mt-6 mx-auto max-w-xl text-lg leading-relaxed cs-text-secondary">
            Tell us about your company&rsquo;s IT needs and we&rsquo;ll help
            you choose the right solution for your workflow.
          </p>

          <div className="mt-10 flex justify-center">
            <div className="relative inline-flex group">
              <div
                className="cs-beam opacity-70 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
                aria-hidden="true"
              />
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
              <Button size="lg" variant="premium" onClick={openModal}>
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BusinessContactModal isOpen={showModal} onClose={onModalClose} />
    </section>
  )
}