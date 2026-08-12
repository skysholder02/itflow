import { useEffect, useRef, useState } from 'react'
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

  const surfaceRef = useRef<HTMLDivElement>(null)
  const [shimmerDone, setShimmerDone] = useState(false)

  useEffect(() => {
    const el = surfaceRef.current
    if (!el) return
    const stopShimmer = (e: AnimationEvent) => {
      if (e.animationName === 'cs-shimmer-sweep') setShimmerDone(true)
    }
    el.addEventListener('animationiteration', stopShimmer)
    return () => el.removeEventListener('animationiteration', stopShimmer)
  }, [])

  return (
    <section ref={sectionRef} id="contact" className="relative py-28 overflow-hidden">
      {/* Ambient glow behind the surface */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="cs-orb cs-orb-soft left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[560px] w-[760px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">
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
          {/* Cinematic dark glass surface */}
          <div
            ref={surfaceRef}
            className={cn(
              'cs-surface cs-hairline rounded-[32px] px-6 py-16 md:py-20',
              !shimmerDone && 'cs-shimmer',
            )}
          >
            {/* Grid + ambient orbs */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="cs-grid" />
              <div className="cs-orb cs-orb-indigo -top-28 -left-28 h-96 w-96" />
              <div className="cs-orb cs-orb-violet -bottom-36 -right-24 h-[420px] w-[420px]" />
              <div className="cs-orb cs-orb-soft left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2" />
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

            <div className="relative">
              <p className="cs-pill">
                <span className="relative flex h-2 w-2">
                  {animate && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a855f7] opacity-75" />
                  )}
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#a855f7]" />
                </span>
                Ready When You Are
              </p>
              <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-tight cs-text-primary">
                Ready to Fix Your <span className="cs-text-gradient">IT Problems?</span>
              </h2>
              <p className="mt-6 mx-auto max-w-xl text-lg leading-relaxed cs-text-secondary">
                Tell us about your company&rsquo;s IT needs and we&rsquo;ll help
                you choose the right solution for your workflow.
              </p>
              <div className="mt-10 flex justify-center">
                <div className="relative inline-flex">
                  <div className="cs-beam" aria-hidden="true" />
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
        </motion.div>
      </div>

      <BusinessContactModal isOpen={showModal} onClose={onModalClose} />
    </section>
  )
}
